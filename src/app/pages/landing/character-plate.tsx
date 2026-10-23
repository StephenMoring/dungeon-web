import type { SheetPart } from "./sample-hero";
import { SAMPLE_HERO } from "./sample-hero";

interface CharacterPlateProps {
  /** The part a margin note is pointing at, shown at full strength on a raised ground. */
  active: SheetPart | null;
  /** Render only these parts (the phone shows the plate in slices). */
  parts?: SheetPart[];
}

const ALL: SheetPart[] = ["name", "wounds", "stats", "bio"];

function partClass(part: SheetPart, active: SheetPart | null): string {
  return `rounded-[4px] px-3 py-3 transition-colors duration-200 ${active === part ? "bg-raised" : "bg-transparent"}`;
}

/** A real fragment of the character sheet: name, wounds, seven attributes, biography. */
export function CharacterPlate({ active, parts = ALL }: CharacterPlateProps) {
  const hero = SAMPLE_HERO;
  return (
    <div data-ui className="flex w-full max-w-[380px] flex-col gap-2 rounded-[4px] border border-border bg-card p-3">
      {parts.includes("name") && (
        <div className={partClass("name", active)}>
          <p className="m-0 font-display text-[28px] leading-tight text-foreground">{hero.name}</p>
          <p className="m-0 mt-1 text-[15px] text-muted-foreground">{hero.kind}</p>
          <p className="m-0 text-[15px] text-muted-foreground">{hero.campaign}</p>
        </div>
      )}
      {parts.includes("wounds") && (
        <div className={partClass("wounds", active)}>
          <div className="flex items-baseline justify-between">
            <span className="text-[15px] text-foreground">Wounds</span>
            <span className="tabular-nums text-foreground">
              <span className="text-[28px] font-semibold">{hero.wounds.current}</span>
              <span className="text-[15px] text-muted-foreground"> / {hero.wounds.max}</span>
            </span>
          </div>
          <div className="mt-2 h-2 rounded-[2px] bg-raised" role="img" aria-label={`Wounds ${hero.wounds.current} of ${hero.wounds.max}`}>
            <div className={`h-full rounded-[2px] bg-ember w-[64%]`} />
          </div>
        </div>
      )}
      {parts.includes("stats") && (
        <dl className={`m-0 grid grid-cols-[1fr_auto] gap-x-4 gap-y-2.5 text-[15px] ${partClass("stats", active)}`}>
          {hero.stats.map(([label, value]) => (
            <div key={label} className="contents">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="m-0 text-right font-semibold tabular-nums text-foreground">{value}</dd>
            </div>
          ))}
        </dl>
      )}
      {parts.includes("bio") && (
        <div className={partClass("bio", active)}>
          <p className="m-0 text-[15px] text-muted-foreground">Biography</p>
          <p className="m-0 mt-1.5 text-[15px] leading-[1.5] text-foreground">{hero.biography}</p>
        </div>
      )}
    </div>
  );
}
