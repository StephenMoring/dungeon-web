import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Link, useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { getClasses, getRaces, createCharacterPreview, createCharacter } from "../api/characters";
import type { HeroClass, Race, CharacterPreview } from "../api/characters";
import { useAuth } from "../context/auth-context";

const BACKGROUNDS = ["Acolyte", "Criminal", "Folk Hero", "Noble", "Sage", "Soldier", "Outlander", "Entertainer"];

const FOCUS = "focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-gold focus-visible:ring-0";
const FIELD = `rounded-[4px] border-input bg-raised text-[15px] placeholder:text-faint dark:bg-raised md:text-[15px] ${FOCUS}`;
const PANEL = "rounded-[4px] border border-border bg-card p-5 max-[759px]:p-4";
const HEADING = "m-0 text-lg font-semibold text-foreground";
const LABEL = "text-sm font-medium text-muted-foreground";

interface ChipGroupProps {
  label: string;
  options: string[];
  value: string;
  onSelect: (option: string) => void;
  columns: string;
}

function ChipGroup({ label, options, value, onSelect, columns }: ChipGroupProps) {
  return (
    <div role="group" aria-label={label}>
      <Label className={LABEL}>{label}</Label>
      <div className={`mt-2 grid gap-2 ${columns}`}>
        {options.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={value === option}
            onClick={() => onSelect(option)}
            className={`min-h-11 rounded-[4px] border px-3 py-2 text-sm font-medium transition-colors ${
              value === option
                ? "border-foreground bg-raised text-foreground"
                : "border-border bg-card text-muted-foreground hover:border-input hover:text-foreground"
            } ${FOCUS}`}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

const EMPTY_STATS = {
  strength: 0,
  perception: 0,
  endurance: 0,
  charisma: 0,
  intelligence: 0,
  agility: 0,
  luck: 0,
};

export function CharacterCreation() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedRace, setSelectedRace] = useState("");
  const [selectedBackground, setSelectedBackground] = useState("");
  const [classes, setClasses] = useState<HeroClass[]>([]);
  const [races, setRaces] = useState<Race[]>([]);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [biography, setBiography] = useState("");
  const [age, setAge] = useState<number | null>(null);
  const [statsGenerated, setStatsGenerated] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    getClasses().then(setClasses).catch(console.error);
    getRaces().then(setRaces).catch(console.error);
  }, []);

  const canGenerate = name && selectedClass && selectedRace && description;
  const isValid = canGenerate && selectedBackground && statsGenerated;

  async function handleGenerate() {
    if (!canGenerate) return;
    setIsGenerating(true);
    setGenerateError(null);
    try {
      const preview: CharacterPreview = await createCharacterPreview({
        name,
        description,
        hero_class: selectedClass,
        race: selectedRace,
      });
      setStats({
        strength: preview.strength,
        perception: preview.perception,
        endurance: preview.endurance,
        charisma: preview.charisma,
        intelligence: preview.intelligence,
        agility: preview.agility,
        luck: preview.luck,
      });
      setBiography(preview.biography);
      setAge(preview.age);
      setStatsGenerated(true);
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : "Generation failed. Try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleCreate() {
    if (!user) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      await createCharacter({
        name,
        description,
        hero_class: selectedClass,
        biography,
        age: age!,
        user_id: Number(user.id),
        campaign_id: null,
        id: null,
        ...stats,
      });
      navigate("/dashboard");
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save character. Try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-[960px] space-y-6 px-6 py-6 max-[759px]:px-4">
        <header className="flex items-start gap-x-4">
          <Link
            to="/dashboard"
            aria-label="Back to the dashboard"
            className={`-ml-2 inline-flex size-11 shrink-0 items-center justify-center rounded-[4px] text-muted-foreground transition-colors hover:text-foreground ${FOCUS}`}
          >
            <ArrowLeft className="size-5" aria-hidden="true" />
          </Link>
          <h1 className="m-0 min-w-0 break-words pt-[3px] font-display text-[28px] font-normal leading-tight text-foreground max-[759px]:text-[24px]">
            Forge a hero
          </h1>
        </header>

        <div className="grid grid-cols-2 items-start gap-6 max-[759px]:grid-cols-1">
          <section className={`${PANEL} flex flex-col gap-4`} aria-labelledby="basic-heading">
            <h2 id="basic-heading" className={HEADING}>Basic information</h2>
            <div className="space-y-2">
              <Label htmlFor="char-name" className={LABEL}>Character name</Label>
              <Input
                id="char-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your character's name"
                className={`h-10 ${FIELD}`}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="char-description" className={LABEL}>Description</Label>
              <Textarea
                id="char-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your character — background, personality, appearance..."
                className={`resize-none ${FIELD}`}
                rows={3}
              />
            </div>

            <ChipGroup
              label="Class"
              options={classes.map((c) => c.class_name)}
              value={selectedClass}
              onSelect={setSelectedClass}
              columns="grid-cols-3"
            />
            <ChipGroup
              label="Race"
              options={races.map((r) => r.race)}
              value={selectedRace}
              onSelect={setSelectedRace}
              columns="grid-cols-3"
            />
            <ChipGroup
              label="Background"
              options={BACKGROUNDS}
              value={selectedBackground}
              onSelect={setSelectedBackground}
              columns="grid-cols-2"
            />
          </section>

          <div className="flex flex-col gap-6">
          <section className={`${PANEL} flex flex-col gap-4`} aria-labelledby="scores-heading">
            <div className="flex items-center justify-between gap-3">
              <h2 id="scores-heading" className={HEADING}>Ability scores</h2>
              <Button
                type="button"
                variant="outline"
                onClick={handleGenerate}
                className={`h-11 gap-2 rounded-[4px] border-input bg-transparent px-4 text-base font-semibold text-foreground hover:bg-raised hover:text-foreground ${FOCUS}`}
                disabled={!canGenerate || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4" aria-hidden="true" />
                    Generate
                  </>
                )}
              </Button>
            </div>
            {!statsGenerated && !isGenerating && (
              <p className="m-0 text-sm text-muted-foreground">
                Fill in your name, description, class, and race to generate stats
              </p>
            )}
            {generateError && (
              <p role="alert" className="m-0 text-sm text-ember">{generateError}</p>
            )}
            <ul className="m-0 flex list-none flex-col divide-y divide-border p-0">
              {Object.entries(stats).map(([stat, value]) => (
                <li key={stat} className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
                  <Label htmlFor={`stat-${stat}`} className="text-base capitalize text-foreground">{stat}</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id={`stat-${stat}`}
                      type="number"
                      value={statsGenerated ? value : ""}
                      onChange={(e) =>
                        setStats({ ...stats, [stat]: parseInt(e.target.value) || 0 })
                      }
                      className={`h-10 w-[72px] tabular-nums ${FIELD}`}
                      min="1"
                      max="20"
                      disabled={!statsGenerated}
                      placeholder={statsGenerated ? undefined : "—"}
                    />
                    <span className="w-8 text-center text-sm font-medium tabular-nums text-muted-foreground">
                      {statsGenerated
                        ? `${Math.floor((value - 10) / 2) >= 0 ? "+" : ""}${Math.floor((value - 10) / 2)}`
                        : ""}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </section>
          <section className={PANEL} aria-labelledby="preview-heading">
            <h2 id="preview-heading" className={HEADING}>Character preview</h2>
            <div className="space-y-2 px-2 py-6 text-center">
              <p className="m-0 break-words font-display text-[28px] leading-tight text-foreground">
                {name || "Unnamed Character"}
              </p>
              <p className="m-0 text-lg text-muted-foreground">
                {selectedRace && selectedClass ? `${selectedRace} ${selectedClass}` : "Select race and class"}
              </p>
              {age !== null && <p className="m-0 text-sm text-muted-foreground tabular-nums">Age: {age}</p>}
              {selectedBackground && (
                <p className="m-0 text-sm text-muted-foreground">Background: {selectedBackground}</p>
              )}
              {biography && (
                <p className="mx-auto m-0 max-w-lg break-words pt-2 text-base text-muted-foreground">{biography}</p>
              )}
            </div>
          </section>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-4">
          {saveError && (
            <p role="alert" className="m-0 mr-auto text-sm text-ember">{saveError}</p>
          )}
          <Link
            to="/dashboard"
            className={`inline-flex h-11 items-center rounded-[4px] px-3 text-base font-medium text-muted-foreground transition-colors hover:text-foreground ${FOCUS}`}
          >
            Cancel
          </Link>
          <motion.div whileTap={{ y: 1 }}>
            <Button
              type="button"
              onClick={handleCreate}
              disabled={!isValid || isSaving}
              className={`h-11 rounded-[4px] bg-gold px-[22px] text-base font-semibold text-primary-foreground hover:bg-gold hover:brightness-110 ${FOCUS}`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                  Saving...
                </>
              ) : (
                "Create Character"
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
