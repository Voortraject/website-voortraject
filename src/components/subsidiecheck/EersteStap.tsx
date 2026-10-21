import { ArrowRight } from "lucide-react";

import type { Bewonertype } from "@/lib/subsidies";

// Bestandsnaam met opzet niet "eersteStap.ts": op Windows is het
// bestandssysteem hoofdletterongevoelig, dus `./eersteStap` resolvet dan naar
// dít bestand (EersteStap.tsx). Het component importeert dan zichzelf, en de
// enige melding die je krijgt is "Element type is invalid ... got: undefined".
import { eersteStapTekst } from "./eersteStapTekst";

interface EersteStapProps {
  /** Bouwjaar uit de BAG. Ontbreekt het, dan rendert dit blok niets. */
  bouwjaar?: number;
  bewonertype: Bewonertype;
  /** Springt naar het vraagblok met dit voorstel al ingevuld. */
  onVraag: (voorstel: string) => void;
}

// De persoonlijke eerste stap: onder de conclusie, boven de lijst met
// regelingen. Op die plek is de aandacht het hoogst, en het kadert de lijst die
// eronder volgt: hier staat waaróm die regelingen relevant kunnen zijn.
//
// Vorm: geen vlak, geen rand, geen balk. Een alinea in de hoofdtegel met één
// klikbare zin eronder, en dat is precies wat het is.
//
// Voor de inhoud en de bronnen: zie eersteStapTekst.ts.
export const EersteStap = ({ bouwjaar, bewonertype, onVraag }: EersteStapProps) => {
  const tekst = eersteStapTekst(bouwjaar, bewonertype);
  if (!tekst) return null;

  return (
    <section aria-label="Een eerste stap">
      <p className="text-[14.5px] leading-[1.7] text-foreground sm:text-[15.5px] md:text-[16px]">{tekst.zinnen.join(" ")}</p>
      <button
        type="button"
        onClick={() => onVraag(tekst.voorstel)}
        className="rs-met-pijl mt-3 block rounded-sm text-left text-[14.5px] font-bold sm:text-[15.5px] text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-[16px]"
      >
        {tekst.vraag}
        {/* Het pijltje direct achter het laatste woord, ook als de zin breekt. */}
        <ArrowRight size={16} strokeWidth={2.25} className="rs-pijl ml-1.5 inline align-[-3px]" aria-hidden="true" />
      </button>
    </section>
  );
};
