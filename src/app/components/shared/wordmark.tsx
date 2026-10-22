import { Link } from "react-router";
import { cn } from "@/app/components/ui/utils";

interface WordmarkProps {
  className?: string;
}

export function Wordmark({ className }: WordmarkProps) {
  return (
    <Link
      to="/dashboard"
      className={cn(
        "font-display text-2xl leading-none text-foreground rounded-[4px] focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-gold",
        className,
      )}
    >
      Dungeon
    </Link>
  );
}
