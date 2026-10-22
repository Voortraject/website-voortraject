import { BRONNEN, euro, getal, EERST_DIT, KOELSYSTEMEN, REKENBASIS, VERHOUDING } from "@/data/airco";
import { Accent, SectieKop } from "@/components/maatregel/primitieven";

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
      <p className="vd-lead mx-auto mt-3 max-w-[660px]">
        Vier manieren om het koeler te krijgen, over {REKENBASIS.uren} uur gebruik. Het verschil is
        groter dan de meeste mensen denken.
      </p>
    </div>

    {/* Eén tegel, rijen als zachte zebra in plaats van lijnen ertussen. */}
    <div className="hs-tegel hs-blauw-zacht mt-7 p-3 md:mt-10 md:p-4" data-veer>
      <div className="flex flex-col gap-1 px-3 pb-3 pt-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6 md:px-5">
        <span className="vd-label">Stroomverbruik over {REKENBASIS.uren} uur</span>
        <span className="vd-tekst text-[14px]">Gerekend met {REKENBASIS.stroomprijs}</span>
      </div>

      <div className="vd-zebra flex flex-col gap-1">
        {KOELSYSTEMEN.map((systeem) => (
          <div
            key={systeem.naam}
            className="grid grid-cols-1 items-center gap-2.5 px-3 py-4 md:grid-cols-[190px_1fr_auto] md:gap-8 md:px-5"
          >
            <div>
              <span className="block text-[16px] font-bold text-primary">{systeem.naam}</span>
              <span className="vd-tekst mt-1 block text-[13.5px] leading-snug md:hidden lg:block">
                {systeem.toelichting}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="relative block h-5 flex-1">
                <span
                  className="absolute inset-x-0 inset-y-[5px] rounded-full bg-[hsl(var(--primary)/0.07)]"
                  aria-hidden="true"
                />
                <span
                  className="absolute inset-y-0 left-0 rounded-full bg-[linear-gradient(90deg,hsl(var(--rs-oker-licht)),hsl(var(--accent)))]"
                  style={{ width: `${(systeem.kwh / MAX) * 100}%` }}
                  aria-hidden="true"
                />
              </span>
              <span className="vd-tekst shrink-0 whitespace-nowrap text-[13.5px] tabular-nums">
                {getal(systeem.kwh)} kWh
              </span>
            </div>
            <div className="flex items-baseline gap-4 md:justify-end">
              <span className="vd-getal text-[24px]">{euro(systeem.euro)}</span>
              <span className="vd-tekst whitespace-nowrap text-[13.5px] tabular-nums">
                {getal(systeem.co2)} kg CO2
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="hs-tegel vd-oker mt-4 p-5 md:mt-6 md:p-8" data-veer>
      <p className="m-0 text-[15.5px] leading-relaxed text-foreground">
        <strong className="text-primary">{VERHOUDING}</strong> Hij mag er zeker staan, alleen levert dit rijtje meestal
        meer koelte op voordat je iets koopt:
      </p>
      <div className="mt-4 grid grid-cols-1 gap-x-8 gap-y-3.5 sm:grid-cols-2 md:mt-5 lg:grid-cols-4">
        {EERST_DIT.map((punt) => (
          <div key={punt.kop}>
            <span className="block text-[15px] font-bold leading-[1.4] text-primary">{punt.kop}</span>
            <span className="vd-tekst mt-1 block text-[14px]">{punt.tekst}</span>
          </div>
        ))}
      </div>
    </div>

    <p className="vd-tekst mt-5 text-[13.5px]">
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
