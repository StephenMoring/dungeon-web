import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Textarea } from "../../components/ui/textarea";
import { BookOpen } from "lucide-react";
import { motion } from "motion/react";

interface NotesSectionProps {
  notes: string;
  onUpdate: (notes: string) => void;
}

export function NotesSection({ notes, onUpdate }: NotesSectionProps) {
  return (
    <Card className="h-full flex flex-col border-2 border-amber-500/20 bg-gradient-to-b from-card to-card/50">
      <CardHeader className="border-b border-amber-500/20">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-amber-400" />
          <CardTitle className="bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
            Notes
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          <Textarea
            value={notes}
            onChange={(e) => onUpdate(e.target.value)}
            placeholder="Write your notes here... Track clues, important NPCs, quest objectives, or anything else you want to remember."
            className="h-full resize-none border-amber-500/20 focus:border-amber-500/50 bg-gradient-to-br from-muted/50 to-transparent transition-all"
          />
        </motion.div>
      </CardContent>
    </Card>
  );
}