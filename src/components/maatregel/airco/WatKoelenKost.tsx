import { BRONNEN, euro, getal, EERST_DIT, KOELSYSTEMEN, REKENBASIS, VERHOUDING } from "@/data/airco";
import { Accent, SectieKop } from "@/components/maatregel/primitieven";
import { KLEUR } from "@/components/maatregel/stijl";

/**
 * Wat koelen kost, met de ventilator er bewust bij.
 *
 * De mobiele airco is het apparaat dat mensen op de eerste warme dag kopen en
 * dat in gebruik het duurste is. Naast elkaar in één tabel zie je dat meteen,
 * en zie je ook dat een vaste split zuiniger is dan het losse apparaat waar
 * niemand een installateur voor hoeft te bellen.
 */

/** Langste balk in de tabel bepaalt de schaal. */
const MAX = Math.max(...KOELSYSTEMEN.map((s) => s.kwh));

export const WatKoelenKost = () => (
  <>
    <div className="text-center">
      <SectieKop center>
        <Accent tekst="Wat koelen echt [[kost]]" />
      </SectieKop>
      <p
        className="mt-4 mx-auto text-base leading-relaxed"
        style={{ color: KLEUR.navy, opacity: 0.75, maxWidth: 660 }}
      >
        Vier manieren om het koeler te krijgen, over {REKENBASIS.uren} uur gebruik. Het verschil is
        groter dan de meeste mensen denken.
      </p>
    </div>

    <div
      className="mt-10 rounded-2xl overflow-hidden"
      style={{ backgroundColor: KLEUR.wit, border: `1px solid ${KLEUR.rand}` }}
    >
      <div
        className="px-6 py-4 md:px-8 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
        style={{ backgroundColor: KLEUR.zand, borderBottom: `1px solid ${KLEUR.rand}` }}
      >
        <span className="label-eyebrow">Stroomverbruik over {REKENBASIS.uren} uur</span>
        <span className="text-[14px]" style={{ color: KLEUR.navy, opacity: 0.6 }}>
          Gerekend met {REKENBASIS.stroomprijs}
        </span>
      </div>

      {KOELSYSTEMEN.map((systeem, i) => (
        <div
          key={systeem.naam}
          className="px-6 py-5 md:px-8 grid grid-cols-1 md:grid-cols-[190px_1fr_auto] gap-3 md:gap-8 items-center"
          style={{ borderTop: i === 0 ? "none" : `1px solid ${KLEUR.rand}` }}
        >
          <div>
            <span className="block text-[16px] font-semibold" style={{ color: KLEUR.navy }}>
              {systeem.naam}
            </span>
            <span
              className="mt-1 block text-[13.5px] leading-snug md:hidden lg:block"
              style={{ color: KLEUR.navy, opacity: 0.6 }}
            >
              {systeem.toelichting}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="relative block flex-1" style={{ height: 20 }}>
              <span
                className="absolute rounded-full"
                style={{ inset: "5px 0", backgroundColor: "hsl(var(--primary) / 0.07)" }}
                aria-hidden="true"
              />
              <span
                className="absolute rounded-full"
                style={{
                  left: 0,
                  width: `${(systeem.kwh / MAX) * 100}%`,
                  top: 0,
                  bottom: 0,
                  backgroundColor: KLEUR.goud,
                }}
                aria-hidden="true"
              />
            </span>
            <span
              className="shrink-0 text-[13.5px] tabular-nums whitespace-nowrap"
              style={{ color: KLEUR.navy, opacity: 0.7 }}
            >
              {getal(systeem.kwh)} kWh
            </span>
          </div>
          <div className="flex items-baseline gap-4 md:justify-end">
            <span
              className="font-display tabular-nums"
              style={{ color: KLEUR.navy, fontWeight: 700, fontSize: 22, lineHeight: 1.1 }}
            >
              {euro(systeem.euro)}
            </span>
            <span
              className="text-[13px] tabular-nums whitespace-nowrap"
              style={{ color: KLEUR.navy, opacity: 0.55 }}
            >
              {getal(systeem.co2)} kg CO2
            </span>
          </div>
        </div>
      ))}
    </div>

    <div
      className="mt-6 rounded-2xl p-6 md:p-8"
      style={{
        backgroundColor: "hsl(var(--accent) / 0.12)",
        border: "1px solid hsl(var(--accent) / 0.4)",
      }}
    >
      <p className="text-[15.5px] leading-relaxed" style={{ color: KLEUR.navy, margin: 0 }}>
        <strong>{VERHOUDING}</strong> Hij mag er zeker staan, alleen levert dit rijtje meestal
        meer koelte op voordat je iets koopt:
      </p>
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4">
        {EERST_DIT.map((punt) => (
          <div key={punt.kop}>
            <span
              className="block text-[15px] font-semibold"
              style={{ color: KLEUR.navy, lineHeight: 1.4 }}
            >
              {punt.kop}
            </span>
            <span
              className="mt-1 block text-[14px] leading-relaxed"
              style={{ color: KLEUR.navy, opacity: 0.7 }}
            >
              {punt.tekst}
            </span>
          </div>
        ))}
      </div>
    </div>

    <p className="mt-5 text-[13px] leading-relaxed" style={{ color: KLEUR.navy, opacity: 0.55 }}>
      Verbruik, kosten en CO2 van{" "}
      <a
        href={BRONNEN.koelen.url}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2"
      >
        {BRONNEN.koelen.naam}
      </a>
      , gecontroleerd op {BRONNEN.koelen.gecontroleerd}. Hoeveel jij verbruikt hangt af van hoe vaak
      je koelt: een mobiele airco die 300 uur per jaar draait komt uit op ongeveer 300 kWh, zo'n
      € 60.
    </p>
  </>
);
