const API_URL = "/api";

/**
 * Every request to dungeon-service goes through here. The session is an httpOnly
 * cookie the browser sends by itself (page code never sees the token), and the API
 * refuses data-changing requests without X-Requested-With, so other sites can't
 * forge them with the player's cookie.
 */
export function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set("X-Requested-With", "dungeon-web");
  return fetch(`${API_URL}${path}`, { ...init, headers, credentials: "same-origin" });
}

/** The server's `detail` string, if the error body has one. */
export async function errorDetail(response: Response): Promise<string | null> {
  try {
    const body = (await response.json()) as { detail?: unknown };
    return typeof body.detail === "string" ? body.detail : null;
  } catch {
    return null;
  }
}

/**
 * What to show for a failed request. Rate limits (429) carry a message written for
 * players ("Try again in 40 seconds"); other failures keep the caller's wording.
 */
export async function failureMessage(response: Response, fallback: string): Promise<string> {
  if (response.status === 429) {
    const detail = await errorDetail(response);
    if (detail) return detail;
  }
  return `${fallback}: ${response.status}`;
}
