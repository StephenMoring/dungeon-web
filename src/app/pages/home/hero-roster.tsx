import { Link } from "react-router";
import { motion } from "motion/react";
import type { CharacterWithCampaign } from "@/app/api/characters";

const MotionLink = motion.create(Link);

const CARD =
  "flex h-full w-full items-center justify-between gap-3 rounded-[4px] border px-[18px] py-4 text-left text-foreground transition-colors hover:border-input focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-gold";
const SOLID = `${CARD} border-border bg-card`;
const DASHED = `${CARD} border-dashed border-border bg-transparent`;
const LIFT = { whileHover: { y: -1 }, whileTap: { y: 0 }, transition: { duration: 0.12 } };

interface CardBodyProps {
  name: string;
  meta: string;
  action: string;
}

function CardBody({ name, meta, action }: CardBodyProps) {
  return (
    <>
      <span className="min-w-0 break-words">
        <span className="block font-display text-[22px] leading-tight">{name}</span>
        <span className="block text-sm text-muted-foreground">{meta}</span>
      </span>
      <span className="shrink-0 whitespace-nowrap text-sm font-semibold text-gold">{action}</span>
    </>
  );
}

interface HeroRosterProps {
  items: CharacterWithCampaign[];
  onBegin: (item: CharacterWithCampaign) => void;
}

export function HeroRoster({ items, onBegin }: HeroRosterProps) {
  // Heroes plus the forge card; four across only when that fills whole rows, else three.
  const wide = (items.length + 1) % 4 === 0 ? "min-[1100px]:grid-cols-4" : "min-[1100px]:grid-cols-3";

  return (
    <section aria-labelledby="roster-title" className="px-6 pb-6 pt-7 max-[759px]:px-4 max-[759px]:pb-4 max-[759px]:pt-5">
      <h2 id="roster-title" className="mb-3 text-base font-semibold text-foreground">
        Your heroes
      </h2>
      <ul className={`m-0 grid list-none grid-cols-1 gap-4 p-0 min-[760px]:grid-cols-2 ${wide}`}>
        {items.map((item) => {
          const { character, campaign } = item;
          const campaignId = character.campaign_id;
          if (campaignId != null) {
            return (
              <li key={character.id}>
                <MotionLink to={`/adventure/${campaignId}`} className={SOLID} {...LIFT}>
                  <CardBody
                    name={character.name}
                    meta={`${character.hero_class} · ${campaign?.name ?? "your campaign"}`}
                    action="Continue"
                  />
                </MotionLink>
              </li>
            );
          }
          return (
            <li key={character.id}>
              <motion.button type="button" onClick={() => onBegin(item)} className={SOLID} {...LIFT}>
                <CardBody name={character.name} meta={`${character.hero_class} · No campaign yet`} action="Begin" />
              </motion.button>
            </li>
          );
        })}
        <li>
          <MotionLink to="/character/new" className={DASHED} {...LIFT}>
            <CardBody name="Forge a hero" meta="New character and campaign" action="Create" />
          </MotionLink>
        </li>
      </ul>
    </section>
  );
}
