/**
 * One written turn of the seed checkpoint "The Whispering Tomb", in the voice the Dungeon Master's
 * system prompt asks for: second person, under 100 words, a roll where the outcome is uncertain,
 * ending on a question. Static sample copy for the landing page; no API is called.
 */

export interface TurnRoll {
  stat: string;
  value: number;
}

export interface TurnReply {
  /** Prose before the roll. */
  before: string;
  roll: TurnRoll;
  /** Prose after the roll, ending on the Dungeon Master's question. */
  after: string;
}

export interface TurnAction {
  action: string;
  reply: TurnReply;
}

export const TURN_SCENE =
  "The iron doors of the Whispering Tomb hang open. The grave robbers who forced them went in four nights ago and have not come out. From somewhere below, a voice is saying your name, patiently, as if it has waited a long time for you.";

export const TURN_ACTIONS: TurnAction[] = [
  {
    action: "I step through the iron doors",
    reply: {
      before:
        "Cold air meets you on the first stair, smelling of wet stone and lamp oil. Twelve steps down, a grave robber’s lantern lies on its side, still warm.",
      roll: { stat: "Perception", value: 7 },
      after:
        "Not enough to see who dropped it, but enough to hear the voice stop the moment your boot touches the floor. Ahead, a stone lid scrapes. Do you go towards the sound, or wait for it to come to you?",
    },
  },
  {
    action: "I call back to the voice",
    reply: {
      before:
        "For a while there is nothing. Then the voice answers, close enough to feel on your neck. “You are not my son,” says the ghost of Lord Edwyn, “but you will do.” The doors swing shut behind you.",
      roll: { stat: "Charisma", value: 4 },
      after: "He does not trust you yet. What do you tell him?",
    },
  },
  {
    action: "I light a torch and wait",
    reply: {
      before:
        "You strike a light and settle on the threshold. An hour passes. The voice gives up on your name and begins, very quietly, to name the grave robbers one by one; after each name, something below goes still.",
      roll: { stat: "Endurance", value: 8 },
      after: "Your nerve holds, and so does the torch. When it says your name again, do you answer?",
    },
  },
  {
    action: "I bar the doors and leave",
    reply: {
      before: "You put your shoulder to the iron and the doors grind closed.",
      roll: { stat: "Strength", value: 3 },
      after:
        "The bar will not seat; something on the other side is leaning back. Through the gap a cold hand closes around your wrist, not hard, almost courteous. “Stay,” says the voice. What do you do?",
    },
  },
];

function normalise(text: string): string {
  return text.trim().toLowerCase();
}

/** The written reply for one of the sample actions, or null for anything the sample cannot answer. */
export function replyFor(action: string): TurnReply | null {
  const wanted = normalise(action);
  if (!wanted) return null;
  return TURN_ACTIONS.find((a) => normalise(a.action) === wanted)?.reply ?? null;
}
