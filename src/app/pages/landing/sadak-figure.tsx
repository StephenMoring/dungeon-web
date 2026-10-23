import { ArtImage } from "@/app/components/shared/art-image";
import { SMALL } from "./classes";

/** Sadak at 4:5 with its caption: the one picture of the campaigns section. */
export function SadakFigure() {
  return (
    <figure className="m-0">
      <div className="relative aspect-[4/5]">
        <ArtImage id="sadak" className="absolute inset-0 h-full w-full" />
      </div>
      <figcaption className={`mt-3 text-muted-foreground ${SMALL}`}>
        John Martin, Sadak in Search of the Waters of Oblivion, 1812
      </figcaption>
    </figure>
  );
}
