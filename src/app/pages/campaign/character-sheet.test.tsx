import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CharacterSheet, type CharacterData } from "./character-sheet";

const CHARACTER: CharacterData = {
  name: "Aldric",
  class: "Fighter",
  level: 3,
  race: "Human",
  background: "Soldier",
  hp: { current: 8, max: 8 },
  stats: { strength: 16, dexterity: 8, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10 },
  skills: [],
  equipment: [],
};

describe("CharacterSheet", () => {
  it("labels hit points remaining as Health", () => {
    render(<CharacterSheet character={CHARACTER} onUpdate={() => {}} />);
    expect(screen.getByRole("meter", { name: "Health" })).toHaveAttribute("aria-valuenow", "8");
    expect(screen.queryByText("Wounds")).toBeNull();
  });

  it("shows each ability's modifier beside its score", () => {
    render(<CharacterSheet character={CHARACTER} onUpdate={() => {}} />);
    expect(screen.getByText("+3")).toBeInTheDocument();
    expect(screen.getByText("−1")).toBeInTheDocument();
    expect(screen.getAllByText("+0")).toHaveLength(4);
  });
});
