/**
 * Discord sign-in with the OAuth `state` check.
 *
 * Without it, the callback page would accept any login code: an attacker could start
 * a login with their own Discord account, keep the callback link, and get a player to
 * open it, signing the player into the attacker's account (login CSRF). Each login
 * this browser starts gets a random state, kept in sessionStorage; Discord sends it
 * back with the code, and the callback only proceeds if they match.
 */

const STATE_KEY = "dungeon_oauth_state";

export function buildDiscordOAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: import.meta.env.VITE_DISCORD_CLIENT_ID as string,
    redirect_uri: import.meta.env.VITE_DISCORD_REDIRECT_URI as string,
    response_type: "code",
    // Only the Discord id, name and avatar; the app never needs the email address.
    scope: "identify",
    state,
  });
  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}

function randomState(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Send the player to Discord, remembering this login's state for the callback. */
export function startDiscordLogin(): void {
  const state = randomState();
  sessionStorage.setItem(STATE_KEY, state);
  window.location.assign(buildDiscordOAuthUrl(state));
}

/**
 * Whether the state Discord returned is the one this browser stored. The stored
 * value is removed either way, so a callback link only ever works once.
 */
export function takeOAuthState(returned: string | null): boolean {
  const expected = sessionStorage.getItem(STATE_KEY);
  sessionStorage.removeItem(STATE_KEY);
  return expected !== null && returned !== null && returned === expected;
}
