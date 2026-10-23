import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArtImage } from "@/app/components/shared/art-image";
import { Reveal } from "./reveal";
import { TurnReply } from "./turn-reply";
import { TURN_ACTIONS, TURN_SCENE, replyFor } from "./turn-script";
import { BODY, DISPLAY, EASE_OUT, FOCUS, GRID_WIDE, LEAD, MARGIN } from "./classes";

interface TurnSectionProps {
  onEnter: () => void;
}

/**
 * The live thing: one turn of "The Whispering Tomb". The heading is the question the Dungeon Master
 * ends every turn on, with the red sun of Wrath set where the deed would be. The first action and its
 * reply are rendered from the start, so the section reads whole without any interaction.
 */
export function TurnSection({ onEnter }: TurnSectionProps) {
  const first = TURN_ACTIONS[0].action;
  const [draft, setDraft] = useState(first);
  const [sent, setSent] = useState(first);

  function act(action: string) {
    setDraft(action);
    setSent(action.trim());
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (draft.trim()) setSent(draft.trim());
  }

  return (
    <section id="turn" aria-labelledby="turn-title" className={`scroll-mt-8 pt-[200px] max-[759px]:pt-24 ${MARGIN}`}>
      <div className={`${GRID_WIDE} min-[1100px]:items-end`}>
        <Reveal className="min-[1100px]:col-span-7">
          <h2 id="turn-title" aria-label="What do you do?" className={`m-0 text-foreground ${DISPLAY}`}>
            <span className="block">What do you</span>
            <span className="block">
              <span className="relative mr-[0.22em] inline-block h-[0.7em] w-[2.3em] overflow-hidden align-baseline">
                <ArtImage id="wrath-chip" className="absolute inset-0 h-full w-full" />
              </span>
              do?
            </span>
          </h2>
        </Reveal>
        <Reveal step={1} className="min-[1100px]:col-span-5 min-[1100px]:col-start-8 min-[1100px]:pb-4 max-[1099px]:mt-12">
          <p className={`m-0 max-w-[52ch] text-foreground ${LEAD}`}>{TURN_SCENE}</p>
        </Reveal>
      </div>

      <div className={`mt-16 max-[759px]:mt-10 ${GRID_WIDE}`}>
        <div className="min-[1100px]:col-span-6">
          <Reveal step={2}>
            <form data-ui onSubmit={onSubmit} className="flex gap-2">
              <label htmlFor="turn-action" className="sr-only">
                Your action
              </label>
              <input
                id="turn-action"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="What do you do?"
                autoComplete="off"
                className={`h-14 min-w-0 flex-1 rounded-[4px] border border-input bg-raised px-4 text-lg text-foreground placeholder:text-faint ${FOCUS}`}
              />
              <motion.button
                type="submit"
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.14, ease: EASE_OUT }}
                className={`h-14 rounded-[4px] border border-input px-5 text-base font-semibold text-foreground transition-colors duration-200 hover:border-muted-foreground ${FOCUS}`}
              >
                Act
              </motion.button>
            </form>
          </Reveal>

          <Reveal step={3} className="mt-6">
            <p className={`m-0 text-muted-foreground ${BODY}`}>Or try one of these:</p>
            <ul className="m-0 mt-3 flex list-none flex-wrap gap-2 p-0 min-[1100px]:grid min-[1100px]:grid-cols-2">
              {TURN_ACTIONS.map(({ action }) => (
                <li key={action}>
                  <motion.button
                    type="button"
                    onClick={() => act(action)}
                    aria-pressed={sent === action}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.14, ease: EASE_OUT }}
                    className={`min-h-11 rounded-[4px] px-4 text-left min-[1100px]:w-full text-base font-medium transition-colors duration-200 ${
                      sent === action
                        ? "bg-raised text-foreground"
                        : "bg-card text-muted-foreground hover:text-foreground"
                    } ${FOCUS}`}
                  >
                    {action}
                  </motion.button>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal step={2} className="min-[1100px]:col-span-5 min-[1100px]:col-start-8 max-[1099px]:mt-10">
          <div data-ui aria-live="polite" className="rounded-[4px] border border-border bg-card p-6 max-[759px]:p-4">
            <AnimatePresence mode="wait">
              <TurnReply key={sent} action={sent} reply={replyFor(sent)} onEnter={onEnter} />
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
