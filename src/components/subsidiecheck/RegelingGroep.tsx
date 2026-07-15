import { type SubsidieRegeling } from "@/lib/subsidies";

import { SubsidieCard } from "./SubsidieCard";

interface RegelingGroepProps {
  /** Kop boven de groep, bijv. "Landelijke regelingen". */
  titel: string;
  regelingen: SubsidieRegeling[];
  /** Fade-up staat standaard aan; het afgeschermde blok zet hem uit (onder de blur
   *  is animatie alleen ruis). */
  animatie?: boolean;
}

// Eén groep regelingen in het resultaat: de kop (titel + teller) en de kaarten
// eronder (op desktop twee naast elkaar). Geëxtraheerd zodat de vrij zichtbare
// groep én de (later ontgrendelde) afgeschermde groep exact dezelfde opmaak delen.
export const RegelingGroep = ({ titel, regelingen, animatie = true }: RegelingGroepProps) => (
  <section aria-label={titel}>
    <h2 className="mb-3 flex items-center gap-2 text-[14px] font-semibold uppercase tracking-[0.08em] text-primary">
      {titel}
      <span className="font-normal text-muted-foreground">· {regelingen.length}</span>
    </h2>
    <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2">
      {regelingen.map((regeling, i) => (
        <div
          key={regeling.id}
          className={animatie ? "animate-fade-up" : undefined}
          style={animatie ? { animationDelay: `${Math.min(i * 50, 300)}ms` } : undefined}
        >
          <SubsidieCard regeling={regeling} />
        </div>
      ))}
    </div>
  </section>
);
