import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { finishRest, type RestState } from "@/app/api/combat";
import type { Character } from "@/app/api/characters";
import { Campfire } from "./campfire";

interface RestOverlayProps {
  characterId: number;
  rest: RestState;
  onRested: (character: Character) => void;
  onFailed: (message: string) => void;
}

const TICK_MS = 250;
const RETRY_MS = 1000;
const MAX_RETRIES = 5;

/**
 * Covers the story while the character rests. It can't be dismissed: the server
 * heals only once the rest has lasted `rest.seconds`, so the fire burns that long.
 */
export function RestOverlay({ characterId, rest, onRested, onFailed }: RestOverlayProps) {
  // Count from the server's seconds_left, not its clock, so a skewed device clock can't shorten or stretch the rest.
  const deadline = useRef(Date.now() + rest.seconds_left * 1000);
  const [left, setLeft] = useState(rest.seconds_left);
  const finishing = useRef(false);
  const handlers = useRef({ onRested, onFailed });
  handlers.current = { onRested, onFailed };

  useEffect(() => {
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    const finish = (attempt: number) => {
      finishRest(characterId)
        .then((character) => handlers.current.onRested(character))
        .catch((error: unknown) => {
          // A 409 just before the server's deadline: wait a moment and ask again.
          if (attempt < MAX_RETRIES) retryTimer = setTimeout(() => finish(attempt + 1), RETRY_MS);
          else handlers.current.onFailed(error instanceof Error ? error.message : "Couldn't finish resting");
        });
    };
    const tick = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((deadline.current - Date.now()) / 1000));
      setLeft(remaining);
      if (remaining === 0 && !finishing.current) {
        finishing.current = true;
        finish(0);
      }
    }, TICK_MS);
    return () => {
      clearInterval(tick);
      clearTimeout(retryTimer);
    };
  }, [characterId]);

  const done = rest.seconds - left;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="rest-title"
      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-background px-6 text-center"
    >
      <Campfire />
      <h2 id="rest-title" className="m-0 text-xl font-semibold text-foreground">
        Resting by the fire
      </h2>
      <p className="m-0 max-w-[40ch] text-[15px] leading-relaxed text-muted-foreground">
        You make camp and let the fire burn low. Your wounds close while it does.
      </p>
      <div className="w-full max-w-[280px]">
        <div
          role="progressbar"
          aria-label="Rest"
          aria-valuemin={0}
          aria-valuemax={rest.seconds}
          aria-valuenow={done}
          className="h-2 overflow-hidden rounded-[4px] bg-raised"
        >
          <motion.div
            className="h-full rounded-[4px] bg-gold"
            initial={false}
            animate={{ width: `${(done / rest.seconds) * 100}%` }}
            transition={{ duration: 0.3, ease: "linear" }}
          />
        </div>
        <p className="mb-0 mt-2 text-[15px] tabular-nums text-muted-foreground" aria-live="off">
          {left > 0 ? `${left}s` : "Breaking camp…"}
        </p>
      </div>
    </motion.div>
  );
}
