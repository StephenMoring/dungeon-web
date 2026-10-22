import type { CharacterWithCampaign } from "@/app/api/characters";

export type ContinueTarget =
  | { kind: "continue"; campaignId: number; campaignName: string }
  | { kind: "forge" };

/** The dashboard's one action: the first hero (in API order) that has a campaign, else forge one. */
export function continueTarget(items: CharacterWithCampaign[]): ContinueTarget {
  const item = items.find((i) => i.character.campaign_id != null);
  const campaignId = item?.character.campaign_id;
  if (item == null || campaignId == null) return { kind: "forge" };
  return { kind: "continue", campaignId, campaignName: item.campaign?.name ?? "your campaign" };
}
