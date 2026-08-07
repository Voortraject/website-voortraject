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
}

// Het persoonlijke "dit is jóuw huis"-paneel naast het resultaat: een luchtfoto
// met de BAG-pandcontour in oker, een licht 3D-model (3D BAG) en het adres. De
// contactknop staat bewust búiten dit kaartje (zie StapResultaat): binnenin leek
// "Ik heb een vraag" over de foto's te gaan. Presentational: alle data komt van
// StapResultaat, zodat de fetches al starten bij het klikken naar het resultaat
// (niet pas als dit paneel mount).
export const Woningpaneel = ({ adres, input, pand, pandBezig, model, modelBezig }: WoningpaneelProps) => {
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
          className="aspect-[3/2]"
          onFout={() => setBeeldFout(true)}
        />

        {/* Licht 3D-model naast (mobiel) of onder de foto, zelfde uitlijning. */}
        <WoningModel model={model} isPending={modelBezig} />
      </div>

      <div className="border-t border-border p-4 md:p-5">
        <p className="font-display text-[16px] font-semibold leading-snug text-primary">{adresRegel}</p>
        <p className="text-[13px] text-muted-foreground">
          {adres.woonplaatsnaam}
          {pand?.bouwjaar ? ` · Bouwjaar ${pand.bouwjaar}` : ""}
        </p>
      </div>
    </section>
  );
};
