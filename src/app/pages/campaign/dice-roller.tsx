import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Dices } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface DiceRollerProps {
  onRoll?: (result: number, diceType: number) => void;
}

export function DiceRoller({ onRoll }: DiceRollerProps) {
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [diceType, setDiceType] = useState(20);

  const diceTypes = [4, 6, 8, 10, 12, 20, 100];

  const rollDice = () => {
    setIsRolling(true);
    setResult(null);

    // Simulate rolling animation
    setTimeout(() => {
      const rolled = Math.floor(Math.random() * diceType) + 1;
      setResult(rolled);
      setIsRolling(false);
      onRoll?.(rolled, diceType);
    }, 600);
  };

  const getCriticalClass = (result: number, max: number) => {
    if (result === max) return "text-yellow-400 font-bold animate-pulse";
    if (result === 1) return "text-red-400 font-bold";
    return "text-primary-foreground";
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {diceTypes.map((type) => (
          <button
            key={type}
            onClick={() => setDiceType(type)}
            className={`px-2 py-1 text-xs rounded transition-all ${
              diceType === type
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            d{type}
          </button>
        ))}
      </div>

      <Button
        onClick={rollDice}
        disabled={isRolling}
        size="sm"
        className="gap-2 relative overflow-hidden"
      >
        <motion.div
          animate={isRolling ? { rotate: 360 } : { rotate: 0 }}
          transition={{ duration: 0.6, repeat: isRolling ? Infinity : 0 }}
        >
          <Dices className="h-4 w-4" />
        </motion.div>
        Roll
      </Button>

      <AnimatePresence mode="wait">
        {result !== null && (
          <motion.div
            key={result}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className={`w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl font-bold shadow-lg ${getCriticalClass(
              result,
              diceType
            )}`}
          >
            {result}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
