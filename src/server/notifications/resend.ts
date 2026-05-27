import { serverEnv, serverIntegrations } from "@/lib/env";

interface ResendAttachment {
  filename: string;
  content: string;
  contentType?: string;
}

interface ResendEmail {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  attachments?: ResendAttachment[];
}

export const resend = {
  isLive: () => serverIntegrations().resend,

  async send(email: ResendEmail): Promise<{ id: string | null; mock: boolean }> {
    const { resend: cfg } = serverEnv();
    if (!cfg.apiKey) {
      console.info("[resend] mock send → %s · %s", email.to, email.subject);
      return { id: null, mock: true };
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfg.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: cfg.fromAddress,
        to: Array.isArray(email.to) ? email.to : [email.to],
        subject: email.subject,
        html: email.html,
        text: email.text,
        reply_to: email.replyTo,
        attachments: email.attachments,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`resend send failed: ${res.status} ${text}`);
    }

    const json = (await res.json()) as { id?: string };
    return { id: json.id ?? null, mock: false };
  },
};
