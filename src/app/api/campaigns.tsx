const API_URL = "/api";

export interface Campaign {
  id: number | null;
  name: string;
  theme: string;
  description: string;
  characters: unknown[];
  campaign_checkpoints: unknown[];
}

export async function getCampaigns(): Promise<Campaign[]> {
  const response = await fetch(`${API_URL}/campaigns/`);
  if (!response.ok) {
    throw new Error(`Failed to fetch campaigns: ${response.status}`);
  }
  const campaigns = response.json();
  console.log(campaigns);
  return campaigns;
}
