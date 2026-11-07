import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { EncounterState } from "@/app/api/turn-stream";
import { CombatActions } from "./combat-actions";

export const FIGHT: EncounterState = {
  id: 1,
  status: "active",
  round: 1,
  enemies: [
    { id: 11, name: "Goblin 1", kind: "goblin", hp: 0, max_hp: 7 },
    { id: 12, name: "Goblin 2", kind: "goblin", hp: 4, max_hp: 7 },
    { id: 13, name: "Grisk", kind: "bandit_captain", hp: 24, max_hp: 24 },
  ],
  player: { hp: 13, max_hp: 20, defense: 13, dead: false },
};

describe("CombatActions", () => {
  it("targets the first enemy still standing", () => {
    render(<CombatActions encounter={FIGHT} disabled={false} onAction={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Attack Goblin 2" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /Goblin 2/ })).toHaveAttribute("aria-checked", "true");
  });

  it("can't target a fallen enemy", () => {
    render(<CombatActions encounter={FIGHT} disabled={false} onAction={vi.fn()} />);
    expect(screen.getByRole("radio", { name: /Goblin 1/ })).toBeDisabled();
  });

  it("shows each standing enemy's health", () => {
    render(<CombatActions encounter={FIGHT} disabled={false} onAction={vi.fn()} />);
    expect(screen.getByRole("meter", { name: "Grisk" })).toHaveAttribute("aria-valuenow", "24");
  });

  it("attacks the chosen target", async () => {
    const onAction = vi.fn();
    const user = userEvent.setup();
    render(<CombatActions encounter={FIGHT} disabled={false} onAction={onAction} />);

    await user.click(screen.getByRole("radio", { name: /Grisk/ }));
    await user.click(screen.getByRole("button", { name: "Attack Grisk" }));

    expect(onAction).toHaveBeenCalledWith("attack", 13);
  });

  it("defends and flees without a target", async () => {
    const onAction = vi.fn();
    const user = userEvent.setup();
    render(<CombatActions encounter={FIGHT} disabled={false} onAction={onAction} />);

    await user.click(screen.getByRole("button", { name: "Defend" }));
    await user.click(screen.getByRole("button", { name: "Flee" }));

    expect(onAction.mock.calls).toEqual([
      ["defend", null],
      ["flee", null],
    ]);
  });

  it("locks the buttons while a round plays", () => {
    render(<CombatActions encounter={FIGHT} disabled onAction={vi.fn()} />);
    for (const name of ["Attack Goblin 2", "Defend", "Flee"]) expect(screen.getByRole("button", { name })).toBeDisabled();
  });

  it("keeps the player's own health in view", () => {
    render(<CombatActions encounter={FIGHT} disabled={false} onAction={vi.fn()} />);
    expect(screen.getByRole("meter", { name: "You" })).toHaveAttribute("aria-valuenow", "13");
  });
});
