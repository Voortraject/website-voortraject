import { FormEvent, useEffect, useRef, useState } from "react";
import { Check, Loader2 } from "lucide-react";

import { pushGtmEvent } from "@/lib/gtm";
import { displayPostcode, POSTCODE_RE, zoekAdres, type PdokAdres } from "@/lib/pdok";

const inputClass =
  "w-full rounded-lg border border-input bg-background px-4 py-3 text-[16px] lg:text-[15px] text-foreground outline-none transition min-h-[48px] focus:border-accent focus:shadow-[0_0_0_3px_hsl(var(--accent)/0.18)]";

// Typt mee met de gebruiker: hoofdletters, alleen geldige tekens.
const formatPostcode = (v: string) => v.toUpperCase().replace(/[^0-9A-Z ]/g, "").slice(0, 7);

interface StapAdresProps {
  initPostcode: string;
  initHuisnummer: string;
  initToevoeging: string;
  /** Bijv. wanneer een deeplink-adres niet gevonden werd. */
  foutmelding?: string | null;
  onBevestigd: (postcode: string, huisnummer: string, toevoeging: string) => void;
  /** Handmatig doorgaan (straat + plaats) wanneer PDOK het adres niet herkent. */
  onHandmatig: (postcode: string, huisnummer: string, toevoeging: string, straat: string, stad: string) => void;
}

// Stap 1: postcode + huisnummer. Na een geslaagde PDOK-lookup tonen we het
// gevonden adres kort ter bevestiging ("dit gaat echt over mijn huis") en
// gaan we automatisch door.
export const StapAdres = ({
  initPostcode,
  initHuisnummer,
  initToevoeging,
  foutmelding,
  onBevestigd,
  onHandmatig,
}: StapAdresProps) => {
  const [postcode, setPostcode] = useState(displayPostcode(initPostcode));
  const [huisnummer, setHuisnummer] = useState(initHuisnummer);
  const [toevoeging, setToevoeging] = useState(initToevoeging);
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState<string | null>(foutmelding ?? null);
  const [gevonden, setGevonden] = useState<PdokAdres | null>(null);
  // Toont het handmatige invulblok als PDOK het adres niet vindt. Dat blok is
  // zelfstandig: eigen postcode + huisnummer (voorgevuld met wat hierboven is
  // getypt) zodat de bewoner het complete adres invult — de postcode is nodig
  // voor de regelingen.
  const [nietGevonden, setNietGevonden] = useState(!!foutmelding);
  const [mPostcode, setMPostcode] = useState(displayPostcode(initPostcode));
  const [mHuisnr, setMHuisnr] = useState(initHuisnummer);
  const [mToevoeging, setMToevoeging] = useState(initToevoeging);
  const [straat, setStraat] = useState("");
  const [stad, setStad] = useState("");
  const [mFout, setMFout] = useState<string | null>(null);
  const doorTimer = useRef<ReturnType<typeof setTimeout>>();
  const huisnummerRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => clearTimeout(doorTimer.current), []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (bezig || gevonden) return;
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

    setGevonden(adres);
    // Adres bevestigd = echte intentie; geen postcode/adres in het event (privacy).
    pushGtmEvent("subsidiecheck_start", { gemeente: adres.gemeentenaam, provincie: adres.provincienaam });
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // Korte beat zodat de bevestiging landt; met reduced motion direct door.
    doorTimer.current = setTimeout(
      () => onBevestigd(postcode.trim(), huisnummer.trim(), toevoeging.trim()),
      reduced ? 0 : 600,
    );
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
    onHandmatig(mPostcode.trim(), mHuisnr.trim(), mToevoeging.trim(), straat.trim(), stad.trim());
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid grid-cols-[2fr_1.2fr_1fr] gap-3">
        <div>
          <label htmlFor="sc-postcode" className="block mb-2 text-[14px] font-semibold text-foreground">
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
              const v = formatPostcode(e.target.value);
              setPostcode(v);
              setFout(null);
              setGevonden(null);
              // Volledige postcode getypt? Dan alvast door naar het huisnummer.
              if (POSTCODE_RE.test(v)) huisnummerRef.current?.focus();
            }}
            aria-invalid={!!fout}
            aria-describedby={fout ? "sc-adres-fout" : undefined}
            maxLength={7}
          />
        </div>
        <div>
          <label htmlFor="sc-huisnummer" className="block mb-2 text-[14px] font-semibold text-foreground">
            Huisnummer
          </label>
          <input
            id="sc-huisnummer"
            ref={huisnummerRef}
            name="huisnummer"
            type="text"
            inputMode="numeric"
            placeholder="12"
            className={inputClass}
            value={huisnummer}
            onChange={(e) => {
              setHuisnummer(e.target.value);
              setFout(null);
              setGevonden(null);
            }}
            maxLength={6}
          />
        </div>
        <div>
          <label htmlFor="sc-toevoeging" className="block mb-2 text-[14px] font-semibold text-foreground whitespace-nowrap">
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
              setGevonden(null);
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

      <div aria-live="polite">
        {gevonden && (
          <p className="mt-3 inline-flex items-center gap-2 text-[15px] font-medium text-primary">
            <Check size={18} strokeWidth={2.5} className="text-accent" aria-hidden="true" />
            {gevonden.straatnaam} {huisnummer.trim()}, {gevonden.woonplaatsnaam}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={bezig || !!gevonden}
        className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-full bg-accent px-7 py-3.5 text-[15px] font-semibold text-primary transition-colors hover:bg-accent-hover disabled:opacity-70 disabled:cursor-not-allowed min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {bezig ? (
          <>
            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            Adres zoeken…
          </>
        ) : gevonden ? (
          "Adres gevonden"
        ) : (
          "Verder"
        )}
      </button>

      {/* Handmatig adres invullen als PDOK het niet herkent (bv. nieuwbouw). */}
      {nietGevonden && (
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

      {/* Drie beloftes met vinkjes (zelfde patroon als de hero) — geen
          kleine lettertjes, maar geruststelling. */}
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
