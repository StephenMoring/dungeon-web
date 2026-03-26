import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/app/context/auth-context";
import type { User } from "@/app/context/auth-context";
import { Loader2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";

interface BackendUser {
  id: number;
  discord_id: string;
  username: string;
  avatar_url: string;
}

interface CallbackResponse {
  jwt: string;
  user: BackendUser;
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
      .then(({ jwt, user: backendUser }) => {
        const user: User = {
          id: String(backendUser.id),
          username: backendUser.username,
          avatar: backendUser.avatar_url,
          email: null,
        };
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
