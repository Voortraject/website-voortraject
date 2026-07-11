const STAPPEN = ["Adres", "Situatie", "Resultaat"] as const;

// Bescheiden voortgangsindicator: drie bolletjes met labels. "Resultaat" als
// zichtbaar eindpunt trekt de bezoeker door de flow heen.
export const Voortgang = ({ huidige }: { huidige: 1 | 2 | 3 }) => (
  <ol className="flex items-center justify-center gap-0" aria-label={`Stap ${huidige} van 3`}>
    {STAPPEN.map((label, i) => {
      const stap = (i + 1) as 1 | 2 | 3;
      const actief = stap === huidige;
      const afgerond = stap < huidige;
      return (
        <li key={label} className="flex items-center">
          {i > 0 && (
            <span
              aria-hidden="true"
              className={`mx-2 sm:mx-3 h-px w-8 sm:w-14 ${afgerond || actief ? "bg-primary/50" : "bg-border"}`}
            />
          )}
          <span
            className="flex flex-col items-center gap-1.5"
            aria-current={actief ? "step" : undefined}
          >
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
          </span>
        </li>
      );
    })}
  </ol>
);
