import { motion } from "motion/react";
import { ArtImage } from "@/app/components/shared/art-image";
import { EnterButton } from "./enter-button";
import { Reveal } from "./reveal";
import { BODY, DISPLAY, EASE_EXPO, EASE_OUT, FOCUS, MARGIN } from "./classes";

interface DescentSectionProps {
  onEnter: () => void;
}

const LINE = `absolute inset-x-4 text-center text-foreground min-[760px]:inset-x-8 ${DISPLAY}`;

/** Question at both edges, over The Deluge: the closing choice between going in and reading again. */
export function DescentSection({ onEnter }: DescentSectionProps) {
  return (
    <section aria-labelledby="descent-title" className="relative mt-[200px] h-svh min-h-[640px] overflow-hidden bg-background max-[759px]:mt-24">
      <div className="absolute inset-0">
        <ArtImage id="deluge" className="h-full w-full" />
      </div>
      {/* taste-skill-ignore: neutral scrim so the question and the buttons stay readable on the painting */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-black/25" />

      <h2 id="descent-title" className="m-0">
        <motion.span
          className={`${LINE} top-8 block`}
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: EASE_EXPO }}
        >
          Will you
        </motion.span>{" "}
        <motion.span
          className={`${LINE} bottom-6 block`}
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.11, ease: EASE_EXPO }}
        >
          go down?
        </motion.span>
      </h2>

      <div className={`pointer-events-none relative flex h-full flex-col items-center justify-center ${MARGIN}`}>
        <Reveal step={2} className="pointer-events-auto flex items-center gap-10 max-[759px]:w-[72%] max-[759px]:flex-col max-[759px]:gap-3">
          <EnterButton onClick={onEnter} className="h-14 min-w-[220px] text-lg max-[759px]:w-full max-[759px]:min-w-0" />
          <span className={`text-muted-foreground ${BODY}`}>or</span>
          <motion.a
            href="#turn"
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.14, ease: EASE_OUT }}
            className={`inline-flex h-14 min-w-[220px] items-center justify-center rounded-[4px] border border-foreground/60 bg-background/70 px-5 text-lg font-semibold text-foreground transition-colors duration-200 hover:border-foreground max-[759px]:w-full max-[759px]:min-w-0 ${FOCUS}`}
          >
            Read the turn again
          </motion.a>
        </Reveal>
        <Reveal step={3} className="pointer-events-auto mt-5">
          <p className={`m-0 max-w-[46ch] text-center text-foreground ${BODY}`}>
            Campaigns are kept. Leave in the middle of a scene and it is waiting when you come back.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
