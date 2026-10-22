import { Textarea } from "@/app/components/ui/textarea";

interface NotesSectionProps {
  notes: string;
  onUpdate: (notes: string) => void;
}

const FOCUS = "focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-gold focus-visible:ring-0";

export function NotesSection({ notes, onUpdate }: NotesSectionProps) {
  return (
    <div className="flex min-h-0 flex-1 flex-col p-5">
      <h2 id="campaign-notes-title" className="mb-3 text-[15px] font-semibold text-muted-foreground">
        Notes
      </h2>
      <Textarea
        aria-labelledby="campaign-notes-title"
        value={notes}
        onChange={(e) => onUpdate(e.target.value)}
        placeholder="Clues, names, debts, the way back out."
        className={`min-h-48 flex-1 resize-none rounded-[4px] border-input bg-raised text-[15px] leading-relaxed placeholder:text-faint dark:bg-raised md:text-[15px] ${FOCUS}`}
      />
    </div>
  );
}
