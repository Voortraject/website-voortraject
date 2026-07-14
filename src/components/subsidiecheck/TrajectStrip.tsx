import { useCallback, useEffect, useRef, useState } from "react";
import { Check, ChevronRight } from "lucide-react";

// Trajectstrip onder de samenvatting: maakt de belofte "rust en duidelijkheid in
// het verduurzamingstraject" zichtbaar en gebruikt endowed progress — stap 1 is
// al afgevinkt, dus de bewoner maakt iets af dat begonnen is. Puur presentatie;
// de bewoner staat altijd op stap 1 (het overzicht is net klaar).
const STAPPEN = ["Overzicht", "Persoonlijk advies", "Aanvraag geregeld", "Woning verduurzaamd"];

export const TrajectStrip = () => {
  const scrollerRef = useRef<HTMLOListElement>(null);
  // Swipe-affordance: op smalle schermen valt een deel van het pad buiten beeld,
  // maar zonder hint ziet niemand dat je kunt swipen. Fade + pijl rechts zolang
  // er nog iets buiten beeld staat; weg zodra het einde bereikt is (of alles past).
  const [meerRechts, setMeerRechts] = useState(false);

  const updateAffordance = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setMeerRechts(el.scrollWidth - el.scrollLeft - el.clientWidth > 8);
  }, []);

  useEffect(() => {
    updateAffordance();
    window.addEventListener("resize", updateAffordance);
    return () => window.removeEventListener("resize", updateAffordance);
  }, [updateAffordance]);

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
      <div className="relative">
        <ol ref={scrollerRef} onScroll={updateAffordance} className="no-scrollbar flex items-start overflow-x-auto">
        {STAPPEN.map((stap, i) => {
          const gedaan = i === 0;
          return (
            <li key={stap} className="contents">
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
                  {stap}
                </span>
              </div>
            </li>
          );
        })}
        </ol>
        {meerRechts && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-14"
            style={{ background: "linear-gradient(to right, transparent, var(--card-soft) 70%)" }}
          >
            {/* Pijl op de hartlijn van de bolletjes (h-10 → midden op 20px). */}
            <ChevronRight size={18} strokeWidth={2.5} className="absolute right-0 top-[11px] animate-pulse text-muted-foreground" />
          </div>
        )}
      </div>
    </section>
  );
};
