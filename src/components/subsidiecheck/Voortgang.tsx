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
// Dit was eerder een rij bolletjes van 10px. Die vielen simpelweg niet op: je
// zag niet in welke stap je zat, en een balkje van 1px maakte gedeeltelijke
// voortgang onzichtbaar. De opzet hieronder volgt wat de gangbare richtlijnen
// voorschrijven (o.a. het Amerikaanse USWDS-designsysteem en de checkout-studies
// van Baymard):
//
//  - Genummerde cirkels in plaats van kale bolletjes: het nummer zegt waar je
//    bent én hoeveel stappen er zijn, zonder een extra regel tekst.
//  - Drie duidelijk verschillende toestanden, waarbij de HUIDIGE stap het meest
//    opvalt. Dat is de expliciete USWDS-regel: de huidige stap moet zich
//    onderscheiden van zowel de afgeronde als de nog komende stappen. Afgerond =
//    gevuld in primary met een vinkje, huidig = gevuld in accent met een ring,
//    nog te doen = alleen een randje met een grijs nummer.
//  - Een vinkje bij wat af is, want dat leest sneller dan een nummer.
//  - Het zichtbare eindpunt ("Resultaat") trekt de bezoeker door de flow heen.
//
// Toegankelijkheid: de cirkels zelf staan op aria-hidden (ze herhalen alleen wat
// het label al zegt), de huidige stap krijgt aria-current="step", en per stap
// staat er verborgen tekst met de status. Zo hoort een screenreader hetzelfde
// als wat je ziet. Werkt voor 2 of 3 stappen.
export const Voortgang = ({ stappen, huidige, deel = 0, onStapKlik }: VoortgangProps) => (
  <ol className="flex items-start justify-center gap-0" aria-label={`Stap ${huidige} van ${stappen.length}`}>
    {stappen.map((label, i) => {
      const stap = i + 1;
      const actief = stap === huidige;
      const afgerond = stap < huidige;
      const klikbaar = afgerond && stap === 1 && !!onStapKlik;

      const cirkel = afgerond
        ? "bg-primary text-primary-foreground"
        : actief
          ? "bg-accent text-primary ring-4 ring-accent/25"
          : "border-2 border-border bg-card text-muted-foreground";

      const inhoud = (
        <>
          <span
            aria-hidden="true"
            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold transition-colors ${cirkel}`}
          >
            {afgerond ? <Check size={15} strokeWidth={3} /> : stap}
          </span>
          <span
            className={`text-[12px] font-medium sm:text-[13px] ${
              actief ? "font-semibold text-primary" : afgerond ? "text-primary/70" : "text-muted-foreground"
            }`}
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
              // Een balkje van 3px in plaats van een haarlijn van 1px. Op een
              // haarlijn is een vulling van een kwart simpelweg onzichtbaar, en
              // dan doet de voortgang zijn werk niet.
              //
              // mt = halve cirkelhoogte (14px) min halve balkhoogte, zodat de
              // balk precies door het midden van de cirkels loopt.
              className={`relative mx-2 mt-[12.5px] h-[3px] w-8 overflow-hidden rounded-full sm:mx-3 sm:w-14 ${
                afgerond || actief ? "bg-primary/50" : "bg-border"
              }`}
            >
              {/* Het balkje ná de huidige stap loopt alvast een stukje mee. In
                  accent, dezelfde kleur als de cirkel van de stap waar de
                  bezoeker nu staat: het hoort bij het hier-en-nu, terwijl
                  primary staat voor wat al af is. */}
              {stap === huidige + 1 && deel > 0 && (
                <span
                  className="absolute inset-y-0 left-0 rounded-full bg-accent transition-[width] duration-700 ease-out"
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
