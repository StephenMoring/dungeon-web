const API_URL = "/api";

export interface Campaign {
  id: number | null;
  name: string;
  theme: string;
  description: string;
  characters: unknown[];
  campaign_checkpoints: unknown[];
}

export interface CreateCampaignResponse {
  campaign: Campaign;
  opening_message: string;
}

export async function createCampaign(characterId: number, description: string): Promise<CreateCampaignResponse> {
  const response = await fetch(`${API_URL}/campaigns/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("dungeon_jwt")}`,
    },
    body: JSON.stringify({ character_id: characterId, description }),
  });
  if (!response.ok) throw new Error(`Failed to create campaign: ${response.status}`);
  return await response.json();
}

export async function getCampaignCharacterId(campaignId: string): Promise<number> {
  const response = await fetch(`${API_URL}/campaigns/${campaignId}/characters`, {
    headers: { "Authorization": `Bearer ${localStorage.getItem("dungeon_jwt")}` },
  });
  if (!response.ok) throw new Error(`Failed to fetch campaign characters: ${response.status}`);
  const characters = await response.json() as { id: number }[];
  if (!characters.length) throw new Error("No character found for this campaign");
  return characters[0].id;
}

export async function getCampaigns(): Promise<Campaign[]> {
  const response = await fetch(`${API_URL}/campaigns/`, {
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("dungeon_jwt")}`
    }
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch campaigns: ${response.status}`);
  }
  const campaigns = await response.json();
  console.log(campaigns);
  return campaigns;
}
