import { useState } from "react";
import { Dices } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface DiceRollerProps {
  onRoll?: (result: number, diceType: number) => void;
}

const FOCUS = "focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-gold";
const DICE_TYPES = [4, 6, 8, 10, 12, 20, 100];

export function DiceRoller({ onRoll }: DiceRollerProps) {
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [diceType, setDiceType] = useState(20);
  // The die the shown result was rolled on, so switching dice doesn't relabel an old roll.
  const [rolledOn, setRolledOn] = useState(20);

  const rollDice = () => {
    setIsRolling(true);
    setResult(null);

    // Simulate rolling animation
    setTimeout(() => {
      const rolled = Math.floor(Math.random() * diceType) + 1;
      setResult(rolled);
      setRolledOn(diceType);
      setIsRolling(false);
      onRoll?.(rolled, diceType);
    }, 600);
  };

  const criticalLabel = (value: number, max: number) => {
    if (value === max) return "Critical!";
    if (value === 1) return "Fumble";
    return null;
  };

  const critical = result !== null ? criticalLabel(result, rolledOn) : null;

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
      <div role="group" aria-label="Die" className="flex flex-wrap gap-1">
        {DICE_TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setDiceType(type)}
            aria-pressed={diceType === type}
            className={`h-8 min-w-10 rounded-[4px] border px-2 text-sm tabular-nums transition-colors ${FOCUS} ${
              diceType === type
                ? "border-foreground bg-raised text-foreground"
                : "border-border text-muted-foreground hover:border-input hover:text-foreground"
            }`}
          >
            d{type}
          </button>
        ))}
      </div>

      <motion.button
        type="button"
        onClick={rollDice}
        disabled={isRolling}
        whileTap={{ y: 1 }}
        className={`inline-flex h-8 items-center gap-1.5 rounded-[4px] border border-input px-3 text-sm font-medium text-foreground transition-colors hover:bg-raised disabled:opacity-60 ${FOCUS}`}
      >
        <motion.span
          className="inline-flex"
          animate={isRolling ? { rotate: 360 } : { rotate: 0 }}
          transition={{ duration: 0.6, repeat: isRolling ? Infinity : 0 }}
        >
          <Dices className="size-4" aria-hidden="true" />
        </motion.span>
        Roll d{diceType}
      </motion.button>

      <div aria-live="polite" className="inline-flex items-center gap-2">
        <AnimatePresence mode="wait">
          {result !== null && (
            <motion.span
              key={`${result}-${rolledOn}`}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 24 }}
              className="inline-flex items-center gap-2"
            >
              <span className="sr-only">Rolled d{rolledOn}: </span>
              <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-[2px] bg-ember px-2 text-base font-semibold tabular-nums text-[#1a0800]">
                {result}
              </span>
              {critical && <span className="text-sm font-semibold text-foreground">{critical}</span>}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
