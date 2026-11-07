import { apiFetch, errorDetail } from "./http";

export interface Roll {
  stat: string;
  stat_value: number;
  roll: number;
  total: number;
  difficulty: "easy" | "medium" | "hard";
  target: number;
  success: boolean;
  reason: string;
}

/** One attack in a combat round, as the server rolled it. */
export interface Attack {
  attacker: string;
  target: string;
  roll: number;
  bonus: number;
  total: number;
  defense: number;
  hit: boolean;
  crit: boolean;
  damage: number;
  target_hp: number;
  target_max_hp: number;
}

export interface FleeAttempt {
  roll: number;
  bonus: number;
  total: number;
  target: number;
  success: boolean;
}

export type CombatAction = "attack" | "defend" | "flee";

/** A combat round the server already resolved and saved. */
export interface CombatRound {
  round: number;
  action: CombatAction;
  character: string;
  attack: Attack | null;
  flee: FleeAttempt | null;
  defended: boolean;
  enemy_attacks: Attack[];
  outcome: "active" | "won" | "fled" | "lost";
}

export interface EnemyState {
  id: number;
  name: string;
  kind: string;
  hp: number;
  max_hp: number;
}

/** A fight as the server tracks it: every hit point lives on the server. */
export interface EncounterState {
  id: number;
  status: "active" | "won" | "fled" | "lost";
  round: number;
  enemies: EnemyState[];
  player: { hp: number; max_hp: number; defense: number; dead: boolean };
}

export type TurnStreamEvent =
  | { type: "thinking" }
  | { type: "roll"; roll: Roll }
  | { type: "round"; round: CombatRound }
  | { type: "combat"; encounter: EncounterState }
  | { type: "text"; text: string }
  | { type: "done"; messageId: number }
  | { type: "error"; detail: string };

function toEvent(name: string, data: string): TurnStreamEvent | null {
  const payload = data ? JSON.parse(data) : {};
  switch (name) {
    case "thinking":
      return { type: "thinking" };
    case "roll":
      return { type: "roll", roll: payload as Roll };
    case "round":
      return { type: "round", round: payload as CombatRound };
    case "combat":
      return { type: "combat", encounter: payload as EncounterState };
    case "text":
      return { type: "text", text: payload.text };
    case "done":
      return { type: "done", messageId: payload.message_id };
    case "error":
      return { type: "error", detail: payload.detail };
    default:
      return null;
  }
}

/** Parses complete `event:`/`data:` blocks from `buffer`; `rest` is the unfinished tail. */
export function splitSseEvents(buffer: string): { events: TurnStreamEvent[]; rest: string } {
  const blocks = buffer.split("\n\n");
  const rest = blocks.pop() ?? "";
  const events: TurnStreamEvent[] = [];
  for (const block of blocks) {
    let name = "";
    const data: string[] = [];
    for (const line of block.split("\n")) {
      if (line.startsWith("event:")) name = line.slice(6).trim();
      else if (line.startsWith("data:")) data.push(line.slice(5).trim());
    }
    const event = toEvent(name, data.join("\n"));
    if (event) events.push(event);
  }
  return { events, rest };
}

async function turnError(response: Response): Promise<string> {
  return (await errorDetail(response)) ?? `Request failed (${response.status})`;
}

async function* readStream(response: Response): AsyncGenerator<TurnStreamEvent> {
  if (!response.ok || !response.body) {
    yield { type: "error", detail: await turnError(response) };
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let finished = false;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const { events, rest } = splitSseEvents(buffer);
    buffer = rest;
    for (const event of events) {
      if (event.type === "done" || event.type === "error") finished = true;
      yield event;
    }
  }
  // A stream that closes without done/error was cut off; the turn wasn't saved.
  if (!finished) yield { type: "error", detail: "Connection lost before the turn finished" };
}

export async function* streamTurn(characterId: number, message: string): AsyncGenerator<TurnStreamEvent> {
  const response = await apiFetch(`/characters/${characterId}/turns/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });
  yield* readStream(response);
}

/** Play a combat button. The server rolls and saves the round before narrating it. */
export async function* streamCombatRound(
  characterId: number,
  action: CombatAction,
  targetId?: number | null,
): AsyncGenerator<TurnStreamEvent> {
  const response = await apiFetch(`/characters/${characterId}/combat/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, target_id: targetId ?? null }),
  });
  yield* readStream(response);
}
