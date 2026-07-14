import { ArrowRight, Check, Mail } from "lucide-react";

import {
  type Bewonertype,
  formatEuro,
  type Maatregel,
  MAATREGEL_LABELS,
  type Samenvatting as SamenvattingData,
  type TopBedrag,
} from "@/lib/subsidies";

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
  /** Scrollt naar het mailformulier onder de lijst. */
  onMailKlik: () => void;
}

// Zet een uitgelicht bedrag om in leesbare copy. Subsidie bij voorkeur als
// percentage ("tot 100% subsidie"), lening als bedrag ("een lening tot € X").
const subsidieTekst = (b: TopBedrag) =>
  b.soort === "pct" ? `tot ${b.waarde}% subsidie` : `subsidie tot € ${formatEuro(b.waarde)}`;
const leningTekst = (b: TopBedrag) =>
  b.soort === "euro" ? `een lening tot € ${formatEuro(b.waarde)}` : `een lening tot ${b.waarde}% van de kosten`;

// Het samenvattingsblok bovenaan het resultaat — dé piek van de flow
// (peak-end): eerst de conclusie (inverted pyramid), dan pas de lijst. Groot
// aantal, een eerlijke bedrag-teaser (echte losse cijfers, nooit een opgeteld
// totaal), de subsidie/lening-verhouding als balk, en rechts wat dit voor jouw
// woning dekt (de gekozen maatregelen) i.p.v. een administratieve overheidslaag.
export const Samenvatting = ({ data, bewonertype, plaats, maatregelen, bedragen, onMailKlik }: SamenvattingProps) => {
  const { totaal, subsidies, leningen } = data;
  const meervoud = totaal === 1 ? "regeling" : "regelingen";
  const heeftVerdeling = subsidies > 0 || leningen > 0;
  const subsidiePct = totaal > 0 ? Math.round((subsidies / totaal) * 100) : 0;

  // "Meer dan de meeste mensen denken" alleen als het ook echt oogt.
  const goedNieuws = totaal >= 3 && subsidies >= 1;

  return (
    <section
      aria-label="Samenvatting van je subsidieoverzicht"
      className="rounded-2xl border-2 bg-card p-6 shadow-card md:p-8"
      style={{ borderColor: "hsl(var(--accent) / 0.8)" }}
    >
      <div className="grid gap-6 md:grid-cols-[1.6fr_1fr] md:gap-10">
        {/* Links: de payoff + geruststelling */}
        <div>
          <p className="text-[17px] font-semibold text-muted-foreground">We vonden</p>
          <p className="mt-0.5 font-display font-bold leading-none text-primary" style={{ fontSize: "clamp(38px, 7vw, 52px)" }}>
            {totaal} <span className="align-baseline text-[0.5em] font-semibold">{meervoud}</span>
          </p>
          <p className="mt-2 text-[16px] text-foreground">
            voor jouw {WONINGWOORD[bewonertype]}
            {plaats ? (
              <>
                {" "}
                in <span className="font-semibold text-primary">{plaats}</span>
              </>
            ) : null}
          </p>

          {/* Bedrag-teaser: het sterkste concrete cijfer, in de type-kleuren. */}
          {(bedragen.subsidie || bedragen.lening) && (
            <p className="mt-3 text-[16px] leading-snug text-foreground">
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
            <div className="mt-4">
              <div className="flex h-3 overflow-hidden rounded-full" role="img" aria-label={`${subsidies} subsidies en ${leningen} leningen`}>
                {subsidies > 0 && <span style={{ width: `${subsidiePct}%`, backgroundColor: "hsl(var(--subsidie))" }} />}
                {leningen > 0 && <span style={{ width: `${100 - subsidiePct}%`, backgroundColor: "hsl(var(--lening))" }} />}
              </div>
              <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1 text-[14px] font-medium text-foreground">
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

          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-foreground/80">
            {goedNieuws ? "Dat is meer dan de meeste mensen denken. " : ""}Je hoeft hier niets uit te kiezen. Wij zoeken
            voor je uit wat in jouw situatie het meeste oplevert.
          </p>

          <button
            type="button"
            onClick={onMailKlik}
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-accent bg-accent/10 px-5 py-2.5 text-[14px] font-semibold text-primary transition-colors hover:bg-accent/20 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Mail size={16} strokeWidth={2} aria-hidden="true" />
            Mail mij dit overzicht
            <ArrowRight size={15} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>

        {/* Rechts: de maatregelen waarop dit overzicht is gezocht (de gekozen
            maatregelen), i.p.v. de administratieve verdeling per overheidslaag.
            Bewust "gezocht voor", niet "dekt": de lijst is wat de bewoner koos,
            niet een dekkingsgarantie per regeling. Op mobiel (waar dit blok
            onder de samenvatting staat) volstaat één regel; de volledige lijst
            met vinkjes is er alleen op md+. */}
        <div className="md:border-l md:border-border md:pl-8">
          <p className="flex items-center gap-2.5 text-[14px] text-foreground md:hidden">
            <span
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: "hsl(var(--subsidie) / 0.12)" }}
              aria-hidden="true"
            >
              <Check size={12} strokeWidth={3} className="text-[hsl(var(--subsidie))]" />
            </span>
            {maatregelen.length === 1
              ? `Regelingen gezocht voor ${MAATREGEL_LABELS[maatregelen[0]]}`
              : `Regelingen gezocht voor al je ${maatregelen.length} gekozen maatregelen`}
          </p>
          <div className="hidden md:block">
            <p className="text-[14px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Regelingen gezocht voor deze maatregelen
            </p>
            <ul className="mt-3 grid grid-cols-1 gap-x-4 gap-y-2.5">
              {maatregelen.map((m) => (
                <li key={m} className="flex items-center gap-2.5 text-[14px] text-foreground">
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
          </div>
        </div>
      </div>
    </section>
  );
};
