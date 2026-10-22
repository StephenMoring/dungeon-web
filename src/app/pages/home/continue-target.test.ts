import { describe, expect, it } from "vitest";
import { PREVIEW_CHARACTERS } from "@/dev/fixtures";
import type { CharacterWithCampaign } from "@/app/api/characters";
import { continueTarget } from "./continue-target";

const [aldric, ysolde, corvin] = PREVIEW_CHARACTERS as [
  CharacterWithCampaign,
  CharacterWithCampaign,
  CharacterWithCampaign,
];

describe("continueTarget", () => {
  it("asks a new player to forge a hero", () => {
    expect(continueTarget([])).toEqual({ kind: "forge" });
  });

  it("forges when no hero has a campaign", () => {
    expect(continueTarget([ysolde])).toEqual({ kind: "forge" });
  });

  it("continues the first hero in order that has a campaign", () => {
    expect(continueTarget([ysolde, aldric, corvin])).toEqual({
      kind: "continue",
      campaignId: 7,
      campaignName: "The Bell of Saint-Lazare",
    });
  });

  it("names an unloaded campaign 'your campaign'", () => {
    const orphan = { ...aldric, campaign: null };
    expect(continueTarget([orphan])).toEqual({
      kind: "continue",
      campaignId: 7,
      campaignName: "your campaign",
    });
  });
});
