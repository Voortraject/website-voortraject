import { useState, type ReactNode } from "react";

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
  /** Onder het adres, bijvoorbeeld de bouwjaarzin en het energielabel (telefoon). */
  children?: ReactNode;
}

// Het persoonlijke "dit is jóuw huis"-paneel naast het resultaat: een luchtfoto
// met de BAG-pandcontour in oker, een licht 3D-model (3D BAG) en het adres. De
// enige knop op het resultaat staat in de hoofdtegel ernaast, niet hier: binnenin
// leek een knop over de foto's te gaan. Presentational: alle data komt van
// StapResultaat, zodat de fetches al starten bij het klikken naar het resultaat
// (niet pas als dit paneel mount).
export const Woningpaneel = ({ adres, input, pand, pandBezig, model, modelBezig, children }: WoningpaneelProps) => {
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
      data-veer
      className="rs-wit flex flex-col p-2.5"
    >
      {/* De beelden. Op de telefoon een lage band (foto en 3D-model naast
          elkaar), zodat het paneel geen halve schermhoogte kost. Op desktop
          staan ze in de smalle kolom onder elkaar en vullen ze precies de
          hoogte die de hoofdtegel ernaast bepaalt: absoluut gepositioneerd,
          dus de beelden rekken de rij zelf niet op. */}
      <div className="relative h-[96px] sm:h-[150px] lg:h-auto lg:min-h-[140px] lg:flex-1">
        <div
          className={`h-full lg:absolute lg:inset-0 ${
            toontFoto && toont3d ? "grid grid-cols-[1.5fr_1fr] gap-2 lg:grid-cols-1 lg:grid-rows-2 lg:gap-2.5" : ""
          }`}
        >
          <Luchtfoto
            adres={adres}
            adresRegel={adresRegel}
            pand={pand}
            pandBezig={pandBezig}
            className="h-full rounded-[14px]"
            onFout={() => setBeeldFout(true)}
          />

          {/* Licht 3D-model naast (mobiel) of onder de foto, zelfde uitlijning. */}
          <WoningModel model={model} isPending={modelBezig} />
        </div>
      </div>

      {/* Adres en plaats/bouwjaar op één regel: drie korte stukjes tekst, en
          onder elkaar kostte dat op een telefoon een regel extra. Past het niet,
          dan breekt hij netjes tussen adres en plaats. */}
      <div className="px-1.5 pb-0.5 pt-2.5 sm:px-2 sm:pt-3">
        <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
          <p className="font-display text-[15px] font-bold leading-snug text-primary sm:text-[16px]">{adresRegel}</p>
          <p className="text-[13.5px] text-[hsl(var(--rs-tekst-zacht))] sm:text-[14px]">
            {adres.woonplaatsnaam}
            {pand?.bouwjaar ? ` · Bouwjaar ${pand.bouwjaar}` : ""}
          </p>
        </div>
      </div>
      {children && <div className="grid gap-4 px-1.5 pb-2.5 pt-3 sm:px-2">{children}</div>}
    </section>
  );
};
