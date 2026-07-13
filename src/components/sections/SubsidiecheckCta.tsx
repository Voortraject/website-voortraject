import { FormEvent, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";

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
    navigate(
      `/subsidiecheck?pc=${encodeURIComponent(normalizePostcode(pc))}&hn=${encodeURIComponent(hn)}` +
        (tv ? `&tv=${encodeURIComponent(tv)}` : ""),
    );
  };

  return (
    <section className="section-pad-home bg-secondary" aria-labelledby="subsidiecheck-cta-titel">
      <div className="container-home">
        <div className="mx-auto text-center" style={{ maxWidth: 720 }}>
          <h2 id="subsidiecheck-cta-titel" className="h2-section">
            Ontdek welke subsidies er voor <span className="text-accent">jouw woning</span> zijn
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-foreground/80 md:text-[16px]">
            Vul je postcode in en zie in één overzicht alle regelingen: landelijk, provinciaal én van jouw
            gemeente.
          </p>

          <form onSubmit={handleSubmit} noValidate className="mx-auto mt-7" style={{ maxWidth: 640 }}>
            {/* Elke input een eigen subtiel vlak in de huiskleur van de
                Herkenning-sectie (#F5F3ED), zodat postcode en huisnummer als
                duidelijke lichte velden lezen binnen de navy pill. */}
            <div className="flex flex-col gap-2 rounded-2xl bg-primary p-2 shadow-card sm:flex-row sm:items-center sm:rounded-full">
              <label className="sr-only" htmlFor="home-sc-postcode">
                Postcode
              </label>
              <input
                id="home-sc-postcode"
                type="text"
                autoComplete="postal-code"
                placeholder="Postcode"
                className="min-h-[48px] w-full rounded-xl bg-[#F5F3ED] px-5 text-center text-[16px] text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:bg-white focus:shadow-[inset_0_0_0_2px_hsl(var(--accent)/0.55)] sm:w-40 sm:rounded-full lg:text-[15px]"
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
                className="min-h-[48px] w-full rounded-xl bg-[#F5F3ED] px-4 text-center text-[16px] text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:bg-white focus:shadow-[inset_0_0_0_2px_hsl(var(--accent)/0.55)] sm:w-28 sm:rounded-full lg:text-[15px]"
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
                className="min-h-[48px] w-full rounded-xl bg-[#F5F3ED] px-4 text-center text-[16px] text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:bg-white focus:shadow-[inset_0_0_0_2px_hsl(var(--accent)/0.55)] sm:w-24 sm:rounded-full lg:text-[15px]"
                value={toevoeging}
                onChange={(e) => {
                  setToevoeging(e.target.value);
                  setFout(null);
                }}
                maxLength={10}
              />
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

          {/* Drie beloftes met vinkjes — zelfde patroon als de hero. */}
          <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            {["Gratis", "Geen account nodig", "Klaar in 1 minuut"].map((belofte) => (
              <li key={belofte} className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground">
                <Check size={14} strokeWidth={2.5} className="shrink-0 text-accent" aria-hidden="true" />
                {belofte}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
