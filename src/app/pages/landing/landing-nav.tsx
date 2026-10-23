import { Wordmark } from "@/app/components/shared/wordmark";
import { EnterButton } from "./enter-button";
import { FOCUS, MARGIN } from "./classes";

interface LandingNavProps {
  onEnter: () => void;
}

export const SECTION_LINKS = [
  { href: "#turn", label: "A turn" },
  { href: "#campaigns", label: "Campaigns" },
  { href: "#heroes", label: "Heroes" },
] as const;

/** Plain bar over the hero painting: wordmark, three anchors, the one action. Not fixed. */
export function LandingNav({ onEnter }: LandingNavProps) {
  return (
    <header className={`absolute inset-x-0 top-0 z-20 flex items-center justify-between pt-6 ${MARGIN}`}>
      <Wordmark linked={false} className="text-[28px]" />
      <div className="flex items-center gap-8">
        <nav aria-label="Sections" className="max-[759px]:hidden">
          <ul className="m-0 flex list-none gap-7 p-0">
            {SECTION_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={`rounded-[4px] text-base font-medium text-foreground underline decoration-transparent underline-offset-[6px] transition-[text-decoration-color] duration-200 hover:decoration-current ${FOCUS}`}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <EnterButton onClick={onEnter} className="max-[759px]:hidden" />
      </div>
    </header>
  );
}
