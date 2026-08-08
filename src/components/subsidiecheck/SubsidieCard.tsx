import { useId, useState } from "react";
import { ChevronDown, ExternalLink } from "lucide-react";

import { TYPE_LABELS, type SubsidieRegeling } from "@/lib/subsidies";

import { TYPE_KAART, TYPE_PILL } from "./niveauKleuren";

// Hier stond een maatregelregel ("Voor isolatie & glas, ventilatie …"). Die is
// weg omdat hij niet waar te maken is: de Energiesubsidiewijzer levert per
// regeling geen maatregelenlijst, dus de parser vult `regeling.maatregelen`
// met álle acht (zie energiesubsidiewijzer.ts). Elke kaart toonde daardoor
// dezelfde zin "Voor vrijwel alle maatregelen", ook een regeling die alleen
// over isolatie gaat. Twaalf identieke, onjuiste regels op de pagina waar we
// geloofwaardigheid moeten verdienen. Liever niets dan iets wat niet klopt.
// Terug te zetten zodra de bron per regeling wél maatregelen levert.

// Eén regeling in het resultaat. Gesloten toont de kaart alles om te beslissen
// (type, titel, bedrag rechtsboven, één regel uitleg, maatregelen). De uitklap
// geeft verdieping (voor wie, voorwaarde, officiële bron) volgens het
// drielagenmodel: beslissen → begrijpen → verifiëren. De linkerrand en de pill
// in de type-kleur (groen = subsidie, terracotta = lening) maken meteen duidelijk
// of het geld is dat je krijgt of leent.
export const SubsidieCard = ({ regeling }: { regeling: SubsidieRegeling }) => {
  const [open, setOpen] = useState(false);
  const regionId = useId();

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
      {/* Op mobiel blijft de gesloten kaart compact (badge, titel, bedrag,
          maatregelregel); de omschrijving verhuist daar naar de uitklap. */}
      <p className="mt-1.5 hidden text-[15px] leading-relaxed text-foreground/80 md:block">{regeling.omschrijving}</p>

      {/* Aanbieder en uitklapknop op één regel, ook op mobiel: onder elkaar kostte
          dat per kaart een extra regel, en met elf kaarten is dat een half scherm
          scrollen. De aanbieder mag inkorten, de knop nooit. */}
      <div className="mt-3 flex items-center justify-between gap-3 border-t border-border/60 pt-2.5 md:mt-4 md:pt-3">
        <span className="min-w-0 truncate text-[13px] text-muted-foreground">{regeling.aanbieder}</span>
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
