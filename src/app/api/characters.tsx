import type { components } from "@/types/api";
import type { Campaign } from "./campaigns";

const API_URL = "/api";

export type Character = components["schemas"]["Character"];
export type HeroClass = components["schemas"]["HeroClass"];
export type Race = components["schemas"]["Race"];
export type CharacterDescriptionCreate = components["schemas"]["CharacterDescriptionCreate"];

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

export async function createCharacter(data: Character): Promise<Character> {
  const response = await fetch(`${API_URL}/characters/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("dungeon_jwt")}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Failed to create character: ${response.status}`);
  return await response.json();
}

export async function createCharacterPreview(data: CharacterDescriptionCreate): Promise<CharacterPreview> {
  const response = await fetch(`${API_URL}/characters/preview`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("dungeon_jwt")}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error(`Failed to generate preview: ${response.status}`);
  return await response.json();
}

export async function getClasses(): Promise<HeroClass[]> {
  const response = await fetch(`${API_URL}/characters/classes`, {
    headers: { "Authorization": `Bearer ${localStorage.getItem("dungeon_jwt")}` },
  });
  if (!response.ok) throw new Error(`Failed to fetch classes: ${response.status}`);
  return await response.json();
}

export async function getRaces(): Promise<Race[]> {
  const response = await fetch(`${API_URL}/characters/races`, {
    headers: { "Authorization": `Bearer ${localStorage.getItem("dungeon_jwt")}` },
  });
  if (!response.ok) throw new Error(`Failed to fetch races: ${response.status}`);
  return await response.json();
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
