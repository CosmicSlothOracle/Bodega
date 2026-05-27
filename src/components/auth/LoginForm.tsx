"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { supabaseBrowser } from "@/lib/supabase/client";

const fieldClass =
  "w-full rounded-[var(--radius-input)] bg-surface-card border border-border-soft px-4 py-3 text-bloom-cream placeholder:text-text-muted focus:outline-none focus:border-bloom-ochre";

export function LoginForm() {
  const searchParams = useSearchParams();
  const nextPath =
    searchParams.get("next")?.startsWith("/") &&
    !searchParams.get("next")?.startsWith("//")
      ? searchParams.get("next")!
      : "/dashboard";

  const authError = searchParams.get("error") === "auth";

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "sending" | "sent" | "error" | "mock"
  >(authError ? "error" : "idle");
  const [message, setMessage] = useState<string | null>(
    authError
      ? "Anmeldung fehlgeschlagen. Bitte Magic-Link erneut anfordern oder Redirect-URL in Supabase prüfen."
      : null,
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setMessage(null);

    const supabase = supabaseBrowser();
    if (!supabase) {
      setStatus("mock");
      setMessage(
        "Supabase ist noch nicht konfiguriert. Setze NEXT_PUBLIC_SUPABASE_* und SUPABASE_SERVICE_ROLE_KEY, um Logins zu aktivieren.",
      );
      return;
    }

    const callback = new URL("/auth/confirm", window.location.origin);
    callback.searchParams.set("next", nextPath);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: callback.toString(),
      },
    });

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }
    setStatus("sent");
    setMessage("Magic-Link unterwegs. Schau in dein Postfach.");
  }

  return (
    <Card>
      <CardBody>
        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-[0.7rem] uppercase tracking-[0.22em] text-text-secondary mb-2"
            >
              E-Mail
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              placeholder="dein.name@bodega-buehlot.de"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldClass}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={status === "sending"}
            className="w-full"
          >
            {status === "sending" ? "Wird gesendet …" : "Magic-Link senden"}
          </Button>

          {message ? (
            <p
              className={
                status === "error"
                  ? "text-sm text-status-issue"
                  : "text-sm text-text-secondary"
              }
            >
              {message}
            </p>
          ) : null}

          <p className="text-xs text-text-muted">
            Kein Account?{" "}
            <a href="mailto:hola@bodega-buehlot.de" className="text-bloom-ochre">
              Owner kontaktieren
            </a>{" "}
            für eine Einladung.
          </p>
        </form>
      </CardBody>
    </Card>
  );
}
