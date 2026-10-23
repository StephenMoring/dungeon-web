import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { PREVIEW_CHARACTERS } from "@/dev/fixtures";
import { AuthContext } from "@/app/context/auth-context";
import { Home } from "./index";

const getCharacters = vi.fn();

vi.mock("@/app/api/characters", () => ({
  getCharacters: () => getCharacters(),
}));

vi.mock("@/app/api/campaigns", () => ({
  createCampaign: vi.fn(),
}));

const mockAuth = {
  user: { id: "1", username: "Steph", avatar: null, email: null },
  isAuthenticated: true,
  login: () => {},
  logout: () => {},
};

function renderHome() {
  return render(
    <AuthContext.Provider value={mockAuth}>
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Home />
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe("Dashboard", () => {
  beforeEach(() => {
    getCharacters.mockReset();
  });

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

  it("shows no forge action while the heroes are still loading", () => {
    getCharacters.mockReturnValue(new Promise(() => {}));
    renderHome();

    expect(screen.getByText("Gathering your heroes…")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /forge a hero/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /forge a hero/i })).toBeNull();
    expect(screen.queryByText(/Forge a hero to begin/)).toBeNull();
  });

  it("says the Dungeon Master is unreachable and retries on request", async () => {
    getCharacters.mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce(PREVIEW_CHARACTERS);
    renderHome();

    expect(await screen.findByText("Couldn't reach the Dungeon Master. Try again.")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /forge a hero/i })).toBeNull();

    await userEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(await screen.findByRole("link", { name: "Continue The Bell of Saint-Lazare" })).toBeInTheDocument();
    expect(getCharacters).toHaveBeenCalledTimes(2);
  });
});
