import { FormEvent, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Check, Home, Loader2, MapPin } from "lucide-react";

import { SUBSIDIECHECK_BELOFTES } from "@/config/beloftes";
import { GEMIDDELDE_REGELINGEN_ZIN } from "@/config/cijfers";
import { usePdokAdres } from "@/hooks/usePdokAdres";
import { pushGtmEvent } from "@/lib/gtm";
import { maakEventId } from "@/lib/herkomst";
import { displayPostcode, normalizePostcode, POSTCODE_RE, zoekAdres, type PdokAdres } from "@/lib/pdok";
import {
  ALLE_MAATREGELEN,
  BEWONERTYPE_LABELS,
  type Bewonertype,
  type Maatregel,
  MAATREGEL_LABELS,
} from "@/lib/subsidies";

import { Bewijsregel } from "./Bewijsregel";
import { BewonertypeKeuze } from "./BewonertypeKeuze";
import { MaatregelKeuze } from "./MaatregelKeuze";

// Wit en zacht verzonken, geen harde rand (.instap-invoer in src/index.css).
// 16px voorkomt dat iOS inzoomt bij het tikken in een veld.
const inputClass = "instap-invoer w-full min-h-[54px] px-3 text-[16px] font-medium sm:px-4";

// Typt mee met de gebruiker: hoofdletters, alleen geldige tekens.
const formatPostcode = (v: string) => v.toUpperCase().replace(/[^0-9A-Z ]/g, "").slice(0, 7);

interface StapAdresProps {
  initPostcode: string;
  initHuisnummer: string;
  initToevoeging: string;
  initBewonertype: Bewonertype | null;
  /** Lege lijst = alle maatregelen ("Alles"). */
  initMaatregelen: Maatregel[];
  /** Al bevestigd adres (bv. vanaf de homepage): toon compacte bevestiging i.p.v. velden. */
  bevestigdAdres: PdokAdres | null;
  /** Bijv. wanneer een deeplink-adres niet gevonden werd. */
  foutmelding?: string | null;
  /** Adres + situatie + interesses bevestigd → naar het resultaat. */
  onStart: (
    postcode: string,
    huisnummer: string,
    toevoeging: string,
    bewonertype: Bewonertype,
    maatregelen: Maatregel[],
  ) => void;
  /** Handmatig doorgaan wanneer PDOK het adres niet herkent. */
  onHandmatig: (
    postcode: string,
    huisnummer: string,
    toevoeging: string,
    bewonertype: Bewonertype,
    maatregelen: Maatregel[],
    straat: string,
    stad: string,
  ) => void;
  /** Vanuit de compacte bevestiging het adres alsnog aanpassen (toont de velden). */
  onAdresWijzigen: () => void;
  /** De bezoeker kwam via "situatie aanpassen": toon de situatiekeuze meteen open. */
  situatieOpen?: boolean;
  /**
   * Meldt of de live adrescheck op dit moment een bestaand adres herkent.
   *
   * Alleen voor de voortgangsbalk op de pagina: die loopt door zodra we het huis
   * gevonden hebben. Het adres zelf gaat gewoon via `onStart` en de URL.
   */
  onAdresHerkend?: (herkend: boolean) => void;
  /** Label van de doorknop. Met de gegevens-poort "Verder" (er volgt nog een stap). */
  knopLabel?: string;
}

// Gecombineerde eerste stap: adres + interesses + (optioneel) situatie op één
// pagina. De situatie staat standaard op woningeigenaar (verreweg de grootste
// groep), verstopt achter een uitklap zodat er geen aparte situatiestap nodig is
// — huurder/VvE/verhuurder klapt 'm open. Komt de bezoeker met een geldig adres
// binnen (bv. via de homepage), dan tonen we dat compact i.p.v. de velden.
export const StapAdres = ({
  initPostcode,
  initHuisnummer,
  initToevoeging,
  initBewonertype,
  initMaatregelen,
  bevestigdAdres,
  foutmelding,
  onStart,
  onHandmatig,
  onAdresWijzigen,
  situatieOpen = false,
  onAdresHerkend,
  knopLabel = "Bekijk mijn subsidies",
}: StapAdresProps) => {
  const [postcode, setPostcode] = useState(displayPostcode(initPostcode));
  const [huisnummer, setHuisnummer] = useState(initHuisnummer);
  const [toevoeging, setToevoeging] = useState(initToevoeging);
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState<string | null>(foutmelding ?? null);

  // Situatie (standaard woningeigenaar) + interesses (leeg = "Alles").
  const [bewonertype, setBewonertype] = useState<Bewonertype>(initBewonertype ?? "woningeigenaar");
  const [maatregelen, setMaatregelen] = useState<Maatregel[]>(
    initMaatregelen.length === ALLE_MAATREGELEN.length ? [] : initMaatregelen,
  );
  // Situatie en interesses staan allebei al goed voor verreweg de meeste
  // bezoekers. Ze zitten daarom samen achter één rustige regel; wie iets anders
  // is of alleen in bepaalde maatregelen geïnteresseerd is, klapt ze open. Open
  // bij binnenkomst als de bezoeker er expliciet naartoe kwam ("situatie
  // aanpassen") of al van de standaard afwijkt.
  const [keuzesUit, setKeuzesUit] = useState(
    situatieOpen ||
      (!!initBewonertype && initBewonertype !== "woningeigenaar") ||
      (initMaatregelen.length > 0 && initMaatregelen.length < ALLE_MAATREGELEN.length),
  );
  // De keuzes klappen vloeiend open en dicht (.instap-klap). Ze staan alleen in
  // de DOM zolang ze open zijn of aan het dichtklappen: dicht horen ze niet in
  // de tabvolgorde of bij een schermlezer.
  const [keuzesInBeeld, setKeuzesInBeeld] = useState(keuzesUit);
  const klapTimer = useRef<number>();
  const zetKeuzesUit = (open: boolean) => {
    window.clearTimeout(klapTimer.current);
    const rustig = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (open) {
      // Eerst in de DOM (dicht), dan open, zodat de hoogte echt kan aanlopen.
      setKeuzesInBeeld(true);
      if (rustig) setKeuzesUit(true);
      else requestAnimationFrame(() => requestAnimationFrame(() => setKeuzesUit(true)));
    } else {
      setKeuzesUit(false);
      if (rustig) setKeuzesInBeeld(false);
      else klapTimer.current = window.setTimeout(() => setKeuzesInBeeld(false), 560);
    }
  };
  useEffect(() => () => window.clearTimeout(klapTimer.current), []);

  // Handmatig invulblok als PDOK het adres niet herkent (bv. nieuwbouw).
  const [nietGevonden, setNietGevonden] = useState(!!foutmelding);
  const [mPostcode, setMPostcode] = useState(displayPostcode(initPostcode));
  const [mHuisnr, setMHuisnr] = useState(initHuisnummer);
  const [mToevoeging, setMToevoeging] = useState(initToevoeging);
  const [straat, setStraat] = useState("");
  const [stad, setStad] = useState("");
  const [mFout, setMFout] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const gekozenMaatregelen = (): Maatregel[] => (maatregelen.length === 0 ? [...ALLE_MAATREGELEN] : maatregelen);

  // Korte samenvatting van de interesses voor de regel boven de knop. Staat
  // na een komma ("Woningeigenaar, alle maatregelen."), dus de eerste letter
  // klein; de rest van de maatregellabels houdt zijn eigen schrijfwijze.
  const samenvattingRuw =
    maatregelen.length === 0
      ? "alle maatregelen"
      : maatregelen.length <= 2
        ? maatregelen.map((m) => MAATREGEL_LABELS[m]).join(" en ")
        : `${maatregelen.length} maatregelen`;
  const maatregelSamenvatting = samenvattingRuw.charAt(0).toLowerCase() + samenvattingRuw.slice(1);

  // Live adrescheck: een halve seconde na de laatste toetsaanslag zoeken we het
  // adres al op. Dat doet drie dingen tegelijk: de bezoeker ziet meteen dat we
  // zíjn huis gevonden hebben (kleine beloning voor de eerste moeite), een typefout
  // valt op vóór het verzenden, en bij het klikken op de knop is er niets meer op
  // te halen. Zelfde react-query-sleutel als de pagina, dus geen dubbel verkeer.
  const [vertraagd, setVertraagd] = useState({ pc: postcode, hn: huisnummer, tv: toevoeging });
  useEffect(() => {
    const t = setTimeout(() => setVertraagd({ pc: postcode, hn: huisnummer, tv: toevoeging }), 500);
    return () => clearTimeout(t);
  }, [postcode, huisnummer, toevoeging]);

  // Niet zoeken zolang er een compact bevestigd adres staat (dan zijn de velden
  // niet eens zichtbaar) of terwijl het handmatige blok openstaat.
  const liveUit = !!bevestigdAdres || nietGevonden;
  const liveAdres = usePdokAdres(liveUit ? "" : vertraagd.pc, liveUit ? "" : vertraagd.hn, vertraagd.tv);
  // Alleen tonen als de vertraagde waarden nog gelijk zijn aan wat er staat; anders
  // hoort de uitkomst bij een oudere invoer en is 'ie misleidend.
  const bijDeTijd = vertraagd.pc === postcode && vertraagd.hn === huisnummer && vertraagd.tv === toevoeging;
  const gevonden = bijDeTijd && !liveUit ? (liveAdres.data ?? null) : null;
  const zoektLive = bijDeTijd && !liveUit && liveAdres.isFetching;
  const nietHerkend = bijDeTijd && !liveUit && !liveAdres.isFetching && liveAdres.isFetched && !liveAdres.data;

  // Doorgeven aan de pagina zodat de voortgangsbalk meebeweegt zodra we het huis
  // herkennen. Een compact bevestigd adres telt ook mee: dan staat het er al.
  const adresHerkend = !!gevonden || !!bevestigdAdres;
  useEffect(() => {
    onAdresHerkend?.(adresHerkend);
  }, [adresHerkend, onAdresHerkend]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (bezig) return;

    // Adres al bevestigd (compacte pill): direct door met situatie + interesses.
    if (bevestigdAdres) {
      pushGtmEvent("subsidiecheck_start", {
        gemeente: bevestigdAdres.gemeentenaam,
        provincie: bevestigdAdres.provincienaam,
        event_id: maakEventId(),
      });
      onStart(postcode.trim(), huisnummer.trim(), toevoeging.trim(), bewonertype, gekozenMaatregelen());
      return;
    }

    setFout(null);
    setNietGevonden(false);
    if (!POSTCODE_RE.test(postcode.trim())) {
      setFout("Vul een geldige postcode in, bijvoorbeeld 9711 AB.");
      return;
    }
    if (!/^[0-9]/.test(huisnummer.trim())) {
      setFout("Vul een huisnummer in.");
      return;
    }

    // Meestal heeft de live check het adres al: dan is er niets meer op te halen
    // en gaat de knop direct door.
    let adres = gevonden;
    if (!adres) {
      setBezig(true);
      adres = await zoekAdres(postcode, huisnummer, toevoeging);
      setBezig(false);
    }

    if (!adres) {
      setFout("We konden dit adres niet vinden. Check even je postcode en huisnummer.");
      setNietGevonden(true);
      // Neem over wat de bewoner al invulde als startpunt voor het handmatige blok.
      setMPostcode(postcode);
      setMHuisnr(huisnummer);
      setMToevoeging(toevoeging);
      setMFout(null);
      return;
    }

    // Deel de bevestiging met de pagina-prefetch: exact dezelfde react-query-sleutel
    // als usePdokAdres, zodat de pagina het adres niet nóg een keer bij PDOK opvraagt
    // en de 3D-prefetch (pand + model) meteen kan starten i.p.v. na een tweede lookup.
    queryClient.setQueryData(
      ["pdok-adres", normalizePostcode(postcode), huisnummer.trim(), toevoeging.trim()],
      adres,
    );

    // Adres bevestigd = echte intentie; geen postcode/adres in het event (privacy).
    // event_id: voor deduplicatie bij Meta (ViewContent); alleen in de push.
    pushGtmEvent("subsidiecheck_start", {
      gemeente: adres.gemeentenaam,
      provincie: adres.provincienaam,
      event_id: maakEventId(),
    });
    onStart(postcode.trim(), huisnummer.trim(), toevoeging.trim(), bewonertype, gekozenMaatregelen());
  };

  const handleHandmatig = () => {
    if (!POSTCODE_RE.test(mPostcode.trim())) {
      setMFout("Vul een geldige postcode in, bijvoorbeeld 9711 AB. Die hebben we nodig voor de regelingen.");
      return;
    }
    if (!/^[0-9]/.test(mHuisnr.trim())) {
      setMFout("Vul een huisnummer in.");
      return;
    }
    if (!straat.trim() || !stad.trim()) {
      setMFout("Vul zowel de straatnaam als de plaats in.");
      return;
    }
    onHandmatig(
      mPostcode.trim(),
      mHuisnr.trim(),
      mToevoeging.trim(),
      bewonertype,
      gekozenMaatregelen(),
      straat.trim(),
      stad.trim(),
    );
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* De subregel onder de kop. Hij staat hier en niet in Subsidiecheck.tsx
          omdat de tweede zin het gemeten gemiddelde noemt, en dat cijfer geldt
          alleen voor woningeigenaren; alleen dit formulier weet welke situatie
          er op dit moment gekozen is.

          Waarom dat cijfer er hoort: het is het enige antwoord op "wat levert
          drie velden invullen mij op". Zonder anker weet de bezoeker niet of dit
          overzicht tweehonderd euro of achtduizend waard is, en dan is zelfs een
          kort formulier te duur.

          Vorm (huisstijl oktober 2026): twee korte zinnen, op een telefoon elk
          op een eigen regel, dus precies twee regels. Geen pill of vlak: dat
          leest als een knop terwijl er niets te doen valt.

          Het getal is gemeten en niet geschat (zie src/config/cijfers.ts en
          scripts/meet-subsidieaantal.mjs), naar beneden afgerond, en het is het
          landelijke gemiddelde: bewust zonder regio, zodat iemand uit Friesland
          of Overijssel zich niet buitengesloten voelt. Voor huurders, VvE's en
          verhuurders tonen we alleen een gewone zin: die groepen krijgen een
          andere lijst, en dan zou het cijfer een niet-nagemeten belofte zijn. */}
      {!bevestigdAdres && (
        // De negatieve bovenmarge heft een deel van de mt-6 van de
        // formulierwrapper op, zodat deze regel als subregel onder de kop hangt.
        <p className="mx-auto -mt-3 mb-[30px] max-w-[46ch] text-center text-[15.5px] leading-normal text-instap-zacht sm:text-[16.5px]">
          {bewonertype === "woningeigenaar" ? (
            <>
              Vul je adres in. <span className="block sm:inline">{GEMIDDELDE_REGELINGEN_ZIN}</span>
            </>
          ) : (
            "Vul je adres in, dan zoeken we alle regelingen."
          )}
        </p>
      )}

      {/* Eén lichte tegel met alles wat hier moet gebeuren: adres, de
          herkenning, de keuzes en de knop. Zacht verloop van boven naar wit
          en schaduw in plaats van een rand, zoals de kaarten in het CRM. */}
      <div
        className="instap-tegel instap-in rounded-[24px] p-[18px] shadow-instap-tegel sm:p-[26px]"
        style={{ ["--i" as string]: 3 }}
      >
        <div className="flex items-center justify-between gap-3">
          <span className="text-[13.5px] font-bold tracking-[0.02em] text-primary/75 sm:text-[14px]">Jouw adres</span>
          <span
            className="instap-rondje flex h-10 w-10 shrink-0 items-center justify-center rounded-full sm:h-11 sm:w-11"
            aria-hidden="true"
          >
            <Home size={20} strokeWidth={1.8} />
          </span>
        </div>

        {/* Adres: compacte bevestiging (bv. vanaf de homepage) of invulvelden. */}
        {bevestigdAdres ? (
          <div className="mt-3.5 flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="instap-herkend inline-flex items-center gap-2 rounded-full py-[7px] pl-2 pr-3.5 text-[14.5px] font-bold">
              <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-instap-subsidie text-primary-foreground">
                <MapPin size={12} strokeWidth={2.5} aria-hidden="true" />
              </span>
              {bevestigdAdres.straatnaam} {huisnummer.trim()}
              {toevoeging.trim() ? ` ${toevoeging.trim()}` : ""}, {bevestigdAdres.woonplaatsnaam}
            </span>
            <button
              type="button"
              onClick={onAdresWijzigen}
              className="rounded-sm text-[14px] font-bold text-primary underline underline-offset-4 transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              adres wijzigen
            </button>
          </div>
        ) : (
          <>
            {/* Postcode, huisnummer en toevoeging blijven ook op een telefoon op
                één regel. "Optioneel" staat in het veld zelf, zodat de drie
                labels op één regel passen; voor schermlezers staat het in het
                label. */}
            <div className="mt-3.5 grid grid-cols-[1.15fr_0.95fr_1.15fr] items-end gap-2 sm:grid-cols-[1.4fr_1fr_1fr] sm:gap-3">
              <div className="min-w-0">
                <label htmlFor="sc-postcode" className="mb-1.5 block text-[13px] font-bold text-primary sm:text-[14px]">
                  Postcode
                </label>
                <input
                  id="sc-postcode"
                  name="postcode"
                  type="text"
                  inputMode="text"
                  autoComplete="postal-code"
                  placeholder="9711 AB"
                  className={inputClass}
                  value={postcode}
                  onChange={(e) => {
                    setPostcode(formatPostcode(e.target.value));
                    setFout(null);
                  }}
                  aria-invalid={!!fout}
                  aria-describedby={fout ? "sc-adres-fout" : undefined}
                  maxLength={7}
                />
              </div>
              <div className="min-w-0">
                <label htmlFor="sc-huisnummer" className="mb-1.5 block text-[13px] font-bold text-primary sm:text-[14px]">
                  Huisnummer
                </label>
                <input
                  id="sc-huisnummer"
                  name="huisnummer"
                  type="text"
                  inputMode="numeric"
                  placeholder="12"
                  className={inputClass}
                  value={huisnummer}
                  onChange={(e) => {
                    setHuisnummer(e.target.value);
                    setFout(null);
                  }}
                  maxLength={6}
                />
              </div>
              <div className="min-w-0">
                <label
                  htmlFor="sc-toevoeging"
                  className="mb-1.5 block whitespace-nowrap text-[13px] font-bold text-primary sm:text-[14px]"
                >
                  Toevoeging <span className="sr-only">(optioneel)</span>
                </label>
                <input
                  id="sc-toevoeging"
                  name="toevoeging"
                  type="text"
                  placeholder="Optioneel"
                  className={inputClass}
                  value={toevoeging}
                  onChange={(e) => {
                    setToevoeging(e.target.value);
                    setFout(null);
                  }}
                  maxLength={10}
                />
              </div>
            </div>

            {fout && (
              <p id="sc-adres-fout" role="alert" className="mt-3 text-[14px] text-destructive">
                {fout}
              </p>
            )}

            {/* Terugkoppeling van de live check. Een herkend adres is een kleine
                beloning: een groene pil die zacht inveert. "Niet herkend" is
                bewust rustig gehouden (geen rood): je typt nog, en het handmatige
                blok vangt een onbekend adres straks alsnog op. */}
            {!fout && (zoektLive || gevonden || nietHerkend) && (
              <div className="mt-3.5" aria-live="polite">
                {zoektLive ? (
                  <p className="flex items-center gap-1.5 text-[14px] text-instap-zacht">
                    <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                    Adres controleren…
                  </p>
                ) : gevonden ? (
                  <p className="instap-herkend inline-flex items-center gap-2 rounded-full py-[7px] pl-2 pr-3.5 text-[14.5px] font-bold">
                    <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-instap-subsidie text-primary-foreground">
                      <Check size={13} strokeWidth={3} aria-hidden="true" />
                    </span>
                    {gevonden.straatnaam} {huisnummer.trim()}
                    {toevoeging.trim() ? ` ${toevoeging.trim()}` : ""}, {gevonden.woonplaatsnaam}
                  </p>
                ) : (
                  <p className="flex items-center gap-1.5 text-[14px] text-instap-zacht">
                    <MapPin size={14} aria-hidden="true" />
                    Dit adres herkennen we nog niet.
                  </p>
                )}
              </div>
            )}
          </>
        )}

        {/* Situatie en interesses staan standaard goed, dus samen achter één
            korte regel ("Woningeigenaar, alle maatregelen. Aanpassen"). Een
            omkaderd blok met een kop leest als "hier moet ik iets", en dat is
            een kleine rem vlak voor de belangrijkste klik van de pagina. Wie het
            wél wil aanpassen klapt de keuzes vloeiend open in dezelfde tegel. */}
        <p className="mt-4 text-[14.5px] leading-relaxed text-instap-zacht">
          {BEWONERTYPE_LABELS[bewonertype]}, {maatregelSamenvatting}.{" "}
          <button
            type="button"
            aria-expanded={keuzesUit}
            aria-controls="sc-keuzes"
            onClick={() => zetKeuzesUit(!keuzesUit)}
            className="rounded-sm font-bold text-primary underline underline-offset-4 transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {keuzesUit ? "Klaar" : "Aanpassen"}
          </button>
        </p>
        <div id="sc-keuzes" className="instap-klap" data-open={keuzesUit}>
          {/* De binnenrand geeft de schaduw van de tegels ruimte; zonder die
              rand snijdt de overflow van het uitklappen hem af. */}
          <div className="-mx-4 -mb-4 px-4 pb-6">
            {keuzesInBeeld && (
              <>
                <fieldset className="mt-5">
                  <legend className="mb-3 block text-[15px] font-extrabold text-primary">Ik ben…</legend>
                  <BewonertypeKeuze waarde={bewonertype} onKies={setBewonertype} />
                </fieldset>
                <fieldset className="mt-6">
                  <legend className="mb-3 block text-[15px] font-extrabold text-primary">
                    Waar ben je in geïnteresseerd?
                  </legend>
                  <MaatregelKeuze gekozen={maatregelen} onWijzig={setMaatregelen} />
                </fieldset>
              </>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={bezig}
          className="instap-knop mt-6 inline-flex min-h-[58px] w-full items-center justify-center gap-2.5 rounded-full px-7 text-[16.5px] font-extrabold disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {bezig ? (
            <>
              <Loader2 size={18} className="animate-spin" aria-hidden="true" />
              Adres zoeken…
            </>
          ) : (
            knopLabel
          )}
        </button>

        {/* Handmatig adres invullen als PDOK het niet herkent (bv. nieuwbouw). */}
        {!bevestigdAdres && nietGevonden && (
          <div className="mt-5 rounded-[18px] bg-card p-4 shadow-instap-klein">
            <p className="text-[14.5px] font-bold text-primary">Adres niet gevonden? Vul het handmatig in.</p>
            <p className="mt-1 text-[13.5px] leading-relaxed text-instap-zacht">
              Handig bij bijvoorbeeld een nieuwbouwadres. Je subsidieoverzicht werkt gewoon op basis van je postcode;
              alleen de luchtfoto van je woning tonen we dan niet.
            </p>
            <div className="mt-3 grid grid-cols-[2fr_1fr_1fr] gap-2 sm:gap-3">
              <input
                type="text"
                inputMode="text"
                autoComplete="postal-code"
                aria-label="Postcode"
                placeholder="Postcode"
                className={inputClass}
                value={mPostcode}
                maxLength={7}
                onChange={(e) => {
                  setMPostcode(formatPostcode(e.target.value));
                  setMFout(null);
                }}
              />
              <input
                type="text"
                inputMode="numeric"
                aria-label="Huisnummer"
                placeholder="Huisnummer"
                className={inputClass}
                value={mHuisnr}
                maxLength={6}
                onChange={(e) => {
                  setMHuisnr(e.target.value);
                  setMFout(null);
                }}
              />
              <input
                type="text"
                aria-label="Toevoeging (optioneel)"
                placeholder="Toev."
                className={inputClass}
                value={mToevoeging}
                maxLength={10}
                onChange={(e) => {
                  setMToevoeging(e.target.value);
                  setMFout(null);
                }}
              />
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
              <input
                type="text"
                aria-label="Straatnaam"
                placeholder="Straatnaam"
                className={inputClass}
                value={straat}
                maxLength={80}
                onChange={(e) => {
                  setStraat(e.target.value);
                  setMFout(null);
                }}
              />
              <input
                type="text"
                aria-label="Plaats"
                placeholder="Plaats"
                className={inputClass}
                value={stad}
                maxLength={80}
                onChange={(e) => {
                  setStad(e.target.value);
                  setMFout(null);
                }}
              />
            </div>
            {mFout && (
              <p role="alert" className="mt-3 text-[13px] text-destructive">
                {mFout}
              </p>
            )}
            <button
              type="button"
              onClick={handleHandmatig}
              className="mt-3 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-primary px-6 py-2.5 text-[14px] font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Ga verder met dit adres
            </button>
          </div>
        )}
      </div>

      {/* De drie beloftes en onze echte Google-score, onder de tegel. De teksten
          staan in src/config/beloftes.ts, gedeeld met de CTA op de homepage.
          Score als sterren, cijfer en Google-logo, zonder aantal reviews: zelfde
          vorm als in de overzichtsmail.

          Bewust `alsLink={false}`: een link met target="_blank" pal onder de
          verzendknop is een uitgang precies waar we er geen willen. Zie de
          toelichting in Bewijsregel zelf. */}
      <div
        className="instap-in mt-[26px] flex flex-col items-center gap-2 sm:mt-[18px]"
        style={{ ["--i" as string]: 5 }}
      >
        <ul className="flex flex-wrap items-center justify-center gap-x-3.5 gap-y-1 text-[13.5px] font-semibold text-instap-zacht">
          {SUBSIDIECHECK_BELOFTES.map((belofte) => (
            <li key={belofte} className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <Check size={15} strokeWidth={2.5} className="shrink-0 text-instap-subsidie" aria-hidden="true" />
              {belofte}
            </li>
          ))}
        </ul>
        <Bewijsregel alsLink={false} zonderAantal />
      </div>
    </form>
  );
};
