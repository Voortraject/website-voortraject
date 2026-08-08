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
// Vorm bewust rustig: geen kaart met rand en schaduw die met de samenvatting
// erboven concurreert, maar een zachte strook met een accentlijn. De vraag is
// de enige klikbare tekst, zodat er precies één ding te doen is.
//
// Voor de inhoud en de bronnen: zie eersteStapTekst.ts.
export const EersteStap = ({ bouwjaar, bewonertype, onVraag }: EersteStapProps) => {
  const tekst = eersteStapTekst(bouwjaar, bewonertype);
  if (!tekst) return null;

  return (
    <section
      aria-label="Een eerste stap"
      // Geen eigen omlijning: dit blok staat binnen de samenvattingskaart, en
      // die heeft er al een. Twee randen om elkaar heen leest als een kaartje in
      // een kaartje. Wat blijft is de okerbalk links, genoeg om het als eigen
      // stap te markeren, plus de zachte achtergrond tegen het wit van de kaart.
      className="rounded-r-lg border-l-4 border-l-accent py-3.5 pl-4 pr-4 sm:pl-5"
      style={{ backgroundColor: "var(--card-soft)" }}
    >
      <p className="text-[15px] leading-relaxed text-foreground sm:text-[15.5px]">{tekst.zinnen.join(" ")}</p>
      <button
        type="button"
        onClick={() => onVraag(tekst.voorstel)}
        className="mt-2.5 inline-flex items-center gap-1.5 rounded-sm text-left text-[15px] font-semibold text-primary underline underline-offset-4 transition-colors hover:text-accent-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:text-[15.5px]"
      >
        {tekst.vraag}
        <ArrowRight size={16} strokeWidth={2.25} className="shrink-0" aria-hidden="true" />
      </button>
    </section>
  );
};
