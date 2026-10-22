import { describe, expect, it } from "vitest";
import { PREVIEW_CAMPAIGNS } from "./fixtures";
import { isPreviewRequested, startPreviewSession } from "./preview-session";

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
});
