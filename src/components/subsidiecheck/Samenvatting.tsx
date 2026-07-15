import { ArrowRight, Check, Mail, Share2 } from "lucide-react";

import {
  type Bewonertype,
  formatEuro,
  type Maatregel,
  MAATREGEL_LABELS,
  type Samenvatting as SamenvattingData,
  type TopBedrag,
} from "@/lib/subsidies";
import type { EnergielabelData } from "@/lib/woninginfo";

import { Energielabel } from "./Energielabel";

// Woordkeuze per bewonertype, zodat de samenvatting terugkoppelt wat je hebt
// ingevuld ("voor jouw koopwoning") — endowment: dit is jóuw overzicht.
const WONINGWOORD: Record<Bewonertype, string> = {
  woningeigenaar: "koopwoning",
  huurder: "huurwoning",
  vve: "VvE",
  verhuurder: "woning",
};

interface SamenvattingProps {
  data: SamenvattingData;
  bewonertype: Bewonertype;
  /** Gemeente, of anders provincie — voor de situatie-terugkoppeling. */
  plaats?: string;
  /** De maatregelen waar de bewoner in geïnteresseerd is (kolom "wat dit dekt"). */
  maatregelen: Maatregel[];
  /** Sterkste concrete bedragen om als teaser uit te lichten (topBedragen()). */
  bedragen: { subsidie?: TopBedrag; lening?: TopBedrag };
  /** Geregistreerd energielabel (EP-Online), of null als onbekend/nog niet geladen. */
  energielabel?: EnergielabelData | null;
  /** Label wordt nog opgehaald → toon een laadplaatshouder i.p.v. de "geen label"-staat. */
  energielabelBezig?: boolean;
  /** Aantal regelingen dat (nog) afgeschermd is; > 0 → toon de eerlijke splitregel. */
  afgeschermdAantal?: number;
  /** Scrollt naar het mailformulier onder de lijst. */
  onMailKlik: () => void;
  /** Deelt de tool (native deel-sheet / kopieer-link). */
  onDeelTool: () => void;
  /** Terugval "link gekopieerd"-feedback (desktop zonder deel-sheet). */
  deelGedeeld?: boolean;
}

// Zet een uitgelicht bedrag om in leesbare copy. Subsidie bij voorkeur als
// percentage ("tot 100% subsidie"), lening als bedrag ("een lening tot € X").
const subsidieTekst = (b: TopBedrag) =>
  b.soort === "pct" ? `tot ${b.waarde}% subsidie` : `subsidie tot € ${formatEuro(b.waarde)}`;
const leningTekst = (b: TopBedrag) =>
  b.soort === "euro" ? `een lening tot € ${formatEuro(b.waarde)}` : `een lening tot ${b.waarde}% van de kosten`;

// Het samenvattingsblok bovenaan het resultaat — dé piek van de flow
// (peak-end): eerst de conclusie (inverted pyramid). Verticale opbouw: aantal +
// bedrag-teaser, dan de subsidie/lening-balk, daaronder het energielabel (indien
// bekend), een scheidingslijn, de gekozen maatregelen horizontaal, nog een
// scheidingslijn en tot slot de mail-CTA.
export const Samenvatting = ({
  data,
  bewonertype,
  plaats,
  maatregelen,
  bedragen,
  energielabel,
  energielabelBezig,
  afgeschermdAantal,
  onMailKlik,
  onDeelTool,
  deelGedeeld,
}: SamenvattingProps) => {
  const { totaal, subsidies, leningen } = data;
  const meervoud = totaal === 1 ? "regeling" : "regelingen";
  const heeftVerdeling = subsidies > 0 || leningen > 0;
  const subsidiePct = totaal > 0 ? Math.round((subsidies / totaal) * 100) : 0;

  const labelJaar =
    energielabel?.registratiedatum && Number.isFinite(new Date(energielabel.registratiedatum).getFullYear())
      ? new Date(energielabel.registratiedatum).getFullYear()
      : undefined;

  return (
    <section
      aria-label="Samenvatting van je subsidieoverzicht"
      className="rounded-2xl border-2 bg-card p-6 shadow-card md:p-8"
      style={{ borderColor: "hsl(var(--accent) / 0.8)" }}
    >
      {/* De payoff als één zin: het aantal groot, de rest kleiner ernaast. */}
      <p className="font-display font-bold leading-tight text-primary">
        <span style={{ fontSize: "clamp(38px, 7vw, 52px)" }}>{totaal}</span>
        <span className="ml-3 text-[19px] font-semibold md:text-[21px]">
          {meervoud} voor jouw {WONINGWOORD[bewonertype]}
          {plaats ? (
            <>
              {" "}
              in {plaats}
            </>
          ) : null}
        </span>
      </p>

      {/* Eerlijke splitregel: het grote totaal telt alles, maar alleen de
          Rijksoverheid is nu leesbaar; de rest zit in het mailoverzicht. */}
      {afgeschermdAantal != null && afgeschermdAantal > 0 && (
        <p className="mt-2.5 text-[13.5px] leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground">{totaal - afgeschermdAantal} direct zichtbaar</span>,{" "}
          {afgeschermdAantal} in je mailoverzicht.
        </p>
      )}

      {/* Bedrag-teaser: het sterkste concrete cijfer, in de type-kleuren. */}
      {(bedragen.subsidie || bedragen.lening) && (
        <p className="mt-5 text-[16px] leading-snug text-foreground">
          Waaronder{" "}
          {bedragen.subsidie && (
            <span className="font-semibold text-[hsl(var(--subsidie))]">{subsidieTekst(bedragen.subsidie)}</span>
          )}
          {bedragen.subsidie && bedragen.lening ? " en " : null}
          {bedragen.lening && (
            <span className="font-semibold text-[hsl(var(--lening))]">{leningTekst(bedragen.lening)}</span>
          )}
          .
        </p>
      )}

      {/* Verhoudingsbalk: subsidies vs. leningen in één oogopslag. */}
      {heeftVerdeling && (
        <div className="mt-6">
          <div
            className="flex h-3 overflow-hidden rounded-full"
            role="img"
            aria-label={`${subsidies} subsidies en ${leningen} leningen`}
          >
            {subsidies > 0 && <span style={{ width: `${subsidiePct}%`, backgroundColor: "hsl(var(--subsidie))" }} />}
            {leningen > 0 && <span style={{ width: `${100 - subsidiePct}%`, backgroundColor: "hsl(var(--lening))" }} />}
          </div>
          <div className="mt-3.5 flex flex-wrap gap-x-5 gap-y-1 text-[14px] font-medium text-foreground">
            {subsidies > 0 && (
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "hsl(var(--subsidie))" }} />
                {subsidies} {subsidies === 1 ? "subsidie" : "subsidies"}
              </span>
            )}
            {leningen > 0 && (
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: "hsl(var(--lening))" }} />
                {leningen} {leningen === 1 ? "lening" : "leningen"}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Energielabel: subtiele scheidingslijn erboven + ruimte, dan de titel.
          Toont de labelschaal, of — als er geen geregistreerd label is — een
          aanbod om het voor de bewoner te regelen (met contact-CTA). */}
      <div className="mt-8 h-px bg-border" role="separator" />
      <p className="mt-4 mb-2.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        Energielabel
      </p>
      {energielabelBezig ? (
        <div className="h-[44px] animate-pulse rounded-md bg-secondary" aria-hidden="true" />
      ) : energielabel ? (
        <>
          <Energielabel klasse={energielabel.klasse} />
          <p className="mt-2.5 text-[12px] text-muted-foreground">
            {labelJaar ? `Geregistreerd ${labelJaar} · ` : ""}Bron: EP-Online
            {energielabel.isVereenvoudigd ? " · vereenvoudigd label" : ""}
          </p>
        </>
      ) : (
        <div className="rounded-lg border border-border p-4" style={{ backgroundColor: "var(--card-soft)" }}>
          <p className="text-[14px] leading-relaxed text-foreground/80">
            Voor deze woning vonden we geen geregistreerd energielabel. Wij kunnen dat voor je regelen.
          </p>
          <a
            href="/contact"
            className="mt-3 inline-flex items-center gap-2 rounded-full border border-accent bg-accent/10 px-4 py-2 text-[13.5px] font-semibold text-primary transition-colors hover:bg-accent/20 min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Energielabel aanvragen
            <ArrowRight size={15} strokeWidth={2} aria-hidden="true" />
          </a>
        </div>
      )}

      <div className="mt-8 h-px bg-border" role="separator" />

      {/* De gekozen maatregelen waarop dit overzicht is gezocht — horizontaal
          (wrap), i.p.v. de administratieve verdeling per overheidslaag. Bewust
          "gevonden voor", niet "dekt": de lijst is wat de bewoner koos. */}
      <p className="mt-4 text-[13px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
        Regelingen gevonden voor deze maatregelen
      </p>
      <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2">
        {maatregelen.map((m) => (
          <li key={m} className="inline-flex items-center gap-2 text-[14px] text-foreground">
            <span
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: "hsl(var(--subsidie) / 0.12)" }}
              aria-hidden="true"
            >
              <Check size={12} strokeWidth={3} className="text-[hsl(var(--subsidie))]" />
            </span>
            {MAATREGEL_LABELS[m]}
          </li>
        ))}
      </ul>

      {/* Acties: het overzicht mailen + de tool delen. */}
      <div className="mt-8 h-px bg-border/60" role="separator" />
      <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
        <button
          type="button"
          onClick={onMailKlik}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-accent bg-accent/15 px-5 py-2.5 text-[14px] font-semibold text-primary transition-colors hover:bg-accent/25 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Mail size={16} strokeWidth={2} aria-hidden="true" />
          Mail mij dit overzicht
        </button>
        <button
          type="button"
          onClick={onDeelTool}
          aria-live="polite"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-[14px] font-semibold text-primary transition-colors hover:border-primary/40 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {deelGedeeld ? (
            <>
              <Check size={16} strokeWidth={2.5} className="text-accent" aria-hidden="true" />
              Link gekopieerd
            </>
          ) : (
            <>
              <Share2 size={16} strokeWidth={2} aria-hidden="true" />
              Deel de tool
            </>
          )}
        </button>
      </div>
    </section>
  );
};
