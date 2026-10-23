import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { Campaign } from "./index";

vi.mock("@/app/api/campaigns", () => ({
  getCampaigns: () => Promise.reject(new Error("campaigns down")),
  getCampaignCharacterId: () => Promise.reject(new Error("no character")),
}));

describe("Campaign play", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn(() => Promise.resolve(new Response("[]"))));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("still plays when the campaigns request fails", async () => {
    render(
      <MemoryRouter initialEntries={["/adventure/99"]}>
        <Routes>
          <Route path="/adventure/:id" element={<Campaign />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByRole("heading", { level: 1, name: "Campaign #99" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Your action" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Act" })).toBeInTheDocument();
  });

  it("announces new story messages politely", async () => {
    render(
      <MemoryRouter initialEntries={["/adventure/99"]}>
        <Routes>
          <Route path="/adventure/:id" element={<Campaign />} />
        </Routes>
      </MemoryRouter>,
    );

    const log = await screen.findByRole("log");
    expect(log).toHaveAttribute("aria-live", "polite");
  });
});
