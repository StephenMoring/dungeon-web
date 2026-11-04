import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth, type User } from "./auth-context";

function AuthDisplay() {
  const { user, status } = useAuth();
  return (
    <div>
      <span data-testid="status">{status}</span>
      <span data-testid="username">{user?.username ?? "none"}</span>
    </div>
  );
}

function LoginButton({ user }: { user: User }) {
  const { login } = useAuth();
  return <button onClick={() => login(user)}>Login</button>;
}

function LogoutButton() {
  const { logout } = useAuth();
  return <button onClick={() => void logout()}>Logout</button>;
}

const fetchMock = vi.fn();

function respond(status: number, body?: unknown) {
  return Promise.resolve(new Response(body === undefined ? null : JSON.stringify(body), { status }));
}

beforeEach(() => {
  localStorage.clear();
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("AuthProvider", () => {
  it("is loading until the server says who is signed in", () => {
    fetchMock.mockReturnValue(new Promise(() => {}));
    render(<AuthProvider><AuthDisplay /></AuthProvider>);

    expect(screen.getByTestId("status").textContent).toBe("loading");
  });

  it("asks /auth/me with the cookie, never a stored token", async () => {
    fetchMock.mockReturnValue(respond(200, { id: 1, username: "Steph", avatar_url: "a.png" }));
    render(<AuthProvider><AuthDisplay /></AuthProvider>);

    await waitFor(() => expect(screen.getByTestId("status").textContent).toBe("signed-in"));
    expect(screen.getByTestId("username").textContent).toBe("Steph");
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/auth/me");
    expect(init.credentials).toBe("same-origin");
    expect(new Headers(init.headers).has("Authorization")).toBe(false);
  });

  it("is signed out when there is no session", async () => {
    fetchMock.mockReturnValue(respond(401, { detail: "Not signed in" }));
    render(<AuthProvider><AuthDisplay /></AuthProvider>);

    await waitFor(() => expect(screen.getByTestId("status").textContent).toBe("signed-out"));
    expect(screen.getByTestId("username").textContent).toBe("none");
  });

  it("is signed out when the server can't be reached", async () => {
    fetchMock.mockRejectedValue(new TypeError("offline"));
    render(<AuthProvider><AuthDisplay /></AuthProvider>);

    await waitFor(() => expect(screen.getByTestId("status").textContent).toBe("signed-out"));
  });

  it("deletes tokens an older version left in localStorage", async () => {
    localStorage.setItem("dungeon_jwt", "old-token");
    localStorage.setItem("dungeon_user", "{}");
    fetchMock.mockReturnValue(respond(401));
    render(<AuthProvider><AuthDisplay /></AuthProvider>);

    await waitFor(() => expect(screen.getByTestId("status").textContent).toBe("signed-out"));
    expect(localStorage.getItem("dungeon_jwt")).toBeNull();
    expect(localStorage.getItem("dungeon_user")).toBeNull();
  });

  it("login() signs in without storing anything in the page", async () => {
    fetchMock.mockReturnValue(respond(401));
    render(
      <AuthProvider>
        <AuthDisplay />
        <LoginButton user={{ id: "42", username: "Adventurer", avatar: null, email: null }} />
      </AuthProvider>,
    );
    await waitFor(() => expect(screen.getByTestId("status").textContent).toBe("signed-out"));

    await act(async () => screen.getByText("Login").click());

    expect(screen.getByTestId("status").textContent).toBe("signed-in");
    expect(screen.getByTestId("username").textContent).toBe("Adventurer");
    expect(localStorage.length).toBe(0);
  });

  it("logout() ends the session on the server and signs out", async () => {
    fetchMock
      .mockReturnValueOnce(respond(200, { id: 1, username: "Steph", avatar_url: "" }))
      .mockReturnValueOnce(respond(204));
    render(<AuthProvider><AuthDisplay /><LogoutButton /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId("status").textContent).toBe("signed-in"));

    await act(async () => screen.getByText("Logout").click());

    await waitFor(() => expect(screen.getByTestId("status").textContent).toBe("signed-out"));
    const [url, init] = fetchMock.mock.calls[1];
    expect(url).toBe("/api/auth/logout");
    expect(init.method).toBe("POST");
    expect(new Headers(init.headers).get("X-Requested-With")).toBe("dungeon-web");
  });

  it("logout() still signs out locally when the server call fails", async () => {
    fetchMock
      .mockReturnValueOnce(respond(200, { id: 1, username: "Steph", avatar_url: "" }))
      .mockRejectedValueOnce(new TypeError("offline"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(<AuthProvider><AuthDisplay /><LogoutButton /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId("status").textContent).toBe("signed-in"));

    await act(async () => screen.getByText("Logout").click());

    await waitFor(() => expect(screen.getByTestId("status").textContent).toBe("signed-out"));
  });
});
