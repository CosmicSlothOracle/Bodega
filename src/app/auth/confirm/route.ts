import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabase/server";

function safeNext(raw: string | null): string {
  if (raw?.startsWith("/") && !raw.startsWith("//")) return raw;
  return "/dashboard";
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const next = safeNext(url.searchParams.get("next"));

  const sb = await supabaseServer();
  if (!sb) {
    return NextResponse.redirect(new URL("/login?error=auth", url.origin));
  }

  if (!tokenHash || !type) {
    return NextResponse.redirect(new URL("/login?error=auth", url.origin));
  }

  const { error } = await sb.auth.verifyOtp({
    token_hash: tokenHash,
    type,
  });

  if (error) {
    console.warn("[auth/confirm]", error.message);
    return NextResponse.redirect(new URL("/login?error=auth", url.origin));
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
