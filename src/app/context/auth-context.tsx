import { createContext, useContext, useState, ReactNode } from "react";

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

export const AuthContext = createContext<AuthContextValue | null>(null);

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
