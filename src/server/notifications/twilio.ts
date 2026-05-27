import { serverEnv, serverIntegrations } from "@/lib/env";

export const twilio = {
  isLive: () => serverIntegrations().twilio,

  async sendSms(to: string, body: string): Promise<{ sid: string | null; mock: boolean }> {
    const { twilio: cfg } = serverEnv();
    if (!cfg.accountSid || !cfg.authToken || !cfg.fromNumber) {
      console.info("[twilio] mock SMS → %s · %s", to, body.slice(0, 64));
      return { sid: null, mock: true };
    }

    const auth = Buffer.from(`${cfg.accountSid}:${cfg.authToken}`).toString("base64");
    const params = new URLSearchParams({
      To: to,
      From: cfg.fromNumber,
      Body: body,
    });

    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${cfg.accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      },
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`twilio send failed: ${res.status} ${text}`);
    }
    const json = (await res.json()) as { sid?: string };
    return { sid: json.sid ?? null, mock: false };
  },
};
