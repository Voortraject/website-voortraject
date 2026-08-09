import type { ReactNode } from "react";
import { Mail } from "lucide-react";

import {
  type Bewonertype,
  formatEuro,
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
  /** Sluitstuk onder de scheidingslijn (de eerste stap). Leeg → geen lijn. */
  voet?: ReactNode;
  /** Sterkste concrete bedragen om als teaser uit te lichten (topBedragen()). */
  bedragen: { subsidie?: TopBedrag; lening?: TopBedrag };
  /** Geregistreerd energielabel (EP-Online), of null als onbekend/nog niet geladen. */
  energielabel?: EnergielabelData | null;
  /** Label wordt nog opgehaald → toon een laadplaatshouder i.p.v. de "geen label"-staat. */
  energielabelBezig?: boolean;
  /** Scrollt naar het mailformulier onder de lijst. */
  onMailKlik: () => void;
  /** Toon de "mail mij dit overzicht"-knop (uit bij de gegevens-poort: die
      gegevens zijn dan al binnen). */
  toonMailKnop?: boolean;
  /** Springt naar het vraagblok mét de labelaanvraag al ingevuld. */
  onLabelAanvraag: () => void;
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
  voet,
  bedragen,
  energielabel,
  energielabelBezig,
  onMailKlik,
  toonMailKnop = true,
  onLabelAanvraag,
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

      {/* De contactroute ("Ik heb een vraag") staat in het woningpaneel ernaast, in
          de ruimte die daar onder de beelden tóch overblijft. Hier nam die knop te
          veel aandacht weg van de uitkomst zelf. */}
      {toonMailKnop && (
        <button
          type="button"
          onClick={onMailKlik}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full border border-accent bg-accent/15 px-5 py-2.5 text-[14px] font-semibold text-primary transition-colors hover:bg-accent/25 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Mail size={16} strokeWidth={2} aria-hidden="true" />
          Mail mij dit overzicht
        </button>
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
        // Tekst en knop naast elkaar: onder elkaar nam dit blok te veel hoogte in
        // het samenvattingskaartje. De knop is compact gehouden (geen pijl, korter
        // label) zodat de zin ernaast zoveel mogelijk breedte houdt. Mobiel klapt
        // het alsnog netjes onder elkaar.
        <div
          className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:gap-3"
          style={{ backgroundColor: "var(--card-soft)" }}
        >
          {/* "Voor deze woning vonden we" kon eruit: dit staat onder de kop
              ENERGIELABEL, in de kaart van dít adres, dus dat is al gezegd.
              Dezelfde formulering als in de gegevens-poort, zodat het twee keer
              hetzelfde leest in plaats van twee keer net anders. */}
          <p className="min-w-0 flex-1 text-[14px] leading-relaxed text-foreground/80">
            Nog geen geregistreerd energielabel. Wij kunnen dat voor je regelen.
          </p>
          {/* Was een link naar /contact: de bezoeker verliet het resultaat en
              begon aan een leeg formulier, inclusief alles wat hij hier al had
              ingevuld. Nu blijft hij op de pagina en staat de aanvraag beneden
              al voor hem klaar. */}
          <button
            type="button"
            onClick={onLabelAanvraag}
            className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full border border-accent bg-accent/10 px-3.5 py-2 text-[13.5px] font-semibold text-primary transition-colors hover:bg-accent/20 min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Label aanvragen
          </button>
        </div>
      )}

      {/* Hier stond "Regelingen gevonden voor deze maatregelen" met de lijst
          maatregelen die de bewoner zelf had aangevinkt. Die herhaalde alleen
          zijn eigen keuze en bracht niets nieuws; op deze plek, onderaan de
          piek van het scherm, hoort iets dat verder helpt. Nu staat hier de
          eerste stap (zie EersteStap): één uitspraak over woningen uit dit
          bouwjaar, eindigend in een vraag. */}
      {voet && (
        <>
          <div className="mt-8 h-px bg-border" role="separator" />
          <div className="mt-5">{voet}</div>
        </>
      )}
    </section>
  );
};
