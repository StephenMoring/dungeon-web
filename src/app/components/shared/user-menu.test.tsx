import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { AuthContext } from "../../context/auth-context";
import { UserMenu } from "./user-menu";

const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router")>();
  return { ...actual, useNavigate: () => mockNavigate };
});

function makeAuth(overrides: Partial<{ avatar: string | null; username: string }> = {}) {
  const logout = vi.fn();
  const auth = {
    user: { id: "42", username: "Steph", avatar: null, email: null, ...overrides },
    isAuthenticated: true,
    login: () => {},
    logout,
  };
  return { auth, logout };
}

function renderMenu(auth: ReturnType<typeof makeAuth>["auth"]) {
  return render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter>
        <UserMenu />
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

beforeEach(() => {
  mockNavigate.mockReset();
});

describe("UserMenu", () => {
  it("shows initials fallback when avatar is null", () => {
    const { auth } = makeAuth({ avatar: null, username: "Steph" });
    renderMenu(auth);
    expect(screen.getByText("S")).toBeInTheDocument();
  });

  it("renders an img when avatar is non-null", () => {
    const { auth } = makeAuth({ avatar: "abc123" });
    renderMenu(auth);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "https://cdn.discordapp.com/avatars/42/abc123.png");
    expect(img).toHaveAttribute("alt", "Steph");
  });

  it("falls back to initials when avatar image errors", async () => {
    const { auth } = makeAuth({ avatar: "abc123", username: "Steph" });
    renderMenu(auth);
    const img = screen.getByRole("img");
    await act(async () => {
      img.dispatchEvent(new Event("error"));
    });
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText("S")).toBeInTheDocument();
  });

  it("calls logout and navigates to / when Logout is clicked", async () => {
    const { auth, logout } = makeAuth();
    renderMenu(auth);
    // Open dropdown — Radix DropdownMenu listens to pointerdown, not click
    const trigger = screen.getByRole("button", { name: "Open user menu" });
    await act(async () => {
      fireEvent.pointerDown(trigger, { button: 0, ctrlKey: false });
    });
    await act(async () => {
      fireEvent.click(screen.getByText("Logout"));
    });
    expect(logout).toHaveBeenCalledOnce();
    expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
  });

  it("renders nothing when user is null", () => {
    const auth = { user: null, isAuthenticated: false, login: () => {}, logout: () => {} };
    const { container } = render(
      <AuthContext.Provider value={auth}>
        <MemoryRouter><UserMenu /></MemoryRouter>
      </AuthContext.Provider>
    );
    expect(container.firstChild).toBeNull();
  });
});
