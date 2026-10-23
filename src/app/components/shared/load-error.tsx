import { motion } from "motion/react";
import { CloudOff } from "lucide-react";

interface LoadErrorProps {
  onRetry: () => void;
  className?: string;
}

/** One quiet line for a failed request, with a text button that tries again. */
export function LoadError({ onRetry, className = "" }: LoadErrorProps) {
  return (
    <p role="alert" className={`m-0 flex flex-wrap items-center gap-x-2 text-base text-muted-foreground ${className}`}>
      <CloudOff className="size-4 shrink-0" aria-hidden="true" />
      <span>Couldn't reach the Dungeon Master. Try again.</span>
      <motion.button
        type="button"
        onClick={onRetry}
        whileTap={{ y: 1 }}
        className="inline-flex min-h-11 items-center rounded-[4px] px-2 font-semibold text-foreground underline underline-offset-2 hover:text-gold focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-gold"
      >
        Retry
      </motion.button>
    </p>
  );
}
