import { Outlet, useLocation } from "react-router";
import { Navbar } from "./navbar";

export function Layout() {
  const { pathname } = useLocation();
  // The dashboard draws its own overlay navbar inside the hero, so it scrolls away with the painting.
  const ownsNavbar = pathname === "/dashboard";

  return (
    <div className="h-screen w-screen bg-background flex flex-col overflow-hidden">
      {!ownsNavbar && <Navbar variant="solid" />}
      <main className="relative flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
