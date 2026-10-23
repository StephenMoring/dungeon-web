import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { CampaignList } from "./campaign-list";

const getCampaigns = vi.fn();

vi.mock("@/app/api/campaigns", () => ({
  getCampaigns: () => getCampaigns(),
}));

function renderList() {
  return render(
    <MemoryRouter initialEntries={["/campaigns"]}>
      <CampaignList />
    </MemoryRouter>,
  );
}

describe("Campaign list", () => {
  beforeEach(() => {
    getCampaigns.mockReset();
  });

  it("claims no count and no empty state while loading", () => {
    getCampaigns.mockReturnValue(new Promise(() => {}));
    renderList();

    expect(screen.queryByText("0 campaigns")).toBeNull();
    expect(screen.queryByText(/No campaigns yet/)).toBeNull();
  });

  it("shows the error line when the campaigns request fails, and retries", async () => {
    getCampaigns.mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce([]);
    renderList();

    expect(await screen.findByText("Couldn't reach the Dungeon Master. Try again.")).toBeInTheDocument();
    expect(screen.queryByText(/No campaigns yet/)).toBeNull();

    await userEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(await screen.findByText(/No campaigns yet/)).toBeInTheDocument();
  });
});
