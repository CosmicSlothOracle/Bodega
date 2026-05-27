import { NextResponse } from "next/server";
import { z } from "zod";
import { supabaseServer } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

/**
 * Per-member team management.
 *
 * PATCH  — owner edits role, display_name, or unlinks Telegram.
 * DELETE — owner removes the user_roles row (does NOT delete the
 *          underlying auth.users account; the user can be re-added later
 *          without a new sign-up).
 */

const PatchBody = z.object({
  role: z.enum(["owner", "manager", "staff", "marketing"]).optional(),
  displayName: z.string().min(1).max(80).optional(),
  unlinkTelegram: z.boolean().optional(),
});

async function requireOwner() {
  const sb = await supabaseServer();
  if (!sb) {
    return {
      response: NextResponse.json({ error: "Supabase nicht konfiguriert" }, { status: 503 }),
    };
  }
  const {
    data: { user },
  } = await sb.auth.getUser();
  if (!user) {
    return { response: NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 }) };
  }
  const { data: roleRow } = await sb
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();
  if ((roleRow as { role?: string } | null)?.role !== "owner") {
    return { response: NextResponse.json({ error: "Nur Owner darf bearbeiten" }, { status: 403 }) };
  }
  return { ownerId: user.id };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const guard = await requireOwner();
  if ("response" in guard) return guard.response;

  const { userId } = await params;
  if (!userId.match(/^[0-9a-f-]{36}$/i)) {
    return NextResponse.json({ error: "Ungültige userId" }, { status: 400 });
  }

  const parsed = PatchBody.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validierung fehlgeschlagen", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const update: Record<string, unknown> = {};
  if (parsed.data.role !== undefined) update.role = parsed.data.role;
  if (parsed.data.displayName !== undefined) update.display_name = parsed.data.displayName;
  if (parsed.data.unlinkTelegram) {
    update.telegram_chat_id = null;
    update.telegram_invite_code = null;
    update.telegram_linked_at = null;
  }
  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: "Nichts zu ändern" }, { status: 400 });
  }

  // Owner cannot demote themselves to a non-owner role — would lock the
  // restaurant out of role-managed admin operations entirely.
  if (
    parsed.data.role &&
    parsed.data.role !== "owner" &&
    userId === guard.ownerId
  ) {
    return NextResponse.json(
      { error: "Owner kann sich nicht selbst herabstufen" },
      { status: 400 },
    );
  }

  const admin = supabaseAdmin();
  if (!admin) return NextResponse.json({ error: "Admin nicht verfügbar" }, { status: 503 });

  const { error } = await admin
    .from("user_roles")
    .update(update)
    .eq("user_id", userId);

  if (error) {
    return NextResponse.json(
      { error: "Update fehlgeschlagen", detail: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const guard = await requireOwner();
  if ("response" in guard) return guard.response;

  const { userId } = await params;
  if (userId === guard.ownerId) {
    return NextResponse.json(
      { error: "Owner kann sich nicht selbst entfernen" },
      { status: 400 },
    );
  }

  const admin = supabaseAdmin();
  if (!admin) return NextResponse.json({ error: "Admin nicht verfügbar" }, { status: 503 });

  const { error } = await admin.from("user_roles").delete().eq("user_id", userId);
  if (error) {
    return NextResponse.json(
      { error: "Entfernen fehlgeschlagen", detail: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
