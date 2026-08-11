import { useMemo, useState } from "react";
import { ArrowRight, Check } from "lucide-react";

import {
  BOUWDEEL,
  BRON,
  bouwdeelVan,
  euro,
  ISOLATIE_MAATREGELEN,
  jaren,
  SCHIL_DELEN,
  terugverdientijd,
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
/**
 * De routes die voor isolatie kunnen gelden. Bewust zonder bedragen: welke van
 * de drie voor deze bezoeker opgaat, hangt van het adres af.
 */
const REGELINGEN = [
  "Nij Begun, tot 100 procent vergoed voor eigenaar-bewoners in Groningen en Noord-Drenthe",
  "De landelijke isolatiesubsidie, die verdubbelt bij twee of meer maatregelen",
  "Gemeentelijke regelingen, stapelbaar bovenop bovenstaande",
];

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
  // De enige keuze binnen een maatregel: wat er nu in de kozijnen zit. Dat
  // bepaalt de besparing, en van enkel glas af levert een veelvoud op van de
  // stap vanaf gewoon dubbel glas.
  const [glasStart, setGlasStart] = useState("dubbel");

  const wissel = (id: MaatregelId) =>
    setGekozen((vorige) => {
      const volgende = new Set(vorige);
      if (volgende.has(id)) volgende.delete(id);
      else volgende.add(id);
      return volgende;
    });

  const totaal = useMemo(() => {
    // Maatregelen op hetzelfde bouwdeel tellen niet op. Spouw en gevel gaan
    // over dezelfde muur: doe je ze allebei, dan is de eindsituatie dezelfde
    // geïsoleerde gevel, dus de grootste van de twee telt en de andere
    // verdwijnt daarin. Kosten tellen wél gewoon op, want je betaalt beide.
    const perBouwdeel = new Map<string, { m3: number; euro: number }>();
    let kosten = 0;
    for (const m of ISOLATIE_MAATREGELEN) {
      if (!gekozen.has(m.id)) continue;
      const t = besparingVan(m, woningtype, glasStart);
      kosten += t.kosten;
      const deel = BOUWDEEL[m.id] ?? m.id;
      const staand = perBouwdeel.get(deel);
      if (!staand || t.m3 > staand.m3) perBouwdeel.set(deel, { m3: t.m3, euro: t.euro });
    }
    let euroPerJaar = 0;
    let m3PerJaar = 0;
    for (const deel of perBouwdeel.values()) {
      euroPerJaar += deel.euro;
      m3PerJaar += deel.m3;
    }
    return { euroPerJaar, m3PerJaar, kosten };
  }, [gekozen, woningtype, glasStart]);

  // Staan spouw en gevel allebei aan, dan blijft de teller staan als je de
  // tweede aanzet. Dat ziet eruit als een fout, dus leggen we het uit.
  const gevelDubbel = gekozen.has("spouw") && gekozen.has("gevel");

  /**
   * De schil in vier delen, elk zo breed als zijn aandeel in wat er voor deze
   * woning te besparen valt. De balk laat daarmee twee dingen tegelijk zien:
   * hoever je bent, en waar de warmte eigenlijk weggaat. Bij de gevel telt de
   * hoogste van spouw en gevel, want dat is wat het bouwdeel maximaal opbrengt.
   */
  const schil = useMemo(() => {
    const delen = SCHIL_DELEN.map((deel) => {
      const maatregelen = ISOLATIE_MAATREGELEN.filter((m) => bouwdeelVan(m.id) === deel.id);
      const euroMax = Math.max(
        ...maatregelen.map((m) => besparingVan(m, woningtype, glasStart).euro),
      );
      return { ...deel, euroMax, dicht: maatregelen.some((m) => gekozen.has(m.id)) };
    });
    const haalbaar = delen.reduce((som, d) => som + d.euroMax, 0);
    const dicht = delen.reduce((som, d) => som + (d.dicht ? d.euroMax : 0), 0);
    return { delen, haalbaar, aandeelDicht: dicht / haalbaar };
  }, [gekozen, woningtype, glasStart]);

  /**
   * De maatregel die zichzelf het snelst terugverdient. De pagina zegt verderop
   * "begin bij de maatregel met de kortste terugverdientijd", dus dan hoort de
   * tool die ook aan te wijzen in plaats van het aan de bezoeker te laten.
   */
  const snelste = useMemo(() => {
    const opTijd = ISOLATIE_MAATREGELEN.map((m) => {
      const t = besparingVan(m, woningtype, glasStart);
      return { id: m.id, tijd: terugverdientijd(t.kosten, t.euro) };
    }).sort((a, b) => a.tijd - b.tijd);
    return opTijd[0].id;
  }, [woningtype, glasStart]);

  // Alles aanzetten kiest één route per bouwdeel: voor verreweg de meeste
  // woningen is dat de spouw, en de bron rekent zijn voorbeeldwoning ook zo door.
  const alleMogelijk = ISOLATIE_MAATREGELEN.reduce<MaatregelId[]>((lijst, m) => {
    const deel = BOUWDEEL[m.id];
    if (deel && lijst.some((id) => BOUWDEEL[id] === deel)) return lijst;
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
          className="rounded-2xl p-5 md:p-6 lg:sticky lg:top-20"
          style={{ backgroundColor: KLEUR.wit, border: `1px solid ${KLEUR.rand}` }}
        >
          {/* De tekening krijgt een maximum: met de voortgangsbalk en de drie
              cijfers erbij werd het kaartje anders hoger dan het scherm, en dan
              schuift juist de teller onder de vouw terwijl je de lijst langs
              scrollt. */}
          <div className="mx-auto" style={{ maxWidth: 420 }}>
            <WoningTekening gekozen={gekozen} />
          </div>

          <SchilBalk delen={schil.delen} haalbaar={schil.haalbaar} aandeel={schil.aandeelDicht} />

          <div
            className="mt-4 rounded-xl px-5 pt-5 pb-4 text-center"
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
              style={{ color: KLEUR.navy, fontWeight: 700, fontSize: 44, lineHeight: 1.05 }}
            >
              {euro(totaal.euroPerJaar)}
            </div>

            {gekozen.size === 0 ? (
              <p className="mt-1 text-[14px]" style={{ color: KLEUR.navy, opacity: 0.7 }}>
                Zet hiernaast een maatregel aan
              </p>
            ) : (
              <>
                <div
                  className="mt-4 grid grid-cols-3 gap-2 pt-4"
                  style={{ borderTop: "1px solid hsl(var(--primary) / 0.12)" }}
                >
                  <Cijfer
                    waarde={`${totaal.m3PerJaar.toLocaleString("nl-NL")} m³`}
                    label="gas minder"
                  />
                  <Cijfer waarde={euro(totaal.kosten)} label="investering" />
                  <Cijfer
                    waarde={jaren(terugverdientijd(totaal.kosten, totaal.euroPerJaar))}
                    label="terugverdiend"
                  />
                </div>
                <p className="mt-3 text-[12px]" style={{ color: KLEUR.navy, opacity: 0.6 }}>
                  Investering en terugverdientijd zijn vóór subsidie.
                </p>
              </>
            )}
          </div>

          {gevelDubbel && (
            <p
              className="mt-3 text-[13px] leading-relaxed"
              style={{ color: KLEUR.navy, opacity: 0.7 }}
            >
              <strong>De gevel telt één keer mee.</strong> Spouwmuurisolatie en
              gevelisolatie gaan over dezelfde muur. Je kunt ze prima combineren, maar je
              komt dan op dezelfde geïsoleerde gevel uit, dus de besparing verdubbelt niet:
              de teller rekent met het hoogste van de twee. Wat de spouw vullen wél doet, is
              de laag aan de buitenkant dunner maken, 12 in plaats van 17 centimeter. De
              investering hierboven is de som van beide en valt in de praktijk daardoor
              lager uit.
            </p>
          )}
        </div>

        {/* Maatregelen */}
        <div className="flex flex-col gap-3">
          {ISOLATIE_MAATREGELEN.map((m) => {
            const aan = gekozen.has(m.id);
            const t = besparingVan(m, woningtype, glasStart);
            return (
              // Geen <button> om de hele kaart: de glaskaart heeft eigen knoppen
              // en een knop in een knop is ongeldige HTML.
              <div
                key={m.id}
                className="maatregel-kaart rounded-2xl"
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
                        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="text-[17px] font-semibold" style={{ color: KLEUR.navy }}>
                            {m.naam}
                          </span>
                          {m.id === snelste && (
                            <span
                              className="rounded-full px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide whitespace-nowrap"
                              style={{
                                backgroundColor: "hsl(var(--accent) / 0.3)",
                                color: KLEUR.navy,
                              }}
                            >
                              Snelst terugverdiend
                            </span>
                          )}
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
                          {/* De drie cijfers stonden als doorlopende zin in de
                              grijze regel eronder. Als strook zijn ze te
                              vergelijken tussen maatregelen zonder te lezen. */}
                          <span
                            className="mt-3 grid grid-cols-3 gap-2 rounded-lg px-3 py-2.5"
                            style={{ backgroundColor: "hsl(var(--primary) / 0.05)" }}
                          >
                            <Cijfer waarde={`${t.m3} m³`} label="gas per jaar" klein />
                            <Cijfer waarde={euro(t.kosten)} label="investering" klein />
                            <Cijfer
                              waarde={jaren(terugverdientijd(t.kosten, t.euro))}
                              label="terugverdiend"
                              klein
                            />
                          </span>
                          <span
                            className="mt-2 block text-[13px] leading-relaxed"
                            style={{ color: KLEUR.navy, opacity: 0.6 }}
                          >
                            {m.uitgangspunt}
                            {m.noot ? ` ${m.noot}` : ""}
                          </span>
                        </span>
                      )}
                    </span>
                  </span>
                </button>

                {aan && m.keuzes && (
                  // Alleen de keuze die de teller beweegt. De vraag hr++ of
                  // triple staat in de FAQ verderop: Milieu Centraal komt voor
                  // allebei op dezelfde besparing uit, dus als knop hier vroeg
                  // hij vooral om uitleg waarom er niets gebeurt.
                  <div className="px-5 pb-5 pl-[60px]">
                    <Keuzerij
                      label="Wat zit er nu in?"
                      opties={m.keuzes.startpunt}
                      actief={glasStart}
                      kies={setGlasStart}
                    />
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

      {/* De regelingen horen hier, bij de bedragen waar ze nog niet in zitten.
          Ze stonden ook als losse sectie een paar schermen verderop, en dat was
          hetzelfde verhaal een tweede keer. */}
      <div
        className="mt-8 rounded-2xl p-5 md:p-6"
        style={{
          backgroundColor: "hsl(var(--accent) / 0.12)",
          border: `1px solid hsl(var(--accent) / 0.4)`,
        }}
      >
        <p className="text-[15px] leading-relaxed" style={{ color: KLEUR.navy, margin: 0 }}>
          <strong>Hier staat nog geen subsidie in.</strong> Isolatie is wel een van de best
          gesubsidieerde maatregelen die er zijn. Welke regeling voor jou geldt hangt af van je
          adres: in Groningen en Noord-Drenthe loopt dat anders dan in de rest van het land, en
          gemeenten hebben er vaak nog een eigen regeling naast.
        </p>
        <ul
          className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-2.5"
          style={{ listStyle: "none", padding: 0, margin: "16px 0 0 0" }}
        >
          {REGELINGEN.map((regeling) => (
            <li key={regeling} className="flex items-start gap-2.5">
              <Check
                size={16}
                className="mt-[3px] shrink-0"
                style={{ color: KLEUR.navy }}
                strokeWidth={2.5}
                aria-hidden="true"
              />
              <span style={{ fontSize: 14.5, lineHeight: 1.5, color: KLEUR.navy, opacity: 0.85 }}>
                {regeling}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2">
          <a
            href="/subsidies/stapelen"
            className="inline-flex items-center gap-2 text-[15px] font-semibold underline-offset-4 transition-colors hover:underline"
            style={{ color: KLEUR.navy }}
          >
            Bekijk hoe je subsidies stapelt
            <ArrowRight size={16} aria-hidden="true" />
          </a>
          <span className="text-[14px]" style={{ color: KLEUR.navy, opacity: 0.7 }}>
            Of doe de subsidiecheck hieronder, dan zie je wat er voor jouw adres is.
          </span>
        </div>
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

/** Eén getal met zijn label eronder: in de teller en op de maatregelkaarten. */
const Cijfer = ({
  waarde,
  label,
  klein = false,
}: {
  waarde: string;
  label: string;
  klein?: boolean;
}) => (
  <span className="block text-center">
    <span
      className="block font-semibold tabular-nums leading-tight"
      style={{ color: KLEUR.navy, fontSize: klein ? 14 : 16 }}
    >
      {waarde}
    </span>
    <span
      className="mt-0.5 block leading-tight"
      style={{ color: KLEUR.navy, opacity: 0.6, fontSize: klein ? 11 : 12 }}
    >
      {label}
    </span>
  </span>
);

/**
 * De schil als één balk van vier delen. Elk deel is zo breed als zijn aandeel
 * in wat er voor deze woning te besparen valt, dus de balk laat twee dingen
 * tegelijk zien: hoever je bent, en waar de warmte eigenlijk weggaat.
 *
 * De balk zelf is aria-hidden; de stand staat als percentage en als lijst met
 * bouwdelen in gewone tekst eronder, en dat leest een schermlezer beter voor
 * dan een rij vlakken.
 */
const SchilBalk = ({
  delen,
  haalbaar,
  aandeel,
}: {
  delen: { id: string; label: string; euroMax: number; dicht: boolean }[];
  haalbaar: number;
  aandeel: number;
}) => (
  <div className="mt-5">
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <span
        className="text-[12px] font-bold uppercase tracking-wider"
        style={{ color: KLEUR.navy, opacity: 0.6 }}
      >
        Schil dicht
      </span>
      <span className="text-[13px] font-bold tabular-nums" style={{ color: KLEUR.navy }}>
        {Math.round(aandeel * 100)}% van {euro(haalbaar)} per jaar
      </span>
    </div>

    <div className="mt-2 flex gap-1" aria-hidden="true">
      {delen.map((deel) => (
        <div
          key={deel.id}
          className="h-2.5 rounded-full transition-colors duration-300"
          style={{
            flex: `${deel.euroMax} 1 0%`,
            backgroundColor: deel.dicht ? KLEUR.goud : "hsl(var(--primary) / 0.1)",
          }}
        />
      ))}
    </div>

    <ul
      className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1"
      style={{ listStyle: "none", padding: 0, margin: "10px 0 0 0" }}
    >
      {delen.map((deel) => (
        <li key={deel.id} className="flex items-center gap-1.5">
          <span
            className="rounded-full transition-colors duration-300"
            style={{
              width: 8,
              height: 8,
              backgroundColor: deel.dicht ? KLEUR.goud : "hsl(var(--primary) / 0.18)",
            }}
            aria-hidden="true"
          />
          <span
            className="text-[13px]"
            style={{ color: KLEUR.navy, opacity: deel.dicht ? 0.85 : 0.5 }}
          >
            {deel.label}
            <span className="sr-only">{deel.dicht ? " geïsoleerd" : " nog niet geïsoleerd"}</span>
          </span>
        </li>
      ))}
    </ul>

    {/* De bedragen per bouwdeel staan bewust niet in de legenda: die staan al in
        de teller en op de kaarten, en drie keer hetzelfde getal is ruis. Deze
        regel maakt in plaats daarvan de breedtes leesbaar. */}
    <p className="mt-2 text-[12px]" style={{ color: KLEUR.navy, opacity: 0.55 }}>
      Elk deel is zo breed als zijn aandeel in wat je kunt besparen.
    </p>
  </div>
);

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
