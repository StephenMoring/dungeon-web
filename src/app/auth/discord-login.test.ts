import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { buildDiscordOAuthUrl, startDiscordLogin, takeOAuthState } from "./discord-login";

const KEY = "dungeon_oauth_state";

beforeEach(() => {
  sessionStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Discord login state", () => {
  it("puts the state in the authorize link", () => {
    const url = new URL(buildDiscordOAuthUrl("abc123"));

    expect(url.origin + url.pathname).toBe("https://discord.com/oauth2/authorize");
    expect(url.searchParams.get("state")).toBe("abc123");
    expect(url.searchParams.get("response_type")).toBe("code");
  });

  it("starts a login with a fresh random state, kept for the callback", () => {
    const assign = vi.fn();
    vi.stubGlobal("location", { ...window.location, assign });

    startDiscordLogin();
    const first = sessionStorage.getItem(KEY);
    startDiscordLogin();
    const second = sessionStorage.getItem(KEY);

    expect(first).toMatch(/^[0-9a-f]{64}$/);
    expect(second).toMatch(/^[0-9a-f]{64}$/);
    expect(second).not.toBe(first);
    expect(new URL(assign.mock.calls[1][0]).searchParams.get("state")).toBe(second);
  });

  it("accepts the state this browser stored, once", () => {
    sessionStorage.setItem(KEY, "abc123");

    expect(takeOAuthState("abc123")).toBe(true);
    // Single use: a replayed callback link fails.
    expect(takeOAuthState("abc123")).toBe(false);
  });

  it("rejects a state this browser didn't start (someone else's login link)", () => {
    sessionStorage.setItem(KEY, "mine");

    expect(takeOAuthState("theirs")).toBe(false);
    expect(sessionStorage.getItem(KEY)).toBeNull();
  });

  it("rejects a callback when no login was started here", () => {
    expect(takeOAuthState("anything")).toBe(false);
  });

  it("rejects a callback with no state", () => {
    sessionStorage.setItem(KEY, "mine");

    expect(takeOAuthState(null)).toBe(false);
  });
});
