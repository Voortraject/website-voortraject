interface VoortgangProps {
  /** De labels van de stappen (2 zonder poort, 3 met de gegevens-poort). */
  stappen: readonly string[];
  /** 1-based index van de huidige stap. */
  huidige: number;
  /** De afgeronde eerste stap is klikbaar om terug te gaan (gangbaar patroon). */
  onStapKlik?: () => void;
}

// Bescheiden voortgangsindicator: bolletjes met labels, met daaronder een balkje
// en een percentage. Het zichtbare eindpunt ("Resultaat") trekt de bezoeker door
// de flow heen; het percentage maakt bovendien voelbaar hoe weinig er nog te doen
// is (endowed progress: je begint niet op nul, je bent al onderweg).
// Werkt voor 2 of 3 stappen.
export const Voortgang = ({ stappen, huidige, onStapKlik }: VoortgangProps) => {
  const percentage = Math.round((huidige / stappen.length) * 100);
  const klaar = huidige >= stappen.length;

  return (
    <div>
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
              // mt = halve bolhoogte (10px), zodat de lijn precies door het
              // midden van de bolletjes loopt i.p.v. tussen bol en label.
              className={`mx-2 sm:mx-3 mt-[5px] h-px w-8 sm:w-14 ${afgerond || actief ? "bg-primary/50" : "bg-border"}`}
            />
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

      {/* Voortgangsbalk + percentage. Bewust smal en rustig: het is een
          geruststelling ("je bent er bijna"), geen blikvanger. */}
      <div className="mx-auto mt-4 max-w-[280px]">
        <div className="h-1.5 overflow-hidden rounded-full bg-border" role="img" aria-label={`${percentage} procent voltooid`}>
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <p className="mt-1.5 text-center text-[12px] font-medium text-muted-foreground">
          {klaar ? "Klaar" : `${percentage}% voltooid`}
        </p>
      </div>
    </div>
  );
};
