import { useState } from "react";
import { MessageCircle } from "lucide-react";

import type { PandInfo } from "@/lib/bagPand";
import type { PdokAdres } from "@/lib/pdok";
import type { SubsidieCheckInput } from "@/lib/subsidies";
import type { Model3d } from "@/lib/woninginfo";

import { Luchtfoto } from "./Luchtfoto";
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
  /** Springt naar het vraagblok onder het resultaat. Weglaten = geen knop. */
  onVraagKlik?: () => void;
}

// Het persoonlijke "dit is jóuw huis"-paneel naast het resultaat: een luchtfoto
// met de BAG-pandcontour in oker, een licht 3D-model (3D BAG), het adres en de
// contactknop. Presentational: alle data komt van StapResultaat, zodat de fetches
// al starten bij het klikken naar het resultaat (niet pas als dit paneel mount).
export const Woningpaneel = ({
  adres,
  input,
  pand,
  pandBezig,
  model,
  modelBezig,
  onVraagKlik,
}: WoningpaneelProps) => {
  const [beeldFout, setBeeldFout] = useState(false);

  const adresRegel = `${adres.straatnaam} ${input.huisnummer}${input.toevoeging ? ` ${input.toevoeging}` : ""}`;

  // Ontbreekt een van de twee beelden, dan tonen we dat blok niet en krijgt de
  // ander de volle breedte. Ontbreken ze allebei, dan blijft het kaartje gewoon
  // staan met het adres en de contactknop.
  const toontFoto = !!adres.centroideRd && !beeldFout;
  const toont3d = modelBezig || !!model;

  return (
    <section
      aria-label="Jouw woning"
      className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card"
    >
      {/* Mobiel staan luchtfoto en 3D-model naast elkaar (scheelt een halve
          schermhoogte scrollen); vanaf md weer onder elkaar in de smalle kolom.
          De 3:2-verhouding houdt het paneel ongeveer even hoog als de samenvatting
          ernaast; bij 4:3 stak het eronderuit. */}
      <div className={toontFoto && toont3d ? "grid grid-cols-2 md:grid-cols-1" : ""}>
        <Luchtfoto
          adres={adres}
          adresRegel={adresRegel}
          pand={pand}
          pandBezig={pandBezig}
          onFout={() => setBeeldFout(true)}
        />

        {/* Licht 3D-model naast (mobiel) of onder de foto, zelfde uitlijning. */}
        <WoningModel model={model} isPending={modelBezig} />
      </div>

      <div className="flex flex-1 flex-col gap-3 border-t border-border p-4 md:p-5">
        <div>
          <p className="font-display text-[16px] font-semibold leading-snug text-primary">{adresRegel}</p>
          <p className="text-[13px] text-muted-foreground">
            {adres.woonplaatsnaam}
            {pand?.bouwjaar ? ` · Bouwjaar ${pand.bouwjaar}` : ""}
          </p>
        </div>

        {/* De contactroute staat hier, in de ruimte die onder de beelden tóch
            overblijft. In de samenvatting nam dezelfde knop te veel aandacht weg
            van de uitkomst zelf. */}
        {onVraagKlik && (
          <button
            type="button"
            onClick={onVraagKlik}
            className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-full border border-accent bg-accent/15 px-4 py-2.5 text-[14px] font-semibold text-primary transition-colors hover:bg-accent/25 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <MessageCircle size={16} strokeWidth={2} aria-hidden="true" />
            Ik heb een vraag
          </button>
        )}
      </div>
    </section>
  );
};
