import { Fragment } from "react";
import { motion } from "motion/react";
import { SadakFigure } from "./sadak-figure";
import { Reveal } from "./reveal";
import { MILESTONE_GROUPS } from "./milestones";
import { BODY, EASE_EXPO, GRID_WIDE, HEAD, LEAD, MARGIN } from "./classes";

/** Statement, table pushed right: one sentence starts a campaign; the milestones it is built from. */
export function CampaignsSection() {
  return (
    <section id="campaigns" aria-labelledby="campaigns-title" className={`scroll-mt-8 pt-[200px] max-[759px]:pt-24 ${MARGIN}`}>
      <Reveal>
        <h2 id="campaigns-title" className={`m-0 text-foreground ${HEAD}`}>
          <span className="block min-[760px]:pl-[3vw]">One sentence starts</span>
          <span className="block">a campaign</span>
        </h2>
      </Reveal>

      <div className={`mt-24 max-[759px]:mt-10 ${GRID_WIDE}`}>
        <div className="flex flex-col min-[1100px]:col-span-5">
          <div className="min-[760px]:max-[1099px]:grid min-[760px]:max-[1099px]:grid-cols-[1fr_38%] min-[760px]:max-[1099px]:items-end min-[760px]:max-[1099px]:gap-x-10">
            <div>
              <Reveal step={1}>
                <blockquote className={`m-0 max-w-[30ch] text-foreground ${LEAD}`}>
                  “A dead lord, a broken oath, and a tomb that should have stayed shut.”
                </blockquote>
              </Reveal>
              <Reveal step={2} className="mt-6">
                <p className={`m-0 max-w-[44ch] text-foreground ${BODY}`}>
                  Write the campaign you want in your own words. The Dungeon Master names it, strings it together
                  from twenty milestones written ahead of play, and opens the first scene.
                </p>
              </Reveal>
            </div>
            <Reveal step={3} className="max-[759px]:hidden min-[1100px]:hidden">
              <SadakFigure />
            </Reveal>
          </div>
          <Reveal step={3} className="mt-auto w-[78%] pt-16 max-[1099px]:hidden">
            <SadakFigure />
          </Reveal>
        </div>

        <table className="w-full border-collapse min-[1100px]:col-span-5 min-[1100px]:col-start-8 max-[1099px]:mt-14">
          <caption className="sr-only">A selection of the milestones a campaign is built from</caption>
          <thead className="sr-only">
            <tr>
              <th scope="col">Kind</th>
              <th scope="col">Milestone</th>
              <th scope="col">Who you meet</th>
            </tr>
          </thead>
          <tbody>
            {MILESTONE_GROUPS.map((group, g) => (
              <Fragment key={group.kind}>
                {group.rows.map((row, r) => (
                  <motion.tr
                    key={row.title}
                    className="align-baseline max-[759px]:grid max-[759px]:grid-cols-[1fr_auto]"
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "0px 0px -8% 0px" }}
                    transition={{ duration: 0.7, delay: r * 0.06, ease: EASE_EXPO }}
                  >
                    <td
                      className={`w-[22%] pr-4 text-muted-foreground max-[759px]:col-span-2 max-[759px]:w-auto max-[759px]:pr-0 ${
                        r === 0 && g > 0 ? "pt-11" : r === 0 ? "" : "pt-[26px]"
                      } ${r === 0 ? "" : "max-[759px]:hidden"} text-base`}
                    >
                      {r === 0 ? group.kind : ""}
                    </td>
                    <td
                      className={`pr-4 text-lg font-medium text-foreground ${
                        r === 0 && g > 0 ? "pt-11" : r === 0 ? "" : "pt-[26px]"
                      } max-[759px]:pt-3`}
                    >
                      {row.title}
                    </td>
                    <td
                      className={`text-right text-base text-muted-foreground ${
                        r === 0 && g > 0 ? "pt-11" : r === 0 ? "" : "pt-[26px]"
                      } max-[759px]:pt-3`}
                    >
                      {row.who}
                    </td>
                  </motion.tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>

        <Reveal className="mt-14 ml-auto w-[60%] min-[760px]:hidden">
          <SadakFigure />
        </Reveal>
      </div>
    </section>
  );
}
