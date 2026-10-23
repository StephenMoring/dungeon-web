import { motion } from "motion/react";
import type { TurnReply as TurnReplyData } from "./turn-script";
import { EASE_OUT, FOCUS } from "./classes";

interface TurnReplyProps {
  /** The player's line as sent. */
  action: string;
  /** The written reply, or null when the sample has none for this action. */
  reply: TurnReplyData | null;
  onEnter: () => void;
}

/** The story pane's answer to one action: the player's line, then the Dungeon Master's prose. */
export function TurnReply({ action, reply, onEnter }: TurnReplyProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.36, ease: EASE_OUT }}
      className="flex flex-col gap-4"
    >
      <p className="m-0 max-w-[85%] self-end rounded-[4px] bg-raised px-3.5 py-2 text-base text-foreground">{action}</p>
      {reply ? (
        <p className="m-0 max-w-[62ch] text-lg leading-[1.6] text-foreground">
          {reply.before} {reply.roll.stat} roll:{" "}
          <span className="inline-flex min-w-7 items-center justify-center rounded-[4px] bg-ember px-1.5 font-semibold tabular-nums text-destructive-foreground">
            {reply.roll.value}
          </span>
          . {reply.after}
        </p>
      ) : (
        <p className="m-0 max-w-[62ch] text-lg leading-[1.6] text-foreground">
          Only the real Dungeon Master answers that one. It reads anything you type, once you are inside.{" "}
          <button
            type="button"
            onClick={onEnter}
            className={`rounded-[4px] font-semibold text-foreground underline underline-offset-4 hover:text-gold ${FOCUS}`}
          >
            Enter with Discord
          </button>
        </p>
      )}
    </motion.div>
  );
}
