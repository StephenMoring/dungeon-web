/**
 * A selection of the twenty milestones (checkpoints) seeded in dungeon-service
 * (db/seeds/R__seed_data.sql), grouped by tone, with the character the player meets in each.
 */

export interface Milestone {
  title: string;
  who: string;
}

export interface MilestoneGroup {
  kind: string;
  rows: Milestone[];
}

export const MILESTONE_COUNT = 20;

export const MILESTONE_GROUPS: MilestoneGroup[] = [
  {
    kind: "Horror",
    rows: [
      { title: "The Whispering Tomb", who: "the ghost of Lord Edwyn" },
      { title: "Night of the Red Moon", who: "Wren, a cursed guard" },
      { title: "Bones of the Old God", who: "the Cult Archivist" },
      { title: "The Last Inn", who: "an innkeeper who knows" },
    ],
  },
  {
    kind: "Intrigue",
    rows: [
      { title: "Festival of Masks", who: "Lady Voss" },
      { title: "Crown Without a Head", who: "the queen regent" },
      { title: "A Debt of Blood", who: "Madame Vex" },
      { title: "The Merchant’s Debt", who: "Cassius Brent" },
    ],
  },
  {
    kind: "Wilds",
    rows: [
      { title: "Lair of the Scaled King", who: "Skarrix, a young dragon" },
      { title: "Siege at Thornwall Keep", who: "General Mokk" },
      { title: "The Collapsed Bridge", who: "Grak, a troll" },
      { title: "The Frostbound Pass", who: "a frost spirit" },
    ],
  },
];
