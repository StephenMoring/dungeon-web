import type { Campaign } from "@/app/api/campaigns";

/** The campaign's name matched by id, or "Campaign #<id>" while loading, on error or when unknown. */
export function campaignName(campaigns: Campaign[] | null, id: string): string {
  return campaigns?.find((c) => String(c.id) === id)?.name ?? `Campaign #${id}`;
}
