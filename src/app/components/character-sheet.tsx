import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ScrollArea } from "./ui/scroll-area";
import { User, Heart, Zap } from "lucide-react";
import { motion } from "motion/react";

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

export function CharacterSheet({ character, onUpdate }: CharacterSheetProps) {
  const updateField = (field: keyof CharacterData, value: any) => {
    onUpdate({ ...character, [field]: value });
  };

  const updateStat = (stat: keyof CharacterData["stats"], value: number) => {
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

  const calculateModifier = (stat: number) => {
    return Math.floor((stat - 10) / 2);
  };

  return (
    <Card className="h-full flex flex-col border-2 border-emerald-500/20 bg-gradient-to-b from-card to-card/50">
      <CardHeader className="border-b border-emerald-500/20">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-emerald-400" />
          <CardTitle className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            Character Sheet
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-4">
          <div className="space-y-4">
            {/* Basic Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <div>
                <Label htmlFor="name">Character Name</Label>
                <Input
                  id="name"
                  value={character.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Enter name"
                  className="border-emerald-500/20 focus:border-emerald-500/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="class">Class</Label>
                  <Input
                    id="class"
                    value={character.class}
                    onChange={(e) => updateField("class", e.target.value)}
                    placeholder="e.g., Wizard"
                    className="border-emerald-500/20 focus:border-emerald-500/50"
                  />
                </div>
                <div>
                  <Label htmlFor="level">Level</Label>
                  <Input
                    id="level"
                    type="number"
                    value={character.level}
                    onChange={(e) =>
                      updateField("level", parseInt(e.target.value) || 1)
                    }
                    min="1"
                    max="20"
                    className="border-emerald-500/20 focus:border-emerald-500/50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="race">Race</Label>
                  <Input
                    id="race"
                    value={character.race}
                    onChange={(e) => updateField("race", e.target.value)}
                    placeholder="e.g., Elf"
                    className="border-emerald-500/20 focus:border-emerald-500/50"
                  />
                </div>
                <div>
                  <Label htmlFor="background">Background</Label>
                  <Input
                    id="background"
                    value={character.background}
                    onChange={(e) => updateField("background", e.target.value)}
                    placeholder="e.g., Scholar"
                    className="border-emerald-500/20 focus:border-emerald-500/50"
                  />
                </div>
              </div>
            </motion.div>

            {/* HP */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="p-4 bg-gradient-to-br from-red-500/10 to-red-600/5 rounded-lg border border-red-500/20 shadow-lg"
            >
              <div className="flex items-center gap-2 mb-2">
                <Heart className="h-4 w-4 text-red-400" />
                <Label className="text-sm">Hit Points</Label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="hp-current" className="text-xs">
                    Current
                  </Label>
                  <Input
                    id="hp-current"
                    type="number"
                    value={character.hp.current}
                    onChange={(e) =>
                      updateHP("current", parseInt(e.target.value) || 0)
                    }
                    className="h-8 border-red-500/30"
                  />
                </div>
                <div>
                  <Label htmlFor="hp-max" className="text-xs">
                    Max
                  </Label>
                  <Input
                    id="hp-max"
                    type="number"
                    value={character.hp.max}
                    onChange={(e) =>
                      updateHP("max", parseInt(e.target.value) || 0)
                    }
                    className="h-8 border-red-500/30"
                  />
                </div>
              </div>
              <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-red-500 to-red-600"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(character.hp.current / character.hp.max) * 100}%`,
                  }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </motion.div>

            {/* Ability Scores */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-4 w-4 text-blue-400" />
                <Label className="text-sm">Ability Scores</Label>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(character.stats).map(([stat, value], idx) => (
                  <motion.div
                    key={stat}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + idx * 0.05 }}
                    className="p-3 bg-gradient-to-br from-muted to-muted/50 rounded-lg border border-blue-500/10 hover:border-blue-500/30 transition-all shadow-sm hover:shadow-md"
                  >
                    <Label
                      htmlFor={stat}
                      className="text-xs capitalize mb-1 block text-blue-400"
                    >
                      {stat.slice(0, 3).toUpperCase()}
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id={stat}
                        type="number"
                        value={value}
                        onChange={(e) =>
                          updateStat(
                            stat as keyof CharacterData["stats"],
                            parseInt(e.target.value) || 10
                          )
                        }
                        className="h-8 w-14 border-blue-500/20"
                        min="1"
                        max="20"
                      />
                      <span className="text-sm font-medium text-blue-300">
                        {calculateModifier(value) >= 0 ? "+" : ""}
                        {calculateModifier(value)}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Skills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Label className="text-sm mb-2 block">Skills</Label>
              <div className="p-3 bg-gradient-to-br from-muted to-muted/50 rounded-lg border border-purple-500/10 text-sm space-y-1">
                {character.skills.length > 0 ? (
                  character.skills.map((skill, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + idx * 0.05 }}
                      className="flex items-center gap-2"
                    >
                      <span className="text-purple-400">✦</span>
                      {skill}
                    </motion.div>
                  ))
                ) : (
                  <div className="text-muted-foreground">
                    No skills learned yet
                  </div>
                )}
              </div>
            </motion.div>

            {/* Equipment */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Label className="text-sm mb-2 block">Equipment</Label>
              <div className="p-3 bg-gradient-to-br from-muted to-muted/50 rounded-lg border border-amber-500/10 text-sm space-y-1">
                {character.equipment.length > 0 ? (
                  character.equipment.map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + idx * 0.05 }}
                      className="flex items-center gap-2"
                    >
                      <span className="text-amber-400">⚔</span>
                      {item}
                    </motion.div>
                  ))
                ) : (
                  <div className="text-muted-foreground">
                    No equipment yet
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}