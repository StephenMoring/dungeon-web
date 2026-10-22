import { Outlet, useLocation } from "react-router";
import { Navbar } from "./navbar";

export function Layout() {
  const { pathname } = useLocation();
  const overlay = pathname === "/dashboard";

  return (
    <div className="h-screen w-screen bg-background flex flex-col overflow-hidden">
      {!overlay && <Navbar variant="solid" />}
      <main className="relative flex-1 overflow-hidden">
        {overlay && <Navbar variant="overlay" />}
        <Outlet />
      </main>
    </div>
  );
}
