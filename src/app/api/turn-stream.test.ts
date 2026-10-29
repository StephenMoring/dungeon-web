import { afterEach, describe, expect, it, vi } from "vitest";
import { splitSseEvents, streamTurn, type TurnStreamEvent } from "./turn-stream";

const ROLL = {
  stat: "agility",
  stat_value: 6,
  roll: 7,
  total: 13,
  difficulty: "hard",
  target: 20,
  success: false,
  reason: "sneak",
};

function sse(event: string, data: unknown): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

async function collect(gen: AsyncGenerator<TurnStreamEvent>): Promise<TurnStreamEvent[]> {
  const events: TurnStreamEvent[] = [];
  for await (const event of gen) events.push(event);
  return events;
}

describe("splitSseEvents", () => {
  it("parses multiple events in one chunk", () => {
    const { events, rest } = splitSseEvents(sse("thinking", {}) + sse("text", { text: "Hi" }));

    expect(events).toEqual([{ type: "thinking" }, { type: "text", text: "Hi" }]);
    expect(rest).toBe("");
  });

  it("parses an event split across chunks", () => {
    const full = sse("roll", ROLL);
    const first = splitSseEvents(full.slice(0, 20));

    expect(first.events).toEqual([]);
    expect(first.rest).not.toBe("");

    const second = splitSseEvents(first.rest + full.slice(20));
    expect(second.events).toHaveLength(1);
    const [event] = second.events;
    expect(event.type).toBe("roll");
    expect(event.type === "roll" && event.roll.total).toBe(13);
  });

  it("maps done and error payloads", () => {
    const { events } = splitSseEvents(sse("done", { message_id: 5 }) + sse("error", { detail: "boom" }));

    expect(events).toEqual([
      { type: "done", messageId: 5 },
      { type: "error", detail: "boom" },
    ]);
  });
});

describe("streamTurn", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("yields an error event for a non-OK response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.resolve(new Response(JSON.stringify({ detail: "Forbidden" }), { status: 403 }))),
    );

    expect(await collect(streamTurn(1, "hi"))).toEqual([{ type: "error", detail: "Forbidden" }]);
  });

  it("streams events from the response body", async () => {
    const payload = sse("thinking", {}) + sse("roll", ROLL) + sse("done", { message_id: 9 });
    const cut = payload.indexOf("data: {\"stat\"") + 10;
    const encoder = new TextEncoder();
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(encoder.encode(payload.slice(0, cut)));
        controller.enqueue(encoder.encode(payload.slice(cut)));
        controller.close();
      },
    });
    const fetchMock = vi.fn(() => Promise.resolve(new Response(body, { status: 200 })));
    vi.stubGlobal("fetch", fetchMock);

    const events = await collect(streamTurn(3, "I sneak"));

    expect(events.map((e) => e.type)).toEqual(["thinking", "roll", "done"]);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/characters/3/turns/stream",
      expect.objectContaining({ method: "POST", body: JSON.stringify({ message: "I sneak" }) }),
    );
  });
});
