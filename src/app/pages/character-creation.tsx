import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { getClasses, getRaces, createCharacterPreview, createCharacter } from "../api/characters";
import type { HeroClass, Race, CharacterPreview } from "../api/characters";
import { useAuth } from "../context/auth-context";

const BACKGROUNDS = ["Acolyte", "Criminal", "Folk Hero", "Noble", "Sage", "Soldier", "Outlander", "Entertainer"];

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
    <div className="h-full p-8 overflow-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Create Your Character
          </h1>
        </motion.div>

        <div className="grid grid-cols-2 gap-6">
          {/* Basic Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-2 border-purple-500/20">
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="char-name">Character Name</Label>
                  <Input
                    id="char-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your character's name"
                  />
                </div>

                <div>
                  <Label htmlFor="char-description">Description</Label>
                  <Textarea
                    id="char-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your character — background, personality, appearance..."
                    className="resize-none"
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Class</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {classes.map((cls) => (
                      <button
                        key={cls.class_name}
                        onClick={() => setSelectedClass(cls.class_name)}
                        className={`px-3 py-2 text-sm rounded border transition-all ${selectedClass === cls.class_name
                            ? "bg-purple-600 border-purple-400 text-white"
                            : "bg-muted border-border hover:border-purple-500/50"
                          }`}
                      >
                        {cls.class_name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Race</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {races.map((r) => (
                      <button
                        key={r.race}
                        onClick={() => setSelectedRace(r.race)}
                        className={`px-3 py-2 text-sm rounded border transition-all ${selectedRace === r.race
                            ? "bg-emerald-600 border-emerald-400 text-white"
                            : "bg-muted border-border hover:border-emerald-500/50"
                          }`}
                      >
                        {r.race}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Background</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {BACKGROUNDS.map((bg) => (
                      <button
                        key={bg}
                        onClick={() => setSelectedBackground(bg)}
                        className={`px-3 py-2 text-sm rounded border transition-all ${selectedBackground === bg
                            ? "bg-amber-600 border-amber-400 text-white"
                            : "bg-muted border-border hover:border-amber-500/50"
                          }`}
                      >
                        {bg}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Ability Scores */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-2 border-blue-500/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Ability Scores</CardTitle>
                  <Button
                    onClick={handleGenerate}
                    size="sm"
                    className="gap-2"
                    disabled={!canGenerate || isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Generate
                      </>
                    )}
                  </Button>
                </div>
                {!statsGenerated && !isGenerating && (
                  <p className="text-xs text-muted-foreground">
                    Fill in your name, description, class, and race to generate stats
                  </p>
                )}
                {generateError && (
                  <p className="text-xs text-destructive">{generateError}</p>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(stats).map(([stat, value]) => (
                  <div key={stat} className="flex items-center justify-between">
                    <Label className="capitalize">{stat}</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        value={statsGenerated ? value : ""}
                        onChange={(e) =>
                          setStats({ ...stats, [stat]: parseInt(e.target.value) || 0 })
                        }
                        className="w-16 h-8"
                        min="1"
                        max="20"
                        disabled={!statsGenerated}
                        placeholder={statsGenerated ? undefined : "—"}
                      />
                      <span className="text-sm font-medium text-blue-400 w-8 text-center">
                        {statsGenerated
                          ? `${Math.floor((value - 10) / 2) >= 0 ? "+" : ""}${Math.floor((value - 10) / 2)}`
                          : ""}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Character Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-2 border-emerald-500/20">
            <CardHeader>
              <CardTitle>Character Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center p-8 space-y-2">
                <h2 className="text-3xl font-bold">{name || "Unnamed Character"}</h2>
                <p className="text-xl text-muted-foreground">
                  {selectedRace && selectedClass
                    ? `${selectedRace} ${selectedClass}`
                    : "Select race and class"}
                </p>
                {age !== null && (
                  <p className="text-sm text-muted-foreground">Age: {age}</p>
                )}
                {selectedBackground && (
                  <p className="text-sm text-muted-foreground">
                    Background: {selectedBackground}
                  </p>
                )}
                {biography && (
                  <p className="text-sm text-muted-foreground/80 max-w-lg mx-auto pt-2">
                    {biography}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-end gap-4"
        >
          {saveError && (
            <p className="text-sm text-destructive mr-auto">{saveError}</p>
          )}
          <Button variant="outline" onClick={() => navigate("/")}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!isValid || isSaving}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              "Create Character"
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
