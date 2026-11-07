import { useState } from "react";
import { motion } from "motion/react";
import type { CombatAction, EncounterState } from "@/app/api/turn-stream";
import { HealthBar } from "./health-bar";

const FOCUS = "focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-gold focus-visible:ring-0";
const SECONDARY = `h-11 shrink-0 rounded-[4px] border border-input bg-raised px-[18px] text-base font-semibold text-foreground transition-[filter] hover:brightness-125 disabled:opacity-60 disabled:hover:brightness-100 ${FOCUS}`;

interface CombatActionsProps {
  encounter: EncounterState;
  disabled: boolean;
  onAction: (action: CombatAction, targetId: number | null) => void;
}

/** Replaces the action box during a fight: pick a target, then attack, defend or flee. */
export function CombatActions({ encounter, disabled, onAction }: CombatActionsProps) {
  const standing = encounter.enemies.filter((enemy) => enemy.hp > 0);
  const [chosenId, setTargetId] = useState<number | null>(null);
  // The chosen enemy, or the first one standing once they fall.
  const target = standing.find((enemy) => enemy.id === chosenId) ?? standing[0];
  const targetId = target?.id ?? null;

  return (
    <div className="flex flex-col gap-3">
      {/* The player's health stays in view here; on phones the sheet is below the story. */}
      <HealthBar label="You" hp={encounter.player.hp} max={encounter.player.max_hp} />
      <div role="radiogroup" aria-label="Choose a target" className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-2">
        {encounter.enemies.map((enemy) => {
          const down = enemy.hp <= 0;
          const selected = enemy.id === targetId;
          return (
            <button
              key={enemy.id}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={down || disabled}
              onClick={() => setTargetId(enemy.id)}
              className={`rounded-[4px] border bg-raised px-3 py-2 text-left disabled:cursor-default ${
                selected ? "border-gold" : "border-border"
              } ${down ? "opacity-50" : ""} ${FOCUS}`}
            >
              {down ? (
                <span className="flex items-baseline justify-between gap-3 text-[15px] text-muted-foreground">
                  <span className="truncate line-through">{enemy.name}</span>
                  <span className="shrink-0">Down</span>
                </span>
              ) : (
                <HealthBar label={enemy.name} hp={enemy.hp} max={enemy.max_hp} />
              )}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-2.5">
        <motion.button
          type="button"
          whileTap={{ y: 1 }}
          disabled={disabled || !target}
          onClick={() => target && onAction("attack", target.id)}
          className={`h-11 min-w-0 flex-1 truncate rounded-[4px] bg-gold px-[22px] text-base font-semibold text-primary-foreground transition-[filter] hover:brightness-110 disabled:opacity-60 disabled:hover:brightness-100 ${FOCUS}`}
        >
          {target ? `Attack ${target.name}` : "Attack"}
        </motion.button>
        <motion.button type="button" whileTap={{ y: 1 }} disabled={disabled} onClick={() => onAction("defend", null)} className={SECONDARY}>
          Defend
        </motion.button>
        <motion.button type="button" whileTap={{ y: 1 }} disabled={disabled} onClick={() => onAction("flee", null)} className={SECONDARY}>
          Flee
        </motion.button>
      </div>
    </div>
  );
}
