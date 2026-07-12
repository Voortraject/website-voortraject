import { ExternalLink } from "lucide-react";

import { ALLE_MAATREGELEN, MAATREGEL_LABELS, type SubsidieRegeling } from "@/lib/subsidies";

import { NIVEAU_KAART } from "./niveauKleuren";

// Maatregel-tags: in één oogopslag zien wáár de regeling over gaat. Dekt een
// regeling (vrijwel) alles, dan één tag i.p.v. acht; anders max vier + teller.
const MAX_TAGS = 4;
const maatregelTags = (regeling: SubsidieRegeling): string[] => {
  if (regeling.maatregelen.length >= ALLE_MAATREGELEN.length - 1) return ["Alle maatregelen"];
  const labels = regeling.maatregelen.map((m) => MAATREGEL_LABELS[m]);
  if (labels.length <= MAX_TAGS) return labels;
  return [...labels.slice(0, MAX_TAGS), `+${labels.length - MAX_TAGS} meer`];
};

// Eén regeling in het resultaat. Bewust géén niveau-badge: de groepskop
// erboven zegt al "Rijksoverheid"/"Gemeente" — de linkerrand in de
// categoriekleur legt de koppeling. Bedrag rustig in navy (geld schreeuwt
// niet), oker blijft voor actie.
export const SubsidieCard = ({ regeling }: { regeling: SubsidieRegeling }) => (
  <article
    className={`rounded-lg border border-l-4 p-5 shadow-card md:p-6 ${NIVEAU_KAART[regeling.niveau]}`}
  >
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <h3 className="font-display text-[17px] font-semibold leading-snug text-primary md:text-[18px]">
        {regeling.titel}
      </h3>
      {regeling.bedragIndicatie && (
        <span className="whitespace-nowrap text-[15px] font-semibold text-primary">
          {regeling.bedragIndicatie}
        </span>
      )}
    </div>
    <p className="mt-1.5 text-[14px] leading-relaxed text-foreground/80">{regeling.omschrijving}</p>

    <div className="mt-3 flex flex-wrap gap-1.5">
      {maatregelTags(regeling).map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center rounded-full border border-border px-2.5 py-0.5 text-[12px] text-muted-foreground"
          style={{ backgroundColor: "var(--card-soft)" }}
        >
          {tag}
        </span>
      ))}
    </div>

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
