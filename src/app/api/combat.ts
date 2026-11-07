import type { Character } from "./characters";
import { apiFetch, errorDetail } from "./http";
import type { EncounterState } from "./turn-stream";

/** A rest the server is timing: it heals only once `seconds_left` reaches 0. */
export interface RestState {
  started_at: string;
  ready_at: string;
  seconds: number;
  seconds_left: number;
}

async function failed(response: Response, fallback: string): Promise<Error> {
  return new Error((await errorDetail(response)) ?? `${fallback}: ${response.status}`);
}

/** The character's active fight, or null. */
export async function getEncounter(characterId: number): Promise<EncounterState | null> {
  const response = await apiFetch(`/characters/${characterId}/encounter`);
  if (!response.ok) throw await failed(response, "Failed to load the fight");
  return await response.json();
}

/** Start resting, or pick up a rest already under way (e.g. after a reload). */
export async function startRest(characterId: number): Promise<RestState> {
  const response = await apiFetch(`/characters/${characterId}/rest`, { method: "POST" });
  if (!response.ok) throw await failed(response, "Couldn't make camp");
  return await response.json();
}

/** Heal to full; the server refuses (409) until the rest has lasted long enough. */
export async function finishRest(characterId: number): Promise<Character> {
  const response = await apiFetch(`/characters/${characterId}/rest/finish`, { method: "POST" });
  if (!response.ok) throw await failed(response, "Couldn't finish resting");
  return await response.json();
}
