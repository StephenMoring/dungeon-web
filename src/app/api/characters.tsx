import type { Campaign } from "./campaigns";

const API_URL = "/api";

export interface Character {
  id: number | null;
  campaign_id: number | null;
  user_id: number;
  name: string;
  hero_class: string;
  biography: string;
  description: string;
  age: number;
  strength: number | null;
  perception: number | null;
  endurance: number | null;
  charisma: number | null;
  intelligence: number | null;
  agility: number | null;
  luck: number | null;
}

export interface CharacterWithCampaign {
  character: Character;
  campaign: Campaign | null;
}

export async function getCharacters(): Promise<CharacterWithCampaign[]> {
  const response = await fetch(`${API_URL}/characters/`, {
    headers: {
      "Authorization": `Bearer ${localStorage.getItem("dungeon_jwt")}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch characters: ${response.status}`);
  }
  return await response.json();
}
