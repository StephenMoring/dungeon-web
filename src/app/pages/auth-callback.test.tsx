import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { AuthContext } from "@/app/context/auth-context";
import { AuthCallback } from "./auth-callback";

const fetchMock = vi.fn();
const login = vi.fn();

function renderCallback(search: string) {
  window.history.replaceState(null, "", `/auth/callback${search}`);
  render(
    <AuthContext.Provider
      value={{ user: null, status: "signed-out", isAuthenticated: false, login, logout: async () => {} }}
    >
      <MemoryRouter initialEntries={[`/auth/callback${search}`]}>
        <Routes>
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/dashboard" element={<div>Dashboard</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

beforeEach(() => {
  sessionStorage.clear();
  fetchMock.mockReset();
  login.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("AuthCallback", () => {
  it("signs in when the state matches the one this browser stored", async () => {
    sessionStorage.setItem("dungeon_oauth_state", "mine");
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ user: { id: 1, username: "Wren", avatar_url: null } }), { status: 201 }),
    );

    renderCallback("?code=good-code&state=mine");

    expect(await screen.findByText("Dashboard")).toBeInTheDocument();
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ code: "good-code" });
    expect(login).toHaveBeenCalled();
  });

  it("refuses a login link this browser didn't start, without sending the code", async () => {
    sessionStorage.setItem("dungeon_oauth_state", "mine");

    renderCallback("?code=attackers-code&state=theirs");

    expect(await screen.findByRole("alert")).toHaveTextContent(/didn't start here/);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(login).not.toHaveBeenCalled();
  });

  it("refuses a login link with no state", async () => {
    renderCallback("?code=attackers-code");

    expect(await screen.findByRole("alert")).toHaveTextContent(/didn't start here/);
    await waitFor(() => expect(fetchMock).not.toHaveBeenCalled());
  });

  it("shows the server's reason when sign-in fails", async () => {
    sessionStorage.setItem("dungeon_oauth_state", "mine");
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ detail: "Couldn't reach Discord. Try again." }), { status: 502 }),
    );

    renderCallback("?code=good-code&state=mine");

    expect(await screen.findByRole("alert")).toHaveTextContent("Couldn't reach Discord. Try again.");
  });
});
