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

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        aria-pressed={allesModus}
        onClick={() => onWijzig([])}
        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1.5 text-[12px] font-semibold transition-colors min-h-[34px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:gap-1.5 sm:px-4 sm:py-2.5 sm:text-[14px] sm:min-h-[44px] ${
          allesModus
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-card text-primary hover:border-primary/40"
        }`}
      >
        Alles
      </button>
      {ALLE_MAATREGELEN.map((m) => {
        const Icon = MAATREGEL_ICONS[m];
        const actief = gekozen.includes(m);
        return (
          <button
            key={m}
            type="button"
            aria-pressed={actief}
            onClick={() => toggle(m)}
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1.5 text-[12px] font-medium transition-colors min-h-[34px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:gap-1.5 sm:px-4 sm:py-2.5 sm:text-[14px] sm:min-h-[44px] ${
              actief
                ? "border-accent bg-accent/15 text-primary"
                : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary"
            }`}
          >
            {/* Icoon kost mobiel breedte → alleen op sm+ (helpt bij max 3 regels). */}
            <Icon size={15} strokeWidth={2} aria-hidden="true" className={`hidden sm:block ${actief ? "text-primary" : ""}`} />
            {MAATREGEL_LABELS[m]}
          </button>
        );
      })}
    </div>
  );
};
