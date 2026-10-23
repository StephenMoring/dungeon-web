import { motion } from "motion/react";
import { Credits } from "@/app/components/shared/credits";
import type { ArtId } from "@/app/art/registry";
import { EnterButton } from "./enter-button";
import { Reveal } from "./reveal";
import { SECTION_LINKS } from "./landing-nav";
import { EASE_EXPO, FOCUS, GRID, HEAD, MARGIN } from "./classes";

interface LandingFooterProps {
  onEnter: () => void;
  art: ArtId[];
}

const LINK = `rounded-[4px] text-lg text-foreground underline decoration-transparent underline-offset-[6px] transition-[text-decoration-color] duration-200 hover:decoration-current ${FOCUS}`;

/** Invitation over a cropped name: the close, the credits, and the wordmark cut by the page's edge. */
export function LandingFooter({ onEnter, art }: LandingFooterProps) {
  return (
    <footer className="relative overflow-hidden bg-card pt-[160px] max-[759px]:pt-20">
      <div className={`${MARGIN} ${GRID}`}>
        <div className="min-[760px]:col-span-7">
          <Reveal>
            <h2 className={`m-0 text-foreground ${HEAD}`}>
              <span className="block">Bring a hero</span>
              <span className="block">to the table</span>
            </h2>
          </Reveal>
          <Reveal step={1} className="mt-8">
            <EnterButton onClick={onEnter} className="max-[759px]:w-full" />
          </Reveal>
        </div>
        <Reveal step={2} className="min-[760px]:col-span-3 min-[760px]:col-start-10 max-[759px]:mt-10">
          <nav aria-label="Footer">
            <ul className="m-0 flex list-none flex-col gap-3 p-0 max-[759px]:flex-row max-[759px]:flex-wrap max-[759px]:gap-x-6">
              {SECTION_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className={LINK}>
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <a href="#top" className={LINK}>
                  Back to the top
                </a>
              </li>
            </ul>
          </nav>
        </Reveal>
      </div>

      <div className={`mt-[140px] flex flex-wrap items-end justify-between gap-x-10 gap-y-3 max-[759px]:mt-16 ${MARGIN}`}>
        <div className="max-w-[90ch] [&_p]:text-[15px] [&_p]:leading-[1.5] [&_p]:text-muted-foreground">
          <Credits ids={art} />
        </div>
        <p className="m-0 text-[15px] text-muted-foreground">Sign-in reads your Discord name and email, nothing else.</p>
      </div>

      <div aria-hidden="true" className="mt-2 overflow-hidden">
        <motion.p
          className="m-0 whitespace-nowrap pl-4 font-display text-[28vw] leading-[0.9] text-foreground min-[760px]:pl-8 max-[759px]:text-[34vw]"
          initial={{ y: "45%" }}
          whileInView={{ y: "30%" }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: EASE_EXPO }}
        >
          Dungeon
        </motion.p>
      </div>
    </footer>
  );
}
