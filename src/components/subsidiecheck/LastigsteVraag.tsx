import { useRef, useState } from "react";
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
// Eerst aanvinken, dan één keer bevestigen. Automatisch bewaren na een pauze
// gaf bij rustig aanklikken drie, vier mails en een rij "Lastigst
// (bijgewerkt)"-blokken in `notities` (oktober 2026). Sinds eind oktober gaan de
// keuzes als lijst naar `subsidiecheck_lastigst` op de lead, zonder mail aan het
// team; het CRM toont ze als labels. Na het bevestigen staat de keuze vast.
// "Overslaan" stuurt niets. Testmodus regelt de verstuurfunctie zelf.

const OPTIES: { tekst: string; Icoon: LucideIcon }[] = [
  { tekst: "Door de bomen het bos niet meer zien", Icoon: Trees },
  { tekst: "De subsidies maximaal benutten", Icoon: Euro },
  { tekst: "Een betrouwbare uitvoerder vinden", Icoon: HardHat },
  { tekst: "Het papierwerk", Icoon: FileCheck },
];

interface LastigsteVraagProps {
  /** Bewaart de keuzes bij de lead, in optievolgorde (zie bewaarLastigst). */
  verstuur: (keuzes: string[]) => Promise<void>;
}

type Stand = "kiezen" | "bezig" | "bewaard" | "mislukt";

export const LastigsteVraag = ({ verstuur }: LastigsteVraagProps) => {
  const [gekozen, setGekozen] = useState<string[]>([]);
  const [stand, setStand] = useState<Stand>("kiezen");
  const [weg, setWeg] = useState<"nee" | "vervaagt" | "ja">("nee");
  const onderweg = useRef(false);
  const vast = stand === "bezig" || stand === "bewaard";

  const wissel = (tekst: string) => {
    if (vast) return;
    setGekozen((oud) => (oud.includes(tekst) ? oud.filter((t) => t !== tekst) : [...oud, tekst]));
    if (stand === "mislukt") setStand("kiezen");
  };

  // Altijd in de volgorde van de opties, niet in klikvolgorde, zodat het CRM
  // leest zoals de bewoner het zag.
  const bevestig = async () => {
    const keuze = OPTIES.map((o) => o.tekst).filter((t) => gekozen.includes(t));
    // Het slot is een ref en geen state: een dubbelklik komt binnen vóór de
    // volgende render, en zou anders twee mails geven.
    if (keuze.length === 0 || onderweg.current) return;
    onderweg.current = true;
    setStand("bezig");
    try {
      await verstuur(keuze);
      setStand("bewaard");
    } catch (err) {
      onderweg.current = false;
      // De aanvraag zelf is al binnen; dit is een extraatje. Wel loggen, en de
      // bewoner laten weten dat hij het nog eens kan proberen.
      console.error("Subsidiecheck: 'lastigst' bewaren faalde", err);
      setStand("mislukt");
    }
  };

  const overslaan = () => {
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
              aria-disabled={vast || undefined}
              onClick={() => wissel(tekst)}
              className={`rs-keuze flex min-h-[48px] w-full items-center gap-2.5 whitespace-nowrap rounded-[18px] px-3.5 py-3 text-left text-[14px] font-bold text-primary sm:text-[14.5px] ${
                aan ? "rs-keuze-aan" : ""
              } ${vast && !aan ? "opacity-50" : ""} ${vast ? "cursor-default" : ""}`}
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

      {stand === "bewaard" ? (
        <p role="status" className="mt-3.5 flex items-center gap-2 text-[15px] font-bold text-[hsl(var(--subsidie))]">
          <Check size={17} strokeWidth={3} aria-hidden="true" />
          Dank je, dit staat bij je aanvraag.
        </p>
      ) : (
        <>
          {stand === "mislukt" && (
            <p role="alert" className="mt-3 text-[14.5px] font-semibold text-destructive">
              Dat lukte niet. Probeer het nog eens.
            </p>
          )}
          <div className="mt-3.5 flex items-center gap-4">
            {gekozen.length > 0 && (
              <button
                type="button"
                onClick={bevestig}
                disabled={stand === "bezig"}
                className="hs-knop hs-knop-ink min-h-[46px] px-6 text-[15px]"
              >
                Bevestigen
              </button>
            )}
            <button
              type="button"
              onClick={overslaan}
              disabled={stand === "bezig"}
              className="rounded-sm px-0.5 py-1 text-[14px] font-semibold text-[hsl(var(--rs-tekst-zacht))] underline underline-offset-[3px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Overslaan
            </button>
          </div>
        </>
      )}
    </div>
  );
};
