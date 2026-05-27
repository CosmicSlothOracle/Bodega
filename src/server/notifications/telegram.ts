import { serverEnv, serverIntegrations } from "@/lib/env";

/**
 * Minimal Telegram Bot wrapper.
 *
 * - `sendMessage` posts a text message to a chat (HTML parse mode).
 * - `setWebhook` registers our `/api/telegram/webhook` endpoint with the
 *   Telegram API so incoming `/start <code>` messages can complete the
 *   staff-onboarding handshake.
 *
 * Mock-mode: when `TELEGRAM_BOT_TOKEN` is missing we log to stdout and
 * return `{ mock: true }` so dev environments don't depend on the bot.
 *
 * Why Telegram (not WhatsApp Business API):
 *   - Bot API is free, open and instant.
 *   - No Meta verification, no template approval, no per-message cost.
 *   - Trade-off: staff need Telegram installed once. For an 8-15 person
 *     team that's realistic; we accepted this in ADR-003.
 */

interface SendResult {
  messageId: number | null;
  mock: boolean;
}

interface InlineKeyboardButton {
  text: string;
  callback_data?: string;
  url?: string;
}

interface SendMessageOptions {
  silent?: boolean;
  replyMarkup?: {
    inline_keyboard?: InlineKeyboardButton[][];
  };
}

const API_BASE = "https://api.telegram.org";

export const telegram = {
  isLive: () => serverIntegrations().telegram,

  async sendMessage(
    chatId: string | number,
    text: string,
    opts: SendMessageOptions = {},
  ): Promise<SendResult> {
    const { telegram: cfg } = serverEnv();
    if (!cfg.botToken) {
      console.info("[telegram] mock send → %s · %s", chatId, text.slice(0, 80));
      return { messageId: null, mock: true };
    }

    const payload: Record<string, unknown> = {
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_notification: Boolean(opts.silent),
      link_preview_options: { is_disabled: true },
    };

    if (opts.replyMarkup) {
      payload.reply_markup = opts.replyMarkup;
    }

    const res = await fetch(
      `${API_BASE}/bot${cfg.botToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`telegram send failed: ${res.status} ${body}`);
    }

    const json = (await res.json()) as { result?: { message_id?: number } };
    return { messageId: json.result?.message_id ?? null, mock: false };
  },

  /**
   * Registers the production webhook URL with Telegram. Call once after
   * deployment, e.g. `await telegram.setWebhook("https://.../api/telegram/webhook", "<secret>")`.
   */
  async setWebhook(url: string, secret: string): Promise<void> {
    const { telegram: cfg } = serverEnv();
    if (!cfg.botToken) throw new Error("TELEGRAM_BOT_TOKEN missing");

    const res = await fetch(
      `${API_BASE}/bot${cfg.botToken}/setWebhook`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          secret_token: secret,
          allowed_updates: ["message", "callback_query"],
        }),
      },
    );
    if (!res.ok) {
      throw new Error(`telegram setWebhook failed: ${res.status} ${await res.text()}`);
    }
  },
};

/**
 * Returns the public deep-link a staff member opens to start the bot.
 * The `code` is a one-time onboarding code that maps to `auth.users.id`
 * via the `user_roles.telegram_invite_code` column.
 */
export function buildOnboardingLink(code: string): string | null {
  const { telegram: cfg } = serverEnv();
  if (!cfg.botUsername) return null;
  return `https://t.me/${cfg.botUsername}?start=${encodeURIComponent(code)}`;
}
