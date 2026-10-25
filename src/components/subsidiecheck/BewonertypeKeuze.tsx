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

// Volgorde in het raster (twee kolommen, rij voor rij): de lange labels links,
// zodat "Woningeigenaar" op een telefoon in de bredere linkerkolom op één regel past.
const TYPE_VOLGORDE: Bewonertype[] = ["woningeigenaar", "huurder", "verhuurder", "vve"];

interface BewonertypeKeuzeProps {
  waarde: Bewonertype;
  onKies: (type: Bewonertype) => void;
}

// Bewonertype als grote tapbare tegels (radiogroup). Controlled, zodat het
// zowel los als binnen de gecombineerde eerste stap gebruikt kan worden.
// Huisstijl van oktober 2026: witte tegels met schaduw, de gekozen tegel krijgt
// een blauw verloop en een vinkje dat inveert (.instap-keus in src/index.css).
export const BewonertypeKeuze = ({ waarde, onKies }: BewonertypeKeuzeProps) => (
  <div className="grid grid-cols-[1.4fr_1fr] gap-2.5 sm:grid-cols-2 sm:gap-3" role="radiogroup" aria-label="Type bewoner">
    {TYPE_VOLGORDE.map((type) => {
      const Icon = TYPE_ICONS[type];
      const actief = waarde === type;
      return (
        <button
          key={type}
          type="button"
          role="radio"
          aria-checked={actief}
          onClick={() => onKies(type)}
          className="instap-keus relative flex min-h-[56px] items-center gap-2 rounded-[18px] px-2.5 py-3 text-left text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:items-start sm:gap-3 sm:px-4 sm:py-[15px]"
        >
          <Icon size={20} strokeWidth={1.8} className="shrink-0 sm:mt-0.5 sm:h-[22px] sm:w-[22px]" aria-hidden="true" />
          <span className="sm:pr-5">
            <span className="block text-[13.5px] font-bold leading-snug sm:text-[15.5px]">{BEWONERTYPE_LABELS[type]}</span>
            {/* Toelichting kost mobiel te veel ruimte → alleen op sm+. */}
            <span className="mt-0.5 hidden text-[13.5px] font-medium text-instap-zacht sm:block">
              {TYPE_TOELICHTING[type]}
            </span>
          </span>
          {/* Op een telefoon is de tegel te smal voor een vinkje naast het label;
              daar zegt het blauwe verloop met de rand genoeg. */}
          {actief && (
            <span
              className="instap-vinkje absolute right-2.5 top-2.5 hidden h-[22px] w-[22px] items-center justify-center rounded-full sm:flex"
              aria-hidden="true"
            >
              <Check size={13} strokeWidth={3} />
            </span>
          )}
        </button>
      );
    })}
  </div>
);
