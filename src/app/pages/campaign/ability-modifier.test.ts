import { describe, expect, it } from "vitest";
import { abilityModifier, formatModifier } from "./ability-modifier";

describe("ability modifiers", () => {
  it("floors (score - 10) / 2", () => {
    expect(abilityModifier(8)).toBe(-1);
    expect(abilityModifier(9)).toBe(-1);
    expect(abilityModifier(10)).toBe(0);
    expect(abilityModifier(16)).toBe(3);
  });

  it("always shows the sign, with a true minus", () => {
    expect(formatModifier(8)).toBe("−1");
    expect(formatModifier(10)).toBe("+0");
    expect(formatModifier(16)).toBe("+3");
  });
});
