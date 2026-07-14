import { Briefcase, Building2, Check, Home, KeyRound, type LucideIcon } from "lucide-react";

import { BEWONERTYPE_LABELS, type Bewonertype } from "@/lib/subsidies";

const TYPE_ICONS: Record<Bewonertype, LucideIcon> = {
  woningeigenaar: Home,
  huurder: KeyRound,
  vve: Building2,
  verhuurder: Briefcase,
};

const TYPE_TOELICHTING: Record<Bewonertype, string> = {
  woningeigenaar: "Ik woon in mijn eigen huis",
  huurder: "Ik huur mijn woning",
  vve: "Wij zijn een Vereniging van Eigenaren",
  verhuurder: "Ik verhuur een of meer woningen",
};

interface BewonertypeKeuzeProps {
  waarde: Bewonertype;
  onKies: (type: Bewonertype) => void;
}

// Bewonertype als grote tapbare kaarten (radiogroup). Controlled, zodat het
// zowel los als binnen de gecombineerde eerste stap gebruikt kan worden.
export const BewonertypeKeuze = ({ waarde, onKies }: BewonertypeKeuzeProps) => (
  <div className="grid grid-cols-2 gap-2 sm:gap-3" role="radiogroup" aria-label="Type bewoner">
    {(Object.keys(BEWONERTYPE_LABELS) as Bewonertype[]).map((type) => {
      const Icon = TYPE_ICONS[type];
      const actief = waarde === type;
      return (
        <button
          key={type}
          type="button"
          role="radio"
          aria-checked={actief}
          onClick={() => onKies(type)}
          className={`relative flex items-start gap-2 rounded-lg border-2 px-3 py-3 text-left transition-colors min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:gap-3 sm:px-4 ${
            actief ? "border-accent bg-accent/10" : "border-border bg-card hover:border-primary/30"
          }`}
        >
          <Icon size={22} strokeWidth={1.75} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
          <span>
            <span className="block text-[14px] font-semibold leading-snug text-primary sm:text-[15px]">
              {BEWONERTYPE_LABELS[type]}
            </span>
            {/* Toelichting kost mobiel te veel ruimte → alleen op sm+. */}
            <span className="mt-0.5 hidden text-[13px] text-muted-foreground sm:block">{TYPE_TOELICHTING[type]}</span>
          </span>
          {actief && (
            <span
              className="absolute right-2.5 top-2.5 hidden h-5 w-5 items-center justify-center rounded-full bg-accent sm:flex"
              aria-hidden="true"
            >
              <Check size={13} strokeWidth={3} className="text-primary" />
            </span>
          )}
        </button>
      );
    })}
  </div>
);
