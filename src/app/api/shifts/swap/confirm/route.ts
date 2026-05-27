
/**
 * Magic-link handler for shift swap accept/reject.
 *
 * GET /api/shifts/swap/confirm?token=<token>&action=accept|reject
 *
 * Verifies the token against `shift_swaps.accept_token_hash`, calls the
 * swap service (accept/reject), and renders a simple confirmation page.
 *
 * No login required — the token itself is the authentication.
 */

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const action = searchParams.get("action");

  if (!token || (action !== "accept" && action !== "reject")) {
    return new Response(
      renderPage("Ungültiger Link", "Der Link ist ungültig oder abgelaufen."),
      { status: 400, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }

  try {
    // Import swap service (will be created in G6)
    const { acceptSwapByToken, rejectSwapByToken } = await import(
      "@/server/shifts/swapService"
    );

    if (action === "accept") {
      await acceptSwapByToken(token);
      return new Response(
        renderPage("Tausch bestätigt", "✅ Die Schichten wurden erfolgreich getauscht."),
        { headers: { "Content-Type": "text/html; charset=utf-8" } },
      );
    } else {
      await rejectSwapByToken(token);
      return new Response(
        renderPage("Tausch abgelehnt", "❌ Der Tausch wurde abgelehnt."),
        { headers: { "Content-Type": "text/html; charset=utf-8" } },
      );
    }
  } catch (error) {
    console.error("[swap/confirm]", error);
    const message =
      error instanceof Error ? error.message : "Unbekannter Fehler";
    return new Response(
      renderPage("Fehler", `Der Tausch konnte nicht verarbeitet werden: ${message}`),
      { status: 500, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }
}

function renderPage(title: string, message: string) {
  return `<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title} · Bodega Bühlot</title>
  <style>
    body {
      margin: 0;
      background: #161616;
      font-family: Inter, system-ui, sans-serif;
      color: #F3EEE6;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 24px;
    }
    .card {
      background: #1d1614;
      border: 1px solid rgba(216,199,170,.14);
      border-radius: 24px;
      padding: 48px 40px;
      max-width: 480px;
      text-align: center;
    }
    h1 {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-weight: 400;
      font-size: 36px;
      line-height: 1.1;
      margin: 0 0 16px;
    }
    p {
      font-size: 16px;
      line-height: 1.65;
      color: #d8c7aa;
      margin: 0;
    }
    .badge {
      display: inline-block;
      font-size: 11px;
      letter-spacing: .32em;
      text-transform: uppercase;
      color: #8B7A3D;
      margin-bottom: 16px;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">Bodega Bühlot</div>
    <h1>${title}</h1>
    <p>${message}</p>
  </div>
</body>
</html>`;
}
