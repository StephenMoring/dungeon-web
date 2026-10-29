import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Roll, TurnStreamEvent } from "@/app/api/turn-stream";
import { ChatInterface } from "./chat-interface";

const streamTurn = vi.hoisted(() => vi.fn());

vi.mock("@/app/api/turn-stream", () => ({ streamTurn }));

// Stand-in card: settles only when its button is clicked, so tests control the dice.
vi.mock("./roll-card", () => ({
  RollCard: ({ onSettled }: { onSettled?: () => void }) => (
    <button type="button" onClick={() => onSettled?.()}>
      Settle dice
    </button>
  ),
}));

const ROLL: Roll = {
  stat: "agility",
  stat_value: 6,
  roll: 7,
  total: 13,
  difficulty: "hard",
  target: 20,
  success: false,
  reason: "sneak",
};

function script(...events: TurnStreamEvent[]) {
  return async function* () {
    for (const event of events) yield event;
  };
}

async function send(text: string) {
  const user = userEvent.setup();
  await user.type(screen.getByRole("textbox", { name: "Your action" }), text);
  await user.click(screen.getByRole("button", { name: "Act" }));
  return user;
}

describe("ChatInterface turns", () => {
  beforeEach(() => {
    streamTurn.mockReset();
    render(<ChatInterface characterId={1} openingMessage="The gate looms." />);
  });

  it("renders the roll card before the narration", async () => {
    streamTurn.mockImplementation(
      script({ type: "thinking" }, { type: "roll", roll: ROLL }, { type: "text", text: "They spot you." }, { type: "done", messageId: 9 }),
    );
    const user = await send("I sneak");

    await user.click(await screen.findByRole("button", { name: "Settle dice" }));

    const card = screen.getByRole("button", { name: "Settle dice" });
    const narration = await screen.findByText("They spot you.");
    expect(card.compareDocumentPosition(narration) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("holds narration until the dice settle", async () => {
    streamTurn.mockImplementation(
      script({ type: "roll", roll: ROLL }, { type: "text", text: "They spot you." }, { type: "done", messageId: 9 }),
    );
    const user = await send("I sneak");

    const settle = await screen.findByRole("button", { name: "Settle dice" });
    expect(screen.queryByText("They spot you.")).not.toBeInTheDocument();

    await user.click(settle);
    expect(await screen.findByText("They spot you.")).toBeInTheDocument();
  });

  it("keeps text that arrived before the roll visible", async () => {
    streamTurn.mockImplementation(
      script(
        { type: "text", text: "You creep. " },
        { type: "roll", roll: ROLL },
        { type: "text", text: "Caught." },
        { type: "done", messageId: 9 },
      ),
    );
    await send("I sneak");

    await screen.findByRole("button", { name: "Settle dice" });
    expect(screen.getByText("You creep.")).toBeInTheDocument();
    expect(screen.queryByText(/Caught\./)).not.toBeInTheDocument();
  });

  it("shows an error and restores the input", async () => {
    streamTurn.mockImplementation(script({ type: "roll", roll: ROLL }, { type: "error", detail: "boom" }));
    await send("I sneak");

    expect(await screen.findByText("boom")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Your action" })).toHaveValue("I sneak");
  });

  it("disables sending while a turn streams", async () => {
    streamTurn.mockImplementation(async function* () {
      yield { type: "thinking" } as TurnStreamEvent;
      await new Promise(() => {});
    });
    const user = await send("I sneak");

    const act = screen.getByRole("button", { name: "Act" });
    const box = screen.getByRole("textbox", { name: "Your action" });
    expect(act).toBeDisabled();
    expect(box).toHaveAttribute("aria-disabled", "true");
    await user.click(act);
    await user.type(box, "{Enter}");
    expect(streamTurn).toHaveBeenCalledTimes(1);
  });

  it("keeps focus in the input while a turn streams", async () => {
    streamTurn.mockImplementation(async function* () {
      yield { type: "thinking" } as TurnStreamEvent;
      await new Promise(() => {});
    });
    const user = userEvent.setup();
    const box = screen.getByRole("textbox", { name: "Your action" });

    await user.type(box, "I sneak{Enter}");

    expect(streamTurn).toHaveBeenCalledTimes(1);
    expect(box).not.toBeDisabled();
    expect(box).toHaveFocus();
  });

  it("drops held narration when the turn fails", async () => {
    streamTurn.mockImplementation(
      script({ type: "roll", roll: ROLL }, { type: "text", text: "They spot you." }, { type: "error", detail: "boom" }),
    );
    const user = await send("I sneak");

    await screen.findByText("boom");
    await user.click(screen.getByRole("button", { name: "Settle dice" }));

    expect(screen.queryByText("They spot you.")).not.toBeInTheDocument();
  });

  it("no longer renders manual dice buttons", () => {
    expect(screen.queryByRole("button", { name: /Roll d20/ })).not.toBeInTheDocument();
  });
});
