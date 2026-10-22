import { BRONNEN, CV_KETEL_AANVOER, euro, SYSTEMEN } from "@/data/warmtepomp";
import { Accent, SectieKop } from "@/components/maatregel/primitieven";

/**
 * De vraag waarmee bezoekers binnenkomen: hybride of volledig elektrisch.
 *
 * Stond nergens op de pagina. Wat er stond waren twee kaartjes met de pillen
 * Laag, Gemiddeld en Hoog, en daar kun je geen keuze op baseren. Hier staan de
 * assen die er werkelijk toe doen naast elkaar, met de eisen die je woning
 * stelt erbij.
 *
 * Alle bedragen zijn vóór subsidie. Welke regeling voor deze bezoeker geldt
 * hangt van het adres af, dus die vraag gaat naar de subsidiecheck.
 */

/** Alleen de velden die als vak in de vergelijking staan. */
type CelVeld = "hoe" | "gas" | "isolatie" | "aanvoer" | "afgifte" | "buitenunit";

/**
 * "Past als" stond hier ook, maar dat is precies waar de sectie "Past dit bij
 * jouw woning" over gaat. Hetzelfde antwoord twee keer geven maakt de tabel
 * alleen langer.
 */
const RIJEN: { label: string; veld: CelVeld }[] = [
  { label: "Hoe het werkt", veld: "hoe" },
  { label: "Je gasverbruik", veld: "gas" },
  { label: "Wat je woning nodig heeft", veld: "isolatie" },
  { label: "Watertemperatuur", veld: "aanvoer" },
  { label: "Afgifte in huis", veld: "afgifte" },
  { label: "Buitenunit", veld: "buitenunit" },
];

/** Eén raster voor kop en rijen, zodat de kolommen echt onder elkaar staan. */
const KOLOMMEN = "md:grid-cols-[210px_1fr_1fr]";

export const HybrideOfElektrisch = () => (
  <>
    <div className="text-center">
      <SectieKop center>
        <Accent tekst="Hybride of volledig [[elektrisch]]?" />
      </SectieKop>
      <p className="vd-lead mx-auto mt-3 max-w-[640px]">
        Deze keuze hangt minder aan je budget dan aan je woning. Een hybride werkt vrijwel overal,
        volledig elektrisch vraagt een geïsoleerd huis.
      </p>
    </div>

    {/* Eén tegel zonder lijnen: de koppen als getinte vakken, de rijen als
        zebra. */}
    <div className="hs-tegel mt-7 p-2 md:mt-10 md:p-4" data-veer>
      {/* Kop: de twee systemen met hun aanschafprijs */}
      <div className={`grid grid-cols-1 gap-2 md:gap-4 ${KOLOMMEN}`}>
        <div className="hidden md:block" />
        {SYSTEMEN.map((s) => (
          <div
            key={s.id}
            // Kolom met het prijsvak onderaan: de ene omschrijving loopt over
            // twee regels en de andere niet, en dan staan de bedragen scheef.
            className="hs-blauw-zacht flex flex-col rounded-[18px] p-5 md:rounded-[22px] md:p-6"
          >
            <h3 className="hs-h3 m-0">{s.naam}</h3>
            {/* De ondermarge zit op de tekst, niet op het prijsvak: dat heeft
                mt-auto, en dan zou de langste omschrijving er direct tegenaan
                staan. */}
            <p className="vd-tekst mb-4 mt-2 md:mb-5">{s.kort}</p>
            <div className="vd-wit vd-oker mt-auto px-4 py-3 md:px-5 md:py-4">
              <span className="vd-label text-[12px]">Aanschaf vóór subsidie</span>
              <div className="vd-getal mt-1 text-[28px] text-primary">{euro(s.aanschaf)}</div>
              <p className="mb-0 mt-2 text-[13.5px] leading-relaxed text-[hsl(var(--rs-tekst-zacht))]">
                {s.aanschafNoot}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* De vergelijking zelf */}
      <div className="vd-zebra mt-2 md:mt-4">
        {RIJEN.map((rij) => (
          <div key={rij.label} className={`grid grid-cols-1 ${KOLOMMEN}`}>
            <div className="px-4 pb-1 pt-4 md:px-6 md:py-5">
              <span className="vd-label text-[12.5px]">{rij.label}</span>
            </div>
            {SYSTEMEN.map((s) => (
              <div key={s.id} className="px-4 pb-4 md:px-6 md:py-5">
                {/* Op mobiel staan de twee waarden onder elkaar, dus dan is een
                    kort label nodig om ze uit elkaar te houden. Op desktop doet
                    de kolomkop dat werk al. */}
                <span className="mb-0.5 block text-[12px] font-bold text-[hsl(var(--rs-getal))] md:hidden">
                  {s.id === "hybride" ? "Hybride" : "Volledig elektrisch"}
                </span>
                <span className="block text-[16px] font-bold leading-[1.4] text-primary">
                  {s[rij.veld].kern}
                </span>
                {s[rij.veld].toelichting && (
                  <span className="vd-tekst mt-1 block text-[14px]">{s[rij.veld].toelichting}</span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>

    <p className="mb-0 mt-5 text-[13.5px] leading-relaxed text-[hsl(var(--rs-tekst-zacht))]">
      Een cv-ketel staat ter vergelijking meestal op {CV_KETEL_AANVOER}. Bedragen en eisen van{" "}
      <a
        href={BRONNEN.elektrisch.url}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2"
      >
        {BRONNEN.elektrisch.naam}
      </a>
      , gecontroleerd op {BRONNEN.elektrisch.gecontroleerd}, inclusief btw en plaatsing en vóór
      subsidie.
    </p>
  </>
);
