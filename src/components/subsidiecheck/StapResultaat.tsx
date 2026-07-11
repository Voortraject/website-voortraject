import { useEffect, useMemo, useState } from "react";
import { Check, Loader2 } from "lucide-react";

import { CtaButton } from "@/components/CtaButton";
import { useSubsidieCheck } from "@/hooks/useSubsidieCheck";
import type { PdokAdres } from "@/lib/pdok";
import { groepeerPerNiveau, NIVEAU_LABELS, type SubsidieCheckInput } from "@/lib/subsidies";

import { MailOverzicht } from "./MailOverzicht";
import { SubsidieCard } from "./SubsidieCard";

interface StapResultaatProps {
  input: SubsidieCheckInput;
  adres: PdokAdres;
}

// Eerlijke laadsequentie, gekoppeld aan de echte fetch: vertelt wát er
// doorzocht wordt (landelijk → provinciaal → gemeentelijk). Bij
// prefers-reduced-motion slaan we de sequentie over.
const useLaadsequentie = (klaar: boolean) => {
  const reduced = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );
  const [fase, setFase] = useState(reduced ? 3 : 0);

  useEffect(() => {
    if (reduced) return;
    if (fase >= 3) return;
    // De laatste stap wacht op de echte fetch; de eerste twee tikken door.
    if (fase === 2 && !klaar) return;
    const t = setTimeout(() => setFase((f) => f + 1), 450);
    return () => clearTimeout(t);
  }, [fase, klaar, reduced]);

  return fase;
};

export const StapResultaat = ({ input, adres }: StapResultaatProps) => {
  const { data: regelingen, isPending, isError, refetch } = useSubsidieCheck(input);
  const fase = useLaadsequentie(!isPending);
  const laden = isPending || fase < 3;

  const groepen = useMemo(() => groepeerPerNiveau(regelingen ?? []), [regelingen]);
  const adresRegel = `${adres.straatnaam} ${input.huisnummer}, ${adres.woonplaatsnaam}`;

  if (isError) {
    return (
      <div role="alert" className="rounded-lg border border-border bg-card p-6 text-center">
        <p className="text-[15px] leading-relaxed text-foreground">
          Er ging iets mis bij het ophalen van de regelingen. Probeer het zo nog eens.
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-4 inline-flex items-center justify-center rounded-full border border-primary px-6 py-2.5 text-[14px] font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Opnieuw proberen
        </button>
      </div>
    );
  }

  if (laden) {
    const stappen = [
      "Landelijke regelingen doorzoeken",
      input.provincie ? `Provinciale regelingen voor ${input.provincie} doorzoeken` : "Provinciale regelingen doorzoeken",
      input.gemeente ? `Regelingen van gemeente ${input.gemeente} doorzoeken` : "Gemeentelijke regelingen doorzoeken",
    ];
    return (
      <div className="rounded-lg border border-border bg-card p-6 md:p-8" aria-live="polite" aria-busy="true">
        <p className="text-[15px] font-semibold text-primary">We zoeken de regelingen voor {adresRegel}…</p>
        <ul className="mt-4 flex flex-col gap-2.5">
          {stappen.map((label, i) => {
            const gedaan = fase > i;
            const bezig = fase === i;
            return (
              <li key={label} className="flex items-center gap-2.5 text-[14px]">
                {gedaan ? (
                  <Check size={16} strokeWidth={2.5} className="shrink-0 text-accent" aria-hidden="true" />
                ) : bezig ? (
                  <Loader2 size={16} className="shrink-0 animate-spin text-primary/50" aria-hidden="true" />
                ) : (
                  <span className="inline-block h-4 w-4 shrink-0 rounded-full border border-border" aria-hidden="true" />
                )}
                <span className={gedaan || bezig ? "text-foreground" : "text-muted-foreground"}>{label}</span>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  const aantal = regelingen?.length ?? 0;

  if (aantal === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-center md:p-8">
        <h3 className="font-display text-[18px] font-semibold text-primary">
          Voor deze combinatie vonden we geen regelingen
        </h3>
        <p className="mx-auto mt-2 max-w-md text-[15px] leading-relaxed text-foreground/80">
          Regelingen veranderen vaak en soms zit er meer in dan een eerste check laat zien. Wil je dat wij even
          meekijken? Dat kost je niets.
        </p>
        <div className="mt-5 flex justify-center">
          <CtaButton href="/contact">Plan een gratis gesprek</CtaButton>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div aria-live="polite">
        <h2 className="h3-block text-primary">
          {aantal} {aantal === 1 ? "regeling" : "regelingen"} gevonden voor {adresRegel}
        </h2>
      </div>

      <div className="mt-6 flex flex-col gap-8">
        {groepen.map(({ niveau, regelingen: groep }) => (
          <section key={niveau} aria-label={NIVEAU_LABELS[niveau]}>
            <h3 className="mb-3 text-[13px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              {NIVEAU_LABELS[niveau]}
            </h3>
            <div className="flex flex-col gap-3">
              {groep.map((regeling, i) => (
                <div
                  key={regeling.id}
                  className="animate-fade-up"
                  style={{ animationDelay: `${Math.min(i * 50, 300)}ms` }}
                >
                  <SubsidieCard regeling={regeling} />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-6 text-[12px] text-muted-foreground">
        Indicatief overzicht op basis van je postcode — of een regeling openstaat hangt af van voorwaarden en
        beschikbaar budget. Aan dit overzicht kunnen geen rechten worden ontleend.
      </p>

      {/* Kalme conversie-afsluiting: hulp aanbieden, niet verkopen. */}
      <div
        className="mt-8 rounded-xl border border-border p-6 md:p-8"
        style={{ backgroundColor: "var(--card-soft)" }}
      >
        <h3 className="font-display text-[19px] font-semibold text-primary md:text-[21px]">
          Subsidies stapelen luistert nauw
        </h3>
        <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-foreground/80">
          Welke regelingen je mag combineren, in welke volgorde je aanvraagt en wat er per postcodegebied openstaat —
          wij zoeken het voor je uit en regelen de aanvraag. Gratis en vrijblijvend.
        </p>
        <div className="mt-5">
          <CtaButton href="/contact">Plan een gratis gesprek</CtaButton>
        </div>

        <div className="my-6 h-px bg-border" role="separator" />

        <MailOverzicht input={input} adres={adres} regelingen={regelingen ?? []} />
      </div>
    </div>
  );
};
