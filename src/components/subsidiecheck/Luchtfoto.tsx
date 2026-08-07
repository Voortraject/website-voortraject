import { useMemo } from "react";

import type { PandInfo } from "@/lib/bagPand";
import { bouwLuchtfotoFrame, frameOmvat, LUCHTFOTO_ATTRIBUTIE, projecteerOpFrame } from "@/lib/luchtfoto";
import type { PdokAdres } from "@/lib/pdok";

interface LuchtfotoProps {
  adres: PdokAdres;
  /** Adresregel voor de alt-tekst, bijv. "Kerkstraat 12". */
  adresRegel: string;
  /** BAG-pand: levert de contour die we over de foto heen tekenen. */
  pand: PandInfo | null;
  pandBezig: boolean;
  /** Breedte en overige opmaak. De beeldverhouding zit vast (3:2), zie hieronder. */
  className?: string;
  /** Laat de bronvermelding weg (bij een heel klein formaat onleesbaar). */
  verbergBron?: boolean;
  /** Het beeld laadde niet; de ouder kan het blok dan helemaal weglaten. */
  onFout?: () => void;
}

// De luchtfoto-uitsnede met de BAG-pandcontour in oker eroverheen: het sterkste
// "dit is jóuw huis"-signaal dat we hebben. Gedeeld door het woningpaneel naast
// het resultaat en het woningkaartje in de gegevens-poort.
export const Luchtfoto = ({
  adres,
  adresRegel,
  pand,
  pandBezig,
  className = "",
  verbergBron = false,
  onFout,
}: LuchtfotoProps) => {
  const contour = pand?.rings;

  // Wacht kort op de contour zodat we het frame in één keer goed zetten (geen
  // reframe-flits). Contour gevonden → frame om het pand; niet gevonden → frame
  // rond het adrespunt (zonder omtrek).
  const frame = useMemo(() => {
    if (!adres.centroideRd || pandBezig) return null;
    if (contour && contour.length > 0) {
      const { centrum, spanMeters } = frameOmvat(contour);
      return bouwLuchtfotoFrame(centrum, { spanMeters });
    }
    return bouwLuchtfotoFrame(adres.centroideRd);
  }, [adres.centroideRd, contour, pandBezig]);

  const wachten = !!adres.centroideRd && pandBezig;

  // Geen coördinaten (bv. een handmatig ingevoerd adres): niets tonen. Een vakje
  // "niet beschikbaar" is alleen maar ruis.
  if (!wachten && !frame) return null;

  // De verhouding van het blok moet exact gelijk zijn aan die van de opgehaalde
  // afbeelding (3:2, zie bouwLuchtfotoFrame). De contour wordt namelijk als SVG
  // over de foto heen gelegd en uitgerekt tot het blok; wijkt de verhouding af,
  // dan snijdt object-cover de foto bij terwijl de contour meerekt en klopt de
  // omtrek niet meer met het dak. Daarom zit `aspect-[3/2]` hier vast en bepaalt
  // de aanroeper alleen de breedte.
  return (
    <div className={`relative aspect-[3/2] w-full overflow-hidden bg-secondary ${className}`}>
      {wachten ? (
        <div className="h-full w-full animate-pulse bg-secondary" aria-hidden="true" />
      ) : (
        <>
          <img
            src={frame!.url}
            alt={`Luchtfoto van ${adresRegel}, ${adres.woonplaatsnaam}`}
            loading="lazy"
            className="h-full w-full object-cover"
            onError={onFout}
          />
          {contour && contour.length > 0 && (
            <svg
              viewBox={`0 0 ${frame!.width} ${frame!.height}`}
              preserveAspectRatio="none"
              className="pointer-events-none absolute inset-0 h-full w-full"
              aria-hidden="true"
            >
              {contour.map((ring, i) => (
                <polygon
                  key={i}
                  points={ring.map((v) => projecteerOpFrame(v, frame!).map((n) => n.toFixed(1)).join(",")).join(" ")}
                  fill="hsl(var(--accent) / 0.14)"
                  stroke="hsl(var(--accent))"
                  strokeWidth={2.5}
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
            </svg>
          )}
          {/* Bronvermelding in de foto, linksonder (CC-BY, verplicht). */}
          {!verbergBron && (
            <span
              className="pointer-events-none absolute bottom-1.5 left-2 right-1.5 text-[9px] leading-tight text-white/95 md:text-[10px] md:leading-none"
              style={{ textShadow: "0 1px 2px rgba(0,0,0,0.85)" }}
            >
              {LUCHTFOTO_ATTRIBUTIE}
            </span>
          )}
        </>
      )}
    </div>
  );
};
