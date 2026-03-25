# Landing Page & Auth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the public `/` route with a cinematic dark marketing/landing page; add Discord OAuth login with JWT auth; protect all app routes.

**Architecture:** `AuthContext` holds JWT + user state in localStorage, exposed via `useAuth`. `ProtectedRoute` wraps authenticated routes and redirects to `/` with sessionStorage-based deep link preservation. The landing page lives outside the existing `Layout` wrapper (which uses `h-screen overflow-hidden` and would clip scrolling) with its own root container replicating the particle effect.

**Tech Stack:** React 18, TypeScript, React Router v7, Tailwind CSS v4, Motion (`motion/react`), Lucide React, shadcn/ui, Vitest, @testing-library/react

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `src/app/context/auth-context.tsx` | Create | AuthContext, AuthProvider, useAuth hook |
| `src/app/components/shared/protected-route.tsx` | Create | Auth guard — redirects to `/` with sessionStorage deep link if unauthenticated |
| `src/app/pages/auth-callback.tsx` | Create | `/auth/callback` — handles Discord redirect, exchanges code for JWT |
| `src/app/pages/landing.tsx` | Create | Public marketing page: Nav, Hero, Features, Pricing, CTA footer |
| `src/app/routes.tsx` | Modify | Add Landing, AuthCallback, /dashboard routes; wrap protected routes in ProtectedRoute |
| `src/app/App.tsx` | Modify | Wrap RouterProvider with AuthProvider |
| `.env.example` | Create | Document required env vars |
| `.gitignore` | Modify | Add `!.env.example` negation |
| `CLAUDE.md` | Modify | Add `context/` directory to project structure |
| `vite.config.ts` | Modify | Add Vitest test config |
| `package.json` | Modify | Add `test` script |

---

## Task 1: Set up Vitest

**Files:**
- Modify: `vite.config.ts`
- Modify: `package.json`

- [ ] **Step 1: Install test dependencies**

```bash
npm install -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
```

- [ ] **Step 2: Add test config to `vite.config.ts`**

Add a `test` block to the existing `defineConfig`. The full file should look like:

```ts
import { defineConfig } from "vite";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  assetsInclude: ["**/*.svg", "**/*.csv"],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test-setup.ts"],
  },
});
```

- [ ] **Step 3: Create `src/test-setup.ts`**

```ts
import "@testing-library/jest-dom";
```

- [ ] **Step 4: Add test script to `package.json`**

Add to the `scripts` block:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Verify setup works**

```bash
npm test
```

Expected: "No test files found" or similar — not an error about missing config.

- [ ] **Step 6: Commit**

```bash
git add vite.config.ts package.json src/test-setup.ts
git commit -m "chore: add vitest + testing-library setup"
```

---

## Task 2: AuthContext

**Files:**
- Create: `src/app/context/auth-context.tsx`
- Create: `src/app/context/auth-context.test.tsx`

The context stores the current user and JWT. `isAuthenticated` is derived as `user !== null`. On mount it reads from localStorage and validates the stored data structurally before trusting it. `logout()` clears storage and state — it does NOT navigate (callers handle that).

- [ ] **Step 1: Write the failing tests**

Create `src/app/context/auth-context.test.tsx`:

```tsx
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
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
npm test
```

Expected: FAIL — `Cannot find module './auth-context'`

- [ ] **Step 3: Implement `src/app/context/auth-context.tsx`**

```tsx
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface User {
  id: string;
  username: string;
  avatar: string | null;
  email: string | null;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (jwt: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function loadFromStorage(): { user: User; jwt: string } | null {
  try {
    const jwt = localStorage.getItem("dungeon_jwt");
    const raw = localStorage.getItem("dungeon_user");
    if (!jwt || !raw) return null;
    const user = JSON.parse(raw) as unknown;
    if (
      typeof user !== "object" ||
      user === null ||
      !("id" in user) ||
      !("username" in user) ||
      typeof (user as Record<string, unknown>).id !== "string" ||
      typeof (user as Record<string, unknown>).username !== "string"
    ) {
      return null;
    }
    return { jwt, user: user as User };
  } catch {
    return null;
  }
}

function clearStorage() {
  localStorage.removeItem("dungeon_jwt");
  localStorage.removeItem("dungeon_user");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = loadFromStorage();
    if (!stored) {
      clearStorage();
      return null;
    }
    return stored.user;
  });

  const login = (jwt: string, user: User) => {
    localStorage.setItem("dungeon_jwt", jwt);
    localStorage.setItem("dungeon_user", JSON.stringify(user));
    setUser(user);
  };

  const logout = () => {
    clearStorage();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: user !== null, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
```

- [ ] **Step 4: Run tests and confirm they pass**

```bash
npm test
```

Expected: All 7 tests in `auth-context.test.tsx` pass.

- [ ] **Step 5: Commit**

```bash
git add src/app/context/ src/test-setup.ts vite.config.ts package.json
git commit -m "feat: add AuthContext with localStorage persistence and validation"
```

---

## Task 3: ProtectedRoute

**Files:**
- Create: `src/app/components/shared/protected-route.tsx`
- Create: `src/app/components/shared/protected-route.test.tsx`

If unauthenticated, writes the current path to `sessionStorage` under `"dungeon_redirect_after_login"` then redirects to `/`. If authenticated, renders `<Outlet />`.

- [ ] **Step 1: Write the failing tests**

Create `src/app/components/shared/protected-route.test.tsx`:

```tsx
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route, Outlet } from "react-router";
import { AuthContext } from "../../context/auth-context";
import { ProtectedRoute } from "./protected-route";

// Minimal AuthContext value factory
function makeAuthCtx(isAuthenticated: boolean) {
  return {
    user: isAuthenticated ? { id: "1", username: "Steph", avatar: null, email: null } : null,
    isAuthenticated,
    login: () => {},
    logout: () => {},
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
});
```

Note: this test imports `AuthContext` directly — you'll need to export it from `auth-context.tsx`. Add `export` to the `createContext` line.

- [ ] **Step 2: Export `AuthContext` from `auth-context.tsx`**

Change the line in `src/app/context/auth-context.tsx`:
```ts
// Before:
const AuthContext = createContext<AuthContextValue | null>(null);
// After:
export const AuthContext = createContext<AuthContextValue | null>(null);
```

- [ ] **Step 3: Run test to confirm it fails**

```bash
npm test
```

Expected: FAIL — `Cannot find module './protected-route'`

- [ ] **Step 4: Implement `src/app/components/shared/protected-route.tsx`**

```tsx
import { useLocation, Navigate, Outlet } from "react-router";
import { useAuth } from "@/app/context/auth-context";

export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    sessionStorage.setItem("dungeon_redirect_after_login", location.pathname);
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
```

- [ ] **Step 5: Run tests and confirm they pass**

```bash
npm test
```

Expected: All tests pass including the 3 new ProtectedRoute tests.

- [ ] **Step 6: Commit**

```bash
git add src/app/components/shared/protected-route.tsx src/app/components/shared/protected-route.test.tsx src/app/context/auth-context.tsx
git commit -m "feat: add ProtectedRoute with sessionStorage deep link preservation"
```

---

## Task 4: Wire up routes and AuthProvider

**Files:**
- Modify: `src/app/routes.tsx`
- Modify: `src/app/App.tsx`

This task restructures the router. `Landing` and `AuthCallback` are public top-level routes outside `Layout`. All current app routes move to a `/dashboard`-rooted subtree wrapped in `ProtectedRoute`. The `*` catch-all stays inside the `Layout` subtree.

- [ ] **Step 1: Update `src/app/routes.tsx`**

```tsx
import { createBrowserRouter, Navigate } from "react-router";
import { Home } from "./pages/home";
import { CharacterCreation } from "./pages/character-creation";
import { Campaign } from "./pages/campaign";
import { CampaignList } from "./pages/campaign-list";
import { History } from "./pages/history";
import { Settings } from "./pages/settings";
import { NotFound } from "./pages/not-found";
import { Layout } from "./components/shared/layout";
import { ProtectedRoute } from "./components/shared/protected-route";
import { Landing } from "./pages/landing";
import { AuthCallback } from "./pages/auth-callback";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Landing,
  },
  {
    path: "/auth/callback",
    Component: AuthCallback,
  },
  {
    path: "/",
    Component: Layout,
    children: [
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "dashboard",
            Component: Home,
          },
          {
            path: "character/new",
            Component: CharacterCreation,
          },
          {
            path: "adventure/:id",
            Component: Campaign,
          },
          {
            path: "campaigns",
            Component: CampaignList,
          },
          {
            path: "history",
            Component: History,
          },
          {
            path: "settings",
            Component: Settings,
          },
        ],
      },
      {
        path: "*",
        Component: NotFound,
      },
    ],
  },
]);
```

- [ ] **Step 2: Update `src/app/App.tsx`**

```tsx
import { RouterProvider } from "react-router";
import { router } from "./routes";
import { AuthProvider } from "./context/auth-context";

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
```

- [ ] **Step 3: Start the dev server and manually verify routing**

```bash
npm run dev
```

Check:
- `http://localhost:5173/` → shows Landing (placeholder OK for now — file doesn't exist yet, expect an import error, which is fine)
- After creating all pages, verify `/dashboard` requires auth

- [ ] **Step 4: Commit**

```bash
git add src/app/routes.tsx src/app/App.tsx
git commit -m "feat: restructure routes with AuthProvider and ProtectedRoute"
```

---

## Task 5: AuthCallback page

**Files:**
- Create: `src/app/pages/auth-callback.tsx`

Handles the Discord OAuth redirect. Three states: loading (posting code to backend), error (missing code or backend failure), success (navigates away — user never actually sees this state).

- [ ] **Step 1: Implement `src/app/pages/auth-callback.tsx`**

```tsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/app/context/auth-context";
import type { User } from "@/app/context/auth-context";
import { Loader2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";

interface CallbackResponse {
  jwt: string;
  user: User;
}

export function AuthCallback() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const called = useRef(false);

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (!code) {
      setError("Missing authorization code. Please try logging in again.");
      return;
    }

    fetch("/api/auth/discord/callback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        return res.json() as Promise<CallbackResponse>;
      })
      .then(({ jwt, user }) => {
        login(jwt, user);
        const from = sessionStorage.getItem("dungeon_redirect_after_login") ?? "/dashboard";
        sessionStorage.removeItem("dungeon_redirect_after_login");
        navigate(from, { replace: true });
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      });
  }, [login, navigate]);

  if (error) {
    return (
      <div className="h-screen w-screen bg-background dark flex items-center justify-center">
        <div className="text-center space-y-4 max-w-sm px-6">
          <p className="text-destructive font-medium">{error}</p>
          <Button variant="outline" asChild>
            <a href="/">Try again</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-background dark flex items-center justify-center">
      <div className="flex items-center gap-3 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span>Signing you in...</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Start dev server and verify the page renders**

```bash
npm run dev
```

Visit `http://localhost:5173/auth/callback` — should show the spinner ("Signing you in...").
Visit `http://localhost:5173/auth/callback?code=test` — should briefly show spinner then show an error (backend not running).

- [ ] **Step 3: Commit**

```bash
git add src/app/pages/auth-callback.tsx
git commit -m "feat: add AuthCallback page with loading and error states"
```

---

## Task 6: Landing page

**Files:**
- Create: `src/app/pages/landing.tsx`

Full marketing page outside the `Layout` wrapper. Replicates the particle effect from `layout.tsx` directly. Sections: Nav, Hero, Features, Pricing, CTA footer. "Login with Discord" triggers a full-page redirect to Discord's OAuth URL using env vars.

- [ ] **Step 1: Create `.env.local` for local development**

If you haven't done Task 7 Step 1 yet, create `.env.example` first (see Task 7), then:

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in your Discord app's values:
```
VITE_DISCORD_CLIENT_ID=your_actual_client_id
VITE_DISCORD_REDIRECT_URI=http://localhost:5173/auth/callback
```

If you don't have a Discord app yet, leave placeholder values — the button will redirect to a Discord error page but the UI will render correctly.

- [ ] **Step 2: Implement `src/app/pages/landing.tsx`**

```tsx
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { useAuth } from "@/app/context/auth-context";
import { Button } from "@/app/components/ui/button";

function buildDiscordOAuthUrl(): string {
  const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID as string;
  const redirectUri = import.meta.env.VITE_DISCORD_REDIRECT_URI as string;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "identify email",
  });
  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}

function handleDiscordLogin() {
  window.location.href = buildDiscordOAuthUrl();
}

export function Landing() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen w-screen bg-background dark relative overflow-x-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/10 via-background to-emerald-900/10 pointer-events-none" />
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Floating particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="fixed w-1 h-1 bg-purple-400/30 rounded-full pointer-events-none"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{ y: [0, -30, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      <div className="relative z-10">
        {/* Nav */}
        <nav className="flex items-center justify-between px-8 py-5 border-b border-white/5">
          <span className="text-lg font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-emerald-400 bg-clip-text text-transparent">
            ⚔ Dungeon Master AI
          </span>
          <Button
            onClick={handleDiscordLogin}
            className="bg-[#5865F2] hover:bg-[#4752C4] text-white border-0"
          >
            Login with Discord
          </Button>
        </nav>

        {/* Hero */}
        <section className="text-center px-6 py-28 max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-xs font-semibold tracking-[0.3em] uppercase text-purple-400 mb-5">
              Your AI Dungeon Master Awaits
            </p>
            <h1 className="text-6xl md:text-7xl font-black leading-[1.05] mb-6 bg-gradient-to-br from-white via-white to-purple-400 bg-clip-text text-transparent">
              Epic Adventures,<br />Infinite Stories
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
              Create your character, step into any world, and let an AI dungeon master guide your
              journey — solo or with friends.
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                size="lg"
                onClick={handleDiscordLogin}
                className="bg-purple-600 hover:bg-purple-500 text-white border-0 px-8"
              >
                Start Playing Free
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/10 text-muted-foreground hover:text-white"
                onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
              >
                See how it works ↓
              </Button>
            </div>
          </motion.div>
        </section>

        {/* Features */}
        <section id="features" className="px-8 py-20 max-w-5xl mx-auto border-t border-white/5">
          <p className="text-xs font-semibold tracking-[0.3em] uppercase text-emerald-400 mb-3 text-center">Features</p>
          <h2 className="text-3xl font-black text-center mb-12">Everything you need to adventure</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: "🧙",
                title: "AI Dungeon Master",
                desc: "Reactive storytelling that adapts to every choice you make.",
                accent: "purple",
              },
              {
                icon: "⚔️",
                title: "Character Builder",
                desc: "Create and save characters across unlimited campaigns.",
                accent: "emerald",
              },
              {
                icon: "📜",
                title: "Campaign History",
                desc: "Every adventure saved. Pick up right where you left off.",
                accent: "pink",
              },
            ].map((f) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`rounded-xl border p-6 bg-gradient-to-br ${
                  f.accent === "purple"
                    ? "from-purple-500/10 to-transparent border-purple-500/20"
                    : f.accent === "emerald"
                    ? "from-emerald-500/10 to-transparent border-emerald-500/20"
                    : "from-pink-500/10 to-transparent border-pink-500/20"
                }`}
              >
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-base mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section className="px-8 py-20 max-w-3xl mx-auto border-t border-white/5">
          <p className="text-xs font-semibold tracking-[0.3em] uppercase text-purple-400 mb-3 text-center">Pricing</p>
          <h2 className="text-3xl font-black text-center mb-12">Simple, free to start</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Free */}
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-7">
              <p className="text-xs font-semibold text-muted-foreground tracking-widest mb-2">FREE</p>
              <p className="text-4xl font-black mb-5">$0</p>
              <ul className="text-sm text-muted-foreground space-y-2 mb-7">
                {["3 campaigns", "1 character", "50 AI turns/month", "Campaign history"].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="text-emerald-400">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full border-white/10" onClick={handleDiscordLogin}>
                Get started free
              </Button>
            </div>

            {/* Pro */}
            <div className="rounded-xl border border-purple-500/40 bg-gradient-to-br from-purple-500/10 to-pink-500/5 p-7 relative">
              <span className="absolute -top-3 right-4 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full tracking-wider">
                POPULAR
              </span>
              <p className="text-xs font-semibold text-purple-400 tracking-widest mb-2">PRO</p>
              <p className="text-4xl font-black mb-5">
                $9<span className="text-base font-normal text-muted-foreground">/mo</span>
              </p>
              <ul className="text-sm text-muted-foreground space-y-2 mb-7">
                {["Unlimited campaigns", "Unlimited characters", "Unlimited AI turns", "Priority support"].map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="text-purple-400">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Button className="w-full bg-purple-600 hover:bg-purple-500 text-white border-0" onClick={handleDiscordLogin}>
                Start with Pro
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Footer */}
        <section className="px-8 py-24 text-center border-t border-white/5 bg-[radial-gradient(ellipse_at_50%_100%,rgba(124,58,237,0.08),transparent_70%)]">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl font-black mb-4">Ready to roll?</h2>
            <p className="text-muted-foreground mb-8">
              Sign in with Discord and your first adventure starts in seconds.
            </p>
            <Button
              size="lg"
              onClick={handleDiscordLogin}
              className="bg-[#5865F2] hover:bg-[#4752C4] text-white border-0 px-10 py-5 text-base font-bold"
            >
              Login with Discord
            </Button>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Start dev server and visually verify**

```bash
npm run dev
```

Check at `http://localhost:5173/`:
- Full landing page renders with all 5 sections
- Particles animate
- "Login with Discord" buttons redirect to Discord (or a Discord error if client ID is placeholder)
- "See how it works" scrolls to Features section
- Visiting `/dashboard` without a JWT redirects back to `/`

- [ ] **Step 4: Commit**

```bash
git add src/app/pages/landing.tsx
git commit -m "feat: add cinematic landing page with hero, features, pricing, and Discord login"
```

---

## Task 7: Environment config + housekeeping

**Files:**
- Create: `.env.example`
- Modify: `.gitignore`
- Modify: `CLAUDE.md`

- [ ] **Step 1: Create `.env.example`**

```
# Discord OAuth app credentials
# Get these from https://discord.com/developers/applications
VITE_DISCORD_CLIENT_ID=your_discord_client_id
VITE_DISCORD_REDIRECT_URI=http://localhost:5173/auth/callback
```

- [ ] **Step 2: Add negation to `.gitignore`**

Find the line `.env*` in `.gitignore` (currently line 34) and add the negation immediately after:

```
# env files (can opt-in for committing if needed)
.env*
!.env.example
```

- [ ] **Step 3: Update `CLAUDE.md` project structure**

In the `Project Structure` section, add the `context/` directory under `src/app/`. The updated tree should include:

```
    context/                     # React contexts
      auth-context.tsx           # JWT auth state, useAuth hook
```

Add it after the `components/` block.

- [ ] **Step 4: Run all tests one final time**

```bash
npm test
```

Expected: All tests pass.

- [ ] **Step 5: Final commit**

```bash
git add .env.example .gitignore CLAUDE.md
git commit -m "chore: add .env.example, fix .gitignore negation, update CLAUDE.md structure"
```

---

## Verification Checklist

After all tasks are complete, manually verify these flows:

- [ ] `/` with no JWT → Landing page renders
- [ ] `/` with valid JWT in localStorage → redirects to `/dashboard`
- [ ] "Login with Discord" button → redirects to Discord OAuth URL
- [ ] `/auth/callback` with no `?code` → shows error with "Try again" link
- [ ] `/auth/callback` with `?code=anything` + no backend → shows error (expected)
- [ ] `/dashboard` with no JWT → redirects to `/`, sessionStorage has the path saved
- [ ] `/adventure/abc` with no JWT → redirects to `/`, sessionStorage has `/adventure/abc`
- [ ] All protected routes (`/campaigns`, `/history`, `/settings`, `/character/new`) redirect to `/` when unauthenticated
- [ ] `npm test` passes cleanly
