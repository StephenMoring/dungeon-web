import { useState } from "react";
import { CharacterPlate } from "./character-plate";
import { Reveal } from "./reveal";
import { MarginNote } from "./margin-note";
import { SHEET_NOTES, type SheetPart } from "./sample-hero";
import { GRID_WIDE, HEAD, MARGIN } from "./classes";

const SLICES: { parts: SheetPart[]; notes: string[] }[] = [
  { parts: ["name", "wounds"], notes: ["Name and calling", "Wounds"] },
  { parts: ["stats"], notes: ["Seven attributes", "Weighed, not obeyed", "Rolled from your words"] },
  { parts: ["bio"], notes: ["A life before"] },
];

/** Panel with margin notes: the character sheet shown whole, like a plate in a manual. */
export function HeroesSection() {
  const [active, setActive] = useState<SheetPart | null>(null);

  return (
    <section id="heroes" aria-labelledby="heroes-title" className={`scroll-mt-8 pt-[200px] max-[759px]:pt-24 ${MARGIN}`}>
      {/* Desktop and tablet: the plate in columns 5–8, notes in both margins level with their parts. */}
      <div className={`relative max-[1099px]:hidden ${GRID_WIDE}`}>
        <div className="relative col-span-4">
          <Reveal>
            <h2 id="heroes-title" className={`m-0 text-right text-foreground ${HEAD}`}>
              <span className="block">Seven numbers</span>
              <span className="block">and a story</span>
            </h2>
          </Reveal>
          {SHEET_NOTES.filter((n) => n.side === "left").map((note, i) => (
            <Reveal key={note.name} step={i + 2} className={`absolute right-0 flex w-full justify-end text-right ${note.top}`}>
              <MarginNote note={note} active={active === note.part} onShow={setActive} className="text-right" />
            </Reveal>
          ))}
        </div>
        <Reveal step={1} className="col-span-4 flex justify-center">
          <CharacterPlate active={active} />
        </Reveal>
        <div className="relative col-span-4">
          {SHEET_NOTES.filter((n) => n.side === "right").map((note, i) => (
            <Reveal key={note.name} step={i + 2} className={`absolute left-0 w-full text-left ${note.top}`}>
              <MarginNote note={note} active={active === note.part} onShow={setActive} className="text-left" />
            </Reveal>
          ))}
        </div>
      </div>

      {/* Phone and tablet: the plate in three slices, each followed by its notes. */}
      <div className="min-[1100px]:hidden">
        <Reveal>
          <h2 className={`m-0 text-foreground ${HEAD}`}>
            Seven numbers and a story
          </h2>
        </Reveal>
        {SLICES.map((slice) => (
          <div key={slice.notes[0]} className="mt-14 max-w-[560px] first-of-type:mt-10">
            <Reveal>
              <CharacterPlate active={null} parts={slice.parts} />
            </Reveal>
            <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-5">
              {SHEET_NOTES.filter((n) => slice.notes.includes(n.name)).map((note, i) => (
                <Reveal key={note.name} step={i + 1}>
                  <p className="m-0 text-base font-medium text-foreground">{note.name}</p>
                  <p className="m-0 mt-1 text-base leading-[1.45] text-muted-foreground">{note.text}</p>
                </Reveal>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
