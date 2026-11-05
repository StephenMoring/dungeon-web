import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { CharacterCreation } from "./character-creation";

const api = vi.hoisted(() => ({
  createCharacterPreview: vi.fn(),
  createCharacter: vi.fn(),
}));

vi.mock("../api/characters", () => ({
  getClasses: () => Promise.resolve([{ class_name: "Ranger" }, { class_name: "Wizard" }]),
  getRaces: () => Promise.resolve([{ race: "Elf" }]),
  createCharacterPreview: api.createCharacterPreview,
  createCharacter: api.createCharacter,
}));

vi.mock("../context/auth-context", () => ({
  useAuth: () => ({ user: { id: "1" } }),
}));

const PREVIEW = {
  name: "Wren",
  hero_class: "Ranger",
  description: "A quiet tracker.",
  biography: "Raised in the deep woods.",
  age: 29,
  strength: 4,
  perception: 9,
  endurance: 6,
  charisma: 3,
  intelligence: 5,
  agility: 8,
  luck: 7,
  preview_token: "signed-by-the-server",
};

function renderPage() {
  render(
    <MemoryRouter>
      <CharacterCreation />
    </MemoryRouter>,
  );
}

async function fillAndGenerate(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Character name"), "Wren");
  await user.type(screen.getByLabelText("Description"), "A quiet tracker.");
  await user.click(await screen.findByRole("button", { name: "Ranger" }));
  await user.click(screen.getByRole("button", { name: "Elf" }));
  await user.click(screen.getByRole("button", { name: "Sage" }));
  await user.click(screen.getByRole("button", { name: /Generate/ }));
  await screen.findByText("Raised in the deep woods.");
}

describe("CharacterCreation", () => {
  beforeEach(() => {
    api.createCharacterPreview.mockReset().mockResolvedValue(PREVIEW);
    api.createCharacter.mockReset().mockResolvedValue({});
  });

  afterEach(() => vi.restoreAllMocks());

  it("marks only the chosen class chip as pressed", async () => {
    const user = userEvent.setup();
    renderPage();

    const ranger = await screen.findByRole("button", { name: "Ranger" });
    const wizard = screen.getByRole("button", { name: "Wizard" });
    expect(ranger).toHaveAttribute("aria-pressed", "false");

    await user.click(ranger);
    expect(ranger).toHaveAttribute("aria-pressed", "true");

    await user.click(wizard);
    expect(wizard).toHaveAttribute("aria-pressed", "true");
    expect(ranger).toHaveAttribute("aria-pressed", "false");
  });

  it("shows the generated stats read-only", async () => {
    const user = userEvent.setup();
    renderPage();
    await fillAndGenerate(user);

    const strength = screen.getByLabelText("strength");
    expect(strength).toHaveValue(4);
    expect(strength).toHaveAttribute("readonly");
  });

  it("saves with only the server's preview token", async () => {
    const user = userEvent.setup();
    renderPage();
    await fillAndGenerate(user);

    await user.click(screen.getByRole("button", { name: "Create Character" }));

    expect(api.createCharacter).toHaveBeenCalledWith("signed-by-the-server");
  });

  it("asks to generate again after the details change", async () => {
    const user = userEvent.setup();
    renderPage();
    await fillAndGenerate(user);

    await user.type(screen.getByLabelText("Description"), " Hates crowds.");

    expect(screen.getByText(/You changed the details/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create Character" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: /Generate/ }));
    await screen.findByRole("button", { name: "Create Character" });
    expect(screen.queryByText(/You changed the details/)).toBeNull();
    expect(screen.getByRole("button", { name: "Create Character" })).toBeEnabled();
  });
});
