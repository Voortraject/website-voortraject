import { useId, useMemo } from "react";
import { Loader2 } from "lucide-react";

import { projecteerModel } from "@/lib/model3d";
import type { Model3d, Model3dSoort } from "@/lib/woninginfo";

// Illustratieve modelkleuren (geen huisstijl-tokens: dit is een weergave van
// het gebouw, net als de luchtfoto). Warm en rustig: terracotta dak, zand-muur;
// de buurpanden in licht grijs zodat het subject eruit springt. De Lambert-
// lichtfactor stuurt de helderheid per vlak → diepte.
const BASIS: Record<Model3dSoort, { h: number; s: number; l: number }> = {
  dak: { h: 14, s: 46, l: 56 },
  muur: { h: 32, s: 22, l: 82 },
  grond: { h: 34, s: 12, l: 70 },
};

const kleur = (c: { h: number; s: number; l: number }, licht: number) =>
  `hsl(${c.h} ${c.s}% ${Math.round(c.l * licht)}%)`;

interface WoningModelProps {
  model?: Model3d | null;
  isPending?: boolean;
}

// 3D-massamodel van de woning (3D BAG) met de buren in grijs, onder de luchtfoto.
// Presentational: de data komt van StapResultaat, zodat 'ie al laadt bij het
// klikken naar het resultaat. Zelf-omsloten 4:3-blok (even groot als de foto).
export const WoningModel = ({ model, isPending }: WoningModelProps) => {
  const g = useMemo(() => (model ? projecteerModel(model) : null), [model]);
  const blurId = useId();

  if (!isPending && !g) return null;

  return (
    // Mobiel staat dit blok naast de luchtfoto (scheidingslijn links), vanaf md
    // eronder (scheidingslijn boven). Zie Woningpaneel.
    <div className="relative aspect-[4/3] w-full border-l border-border bg-card-soft md:border-l-0 md:border-t">
      {isPending || !g ? (
        <div className="flex h-full w-full items-center justify-center" aria-live="polite" aria-busy="true">
          <Loader2 size={22} className="animate-spin text-muted-foreground" aria-hidden="true" />
        </div>
      ) : (
        <svg
          viewBox={`0 0 ${g.breedte} ${g.hoogte}`}
          preserveAspectRatio="xMidYMid meet"
          className="h-full w-full"
          role="img"
          aria-label="Vereenvoudigd 3D-model van de woning met de buurpanden"
        >
          <defs>
            <filter id={blurId} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.2" />
            </filter>
          </defs>

          {/* Zachte grondschaduw onder het subject. */}
          {g.schaduw.map((punten, i) => (
            <polygon key={`s${i}`} points={punten} fill="hsl(220 25% 20% / 0.2)" filter={`url(#${blurId})`} />
          ))}

          {/* Buurpanden als licht wireframe (3D BAG-viewer-look): doorzichtig,
              alleen dunne grijze randen, zodat het subject eruit springt. */}
          {g.buren.map((v, i) => (
            <polygon
              key={`b${i}`}
              points={v.punten}
              fill="hsl(30 8% 82% / 0.1)"
              stroke="hsl(30 6% 55% / 0.7)"
              strokeWidth={0.7}
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          ))}

          {/* Subject-pand in kleur, bovenop. */}
          {g.vlakken.map((v, i) => (
            <polygon
              key={`v${i}`}
              points={v.punten}
              fill={kleur(BASIS[v.soort] ?? BASIS.muur, v.licht)}
              stroke="hsl(18 38% 22% / 0.6)"
              strokeWidth={0.9}
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
      )}

      {/* Labels als overlay (blok blijft zo even groot als de foto). */}
      <span className="pointer-events-none absolute left-2 top-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        3D-model
      </span>
      <span className="pointer-events-none absolute bottom-1.5 left-2 text-[10px] leading-none text-muted-foreground/80">
        3D BAG (TU Delft)
      </span>
    </div>
  );
};
