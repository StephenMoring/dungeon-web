import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router";
import { AuthContext } from "../../context/auth-context";
import { Navbar } from "./navbar";

const mockAuth = {
  user: { id: "1", username: "Steph", avatar: null, email: null },
  isAuthenticated: true,
  login: () => {},
  logout: () => {},
};

function renderAt(path: string) {
  return render(
    <AuthContext.Provider value={mockAuth}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="*" element={<Navbar />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe("Navbar breadcrumb", () => {
  it("shows only Dashboard (as plain text) on /dashboard", () => {
    renderAt("/dashboard");
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    // Should be a span, not a link
    expect(screen.queryByRole("link", { name: "Dashboard" })).not.toBeInTheDocument();
  });

  it("shows Dashboard as a link + Campaigns on /campaigns", () => {
    renderAt("/campaigns");
    expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByText("Campaigns")).toBeInTheDocument();
  });

  it("shows Dashboard as a link + History on /history", () => {
    renderAt("/history");
    expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByText("History")).toBeInTheDocument();
  });

  it("shows Dashboard as a link + Settings on /settings", () => {
    renderAt("/settings");
    expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("shows Dashboard as a link + New Character on /character/new", () => {
    renderAt("/character/new");
    expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByText("New Character")).toBeInTheDocument();
  });

  it("shows Dashboard as a link + Campaign on /adventure/:id", () => {
    renderAt("/adventure/abc123");
    expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByText("Campaign")).toBeInTheDocument();
  });

  it("shows only the icon (no breadcrumb text) on an unmatched path", () => {
    renderAt("/unknown-route");
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
    expect(screen.queryByText("Campaign")).not.toBeInTheDocument();
  });
});
