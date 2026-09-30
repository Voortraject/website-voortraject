import { Blaadje } from "@/components/Blaadje";
import { doelVulling, useVloeiend } from "@/hooks/useLaadsequentie";

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
  /** De bron heeft geantwoord; pas dan vult het blaadje tot 100%. */
  klaar: boolean;
}

// Eén zoekstap tegelijk, prominent in beeld; de stappen wisselen elkaar rustig
// kruisvervagend af.
export const ZoekKaart = ({ adresRegel, gemeente, provincie, fase, klaar }: ZoekKaartProps) => {
  const stappen = [
    "Landelijke regelingen doorzoeken",
    provincie ? `Provinciale regelingen voor ${provincie} doorzoeken` : "Provinciale regelingen doorzoeken",
    gemeente ? `Regelingen van gemeente ${gemeente} doorzoeken` : "Gemeentelijke regelingen doorzoeken",
  ];
  const idx = Math.min(fase, stappen.length - 1);
  const { doel, duurMs } = doelVulling(fase, klaar);
  const vulling = useVloeiend(doel, duurMs);
  const procent = Math.round(vulling * 100);

  return (
    <div
      className="mx-auto max-w-[560px] animate-fade-up rounded-2xl border border-border bg-card p-8 text-center shadow-card md:p-10"
      aria-live="polite"
      aria-busy="true"
    >
      <p className="text-[13.5px] text-muted-foreground">We zoeken de regelingen voor {adresRegel}</p>

      {/* Het blaadje uit het logo vult zich met de echte voortgang. Vol is het
          precies het blad uit de favicon, en dat is ook het moment dat de regelingen er zijn. */}
      <div
        className="mx-auto mt-7 flex flex-col items-center"
        role="progressbar"
        aria-label="Voortgang van het zoeken"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={procent}
      >
        <Blaadje vulling={vulling} className="h-[72px] w-[72px] md:h-[84px] md:w-[84px]" />
        <span className="mt-2 text-[13px] font-semibold tabular-nums text-muted-foreground" aria-hidden="true">
          {procent}%
        </span>
      </div>

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
    </div>
  );
};
