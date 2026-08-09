interface VoortgangProps {
  /** De labels van de stappen (2 zonder poort, 3 met de gegevens-poort). */
  stappen: readonly string[];
  /** 1-based index van de huidige stap. */
  huidige: number;
  /**
   * Hoe ver de bezoeker bínnen de huidige stap is (0…1). Vult het lijntje naar
   * de volgende stap gedeeltelijk.
   *
   * Waarom: een indicator die op nul begint leest als "je moet nog alles doen".
   * Nunes & Drèze lieten met stempelkaarten zien dat een kaart die al een paar
   * stempels heeft vaker wordt afgemaakt dan een lege kaart met precies
   * evenveel werk te gaan (endowed progress). De basiswaarde hieronder is dus
   * geen nul: wie de check heeft geopend is begonnen. Zodra het adres herkend
   * is loopt het lijntje verder door, en dat is echte voortgang, geen sier.
   */
  deel?: number;
  /** De afgeronde eerste stap is klikbaar om terug te gaan (gangbaar patroon). */
  onStapKlik?: () => void;
}

// Bescheiden voortgangsindicator: bolletjes met labels. Het zichtbare eindpunt
// ("Resultaat") trekt de bezoeker door de flow heen. Werkt voor 2 of 3 stappen.
export const Voortgang = ({ stappen, huidige, deel = 0, onStapKlik }: VoortgangProps) => (
  <ol className="flex items-center justify-center gap-0" aria-label={`Stap ${huidige} van ${stappen.length}`}>
    {stappen.map((label, i) => {
      const stap = i + 1;
      const actief = stap === huidige;
      const afgerond = stap < huidige;
      const klikbaar = afgerond && stap === 1 && !!onStapKlik;

      const inhoud = (
        <>
          <span
            aria-hidden="true"
            className={`h-2.5 w-2.5 rounded-full transition-colors ${
              actief ? "bg-accent ring-4 ring-accent/25" : afgerond ? "bg-primary" : "bg-border"
            }`}
          />
          <span
            className={`text-[12px] sm:text-[13px] font-medium ${
              actief ? "text-primary font-semibold" : afgerond ? "text-primary/70" : "text-muted-foreground"
            }`}
          >
            {label}
          </span>
        </>
      );

      return (
        <li key={label} className="flex items-start">
          {i > 0 && (
            <span
              aria-hidden="true"
              // Een balkje van 3px in plaats van een haarlijn van 1px. Op een
              // haarlijn is een vulling van 20% simpelweg onzichtbaar, en dan
              // doet de voortgang zijn werk niet.
              //
              // mt = halve bolhoogte (10px) min halve balkhoogte, zodat de balk
              // precies door het midden van de bolletjes loopt.
              className={`relative mx-2 mt-[3.5px] h-[3px] w-8 overflow-hidden rounded-full sm:mx-3 sm:w-14 ${
                afgerond || actief ? "bg-primary/50" : "bg-border"
              }`}
            >
              {/* Het balkje ná de huidige stap loopt alvast een stukje mee. In
                  accent, dezelfde kleur als het bolletje van de stap waar de
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
