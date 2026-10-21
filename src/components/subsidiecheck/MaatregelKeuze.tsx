import {
  BatteryCharging,
  Construction,
  CookingPot,
  Droplets,
  Fan,
  Layers,
  Share2,
  Sun,
  Wind,
  type LucideIcon,
} from "lucide-react";

import { ALLE_MAATREGELEN, MAATREGEL_LABELS, type Maatregel } from "@/lib/subsidies";

const MAATREGEL_ICONS: Record<Maatregel, LucideIcon> = {
  isolatie: Layers,
  warmtepomp: Fan,
  zonnepanelen: Sun,
  zonneboiler: Droplets,
  ventilatie: Wind,
  warmtenet: Share2,
  "elektrisch-koken": CookingPot,
  thuisbatterij: BatteryCharging,
  // Bewust geen waarschuwingsdriehoek: die leest tussen de andere chips als
  // "hier is iets mis" in plaats van als een klus waar geld voor is.
  asbest: Construction,
};

interface MaatregelKeuzeProps {
  /** Lege lijst = "Alles" (de rustige standaard). */
  gekozen: Maatregel[];
  onWijzig: (gekozen: Maatregel[]) => void;
}

// Maatregelen als chips. "Alles" is de standaard (lege selectie); pas als iemand
// een chip aanklikt schakelt het naar gerichte selectie — aanvinken wat je wél
// wil, in plaats van afvinken wat je niet wil. Controlled.
export const MaatregelKeuze = ({ gekozen, onWijzig }: MaatregelKeuzeProps) => {
  const allesModus = gekozen.length === 0;

  const toggle = (m: Maatregel) => {
    const volgende = gekozen.includes(m) ? gekozen.filter((x) => x !== m) : [...gekozen, m];
    // Alles aangevinkt = terug naar de rustige "Alles"-modus.
    onWijzig(volgende.length === ALLE_MAATREGELEN.length ? [] : volgende);
  };

  // Huisstijl van oktober 2026: witte chips met schaduw, gekozen inktblauw
  // (.instap-chip in src/index.css). Oker blijft voor de hoofdknop.
  const chip =
    "instap-chip inline-flex min-h-[38px] items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:min-h-[44px] sm:gap-[7px] sm:px-[15px] sm:py-2.5 sm:text-[14.5px]";

  return (
    <div className="flex flex-wrap gap-2 sm:gap-[9px]">
      <button type="button" aria-pressed={allesModus} onClick={() => onWijzig([])} className={chip}>
        Alles
      </button>
      {ALLE_MAATREGELEN.map((m) => {
        const Icon = MAATREGEL_ICONS[m];
        const actief = gekozen.includes(m);
        return (
          <button key={m} type="button" aria-pressed={actief} onClick={() => toggle(m)} className={chip}>
            {/* Icoon kost mobiel breedte → alleen op sm+ (helpt bij max 3 regels). */}
            <Icon size={16} strokeWidth={2} aria-hidden="true" className="hidden sm:block" />
            {MAATREGEL_LABELS[m]}
          </button>
        );
      })}
    </div>
  );
};
