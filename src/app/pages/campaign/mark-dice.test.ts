import { describe, expect, it } from "vitest";
import { markDice } from "./mark-dice";

describe("markDice", () => {
  it("marks the result that follows a roll call", () => {
    expect(markDice("Roll for Perception. 7 The courtyard is dark.")).toBe(
      "Roll for Perception. [7](#die) The courtyard is dark.",
    );
  });

  it("marks a rolled result", () => {
    expect(markDice("You rolled a 14! Success!")).toBe("You rolled a [14](#die)! Success!");
  });

  it("leaves other numbers alone", () => {
    const text = "Roll for initiative! (1d20 + Dexterity modifier). Nine days, 50 gold pieces.";
    expect(markDice(text)).toBe(text);
  });
});
