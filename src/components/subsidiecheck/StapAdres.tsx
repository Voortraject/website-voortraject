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
}

// Stap 1: postcode + huisnummer. Na een geslaagde PDOK-lookup tonen we het
// gevonden adres kort ter bevestiging ("dit gaat echt over mijn huis") en
// gaan we automatisch door.
export const StapAdres = ({ initPostcode, initHuisnummer, initToevoeging, foutmelding, onBevestigd }: StapAdresProps) => {
  const [postcode, setPostcode] = useState(displayPostcode(initPostcode));
  const [huisnummer, setHuisnummer] = useState(initHuisnummer);
  const [toevoeging, setToevoeging] = useState(initToevoeging);
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState<string | null>(foutmelding ?? null);
  const [gevonden, setGevonden] = useState<PdokAdres | null>(null);
  const doorTimer = useRef<ReturnType<typeof setTimeout>>();
  const huisnummerRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => clearTimeout(doorTimer.current), []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (bezig || gevonden) return;
    setFout(null);

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
      setFout("We konden dit adres niet vinden — check even je postcode en huisnummer.");
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
