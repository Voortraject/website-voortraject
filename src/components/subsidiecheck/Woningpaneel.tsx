import { useMemo, useState } from "react";
import { MapPin } from "lucide-react";

import type { PandInfo } from "@/lib/bagPand";
import { bouwLuchtfotoFrame, frameOmvat, LUCHTFOTO_ATTRIBUTIE, projecteerOpFrame } from "@/lib/luchtfoto";
import type { PdokAdres } from "@/lib/pdok";
import type { SubsidieCheckInput } from "@/lib/subsidies";
import type { Model3d } from "@/lib/woninginfo";

import { WoningModel } from "./WoningModel";

interface WoningpaneelProps {
  adres: PdokAdres;
  input: SubsidieCheckInput;
  /** BAG-pand (contour + id) — van boven, zodat 'ie vroeg laadt. */
  pand: PandInfo | null;
  pandBezig: boolean;
  /** 3D-model — van boven. */
  model: Model3d | null;
  modelBezig: boolean;
}

// Het persoonlijke "dit is jóuw huis"-paneel naast het resultaat: een luchtfoto
// met de BAG-pandcontour in oker, daaronder een licht 3D-model (3D BAG), en het
// adres. Presentational: alle data komt van StapResultaat, zodat de fetches al
// starten bij het klikken naar het resultaat (niet pas als dit paneel mount).
export const Woningpaneel = ({ adres, input, pand, pandBezig, model, modelBezig }: WoningpaneelProps) => {
  const [beeldFout, setBeeldFout] = useState(false);
  const contour = pand?.rings;

  const adresRegel = `${adres.straatnaam} ${input.huisnummer}${input.toevoeging ? ` ${input.toevoeging}` : ""}`;

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

  const wachtOpFoto = !!adres.centroideRd && pandBezig;

  return (
    <section
      aria-label="Jouw woning"
      className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card"
    >
      {/* Luchtfoto-uitsnede met de pandcontour er overheen. */}
      <div className="relative aspect-[4/3] w-full bg-secondary">
        {wachtOpFoto ? (
          <div className="h-full w-full animate-pulse bg-secondary" aria-hidden="true" />
        ) : frame && !beeldFout ? (
          <>
            <img
              src={frame.url}
              alt={`Luchtfoto van ${adresRegel}, ${adres.woonplaatsnaam}`}
              loading="lazy"
              className="h-full w-full object-cover"
              onError={() => setBeeldFout(true)}
            />
            {contour && contour.length > 0 && (
              <svg
                viewBox={`0 0 ${frame.width} ${frame.height}`}
                preserveAspectRatio="none"
                className="pointer-events-none absolute inset-0 h-full w-full"
                aria-hidden="true"
              >
                {contour.map((ring, i) => (
                  <polygon
                    key={i}
                    points={ring.map((v) => projecteerOpFrame(v, frame).map((n) => n.toFixed(1)).join(",")).join(" ")}
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
            <span
              className="pointer-events-none absolute bottom-1.5 left-2 text-[10px] leading-none text-white/95"
              style={{ textShadow: "0 1px 2px rgba(0,0,0,0.85)" }}
            >
              {LUCHTFOTO_ATTRIBUTIE}
            </span>
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 text-muted-foreground">
            <MapPin size={22} aria-hidden="true" />
            <span className="text-[13px]">Luchtfoto niet beschikbaar</span>
          </div>
        )}
      </div>

      {/* Licht 3D-model onder de foto (zelfde uitlijning, noord-boven). */}
      <WoningModel model={model} isPending={modelBezig} />

      <div className="flex flex-1 flex-col gap-2 border-t border-border p-4 md:p-5">
        <div>
          <p className="font-display text-[16px] font-semibold leading-snug text-primary">{adresRegel}</p>
          <p className="text-[13px] text-muted-foreground">
            {adres.woonplaatsnaam}
            {pand?.bouwjaar ? ` · Bouwjaar ${pand.bouwjaar}` : ""}
          </p>
        </div>
      </div>
    </section>
  );
};
