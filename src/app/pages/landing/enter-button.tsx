import { motion } from "motion/react";
import { DiscordMark } from "./discord-mark";
import { EASE_OUT, FOCUS } from "./classes";

interface EnterButtonProps {
  onClick: () => void;
  className?: string;
}

/** The page's one primary action: Discord sign-in, gold, with the Discord mark. */
export function EnterButton({ onClick, className = "" }: EnterButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.14, ease: EASE_OUT }}
      className={`inline-flex min-h-11 items-center justify-center gap-2.5 rounded-[4px] bg-gold px-5 text-base font-semibold text-primary-foreground transition-[filter] duration-200 hover:brightness-110 ${FOCUS} ${className}`}
    >
      <DiscordMark className="size-5 shrink-0" />
      Enter with Discord
    </motion.button>
  );
}
