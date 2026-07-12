import { useId, useState } from "react";
import { ChevronDown, ExternalLink, Tag } from "lucide-react";

import { ALLE_MAATREGELEN, MAATREGEL_LABELS, TYPE_LABELS, type SubsidieRegeling } from "@/lib/subsidies";

import { NIVEAU_KAART, NIVEAU_TYPEPILL } from "./niveauKleuren";

// Maatregel-samenvatting als rustige leesregel (géén chips: die lijken op de
// klikbare filterchips uit stap 2). Dekt een regeling vrijwel alles, dan één
// zin; anders een opsomming met een teller.
const MAX_TAGS = 4;
const maatregelTekst = (regeling: SubsidieRegeling): string => {
  if (regeling.maatregelen.length >= ALLE_MAATREGELEN.length - 1) return "Voor vrijwel alle maatregelen";
  const labels = regeling.maatregelen.map((m) => MAATREGEL_LABELS[m]);
  if (labels.length <= MAX_TAGS) return `Voor ${labels.join(", ")}`;
  return `Voor ${labels.slice(0, MAX_TAGS).join(", ")} en ${labels.length - MAX_TAGS} meer`;
};

// Eén regeling in het resultaat. Gesloten toont de kaart alles om te beslissen
// (type, titel, bedrag rechtsboven, één regel uitleg, maatregelen). De uitklap
// geeft verdieping (voor wie, voorwaarde, officiële bron) volgens het
// drielagenmodel: beslissen → begrijpen → verifiëren. De linkerrand in de
// niveaukleur legt de koppeling met de groepskop erboven.
export const SubsidieCard = ({ regeling }: { regeling: SubsidieRegeling }) => {
  const [open, setOpen] = useState(false);
  const regionId = useId();

  return (
    <article className={`rounded-lg border border-l-4 p-5 shadow-card ${NIVEAU_KAART[regeling.niveau]}`}>
      {/* Kicker (type) links, bedrag rechts — vaste plek, zodat je verticaal
          langs de bedragen kunt scannen en een lening nooit als subsidie leest. */}
      <div className="flex items-start justify-between gap-4">
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] ${NIVEAU_TYPEPILL[regeling.niveau]}`}
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
      <p className="mt-1.5 text-[15px] leading-relaxed text-foreground/80">{regeling.omschrijving}</p>

      <p className="mt-3 flex items-center gap-1.5 text-[13px] text-muted-foreground">
        <Tag size={13} strokeWidth={2} className="shrink-0" aria-hidden="true" />
        {maatregelTekst(regeling)}
      </p>

      <div className="mt-4 flex flex-col items-start gap-2 border-t border-border/60 pt-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <span className="text-[13px] text-muted-foreground">{regeling.aanbieder}</span>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={regionId}
          className="inline-flex items-center gap-1.5 rounded-sm text-[14px] font-medium text-primary transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
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
          <p className="text-foreground/80">Vaak te combineren met andere regelingen — wij zoeken de beste combinatie voor je uit.</p>
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
