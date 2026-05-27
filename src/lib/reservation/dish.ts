/**
 * DISH Reservation deep-link helper.
 *
 * DISH (https://reserve.dish.co/) is the booked reservation engine:
 * - Bookings live in the restaurant's existing DISH backoffice.
 * - "Reserve with Google" runs through DISH automatically.
 * - DISH does not expose a public REST API for reservation creation,
 *   so we cannot replicate the booking flow ourselves — instead we
 *   collect the user's preferred date/time/party size in our own
 *   Bloom-styled UI and hand them off to DISH with the values
 *   appended as query parameters.
 *
 * URL parameter prefill is **best-effort**:
 * DISH does not publicly document which params they accept, so we
 * append the most common variants (`date`, `time`, `persons`,
 * `seats`, `guests`). If DISH ignores all of them, the user re-enters
 * the values on the DISH page — no booking is lost.
 *
 * The handover screen always shows the user's selection in plain
 * German so they remember it across the redirect.
 */
export interface DishPrefill {
  date?: string; // YYYY-MM-DD
  time?: string; // HH:MM
  partySize?: number;
}

const DEFAULT_BASE = "https://reserve.dish.co";

export function buildDishUrl(
  restaurantId: string,
  prefill: DishPrefill = {},
  baseUrl: string = DEFAULT_BASE,
): string {
  const url = new URL(`${baseUrl}/${restaurantId}`);

  if (prefill.date) url.searchParams.set("date", prefill.date);
  if (prefill.time) url.searchParams.set("time", prefill.time);

  if (typeof prefill.partySize === "number" && prefill.partySize > 0) {
    const n = String(prefill.partySize);
    // Cover the three field names DISH has historically used.
    url.searchParams.set("persons", n);
    url.searchParams.set("seats", n);
    url.searchParams.set("guests", n);
  }

  return url.toString();
}

/**
 * The DISH backoffice URL for staff (separate from the public booking
 * widget). Used in the dashboard "Reservierungen" tab to deep-link
 * staff into DISH where the live reservation list lives.
 */
export function dishBackofficeUrl(): string {
  return "https://reservation.dish.co/dashboard";
}
