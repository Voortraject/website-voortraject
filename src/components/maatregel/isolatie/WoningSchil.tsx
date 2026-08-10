import { useMemo, useState } from "react";
import { Check } from "lucide-react";

import {
  BRON,
  euro,
  ISOLATIE_MAATREGELEN,
  SLUIT_UIT,
  WONINGTYPES,
  type MaatregelId,
  type Woningtype,
} from "@/data/isolatie";
import { Accent, SectieKop } from "@/components/maatregel/primitieven";
import { KLEUR } from "@/components/maatregel/stijl";
import { WoningTekening } from "./WoningTekening";

/**
 * De schil van de woning als configurator.
 *
 * Je begint met een woning zonder isolatie, waar de warmte zichtbaar uit
 * ontsnapt. Zet je een maatregel aan, dan krijgt dat bouwdeel een isolatielaag
 * en verdwijnen de warmtepijlen daar. Onderin loopt de besparing per jaar mee.
 *
 * Bewust geen subsidiebedragen: welke regeling voor jou geldt hangt van je
 * adres af (Nij Begun in Groningen en Noord-Drenthe, elders landelijk en
 * gemeentelijk). Alles is vóór subsidie gerekend en de vraag "wat krijg ik"
 * gaat naar de subsidiecheck.
 */
/**
 * De besparing van een maatregel. Alleen bij glas hangt die niet aan het
 * woningtype maar aan wat er nu in zit: van enkel glas naar isolerend glas
 * levert vier keer zoveel op als van gewoon dubbel glas.
 */
const besparingVan = (
  m: (typeof ISOLATIE_MAATREGELEN)[number],
  woningtype: Woningtype,
  glasStart: string,
) => {
  const basis = m.perType[woningtype];
  const start = m.keuzes?.startpunt.find((s) => s.id === glasStart);
  return start ? { ...basis, m3: start.m3, euro: start.euro } : basis;
};

export const WoningSchil = () => {
  const [woningtype, setWoningtype] = useState<Woningtype>("hoekwoning");
  const [gekozen, setGekozen] = useState<Set<MaatregelId>>(new Set());
  // Glas heeft twee keuzes binnen de maatregel: wat er nu in zit (bepaalt de
  // besparing) en waar je heen gaat (bepaalt de U-waarde en de kozijnvraag).
  const [glasStart, setGlasStart] = useState("dubbel");
  const [glasSoort, setGlasSoort] = useState("hrplus");

  const wissel = (id: MaatregelId) =>
    setGekozen((vorige) => {
      const volgende = new Set(vorige);
      if (volgende.has(id)) {
        volgende.delete(id);
      } else {
        volgende.add(id);
        // Spouw en gevel sluiten elkaar uit: je doet het één of het ander.
        const botst = SLUIT_UIT[id];
        if (botst) volgende.delete(botst);
      }
      return volgende;
    });

  const totaal = useMemo(() => {
    let euroPerJaar = 0;
    let m3PerJaar = 0;
    let kosten = 0;
    for (const m of ISOLATIE_MAATREGELEN) {
      if (!gekozen.has(m.id)) continue;
      const t = besparingVan(m, woningtype, glasStart);
      euroPerJaar += t.euro;
      m3PerJaar += t.m3;
      kosten += t.kosten;
    }
    return { euroPerJaar, m3PerJaar, kosten };
  }, [gekozen, woningtype, glasStart]);

  // Alles aanzetten slaat de tweede helft van een uitsluitend paar over, anders
  // zou de teller een besparing optellen die je in werkelijkheid niet krijgt.
  const alleMogelijk = ISOLATIE_MAATREGELEN.reduce<MaatregelId[]>((lijst, m) => {
    const botst = SLUIT_UIT[m.id];
    if (botst && lijst.includes(botst)) return lijst;
    return [...lijst, m.id];
  }, []);
  const allesAan = alleMogelijk.every((id) => gekozen.has(id));
  const alles = () => setGekozen(allesAan ? new Set() : new Set(alleMogelijk));

  return (
    <>
      <div className="text-center">
        <SectieKop center>
          <Accent tekst="Maak de schil van je woning [[dicht]]" />
        </SectieKop>
        <p
          className="mt-4 mx-auto text-base leading-relaxed"
          style={{ color: KLEUR.navy, opacity: 0.75, maxWidth: 700 }}
        >
          Isoleren gaat over de schil: alles wat je verwarmde ruimte scheidt van de kou. Kies
          hieronder je woningtype en zet maatregelen aan om te zien wat er met de warmte, en
          met je energierekening, gebeurt.
        </p>
      </div>

      {/* Woningtype */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
        <span
          className="mr-1 text-[13px] font-semibold"
          style={{ color: KLEUR.navy, opacity: 0.6 }}
        >
          Mijn woning is een
        </span>
        {WONINGTYPES.map((t) => {
          const aan = t.id === woningtype;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setWoningtype(t.id)}
              aria-pressed={aan}
              className="rounded-full px-4 py-2 text-[14px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              style={{
                backgroundColor: aan ? KLEUR.navy : KLEUR.wit,
                color: aan ? KLEUR.wit : KLEUR.navy,
                border: `1px solid ${aan ? KLEUR.navy : KLEUR.rand}`,
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
        {/* Tekening plus teller */}
        <div
          className="rounded-2xl p-5 md:p-6 lg:sticky lg:top-24"
          style={{ backgroundColor: KLEUR.wit, border: `1px solid ${KLEUR.rand}` }}
        >
          <WoningTekening gekozen={gekozen} />

          <div
            className="mt-5 rounded-xl p-5 text-center"
            style={{
              backgroundColor: gekozen.size > 0 ? "hsl(var(--accent) / 0.14)" : KLEUR.zand,
              border: `1px solid ${gekozen.size > 0 ? "hsl(var(--accent) / 0.45)" : KLEUR.rand}`,
              transition: "background-color 250ms ease, border-color 250ms ease",
            }}
          >
            <span
              className="text-[12px] font-bold uppercase tracking-wider"
              style={{ color: KLEUR.navy, opacity: 0.6 }}
            >
              Besparing per jaar
            </span>
            <div
              className="font-display mt-1 tabular-nums"
              style={{ color: KLEUR.navy, fontWeight: 700, fontSize: 40, lineHeight: 1.1 }}
            >
              {euro(totaal.euroPerJaar)}
            </div>
            <p className="mt-1 text-[14px]" style={{ color: KLEUR.navy, opacity: 0.7 }}>
              {gekozen.size === 0
                ? "Zet hiernaast een maatregel aan"
                : `${totaal.m3PerJaar.toLocaleString("nl-NL")} m³ gas minder, investering ${euro(totaal.kosten)} vóór subsidie`}
            </p>
          </div>
        </div>

        {/* Maatregelen */}
        <div className="flex flex-col gap-3">
          {ISOLATIE_MAATREGELEN.map((m) => {
            const aan = gekozen.has(m.id);
            const t = besparingVan(m, woningtype, glasStart);
            const soort = m.keuzes?.soort.find((k) => k.id === glasSoort);
            return (
              // Geen <button> om de hele kaart: de glaskaart heeft eigen knoppen
              // en een knop in een knop is ongeldige HTML.
              <div
                key={m.id}
                className="rounded-2xl transition-colors"
                style={{
                  backgroundColor: aan ? "hsl(var(--accent) / 0.12)" : KLEUR.wit,
                  border: `1px solid ${aan ? "hsl(var(--accent) / 0.5)" : KLEUR.rand}`,
                }}
              >
                <button
                  type="button"
                  onClick={() => wissel(m.id)}
                  aria-pressed={aan}
                  className="w-full rounded-2xl p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <span className="flex items-start gap-4">
                    <span
                      className="mt-0.5 flex items-center justify-center rounded-full shrink-0 transition-colors"
                      style={{
                        width: 26,
                        height: 26,
                        backgroundColor: aan ? KLEUR.goud : "transparent",
                        border: `2px solid ${aan ? KLEUR.goud : "hsl(var(--primary) / 0.25)"}`,
                      }}
                    >
                      {aan && <Check size={15} color={KLEUR.navy} strokeWidth={3} aria-hidden="true" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <span className="text-[17px] font-semibold" style={{ color: KLEUR.navy }}>
                          {m.naam}
                        </span>
                        <span
                          className="text-[15px] font-bold tabular-nums whitespace-nowrap"
                          style={{ color: aan ? KLEUR.navy : "hsl(var(--primary) / 0.6)" }}
                        >
                          {euro(t.euro)} per jaar
                        </span>
                      </span>
                      <span
                        className="mt-1.5 block text-[14px] leading-relaxed"
                        style={{ color: KLEUR.navy, opacity: 0.75 }}
                      >
                        {m.kort}
                      </span>
                      {aan && (
                        <span className="mt-3 block">
                          <span
                            className="block text-[14px] leading-relaxed"
                            style={{ color: KLEUR.navy, opacity: 0.85 }}
                          >
                            <strong>Wat je merkt:</strong> {m.merkbaar}
                          </span>
                          <span
                            className="mt-2 block text-[13px] leading-relaxed"
                            style={{ color: KLEUR.navy, opacity: 0.6 }}
                          >
                            {t.m3} m³ gas per jaar. Investering {euro(t.kosten)} vóór subsidie.{" "}
                            {m.uitgangspunt}
                            {m.noot ? ` ${m.noot}` : ""}
                          </span>
                        </span>
                      )}
                    </span>
                  </span>
                </button>

                {aan && m.keuzes && (
                  <div className="px-5 pb-5 pl-[60px]">
                    <Keuzerij
                      label="Wat zit er nu in?"
                      opties={m.keuzes.startpunt}
                      actief={glasStart}
                      kies={setGlasStart}
                    />
                    <div className="mt-3">
                      <Keuzerij
                        label="Waar ga je heen?"
                        opties={m.keuzes.soort}
                        actief={glasSoort}
                        kies={setGlasSoort}
                      />
                    </div>
                    {soort && (
                      <p
                        className="mt-3 text-[13px] leading-relaxed"
                        style={{ color: KLEUR.navy, opacity: 0.7, margin: "12px 0 0 0" }}
                      >
                        <strong>{soort.label}</strong> heeft een U-waarde van {soort.uWaarde}, tegen
                        5,8 voor enkel glas: hoe lager, hoe beter het isoleert. {soort.toelichting}
                      </p>
                    )}
                    {soort?.zelfdeBesparing && (
                      // Milieu Centraal komt voor triple op exact dezelfde
                      // besparing uit als voor HR++. Dat lijkt op een fout in de
                      // teller, dus zeggen we het er hardop bij.
                      <p
                        className="mt-2 text-[13px] leading-relaxed"
                        style={{ color: KLEUR.navy, opacity: 0.7, margin: "8px 0 0 0" }}
                      >
                        <strong>Op de gasrekening scheelt het niets.</strong> Milieu Centraal komt
                        voor triple op dezelfde besparing uit als voor HR++: het glas is bij allebei
                        zoveel beter dan wat er zat, dat de rest verwaarloosbaar is. Het verschil zit
                        in comfort bij het raam en in de prijs, niet in je rekening.
                      </p>
                    )}
                    <p
                      className="mt-2 text-[13px] leading-relaxed"
                      style={{ color: KLEUR.navy, opacity: 0.55, margin: "8px 0 0 0" }}
                    >
                      De investering hierboven geldt voor isolerend glas in je bestaande kozijnen.
                      Moeten de kozijnen mee, dan valt hij hoger uit; dat hangt zo sterk af van je
                      woning dat we het per situatie doorrekenen.
                    </p>
                  </div>
                )}
              </div>
            );
          })}

          <button
            type="button"
            onClick={alles}
            className="self-start text-[14px] font-semibold underline underline-offset-4 transition-colors"
            style={{ color: KLEUR.navy, opacity: 0.7 }}
          >
            {allesAan ? "Alles uitzetten" : "Alles aanzetten"}
          </button>
        </div>
      </div>

      <div
        className="mt-8 rounded-2xl p-5 md:p-6"
        style={{
          backgroundColor: "hsl(var(--accent) / 0.12)",
          border: `1px solid hsl(var(--accent) / 0.4)`,
        }}
      >
        <p className="text-[15px] leading-relaxed" style={{ color: KLEUR.navy, margin: 0 }}>
          <strong>Hier staat nog geen subsidie in.</strong> Welke regeling voor jou geldt hangt
          af van je adres: in Groningen en Noord-Drenthe loopt dat anders dan in de rest van
          het land, en gemeenten hebben er vaak nog een eigen regeling naast. Dat zoeken wij
          voor je uit, en de subsidiecheck hieronder geeft je alvast een beeld.
        </p>
      </div>

      <p className="mt-4 text-[13px]" style={{ color: KLEUR.navy, opacity: 0.55 }}>
        Besparingen en kosten zijn gemiddelden van{" "}
        <a
          href={BRON.url}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2"
        >
          {BRON.naam}
        </a>
        , gecontroleerd op {BRON.gecontroleerd}, bij een gasprijs van € 1,37 per m³ (het
        gemiddelde dat Milieu Centraal voor 2026 tot 2040 aanhoudt). Wat jouw woning oplevert
        hangt af van bouwjaar, huidige isolatie en stookgedrag.
      </p>
    </>
  );
};

/** Rij met keuzeknoppen binnen een maatregel. */
const Keuzerij = ({
  label,
  opties,
  actief,
  kies,
}: {
  label: string;
  opties: { id: string; label: string }[];
  actief: string;
  kies: (id: string) => void;
}) => (
  <div className="flex flex-wrap items-center gap-2">
    <span
      className="mr-1 text-[13px] font-semibold"
      style={{ color: KLEUR.navy, opacity: 0.65 }}
    >
      {label}
    </span>
    {opties.map((o) => {
      const aan = o.id === actief;
      return (
        <button
          key={o.id}
          type="button"
          onClick={() => kies(o.id)}
          aria-pressed={aan}
          className="rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          style={{
            backgroundColor: aan ? KLEUR.navy : KLEUR.wit,
            color: aan ? KLEUR.wit : KLEUR.navy,
            border: `1px solid ${aan ? KLEUR.navy : KLEUR.rand}`,
          }}
        >
          {o.label}
        </button>
      );
    })}
  </div>
);
