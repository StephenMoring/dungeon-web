import { useState } from "react";
import { motion } from "motion/react";
import { useNavigate, useParams } from "react-router";
import { CharacterSheet, CharacterData } from "./character-sheet";
import { ChatInterface } from "./chat-interface";
import { NotesSection } from "./notes-section";
import { Button } from "../../components/ui/button";
import { ArrowLeft, Menu } from "lucide-react";

export function Campaign() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [character, setCharacter] = useState<CharacterData>({
    name: "Adventurer",
    class: "Wizard",
    level: 1,
    race: "Human",
    background: "Scholar",
    hp: { current: 8, max: 8 },
    stats: {
      strength: 10,
      dexterity: 14,
      constitution: 12,
      intelligence: 16,
      wisdom: 13,
      charisma: 11,
    },
    skills: ["Arcana", "History", "Investigation"],
    equipment: [
      "Spellbook",
      "Quarterstaff",
      "Component pouch",
      "Scholar's pack",
      "50 gold pieces",
    ],
  });

  const [notes, setNotes] = useState(
    "- Entered ancient dungeon\n- Two paths: north (water sounds) and east (red glow)\n"
  );

  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center justify-between px-6 py-3 border-b border-purple-500/20 bg-card/50 backdrop-blur-sm"
      >
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-semibold text-lg">Campaign #{id}</h1>
            <p className="text-sm text-muted-foreground">{character.name} - Level {character.level}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Save Progress
          </Button>
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-hidden">
        <div className="h-full grid grid-cols-12 gap-4">
          {/* Character Sheet - Left Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="col-span-3 h-full"
          >
            <CharacterSheet character={character} onUpdate={setCharacter} />
          </motion.div>

          {/* Chat Interface - Center */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="col-span-6 h-full"
          >
            <ChatInterface />
          </motion.div>

          {/* Notes - Right Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="col-span-3 h-full"
          >
            <NotesSection notes={notes} onUpdate={setNotes} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
