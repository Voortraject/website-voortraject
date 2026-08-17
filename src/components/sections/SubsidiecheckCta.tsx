import { FormEvent, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";

import { SUBSIDIECHECK_BELOFTES } from "@/config/beloftes";
import { normalizePostcode, POSTCODE_RE } from "@/lib/pdok";

// Typt mee met de gebruiker: hoofdletters, alleen geldige tekens.
const formatPostcode = (v: string) => v.toUpperCase().replace(/[^0-9A-Z ]/g, "").slice(0, 7);

// Instappunt van de subsidiecheck op de homepage, direct onder de trustbar
// ("We werken met alle officiële regelingen" — de check is het bewijs van die
// claim). Eén samengesteld invoerveld: postcode + huisnummer + knop in één
// pill. De flow start hier en gaat verder op /subsidiecheck.
export const SubsidiecheckCta = () => {
  const navigate = useNavigate();
  const [postcode, setPostcode] = useState("");
  const [huisnummer, setHuisnummer] = useState("");
  const [toevoeging, setToevoeging] = useState("");
  const [fout, setFout] = useState<string | null>(null);
  const huisnummerRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const pc = postcode.trim();
    const hn = huisnummer.trim();
    if (!POSTCODE_RE.test(pc)) {
      setFout("Vul een geldige postcode in, bijvoorbeeld 9711 AB.");
      return;
    }
    if (!/^[0-9]/.test(hn)) {
      setFout("Vul ook je huisnummer in.");
      return;
    }
    const tv = toevoeging.trim();
    // `type` erbij betekent: stap 1 is hiermee klaar, de bezoeker komt direct op
    // "Je gegevens" uit. Wie hier zijn adres invult heeft de vraag van stap 1 al
    // beantwoord; die daar tóch nog een keer neerzetten kost een klik zonder dat
    // er iets te kiezen valt. De standaardsituatie (woningeigenaar) en alle
    // maatregelen zijn precies wat stap 1 zou hebben ingevuld: die stap staat
    // standaard op woningeigenaar en zonder m-parameter zoeken we op alles.
    //
    // Afwijken kan verderop gewoon: stap 1 blijft aanklikbaar in de
    // voortgangsbalk, en op het resultaat staat "situatie aanpassen".
    navigate(
      `/subsidiecheck?pc=${encodeURIComponent(normalizePostcode(pc))}&hn=${encodeURIComponent(hn)}` +
        (tv ? `&tv=${encodeURIComponent(tv)}` : "") +
        "&type=woningeigenaar",
    );
  };

  return (
    <section className="section-pad-home bg-secondary" aria-labelledby="subsidiecheck-cta-titel">
      <div className="container-home">
        <div className="mx-auto text-center" style={{ maxWidth: 720 }}>
          <h2 id="subsidiecheck-cta-titel" className="h2-section">
            Ontdek welke subsidies er voor <span className="text-accent">jouw woning</span> zijn
          </h2>

          <form onSubmit={handleSubmit} noValidate className="mx-auto mt-7" style={{ maxWidth: 640 }}>
            {/* Elke input een wit vlak, zodat postcode, huisnummer en toevoeging
                als heldere velden lezen binnen de navy pill. */}
            <div className="flex flex-col gap-2 rounded-2xl bg-primary p-2 shadow-card sm:flex-row sm:items-center sm:rounded-full">
              {/* Op mobiel één rij: postcode de helft, huisnummer en toevoeging elk
                  een kwart. Op sm+ lost de wrapper op (contents) zodat de drie velden
                  weer directe flex-items van de pill zijn, zoals op desktop. */}
              <div className="flex w-full items-center gap-2 sm:contents">
              <label className="sr-only" htmlFor="home-sc-postcode">
                Postcode
              </label>
              <input
                id="home-sc-postcode"
                type="text"
                autoComplete="postal-code"
                placeholder="Postcode"
                className="min-h-[48px] min-w-0 flex-[2] rounded-xl bg-white px-3 text-center text-[16px] text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:shadow-[inset_0_0_0_2px_hsl(var(--accent)/0.55)] sm:w-40 sm:flex-none sm:px-5 sm:rounded-full lg:text-[15px]"
                value={postcode}
                onChange={(e) => {
                  const v = formatPostcode(e.target.value);
                  setPostcode(v);
                  setFout(null);
                  // Volledige postcode getypt? Dan alvast door naar het huisnummer.
                  if (POSTCODE_RE.test(v)) huisnummerRef.current?.focus();
                }}
                maxLength={7}
                aria-invalid={!!fout}
                aria-describedby={fout ? "home-sc-fout" : undefined}
              />
              <label className="sr-only" htmlFor="home-sc-huisnummer">
                Huisnummer
              </label>
              <input
                id="home-sc-huisnummer"
                ref={huisnummerRef}
                type="text"
                inputMode="numeric"
                placeholder="Huisnr."
                className="min-h-[48px] min-w-0 flex-1 rounded-xl bg-white px-2 text-center text-[16px] text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:shadow-[inset_0_0_0_2px_hsl(var(--accent)/0.55)] sm:w-28 sm:flex-none sm:px-4 sm:rounded-full lg:text-[15px]"
                value={huisnummer}
                onChange={(e) => {
                  setHuisnummer(e.target.value);
                  setFout(null);
                }}
                maxLength={6}
              />
              <label className="sr-only" htmlFor="home-sc-toevoeging">
                Toevoeging (optioneel)
              </label>
              <input
                id="home-sc-toevoeging"
                type="text"
                placeholder="Toev."
                className="min-h-[48px] min-w-0 flex-1 rounded-xl bg-white px-2 text-center text-[16px] text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:shadow-[inset_0_0_0_2px_hsl(var(--accent)/0.55)] sm:w-24 sm:flex-none sm:px-4 sm:rounded-full lg:text-[15px]"
                value={toevoeging}
                onChange={(e) => {
                  setToevoeging(e.target.value);
                  setFout(null);
                }}
                maxLength={10}
              />
              </div>
              <button
                type="submit"
                className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-accent px-6 py-3 text-[15px] font-semibold text-primary transition-colors hover:bg-accent-hover sm:rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Bekijk mijn subsidies
                <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
              </button>
            </div>
            {fout && (
              <p id="home-sc-fout" role="alert" className="mt-2 text-[14px] text-destructive">
                {fout}
              </p>
            )}
          </form>

          {/* Drie beloftes met vinkjes — zelfde patroon als de hero. De teksten
              staan in src/config/beloftes.ts, gedeeld met stap 1 van de check,
              met daar de toelichting waarom ze zijn zoals ze zijn. */}
          <ul className="mt-5 flex flex-nowrap items-center justify-center gap-x-2.5 sm:gap-x-5">
            {SUBSIDIECHECK_BELOFTES.map((belofte) => (
              <li
                key={belofte}
                className="inline-flex items-center gap-1 whitespace-nowrap text-[12px] text-muted-foreground sm:gap-2 sm:text-[15px]"
              >
                <Check
                  size={16}
                  strokeWidth={2.5}
                  className="h-3.5 w-3.5 shrink-0 text-accent sm:h-4 sm:w-4"
                  aria-hidden="true"
                />
                {belofte}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
