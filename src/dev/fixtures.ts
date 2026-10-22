import type { Campaign } from "@/app/api/campaigns";
import type { CharacterWithCampaign, HeroClass, Race } from "@/app/api/characters";
import type { components } from "@/types/api";

type MessageHistory = components["schemas"]["MessageHistory"];

export const LONG_CAMPAIGN_NAME = "The Hollow Crown of the Seven Drowned Bell-Ringers of Orrins";

export const PREVIEW_CAMPAIGNS: Campaign[] = [
  {
    id: 7,
    name: "The Bell of Saint-Lazare",
    theme: "Gothic horror",
    description: "A plague-struck abbey whose bell has fallen silent.",
    characters: [],
    campaign_checkpoints: [],
  },
  {
    id: 9,
    name: LONG_CAMPAIGN_NAME,
    theme: "Dark fantasy",
    description: "A drowned kingdom, a cracked crown and seven bells that still toll under the water.",
    characters: [],
    campaign_checkpoints: [],
  },
];

const stats = {
  strength: 14,
  perception: 11,
  endurance: 13,
  charisma: 9,
  intelligence: 10,
  agility: 12,
  luck: 8,
};

export const PREVIEW_CHARACTERS: CharacterWithCampaign[] = [
  {
    character: {
      id: 1,
      name: "Aldric of Vézelay",
      hero_class: "Sellsword",
      biography: "A deserter from the crusade who sells his blade to whoever pays in silver.",
      description: "Scarred, weathered, quiet.",
      age: 34,
      campaign_id: 7,
      user_id: 1,
      ...stats,
    },
    campaign: PREVIEW_CAMPAIGNS[0],
  },
  {
    character: {
      id: 2,
      name: "Ysolde the Pale of the Ninth Ash-Wood",
      hero_class: "Witch",
      biography: "Raised among the ash-trees, she speaks to what the fire leaves behind.",
      description: "Pale, thin, unblinking.",
      age: 27,
      campaign_id: null,
      user_id: 1,
      ...stats,
      charisma: 15,
      intelligence: 16,
    },
    campaign: null,
  },
  {
    character: {
      id: 3,
      name: "Brother Corvin",
      hero_class: "Monk",
      biography: "A bell-ringer who lost his faith and kept the rope.",
      description: "Tall, hooded, hoarse.",
      age: 51,
      campaign_id: 9,
      user_id: 1,
      ...stats,
    },
    campaign: PREVIEW_CAMPAIGNS[1],
  },
];

const TURN_BASE = { campaign_id: 7, character_id: 1 };

export const PREVIEW_TURNS: MessageHistory[] = [
  {
    ...TURN_BASE,
    id: 1,
    role: "dm",
    content:
      "The bell of Saint-Lazare has not rung in nine days. Smoke rises from the charnel pits beyond the wall, and the gate stands open. No guard, only a dog gnawing something that was once a hand.",
    created_at: "2026-10-22T18:00:00Z",
  },
  {
    ...TURN_BASE,
    id: 2,
    role: "user",
    content: "I draw my blade and step through the gate.",
    created_at: "2026-10-22T18:01:00Z",
  },
  {
    ...TURN_BASE,
    id: 3,
    role: "dm",
    content:
      "The dog lifts its head and does not bark. Roll for Perception. 7 The courtyard is too dark to read. Somewhere above, in the tower, a single window is lit.",
    created_at: "2026-10-22T18:02:00Z",
  },
];

export const PREVIEW_CLASSES: HeroClass[] = [
  { id: 1, class_name: "Sellsword", description: "A hired blade, fed on coin and old grudges." },
  { id: 2, class_name: "Witch", description: "Speaks to what the fire leaves behind." },
  { id: 3, class_name: "Monk", description: "Keeps the hours and the faith, or one of them." },
];

export const PREVIEW_RACES: Race[] = [
  { id: 1, race: "Human", description: "Short-lived and stubborn." },
  { id: 2, race: "Dwarf", description: "Deep-delvers who remember every insult." },
  { id: 3, race: "Elf", description: "Long-lived, and sorry for it." },
];
