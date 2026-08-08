import { FormEvent, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Check, ChevronDown, Loader2, MapPin } from "lucide-react";

import { SUBSIDIECHECK_BELOFTES } from "@/config/beloftes";
import { usePdokAdres } from "@/hooks/usePdokAdres";
import { pushGtmEvent } from "@/lib/gtm";
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

const inputClass =
  "w-full rounded-lg border border-input bg-background px-4 py-3.5 text-[16px] text-foreground outline-none transition min-h-[52px] focus:border-accent focus:shadow-[0_0_0_3px_hsl(var(--accent)/0.18)]";

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

  // Korte samenvatting van de interesses voor de ingeklapte regel. Staat op een
  // eigen regel, dus met een hoofdletter.
  const maatregelSamenvatting =
    maatregelen.length === 0
      ? "Alle maatregelen"
      : maatregelen.length <= 2
        ? maatregelen.map((m) => MAATREGEL_LABELS[m]).join(" en ")
        : `${maatregelen.length} maatregelen`;

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (bezig) return;

    // Adres al bevestigd (compacte pill): direct door met situatie + interesses.
    if (bevestigdAdres) {
      pushGtmEvent("subsidiecheck_start", {
        gemeente: bevestigdAdres.gemeentenaam,
        provincie: bevestigdAdres.provincienaam,
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
    pushGtmEvent("subsidiecheck_start", { gemeente: adres.gemeentenaam, provincie: adres.provincienaam });
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
      {/* Adres: compacte bevestiging (bv. vanaf de homepage) of invulvelden. */}
      {bevestigdAdres ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-card px-4 py-3 shadow-subtle">
          <span className="inline-flex items-center gap-2 text-[15px] text-foreground">
            <MapPin size={16} className="text-muted-foreground" aria-hidden="true" />
            {bevestigdAdres.straatnaam} {huisnummer.trim()}
            {toevoeging.trim() ? ` ${toevoeging.trim()}` : ""}, {bevestigdAdres.woonplaatsnaam}
          </span>
          <button
            type="button"
            onClick={onAdresWijzigen}
            className="inline-flex items-center gap-1 rounded-sm text-[13.5px] text-primary underline underline-offset-4 transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            adres wijzigen
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-[2fr_1.2fr_1fr] gap-3">
            <div>
              <label htmlFor="sc-postcode" className="mb-2 block text-[14px] font-semibold text-foreground">
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
            <div>
              <label htmlFor="sc-huisnummer" className="mb-2 block text-[14px] font-semibold text-foreground">
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
            <div>
              <label
                htmlFor="sc-toevoeging"
                className="mb-2 block whitespace-nowrap text-[14px] font-semibold text-foreground"
              >
                Toevoeging <span className="hidden font-normal text-muted-foreground sm:inline">(optioneel)</span>
              </label>
              <input
                id="sc-toevoeging"
                name="toevoeging"
                type="text"
                placeholder="A"
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

          {/* Terugkoppeling van de live check. "Niet herkend" is bewust rustig
              gehouden (geen rood): je typt nog, en het handmatige blok vangt een
              onbekend adres straks alsnog op. */}
          {!fout && (zoektLive || gevonden || nietHerkend) && (
            <p className="mt-2.5 flex items-center gap-1.5 text-[13.5px]" aria-live="polite">
              {zoektLive ? (
                <>
                  <Loader2 size={14} className="animate-spin text-muted-foreground" aria-hidden="true" />
                  <span className="text-muted-foreground">Adres controleren…</span>
                </>
              ) : gevonden ? (
                <>
                  <Check size={14} strokeWidth={2.5} className="text-[hsl(var(--subsidie))]" aria-hidden="true" />
                  <span className="text-foreground">
                    {gevonden.straatnaam} {huisnummer.trim()}
                    {toevoeging.trim() ? ` ${toevoeging.trim()}` : ""}, {gevonden.woonplaatsnaam}
                  </span>
                </>
              ) : (
                <>
                  <MapPin size={14} className="text-muted-foreground" aria-hidden="true" />
                  <span className="text-muted-foreground">Dit adres herkennen we nog niet.</span>
                </>
              )}
            </p>
          )}
        </>
      )}

      {/* Situatie en interesses staan standaard goed, dus samen achter één rustige
          regel. Eerder stonden hier twee blokken met elk een donkere pill; die
          las als een knop terwijl er niets te doen viel, en trok de aandacht weg
          van het enige dat de bezoeker hier écht moet invullen: zijn adres. */}
      {keuzesUit ? (
        <div className="mt-6 animate-fade-up">
          <fieldset>
            <legend className="mb-3 block text-[14px] font-semibold text-foreground">Ik ben…</legend>
            <BewonertypeKeuze waarde={bewonertype} onKies={setBewonertype} />
          </fieldset>
          <fieldset className="mt-6">
            <legend className="mb-3 block text-[14px] font-semibold text-foreground">
              Waar ben je in geïnteresseerd?
            </legend>
            <MaatregelKeuze gekozen={maatregelen} onWijzig={setMaatregelen} />
          </fieldset>
        </div>
      ) : (
        <div className="mt-6">
          {/* Kopje erboven, anders lijkt deze regel uit de lucht te vallen. */}
          <p className="mb-2 block text-[14px] font-semibold text-foreground">Waarop we zoeken</p>
          {/* Nooit afbreken: de tekst mag over twee regels, "Aanpassen" blijft
              rechts op dezelfde hoogte staan. */}
          <div className="flex items-start justify-between gap-3 rounded-lg border border-border px-4 py-3">
            <div className="min-w-0">
              <p className="text-[14px] font-semibold leading-snug text-foreground">{BEWONERTYPE_LABELS[bewonertype]}</p>
              <p className="text-[13px] leading-snug text-muted-foreground">{maatregelSamenvatting}</p>
            </div>
            <button
              type="button"
              aria-expanded={false}
              onClick={() => setKeuzesUit(true)}
              className="inline-flex shrink-0 items-center gap-1 rounded-sm text-[13.5px] font-medium text-primary underline underline-offset-4 transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Aanpassen
              <ChevronDown size={14} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={bezig}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-7 py-3.5 text-[15px] font-semibold text-primary transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-70 min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {bezig ? (
          <>
            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            Adres zoeken…
          </>
        ) : (
          knopLabel
        )}
      </button>

      {/* Handmatig adres invullen als PDOK het niet herkent (bv. nieuwbouw). */}
      {!bevestigdAdres && nietGevonden && (
        <div className="mt-5 rounded-lg border border-border p-4" style={{ backgroundColor: "var(--card-soft)" }}>
          <p className="text-[14px] font-semibold text-primary">Adres niet gevonden? Vul het handmatig in.</p>
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
            Handig bij bijvoorbeeld een nieuwbouwadres. Je subsidieoverzicht werkt gewoon op basis van je postcode;
            alleen de luchtfoto van je woning tonen we dan niet.
          </p>
          <div className="mt-3 grid grid-cols-[2fr_1fr_1fr] gap-3">
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
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
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
            className="mt-3 inline-flex items-center justify-center gap-2 rounded-full border border-primary px-6 py-2.5 text-[14px] font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Ga verder met dit adres
          </button>
        </div>
      )}

      {/* Zeggen wat er hierna komt. Zonder deze regel loopt de bezoeker van een
          scherm dat "geen account nodig" belooft zó een scherm in dat om naam,
          e-mail en telefoon vraagt; die verrassing valt precies op het moment
          dat we vertrouwen nodig hebben. Vooraf aankondigen kost misschien een
          enkele klik op stap 1, maar haalt de omgekeerde belofte uit de poort. */}
      <p className="mt-3 text-center text-[12.5px] leading-relaxed text-muted-foreground">
        Daarna vragen we kort je gegevens, zodat we het overzicht naar je kunnen mailen.
      </p>

      {/* De drie beloftes en onze echte Google-score op één regel. Op mobiel
          vallen de vinkjes weg en scheiden puntjes de beloftes, zodat de drie
          altijd naast elkaar blijven staan; de score zakt daar naar de regel
          eronder. Hier geeft iemand voor het eerst iets van zichzelf prijs (zijn
          adres), dus hoort dat bewijs juist hier. De teksten staan in
          src/config/beloftes.ts, gedeeld met de CTA op de homepage. */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
        <ul className="flex flex-nowrap items-center gap-x-2 whitespace-nowrap text-[12px] text-muted-foreground sm:gap-x-4 sm:text-[13px]">
          {SUBSIDIECHECK_BELOFTES.map((belofte, i) => (
            <li key={belofte} className="inline-flex items-center gap-1.5">
              {i > 0 && (
                <span aria-hidden="true" className="text-border sm:hidden">
                  ·
                </span>
              )}
              <Check size={14} strokeWidth={2.5} className="hidden shrink-0 text-accent sm:inline" aria-hidden="true" />
              {belofte}
            </li>
          ))}
        </ul>
        <Bewijsregel />
      </div>
    </form>
  );
};
