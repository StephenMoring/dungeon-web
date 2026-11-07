import { motion, useReducedMotion } from "motion/react";

const SPARKS = [
  { x: 92, delay: 0 },
  { x: 106, delay: 0.7 },
  { x: 100, delay: 1.3 },
  { x: 112, delay: 1.9 },
];

/** A small campfire drawn in the palette's ember and gold; still under reduced motion. */
export function Campfire() {
  const reduce = useReducedMotion();
  const flicker = (scale: number[], duration: number) =>
    reduce ? {} : { animate: { scaleY: scale, scaleX: [1, 0.94, 1.03, 1] }, transition: { duration, repeat: Infinity, ease: "easeInOut" as const } };

  return (
    <svg viewBox="0 0 200 170" className="h-auto w-[220px] max-w-full" aria-hidden="true">
      {/* Stones */}
      {[40, 62, 86, 114, 138, 160].map((x, i) => (
        <ellipse key={x} cx={x} cy={150 - (i === 0 || i === 5 ? 2 : 0)} rx="13" ry="8" className="fill-input" />
      ))}
      {/* Logs */}
      <rect x="48" y="128" width="104" height="14" rx="6" transform="rotate(-14 100 135)" className="fill-raised stroke-border" strokeWidth="2" />
      <rect x="48" y="128" width="104" height="14" rx="6" transform="rotate(14 100 135)" className="fill-raised stroke-border" strokeWidth="2" />
      {/* Flames, outer to inner, each anchored at its base */}
      <motion.path
        d="M100 132 C64 128 62 96 80 76 C82 92 90 96 92 88 C90 66 100 46 112 30 C110 52 128 64 130 88 C136 80 136 72 134 64 C150 84 144 128 100 132 Z"
        className="origin-bottom fill-ember [transform-box:fill-box]"
        {...flicker([1, 1.08, 0.95, 1], 1.1)}
      />
      <motion.path
        d="M100 132 C78 130 76 108 88 94 C90 104 96 106 98 98 C96 84 104 70 110 60 C112 78 124 86 122 104 C126 100 128 96 128 92 C134 108 126 130 100 132 Z"
        className="origin-bottom fill-gold [transform-box:fill-box]"
        {...flicker([1, 0.92, 1.1, 1], 0.8)}
      />
      <motion.path
        d="M100 132 C88 131 88 118 94 110 C96 116 100 116 100 110 C100 102 104 96 106 92 C110 104 116 112 112 122 C110 128 106 132 100 132 Z"
        className="origin-bottom fill-foreground [transform-box:fill-box]"
        {...flicker([1, 1.12, 0.9, 1], 0.6)}
      />
      {/* Sparks */}
      {!reduce &&
        SPARKS.map(({ x, delay }) => (
          <motion.circle
            key={x}
            cx={x}
            cy={60}
            r="2"
            className="fill-gold"
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: [0, 1, 0], y: [0, -50], x: [0, x % 2 ? 6 : -6] }}
            transition={{ duration: 2.4, repeat: Infinity, delay, ease: "easeOut" }}
          />
        ))}
    </svg>
  );
}
