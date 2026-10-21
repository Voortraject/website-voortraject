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
}

// De persoonlijke eerste stap: één uitspraak over woningen uit dit bouwjaar.
// Vorm: geen vlak, geen rand, geen balk, en sinds oktober 2026 ook geen
// klikbare vraag meer eronder: de hoofdtegel heeft één focus, de oker knop.
//
// Voor de inhoud en de bronnen: zie eersteStapTekst.ts.
export const EersteStap = ({ bouwjaar, bewonertype }: EersteStapProps) => {
  const tekst = eersteStapTekst(bouwjaar, bewonertype);
  if (!tekst) return null;

  return (
    <p className="text-[14.5px] leading-[1.7] text-foreground sm:text-[15.5px] md:text-[16px]">
      {tekst.zinnen.join(" ")}
    </p>
  );
};
