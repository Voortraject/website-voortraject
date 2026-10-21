import type { ReactNode } from "react";
import { ArrowRight, ClipboardList, Euro, Percent, Zap } from "lucide-react";

import type { EnergielabelData } from "@/lib/woninginfo";

import { Energielabel } from "./Energielabel";
import { TelOp } from "./TelOp";

// Tellers, het isolatieplan en het energielabel, in twee vormen:
//  - desktop (vanaf lg): een rij onder de hoofdtegel, de twee tellers gestapeld
//    links en de isolatieplan- of labeltegel rechts, ongeveer even hoog;
//  - telefoon: de tellers als één mini-rij ín de hoofdtegel, het isolatieplan
//    als één lage rij eronder, en het label bij de woning verderop. Op een
//    telefoon moet de eerste regeling snel in beeld komen; wat ondersteunt,
//    staat lager of korter.

// ---- Kleine bouwstenen ----

const labelJaar = (label: EnergielabelData) => {
  const jaar = label.registratiedatum ? new Date(label.registratiedatum).getFullYear() : NaN;
  return Number.isFinite(jaar) ? jaar : undefined;
};

const LabelBron = ({ label }: { label: EnergielabelData }) => {
  const jaar = labelJaar(label);
  return (
    <p className="text-[13px] text-[hsl(var(--rs-tekst-zacht))]">
      {jaar ? `Geregistreerd ${jaar} · ` : ""}Bron: EP-Online
      {label.isVereenvoudigd ? " · vereenvoudigd label" : ""}
    </p>
  );
};

// Een tekstlink met pijl. "Vraag het aan" en "Label aanvragen" hebben dezelfde
// vorm: in één tegel twee vormen van "dit kunnen we voor je regelen" las als
// twee soorten acties.
const PijlTekst = ({ children }: { children: ReactNode }) => (
  <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[14px] font-extrabold text-primary">
    {children}
    <ArrowRight size={16} strokeWidth={2.2} className="rs-pijl" aria-hidden="true" />
  </span>
);

const LabelAanvraagLink = ({ onClick }: { onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="rs-met-pijl inline-flex min-h-[32px] items-center rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
  >
    <PijlTekst>Label aanvragen</PijlTekst>
  </button>
);

const BadgeEuro = () => (
  <span className="rs-badge rs-badge-subsidie" aria-hidden="true">
    <Euro size={18} strokeWidth={2.2} />
  </span>
);
const BadgeProcent = () => (
  <span className="rs-badge rs-badge-lening" aria-hidden="true">
    <Percent size={18} strokeWidth={2.2} />
  </span>
);
const BadgeKlembord = () => (
  <span className="rs-badge rs-badge-ink" aria-hidden="true">
    <ClipboardList size={18} strokeWidth={2.2} />
  </span>
);

/** Het label als schaal op één regel, of de aanvraag als er geen geregistreerd label is. */
export const LabelRegel = ({
  energielabel,
  bezig,
  onLabelAanvraag,
}: {
  energielabel?: EnergielabelData | null;
  bezig?: boolean;
  onLabelAanvraag: () => void;
}) => {
  if (bezig) return <div className="h-[30px] w-full animate-pulse rounded-md bg-secondary" aria-hidden="true" />;
  if (energielabel)
    return (
      <div className="grid gap-1.5">
        <div className="flex items-center gap-3">
          <span className="shrink-0 text-[14px] font-extrabold text-primary">Energielabel</span>
          <div className="w-full max-w-[200px]">
            <Energielabel klasse={energielabel.klasse} compact />
          </div>
        </div>
        <LabelBron label={energielabel} />
      </div>
    );
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <span className="text-[14px] text-[hsl(var(--rs-tekst-zacht))]">Nog geen geregistreerd energielabel.</span>
      <LabelAanvraagLink onClick={onLabelAanvraag} />
    </div>
  );
};

// ---- Telefoon ----

/**
 * De tellers als één mini-rij in de hoofdtegel: rond icoon, getal en woord in
 * de soortkleur. Zelfde getallen als de tegels op desktop, in een regel.
 */
export const MiniTellers = ({ subsidies, leningen }: { subsidies: number; leningen: number }) => {
  if (subsidies === 0 && leningen === 0) return null;
  const item = (aantal: number, enkel: string, meer: string, kleur: string, badge: ReactNode) => (
    <span role="group" aria-label={`${aantal} ${aantal === 1 ? enkel : meer}`} className="inline-flex items-center gap-2">
      {badge}
      <span className={`text-[15px] font-extrabold ${kleur}`}>
        <span className="font-display text-[22px] leading-none">{aantal}</span> {aantal === 1 ? enkel : meer}
      </span>
    </span>
  );
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 [&_.rs-badge]:h-8 [&_.rs-badge]:w-8">
      {subsidies > 0 && item(subsidies, "subsidie", "subsidies", "text-[hsl(var(--subsidie))]", <BadgeEuro />)}
      {leningen > 0 && item(leningen, "lening", "leningen", "text-[hsl(var(--lening))]", <BadgeProcent />)}
    </div>
  );
};

/** Het isolatieplan als één lage rij: het conversiepunt zichtbaar, maar klein. */
export const IsolatieplanRij = ({ onIsolatieplan }: { onIsolatieplan: () => void }) => (
  <button
    type="button"
    onClick={onIsolatieplan}
    data-veer
    className="rs-teller rs-vlak-zand rs-met-pijl flex w-full items-center gap-3.5 px-4 py-3.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
  >
    <BadgeKlembord />
    <span className="min-w-0 flex-1">
      <span className="block font-display text-[16px] font-bold leading-snug text-primary">
        Ik wil een isolatieplan aanvragen
      </span>
      <span className="mt-1 block">
        <PijlTekst>Vraag het aan</PijlTekst>
      </span>
    </span>
  </button>
);

// ---- Desktop ----

// Een lage teller: rond icoon links, kop met één regel uitleg, het grote getal
// rechts. Zo kost hij één rij in plaats van een blok, met de rust van de
// CRM-kaarten (verloop, schaduw, gekleurd icoon en getal).
const Teller = ({
  titel,
  uitleg,
  waarde,
  vlak,
  badge,
  kleur,
}: {
  titel: string;
  uitleg: string;
  waarde: number;
  vlak: string;
  badge: ReactNode;
  kleur: string;
}) => (
  <div role="group" aria-label={titel} data-veer className={`rs-teller ${vlak} flex items-center gap-3.5 px-5 py-3.5`}>
    {badge}
    <div className="min-w-0 flex-1">
      <p className="text-[15px] font-bold leading-tight text-primary">{titel}</p>
      <p className="mt-0.5 text-[13.5px] leading-snug text-[hsl(var(--rs-tekst-zacht))]">{uitleg}</p>
    </div>
    <TelOp
      waarde={waarde}
      className={`font-display text-[40px] font-extrabold leading-none tracking-[-0.03em] ${kleur}`}
    />
  </div>
);

interface TellersProps {
  subsidies: number;
  leningen: number;
  /** Binnen het gebied van de Isolatieaanpak Nij Begun (zie src/lib/nijBegun.ts). */
  nijBegun: boolean;
  energielabel?: EnergielabelData | null;
  energielabelBezig?: boolean;
  onLabelAanvraag: () => void;
  onIsolatieplan: () => void;
  className?: string;
}

// De tellers vervangen de verhoudingsbalk: twee getallen lees je sneller dan
// een balk. Daarnaast één tegel die afhangt van waar de woning staat. In het
// Nij Begun-gebied is het isolatieplan de eerste stap, dus daar staat een tegel
// om het aan te vragen, met het energielabel eronder. Daarbuiten de
// energielabel-tegel.
export const Tellers = ({
  subsidies,
  leningen,
  nijBegun,
  energielabel,
  energielabelBezig,
  onLabelAanvraag,
  onIsolatieplan,
  className = "",
}: TellersProps) => {
  const derde = nijBegun ? (
    <div role="group" aria-label="Isolatieaanpak Nij Begun" data-veer className="rs-teller rs-vlak-zand px-5 py-4">
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onIsolatieplan}
          className="rs-met-pijl min-w-0 flex-1 rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4"
        >
          <span className="block font-display text-[19px] font-bold leading-snug tracking-[-0.01em] text-primary">
            Ik wil een isolatieplan aanvragen
          </span>
          <span className="mt-1.5 flex min-h-[28px] items-center">
            <PijlTekst>Vraag het aan</PijlTekst>
          </span>
        </button>
        <BadgeKlembord />
      </div>
      <div className="mt-3">
        <LabelRegel energielabel={energielabel} bezig={energielabelBezig} onLabelAanvraag={onLabelAanvraag} />
      </div>
    </div>
  ) : (
    <div role="group" aria-label="Energielabel" data-veer className="rs-teller rs-vlak-zand px-5 py-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[15px] font-bold text-primary">Energielabel</p>
        <span className="rs-badge rs-badge-ink" aria-hidden="true">
          <Zap size={18} strokeWidth={2.2} />
        </span>
      </div>
      <div className="mt-2.5">
        {energielabelBezig ? (
          <div className="h-[44px] animate-pulse rounded-md bg-secondary" aria-hidden="true" />
        ) : energielabel ? (
          <div className="grid gap-2">
            <Energielabel klasse={energielabel.klasse} />
            <LabelBron label={energielabel} />
          </div>
        ) : (
          <>
            <p className="text-[14.5px] leading-snug text-foreground">
              Nog geen geregistreerd energielabel. Wij kunnen dat voor je regelen.
            </p>
            <div className="mt-1">
              <LabelAanvraagLink onClick={onLabelAanvraag} />
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className={`grid-cols-[1fr_1.15fr] items-stretch gap-4 ${className}`}>
      {(subsidies > 0 || leningen > 0) && (
        <div className="grid gap-4">
          {subsidies > 0 && (
            <Teller
              titel="Subsidies"
              uitleg="Geld dat je niet terugbetaalt"
              waarde={subsidies}
              vlak="rs-vlak-subsidie"
              kleur="text-[hsl(var(--subsidie))]"
              badge={<BadgeEuro />}
            />
          )}
          {leningen > 0 && (
            <Teller
              titel="Leningen"
              uitleg="Geld dat je leent en terugbetaalt"
              waarde={leningen}
              vlak="rs-vlak-lening"
              kleur="text-[hsl(var(--lening))]"
              badge={<BadgeProcent />}
            />
          )}
        </div>
      )}
      {derde}
    </div>
  );
};
