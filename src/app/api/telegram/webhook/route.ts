import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { telegram } from "@/server/notifications/telegram";
import { serverEnv } from "@/lib/env";

/**
 * Telegram Bot webhook.
 *
 * Receives `Update` payloads from `setWebhook`. Handles:
 *   1. `/start <code>` message: staff onboarding (Telegram invite code)
 *   2. `callback_query`: inline button clicks for swap accept/reject
 *
 * Auth: Telegram includes the secret we configured in `setWebhook` via the
 * `X-Telegram-Bot-Api-Secret-Token` header. We require it; missing or
 * mismatched secret returns 401.
 */

interface TelegramUpdate {
  message?: {
    chat?: { id: number | string };
    from?: { id: number; first_name?: string; username?: string };
    text?: string;
  };
  callback_query?: {
    id: string;
    from?: { id: number; first_name?: string; username?: string };
    message?: {
      chat?: { id: number | string };
      message_id?: number;
    };
    data?: string;
  };
}

export async function POST(request: Request) {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  const provided = request.headers.get("x-telegram-bot-api-secret-token");
  if (!expected || provided !== expected) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let update: TelegramUpdate;
  try {
    update = (await request.json()) as TelegramUpdate;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 });
  }

  // Handle callback_query (inline button clicks)
  if (update.callback_query) {
    return handleCallbackQuery(update.callback_query);
  }

  // Handle message (staff onboarding)
  const text = update.message?.text ?? "";
  const chatId = update.message?.chat?.id;
  if (!chatId) return NextResponse.json({ ok: true });

  const startMatch = text.match(/^\/start(?:\s+(.+))?$/);
  if (!startMatch) {
    await telegram.sendMessage(
      chatId,
      "Hola. Schicke /start &lt;Einladungscode&gt; um dein Bloom-Konto zu verknüpfen.",
    );
    return NextResponse.json({ ok: true });
  }

  const code = startMatch[1]?.trim();
  if (!code) {
    await telegram.sendMessage(
      chatId,
      "Kein Code übergeben. Frag deine Owner um einen Onboarding-Link.",
    );
    return NextResponse.json({ ok: true });
  }

  const admin = supabaseAdmin();
  if (!admin) {
    await telegram.sendMessage(chatId, "Backend gerade nicht erreichbar.");
    return NextResponse.json({ ok: true });
  }

  const { data: roleRow } = await admin
    .from("user_roles")
    .select("user_id, display_name")
    .eq("telegram_invite_code", code)
    .maybeSingle();

  if (!roleRow) {
    await telegram.sendMessage(
      chatId,
      "Code unbekannt oder bereits eingelöst. Bitte einen neuen Link anfordern.",
    );
    return NextResponse.json({ ok: true });
  }

  const { error: updateErr } = await admin
    .from("user_roles")
    .update({
      telegram_chat_id: String(chatId),
      telegram_invite_code: null,
      telegram_linked_at: new Date().toISOString(),
    })
    .eq("user_id", (roleRow as { user_id: string }).user_id);

  if (updateErr) {
    await telegram.sendMessage(chatId, "Verknüpfung fehlgeschlagen. Bitte später erneut versuchen.");
    return NextResponse.json({ ok: true });
  }

  const name = (roleRow as { display_name?: string }).display_name ?? "";
  await telegram.sendMessage(
    chatId,
    `Verknüpft. Hola${name ? ` ${name}` : ""}! Ab jetzt bekommst du Schichten und Tauschanfragen direkt hier.`,
  );

  return NextResponse.json({ ok: true });
}

/**
 * Handles inline button clicks from Telegram messages.
 * Callback data format: "swap:accept:<swap_id>:<short_token>" or "swap:reject:<swap_id>:<short_token>"
 */
async function handleCallbackQuery(query: NonNullable<TelegramUpdate["callback_query"]>) {
  const callbackData = query.data ?? "";
  const chatId = query.message?.chat?.id;
  const queryId = query.id;

  // Answer callback query immediately (removes loading state in Telegram)
  const { telegram: cfg } = serverEnv();
  if (cfg.botToken) {
    await fetch(`https://api.telegram.org/bot${cfg.botToken}/answerCallbackQuery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ callback_query_id: queryId }),
    }).catch(() => {});
  }

  // Parse callback data: "swap:accept:<swap_id>:<short_token>"
  const match = callbackData.match(/^swap:(accept|reject):([a-f0-9-]+):(.+)$/);
  if (!match) {
    if (chatId) {
      await telegram.sendMessage(chatId, "Unbekannte Aktion.");
    }
    return NextResponse.json({ ok: true });
  }

  const [, action, swapId, tokenPrefix] = match;

  try {
    const { acceptSwap, rejectSwap, assertTelegramSwapIntent } = await import(
      "@/server/shifts/swapService"
    );

    await assertTelegramSwapIntent(
      swapId,
      tokenPrefix,
      chatId,
      query.from?.id,
    );

    if (action === "accept") {
      await acceptSwap(swapId, "telegram");
      if (chatId) {
        await telegram.sendMessage(chatId, "✅ Tausch angenommen. Die Schichten wurden aktualisiert.");
      }
    } else if (action === "reject") {
      await rejectSwap(swapId, "telegram");
      if (chatId) {
        await telegram.sendMessage(chatId, "❌ Tausch abgelehnt.");
      }
    }
  } catch (error) {
    console.error("[telegram webhook] swap action failed", error);
    if (chatId) {
      await telegram.sendMessage(
        chatId,
        "Fehler beim Verarbeiten der Anfrage. Bitte im Dashboard versuchen.",
      );
    }
  }

  return NextResponse.json({ ok: true });
}
