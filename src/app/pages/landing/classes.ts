/** Shared class strings for the landing page: one pair of margins, one grid, five type steps. */

export const FOCUS =
  "focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-gold";

/** Page margins: 16px on phones, 32px from 760px up. Equal on both sides at every width. */
export const MARGIN = "px-4 min-[760px]:px-8";

/** The 12-column grid used by every section from 760px up. */
export const GRID = "min-[760px]:grid min-[760px]:grid-cols-12 min-[760px]:gap-x-6";

/** The same grid for side-by-side compositions that need a desktop width (from 1100px). */
export const GRID_WIDE = "min-[1100px]:grid min-[1100px]:grid-cols-12 min-[1100px]:gap-x-6";

/** Type steps. Display and head are Metal Mania; the rest is Barlow. */
export const DISPLAY =
  "font-display font-normal text-[clamp(2.75rem,9vw,9rem)] leading-[0.95] tracking-[-0.01em] text-balance";
export const HEAD = "font-display font-normal text-[clamp(2.25rem,4.4vw,4rem)] leading-[0.98] text-balance";
export const LEAD = "text-[clamp(1.25rem,1.1rem+0.55vw,1.5rem)] leading-[1.4]";
export const BODY = "text-lg leading-[1.55]";
export const SMALL = "text-[15px] leading-[1.45]";

/** Motion curves from the skill's tokens. */
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;
export const EASE_EXPO = [0.16, 1, 0.3, 1] as const;
export const EASE_SOFT = [0.33, 1, 0.68, 1] as const;
