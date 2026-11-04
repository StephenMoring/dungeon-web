import type { components } from "@/types/api";
import type { Campaign } from "./campaigns";
import { apiFetch } from "./http";


export type Character = components["schemas"]["Character"];
export type HeroClass = components["schemas"]["HeroClass"];
export type Race = components["schemas"]["Race"];
export type CharacterDescriptionCreate = components["schemas"]["CharacterDescriptionCreate"];
/** What a player saves; the server sets the id and owner, and campaigns assign themselves. */
export type CharacterSave = Omit<Character, "id" | "user_id" | "campaign_id">;

export interface CharacterPreview {
  biography: string;
  age: number;
  strength: number;
  perception: number;
  endurance: number;
  charisma: number;
  intelligence: number;
  agility: number;
  luck: number;
}

export interface CharacterWithCampaign {
  character: Character;
  campaign: Campaign | null;
}

export async function createCharacter(data: CharacterSave): Promise<Character> {
  const response = await apiFetch(`/characters/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Failed to create character: ${response.status}`);
  return await response.json();
}

export async function createCharacterPreview(data: CharacterDescriptionCreate): Promise<CharacterPreview> {
  const response = await apiFetch(`/characters/preview`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Failed to generate preview: ${response.status}`);
  return await response.json();
}

export async function getClasses(): Promise<HeroClass[]> {
  const response = await apiFetch(`/characters/classes`);
  if (!response.ok) throw new Error(`Failed to fetch classes: ${response.status}`);
  return await response.json();
}

export async function getRaces(): Promise<Race[]> {
  const response = await apiFetch(`/characters/races`);
  if (!response.ok) throw new Error(`Failed to fetch races: ${response.status}`);
  return await response.json();
}

export async function getCharacter(id: number): Promise<Character> {
  const response = await apiFetch(`/characters/${id}`);
  if (!response.ok) throw new Error(`Failed to fetch character: ${response.status}`);
  return await response.json();
}

export async function getCharacters(): Promise<CharacterWithCampaign[]> {
  const response = await apiFetch(`/characters/`);
  if (!response.ok) {
    throw new Error(`Failed to fetch characters: ${response.status}`);
  }
  return await response.json();
}
