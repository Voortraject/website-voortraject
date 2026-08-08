import { Loader2 } from "lucide-react";

// Presentatie van de zoekstap. De timing zit in useLaadsequentie
// (src/hooks/useLaadsequentie.ts); dit bestand exporteert alleen een component,
// zodat fast refresh blijft werken.

interface ZoekKaartProps {
  /** Volledige adresregel, bijv. "Hoofdstraat 12, Emmen". */
  adresRegel: string;
  gemeente?: string;
  provincie?: string;
  /** Huidige fase uit useLaadsequentie. */
  fase: number;
}

// Eén zoekstap tegelijk, prominent in beeld; de stappen wisselen elkaar rustig
// kruisvervagend af.
export const ZoekKaart = ({ adresRegel, gemeente, provincie, fase }: ZoekKaartProps) => {
  const stappen = [
    "Landelijke regelingen doorzoeken",
    provincie ? `Provinciale regelingen voor ${provincie} doorzoeken` : "Provinciale regelingen doorzoeken",
    gemeente ? `Regelingen van gemeente ${gemeente} doorzoeken` : "Gemeentelijke regelingen doorzoeken",
  ];
  const idx = Math.min(fase, stappen.length - 1);

  return (
    <div
      className="mx-auto max-w-[560px] animate-fade-up rounded-2xl border border-border bg-card p-8 text-center shadow-card md:p-10"
      aria-live="polite"
      aria-busy="true"
    >
      <p className="text-[13.5px] text-muted-foreground">We zoeken de regelingen voor {adresRegel}</p>

      <Loader2 size={26} className="mx-auto mt-8 animate-spin text-accent" aria-hidden="true" />

      {/* Absoluut gestapeld zodat de stappen rustig in elkaar overvloeien
          zonder de layout te laten springen. */}
      <div className="relative mx-auto mt-4 h-[64px]">
        {stappen.map((label, i) => (
          <p
            key={i}
            className="absolute inset-0 flex items-center justify-center px-4 text-[18px] font-semibold leading-snug text-primary transition-all duration-500 ease-out md:text-[20px]"
            style={{
              opacity: i === idx ? 1 : 0,
              transform: i === idx ? "translateY(0)" : i < idx ? "translateY(-12px)" : "translateY(12px)",
            }}
            aria-hidden={i !== idx}
          >
            {label}
          </p>
        ))}
      </div>

      {/* Voortgangsstippen: de actieve rekt rustig uit tot een okerbalkje. */}
      <div className="mt-7 flex items-center justify-center gap-2.5" aria-hidden="true">
        {stappen.map((_, i) => (
          <span
            key={i}
            className="h-2 rounded-full transition-all duration-500 ease-out"
            style={{
              width: i === idx ? 24 : 8,
              backgroundColor: i <= idx ? "hsl(var(--accent))" : "hsl(var(--border))",
            }}
          />
        ))}
      </div>
    </div>
  );
};
