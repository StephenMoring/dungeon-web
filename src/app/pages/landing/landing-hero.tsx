import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArtImage } from "@/app/components/shared/art-image";
import { EnterButton } from "./enter-button";
import { DISPLAY, EASE_EXPO, EASE_SOFT, GRID, LEAD, MARGIN } from "./classes";

interface LandingHeroProps {
  onEnter: () => void;
}

// Neutral black scrim: a fade over the sky behind the title, and a band behind the phone action.
// The one gradient the redesign allows.
const SCRIM =
  "bg-[linear-gradient(180deg,rgba(0,0,0,.62)_0%,rgba(0,0,0,.42)_38%,rgba(0,0,0,.3)_56%,rgba(0,0,0,0)_72%)] max-[759px]:bg-[linear-gradient(180deg,rgba(0,0,0,.62)_0%,rgba(0,0,0,.35)_45%,rgba(0,0,0,0)_62%,rgba(0,0,0,0)_78%,rgba(0,0,0,.6)_100%)]"; // taste-skill-ignore: neutral scrim behind hero text

const LINES = ["Your own", "Dungeon Master"];

/** Title in the sky, line on the horizon: Pompeii burning, the title in its red sky. */
export function LandingHero({ onEnter }: LandingHeroProps) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const sink = useTransform(scrollYProgress, [0, 1], ["0%", "7%"]);
  const lift = useTransform(scrollYProgress, [0, 0.7], ["0%", "-12%"]);

  return (
    <section ref={ref} aria-labelledby="landing-title" className="relative h-svh min-h-[640px] overflow-clip bg-background">
      <motion.div
        className="absolute inset-0"
        style={reduce ? undefined : { y: sink }}
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.6, ease: EASE_SOFT }}
      >
        <ArtImage id="pompeii" className="h-full w-full" />
      </motion.div>
      <div aria-hidden="true" className={`pointer-events-none absolute inset-0 ${SCRIM}`} />

      <motion.div className={`pointer-events-none relative flex h-full flex-col ${MARGIN}`} style={reduce ? undefined : { y: lift }}>
        <h1 id="landing-title" className={`pointer-events-auto m-0 mt-[132px] text-center text-foreground max-[759px]:mt-28 ${DISPLAY}`}>
          {LINES.map((line, i) => (
            <span key={line} className="-mb-[0.08em] block overflow-hidden pb-[0.08em]">
              <motion.span
                className="block"
                initial={{ y: "105%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.8, delay: 0.12 + i * 0.11, ease: EASE_EXPO }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p
          className={`pointer-events-auto m-0 mt-8 text-foreground min-[760px]:absolute min-[760px]:inset-x-8 min-[760px]:top-[54%] ${GRID} ${LEAD} max-[759px]:text-center max-[759px]:text-[17px]`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.55, ease: EASE_EXPO }}
        >
          <span className="min-[760px]:col-span-5 min-[760px]:text-right">
            An AI writes a grim campaign around your hero
          </span>{" "}
          <span className="min-[760px]:col-span-5 min-[760px]:col-start-8">and asks, every turn, what you do.</span>
        </motion.p>

        <div className="pointer-events-auto mt-auto pb-6 min-[760px]:hidden">
          <EnterButton onClick={onEnter} className="w-full" />
        </div>
      </motion.div>
    </section>
  );
}
