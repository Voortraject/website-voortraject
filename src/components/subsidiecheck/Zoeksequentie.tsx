import { useEffect, useMemo, useRef, useState } from "react";
import { Check } from "lucide-react";

import { Blaadje } from "@/components/Blaadje";
import { doelVulling, useVloeiend } from "@/hooks/useLaadsequentie";

// Presentatie van de zoekstap. De timing zit in useLaadsequentie
// (src/hooks/useLaadsequentie.ts); dit bestand exporteert alleen een component,
// zodat fast refresh blijft werken.

interface ZoekKaartProps {
  /** Volledige adresregel, bijv. "Hoofdstraat 12, Emmen". */
  adresRegel: string;
  gemeente?: string;
  provincie?: string;
  /** Huidige fase uit useLaadsequentie. */
  fase: number;
  /** De bron heeft geantwoord; pas dan vult het blaadje tot 100%. */
  klaar: boolean;
}

/**
 * Welke bron er als laatste klaar is, als tekst voor de laadregel. Leeg zolang
 * er nog niets doorzocht is.
 *
 * Elke regel meldt een bron die AF is, met een vinkje ervoor. Fase 1 en 2
 * betekenen dat de landelijke en provinciale stap voorbij zijn; de gemeente
 * staat pas als afgerond als de bron ook echt geantwoord heeft, want de laatste
 * stap wacht op de echte fetch (zie useLaadsequentie).
 */
const laatsteBron = (fase: number, klaar: boolean, provincie?: string, gemeente?: string): string => {
  if (fase >= 2 && klaar) return gemeente ? `Gemeente ${gemeente}` : "Gemeentelijke regelingen";
  if (fase >= 2) return provincie ? `Provincie ${provincie}` : "Provinciale regelingen";
  if (fase >= 1) return "Landelijke regelingen";
  return "";
};

// Hoe lang de regel uit beeld is bij een wissel. Gelijk aan de transitie in
// .instap-laadregel (src/index.css).
const WISSEL_MS = 420;

// Het zoekscherm: het blaadje uit het logo vult zich met de echte voortgang,
// met het percentage eronder en één stille regel die zegt wat er al doorzocht
// is. Rustig bedoeld: er schuift niets en er wisselen geen pillen. Vinkje en
// tekst horen bij elkaar en vervagen samen in de volgende regel, zodat het
// vinkje nooit los knippert. Eerdere versies (een lijst van drie, een
// wisselende pil, drie woorden die inkleurden) vond de opdrachtgever te druk.
export const ZoekKaart = ({ adresRegel, gemeente, provincie, fase, klaar }: ZoekKaartProps) => {
  const { doel, duurMs } = doelVulling(fase, klaar);
  const vulling = useVloeiend(doel, duurMs);
  const procent = Math.round(vulling * 100);

  const reduced = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );
  const doelTekst = laatsteBron(fase, klaar, provincie, gemeente);
  const [tekst, setTekst] = useState(doelTekst);
  const [uit, setUit] = useState(doelTekst === "");
  const eerste = useRef(true);

  useEffect(() => {
    // De eerste melding vervaagt alleen in; een wissel vervaagt eerst uit.
    if (reduced || eerste.current || tekst === "") {
      eerste.current = false;
      setTekst(doelTekst);
      setUit(doelTekst === "");
      return;
    }
    if (doelTekst === tekst) return;
    setUit(true);
    const t = setTimeout(() => {
      setTekst(doelTekst);
      setUit(false);
    }, WISSEL_MS);
    return () => clearTimeout(t);
    // `tekst` hoort er bewust niet bij: alleen een nieuw doel start een wissel.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doelTekst, reduced]);

  return (
    <div
      className="instap-tegel instap-in mx-auto max-w-[620px] rounded-[24px] px-[26px] pb-7 pt-[30px] text-center shadow-instap-tegel"
      style={{ ["--i" as string]: 2 }}
      aria-busy="true"
    >
      <p className="text-[15px] leading-relaxed text-instap-zacht">
        We zoeken de regelingen voor <strong className="whitespace-nowrap font-semibold text-primary">{adresRegel}</strong>
      </p>

      {/* Het blaadje uit het logo vult zich met de echte voortgang. Vol is het
          precies het blad uit de favicon, en dat is ook het moment dat de
          regelingen er zijn. */}
      <div
        className="mx-auto mt-[18px] flex flex-col items-center"
        role="progressbar"
        aria-label="Voortgang van het zoeken"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={procent}
      >
        <span style={{ filter: "drop-shadow(0 10px 18px hsl(var(--primary) / 0.12))" }}>
          <Blaadje vulling={vulling} className="block h-[112px] w-[112px]" />
        </span>
        <span className="instap-display mt-2 text-[40px] leading-none tabular-nums text-primary" aria-hidden="true">
          {procent}%
        </span>
      </div>

      <p
        role="status"
        aria-live="polite"
        data-uit={uit}
        className="instap-laadregel mx-auto mt-3.5 flex min-h-[24px] items-center justify-center gap-[7px] text-[15.5px] font-semibold text-instap-zacht"
      >
        {tekst && (
          <>
            <Check size={16} strokeWidth={2.6} className="shrink-0 text-instap-subsidie" aria-hidden="true" />
            {tekst}
          </>
        )}
      </p>
    </div>
  );
};
