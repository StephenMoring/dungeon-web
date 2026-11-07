import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import type { Character } from "@/app/api/characters";
import type { CombatRound, EncounterState, TurnStreamEvent } from "@/app/api/turn-stream";
import { ChatInterface } from "./chat-interface";
import { FIGHT } from "./combat-actions.test";

const streams = vi.hoisted(() => ({ streamTurn: vi.fn(), streamCombatRound: vi.fn() }));
const combatApi = vi.hoisted(() => ({ startRest: vi.fn(), finishRest: vi.fn(), getEncounter: vi.fn() }));
vi.mock("@/app/api/turn-stream", () => streams);
vi.mock("@/app/api/combat", () => combatApi);

// Stand-in cards: settle only when clicked, so tests control the dice.
vi.mock("./round-card", () => ({
  RoundCard: ({ onSettled }: { onSettled?: () => void }) => (
    <button type="button" onClick={() => onSettled?.()}>
      Settle round
    </button>
  ),
}));
vi.mock("./rest-overlay", () => ({
  RestOverlay: ({ onRested }: { onRested: (c: Character) => void }) => (
    <div role="dialog" aria-label="Resting by the fire">
      <button type="button" onClick={() => onRested({ ...WREN, current_hp: 20 })}>
        Fire burns out
      </button>
    </div>
  ),
}));

const WREN: Character = {
  id: 1,
  name: "Wren",
  hero_class: "Rogue",
  age: 24,
  biography: "b",
  description: "d",
  campaign_id: 1,
  user_id: 1,
  strength: 4,
  perception: 6,
  endurance: 5,
  charisma: 5,
  intelligence: 5,
  agility: 8,
  luck: 5,
  max_hp: 20,
  current_hp: 13,
};

const ROUND: CombatRound = {
  round: 2,
  action: "attack",
  character: "Wren",
  attack: null,
  flee: null,
  defended: false,
  enemy_attacks: [],
  outcome: "active",
};
const AFTER: EncounterState = { ...FIGHT, round: 2, player: { ...FIGHT.player, hp: 6 } };

function script(...events: TurnStreamEvent[]) {
  return async function* () {
    for (const event of events) yield event;
  };
}

function renderChat(props: Partial<React.ComponentProps<typeof ChatInterface>> = {}) {
  const onEncounter = vi.fn();
  const onCharacter = vi.fn();
  render(
    <MemoryRouter>
      <ChatInterface
        characterId={1}
        openingMessage="Goblins!"
        character={WREN}
        encounter={null}
        onEncounter={onEncounter}
        onCharacter={onCharacter}
        {...props}
      />
    </MemoryRouter>,
  );
  return { onEncounter, onCharacter };
}

describe("ChatInterface in a fight", () => {
  beforeEach(() => {
    streams.streamTurn.mockReset();
    streams.streamCombatRound.mockReset();
    combatApi.startRest.mockReset();
  });

  it("swaps the action box for combat buttons", () => {
    renderChat({ encounter: FIGHT });
    expect(screen.queryByRole("textbox", { name: "Your action" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Attack Goblin 2" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Rest" })).not.toBeInTheDocument();
  });

  it("plays the round and holds hit points until the dice settle", async () => {
    streams.streamCombatRound.mockImplementation(
      script({ type: "round", round: ROUND }, { type: "combat", encounter: AFTER }, { type: "text", text: "Steel rings." }, { type: "done", messageId: 5 }),
    );
    const { onEncounter } = renderChat({ encounter: FIGHT });
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Attack Goblin 2" }));

    expect(streams.streamCombatRound).toHaveBeenCalledWith(1, "attack", 12);
    expect(screen.getByText("I attack Goblin 2.")).toBeInTheDocument();
    await screen.findByRole("button", { name: "Settle round" });
    expect(onEncounter).not.toHaveBeenCalled();
    expect(screen.queryByText("Steel rings.")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Settle round" }));

    expect(onEncounter).toHaveBeenCalledWith(AFTER);
    expect(await screen.findByText("Steel rings.")).toBeInTheDocument();
  });

  it("still applies the round when the narration fails", async () => {
    streams.streamCombatRound.mockImplementation(
      script(
        { type: "round", round: ROUND },
        { type: "combat", encounter: AFTER },
        { type: "error", detail: "The Dungeon Master lost the thread, but the round stands." },
      ),
    );
    const { onEncounter } = renderChat({ encounter: FIGHT });
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Defend" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("the round stands");
    expect(onEncounter).toHaveBeenCalledWith(AFTER);
  });

  it("reports a fight the DM starts during a turn", async () => {
    streams.streamTurn.mockImplementation(
      script({ type: "text", text: "Three goblins." }, { type: "combat", encounter: FIGHT }, { type: "done", messageId: 3 }),
    );
    const { onEncounter } = renderChat();
    const user = userEvent.setup();

    await user.type(screen.getByRole("textbox", { name: "Your action" }), "I attack");
    await user.click(screen.getByRole("button", { name: "Act" }));

    await screen.findByText("Three goblins.");
    expect(onEncounter).toHaveBeenCalledWith(FIGHT);
  });
});

describe("ChatInterface resting", () => {
  beforeEach(() => {
    combatApi.startRest.mockReset();
  });

  it("offers rest only when wounded", () => {
    renderChat({ character: { ...WREN, current_hp: 20 } });
    expect(screen.queryByRole("button", { name: "Rest" })).not.toBeInTheDocument();
  });

  it("rests by the fire, then reports the healed character", async () => {
    combatApi.startRest.mockResolvedValue({ started_at: "", ready_at: "", seconds: 20, seconds_left: 20 });
    const { onCharacter } = renderChat();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Rest" }));
    expect(combatApi.startRest).toHaveBeenCalledWith(1);
    await user.click(await screen.findByRole("button", { name: "Fire burns out" }));

    expect(onCharacter).toHaveBeenCalledWith(expect.objectContaining({ current_hp: 20 }));
    expect(screen.getByText("You rest by the fire. Health restored to 20 / 20.")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("picks up a rest already under way", async () => {
    combatApi.startRest.mockResolvedValue({ started_at: "", ready_at: "", seconds: 20, seconds_left: 8 });
    renderChat({ character: { ...WREN, rest_started_at: "2026-11-07T10:00:00Z" } });

    expect(await screen.findByRole("dialog", { name: "Resting by the fire" })).toBeInTheDocument();
  });

  it("shows why the camp couldn't be made", async () => {
    combatApi.startRest.mockRejectedValue(new Error("You can't rest in the middle of a fight."));
    renderChat();
    const user = userEvent.setup();

    await user.click(screen.getByRole("button", { name: "Rest" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("You can't rest in the middle of a fight.");
  });
});

describe("ChatInterface after death", () => {
  it("ends the story", () => {
    renderChat({ character: { ...WREN, current_hp: 0, died_at: "2026-11-07T10:00:00Z" }, encounter: FIGHT });
    expect(screen.getByText(/has died\. Their story is over\./)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to your heroes" })).toHaveAttribute("href", "/dashboard");
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Attack/ })).not.toBeInTheDocument();
  });
});
