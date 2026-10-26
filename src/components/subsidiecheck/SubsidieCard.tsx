import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ArrowRight, CalendarClock, ChevronDown, Euro, Info, Percent, type LucideIcon } from "lucide-react";

import { formateerDatum, looptBinnenkortAf, TYPE_LABELS, type SubsidieRegeling } from "@/lib/subsidies";

import { minderBeweging } from "./beweging";
import { TYPE_BADGE, TYPE_TEKST, TYPE_VLAK } from "./niveauKleuren";
import { useBreed } from "./useBreed";

// Alleen de eerste zin: de kaart moet in één oogopslag zeggen wat het is.
const eersteZin = (s: string) => s.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? s;

// De maatregelregel ("Alleen isolatie en glas") staat er alleen als hij een
// béperking is (zie beperktTotVan in energiesubsidiewijzerApi.ts): dat is
// precies wat iemand moet weten die met een warmtepomp in zijn hoofd naar een
// isolatiesubsidie kijkt. Alles opsommen werd een waslijst.

// Elke melding op de kaart heeft dezelfde vorm: een icoon, vetgedrukt "Let op:"
// en dan de mededeling. Het icoon verschilt wél, want dát vertelt wat voor
// melding het is. Bewust geen gevuld vlak: dat leest als een knop.
const Melding = ({ icoon: Icoon, children }: { icoon: LucideIcon; children: ReactNode }) => (
  <p className="mt-2.5 flex items-start gap-1.5 text-[14px] leading-snug text-primary">
    <Icoon size={15} strokeWidth={2} aria-hidden="true" className="mt-[2px] shrink-0" />
    <span>
      <span className="font-semibold">Let op: </span>
      {children}
    </span>
  </p>
);

/**
 * Open en dicht met beweging. De inhoud staat alleen in de DOM als hij open is
 * (of nog aan het dichtgaan), zodat hij dicht ook voor schermlezers en zoeken
 * echt weg is. Bij openen eerst dicht renderen en één frame later open zetten,
 * anders valt er niets te animeren.
 */
function useUitklap() {
  const [open, setOpen] = useState(false);
  const [gemount, setGemount] = useState(false);
  const [zichtbaar, setZichtbaar] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), []);

  useEffect(() => {
    clearTimeout(timer.current);
    if (open) {
      setGemount(true);
      if (minderBeweging() || typeof requestAnimationFrame !== "function") setZichtbaar(true);
      else requestAnimationFrame(() => requestAnimationFrame(() => setZichtbaar(true)));
    } else {
      setZichtbaar(false);
      if (minderBeweging()) setGemount(false);
      else timer.current = setTimeout(() => setGemount(false), 550);
    }
  }, [open]);

  return { open, setOpen, gemount, zichtbaar };
}

// Eén regeling in het resultaat. Gesloten toont de kaart alles om te beslissen:
// soort, bedrag groot in de soortkleur, titel en de omschrijving. De uitklap
// geeft verdieping (voor wie, voorwaarde, officiële bron): beslissen, begrijpen,
// verifiëren.
export const SubsidieCard = ({ regeling }: { regeling: SubsidieRegeling }) => {
  const { open, setOpen, gemount, zichtbaar } = useUitklap();
  const regionId = useId();
  const eindigtBinnenkort = looptBinnenkortAf(regeling.looptAfOp);
  const BadgeIcoon = regeling.type === "lening" ? Percent : Euro;
  // Op de telefoon alleen de eerste zin op de dichte kaart; de rest staat in de
  // uitklap. Zo blijft de lijst kort en komt de volgende regeling eerder in beeld.
  const breed = useBreed();
  const kort = breed ? regeling.omschrijving : eersteZin(regeling.omschrijving);
  const restInUitklap = !breed && kort !== regeling.omschrijving;

  return (
    <article className={`rs-kaart ${TYPE_VLAK[regeling.type]} px-5 pb-3.5 pt-4 md:px-6 md:pb-4 md:pt-6`}>
      {/* Soort en bedrag links, het ronde icoon rechts: zo scan je verticaal
          langs de bedragen en leest een lening nooit als subsidie. */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`text-[12px] font-extrabold uppercase tracking-[0.07em] ${TYPE_TEKST[regeling.type]}`}>
            {TYPE_LABELS[regeling.type]}
          </p>
          {regeling.bedragIndicatie && (
            <p
              className={`mt-0.5 font-display text-[21px] font-extrabold leading-tight tracking-[-0.01em] md:mt-1 md:text-[26px] ${TYPE_TEKST[regeling.type]}`}
            >
              {regeling.bedragIndicatie}
            </p>
          )}
        </div>
        <span className={`rs-badge ${TYPE_BADGE[regeling.type]}`} aria-hidden="true">
          <BadgeIcoon size={18} strokeWidth={2.2} />
        </span>
      </div>

      <h3 className="mt-2.5 font-display text-[17px] font-bold leading-snug text-primary md:mt-3 md:text-[19px]">
        {regeling.titel}
      </h3>
      {/* Bewust "Alleen X" en niet "Alleen voor X": de labels van Milieu
          Centraal zijn niet allemaal zelfstandige naamwoorden ("asbest
          verwijderen"), en na "voor" leest zo'n label krom. */}
      {regeling.beperktTot && (
        <p className="mt-1.5 text-[14px] font-bold text-primary">Alleen {regeling.beperktTot}</p>
      )}
      {/* Een voorwaarde die we niet uit het adres halen ("Alleen als je woning
          in het versterkingsprogramma van de NCG zit"). Staat vóór de uitklap:
          zonder deze regel leest het bedrag erboven als een belofte. */}
      {regeling.alleenAls && (
        <p className="mt-1.5 text-[14px] font-bold text-primary">Alleen als {regeling.alleenAls}</p>
      )}

      <p className="mt-1.5 text-[14.5px] leading-relaxed text-[hsl(var(--rs-tekst-zacht))] lg:mt-2 lg:text-[15px]">{kort}</p>

      {/* Einddatum, alleen als hij binnen drie maanden valt. De bron zet op de
          meeste regelingen 2050 neer, dus een datum die hier verschijnt is een
          echte deadline. */}
      {eindigtBinnenkort && regeling.looptAfOp && (
        <Melding icoon={CalendarClock}>aanvragen kan tot {formateerDatum(regeling.looptAfOp)}.</Melding>
      )}

      {/* "Let op" komt letterlijk van de bron en is zeldzaam, maar lang (bij ISDE
          428 tekens). Op de kaart alleen dát er iets is; de tekst staat bovenaan
          de uitklap. */}
      {regeling.letOp && <Melding icoon={Info}>er geldt een uitzondering, zie de voorwaarden.</Melding>}

      <div className="mt-3 flex items-center justify-between gap-3 md:mt-4">
        <span className="min-w-0 text-[14px] font-semibold leading-snug text-[hsl(var(--rs-tekst-zacht))]">
          {regeling.aanbieder}
        </span>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={regionId}
          className="rs-knop inline-flex min-h-[40px] shrink-0 gap-1.5 bg-card/70 px-3.5 py-2 text-[14px] font-bold text-primary hover:bg-card"
        >
          {open ? "Minder tonen" : "Bekijk voorwaarden"}
          <ChevronDown size={16} strokeWidth={2.2} className="rs-chevron" aria-hidden="true" />
        </button>
      </div>

      {gemount && (
        <div id={regionId} className="rs-uitklap" data-open={zichtbaar}>
          <div>
            <div className="rs-uitklap-binnen mt-3.5 grid gap-2.5 rounded-2xl bg-card/75 p-4 text-[15px] leading-relaxed">
              {restInUitklap && <p className="text-foreground">{regeling.omschrijving}</p>}
              {regeling.letOp && (
                <p className="text-foreground">
                  <span className="font-semibold text-primary">Let op: </span>
                  {regeling.letOp}
                </p>
              )}
              {regeling.bedragToelichting && (
                <p>
                  <span className="font-semibold text-primary">Bedrag: </span>
                  <span className="text-foreground">{regeling.bedragToelichting}</span>
                </p>
              )}
              {regeling.voorWie && (
                <p>
                  <span className="font-semibold text-primary">Voor wie: </span>
                  <span className="text-foreground">{regeling.voorWie}</span>
                </p>
              )}
              {regeling.belangrijksteVoorwaarde && (
                <p>
                  <span className="font-semibold text-primary">Belangrijkste voorwaarde: </span>
                  <span className="text-foreground">{regeling.belangrijksteVoorwaarde}</span>
                </p>
              )}
              <a
                href={regeling.bronUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rs-met-pijl inline-flex items-center gap-1.5 self-start rounded-sm font-bold text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                aria-label={`Naar de officiële regeling: ${regeling.titel} (opent in nieuw tabblad)`}
              >
                Naar de officiële regeling
                <ArrowRight size={15} strokeWidth={2.2} className="rs-pijl" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};
