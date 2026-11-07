import type { Character } from "@/app/api/characters";
import { HealthBar } from "./health-bar";

interface CharacterSheetProps {
  character: Character;
}

type StatKey = "strength" | "perception" | "endurance" | "charisma" | "intelligence" | "agility" | "luck";

const STAT_LABELS: Record<StatKey, string> = {
  strength: "Strength",
  perception: "Perception",
  endurance: "Endurance",
  charisma: "Charisma",
  intelligence: "Intelligence",
  agility: "Agility",
  luck: "Luck",
};

/** The character as the service stores it: class, age, seven stats on a 1–10 scale, and their story. */
export function CharacterSheet({ character }: CharacterSheetProps) {
  return (
    <div className="p-5">
      <h2 className="m-0 break-words font-display text-[26px] font-normal leading-tight text-foreground">
        {character.name || "Unnamed"}
      </h2>
      <p className="mb-[18px] text-[15px] text-muted-foreground">
        {character.hero_class} · Age <span className="tabular-nums">{character.age}</span>
      </p>

      <div className="mb-[18px]">
        {character.died_at ? (
          <p className="m-0 text-[15px] font-semibold text-ember">Dead</p>
        ) : (
          <HealthBar label="Health" hp={character.current_hp} max={character.max_hp} />
        )}
      </div>

      <dl className="m-0 grid grid-cols-[1fr_auto] gap-y-1.5 text-[15px]">
        {(Object.keys(STAT_LABELS) as StatKey[]).map((stat) => (
          <div key={stat} className="contents">
            <dt className="text-muted-foreground">{STAT_LABELS[stat]}</dt>
            <dd className="m-0 text-right font-semibold tabular-nums">{character[stat] ?? "—"}</dd>
          </div>
        ))}
      </dl>

      <h3 className="mb-2 mt-6 text-[15px] font-semibold text-muted-foreground">Description</h3>
      <p className="m-0 text-[15px] leading-relaxed">{character.description}</p>

      <h3 className="mb-2 mt-6 text-[15px] font-semibold text-muted-foreground">Biography</h3>
      <p className="m-0 text-[15px] leading-relaxed">{character.biography}</p>
    </div>
  );
}
