import { FormEvent, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Check, ChevronDown, Loader2, MapPin } from "lucide-react";

import { pushGtmEvent } from "@/lib/gtm";
import { displayPostcode, normalizePostcode, POSTCODE_RE, zoekAdres, type PdokAdres } from "@/lib/pdok";
import { ALLE_MAATREGELEN, type Bewonertype, type Maatregel } from "@/lib/subsidies";

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
  // Interesses staan standaard op "alles"; specifieke maatregelen kiezen zit
  // achter een uitklap (rustiger, vooral op mobiel). Open als er al een
  // specifieke selectie is (bv. via een gedeelde link of "situatie aanpassen").
  const [interessesUit, setInteressesUit] = useState(
    initMaatregelen.length > 0 && initMaatregelen.length < ALLE_MAATREGELEN.length,
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

    setBezig(true);
    const adres = await zoekAdres(postcode, huisnummer, toevoeging);
    setBezig(false);

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
        </>
      )}

      {/* Ik ben… — situatie staat standaard uitgeklapt, bóven de interesses.
          Woningeigenaar is voorgeselecteerd (verreweg de grootste groep). */}
      <fieldset className="mt-6">
        <legend className="mb-3 block text-[14px] font-semibold text-foreground">Ik ben…</legend>
        <BewonertypeKeuze waarde={bewonertype} onKies={setBewonertype} />
      </fieldset>

      {/* Interesses — standaard "alles"; specifiek kiezen zit achter een uitklap. */}
      <fieldset className="mt-6">
        <legend className="mb-3 block text-[14px] font-semibold text-foreground">Waar ben je in geïnteresseerd?</legend>
        {interessesUit ? (
          <div className="animate-fade-up">
            <MaatregelKeuze gekozen={maatregelen} onWijzig={setMaatregelen} />
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground">
              <Check size={14} strokeWidth={2.5} aria-hidden="true" />
              Alle maatregelen
            </span>
            <button
              type="button"
              aria-expanded={false}
              onClick={() => setInteressesUit(true)}
              className="inline-flex items-center gap-1 rounded-sm text-[13.5px] font-medium text-primary underline underline-offset-4 transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Specifiek kiezen
              <ChevronDown size={14} aria-hidden="true" />
            </button>
          </div>
        )}
      </fieldset>

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

      {/* Drie beloftes met vinkjes (zelfde patroon als de hero). */}
      <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        {["Gratis", "Geen account nodig", "Klaar in 1 minuut"].map((belofte) => (
          <li key={belofte} className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground">
            <Check size={14} strokeWidth={2.5} className="shrink-0 text-accent" aria-hidden="true" />
            {belofte}
          </li>
        ))}
      </ul>
    </form>
  );
};
