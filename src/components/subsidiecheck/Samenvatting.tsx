import { ArrowRight, Mail } from "lucide-react";

import {
  type Bewonertype,
  NIVEAU_KORT,
  type Samenvatting as SamenvattingData,
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
  /** Scrollt naar het mailformulier onder de lijst. */
  onMailKlik: () => void;
}

// Het samenvattingsblok bovenaan het resultaat — dé piek van de flow
// (peak-end): eerst de conclusie (inverted pyramid), dan pas de lijst. Groot
// aantal (cijfers trekken het oog), de ingevulde situatie teruggekoppeld, de
// subsidie/lening-verdeling, een kleurlegenda die tegelijk de kaarten hieronder
// verklaart, en één zin die de keuzestress wegneemt.
export const Samenvatting = ({ data, bewonertype, plaats, onMailKlik }: SamenvattingProps) => {
  const { totaal, subsidies, leningen, perNiveau } = data;
  const meervoud = totaal === 1 ? "regeling" : "regelingen";
  const heeftVerdeling = subsidies > 0 || leningen > 0;

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
            {heeftVerdeling ? (
              <span className="text-muted-foreground">
                {" — "}
                {subsidies > 0 ? (
                  <span className="font-medium text-[hsl(var(--subsidie))]">
                    {subsidies} {subsidies === 1 ? "subsidie" : "subsidies"}
                  </span>
                ) : null}
                {subsidies > 0 && leningen > 0 ? " · " : null}
                {leningen > 0 ? (
                  <span className="font-medium text-[hsl(var(--lening))]">
                    {leningen} {leningen === 1 ? "lening" : "leningen"}
                  </span>
                ) : null}
              </span>
            ) : null}
          </p>

          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-foreground/80">
            Je hoeft hier niets uit te kiezen. Veel regelingen zijn te combineren. Wij zoeken voor je uit wat in
            jouw situatie het meeste oplevert.
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

        {/* Rechts: verdeling per niveau (landelijk → lokaal) als rustige lijst.
            Kleur zit nu op het type (groen/terracotta), niet op het niveau. */}
        <div className="md:border-l md:border-border md:pl-8">
          <p className="text-[14px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Verdeling</p>
          <ul className="mt-3 flex flex-col gap-2">
            {perNiveau.map(({ niveau, aantal }) => (
              <li key={niveau} className="flex items-center gap-2.5 text-[14px] text-foreground">
                <span className="flex-1">{NIVEAU_KORT[niveau]}</span>
                <span className="font-semibold text-primary">{aantal}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
