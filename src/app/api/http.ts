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
