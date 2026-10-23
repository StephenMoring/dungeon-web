import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "@/app/context/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";

export function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [avatarError, setAvatarError] = useState(false);

  if (!user) return null;

  const showImage = user.avatar !== null && !avatarError;

  function handleLogout() {
    logout();
    navigate("/", { replace: true });
  }

  const avatarElement = showImage ? (
    <img
      src={user.avatar ?? undefined}
      alt={user.username}
      className="w-8 h-8 rounded-full"
      onError={() => setAvatarError(true)}
    />
  ) : (
    <div className="w-8 h-8 rounded-full bg-raised text-foreground flex items-center justify-center text-sm font-semibold select-none">
      {(user.username[0] ?? "?").toUpperCase()}
    </div>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Open user menu"
          className="inline-flex size-11 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-gold"
        >
          {avatarElement}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem asChild>
          <Link to="/profile">Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
