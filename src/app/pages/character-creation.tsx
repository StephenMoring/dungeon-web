import { useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { ScrollArea } from "../components/ui/scroll-area";
import { ArrowLeft, Wand2 } from "lucide-react";

const CLASSES = ["Barbarian", "Bard", "Cleric", "Druid", "Fighter", "Monk", "Paladin", "Ranger", "Rogue", "Sorcerer", "Warlock", "Wizard"];
const RACES = ["Human", "Elf", "Dwarf", "Halfling", "Dragonborn", "Gnome", "Half-Elf", "Half-Orc", "Tiefling"];
const BACKGROUNDS = ["Acolyte", "Criminal", "Folk Hero", "Noble", "Sage", "Soldier", "Outlander", "Entertainer"];

export function CharacterCreation() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedRace, setSelectedRace] = useState("");
  const [selectedBackground, setSelectedBackground] = useState("");
  const [stats, setStats] = useState({
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
  });

  const rollStats = () => {
    const rollDice = () => {
      const rolls = [1, 2, 3, 4].map(() => Math.floor(Math.random() * 6) + 1);
      rolls.sort((a, b) => b - a);
      return rolls[0] + rolls[1] + rolls[2]; // Sum of highest 3
    };

    setStats({
      strength: rollDice(),
      dexterity: rollDice(),
      constitution: rollDice(),
      intelligence: rollDice(),
      wisdom: rollDice(),
      charisma: rollDice(),
    });
  };

  const handleCreate = () => {
    // In a real app, this would save the character
    navigate("/campaign/new");
  };

  const isValid = name && selectedClass && selectedRace && selectedBackground;

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
                  <Label>Class</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {CLASSES.map((cls) => (
                      <button
                        key={cls}
                        onClick={() => setSelectedClass(cls)}
                        className={`px-3 py-2 text-sm rounded border transition-all ${
                          selectedClass === cls
                            ? "bg-purple-600 border-purple-400 text-white"
                            : "bg-muted border-border hover:border-purple-500/50"
                        }`}
                      >
                        {cls}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Race</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {RACES.map((race) => (
                      <button
                        key={race}
                        onClick={() => setSelectedRace(race)}
                        className={`px-3 py-2 text-sm rounded border transition-all ${
                          selectedRace === race
                            ? "bg-emerald-600 border-emerald-400 text-white"
                            : "bg-muted border-border hover:border-emerald-500/50"
                        }`}
                      >
                        {race}
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
                        className={`px-3 py-2 text-sm rounded border transition-all ${
                          selectedBackground === bg
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
                  <Button onClick={rollStats} size="sm" className="gap-2">
                    <Wand2 className="h-4 w-4" />
                    Roll Stats
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(stats).map(([stat, value]) => (
                  <div key={stat} className="flex items-center justify-between">
                    <Label className="capitalize">{stat}</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        value={value}
                        onChange={(e) =>
                          setStats({ ...stats, [stat]: parseInt(e.target.value) || 10 })
                        }
                        className="w-16 h-8"
                        min="1"
                        max="20"
                      />
                      <span className="text-sm font-medium text-blue-400 w-8 text-center">
                        {Math.floor((value - 10) / 2) >= 0 ? "+" : ""}
                        {Math.floor((value - 10) / 2)}
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
                {selectedBackground && (
                  <p className="text-sm text-muted-foreground">
                    Background: {selectedBackground}
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
          <Button variant="outline" onClick={() => navigate("/")}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!isValid}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            Start Campaign
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
