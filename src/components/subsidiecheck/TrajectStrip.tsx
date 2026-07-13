import { Check } from "lucide-react";

// Trajectstrip onder de samenvatting: maakt de belofte "rust en duidelijkheid in
// het verduurzamingstraject" zichtbaar en gebruikt endowed progress — stap 1 is
// al afgevinkt, dus de bewoner maakt iets af dat begonnen is. Puur presentatie;
// de bewoner staat altijd op stap 1 (het overzicht is net klaar).
const STAPPEN = [
  { label: "Overzicht", sub: "nu klaar" },
  { label: "Persoonlijk advies" },
  { label: "Aanvraag geregeld" },
  { label: "Woning verduurzaamd" },
] as const;

export const TrajectStrip = () => {
  return (
    <section
      aria-label="Jouw verduurzamingstraject"
      className="mt-4 rounded-2xl border border-border p-5 md:px-7"
      style={{ backgroundColor: "var(--card-soft)" }}
    >
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h3 className="text-[15px] font-semibold text-primary">Jouw verduurzamingstraject</h3>
        <p className="text-[13px] font-semibold text-[hsl(var(--subsidie))]">Stap 1 van 4 voltooid</p>
      </div>

      {/* Horizontaal pad; op smalle schermen mag het rustig scrollen i.p.v. breken. */}
      <ol className="flex items-start overflow-x-auto pb-1">
        {STAPPEN.map((stap, i) => {
          const gedaan = i === 0;
          return (
            <li key={stap.label} className="contents">
              {i > 0 && (
                <span
                  aria-hidden="true"
                  className={`mt-[19px] h-0.5 min-w-[24px] flex-1 rounded-full ${gedaan ? "bg-accent" : "bg-border"}`}
                />
              )}
              <div className="flex w-[120px] shrink-0 flex-col items-center text-center md:w-[150px]">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-[15px] font-bold ${
                    gedaan
                      ? "border-accent bg-accent text-primary"
                      : "border-border bg-card text-muted-foreground"
                  }`}
                >
                  {gedaan ? <Check size={18} strokeWidth={3} aria-hidden="true" /> : i + 1}
                </span>
                <span className={`mt-2 text-[13.5px] font-semibold leading-tight ${gedaan ? "text-primary" : "text-muted-foreground"}`}>
                  {stap.label}
                </span>
                {stap.sub && <span className="mt-0.5 text-[12px] text-muted-foreground">{stap.sub}</span>}
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
};
