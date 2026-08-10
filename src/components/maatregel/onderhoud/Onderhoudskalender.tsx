import { BRONNEN, KALENDER, type Uitvoerder } from "@/data/onderhoud";
import { Accent, SectieKop } from "@/components/maatregel/primitieven";
import { KLEUR } from "@/components/maatregel/stijl";

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

const WIE: Record<Uitvoerder, { label: string; bg: string; fg: string; rand: string }> = {
  zelf: {
    label: "Zelf",
    bg: "hsl(var(--accent) / 0.18)",
    fg: KLEUR.navy,
    rand: "hsl(var(--accent) / 0.45)",
  },
  specialist: {
    label: "Specialist",
    bg: "hsl(var(--primary) / 0.07)",
    fg: KLEUR.navy,
    rand: "hsl(var(--primary) / 0.18)",
  },
};

const WieMerk = ({ wie }: { wie: Uitvoerder }) => {
  const stijl = WIE[wie];
  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-1 text-[12.5px] font-bold uppercase tracking-wider whitespace-nowrap"
      style={{ backgroundColor: stijl.bg, color: stijl.fg, border: `1px solid ${stijl.rand}` }}
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
      <p
        className="mt-4 mx-auto text-base leading-relaxed"
        style={{ color: KLEUR.navy, opacity: 0.75, maxWidth: 680 }}
      >
        Per installatie wat er moet gebeuren, hoe vaak, wie het doet en waarom. Sla over wat je niet
        hebt; de meeste woningen hebben er twee of drie van deze vijf.
      </p>
    </div>

    <div className="mt-10 flex flex-col gap-5">
      {KALENDER.map((installatie) => (
        <div
          key={installatie.id}
          className="rounded-2xl overflow-hidden"
          style={{ backgroundColor: KLEUR.wit, border: `1px solid ${KLEUR.rand}` }}
        >
          <div
            className="px-6 py-5 md:px-8 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
            style={{ backgroundColor: KLEUR.zand, borderBottom: `1px solid ${KLEUR.rand}` }}
          >
            <h3
              className="text-[18px] font-semibold"
              style={{ color: KLEUR.navy, margin: 0, lineHeight: 1.3 }}
            >
              {installatie.naam}
            </h3>
            <span
              className="text-[14px] sm:text-right"
              style={{ color: KLEUR.navy, opacity: 0.6 }}
            >
              {installatie.herkenbaarAan}
            </span>
          </div>

          {installatie.beurten.map((beurt, i) => (
            <div
              key={beurt.wat}
              className="px-6 py-5 md:px-8 grid grid-cols-1 md:grid-cols-[1fr_210px_110px] gap-2 md:gap-8 md:items-baseline"
              style={{ borderTop: i === 0 ? "none" : `1px solid ${KLEUR.rand}` }}
            >
              <div className="min-w-0">
                <span
                  className="block text-[16px] font-semibold"
                  style={{ color: KLEUR.navy, lineHeight: 1.4 }}
                >
                  {beurt.wat}
                </span>
                <span
                  className="mt-1 block text-[14.5px] leading-relaxed"
                  style={{ color: KLEUR.navy, opacity: 0.65 }}
                >
                  {beurt.waarom}
                </span>
              </div>
              <span
                className="text-[15px] font-medium md:tabular-nums"
                style={{ color: KLEUR.navy, opacity: 0.85 }}
              >
                {beurt.wanneer}
              </span>
              {/* Op mobiel onder elkaar; het merkteken staat dan links, waar het
                  oog na de termijn toch al is. */}
              <span className="md:justify-self-end">
                <WieMerk wie={beurt.wie} />
              </span>
            </div>
          ))}

          {installatie.voorbehoud && (
            <p
              className="px-6 py-4 md:px-8 text-[14px] leading-relaxed"
              style={{
                backgroundColor: KLEUR.zand,
                borderTop: `1px solid ${KLEUR.rand}`,
                color: KLEUR.navy,
                opacity: 0.7,
                margin: 0,
              }}
            >
              {installatie.voorbehoud}
            </p>
          )}
        </div>
      ))}
    </div>

    <p className="mt-6 text-[13px] leading-relaxed" style={{ color: KLEUR.navy, opacity: 0.55 }}>
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
