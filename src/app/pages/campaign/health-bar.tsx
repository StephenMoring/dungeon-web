import { motion } from "motion/react";

interface HealthBarProps {
  label: string;
  hp: number;
  max: number;
  /** Shows "12 / 20" beside the label. */
  showNumbers?: boolean;
}

/** Hit points as an ember bar. Every number comes from the server. */
export function HealthBar({ label, hp, max, showNumbers = true }: HealthBarProps) {
  const percent = max > 0 ? Math.max(0, Math.min(100, (hp / max) * 100)) : 0;
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-3 text-[15px]">
        <span className="min-w-0 truncate text-muted-foreground">{label}</span>
        {showNumbers && (
          <span className="shrink-0 font-semibold tabular-nums text-foreground">
            {hp} / {max}
          </span>
        )}
      </div>
      <div
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={hp}
        aria-valuetext={`${hp} of ${max} health`}
        className="h-2 overflow-hidden rounded-[4px] bg-raised"
      >
        <motion.div
          className="h-full rounded-[4px] bg-ember"
          initial={false}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
