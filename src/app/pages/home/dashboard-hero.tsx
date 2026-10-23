import type { ReactNode } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { ArtImage } from "@/app/components/shared/art-image";
import { Navbar } from "@/app/components/shared/navbar";
import type { ContinueTarget } from "./continue-target";

const MotionLink = motion.create(Link);

// Neutral black scrim over the painting: a top band behind the overlay navbar, and a fade from the
// left (from the top on phones) behind the headline. The one gradient the redesign allows.
const SCRIM =
  "bg-[linear-gradient(180deg,rgba(0,0,0,.5)_0,rgba(0,0,0,0)_96px),linear-gradient(90deg,rgba(0,0,0,.55)_0%,rgba(0,0,0,.35)_38%,rgba(0,0,0,0)_62%)] max-[759px]:bg-[linear-gradient(180deg,rgba(0,0,0,.6)_0%,rgba(0,0,0,.35)_50%,rgba(0,0,0,0)_75%)]"; // taste-skill-ignore: neutral scrim behind hero text

interface DashboardHeroProps {
  /** Null while the heroes are loading: the hero then shows a quiet line and no action. */
  target: ContinueTarget | null;
  /** Name of the hero the continue action belongs to, for the sentence. */
  heroName?: string;
  /** Shown in place of the sentence and action, e.g. the load error. */
  status?: ReactNode;
}

export function DashboardHero({ target, heroName, status }: DashboardHeroProps) {
  const continuing = target?.kind === "continue";
  const sentence =
    continuing && heroName
      ? `Your Dungeon Master waits on the plain. Pick up where ${heroName} fell, or forge someone new.`
      : "Your Dungeon Master waits on the plain. Forge a hero to begin.";

  return (
    <section aria-labelledby="dashboard-title" className="relative h-[520px] max-[759px]:h-[560px]">
      <div className="absolute inset-0">
        <ArtImage id="pandemonium" priority className="h-full w-full" />
      </div>
      <div aria-hidden="true" className={`absolute inset-0 ${SCRIM}`} />
      <Navbar variant="overlay" />

      <div className="relative max-w-[720px] px-6 pt-32 max-[759px]:px-4 max-[759px]:pt-24">
        <h1
          id="dashboard-title"
          className="m-0 mb-3.5 font-display text-[68px] font-normal leading-none text-foreground max-[759px]:text-[44px]"
        >
          The gate is already burning
        </h1>
        {status ? (
          status
        ) : target === null ? (
          <p className="m-0 max-w-[40ch] text-lg text-muted-foreground">Gathering your heroes…</p>
        ) : (
          <>
            <p className="mb-7 max-w-[40ch] text-lg text-foreground">{sentence}</p>
            <MotionLink
              to={target.kind === "continue" ? `/adventure/${target.campaignId}` : "/character/new"}
              whileTap={{ y: 1 }}
              className="inline-flex min-h-11 max-w-full items-center rounded-[4px] bg-gold px-[22px] py-2.5 text-base font-semibold leading-snug text-primary-foreground transition-[filter] hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-gold"
            >
              {target.kind === "continue" ? `Continue ${target.campaignName}` : "Forge a hero"}
            </MotionLink>
          </>
        )}
      </div>

      <p className="absolute bottom-3.5 right-6 m-0 text-[13px] text-muted-foreground max-[759px]:left-4 max-[759px]:right-auto">
        John Martin, Pandemonium, 1841
      </p>
    </section>
  );
}
