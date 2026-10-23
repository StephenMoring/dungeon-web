import { Link } from "react-router";
import { cn } from "@/app/components/ui/utils";

interface WordmarkProps {
  className?: string;
  /** False renders plain text (the public landing page, where /dashboard would only bounce back). */
  linked?: boolean;
}

const BASE = "font-display text-2xl leading-none text-foreground";

export function Wordmark({ className, linked = true }: WordmarkProps) {
  if (!linked) return <span className={cn(BASE, className)}>Dungeon</span>;
  return (
    <Link
      to="/dashboard"
      className={cn(
        BASE,
        "rounded-[4px] focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-gold",
        className,
      )}
    >
      Dungeon
    </Link>
  );
}
