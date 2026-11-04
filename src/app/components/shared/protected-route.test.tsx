import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router";
import { AuthContext } from "../../context/auth-context";
import { ProtectedRoute } from "./protected-route";

// Minimal AuthContext value factory
function makeAuthCtx(isAuthenticated: boolean, status?: "loading") {
  return {
    user: isAuthenticated ? { id: "1", username: "Steph", avatar: null, email: null } : null,
    isAuthenticated,
    status: status ?? (isAuthenticated ? ("signed-in" as const) : ("signed-out" as const)),
    login: () => {},
    logout: async () => {},
  };
}

beforeEach(() => {
  sessionStorage.clear();
});

describe("ProtectedRoute", () => {
  it("renders children when authenticated", () => {
    render(
      <AuthContext.Provider value={makeAuthCtx(true)}>
        <MemoryRouter initialEntries={["/dashboard"]}>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<div>Dashboard</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("redirects to / when unauthenticated", () => {
    render(
      <AuthContext.Provider value={makeAuthCtx(false)}>
        <MemoryRouter initialEntries={["/dashboard"]}>
          <Routes>
            <Route path="/" element={<div>Landing</div>} />
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<div>Dashboard</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );
    expect(screen.getByText("Landing")).toBeInTheDocument();
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
  });

  it("saves attempted path to sessionStorage when redirecting", () => {
    render(
      <AuthContext.Provider value={makeAuthCtx(false)}>
        <MemoryRouter initialEntries={["/adventure/123"]}>
          <Routes>
            <Route path="/" element={<div>Landing</div>} />
            <Route element={<ProtectedRoute />}>
              <Route path="/adventure/:id" element={<div>Campaign</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );
    expect(sessionStorage.getItem("dungeon_redirect_after_login")).toBe("/adventure/123");
  });

  it("waits, without redirecting, while the session is being checked", () => {
    render(
      <AuthContext.Provider value={makeAuthCtx(false, "loading")}>
        <MemoryRouter initialEntries={["/dashboard"]}>
          <Routes>
            <Route path="/" element={<div>Landing</div>} />
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<div>Dashboard</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    );
    expect(screen.queryByText("Landing")).not.toBeInTheDocument();
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
    expect(sessionStorage.getItem("dungeon_redirect_after_login")).toBeNull();
  });
});
