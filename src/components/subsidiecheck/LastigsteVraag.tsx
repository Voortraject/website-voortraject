import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Euro, FileCheck, HardHat, Trees, type LucideIcon } from "lucide-react";

import { minderBeweging } from "./beweging";

// De vraag na "Je aanvraag is binnen": wat vindt de bewoner het lastigst?
//
// Gekozen na onderzoek (zie het instap-artifact van oktober 2026): een vraag
// naar de drempel geeft het team een opening waar het meteen een antwoord
// tegenover kan zetten ("Je gaf aan dat het papierwerk tegenzit …"). Hij staat
// ná de klik, dus hij kost de gegevens-poort geen aanmeldingen: wie hier komt,
// heeft net zelf om hulp gevraagd. Meer antwoorden mag, overslaan ook.
//
// Bewaren gebeurt zonder knop, maar niet per tik. De route "bericht" zet elk
// bericht als eigen blok (met datumkopje) in `notities` en mailt het team. Per
// tik opslaan gaf dus een stapel blokken en mails. Daarom: bewaren zodra er
// OPSLAAN_NA_MS niets meer is aangetikt, en daarna alleen nog als de keuze echt
// verandert, als "Lastigst (bijgewerkt): …". "Overslaan" bewaart een
// openstaande keuze meteen. Testmodus regelt de verstuurfunctie zelf.

export const OPSLAAN_NA_MS = 2000;

const OPTIES: { tekst: string; Icoon: LucideIcon }[] = [
  { tekst: "Door de bomen het bos niet meer zien", Icoon: Trees },
  { tekst: "De subsidies maximaal benutten", Icoon: Euro },
  { tekst: "Een betrouwbare uitvoerder vinden", Icoon: HardHat },
  { tekst: "Het papierwerk", Icoon: FileCheck },
];

interface LastigsteVraagProps {
  /** Bewaart de regel bij de lead (zie stuurSessieBericht). */
  verstuur: (bericht: string) => Promise<void>;
}

export const LastigsteVraag = ({ verstuur }: LastigsteVraagProps) => {
  const [gekozen, setGekozen] = useState<string[]>([]);
  const [weg, setWeg] = useState<"nee" | "vervaagt" | "ja">("nee");
  const laatstBewaard = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const huidig = useRef<string[]>([]);

  // Altijd in de volgorde van de opties, niet in klikvolgorde, zodat het CRM
  // leest zoals de bewoner het zag.
  const bewaar = useCallback(() => {
    clearTimeout(timer.current);
    const keuze = OPTIES.map((o) => o.tekst).filter((t) => huidig.current.includes(t));
    const sleutel = keuze.join(", ");
    if (keuze.length === 0 || sleutel === laatstBewaard.current) return;
    const kop = laatstBewaard.current === null ? "Lastigst" : "Lastigst (bijgewerkt)";
    laatstBewaard.current = sleutel;
    verstuur(`${kop}: ${sleutel}`).catch((err) => {
      // Stil: de bewoner heeft zijn aanvraag al gedaan, en dit is een extraatje.
      // Wel loggen, zodat een storing zichtbaar is.
      console.error("Subsidiecheck: 'lastigst' bewaren faalde", err);
      laatstBewaard.current = null;
    });
  }, [verstuur]);

  // Bij het verlaten van het scherm een openstaande keuze nog meenemen.
  useEffect(
    () => () => {
      if (timer.current) bewaar();
    },
    [bewaar],
  );

  const wissel = (tekst: string) => {
    const nieuw = gekozen.includes(tekst) ? gekozen.filter((t) => t !== tekst) : [...gekozen, tekst];
    huidig.current = nieuw;
    setGekozen(nieuw);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      timer.current = undefined;
      bewaar();
    }, OPSLAAN_NA_MS);
  };

  const overslaan = () => {
    if (timer.current) bewaar();
    timer.current = undefined;
    if (minderBeweging()) {
      setWeg("ja");
      return;
    }
    setWeg("vervaagt");
    setTimeout(() => setWeg("ja"), 420);
  };

  if (weg === "ja") return null;

  return (
    <div
      className={`transition-[opacity,transform] duration-[400ms] ease-out ${
        weg === "vervaagt" ? "-translate-y-1 opacity-0" : "opacity-100"
      }`}
    >
      <p id="sc-lastigst-titel" className="text-[15.5px] font-extrabold text-primary">
        Wat vind je het lastigst?
      </p>
      <p className="mt-0.5 text-[14.5px] text-[hsl(var(--rs-tekst-zacht))]">
        Kies er gerust meer. Dan kunnen we daar meteen op ingaan.
      </p>

      <div
        role="group"
        aria-labelledby="sc-lastigst-titel"
        className="mt-3 grid gap-2 max-sm:-mx-1.5"
      >
        {OPTIES.map(({ tekst, Icoon }) => {
          const aan = gekozen.includes(tekst);
          return (
            <button
              key={tekst}
              type="button"
              role="checkbox"
              aria-checked={aan}
              onClick={() => wissel(tekst)}
              className={`rs-keuze flex min-h-[48px] w-full items-center gap-2.5 whitespace-nowrap rounded-[18px] px-3.5 py-3 text-left text-[14px] font-bold text-primary sm:text-[14.5px] ${
                aan ? "rs-keuze-aan" : ""
              }`}
            >
              <span className="relative grid h-[22px] w-[22px] shrink-0 place-items-center" aria-hidden="true">
                {aan ? (
                  <span className="rs-badge rs-badge-ink rs-badge-mini rs-pop">
                    <Check size={13} strokeWidth={3} />
                  </span>
                ) : (
                  <Icoon size={19} strokeWidth={1.8} />
                )}
              </span>
              {tekst}
            </button>
          );
        })}
      </div>

      {gekozen.length > 0 && (
        <p role="status" className="mt-3.5 flex items-center gap-2 text-[15px] font-bold text-[hsl(var(--subsidie))]">
          <Check size={17} strokeWidth={3} aria-hidden="true" />
          Dank je, dit staat bij je aanvraag.
        </p>
      )}
      <button
        type="button"
        onClick={overslaan}
        className="mt-2.5 rounded-sm px-0.5 py-1 text-[14px] font-semibold text-[hsl(var(--rs-tekst-zacht))] underline underline-offset-[3px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Overslaan
      </button>
    </div>
  );
};
