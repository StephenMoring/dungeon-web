import { ArtImage } from "@/app/components/shared/art-image";

/** The Wrath band under the navbar: John Martin's red sun, zoomed by the art registry. */
export function ArtBand() {
  return (
    <div className="relative h-[150px] shrink-0 max-[759px]:h-[110px]">
      <div className="absolute inset-0">
        <ArtImage id="wrath" className="h-full w-full" />
      </div>
    </div>
  );
}
