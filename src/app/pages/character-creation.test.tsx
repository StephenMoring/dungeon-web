import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { CharacterCreation } from "./character-creation";

vi.mock("../api/characters", () => ({
  getClasses: () => Promise.resolve([{ class_name: "Ranger" }, { class_name: "Wizard" }]),
  getRaces: () => Promise.resolve([{ race: "Elf" }]),
  createCharacterPreview: vi.fn(),
  createCharacter: vi.fn(),
}));

vi.mock("../context/auth-context", () => ({
  useAuth: () => ({ user: { id: "1" } }),
}));

describe("CharacterCreation chips", () => {
  afterEach(() => vi.restoreAllMocks());

  it("marks only the chosen class chip as pressed", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <CharacterCreation />
      </MemoryRouter>,
    );

    const ranger = await screen.findByRole("button", { name: "Ranger" });
    const wizard = screen.getByRole("button", { name: "Wizard" });
    expect(ranger).toHaveAttribute("aria-pressed", "false");

    await user.click(ranger);
    expect(ranger).toHaveAttribute("aria-pressed", "true");

    await user.click(wizard);
    expect(wizard).toHaveAttribute("aria-pressed", "true");
    expect(ranger).toHaveAttribute("aria-pressed", "false");
  });
});
