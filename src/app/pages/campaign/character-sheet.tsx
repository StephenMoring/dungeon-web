import { useId } from "react";
import { ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";

interface CharacterSheetProps {
  character: CharacterData;
  onUpdate: (character: CharacterData) => void;
}

export interface CharacterData {
  name: string;
  class: string;
  level: number;
  race: string;
  background: string;
  hp: { current: number; max: number };
  stats: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
  skills: string[];
  equipment: string[];
}

type StatKey = keyof CharacterData["stats"];

const STAT_LABELS: Record<StatKey, string> = {
  strength: "Strength",
  dexterity: "Dexterity",
  constitution: "Constitution",
  intelligence: "Intelligence",
  wisdom: "Wisdom",
  charisma: "Charisma",
};

const FOCUS = "focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-gold focus-visible:ring-0";
const FIELD = `h-10 rounded-[4px] border-input bg-raised text-[15px] tabular-nums placeholder:text-faint dark:bg-raised md:text-[15px] ${FOCUS}`;

interface FieldProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: "text" | "number";
  min?: number;
  max?: number;
}

function Field({ label, value, onChange, type = "text", min, max }: FieldProps) {
  const id = useId();
  return (
    <div className="min-w-0 space-y-2">
      <Label htmlFor={id} className="text-sm font-medium text-muted-foreground">
        {label}
      </Label>
      <Input id={id} type={type} value={value} min={min} max={max} onChange={(e) => onChange(e.target.value)} className={FIELD} />
    </div>
  );
}

export function CharacterSheet({ character, onUpdate }: CharacterSheetProps) {
  const updateField = <K extends keyof CharacterData>(field: K, value: CharacterData[K]) => {
    onUpdate({ ...character, [field]: value });
  };

  const updateStat = (stat: StatKey, value: number) => {
    onUpdate({
      ...character,
      stats: { ...character.stats, [stat]: value },
    });
  };

  const updateHP = (type: "current" | "max", value: number) => {
    onUpdate({
      ...character,
      hp: { ...character.hp, [type]: value },
    });
  };

  const { current, max } = character.hp;
  const woundsShare = max > 0 ? Math.min(100, Math.max(0, (current / max) * 100)) : 0;

  return (
    <div className="p-5">
      <h2 className="m-0 break-words font-display text-[26px] font-normal leading-tight text-foreground">
        {character.name || "Unnamed"}
      </h2>
      <p className="mb-[18px] text-[15px] text-muted-foreground">
        {character.class} · Level <span className="tabular-nums">{character.level}</span> · {character.race}
      </p>

      <div className="flex items-baseline justify-between">
        <span className="text-[15px]">Wounds</span>
        <b className="text-[26px] font-semibold tabular-nums">
          {current} <small className="text-[15px] font-normal text-muted-foreground">/ {max}</small>
        </b>
      </div>
      <div
        role="meter"
        aria-label="Wounds"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={max}
        className="mb-5 mt-1.5 h-2 rounded-[2px] bg-raised"
      >
        <motion.div
          className="h-full rounded-[2px] bg-ember"
          initial={false}
          animate={{ width: `${woundsShare}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <dl className="m-0 grid grid-cols-[1fr_auto] gap-y-1.5 text-[15px]">
        {(Object.keys(STAT_LABELS) as StatKey[]).map((stat) => (
          <div key={stat} className="contents">
            <dt className="text-muted-foreground">{STAT_LABELS[stat]}</dt>
            <dd className="m-0 text-right font-semibold tabular-nums">{character.stats[stat]}</dd>
          </div>
        ))}
      </dl>

      <h3 className="mb-2 mt-6 text-[15px] font-semibold text-muted-foreground">Skills</h3>
      {character.skills.length > 0 ? (
        <ul className="m-0 grid list-disc gap-1 pl-[18px] text-[15px]">
          {character.skills.map((skill) => (
            <li key={skill}>{skill}</li>
          ))}
        </ul>
      ) : (
        <p className="text-[15px] text-faint">No skills learned yet</p>
      )}

      <h3 className="mb-2 mt-6 text-[15px] font-semibold text-muted-foreground">Equipment</h3>
      {character.equipment.length > 0 ? (
        <ul className="m-0 grid list-disc gap-1 pl-[18px] text-[15px]">
          {character.equipment.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="text-[15px] text-faint">No equipment yet</p>
      )}

      <details className="group mt-6 border-t border-border pt-4">
        <summary
          className={`flex min-h-11 cursor-pointer list-none items-center gap-1.5 rounded-[4px] text-[15px] font-medium text-muted-foreground transition-colors hover:text-foreground [&::-webkit-details-marker]:hidden ${FOCUS}`}
        >
          <ChevronRight className="size-4 transition-transform group-open:rotate-90" aria-hidden="true" />
          Edit sheet
        </summary>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Field label="Name" value={character.name} onChange={(v) => updateField("name", v)} />
          </div>
          <Field label="Class" value={character.class} onChange={(v) => updateField("class", v)} />
          <Field
            label="Level"
            type="number"
            min={1}
            max={20}
            value={character.level}
            onChange={(v) => updateField("level", parseInt(v) || 1)}
          />
          <Field label="Race" value={character.race} onChange={(v) => updateField("race", v)} />
          <Field label="Background" value={character.background} onChange={(v) => updateField("background", v)} />
          <Field
            label="Wounds"
            type="number"
            value={current}
            onChange={(v) => updateHP("current", parseInt(v) || 0)}
          />
          <Field label="Wounds max" type="number" value={max} onChange={(v) => updateHP("max", parseInt(v) || 0)} />
          {(Object.keys(STAT_LABELS) as StatKey[]).map((stat) => (
            <Field
              key={stat}
              label={STAT_LABELS[stat]}
              type="number"
              min={1}
              max={20}
              value={character.stats[stat]}
              onChange={(v) => updateStat(stat, parseInt(v) || 10)}
            />
          ))}
        </div>
      </details>
    </div>
  );
}
