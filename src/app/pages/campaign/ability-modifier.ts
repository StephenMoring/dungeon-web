/** The d20 ability modifier: floor((score − 10) / 2). */
export function abilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

/** The modifier with its sign always shown, using a true minus sign: −1, +0, +3. */
export function formatModifier(score: number): string {
  const mod = abilityModifier(score);
  return mod < 0 ? `−${Math.abs(mod)}` : `+${mod}`;
}
