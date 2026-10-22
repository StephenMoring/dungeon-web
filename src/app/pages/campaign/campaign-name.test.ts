import { describe, expect, it } from "vitest";
import { PREVIEW_CAMPAIGNS } from "@/dev/fixtures";
import { campaignName } from "./campaign-name";

describe("campaignName", () => {
  it("falls back to the id while campaigns are loading or failed", () => {
    expect(campaignName(null, "7")).toBe("Campaign #7");
  });

  it("falls back to the id when the campaign is unknown", () => {
    expect(campaignName(PREVIEW_CAMPAIGNS, "99")).toBe("Campaign #99");
  });

  it("uses the matching campaign's name", () => {
    expect(campaignName(PREVIEW_CAMPAIGNS, "7")).toBe("The Bell of Saint-Lazare");
  });
});
