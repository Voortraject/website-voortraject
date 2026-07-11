import { useState } from "react";
import {
  BatteryCharging,
  Building2,
  Check,
  CookingPot,
  Fan,
  Home,
  KeyRound,
  Layers,
  Share2,
  Sun,
  Droplets,
  Wind,
  Briefcase,
  type LucideIcon,
} from "lucide-react";

import {
  ALLE_MAATREGELEN,
  BEWONERTYPE_LABELS,
  MAATREGEL_LABELS,
  type Bewonertype,
  type Maatregel,
} from "@/lib/subsidies";

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

const MAATREGEL_ICONS: Record<Maatregel, LucideIcon> = {
  isolatie: Layers,
  warmtepomp: Fan,
  zonnepanelen: Sun,
  zonneboiler: Droplets,
  ventilatie: Wind,
  warmtenet: Share2,
  "elektrisch-koken": CookingPot,
  thuisbatterij: BatteryCharging,
};

interface StapSituatieProps {
  initBewonertype: Bewonertype | null;
  initMaatregelen: Maatregel[];
  onVerder: (bewonertype: Bewonertype, maatregelen: Maatregel[]) => void;
}

// Stap 2: bewonertype als grote tapbare kaarten, maatregelen als chips.
// Alles staat default áán — een bezoeker die meteen op "Bekijk mijn
// subsidies" klikt krijgt gewoon het volledige overzicht. Afvinken is
// verfijnen, geen verplicht werk.
export const StapSituatie = ({ initBewonertype, initMaatregelen, onVerder }: StapSituatieProps) => {
  const [bewonertype, setBewonertype] = useState<Bewonertype | null>(initBewonertype);
  const [maatregelen, setMaatregelen] = useState<Maatregel[]>(
    initMaatregelen.length > 0 ? initMaatregelen : [...ALLE_MAATREGELEN],
  );
  const [typeFout, setTypeFout] = useState(false);

  const allesGeselecteerd = maatregelen.length === ALLE_MAATREGELEN.length;

  const toggleMaatregel = (m: Maatregel) =>
    setMaatregelen((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));

  const handleVerder = () => {
    if (!bewonertype) {
      setTypeFout(true);
      return;
    }
    // Niets aangevinkt = alles tonen (niemand bedoelt "toon mij nul subsidies").
    onVerder(bewonertype, maatregelen.length > 0 ? maatregelen : [...ALLE_MAATREGELEN]);
  };

  return (
    <div>
      <fieldset>
        <legend className="block mb-3 text-[14px] font-semibold text-foreground">Wat is jouw situatie?</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Type bewoner">
          {(Object.keys(BEWONERTYPE_LABELS) as Bewonertype[]).map((type) => {
            const Icon = TYPE_ICONS[type];
            const actief = bewonertype === type;
            return (
              <button
                key={type}
                type="button"
                role="radio"
                aria-checked={actief}
                onClick={() => {
                  setBewonertype(type);
                  setTypeFout(false);
                }}
                className={`relative flex items-start gap-3 rounded-lg border-2 bg-card p-4 text-left transition-colors min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  actief ? "border-accent" : "border-border hover:border-primary/30"
                }`}
              >
                <Icon size={22} strokeWidth={1.75} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                <span>
                  <span className="block text-[15px] font-semibold text-primary">
                    {BEWONERTYPE_LABELS[type]}
                  </span>
                  <span className="block mt-0.5 text-[13px] text-muted-foreground">
                    {TYPE_TOELICHTING[type]}
                  </span>
                </span>
                {actief && (
                  <span
                    className="absolute top-2.5 right-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent"
                    aria-hidden="true"
                  >
                    <Check size={13} strokeWidth={3} className="text-primary" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {typeFout && (
          <p role="alert" className="mt-2 text-[14px] text-destructive">
            Kies eerst wat jouw situatie is.
          </p>
        )}
      </fieldset>

      <fieldset className="mt-8">
        <legend className="block mb-1 text-[14px] font-semibold text-foreground">
          Waar ben je in geïnteresseerd?
        </legend>
        <p className="mb-3 text-[13px] text-muted-foreground">
          Alles staat aan — vink af wat je niet interessant vindt.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={allesGeselecteerd}
            onClick={() => setMaatregelen(allesGeselecteerd ? [] : [...ALLE_MAATREGELEN])}
            className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2.5 text-[14px] font-semibold transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
              allesGeselecteerd
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-primary hover:border-primary/40"
            }`}
          >
            Alles
          </button>
          {ALLE_MAATREGELEN.map((m) => {
            const Icon = MAATREGEL_ICONS[m];
            const actief = maatregelen.includes(m);
            return (
              <button
                key={m}
                type="button"
                aria-pressed={actief}
                onClick={() => toggleMaatregel(m)}
                className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2.5 text-[14px] font-medium transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                  actief
                    ? "border-accent bg-accent/15 text-primary"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary"
                }`}
              >
                <Icon size={15} strokeWidth={2} aria-hidden="true" className={actief ? "text-primary" : ""} />
                {MAATREGEL_LABELS[m]}
              </button>
            );
          })}
        </div>
      </fieldset>

      <button
        type="button"
        onClick={handleVerder}
        className="mt-8 w-full inline-flex items-center justify-center rounded-full bg-accent px-7 py-3.5 text-[15px] font-semibold text-primary transition-colors hover:bg-accent-hover min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Bekijk mijn subsidies
      </button>
    </div>
  );
};
