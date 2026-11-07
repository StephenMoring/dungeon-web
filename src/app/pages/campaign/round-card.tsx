import { useEffect, useRef, useState } from "react";
import { Swords } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { Attack, CombatRound } from "@/app/api/turn-stream";

interface RoundCardProps {
  round: CombatRound;
  animate: boolean;
  onSettled?: () => void;
}

const ROLL_MS = 700;
const TICK_MS = 70;

function attackLine(attack: Attack, player: boolean): string {
  const dice = `${attack.roll} + ${attack.bonus} = ${attack.total} vs ${attack.defense}`;
  const who = player ? `Attack ${attack.target}` : `${attack.attacker} attacks`;
  if (!attack.hit) return `${who} · ${dice} · Miss`;
  const hit = attack.crit ? "Critical hit" : "Hit";
  const fell = attack.target_hp === 0 ? ` · ${attack.target} falls` : "";
  return `${who} · ${dice} · ${hit} · ${attack.damage} damage${fell}`;
}

/** Every roll in the round, in the order the server resolved them. */
export function roundLines(round: CombatRound): string[] {
  const lines: string[] = [];
  if (round.attack) lines.push(attackLine(round.attack, true));
  if (round.defended) lines.push("Defend · +4 defense this round");
  if (round.flee) {
    const { roll, bonus, total, target, success } = round.flee;
    lines.push(`Escape · ${roll} + ${bonus} = ${total} vs ${target} · ${success ? "Got away" : "Cut off"}`);
  }
  for (const attack of round.enemy_attacks) lines.push(attackLine(attack, false));
  if (round.outcome === "won") lines.push("Victory");
  if (round.outcome === "fled") lines.push("Escaped");
  if (round.outcome === "lost") lines.push(`${round.character} has fallen`);
  return lines;
}

/** The die to animate: the player's own roll, else the first enemy's. */
function headlineRoll(round: CombatRound): number {
  return round.attack?.roll ?? round.flee?.roll ?? round.enemy_attacks[0]?.roll ?? 0;
}

export function RoundCard({ round, animate, onSettled }: RoundCardProps) {
  const reduce = useReducedMotion();
  const tumble = animate && !reduce;
  const [settled, setSettled] = useState(!tumble);
  const finalFace = headlineRoll(round);
  const [face, setFace] = useState(finalFace);
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
      setFace(finalFace);
      setSettled(true);
      onSettledRef.current?.();
    }, ROLL_MS);
    return () => {
      clearInterval(ticker);
      clearTimeout(done);
    };
  }, [tumble, finalFace]);

  const lines = roundLines(round);

  return (
    <div
      role="status"
      aria-label={settled ? `Round ${round.round}: ${lines.join(". ")}` : `Rolling round ${round.round}`}
      className="flex max-w-[62ch] items-start gap-3 rounded-[4px] border border-border bg-card px-3.5 py-2.5"
    >
      <motion.span
        aria-hidden="true"
        animate={settled ? { rotate: 0, scale: 1 } : { rotate: [0, -12, 12, 0], scale: [1, 1.08, 1] }}
        transition={settled ? { type: "spring", stiffness: 400, damping: 24 } : { duration: 0.35, repeat: Infinity }}
        className="inline-flex h-9 min-w-9 shrink-0 items-center justify-center rounded-[4px] bg-ember px-2 text-base font-semibold tabular-nums text-destructive-foreground"
      >
        {face}
      </motion.span>
      {settled ? (
        <div className="min-w-0">
          <p className="m-0 text-[15px] font-semibold text-muted-foreground">Round {round.round}</p>
          <ul className="m-0 list-none p-0 text-[15px] tabular-nums text-foreground">
            {lines.map((line, index) => (
              <li key={`${index}-${line}`}>{line}</li>
            ))}
          </ul>
        </div>
      ) : (
        <span className="inline-flex items-center gap-1.5 self-center text-[15px] text-muted-foreground">
          <Swords className="size-4" aria-hidden="true" />
          Round {round.round}…
        </span>
      )}
    </div>
  );
}
