import { BRONNEN, CV_KETEL_AANVOER, euro, SYSTEMEN } from "@/data/warmtepomp";
import { Accent, SectieKop } from "@/components/maatregel/primitieven";
import { KLEUR } from "@/components/maatregel/stijl";

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
      <p
        className="mt-4 mx-auto text-base leading-relaxed"
        style={{ color: KLEUR.navy, opacity: 0.75, maxWidth: 640 }}
      >
        Deze keuze hangt minder aan je budget dan aan je woning. Een hybride werkt vrijwel overal,
        volledig elektrisch vraagt een geïsoleerd huis.
      </p>
    </div>

    <div
      className="mt-10 rounded-2xl overflow-hidden"
      style={{ backgroundColor: KLEUR.wit, border: `1px solid ${KLEUR.rand}` }}
    >
      {/* Kop: de twee systemen met hun aanschafprijs */}
      <div className={`grid grid-cols-1 ${KOLOMMEN}`}>
        <div className="hidden md:block" style={{ backgroundColor: KLEUR.zand }} />
        {SYSTEMEN.map((s, i) => (
          <div
            key={s.id}
            // Op mobiel staan de twee koppen onder elkaar op dezelfde
            // achtergrond; zonder streepje lopen ze in elkaar over.
            // Kolom met het prijsvak onderaan: de ene omschrijving loopt over
            // twee regels en de andere niet, en dan staan de bedragen scheef.
            className={`p-6 md:p-7 flex flex-col ${i > 0 ? "border-t md:border-t-0" : ""}`}
            style={{ backgroundColor: KLEUR.zand, borderTopColor: KLEUR.rand }}
          >
            <h3
              className="text-[19px] font-semibold"
              style={{ color: KLEUR.navy, margin: 0, lineHeight: 1.3 }}
            >
              {s.naam}
            </h3>
            <p
              className="text-[15px] leading-relaxed"
              style={{ color: KLEUR.navy, opacity: 0.78, margin: "10px 0 0 0" }}
            >
              {s.kort}
            </p>
            <div
              className="mt-5 md:mt-auto rounded-xl px-4 py-3"
              style={{
                backgroundColor: "hsl(var(--accent) / 0.14)",
                border: "1px solid hsl(var(--accent) / 0.4)",
              }}
            >
              <span className="label-eyebrow">Aanschaf vóór subsidie</span>
              <div
                className="font-display mt-1 tabular-nums"
                style={{ color: KLEUR.navy, fontWeight: 700, fontSize: 28, lineHeight: 1.1 }}
              >
                {euro(s.aanschaf)}
              </div>
              <p
                className="text-[13px] leading-relaxed"
                style={{ color: KLEUR.navy, opacity: 0.7, margin: "8px 0 0 0" }}
              >
                {s.aanschafNoot}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* De vergelijking zelf */}
      {RIJEN.map((rij) => (
        <div key={rij.label} className={`grid grid-cols-1 ${KOLOMMEN}`}>
          <div
            className="px-6 pt-6 pb-2 md:py-6 md:px-7"
            style={{ borderTop: `1px solid ${KLEUR.rand}`, backgroundColor: KLEUR.zand }}
          >
            <span className="label-eyebrow">{rij.label}</span>
          </div>
          {SYSTEMEN.map((s) => (
            <div
              key={s.id}
              className="px-6 pb-5 md:py-5 md:px-7 md:border-t"
              style={{ borderTopColor: KLEUR.rand }}
            >
              {/* Op mobiel staan de twee waarden onder elkaar, dus dan is een
                  kort label nodig om ze uit elkaar te houden. Op desktop doet
                  de kolomkop dat werk al. */}
              <span
                className="md:hidden mb-1 block text-[11px] font-bold uppercase tracking-wider"
                style={{ color: KLEUR.navy, opacity: 0.45 }}
              >
                {s.id === "hybride" ? "Hybride" : "Volledig elektrisch"}
              </span>
              <span
                className="block text-[16px] font-semibold"
                style={{ color: KLEUR.navy, lineHeight: 1.4 }}
              >
                {s[rij.veld].kern}
              </span>
              {s[rij.veld].toelichting && (
                <span
                  className="mt-1 block text-[14px] leading-relaxed"
                  style={{ color: KLEUR.navy, opacity: 0.65 }}
                >
                  {s[rij.veld].toelichting}
                </span>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>

    <p className="mt-5 text-[13px] leading-relaxed" style={{ color: KLEUR.navy, opacity: 0.55 }}>
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
