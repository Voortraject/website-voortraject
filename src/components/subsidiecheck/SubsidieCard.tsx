import { ExternalLink } from "lucide-react";

import { NIVEAU_LABELS, type SubsidieNiveau, type SubsidieRegeling } from "@/lib/subsidies";

// Gedempte niveau-badges binnen de huisstijl — bewust geen stoplichtkleuren.
const BADGE_CLASSES: Record<SubsidieNiveau, string> = {
  rijk: "bg-primary text-primary-foreground",
  provincie: "bg-secondary text-secondary-foreground",
  gemeente: "bg-accent/25 text-primary",
  overig: "bg-muted text-muted-foreground",
};

// Eén regeling in het resultaat: titel, niveau-badge, één regel uitleg,
// indicatief bedrag (rustig navy, nooit schreeuwend oker) en de officiële bron.
export const SubsidieCard = ({ regeling }: { regeling: SubsidieRegeling }) => (
  <article className="rounded-lg border border-border bg-card p-5 shadow-card md:p-6">
    <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold ${BADGE_CLASSES[regeling.niveau]}`}
      >
        {NIVEAU_LABELS[regeling.niveau]}
      </span>
      {regeling.bedragIndicatie && (
        <span className="text-[15px] font-semibold text-primary">{regeling.bedragIndicatie}</span>
      )}
    </div>

    <h3 className="mt-3 font-display text-[17px] font-semibold leading-snug text-primary md:text-[18px]">
      {regeling.titel}
    </h3>
    <p className="mt-1.5 text-[14px] leading-relaxed text-foreground/80">{regeling.omschrijving}</p>

    <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
      <span className="text-[13px] text-muted-foreground">{regeling.aanbieder}</span>
      <a
        href={regeling.bronUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-[14px] font-medium text-primary underline underline-offset-4 transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
        aria-label={`Meer informatie over ${regeling.titel} (opent in nieuw tabblad)`}
      >
        Meer info
        <ExternalLink size={13} strokeWidth={2} aria-hidden="true" />
      </a>
    </div>
  </article>
);
