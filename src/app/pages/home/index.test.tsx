import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { PREVIEW_CHARACTERS } from "@/dev/fixtures";
import { Home } from "./index";

const getCharacters = vi.fn();

vi.mock("@/app/api/characters", () => ({
  getCharacters: () => getCharacters(),
}));

vi.mock("@/app/api/campaigns", () => ({
  createCampaign: vi.fn(),
}));

function renderHome() {
  return render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <Home />
    </MemoryRouter>,
  );
}

describe("Dashboard", () => {
  beforeEach(() => getCharacters.mockReset());

  it("sends a new player with no heroes to the forge", async () => {
    getCharacters.mockResolvedValue([]);
    renderHome();

    const forgeLinks = await screen.findAllByRole("link", { name: /forge a hero/i });
    expect(forgeLinks.length).toBeGreaterThan(0);
    for (const link of forgeLinks) expect(link).toHaveAttribute("href", "/character/new");
    expect(screen.queryByText(/continue/i)).toBeNull();
    expect(screen.getByRole("heading", { level: 1, name: "The gate is already burning" })).toBeInTheDocument();
  });

  it("continues the first hero with a campaign", async () => {
    getCharacters.mockResolvedValue(PREVIEW_CHARACTERS);
    renderHome();

    const action = await screen.findByRole("link", { name: "Continue The Bell of Saint-Lazare" });
    expect(action).toHaveAttribute("href", "/adventure/7");
    expect(screen.getByText(/Pick up where Aldric of Vézelay fell/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Begin/ })).toBeInTheDocument();
  });
});
