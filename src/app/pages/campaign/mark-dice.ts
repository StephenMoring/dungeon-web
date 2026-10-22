/** Link target the story's markdown renderer turns into an ember dice chip. */
export const DIE_HREF = "#die";

const AFTER_ROLL_CALL = /(\bRoll for [^.!?\n]+[.!]\s+)(\d{1,3})(?=[\s.,!]|$)/g;
const ROLLED = /(\bYou rolled an? )(\d{1,3})\b/g;

/** Marks dice results in DM prose ("Roll for Perception. 7", "You rolled a 14!") as `[7](#die)`. */
export function markDice(content: string): string {
  return content.replace(AFTER_ROLL_CALL, `$1[$2](${DIE_HREF})`).replace(ROLLED, `$1[$2](${DIE_HREF})`);
}
