import { supabaseAdmin } from "@/lib/supabase/admin";
import { verifySwapToken } from "./swapToken";
import { resend } from "@/server/notifications/resend";
import { telegram } from "@/server/notifications/telegram";
import { swapFinalizedEmail } from "@/server/notifications/templates";

/**
 * Central swap service.
 *
 * All accept/reject/cancel operations go through here, ensuring consistent
 * state transitions, validation, and notifications regardless of the entry
 * point (Dashboard, Telegram inline button, Magic Link).
 *
 * State machine:
 *   pending → accepted_by_target → finalized (via DB function)
 *   pending → rejected
 *   pending → cancelled (by requester)
 *   pending → expired (auto, after 72h)
 */

/**
 * Where the accept/reject originated. Currently used by `swapService` only
 * for future audit logging — the swap state transition itself is identical
 * regardless of channel.
 */
export type SwapEntryPoint = "dashboard" | "telegram" | "magic_link";

export async function assertTelegramSwapIntent(
  swapId: string,
  tokenPrefix: string,
  telegramChatId: string | number | undefined,
  telegramUserId: number | undefined,
): Promise<void> {
  if (!telegramChatId || !telegramUserId || !tokenPrefix) {
    throw new Error("Telegram callback unvollständig");
  }

  const admin = supabaseAdmin();
  if (!admin) throw new Error("Supabase admin client not available");

  const { data: swap, error } = await admin
    .from("shift_swaps")
    .select("id, status, target_user_id, accept_token_prefix")
    .eq("id", swapId)
    .maybeSingle();

  const typedSwap = swap as
    | {
        id: string;
        status: string;
        target_user_id: string;
        accept_token_prefix: string | null;
      }
    | null;

  if (error || !typedSwap || typedSwap.status !== "pending") {
    throw new Error("Swap nicht gefunden oder bereits verarbeitet");
  }

  if (typedSwap.accept_token_prefix !== tokenPrefix) {
    throw new Error("Telegram Token passt nicht zur Anfrage");
  }

  const { data: roleRow } = await admin
    .from("user_roles")
    .select("telegram_chat_id")
    .eq("user_id", typedSwap.target_user_id)
    .maybeSingle();

  const targetChatId = (roleRow as { telegram_chat_id?: string | null } | null)
    ?.telegram_chat_id;
  if (targetChatId !== String(telegramChatId)) {
    throw new Error("Telegram-Konto ist nicht mit dem Ziel-Mitglied verknüpft");
  }
}

export async function acceptSwap(
  swapId: string,
  _by: SwapEntryPoint,
): Promise<void> {
  const admin = supabaseAdmin();
  if (!admin) throw new Error("Supabase admin client not available");

  // Fetch the swap
  const { data: swap, error: fetchErr } = await admin
    .from("shift_swaps")
    .select("*")
    .eq("id", swapId)
    .single();

  if (fetchErr || !swap) {
    throw new Error("Swap not found");
  }

  if (swap.status !== "pending") {
    throw new Error(`Swap status is ${swap.status}, expected pending`);
  }

  // Check expiry
  if (new Date(swap.expires_at) < new Date()) {
    await admin
      .from("shift_swaps")
      .update({ status: "expired" })
      .eq("id", swapId);
    throw new Error("Swap has expired");
  }

  // Update to accepted_by_target
  const { error: updateErr } = await admin
    .from("shift_swaps")
    .update({
      status: "accepted_by_target",
      accepted_by_target_at: new Date().toISOString(),
    })
    .eq("id", swapId);

  if (updateErr) throw updateErr;

  // Finalize via DB function (atomic swap)
  const { error: finalizeErr } = await admin.rpc("finalize_swap", {
    swap_id: swapId,
  });

  if (finalizeErr) throw finalizeErr;

  // Send notifications
  await sendFinalizedNotifications(swapId);
}

export async function rejectSwap(
  swapId: string,
  _by: SwapEntryPoint,
): Promise<void> {
  const admin = supabaseAdmin();
  if (!admin) throw new Error("Supabase admin client not available");

  const { data: swap } = await admin
    .from("shift_swaps")
    .select("*")
    .eq("id", swapId)
    .single();

  if (!swap || swap.status !== "pending") {
    throw new Error("Swap not found or already processed");
  }

  const { error } = await admin
    .from("shift_swaps")
    .update({ status: "rejected" })
    .eq("id", swapId);

  if (error) throw error;

  // Notify requester
  await sendRejectedNotification(swapId);
}

export async function cancelSwap(swapId: string): Promise<void> {
  const admin = supabaseAdmin();
  if (!admin) throw new Error("Supabase admin client not available");

  const { error } = await admin
    .from("shift_swaps")
    .update({ status: "cancelled" })
    .eq("id", swapId)
    .eq("status", "pending");

  if (error) throw error;
}

export async function acceptSwapByToken(token: string): Promise<void> {
  const admin = supabaseAdmin();
  if (!admin) throw new Error("Supabase admin client not available");

  // Find swap by token hash
  const { data: swaps } = await admin
    .from("shift_swaps")
    .select("id, accept_token_hash, status, expires_at")
    .eq("status", "pending");

  const swap = swaps?.find((s) =>
    s.accept_token_hash && verifySwapToken(token, s.accept_token_hash)
  );

  if (!swap) {
    throw new Error("Invalid or expired token");
  }

  await acceptSwap(swap.id, "magic_link");
}

export async function rejectSwapByToken(token: string): Promise<void> {
  const admin = supabaseAdmin();
  if (!admin) throw new Error("Supabase admin client not available");

  const { data: swaps } = await admin
    .from("shift_swaps")
    .select("id, accept_token_hash, status")
    .eq("status", "pending");

  const swap = swaps?.find((s) =>
    s.accept_token_hash && verifySwapToken(token, s.accept_token_hash)
  );

  if (!swap) {
    throw new Error("Invalid or expired token");
  }

  await rejectSwap(swap.id, "magic_link");
}

export async function expireOldSwaps(): Promise<number> {
  const admin = supabaseAdmin();
  if (!admin) return 0;

  const { data, error } = await admin
    .from("shift_swaps")
    .update({ status: "expired" })
    .eq("status", "pending")
    .lt("expires_at", new Date().toISOString())
    .select("id");

  if (error) {
    console.error("[expireOldSwaps]", error);
    return 0;
  }

  return data?.length ?? 0;
}

async function sendFinalizedNotifications(swapId: string) {
  const admin = supabaseAdmin();
  if (!admin) return;

  // Fetch full swap details with user info
  const { data: swap } = await admin
    .from("shift_swaps")
    .select(
      `
      *,
      requester:user_roles!shift_swaps_requester_id_fkey(display_name, telegram_chat_id),
      target:user_roles!shift_swaps_target_user_id_fkey(display_name, telegram_chat_id)
    `,
    )
    .eq("id", swapId)
    .single();

  if (!swap) return;

  interface AssignmentJoinRow {
    id: string;
    user_id: string;
    shift_id: string;
    shifts:
      | {
          date: string;
          start_time: string;
          end_time: string;
          role: string;
        }
      | Array<{
          date: string;
          start_time: string;
          end_time: string;
          role: string;
        }>
      | null;
  }

  function shiftOf(row: AssignmentJoinRow | undefined) {
    if (!row?.shifts) return null;
    return Array.isArray(row.shifts) ? (row.shifts[0] ?? null) : row.shifts;
  }

  function pickRelation<T>(rel: T | T[] | null | undefined): T | undefined {
    if (!rel) return undefined;
    return Array.isArray(rel) ? rel[0] : rel;
  }

  // Fetch assignment details
  const { data: assignments } = await admin
    .from("shift_assignments")
    .select(
      `
      id,
      user_id,
      shift_id,
      shifts!inner(date, start_time, end_time, role)
    `,
    )
    .in("id", [swap.assignment_id, swap.target_assignment_id].filter(Boolean));

  const typedAssignments = (assignments ?? []) as AssignmentJoinRow[];

  // After finalize, the *requester* sits on whatever assignment used to
  // belong to the target (in an exchange) or on no new assignment (takeover);
  // we match by current user_id to detect "who owns which shift now".
  const requesterAssignment = typedAssignments.find(
    (a) => a.user_id === swap.requester_id,
  );
  const targetAssignment = typedAssignments.find(
    (a) => a.user_id === swap.target_user_id,
  );

  const requesterShift = shiftOf(requesterAssignment);
  const targetShift = shiftOf(targetAssignment);

  const requesterRel = pickRelation(
    swap.requester as
      | { display_name: string | null; telegram_chat_id: string | null }
      | Array<{
          display_name: string | null;
          telegram_chat_id: string | null;
        }>
      | null,
  );
  const targetRel = pickRelation(
    swap.target as
      | { display_name: string | null; telegram_chat_id: string | null }
      | Array<{
          display_name: string | null;
          telegram_chat_id: string | null;
        }>
      | null,
  );

  if (requesterShift && requesterRel) {
    const email = await getUserEmail(swap.requester_id);
    if (email) {
      const template = swapFinalizedEmail({
        recipientName: requesterRel.display_name ?? "Kollege",
        kind: swap.kind,
        partnerName: targetRel?.display_name ?? "Kollege",
        yourNewShift: {
          date: requesterShift.date,
          startTime: requesterShift.start_time,
          endTime: requesterShift.end_time,
          role: requesterShift.role,
        },
      });
      await resend.send({ to: email, ...template });
    }

    const chatId = requesterRel.telegram_chat_id;
    if (chatId) {
      await telegram.sendMessage(
        chatId,
        `✅ Schicht${swap.kind === "exchange" ? "tausch" : "übernahme"} bestätigt! Deine neue Schicht: ${requesterShift.date} ${requesterShift.start_time.slice(0, 5)}–${requesterShift.end_time.slice(0, 5)} Uhr.`,
      );
    }
  }

  if (targetShift && targetRel) {
    const email = await getUserEmail(swap.target_user_id);
    if (email) {
      const template = swapFinalizedEmail({
        recipientName: targetRel.display_name ?? "Kollege",
        kind: swap.kind,
        partnerName: requesterRel?.display_name ?? "Kollege",
        yourNewShift: {
          date: targetShift.date,
          startTime: targetShift.start_time,
          endTime: targetShift.end_time,
          role: targetShift.role,
        },
      });
      await resend.send({ to: email, ...template });
    }

    const chatId = targetRel.telegram_chat_id;
    if (chatId) {
      await telegram.sendMessage(
        chatId,
        `✅ Schicht${swap.kind === "exchange" ? "tausch" : "übernahme"} bestätigt! Deine neue Schicht: ${targetShift.date} ${targetShift.start_time.slice(0, 5)}–${targetShift.end_time.slice(0, 5)} Uhr.`,
      );
    }
  }
}

async function sendRejectedNotification(swapId: string) {
  const admin = supabaseAdmin();
  if (!admin) return;

  const { data: swap } = await admin
    .from("shift_swaps")
    .select(
      `
      *,
      requester:user_roles!shift_swaps_requester_id_fkey(display_name, telegram_chat_id),
      target:user_roles!shift_swaps_target_user_id_fkey(display_name)
    `,
    )
    .eq("id", swapId)
    .single();

  if (!swap) return;

  function pickRelation<T>(rel: T | T[] | null | undefined): T | undefined {
    if (!rel) return undefined;
    return Array.isArray(rel) ? rel[0] : rel;
  }

  const requesterRel = pickRelation(
    swap.requester as
      | { display_name: string | null; telegram_chat_id: string | null }
      | Array<{
          display_name: string | null;
          telegram_chat_id: string | null;
        }>
      | null,
  );
  const targetRel = pickRelation(
    swap.target as
      | { display_name: string | null }
      | Array<{ display_name: string | null }>
      | null,
  );

  const chatId = requesterRel?.telegram_chat_id;
  if (chatId) {
    await telegram.sendMessage(
      chatId,
      `❌ ${targetRel?.display_name ?? "Kollege"} hat deine ${swap.kind === "exchange" ? "Tausch" : "Übernahme"}-Anfrage abgelehnt.`,
    );
  }
}

async function getUserEmail(userId: string): Promise<string | null> {
  const admin = supabaseAdmin();
  if (!admin) return null;

  const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
  const user = data?.users?.find((u) => u.id === userId);
  return user?.email ?? null;
}
