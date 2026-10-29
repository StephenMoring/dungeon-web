import { useEffect, useRef, useState } from "react";
import { Dices } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { Roll } from "@/app/api/turn-stream";

interface RollCardProps {
  roll: Roll;
  animate: boolean;
  onSettled?: () => void;
}

const ROLL_MS = 700;
const TICK_MS = 70;

const capitalize = (word: string) => word.charAt(0).toUpperCase() + word.slice(1);

export function rollSummary(roll: Roll): string {
  return `${capitalize(roll.stat)} check · ${capitalize(roll.difficulty)} · ${roll.roll} + ${roll.stat_value} = ${roll.total} vs ${roll.target} · ${roll.success ? "Success" : "Failure"}`;
}

export function RollCard({ roll, animate, onSettled }: RollCardProps) {
  const reduce = useReducedMotion();
  const tumble = animate && !reduce;
  const [settled, setSettled] = useState(!tumble);
  const [face, setFace] = useState(roll.roll);
  const onSettledRef = useRef(onSettled);
  onSettledRef.current = onSettled;

  useEffect(() => {
    if (!tumble) {
      onSettledRef.current?.();
      return;
    }
    const ticker = setInterval(() => setFace(Math.floor(Math.random() * 20) + 1), TICK_MS);
    const done = setTimeout(() => {
      clearInterval(ticker);
      setFace(roll.roll);
      setSettled(true);
      onSettledRef.current?.();
    }, ROLL_MS);
    return () => {
      clearInterval(ticker);
      clearTimeout(done);
    };
  }, [tumble, roll.roll]);

  const summary = rollSummary(roll);

  return (
    <div
      role="status"
      aria-label={settled ? summary : `Rolling ${roll.stat} check`}
      className="flex max-w-[62ch] items-center gap-3 rounded-[4px] border border-border bg-card px-3.5 py-2.5"
    >
      <motion.span
        aria-hidden="true"
        animate={settled ? { rotate: 0, scale: 1 } : { rotate: [0, -12, 12, 0], scale: [1, 1.08, 1] }}
        transition={settled ? { type: "spring", stiffness: 400, damping: 24 } : { duration: 0.35, repeat: Infinity }}
        className="inline-flex h-9 min-w-9 items-center justify-center rounded-[4px] bg-ember px-2 text-base font-semibold tabular-nums text-destructive-foreground"
      >
        {face}
      </motion.span>
      {settled ? (
        <span className="text-[15px] tabular-nums text-foreground">{summary}</span>
      ) : (
        <span className="inline-flex items-center gap-1.5 text-[15px] text-muted-foreground">
          <Dices className="size-4" aria-hidden="true" />
          Rolling {capitalize(roll.stat)}…
        </span>
      )}
    </div>
  );
}
