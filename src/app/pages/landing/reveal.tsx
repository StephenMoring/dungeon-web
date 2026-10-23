import type { ReactNode } from "react";
import { motion } from "motion/react";
import { EASE_EXPO } from "./classes";

interface RevealProps {
  children: ReactNode;
  /** Position in the section's reading order; each step waits 70ms. */
  step?: number;
  className?: string;
}

/**
 * Entrance for one part of a section: rises 24px with opacity, once, as it enters.
 * Under reduced motion (MotionConfig "user") the travel is dropped and only the fade remains.
 */
export function Reveal({ children, step = 0, className = "" }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.8, delay: step * 0.07, ease: EASE_EXPO }}
    >
      {children}
    </motion.div>
  );
}
