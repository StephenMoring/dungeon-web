import { NavLink } from "react-router";
import { cn } from "@/app/components/ui/utils";

export const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/campaigns", label: "Campaigns" },
  { to: "/history", label: "History" },
  { to: "/settings", label: "Settings" },
] as const;

interface NavLinksProps {
  className?: string;
  linkClassName?: string;
  onNavigate?: () => void;
}

export function NavLinks({ className, linkClassName, onNavigate }: NavLinksProps) {
  return (
    <>
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "rounded-[4px] text-base font-medium transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-gold",
              isActive ? "text-foreground" : "text-muted-foreground",
              className,
              linkClassName,
            )
          }
        >
          {item.label}
        </NavLink>
      ))}
    </>
  );
}
