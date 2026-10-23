import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/app/context/auth-context";
import type { User } from "@/app/context/auth-context";
import { AlertCircle } from "lucide-react";
import { Wordmark } from "@/app/components/shared/wordmark";

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
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-6 bg-background px-6">
        <Wordmark linked={false} />
        <div className="flex max-w-sm items-start gap-2 text-muted-foreground">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-ember" aria-hidden="true" />
          <p role="alert" className="m-0 text-base">{error}</p>
        </div>
        <a
          href="/"
          className="inline-flex h-11 items-center rounded-[4px] border border-input px-[22px] text-base font-medium text-foreground transition-colors hover:bg-raised focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-gold"
        >
          Try again
        </a>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-4 bg-background px-6">
      <Wordmark linked={false} />
      <p className="m-0 text-base text-muted-foreground" role="status">Opening the gate…</p>
    </div>
  );
}
