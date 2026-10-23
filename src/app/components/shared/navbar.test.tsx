import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router";
import { AuthContext } from "../../context/auth-context";
import { Navbar } from "./navbar";

const mockAuth = {
  user: { id: "1", username: "Steph", avatar: null, email: null },
  isAuthenticated: true,
  login: () => {},
  logout: () => {},
};

function renderAt(path: string, variant?: "solid" | "overlay") {
  return render(
    <AuthContext.Provider value={mockAuth}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="*" element={<Navbar variant={variant} />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

const LABELS = ["Dashboard", "Campaigns", "History", "Settings"];

describe("Navbar links", () => {
  it("shows all four links and marks the current one on /campaigns", () => {
    renderAt("/campaigns");
    for (const label of LABELS) {
      expect(screen.getAllByRole("link", { name: label }).length).toBeGreaterThan(0);
    }
    const active = screen.getAllByRole("link", { name: "Campaigns" })[0];
    expect(active).toHaveAttribute("aria-current", "page");
    expect(screen.getAllByRole("link", { name: "History" })[0]).not.toHaveAttribute("aria-current");
  });

  it("marks no link on /adventure/7", () => {
    const { container } = renderAt("/adventure/7");
    expect(container.querySelector("[aria-current]")).toBeNull();
  });

  it("marks no link on /character/new", () => {
    const { container } = renderAt("/character/new");
    expect(container.querySelector("[aria-current]")).toBeNull();
  });

  it("wordmark links to /dashboard", () => {
    renderAt("/history");
    expect(screen.getByRole("link", { name: "Dungeon" })).toHaveAttribute("href", "/dashboard");
  });

  it("carries data-variant", () => {
    const { container, unmount } = renderAt("/dashboard", "overlay");
    expect(container.firstElementChild).toHaveAttribute("data-variant", "overlay");
    unmount();
    const solid = renderAt("/dashboard");
    expect(solid.container.firstElementChild).toHaveAttribute("data-variant", "solid");
  });

  it("opens the phone menu with the four links and closes on Escape", async () => {
    const user = userEvent.setup();
    renderAt("/history");
    await user.click(screen.getByRole("button", { name: "Menu" }));
    const dialog = await screen.findByRole("dialog");
    for (const label of LABELS) {
      expect(within(dialog).getByRole("link", { name: label })).toBeInTheDocument();
    }
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("Navbar tap targets", () => {
  it("gives the phone Menu button and the avatar trigger 44px targets", () => {
    renderAt("/campaigns");
    expect(screen.getByRole("button", { name: "Menu" })).toHaveClass("min-h-11", "min-w-11");
    expect(screen.getByRole("button", { name: "Open user menu" })).toHaveClass("size-11");
  });
});
