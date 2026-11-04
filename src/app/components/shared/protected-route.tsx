import { useLocation, Navigate, Outlet } from "react-router";
import { useAuth } from "@/app/context/auth-context";

export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  // Until /auth/me answers we don't know; don't bounce a signed-in player to the landing page.
  if (status === "loading") return null;

  if (status === "signed-out") {
    sessionStorage.setItem("dungeon_redirect_after_login", location.pathname);
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
