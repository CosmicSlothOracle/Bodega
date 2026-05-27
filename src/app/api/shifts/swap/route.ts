import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { telegram } from "@/server/notifications/telegram";
import { resend } from "@/server/notifications/resend";
import { generateSwapToken, shortToken } from "@/server/shifts/swapToken";
import { swapRequestEmail } from "@/server/notifications/templates";
import {
  acceptSwap,
  rejectSwap,
  cancelSwap,
} from "@/server/shifts/swapService";
import { env } from "@/lib/env";

/**
 * Phase F2: Schichtplaner v2 — Swap API
 *
 * POST — Mitarbeiter initiiert Tausch (exchange) oder Übernahme (takeover)
 *
 * Flow:
 *   1. Validate requester owns their shift
 *   2. Validate target user/shift compatibility
 *   3. Generate magic-link token
 *   4. Store swap request as 'pending'
 *   5. Send notifications: Telegram inline-button + Email magic-link to target
 */

interface ShiftRow {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  role: string;
  published: boolean;
}

interface AssignmentRow {
  user_id: string;
  // Supabase joins return either an object or an array depending on whether
  // the FK has `!inner` and how the codegen flavored it; we accept both.
  shift: ShiftRow | ShiftRow[] | null;
}

function pickShift(row: AssignmentRow | null | undefined): ShiftRow | null {
  if (!row) return null;
  const s = row.shift;
  if (!s) return null;
  return Array.isArray(s) ? (s[0] ?? null) : s;
}

const CreateSwapBody = z.object({
  kind: z.enum(["exchange", "takeover"]),
  requesterAssignmentId: z.string().uuid(),
  targetAssignmentId: z.string().uuid().optional(),
  targetUserId: z.string().uuid(),
  reason: z.string().max(500).optional(),
});

const RespondSwapBody = z.object({
  id: z.string().uuid(),
  action: z.enum(["accept", "reject", "cancel"]),
});

export async function POST(request: Request) {
  const sb = await supabaseServer();
  if (!sb)
    return NextResponse.json(
      { error: "Supabase nicht konfiguriert" },
      { status: 503 },
    );

  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });

  const parsed = CreateSwapBody.safeParse(
    await request.json().catch(() => ({})),
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validierung fehlgeschlagen", details: parsed.error.errors },
      { status: 400 },
    );
  }

  const admin = supabaseAdmin();
  if (!admin)
    return NextResponse.json(
      { error: "Admin nicht verfügbar" },
      { status: 503 },
    );

  const { kind, requesterAssignmentId, targetAssignmentId, targetUserId, reason } =
    parsed.data;

  // Validate requester owns their assignment
  const { data: requesterAssignmentRaw } = await admin
    .from("shift_assignments")
    .select(
      "user_id, shift:shifts!inner(id, date, start_time, end_time, role, published)",
    )
    .eq("id", requesterAssignmentId)
    .maybeSingle();

  const requesterAssignment = requesterAssignmentRaw as AssignmentRow | null;
  if (!requesterAssignment || requesterAssignment.user_id !== user.id) {
    return NextResponse.json(
      { error: "Assignment nicht gefunden oder nicht berechtigt" },
      { status: 403 },
    );
  }

  const requesterShift = pickShift(requesterAssignment);
  if (!requesterShift?.published) {
    return NextResponse.json(
      { error: "Schicht ist noch nicht veröffentlicht" },
      { status: 400 },
    );
  }

  // Validate target user exists
  const { data: targetUser } = await admin
    .from("user_roles")
    .select("display_name, telegram_chat_id")
    .eq("user_id", targetUserId)
    .maybeSingle();

  if (!targetUser) {
    return NextResponse.json(
      { error: "Ziel-Mitarbeiter nicht gefunden" },
      { status: 404 },
    );
  }

  // For exchange: validate target assignment exists and has same role
  let targetShift: ShiftRow | null = null;
  if (kind === "exchange") {
    if (!targetAssignmentId) {
      return NextResponse.json(
        { error: "targetAssignmentId erforderlich für Tausch" },
        { status: 400 },
      );
    }

    const { data: targetAssignmentRaw } = await admin
      .from("shift_assignments")
      .select(
        "user_id, shift:shifts!inner(id, date, start_time, end_time, role, published)",
      )
      .eq("id", targetAssignmentId)
      .maybeSingle();

    const targetAssignmentData = targetAssignmentRaw as AssignmentRow | null;
    if (!targetAssignmentData || targetAssignmentData.user_id !== targetUserId) {
      return NextResponse.json(
        { error: "Ziel-Assignment nicht gefunden oder gehört nicht dem Ziel-User" },
        { status: 400 },
      );
    }

    targetShift = pickShift(targetAssignmentData);
    if (!targetShift) {
      return NextResponse.json(
        { error: "Ziel-Schicht nicht gefunden" },
        { status: 400 },
      );
    }

    if (targetShift.role !== requesterShift.role) {
      return NextResponse.json(
        { error: "Schichten haben unterschiedliche Rollen" },
        { status: 400 },
      );
    }

    if (!targetShift.published) {
      return NextResponse.json(
        { error: "Ziel-Schicht ist noch nicht veröffentlicht" },
        { status: 400 },
      );
    }
  }

  // Generate magic-link token
  const { token, hash } = generateSwapToken();
  const tokenPrefix = shortToken(token);

  // Create swap request
  const { data: swap, error: swapError } = await admin
    .from("shift_swaps")
    .insert({
      kind,
      assignment_id: requesterAssignmentId,
      target_assignment_id: targetAssignmentId ?? null,
      target_user_id: targetUserId,
      requester_id: user.id,
      reason: reason ?? null,
      accept_token_hash: hash,
      accept_token_prefix: tokenPrefix,
      status: "pending",
    })
    .select("id")
    .single();

  if (swapError || !swap) {
    console.error("[swap.POST]", swapError);
    return NextResponse.json(
      { error: "Swap konnte nicht erstellt werden" },
      { status: 500 },
    );
  }

  const swapId = (swap as { id: string }).id;

  // Get requester name
  const { data: requesterRole } = await admin
    .from("user_roles")
    .select("display_name")
    .eq("user_id", user.id)
    .maybeSingle();

  const requesterName =
    (requesterRole as { display_name?: string } | null)?.display_name ??
    "Kollege";
  const targetName =
    (targetUser as { display_name?: string }).display_name ?? "Kollege";

  // Send Telegram notification with inline buttons
  const telegramChatId = (targetUser as { telegram_chat_id?: string | null })
    .telegram_chat_id;
  if (telegramChatId) {
    try {
      const kindLabel = kind === "exchange" ? "Schichttausch" : "Schichtübernahme";

      await telegram.sendMessage(
        telegramChatId,
        `<b>${kindLabel}-Anfrage von ${requesterName}</b>\n\n<b>Deine Schicht:</b>\n${requesterShift.date} · ${requesterShift.start_time.slice(0, 5)}-${requesterShift.end_time.slice(0, 5)} Uhr${
          targetShift
            ? `\n\n<b>Im Tausch gegen:</b>\n${targetShift.date} · ${targetShift.start_time.slice(0, 5)}-${targetShift.end_time.slice(0, 5)} Uhr`
            : ""
        }${reason ? `\n\n<i>Grund: ${reason}</i>` : ""}`,
        {
          replyMarkup: {
            inline_keyboard: [
              [
                {
                  text: "✓ Annehmen",
                  callback_data: `swap:accept:${swapId}:${tokenPrefix}`,
                },
                {
                  text: "✗ Ablehnen",
                  callback_data: `swap:reject:${swapId}:${tokenPrefix}`,
                },
              ],
            ],
          },
        },
      );
    } catch (err) {
      console.error("[swap.POST] telegram failed", err);
    }
  }

  // Send email with magic-link
  const { data: targetAuthUser } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  const targetEmail = targetAuthUser?.users?.find((u) => u.id === targetUserId)
    ?.email;

  if (targetEmail) {
    try {
      const baseUrl = env.public.siteUrl;
      const acceptUrl = `${baseUrl}/api/shifts/swap/confirm?token=${token}&action=accept`;
      const rejectUrl = `${baseUrl}/api/shifts/swap/confirm?token=${token}&action=reject`;

      const emailTemplate = swapRequestEmail({
        kind,
        requesterName,
        targetName,
        requesterShift: {
          date: requesterShift.date,
          startTime: requesterShift.start_time,
          endTime: requesterShift.end_time,
          role: requesterShift.role,
        },
        targetShift: targetShift
          ? {
              date: targetShift.date,
              startTime: targetShift.start_time,
              endTime: targetShift.end_time,
              role: targetShift.role,
            }
          : undefined,
        reason: reason ?? undefined,
        acceptUrl,
        rejectUrl,
      });

      await resend.send({
        to: targetEmail,
        ...emailTemplate,
      });
    } catch (err) {
      console.error("[swap.POST] email failed", err);
    }
  }

  return NextResponse.json({ ok: true, id: swapId });
}

/**
 * PATCH — Dashboard response to an existing swap.
 *
 * Accept/reject is restricted to the swap's `target_user_id`; cancel is
 * restricted to the swap's `requester_id`. All three transitions delegate to
 * the central `swapService` so Telegram inline-buttons, Magic-Link callbacks,
 * and the Dashboard share one code path.
 */
export async function PATCH(request: Request) {
  const sb = await supabaseServer();
  if (!sb)
    return NextResponse.json(
      { error: "Supabase nicht konfiguriert" },
      { status: 503 },
    );

  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });

  const parsed = RespondSwapBody.safeParse(
    await request.json().catch(() => ({})),
  );
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validierung fehlgeschlagen", details: parsed.error.errors },
      { status: 400 },
    );
  }

  const admin = supabaseAdmin();
  if (!admin)
    return NextResponse.json(
      { error: "Admin nicht verfügbar" },
      { status: 503 },
    );

  const { id, action } = parsed.data;

  const { data: swapRaw } = await admin
    .from("shift_swaps")
    .select("id, status, requester_id, target_user_id")
    .eq("id", id)
    .maybeSingle();

  const swap = swapRaw as
    | {
        id: string;
        status: string;
        requester_id: string;
        target_user_id: string;
      }
    | null;
  if (!swap) {
    return NextResponse.json({ error: "Tausch nicht gefunden" }, { status: 404 });
  }

  // Authorise based on action.
  if (action === "cancel" && swap.requester_id !== user.id) {
    return NextResponse.json(
      { error: "Nur der Antragsteller darf abbrechen" },
      { status: 403 },
    );
  }
  if (
    (action === "accept" || action === "reject") &&
    swap.target_user_id !== user.id
  ) {
    return NextResponse.json(
      { error: "Nur das Ziel-Mitglied darf annehmen oder ablehnen" },
      { status: 403 },
    );
  }

  try {
    if (action === "accept") await acceptSwap(swap.id, "dashboard");
    else if (action === "reject") await rejectSwap(swap.id, "dashboard");
    else await cancelSwap(swap.id);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unbekannter Fehler";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  return NextResponse.json({ ok: true, action });
}
