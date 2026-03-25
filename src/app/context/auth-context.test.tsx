import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "./auth-context";

// Helper: component that renders auth state
function AuthDisplay() {
  const { user, isAuthenticated } = useAuth();
  return (
    <div>
      <span data-testid="authenticated">{String(isAuthenticated)}</span>
      <span data-testid="username">{user?.username ?? "none"}</span>
    </div>
  );
}

// Helper: component that calls login
function LoginButton({ jwt, user }: { jwt: string; user: Parameters<ReturnType<typeof useAuth>["login"]>[1] }) {
  const { login } = useAuth();
  return <button onClick={() => login(jwt, user)}>Login</button>;
}

// Helper: component that calls logout
function LogoutButton() {
  const { logout } = useAuth();
  return <button onClick={logout}>Logout</button>;
}

beforeEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("AuthProvider", () => {
  it("starts unauthenticated when localStorage is empty", () => {
    render(<AuthProvider><AuthDisplay /></AuthProvider>);
    expect(screen.getByTestId("authenticated").textContent).toBe("false");
    expect(screen.getByTestId("username").textContent).toBe("none");
  });

  it("restores authenticated state from valid localStorage", () => {
    localStorage.setItem("dungeon_jwt", "token123");
    localStorage.setItem("dungeon_user", JSON.stringify({ id: "1", username: "Steph", avatar: null, email: null }));

    render(<AuthProvider><AuthDisplay /></AuthProvider>);

    expect(screen.getByTestId("authenticated").textContent).toBe("true");
    expect(screen.getByTestId("username").textContent).toBe("Steph");
  });

  it("clears invalid localStorage on mount and stays unauthenticated", () => {
    localStorage.setItem("dungeon_jwt", "");
    localStorage.setItem("dungeon_user", JSON.stringify({ id: "1", username: "Steph", avatar: null, email: null }));

    render(<AuthProvider><AuthDisplay /></AuthProvider>);

    expect(screen.getByTestId("authenticated").textContent).toBe("false");
    expect(localStorage.getItem("dungeon_jwt")).toBeNull();
    expect(localStorage.getItem("dungeon_user")).toBeNull();
  });

  it("clears malformed user JSON on mount and stays unauthenticated", () => {
    localStorage.setItem("dungeon_jwt", "token123");
    localStorage.setItem("dungeon_user", "not-json{{{");

    render(<AuthProvider><AuthDisplay /></AuthProvider>);

    expect(screen.getByTestId("authenticated").textContent).toBe("false");
    expect(localStorage.getItem("dungeon_jwt")).toBeNull();
  });

  it("clears user missing required fields on mount", () => {
    localStorage.setItem("dungeon_jwt", "token123");
    localStorage.setItem("dungeon_user", JSON.stringify({ avatar: null })); // missing id + username

    render(<AuthProvider><AuthDisplay /></AuthProvider>);

    expect(screen.getByTestId("authenticated").textContent).toBe("false");
  });

  it("login() sets user and persists to localStorage", async () => {
    const user = { id: "42", username: "Adventurer", avatar: null, email: "a@b.com" };
    render(
      <AuthProvider>
        <AuthDisplay />
        <LoginButton jwt="jwt-abc" user={user} />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText("Login").click();
    });

    expect(screen.getByTestId("authenticated").textContent).toBe("true");
    expect(screen.getByTestId("username").textContent).toBe("Adventurer");
    expect(localStorage.getItem("dungeon_jwt")).toBe("jwt-abc");
    expect(JSON.parse(localStorage.getItem("dungeon_user")!).username).toBe("Adventurer");
  });

  it("logout() clears user and localStorage", async () => {
    localStorage.setItem("dungeon_jwt", "token123");
    localStorage.setItem("dungeon_user", JSON.stringify({ id: "1", username: "Steph", avatar: null, email: null }));

    render(
      <AuthProvider>
        <AuthDisplay />
        <LogoutButton />
      </AuthProvider>
    );

    await act(async () => {
      screen.getByText("Logout").click();
    });

    expect(screen.getByTestId("authenticated").textContent).toBe("false");
    expect(localStorage.getItem("dungeon_jwt")).toBeNull();
    expect(localStorage.getItem("dungeon_user")).toBeNull();
  });
});
