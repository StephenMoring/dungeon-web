import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { Campaign } from "./index";

const campaignsApi = vi.hoisted(() => ({
  getCampaigns: vi.fn(),
  getCampaignCharacterId: vi.fn(),
}));
const charactersApi = vi.hoisted(() => ({ getCharacter: vi.fn() }));

vi.mock("@/app/api/campaigns", () => campaignsApi);
vi.mock("@/app/api/characters", () => charactersApi);
vi.mock("@/app/api/combat", () => ({ getEncounter: vi.fn().mockResolvedValue(null), startRest: vi.fn(), finishRest: vi.fn() }));

const DARIAN = {
  id: 1,
  name: "Darian Ashveil",
  hero_class: "Rogue",
  age: 31,
  biography: "Grew up picking pockets in Calrath.",
  description: "Lean and sharp-eyed.",
  campaign_id: 99,
  user_id: 1,
  strength: 4,
  perception: 8,
  endurance: 5,
  charisma: 7,
  intelligence: 6,
  agility: 9,
  luck: 7,
  max_hp: 20,
  current_hp: 20,
};

function renderAdventure() {
  render(
    <MemoryRouter initialEntries={["/adventure/99"]}>
      <Routes>
        <Route path="/adventure/:id" element={<Campaign />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("Campaign play", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(new Response("[]"))));
    campaignsApi.getCampaigns.mockRejectedValue(new Error("campaigns down"));
    campaignsApi.getCampaignCharacterId.mockRejectedValue(new Error("no character"));
    charactersApi.getCharacter.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("still plays when the campaigns request fails", async () => {
    renderAdventure();

    expect(await screen.findByRole("heading", { level: 1, name: "Campaign #99" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Your action" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Act" })).toBeInTheDocument();
  });

  it("announces new story messages politely", async () => {
    renderAdventure();

    const log = await screen.findByRole("log");
    expect(log).toHaveAttribute("aria-live", "polite");
  });

  it("shows the campaign's real character on the sheet", async () => {
    campaignsApi.getCampaignCharacterId.mockResolvedValue(1);
    charactersApi.getCharacter.mockResolvedValue(DARIAN);
    renderAdventure();

    expect(await screen.findByRole("heading", { level: 2, name: "Darian Ashveil" })).toBeInTheDocument();
    expect(charactersApi.getCharacter).toHaveBeenCalledWith(1);
    expect(screen.getByText("Darian Ashveil · Rogue")).toBeInTheDocument();
    expect(screen.queryByText("Adventurer")).toBeNull();
  });

  it("offers a retry when the character fails to load", async () => {
    campaignsApi.getCampaignCharacterId.mockResolvedValue(1);
    charactersApi.getCharacter.mockRejectedValueOnce(new Error("down")).mockResolvedValueOnce(DARIAN);
    renderAdventure();

    const retry = await screen.findByRole("button", { name: "Retry" });
    retry.click();
    expect(await screen.findByRole("heading", { level: 2, name: "Darian Ashveil" })).toBeInTheDocument();
  });
});
