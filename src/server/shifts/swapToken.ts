import { createHash, randomBytes } from "crypto";

/**
 * Swap magic-link token utilities.
 *
 * Tokens are 32-byte random values encoded as base64url. The hash (SHA-256)
 * is stored in `shift_swaps.accept_token_hash` for single-use verification.
 *
 * The token is embedded in email links and enables 1-click accept/reject
 * without requiring the user to log in.
 */

export interface SwapToken {
  token: string;
  hash: string;
}

/**
 * Generates a new swap token and its SHA-256 hash.
 * Store `hash` in the database, send `token` in the email link.
 */
export function generateSwapToken(): SwapToken {
  const token = randomBytes(32).toString("base64url");
  const hash = createHash("sha256").update(token).digest("hex");
  return { token, hash };
}

/**
 * Verifies that a token matches the stored hash.
 * Use this server-side when processing magic-link requests.
 */
export function verifySwapToken(token: string, storedHash: string): boolean {
  const hash = createHash("sha256").update(token).digest("hex");
  return hash === storedHash;
}

/**
 * Extracts a short token snippet (first 8 chars) for embedding in
 * Telegram callback_data (which has a 64-byte limit).
 * Not cryptographically secure for standalone use, but sufficient
 * when combined with the swap_id and user verification.
 */
export function shortToken(token: string): string {
  return token.slice(0, 8);
}
