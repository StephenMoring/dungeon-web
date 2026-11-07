import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CharacterSheet } from "./character-sheet";
import type { Character } from "@/app/api/characters";

const CHARACTER: Character = {
  id: 1,
  name: "Darian Ashveil",
  hero_class: "Rogue",
  age: 31,
  biography: "Grew up picking pockets in Calrath.",
  description: "Lean and sharp-eyed.",
  campaign_id: 1,
  user_id: 1,
  strength: 4,
  perception: 8,
  endurance: 5,
  charisma: 7,
  intelligence: 6,
  agility: 9,
  luck: 7,
  max_hp: 20,
  current_hp: 13,
};

describe("CharacterSheet", () => {
  it("shows the character's name, class and age", () => {
    render(<CharacterSheet character={CHARACTER} />);
    expect(screen.getByRole("heading", { level: 2, name: "Darian Ashveil" })).toBeInTheDocument();
    expect(screen.getByText((_, el) => el?.tagName === "P" && el.textContent === "Rogue · Age 31")).toBeInTheDocument();
  });

  it("lists all seven stats with their scores", () => {
    render(<CharacterSheet character={CHARACTER} />);
    const stats = ["Strength", "Perception", "Endurance", "Charisma", "Intelligence", "Agility", "Luck"];
    for (const label of stats) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
    expect(screen.getByText("Agility").nextElementSibling).toHaveTextContent("9");
    expect(screen.getByText("Strength").nextElementSibling).toHaveTextContent("4");
  });

  it("shows a dash for a stat that has no score", () => {
    render(<CharacterSheet character={{ ...CHARACTER, luck: null }} />);
    expect(screen.getByText("Luck").nextElementSibling).toHaveTextContent("—");
  });

  it("shows the description and biography", () => {
    render(<CharacterSheet character={CHARACTER} />);
    expect(screen.getByText("Lean and sharp-eyed.")).toBeInTheDocument();
    expect(screen.getByText("Grew up picking pockets in Calrath.")).toBeInTheDocument();
  });

  it("shows health as a meter", () => {
    render(<CharacterSheet character={CHARACTER} />);
    const meter = screen.getByRole("meter", { name: "Health" });
    expect(meter).toHaveAttribute("aria-valuenow", "13");
    expect(meter).toHaveAttribute("aria-valuemax", "20");
    expect(screen.getByText("13 / 20")).toBeInTheDocument();
  });

  it("marks a dead character instead of a health bar", () => {
    render(<CharacterSheet character={{ ...CHARACTER, current_hp: 0, died_at: "2026-11-06T21:53:23Z" }} />);
    expect(screen.getByText("Dead")).toBeInTheDocument();
    expect(screen.queryByRole("meter")).not.toBeInTheDocument();
  });
});
