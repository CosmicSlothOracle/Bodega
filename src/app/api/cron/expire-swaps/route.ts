import { NextResponse } from "next/server";
import { serverEnv } from "@/lib/env";
import { expireOldSwaps } from "@/server/shifts/swapService";

export async function GET(request: Request) {
  const { cron } = serverEnv();
  const auth = request.headers.get("authorization");
  const expected = cron.secret ? `Bearer ${cron.secret}` : "";

  if (!expected || auth !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const expired = await expireOldSwaps();
  return NextResponse.json({ ok: true, expired });
}
