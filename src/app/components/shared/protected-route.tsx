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
