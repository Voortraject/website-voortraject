import { Check } from "lucide-react";

interface VoortgangProps {
  /** De labels van de stappen (2 zonder poort, 3 met de gegevens-poort). */
  stappen: readonly string[];
  /** 1-based index van de huidige stap. */
  huidige: number;
  /**
   * Hoe ver de bezoeker bínnen de huidige stap is (0…1). Vult het balkje naar
   * de volgende stap gedeeltelijk.
   *
   * Waarom: een indicator die op nul begint leest als "je moet nog alles doen".
   * Nunes & Drèze lieten met stempelkaarten zien dat een kaart die al een paar
   * stempels heeft vaker wordt afgemaakt dan een lege kaart met precies
   * evenveel werk te gaan (endowed progress). De basiswaarde hieronder is dus
   * geen nul: wie de check heeft geopend is begonnen. Zodra het adres herkend
   * is loopt het balkje verder door, en dat is echte voortgang, geen sier.
   */
  deel?: number;
  /** De afgeronde eerste stap is klikbaar om terug te gaan (gangbaar patroon). */
  onStapKlik?: () => void;
}

// Voortgangsindicator: genummerde cirkels met labels, verbonden door een balkje.
//
// De opzet volgt wat de gangbare richtlijnen voorschrijven (o.a. het
// Amerikaanse USWDS-designsysteem en de checkout-studies van Baymard):
//
//  - Genummerde cirkels in plaats van kale bolletjes: het nummer zegt waar je
//    bent én hoeveel stappen er zijn, zonder een extra regel tekst.
//  - Drie duidelijk verschillende toestanden, waarbij de HUIDIGE stap het meest
//    opvalt (de expliciete USWDS-regel).
//  - Een vinkje bij wat af is, want dat leest sneller dan een nummer.
//  - Het zichtbare eindpunt ("Resultaat") trekt de bezoeker door de flow heen.
//
// Huisstijl van oktober 2026 (zie het instap-blok in src/index.css): afgerond
// is een groen rondje met een wit vinkje, de huidige stap inktblauw met
// schaduw, wat nog komt wit met een zachte schaduw. Geen oker meer: dat is nu
// alleen voor de hoofdknop.
//
// Toegankelijkheid: de cirkels zelf staan op aria-hidden (ze herhalen alleen wat
// het label al zegt), de huidige stap krijgt aria-current="step", en per stap
// staat er verborgen tekst met de status. Werkt voor 2 of 3 stappen.
export const Voortgang = ({ stappen, huidige, deel = 0, onStapKlik }: VoortgangProps) => (
  <ol className="flex items-start justify-center gap-0" aria-label={`Stap ${huidige} van ${stappen.length}`}>
    {stappen.map((label, i) => {
      const stap = i + 1;
      const actief = stap === huidige;
      const afgerond = stap < huidige;
      const klikbaar = afgerond && stap === 1 && !!onStapKlik;
      const status = afgerond ? "klaar" : actief ? "nu" : "straks";

      const inhoud = (
        <>
          <span
            aria-hidden="true"
            data-stap-status={status}
            className={`instap-stap-${status} flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full text-[14px] font-extrabold transition-colors`}
          >
            {afgerond ? <Check size={16} strokeWidth={3} /> : stap}
          </span>
          <span
            className={`text-[12px] font-semibold sm:text-[13px] ${actief ? "text-primary" : "text-instap-zacht"}`}
          >
            {label}
            <span className="sr-only"> ({afgerond ? "afgerond" : actief ? "huidige stap" : "nog te doen"})</span>
          </span>
        </>
      );

      return (
        <li key={label} className="flex items-start">
          {i > 0 && (
            <span
              aria-hidden="true"
              // Een balkje van 6px met ronde einden, zodat een gedeeltelijke
              // vulling goed afleesbaar is. De breedte loopt op met het scherm;
              // op mobiel bepalen de labels de ruimte (drie labels zijn samen
              // zo'n 200px).
              //
              // mt = halve cirkelhoogte (17px) min halve balkhoogte, zodat de
              // balk precies door het midden van de cirkels loopt.
              className={`relative mx-2 mt-[14px] h-[6px] w-10 overflow-hidden rounded-full min-[400px]:w-14 sm:mx-3 sm:w-24 ${
                afgerond || actief ? "instap-lijn-vul" : "instap-lijn"
              }`}
            >
              {/* Het balkje ná de huidige stap loopt alvast een stukje mee. */}
              {stap === huidige + 1 && deel > 0 && (
                <span
                  className="instap-lijn-vul absolute inset-y-0 left-0 rounded-full transition-[width] duration-700 ease-out"
                  style={{ width: `${Math.min(Math.max(deel, 0), 1) * 100}%` }}
                />
              )}
            </span>
          )}
          {klikbaar ? (
            <button
              type="button"
              onClick={onStapKlik}
              aria-label={`Terug naar stap 1: ${label}`}
              className="flex flex-col items-center gap-1.5 rounded-sm transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {inhoud}
            </button>
          ) : (
            <span className="flex flex-col items-center gap-1.5" aria-current={actief ? "step" : undefined}>
              {inhoud}
            </span>
          )}
        </li>
      );
    })}
  </ol>
);
