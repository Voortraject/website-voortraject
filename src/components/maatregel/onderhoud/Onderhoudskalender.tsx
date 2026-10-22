import { BRONNEN, KALENDER, type Uitvoerder } from "@/data/onderhoud";
import { Accent, SectieKop } from "@/components/maatregel/primitieven";

/**
 * Het hart van de pagina: per installatie wat er moet gebeuren, wanneer, wie
 * het doet en waarom.
 *
 * Die laatste kolom is het verschil met elke andere onderhoudslijst. "Filters
 * vervangen, 2 keer per jaar" is huiswerk; "anders blaast je systeem schimmels
 * en bacteriën mee" is een reden. Zonder die kolom onthoudt niemand dit.
 *
 * Zelf of specialist staat als merkteken bij elke regel en niet als aparte
 * sectie. De oude pagina had er een eigen blok voor, maar het is een eigenschap
 * van een beurt, geen apart onderwerp.
 */

// Zelf in oker, specialist in inktblauw: tinten, geen rand.
const WIE: Record<Uitvoerder, { label: string; klasse: string }> = {
  zelf: {
    label: "Zelf",
    klasse: "bg-[hsl(var(--accent)/0.3)]",
  },
  specialist: {
    label: "Specialist",
    klasse: "bg-[hsl(var(--rs-hoofd-van))]",
  },
};

const WieMerk = ({ wie }: { wie: Uitvoerder }) => {
  const stijl = WIE[wie];
  return (
    <span
      className={`inline-flex min-h-[26px] items-center whitespace-nowrap rounded-full px-3 text-[12.5px] font-extrabold uppercase tracking-wider text-primary ${stijl.klasse}`}
    >
      {stijl.label}
    </span>
  );
};

export const Onderhoudskalender = () => (
  <>
    <div className="text-center">
      <SectieKop center>
        <Accent tekst="De [[onderhoudskalender]]" />
      </SectieKop>
      <p className="vd-lead mx-auto mt-3 max-w-[680px]">
        Per installatie wat er moet gebeuren, hoe vaak, wie het doet en waarom. Sla over wat je niet
        hebt; de meeste woningen hebben er twee of drie van deze vijf.
      </p>
    </div>

    <div className="mt-7 flex flex-col gap-4 md:mt-10 md:gap-5">
      {KALENDER.map((installatie) => (
        <div key={installatie.id} className="hs-tegel hs-blauw-zacht p-2 md:p-3" data-veer>
          <div className="flex flex-col gap-0.5 px-3 pb-2 pt-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6 md:px-5 md:pt-4">
            <h3 className="hs-h3 m-0">{installatie.naam}</h3>
            <span className="vd-tekst text-[14px] sm:text-right">{installatie.herkenbaarAan}</span>
          </div>

          {/* Rijen in zebra in plaats van lijnen ertussen. */}
          <div className="vd-zebra grid gap-1">
            {installatie.beurten.map((beurt) => (
              <div
                key={beurt.wat}
                className="grid grid-cols-1 gap-2 bg-card/60 px-3 py-3.5 md:grid-cols-[1fr_210px_110px] md:items-baseline md:gap-8 md:px-5 md:py-4"
              >
                <div className="min-w-0">
                  <span className="block text-[16px] font-bold leading-[1.4] text-primary">{beurt.wat}</span>
                  <span className="vd-tekst mt-0.5 block text-[14.5px]">{beurt.waarom}</span>
                </div>
                {/* Op mobiel staan termijn en merkteken samen op één regel; op
                    groot scherm zijn het twee eigen kolommen. */}
                <div className="flex items-center justify-between gap-3 md:contents">
                  <span className="text-[15px] font-semibold text-foreground md:tabular-nums">
                    {beurt.wanneer}
                  </span>
                  <span className="shrink-0 md:justify-self-end">
                    <WieMerk wie={beurt.wie} />
                  </span>
                </div>
              </div>
            ))}
          </div>

          {installatie.voorbehoud && (
            <p className="vd-tekst m-0 px-3 pb-2 pt-3 text-[14px] md:px-5">{installatie.voorbehoud}</p>
          )}
        </div>
      ))}
    </div>

    <p className="vd-tekst mb-0 mt-5 text-[13.5px] md:mt-6">
      Termijnen van{" "}
      <a
        href={BRONNEN.balansventilatie.url}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2"
      >
        {BRONNEN.balansventilatie.naam}
      </a>{" "}
      (ventilatie en zonnepanelen) en{" "}
      <a
        href={BRONNEN.meterkast.url}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2"
      >
        {BRONNEN.meterkast.naam}
      </a>{" "}
      (de aardlekschakelaar). Gecontroleerd op {BRONNEN.balansventilatie.gecontroleerd}. Waar een
      bron geen termijn noemt, staat dat er zo bij.
    </p>
  </>
);
