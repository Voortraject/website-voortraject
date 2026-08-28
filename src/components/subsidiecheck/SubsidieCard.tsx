import { useId, useState, type ReactNode } from "react";
import { CalendarClock, ChevronDown, ExternalLink, Info, type LucideIcon } from "lucide-react";

import { formateerDatum, looptBinnenkortAf, TYPE_LABELS, type SubsidieRegeling } from "@/lib/subsidies";

import { TYPE_KAART, TYPE_PILL } from "./niveauKleuren";

// De maatregelregel is terug, maar alleen waar hij iets zegt.
//
// Hij stond hier eerder en is weggehaald omdat de scrape per regeling geen
// maatregelen leverde: `regeling.maatregelen` bevatte dan altijd alle acht en
// elke kaart kreeg dezelfde onjuiste zin. De officiële API levert ze wél. Maar
// alles opsommen is nog steeds verkeerd: gemeten over Noord-Nederland dekt de
// helft van de regelingen er drie tot zeven, en dan wordt het een waslijst die
// niets toevoegt aan de omschrijving erboven.
//
// Daarom tonen we hem alleen als hij een béperking is (zie beperktTotVan in
// energiesubsidiewijzerApi.ts): dat is precies wat iemand moet weten die met een
// warmtepomp in zijn hoofd naar een isolatiesubsidie kijkt. Vijftien van de
// vijfendertig regelingen in het noorden vallen daaronder, bijna allemaal
// "alleen voor isolatie en glas".

// Elke melding op de kaart heeft dezelfde vorm: een icoon, vetgedrukt "Let op:"
// en dan de mededeling. Zo ziet een bezoeker meteen dat er iets is dat hij moet
// weten, of het nu om een deadline of om een uitzondering gaat, en hoeft hij
// niet per regel opnieuw uit te vinden wat voor soort regel dit is. Het icoon
// verschilt wél, want dát vertelt wat vóór melding het is.
//
// Bewust geen pill: een gevuld vlak met ronde hoeken leest als een knop en hier
// valt niets te klikken. Zelfde afweging als bij het feitje op stap 1, zie de
// toelichting in StapAdres.tsx.
const Melding = ({ icoon: Icoon, children }: { icoon: LucideIcon; children: ReactNode }) => (
  <p className="mt-2 flex items-start gap-1.5 text-[13px] leading-snug text-primary">
    <Icoon size={14} strokeWidth={2} aria-hidden="true" className="mt-[3px] shrink-0 text-accent" />
    <span>
      <span className="font-semibold">Let op: </span>
      {children}
    </span>
  </p>
);

// Eén regeling in het resultaat. Gesloten toont de kaart alles om te beslissen
// (type, titel, bedrag rechtsboven, één regel uitleg, maatregelen). De uitklap
// geeft verdieping (voor wie, voorwaarde, officiële bron) volgens het
// drielagenmodel: beslissen → begrijpen → verifiëren. De linkerrand en de pill
// in de type-kleur (groen = subsidie, terracotta = lening) maken meteen duidelijk
// of het geld is dat je krijgt of leent.
export const SubsidieCard = ({ regeling }: { regeling: SubsidieRegeling }) => {
  const [open, setOpen] = useState(false);
  const regionId = useId();

  const eindigtBinnenkort = looptBinnenkortAf(regeling.looptAfOp);

  return (
    // Mobiel iets krapper: met elf kaarten onder elkaar telt elke geschrapte
    // pixel dubbel. Op md+ blijft de kaart ruim.
    <article className={`rounded-lg border border-l-4 p-4 shadow-card md:p-5 ${TYPE_KAART[regeling.type]}`}>
      {/* Kicker (type) links, bedrag rechts — vaste plek, zodat je verticaal
          langs de bedragen kunt scannen en een lening nooit als subsidie leest. */}
      <div className="flex items-start justify-between gap-4">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] ${TYPE_PILL[regeling.type]}`}
        >
          {TYPE_LABELS[regeling.type]}
        </span>
        {regeling.bedragIndicatie && (
          <span className="whitespace-nowrap text-right text-[15px] font-semibold text-primary">
            {regeling.bedragIndicatie}
          </span>
        )}
      </div>

      <h3 className="mt-2 font-display text-[17px] font-semibold leading-snug text-primary md:text-[18px]">
        {regeling.titel}
      </h3>
      {/* Alleen als de regeling maar één of twee maatregelen dekt: dan is het
          een beperking en hoort hij vóór de klik te staan, niet in de uitklap. */}
      {regeling.beperktTot && (
        <p className="mt-1.5 text-[13px] font-medium text-muted-foreground">Alleen voor {regeling.beperktTot}</p>
      )}

      {/* Op mobiel blijft de gesloten kaart compact (badge, titel, bedrag,
          maatregelregel); de omschrijving verhuist daar naar de uitklap. */}
      <p className="mt-1.5 hidden text-[15px] leading-relaxed text-foreground/80 md:block">{regeling.omschrijving}</p>

      {/* Einddatum, alleen als hij binnen drie maanden valt. De bron zet op de
          meeste regelingen 2050 neer, dus een datum die hier verschijnt is een
          echte deadline. */}
      {eindigtBinnenkort && regeling.looptAfOp && (
        <Melding icoon={CalendarClock}>aanvragen kan tot {formateerDatum(regeling.looptAfOp)}.</Melding>
      )}

      {/* "Let op" komt letterlijk van de bron en is zeldzaam (één op de dertig).
          Bij ISDE staat hier dat je in Groningen en Noord-Drenthe beter de
          Isolatieaanpak kunt nemen: precies ons werkgebied, en precies het soort
          dubbeling waar een bewoner zelf niet uitkomt.

          Die tekst is wel lang (bij ISDE 428 tekens). In een gevuld vlak op de
          dichte kaart werd dat een blok van zes regels dat de hele lijst uit
          balans trok. Hier staat daarom alleen de melding zelf, als één rustige
          regel zoals de einddatum erboven; de tekst van de bron staat bovenaan
          de uitklap, achter dezelfde knop waar ook de voorwaarden zitten. */}
      {regeling.letOp && <Melding icoon={Info}>er geldt een uitzondering, zie de voorwaarden.</Melding>}

      {/* Aanbieder en uitklapknop op één regel, ook op mobiel: onder elkaar kostte
          dat per kaart een extra regel, en met elf kaarten is dat een half scherm
          scrollen. De knop wijkt nooit.

          De aanbieder stond hier afgekapt (`truncate`), wat prima werkte zolang
          er "Rijksoverheid" of "Gemeente" stond. Sinds de officiële API de échte
          naam levert, leverde dat op mobiel "Rijksdienst voor Onder…" op: midden
          in een woord afgebroken en daarmee onleesbaar. Nu breekt de naam af op
          een spatie en mag hij een tweede regel gebruiken. Dat kost alleen ruimte
          bij de paar lange namen, en die informatie is het waard. */}
      <div className="mt-3 flex items-center justify-between gap-3 border-t border-border/60 pt-2.5 md:mt-4 md:pt-3">
        <span className="min-w-0 text-[13px] leading-snug text-muted-foreground">{regeling.aanbieder}</span>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={regionId}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-sm text-[14px] font-medium text-primary transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {open ? "Minder tonen" : "Bekijk voorwaarden"}
          <ChevronDown
            size={15}
            strokeWidth={2}
            className={`transition-transform ${open ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </button>
      </div>

      {open && (
        <div id={regionId} className="mt-3 flex flex-col gap-3 border-t border-border/60 pt-3 text-[14px] leading-relaxed">
          <p className="text-foreground/80 md:hidden">{regeling.omschrijving}</p>
          {/* De uitzondering staat bovenaan: wie hier klikt na de melding op de
              dichte kaart, wil eerst wéten wat die uitzondering is. */}
          {regeling.letOp && (
            <div className="flex gap-2 rounded-md bg-secondary/60 p-3">
              <Info size={15} strokeWidth={2} aria-hidden="true" className="mt-0.5 shrink-0 text-primary" />
              <p className="text-[13.5px] leading-relaxed text-foreground/80">
                <span className="font-semibold text-primary">Let op: </span>
                {regeling.letOp}
              </p>
            </div>
          )}
          {/* De bedragzin van de bron zelf. Het slot rechtsboven heeft maar
              ruimte voor één cijfer; hier staat waar dat cijfer op slaat, en bij
              een regeling zónder cijfer staat hier waaróm er geen bedrag is. */}
          {regeling.bedragToelichting && (
            <p>
              <span className="font-semibold text-primary">Bedrag: </span>
              <span className="text-foreground/80">{regeling.bedragToelichting}</span>
            </p>
          )}
          {regeling.voorWie && (
            <p>
              <span className="font-semibold text-primary">Voor wie: </span>
              <span className="text-foreground/80">{regeling.voorWie}</span>
            </p>
          )}
          {regeling.belangrijksteVoorwaarde && (
            <p>
              <span className="font-semibold text-primary">Belangrijkste voorwaarde: </span>
              <span className="text-foreground/80">{regeling.belangrijksteVoorwaarde}</span>
            </p>
          )}
          {/* De zin "Vaak te combineren met andere regelingen…" stond hier op
              élke kaart. Twaalf keer dezelfde belofte leest als behang, niet als
              uitleg. Hij staat nu één keer op het resultaat, waar de vraag "moet
              ik hieruit kiezen?" ook echt opkomt. */}
          <a
            href={regeling.bronUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 self-start rounded-sm text-[14px] font-semibold text-primary underline underline-offset-4 transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label={`Naar de officiële regeling: ${regeling.titel} (opent in nieuw tabblad)`}
          >
            Naar de officiële regeling
            <ExternalLink size={13} strokeWidth={2} aria-hidden="true" />
          </a>
        </div>
      )}
    </article>
  );
};
