import { Link, useLocation } from "react-router";
import { UserMenu } from "./user-menu";

interface BreadcrumbEntry {
  match: (pathname: string) => boolean;
  segments: string[];
}

const BREADCRUMBS: BreadcrumbEntry[] = [
  { match: (p) => p === "/dashboard",          segments: ["Dashboard"] },
  { match: (p) => p === "/campaigns",          segments: ["Dashboard", "Campaigns"] },
  { match: (p) => p === "/history",            segments: ["Dashboard", "History"] },
  { match: (p) => p === "/settings",           segments: ["Dashboard", "Settings"] },
  { match: (p) => p === "/character/new",      segments: ["Dashboard", "New Character"] },
  { match: (p) => p.startsWith("/adventure/"), segments: ["Dashboard", "Campaign"] },
];

export function Navbar() {
  const { pathname } = useLocation();
  const entry = BREADCRUMBS.find((b) => b.match(pathname));

  return (
    <nav
      className="h-14 flex items-center justify-between px-6 border-b border-white/5 bg-white/[0.04] backdrop-blur-md"
    >
      {/* Left: icon + breadcrumb */}
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div className="w-7 h-7 rounded-md bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm select-none">
          ⚔
        </div>

        {/* Breadcrumb */}
        {entry && (
          <div className="flex items-center gap-2 text-sm">
            {entry.segments.length === 1 ? (
              <span className="text-muted-foreground">Dashboard</span>
            ) : (
              <>
                <Link to="/dashboard" className="text-violet-400 hover:text-violet-300 transition-colors">
                  Dashboard
                </Link>
                <span className="text-muted-foreground/40">/</span>
                <span className="text-foreground/90">{entry.segments[1]}</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Right: user menu */}
      <UserMenu />
    </nav>
  );
}
