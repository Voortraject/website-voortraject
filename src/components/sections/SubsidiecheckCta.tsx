import { FormEvent, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Check, ChevronDown } from "lucide-react";

import { SUBSIDIECHECK_BELOFTES } from "@/config/beloftes";
import { normalizePostcode, POSTCODE_RE } from "@/lib/pdok";
import { BEWONERTYPE_MEERVOUD } from "@/lib/subsidies";

// Typt mee met de gebruiker: hoofdletters, alleen geldige tekens.
const formatPostcode = (v: string) => v.toUpperCase().replace(/[^0-9A-Z ]/g, "").slice(0, 7);

// Instappunt van de subsidiecheck op de homepage, direct onder de trustbar
// ("We werken met alle officiële regelingen" — de check is het bewijs van die
// claim). Dezelfde instaptegel als stap 1 van de tool: drie velden en de oker
// knop in één lichte tegel. De flow start hier en gaat verder op /subsidiecheck.
// Staat ook op /verduurzamen en op de maatregelpagina's (MaatregelPagina).
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

  // "Aanpassen": naar stap 1 met de keuzes al uitgeklapt. Op de homepage zelf
  // uitklappen kan niet zonder de tegel uit elkaar te trekken, en het hoort ook
  // niet hier thuis: de keuzes staan al op stap 1, inclusief de uitleg eromheen.
  //
  // `sit=1` is dezelfde route als "situatie aanpassen" op het resultaat en zet
  // op stap 1 zowel "Ik ben…" als "Waar ben je in geïnteresseerd?" open. Bewust
  // géén `type`: die parameter rondt stap 1 juist af, en hier wil de bezoeker er
  // nu net wél zijn.
  //
  // Wat er al getypt staat gaat mee, ook een half adres: dan staan de velden op
  // stap 1 voorgevuld in plaats van leeg. Geen validatie dus, want dit is geen
  // verzendknop; wie hier klikt is nog aan het kiezen.
  const naarKeuzes = () => {
    const params = new URLSearchParams();
    const pc = postcode.trim();
    const hn = huisnummer.trim();
    const tv = toevoeging.trim();
    if (pc) params.set("pc", POSTCODE_RE.test(pc) ? normalizePostcode(pc) : pc);
    if (hn) params.set("hn", hn);
    if (tv) params.set("tv", tv);
    params.set("sit", "1");
    navigate(`/subsidiecheck?${params.toString()}`);
  };

  // Velden: wit en zacht verzonken, zoals op stap 1 van de tool (.instap-invoer
  // in src/index.css). 16px voorkomt dat iOS inzoomt bij het tikken.
  const veldClass =
    "instap-invoer w-full min-w-0 min-h-[54px] px-3 text-center text-[16px] font-semibold";

  return (
    <section className="bg-background py-[52px] md:py-[88px]" aria-labelledby="subsidiecheck-cta-titel">
      <div className="container-home">
        <h2 id="subsidiecheck-cta-titel" className="hs-h2 mx-auto max-w-[720px] text-center">
          Ontdek welke subsidies er voor <span className="hs-accent">jouw woning</span> zijn
        </h2>

        {/* Dezelfde instaptegel als stap 1 van de tool: zacht blauw verloop naar
            wit, schaduw in plaats van rand, witte verzonken velden. */}
        <form onSubmit={handleSubmit} noValidate className="mx-auto mt-6 max-w-[680px] sm:mt-8">
          <div className="hs-tegel hs-blauw-zacht p-[18px] sm:p-[26px]">
            {/* Op de telefoon de drie velden op één rij en de knop eronder, op
                desktop velden en knop samen op één rij. */}
            <div className="grid grid-cols-[1.15fr_0.95fr_0.95fr] gap-2 md:grid-cols-[1.2fr_0.85fr_0.85fr_auto] md:gap-2.5">
              <label className="sr-only" htmlFor="home-sc-postcode">
                Postcode
              </label>
              <input
                id="home-sc-postcode"
                type="text"
                autoComplete="postal-code"
                placeholder="Postcode"
                className={veldClass}
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
                className={veldClass}
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
                className={veldClass}
                value={toevoeging}
                onChange={(e) => {
                  setToevoeging(e.target.value);
                  setFout(null);
                }}
                maxLength={10}
              />
              <button
                type="submit"
                className="hs-knop hs-knop-oker col-span-full min-h-[56px] text-[16.5px] md:col-span-1 md:min-h-[54px]"
              >
                Bekijk mijn subsidies
                <ArrowRight size={17} strokeWidth={2.2} className="hs-pijl" aria-hidden="true" />
              </button>
            </div>
            {fout && (
              <p id="home-sc-fout" role="alert" className="mt-3 text-[14px] text-destructive">
                {fout}
              </p>
            )}

            {/* Dezelfde zin als op stap 1, en om dezelfde reden: de check zoekt
                hier op een standaard (woningeigenaar, alle maatregelen) en dat
                hoort de bezoeker te weten vóórdat hij zijn overzicht krijgt, niet
                pas als het er staat. Nu de knop rechtstreeks naar de gegevensstap
                gaat is dit de enige plek waar dat nog voorbijkomt.
                Tekst en toon bewust letterlijk gelijk aan StapAdres. */}
            <p className="hs-tekst mt-4 text-center text-[14.5px] leading-normal">
              We zoeken voor {BEWONERTYPE_MEERVOUD.woningeigenaar} op alle maatregelen.{" "}
              <button
                type="button"
                onClick={naarKeuzes}
                className="inline-flex items-center gap-1 rounded-sm font-extrabold text-primary underline underline-offset-4 transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                Aanpassen
                <ChevronDown size={13} aria-hidden="true" />
              </button>
            </p>
          </div>

          {/* Drie beloftes met groene vinkjes, zoals op stap 1. De teksten
              staan in src/config/beloftes.ts, gedeeld met stap 1 van de check,
              met daar de toelichting waarom ze zijn zoals ze zijn. */}
          <ul className="mt-[18px] flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            {SUBSIDIECHECK_BELOFTES.map((belofte) => (
              <li
                key={belofte}
                className="hs-tekst inline-flex items-center gap-1.5 whitespace-nowrap text-[14px] font-bold"
              >
                <Check
                  size={15}
                  strokeWidth={2.6}
                  className="shrink-0 text-instap-subsidie"
                  aria-hidden="true"
                />
                {belofte}
              </li>
            ))}
          </ul>
        </form>
      </div>
    </section>
  );
};
