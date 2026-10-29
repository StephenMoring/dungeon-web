const API_URL = "/api";

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

export type TurnStreamEvent =
  | { type: "thinking" }
  | { type: "roll"; roll: Roll }
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

async function errorDetail(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { detail?: unknown };
    if (typeof body.detail === "string") return body.detail;
  } catch {
    // fall through to the generic message
  }
  return `Request failed (${response.status})`;
}

export async function* streamTurn(characterId: number, message: string): AsyncGenerator<TurnStreamEvent> {
  const response = await fetch(`${API_URL}/characters/${characterId}/turns/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${localStorage.getItem("dungeon_jwt")}`,
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok || !response.body) {
    yield { type: "error", detail: await errorDetail(response) };
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
