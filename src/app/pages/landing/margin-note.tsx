import type { SheetNote, SheetPart } from "./sample-hero";
import { FOCUS } from "./classes";

interface MarginNoteProps {
  note: SheetNote;
  active: boolean;
  onShow: (part: SheetPart | null) => void;
  className?: string;
}

/** A note in the plate's margin; hovering or focusing it marks the part of the sheet it explains. */
export function MarginNote({ note, active, onShow, className = "" }: MarginNoteProps) {
  return (
    <button
      type="button"
      onMouseEnter={() => onShow(note.part)}
      onMouseLeave={() => onShow(null)}
      onFocus={() => onShow(note.part)}
      onBlur={() => onShow(null)}
      onClick={() => onShow(note.part)}
      className={`block w-full max-w-[26ch] rounded-[4px] bg-transparent p-0 ${FOCUS} ${className}`}
    >
      <span className={`block text-lg font-medium text-foreground underline underline-offset-4 transition-[text-decoration-color] duration-200 ${active ? "decoration-current" : "decoration-transparent"}`}>
        {note.name}
      </span>
      <span className="mt-1 block text-base leading-[1.55] text-muted-foreground">{note.text}</span>
    </button>
  );
}
