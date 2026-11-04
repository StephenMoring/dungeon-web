import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { apiFetch } from "@/app/api/http";

export interface User {
  id: string;
  username: string;
  avatar: string | null;
  email: string | null;
}

/** The user as dungeon-service returns it (UserPublic). */
export interface ApiUser {
  id: number;
  username: string;
  avatar_url: string | null;
}

export function toUser(apiUser: ApiUser): User {
  return { id: String(apiUser.id), username: apiUser.username, avatar: apiUser.avatar_url || null, email: null };
}

export type AuthStatus = "loading" | "signed-in" | "signed-out";

interface AuthContextValue {
  user: User | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  /** Call after the login callback: the server has already set the session cookie. */
  login: (user: User) => void;
  /** Ends the session on the server (every device) and signs out here. */
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

// Earlier versions kept the JWT in localStorage, where any script on the page could
// read it. The session is now an httpOnly cookie; remove what those versions left.
function forgetLegacyToken() {
  try {
    localStorage.removeItem("dungeon_jwt");
    localStorage.removeItem("dungeon_user");
  } catch {
    // storage may be unavailable; nothing to clean up then
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    forgetLegacyToken();
    let cancelled = false;
    apiFetch("/auth/me")
      .then(async (response) => {
        if (cancelled) return;
        if (!response.ok) {
          setStatus("signed-out");
          return;
        }
        setUser(toUser((await response.json()) as ApiUser));
        setStatus("signed-in");
      })
      .catch(() => {
        if (!cancelled) setStatus("signed-out");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback((next: User) => {
    setUser(next);
    setStatus("signed-in");
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch (err) {
      // Still sign out here; the cookie expires on its own.
      console.error(err);
    }
    setUser(null);
    setStatus("signed-out");
  }, []);

  return (
    <AuthContext.Provider value={{ user, status, isAuthenticated: status === "signed-in", login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
