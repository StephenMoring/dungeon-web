import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Attack, CombatRound } from "@/app/api/turn-stream";
import { RoundCard, roundLines } from "./round-card";

const swing = (overrides: Partial<Attack> = {}): Attack => ({
  attacker: "Wren",
  target: "Goblin 1",
  roll: 12,
  bonus: 7,
  total: 19,
  defense: 11,
  hit: true,
  crit: false,
  damage: 5,
  target_hp: 2,
  target_max_hp: 7,
  ...overrides,
});

const round = (overrides: Partial<CombatRound> = {}): CombatRound => ({
  round: 3,
  action: "attack",
  character: "Wren",
  attack: swing(),
  flee: null,
  defended: false,
  enemy_attacks: [],
  outcome: "active",
  ...overrides,
});

describe("roundLines", () => {
  it("shows the player's attack with its dice and damage", () => {
    expect(roundLines(round())).toEqual(["Attack Goblin 1 · 12 + 7 = 19 vs 11 · Hit · 5 damage"]);
  });

  it("marks critical hits and kills", () => {
    const lines = roundLines(round({ attack: swing({ roll: 20, total: 27, crit: true, damage: 11, target_hp: 0 }), outcome: "won" }));
    expect(lines).toEqual(["Attack Goblin 1 · 20 + 7 = 27 vs 11 · Critical hit · 11 damage · Goblin 1 falls", "Victory"]);
  });

  it("lists every enemy attack after the player's action", () => {
    const lines = roundLines(
      round({
        attack: null,
        action: "defend",
        defended: true,
        enemy_attacks: [
          swing({ attacker: "Goblin 2", target: "Wren", roll: 4, bonus: 3, total: 7, defense: 17, hit: false, damage: 0, target_hp: 13 }),
        ],
      }),
    );
    expect(lines).toEqual(["Defend · +4 defense this round", "Goblin 2 attacks · 4 + 3 = 7 vs 17 · Miss"]);
  });

  it("shows an escape attempt", () => {
    const lines = roundLines(
      round({ attack: null, action: "flee", flee: { roll: 15, bonus: 4, total: 19, target: 14, success: true }, outcome: "fled" }),
    );
    expect(lines).toEqual(["Escape · 15 + 4 = 19 vs 14 · Got away", "Escaped"]);
  });

  it("announces the character's death", () => {
    const lines = roundLines(round({ outcome: "lost" }));
    expect(lines[lines.length - 1]).toBe("Wren has fallen");
  });
});

describe("RoundCard", () => {
  it("shows the settled round straight away when not animating", () => {
    render(<RoundCard round={round()} animate={false} />);
    expect(screen.getByRole("status", { name: /Round 3: Attack Goblin 1/ })).toBeInTheDocument();
    expect(screen.getByText("Attack Goblin 1 · 12 + 7 = 19 vs 11 · Hit · 5 damage")).toBeInTheDocument();
  });
});
