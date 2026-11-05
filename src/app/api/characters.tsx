import type { components } from "@/types/api";
import type { Campaign } from "./campaigns";
import { apiFetch, errorDetail, failureMessage } from "./http";


export type Character = components["schemas"]["Character"];
export type HeroClass = components["schemas"]["HeroClass"];
export type Race = components["schemas"]["Race"];
export type CharacterDescriptionCreate = components["schemas"]["CharacterDescriptionCreate"];

/** A generated sheet. Saving sends back only preview_token, which the server signed
 * over this exact sheet for this player; stats are never chosen by the client. */
export interface CharacterPreview {
  preview_token: string;
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

export async function createCharacter(previewToken: string): Promise<Character> {
  const response = await apiFetch(`/characters/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ preview_token: previewToken }),
  });
  if (!response.ok) {
    // e.g. "This character preview expired. Generate it again."
    throw new Error((await errorDetail(response)) ?? `Failed to create character: ${response.status}`);
  }
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
  if (!response.ok) throw new Error(await failureMessage(response, "Failed to generate preview"));
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
