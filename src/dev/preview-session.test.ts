import { afterEach, describe, expect, it } from "vitest";
import { LONG_CAMPAIGN_NAME, PREVIEW_CAMPAIGNS } from "./fixtures";
import { isPreviewRequested, startPreviewSession } from "./preview-session";

const originalFetch = window.fetch;

afterEach(() => {
  window.fetch = originalFetch;
});

describe("preview session", () => {
  it("detects the preview flag in the query string", () => {
    expect(isPreviewRequested("?preview=1")).toBe(true);
    expect(isPreviewRequested("")).toBe(false);
  });

  it("seeds a fake login and stubs the campaigns request", async () => {
    startPreviewSession();
    expect(localStorage.getItem("dungeon_jwt")).toBe("preview");
    const res = await fetch("/api/campaigns/");
    expect(await res.json()).toEqual(PREVIEW_CAMPAIGNS);
  });

  it("stubs the turn stream", async () => {
    startPreviewSession();
    const res = await fetch("/api/characters/1/turns/stream", { method: "POST" });
    expect(res.headers.get("content-type")).toBe("text/event-stream");
    const body = await res.text();
    expect(body).toContain("event: roll");
    expect(body).toContain("event: done");
  });

  it("carries a 60-character campaign name for long-name layout checks", () => {
    expect(LONG_CAMPAIGN_NAME.length).toBe(60);
    expect(PREVIEW_CAMPAIGNS.some((c) => c.name === LONG_CAMPAIGN_NAME)).toBe(true);
  });
});
