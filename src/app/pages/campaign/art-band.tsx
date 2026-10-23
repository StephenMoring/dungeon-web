import { ArtImage } from "@/app/components/shared/art-image";

/** The Wrath band under the navbar: John Martin's red sun, pre-cut as a wide strip. */
export function ArtBand() {
  return (
    <div className="relative h-[150px] shrink-0 max-[759px]:h-[110px]">
      <div className="absolute inset-0">
        <ArtImage id="wrath-band" className="h-full w-full" />
      </div>
    </div>
  );
}
