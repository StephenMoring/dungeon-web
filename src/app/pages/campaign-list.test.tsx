import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { CampaignList } from "./campaign-list";

const getCampaigns = vi.fn();
const deleteCampaign = vi.fn();

vi.mock("@/app/api/campaigns", () => ({
  getCampaigns: () => getCampaigns(),
  deleteCampaign: (id: number) => deleteCampaign(id),
}));

const CAMPAIGNS = [
  { id: 1, name: "Shadows Over Calrath", theme: "Intrigue", description: "d", characters: [{}], campaign_checkpoints: [{}] },
  { id: 2, name: "The Darkening North", theme: "Horror", description: "d", characters: [{}], campaign_checkpoints: [] },
];

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
    deleteCampaign.mockReset();
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

  describe("deleting", () => {
    it("asks first, naming the campaign and what is kept", async () => {
      getCampaigns.mockResolvedValue(CAMPAIGNS);
      renderList();

      await userEvent.click(await screen.findByRole("button", { name: "Delete Shadows Over Calrath" }));

      const dialog = await screen.findByRole("alertdialog");
      expect(dialog).toHaveTextContent("Delete Shadows Over Calrath?");
      expect(dialog).toHaveTextContent(/characters are kept/);
      expect(deleteCampaign).not.toHaveBeenCalled();
    });

    it("deletes on confirm and removes the campaign from the list", async () => {
      getCampaigns.mockResolvedValue(CAMPAIGNS);
      deleteCampaign.mockResolvedValue(undefined);
      renderList();

      await userEvent.click(await screen.findByRole("button", { name: "Delete Shadows Over Calrath" }));
      await userEvent.click(await screen.findByRole("button", { name: "Delete campaign" }));

      expect(deleteCampaign).toHaveBeenCalledWith(1);
      expect(await screen.findByText("1 campaign")).toBeInTheDocument();
      expect(screen.queryByRole("heading", { name: "Shadows Over Calrath" })).toBeNull();
      expect(screen.getByRole("heading", { name: "The Darkening North" })).toBeInTheDocument();
      expect(screen.queryByRole("alertdialog")).toBeNull();
    });

    it("keeps the campaign when cancelled", async () => {
      getCampaigns.mockResolvedValue(CAMPAIGNS);
      renderList();

      await userEvent.click(await screen.findByRole("button", { name: "Delete Shadows Over Calrath" }));
      await userEvent.click(await screen.findByRole("button", { name: "Cancel" }));

      expect(deleteCampaign).not.toHaveBeenCalled();
      expect(screen.getByRole("heading", { name: "Shadows Over Calrath" })).toBeInTheDocument();
    });

    it("keeps the dialog open with an error when the delete fails", async () => {
      getCampaigns.mockResolvedValue(CAMPAIGNS);
      deleteCampaign.mockRejectedValue(new Error("offline"));
      vi.spyOn(console, "error").mockImplementation(() => {});
      renderList();

      await userEvent.click(await screen.findByRole("button", { name: "Delete Shadows Over Calrath" }));
      await userEvent.click(await screen.findByRole("button", { name: "Delete campaign" }));

      const dialog = await screen.findByRole("alertdialog");
      expect(await screen.findByText("Couldn't delete the campaign. Try again.")).toBeInTheDocument();
      expect(dialog).toBeInTheDocument();
      expect(screen.getByText("2 campaigns")).toBeInTheDocument();
    });
  });
});
