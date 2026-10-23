/** Sample character for the landing page's character-sheet plate (sample content; confirm before launch). */

export type SheetPart = "name" | "health" | "stats" | "bio";

export const SAMPLE_HERO = {
  name: "Ysolde the Pale",
  kind: "Tiefling warlock, 31",
  campaign: "The Darkening North",
  health: { current: 14, max: 22 },
  stats: [
    ["Strength", 3],
    ["Perception", 8],
    ["Endurance", 5],
    ["Charisma", 7],
    ["Intelligence", 9],
    ["Agility", 6],
    ["Luck", 2],
  ] as const,
  biography:
    "Raised in the ash-wood chapels of the north, Ysolde made her bargain at fourteen and has spent every year since trying to read its terms.",
};

export interface SheetNote {
  part: SheetPart;
  name: string;
  text: string;
  side: "left" | "right";
  /** Desktop offset from the plate's top, level with the part it explains. */
  top: string;
}

export const SHEET_NOTES: SheetNote[] = [
  { part: "name", side: "right", top: "top-0", name: "Name and calling", text: "Ten classes, Warrior to Warlock, and ten races, Human to Orc." },
  { part: "health", side: "right", top: "top-[132px]", name: "Health", text: "Lost as the story hurts you, carried from scene to scene." },
  { part: "stats", side: "left", top: "top-[236px]", name: "Seven attributes", text: "Strength to Luck, each from 1 to 10. Five is an ordinary person." },
  { part: "stats", side: "right", top: "top-[300px]", name: "Weighed, not obeyed", text: "A high Agility makes the leap likely, not certain. Results come in degrees." },
  { part: "stats", side: "left", top: "top-[400px]", name: "Rolled from your words", text: "Describe your hero in a sentence and the Dungeon Master sets the numbers." },
  { part: "bio", side: "right", top: "top-[520px]", name: "A life before", text: "A biography and an age, written from your description and kept with the hero." },
];
