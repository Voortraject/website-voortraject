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
  // De tussenwoning staat voor: dat is het meest voorkomende woningtype in
  // Nederland, dus het beste vertrekpunt voor wie nog niets heeft gekozen.
  const [woningtype, setWoningtype] = useState<Woningtype>("tussenwoning");
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

  // Alles aanzetten zet ook echt alles aan, gevelisolatie incluis. Eerder sloeg
  // hij de tweede gevelroute over om dubbeltellen te voorkomen, maar dat doet de
  // teller nu zelf: een vinkje dat niet aangaat leest als een kapotte knop.
  const alleMaatregelen = ISOLATIE_MAATREGELEN.map((m) => m.id);
  const allesAan = alleMaatregelen.every((id) => gekozen.has(id));
  const alles = () => setGekozen(allesAan ? new Set() : new Set(alleMaatregelen));

  return (
    <>
      <div className="text-center">
        <SectieKop center>
          <Accent tekst="Maak de schil van je woning [[dicht]]" />
        </SectieKop>
        <p className="vd-lead mx-auto mt-3 max-w-[700px]">
          Isoleren gaat over de schil: alles wat je verwarmde ruimte scheidt van de kou. Kies
          hieronder je woningtype en zet maatregelen aan om te zien wat er met de warmte, en
          met je energierekening, gebeurt.
        </p>
      </div>

      {/* Woningtype */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2 md:mt-8">
        <span className="mr-1 w-full text-center text-[13.5px] font-bold text-[hsl(var(--rs-tekst-zacht))] sm:w-auto">
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
              className="vd-keuze min-h-[38px] px-3.5 text-[13.5px] sm:min-h-[40px] sm:px-4 sm:text-[14px]"
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-1 items-start gap-5 md:mt-8 lg:grid-cols-2 lg:gap-8">
        {/* Tekening plus teller */}
        <div className="hs-tegel hs-blauw-zacht p-4 md:p-6 lg:sticky lg:top-20">
          {/* De tekening krijgt een maximum: met de voortgangsbalk en de drie
              cijfers erbij werd het kaartje anders hoger dan het scherm, en dan
              schuift juist de teller onder de vouw terwijl je de lijst langs
              scrollt. */}
          <div className="mx-auto" style={{ maxWidth: 420 }}>
            <WoningTekening gekozen={gekozen} />
          </div>

          <SchilBalk delen={schil.delen} haalbaar={schil.haalbaar} aandeel={schil.aandeelDicht} />

          <div
            className={`mt-4 rounded-2xl px-4 pb-4 pt-4 text-center transition-colors duration-300 md:px-5 md:pt-5 ${
              gekozen.size > 0 ? "vd-wit vd-oker" : "vd-wit"
            }`}
          >
            <span className="vd-label text-[12px]">Besparing per jaar</span>
            <div className="vd-getal mt-1 text-[40px] text-primary md:text-[44px]">
              {euro(totaal.euroPerJaar)}
            </div>

            {gekozen.size === 0 ? (
              <p className="vd-tekst mt-1 mb-0 text-[14px]">Zet hiernaast een maatregel aan</p>
            ) : (
              <>
                <div className="vd-inzet mt-4 grid grid-cols-3 gap-2 px-2 py-3">
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
                <p className="mt-3 mb-0 text-[13px] text-[hsl(var(--rs-tekst-zacht))]">
                  Investering en terugverdientijd zijn vóór subsidie.
                </p>
              </>
            )}
          </div>

          {gevelDubbel && (
            <p className="vd-tekst mt-3 mb-0 text-[14px]">
              <strong className="text-primary">De gevel telt één keer mee.</strong> Spouwmuurisolatie en
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
                className={`hs-tegel hs-klik rounded-[20px] md:rounded-[22px] ${aan ? "vd-oker" : ""}`}
              >
                <button
                  type="button"
                  onClick={() => wissel(m.id)}
                  aria-pressed={aan}
                  className="w-full rounded-[20px] p-4 text-left focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-[hsl(var(--accent))] md:p-5"
                >
                  <span className="flex items-start gap-3.5 md:gap-4">
                    <span
                      className={`mt-0.5 flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full transition-colors ${
                        aan
                          ? "hs-rondje-oker"
                          : "bg-[hsl(var(--primary)/0.06)] shadow-[inset_0_1px_3px_hsl(var(--primary)/0.14)]"
                      }`}
                    >
                      {aan && <Check size={15} className="text-primary" strokeWidth={3} aria-hidden="true" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="hs-h3">{m.naam}</span>
                          {m.id === snelste && <span className="vd-pil">Snelst terugverdiend</span>}
                        </span>
                        <span
                          className={`whitespace-nowrap text-[15px] font-extrabold tabular-nums ${
                            aan ? "text-primary" : "text-[hsl(var(--rs-getal))]"
                          }`}
                        >
                          {euro(t.euro)} per jaar
                        </span>
                      </span>
                      <span className="vd-tekst mt-1 block text-[14.5px]">{m.kort}</span>
                      {aan && (
                        <span className="mt-3 block">
                          <span className="block text-[14.5px] leading-relaxed text-foreground">
                            <strong className="text-primary">Wat je merkt:</strong> {m.merkbaar}
                          </span>
                          {/* De drie cijfers stonden als doorlopende zin in de
                              grijze regel eronder. Als strook zijn ze te
                              vergelijken tussen maatregelen zonder te lezen. */}
                          <span className="vd-inzet mt-3 grid grid-cols-3 gap-2 px-2 py-2.5">
                            <Cijfer waarde={`${t.m3} m³`} label="gas per jaar" klein />
                            <Cijfer waarde={euro(t.kosten)} label="investering" klein />
                            <Cijfer
                              waarde={jaren(terugverdientijd(t.kosten, t.euro))}
                              label="terugverdiend"
                              klein
                            />
                          </span>
                          <span className="mt-2 block text-[13.5px] leading-relaxed text-[hsl(var(--rs-tekst-zacht))]">
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
                  <div className="px-4 pb-4 pl-[56px] md:px-5 md:pb-5 md:pl-[62px]">
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
            className="inline-flex min-h-[32px] items-center self-start text-[14.5px] font-bold text-primary underline underline-offset-4"
          >
            {allesAan ? "Alles uitzetten" : "Alles aanzetten"}
          </button>
        </div>
      </div>

      {/* De regelingen horen hier, bij de bedragen waar ze nog niet in zitten.
          Ze stonden ook als losse sectie een paar schermen verderop, en dat was
          hetzelfde verhaal een tweede keer. */}
      <div className="hs-tegel hs-groen mt-6 p-5 md:mt-8 md:p-6">
        <p className="m-0 text-[15px] leading-relaxed text-foreground">
          <strong className="text-primary">Hier staat nog geen subsidie in.</strong> Isolatie is wel een van de best
          gesubsidieerde maatregelen die er zijn. Welke regeling voor jou geldt hangt af van je
          adres: in Groningen en Noord-Drenthe loopt dat anders dan in de rest van het land, en
          gemeenten hebben er vaak nog een eigen regeling naast.
        </p>
        <ul className="mx-0 mb-0 mt-4 grid list-none grid-cols-1 gap-x-8 gap-y-2.5 p-0 md:grid-cols-3">
          {REGELINGEN.map((regeling) => (
            <li key={regeling} className="flex items-start gap-2.5">
              <Check
                size={16}
                className="mt-[3px] shrink-0 text-[hsl(var(--subsidie))]"
                strokeWidth={2.6}
                aria-hidden="true"
              />
              <span className="text-[14.5px] leading-[1.5] text-foreground">
                {regeling}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-1">
          <a href="/subsidies/stapelen" className="hs-pijl-link">
            Bekijk hoe je subsidies stapelt
            <ArrowRight size={17} strokeWidth={2.2} className="hs-pijl" aria-hidden="true" />
          </a>
          <span className="vd-tekst text-[14px]">
            Of doe de subsidiecheck hieronder, dan zie je wat er voor jouw adres is.
          </span>
        </div>
      </div>

      <p className="mt-4 mb-0 text-[13.5px] leading-relaxed text-[hsl(var(--rs-tekst-zacht))]">
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
      className={`block font-extrabold tabular-nums leading-tight text-primary ${klein ? "text-[14px]" : "text-[16px]"}`}
    >
      {waarde}
    </span>
    <span className="mt-0.5 block text-[12px] leading-tight text-[hsl(var(--rs-tekst-zacht))]">{label}</span>
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
      <span className="vd-label text-[12px]">Schil dicht</span>
      <span className="text-[13.5px] font-extrabold tabular-nums text-primary">
        {Math.round(aandeel * 100)}% van {euro(haalbaar)} per jaar
      </span>
    </div>

    <div className="mt-2 flex gap-1" aria-hidden="true">
      {delen.map((deel) => (
        <div
          key={deel.id}
          className={`h-2.5 rounded-full transition-colors duration-300 ${
            deel.dicht ? "bg-accent" : "bg-[hsl(var(--primary)/0.1)]"
          }`}
          style={{ flex: `${deel.euroMax} 1 0%` }}
        />
      ))}
    </div>

    <ul className="mx-0 mb-0 mt-2.5 flex list-none flex-wrap gap-x-4 gap-y-1 p-0">
      {delen.map((deel) => (
        <li key={deel.id} className="flex items-center gap-1.5">
          <span
            className={`h-2 w-2 rounded-full transition-colors duration-300 ${
              deel.dicht ? "bg-accent" : "bg-[hsl(var(--primary)/0.18)]"
            }`}
            aria-hidden="true"
          />
          <span
            className={`text-[13.5px] ${deel.dicht ? "font-bold text-primary" : "text-[hsl(var(--rs-tekst-zacht))]"}`}
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
    <p className="mt-2 mb-0 text-[13px] text-[hsl(var(--rs-tekst-zacht))]">
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
    <span className="mr-1 text-[13.5px] font-bold text-[hsl(var(--rs-tekst-zacht))]">{label}</span>
    {opties.map((o) => {
      const aan = o.id === actief;
      return (
        <button
          key={o.id}
          type="button"
          onClick={() => kies(o.id)}
          aria-pressed={aan}
          className="vd-keuze min-h-[36px] px-3 text-[13px]"
        >
          {o.label}
        </button>
      );
    })}
  </div>
);
