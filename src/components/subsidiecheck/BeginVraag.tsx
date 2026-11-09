import { useRef, useState } from "react";
import { BrickWall, Check, CircleHelp, Fan, Grid2x2, House, Layers, type LucideIcon } from "lucide-react";

import { minderBeweging } from "./beweging";

// De vraag na "Je aanvraag is binnen": waar wil de bewoner mee beginnen?
//
// Deze vraag verving in november 2026 "Wat vind je het lastigst?". Daarop was
// elk antwoord iets wat wij toch al doen, en het overlapte met de tegels uit de
// poort. Dit antwoord geeft de beller een concrete opening en wijst naar de
// juiste uitvoerder. Hij staat ná de klik, dus hij kost de poort geen leads.
//
// Eén tik is meteen bewaard, dus er is geen knop nodig en er kan maar één
// bericht uit. Het antwoord gaat naar `gewenste_maatregelen`, die het CRM
// overneemt bij het omzetten naar een opdracht. "Weet ik nog niet" sturen we
// daarom niet mee: dat is geen maatregel. "Overslaan" stuurt ook niets.

const ONBEKEND = "Weet ik nog niet";

// `breed`: over de hele regel. Warmtepomp en vooral "Weet ik nog niet" passen
// op een smalle telefoon niet in een halve kolom.
const OPTIES: { tekst: string; Icoon: LucideIcon; breed?: boolean }[] = [
  { tekst: "Dak", Icoon: House },
  { tekst: "Muren", Icoon: BrickWall },
  { tekst: "Vloer", Icoon: Layers },
  { tekst: "Ramen", Icoon: Grid2x2 },
  { tekst: "Warmtepomp", Icoon: Fan, breed: true },
  { tekst: ONBEKEND, Icoon: CircleHelp, breed: true },
];

interface BeginVraagProps {
  /** Bewaart de gekozen maatregel bij de lead (zie bewaarBeginnen). */
  verstuur: (maatregel: string) => Promise<void>;
}

type Stand = "kiezen" | "bezig" | "bewaard" | "mislukt";

export const BeginVraag = ({ verstuur }: BeginVraagProps) => {
  const [gekozen, setGekozen] = useState<string | null>(null);
  const [stand, setStand] = useState<Stand>("kiezen");
  const [weg, setWeg] = useState<"nee" | "vervaagt" | "ja">("nee");
  const onderweg = useRef(false);
  const vast = stand === "bezig" || stand === "bewaard";

  const kies = async (tekst: string) => {
    // Het slot is een ref en geen state: een dubbele tik komt binnen vóór de
    // volgende render.
    if (vast || onderweg.current) return;
    setGekozen(tekst);
    if (tekst === ONBEKEND) {
      setStand("bewaard");
      return;
    }
    onderweg.current = true;
    setStand("bezig");
    try {
      await verstuur(tekst);
      setStand("bewaard");
    } catch (err) {
      onderweg.current = false;
      // De aanvraag zelf is al binnen; dit is een extraatje.
      console.error("Subsidiecheck: 'beginnen' bewaren faalde", err);
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
      <p id="sc-beginnen-titel" className="text-[15.5px] font-extrabold text-primary">
        Waar wil je mee beginnen?
      </p>
      <p className="mt-0.5 text-[14.5px] text-[hsl(var(--rs-tekst-zacht))]">Dan kunnen we daar meteen op ingaan.</p>

      <div role="radiogroup" aria-labelledby="sc-beginnen-titel" className="mt-3 grid grid-cols-2 gap-2 max-sm:-mx-1.5">
        {OPTIES.map(({ tekst, Icoon, breed }) => {
          const aan = gekozen === tekst;
          return (
            <button
              key={tekst}
              type="button"
              role="radio"
              aria-checked={aan}
              aria-disabled={vast || undefined}
              onClick={() => kies(tekst)}
              className={`rs-keuze flex min-h-[48px] w-full items-center gap-2.5 whitespace-nowrap rounded-[18px] px-3.5 py-3 text-left text-[14px] font-bold text-primary sm:text-[14.5px] ${
                breed ? "col-span-2" : ""
              } ${aan ? "rs-keuze-aan" : ""} ${vast && !aan ? "opacity-50" : ""} ${vast ? "cursor-default" : ""}`}
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
          <div className="mt-3.5">
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
