import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Link2, Loader2 } from "lucide-react";

import { CtaButton } from "@/components/CtaButton";
import { useSubsidieCheck } from "@/hooks/useSubsidieCheck";
import { pushGtmEvent } from "@/lib/gtm";
import type { PdokAdres } from "@/lib/pdok";
import {
  groepeerPerNiveau,
  maakSamenvatting,
  NIVEAU_LABELS,
  subsidieProvider,
  type SubsidieCheckInput,
  topBedragen,
} from "@/lib/subsidies";

import { MailOverzicht } from "./MailOverzicht";
import { Samenvatting } from "./Samenvatting";
import { SubsidieCard } from "./SubsidieCard";
import { TrajectStrip } from "./TrajectStrip";

interface StapResultaatProps {
  input: SubsidieCheckInput;
  adres: PdokAdres;
}

// Duur per zoekstap in de laadsequentie. Bewust ruim (~0,8s × 3 stappen ≈ 2,4s
// totaal): een zichtbare, benoemde zoekstap verhoogt de gepercipieerde waarde
// van het resultaat (labor illusion). Sweet spot is 2 à 3s; ga er niet ver
// overheen, dan slaat het om in ongeduld. De laatste stap wacht bovendien op de
// echte fetch, dus bij een tragere bron duurt het vanzelf iets langer.
const STAP_MS = 800;

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
    const t = setTimeout(() => setFase((f) => f + 1), STAP_MS);
    return () => clearTimeout(t);
  }, [fase, klaar, reduced]);

  return fase;
};

export const StapResultaat = ({ input, adres }: StapResultaatProps) => {
  const { data: regelingen, isPending, isError, refetch } = useSubsidieCheck(input);
  const fase = useLaadsequentie(!isPending);
  const laden = isPending || fase < 3;

  // De URL bevat de volledige check-state, dus de link ís het overzicht —
  // handig om te delen met partner of buren.
  const [gekopieerd, setGekopieerd] = useState(false);
  const kopieerTimer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(kopieerTimer.current), []);
  const kopieerLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setGekopieerd(true);
      clearTimeout(kopieerTimer.current);
      kopieerTimer.current = setTimeout(() => setGekopieerd(false), 2500);
    } catch {
      /* clipboard geweigerd → knop doet stil niets */
    }
  };

  // Vanuit de samenvatting (bovenaan) naar het mailformulier springen.
  const conversieRef = useRef<HTMLDivElement>(null);
  const scrollNaarMail = () => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    conversieRef.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    window.setTimeout(() => document.getElementById("sc-mail-email")?.focus({ preventScroll: true }), reduced ? 0 : 450);
  };

  const groepen = useMemo(() => groepeerPerNiveau(regelingen ?? []), [regelingen]);
  const samenvatting = useMemo(() => maakSamenvatting(regelingen ?? []), [regelingen]);
  const bedragen = useMemo(() => topBedragen(regelingen ?? []), [regelingen]);
  const adresRegel = `${adres.straatnaam} ${input.huisnummer}${input.toevoeging ? ` ${input.toevoeging}` : ""}, ${adres.woonplaatsnaam}`;

  // Eén event per getoond resultaat (ook bij 0 regelingen — dat is óók funnel-data).
  const resultaatGemeld = useRef(false);
  useEffect(() => {
    if (laden || isError || resultaatGemeld.current) return;
    resultaatGemeld.current = true;
    pushGtmEvent("subsidiecheck_voltooid", {
      aantal_regelingen: regelingen?.length ?? 0,
      bewonertype: input.bewonertype,
      gemeente: input.gemeente ?? "",
      provincie: input.provincie ?? "",
    });
  }, [laden, isError, regelingen, input]);

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
      <div
        className="mx-auto max-w-[640px] rounded-lg border border-border bg-card p-6 md:p-8"
        aria-live="polite"
        aria-busy="true"
      >
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
      <div className="mx-auto max-w-[640px] rounded-lg border border-border bg-card p-6 text-center md:p-8">
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
      {/* Zolang de mock actief is: eerlijk melden dat dit voorbeelddata is.
          Verdwijnt vanzelf zodra de echte provider is aangesloten. */}
      {subsidieProvider.naam === "Voorbeeldgegevens" && (
        <p className="mx-auto mb-4 max-w-xl rounded-lg border border-accent/50 bg-accent/10 px-4 py-2.5 text-center text-[13px] text-foreground/80">
          <strong className="font-semibold">Let op:</strong> dit zijn voorbeeldgegevens om de tool te testen.
          De echte subsidiebron wordt nog aangesloten.
        </p>
      )}

      {/* De piek: conclusie eerst (inverted pyramid), dan pas de lijst. */}
      <Samenvatting
        data={samenvatting}
        bewonertype={input.bewonertype}
        plaats={input.gemeente ?? input.provincie}
        maatregelen={input.maatregelen}
        bedragen={bedragen}
        onMailKlik={scrollNaarMail}
      />

      {/* Endowed progress: stap 1 (overzicht) is klaar, drie stappen te gaan. */}
      <TrajectStrip />

      {/* Groepen onder elkaar (landelijk → lokaal, layer-cake-scan), met de
          kaarten binnen een groep naast elkaar op desktop. */}
      <div className="mt-8 flex flex-col gap-8">
        {groepen.map(({ niveau, regelingen: groep }) => (
          <section key={niveau} aria-label={NIVEAU_LABELS[niveau]}>
            <h2 className="mb-3 flex items-center gap-2 text-[14px] font-semibold uppercase tracking-[0.08em] text-primary">
              {NIVEAU_LABELS[niveau]}
              <span className="font-normal text-muted-foreground">· {groep.length}</span>
            </h2>
            <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-2">
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

      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2">
        <button
          type="button"
          onClick={kopieerLink}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-[13px] font-medium text-primary transition-colors hover:border-primary/40 min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-live="polite"
        >
          {gekopieerd ? (
            <>
              <Check size={14} strokeWidth={2.5} className="text-accent" aria-hidden="true" />
              Link gekopieerd
            </>
          ) : (
            <>
              <Link2 size={14} strokeWidth={2} aria-hidden="true" />
              Kopieer link naar dit overzicht
            </>
          )}
        </button>
        <p className="text-[12px] italic text-muted-foreground">
          Indicatief overzicht op basis van je postcode. Aan dit overzicht kunnen geen rechten worden ontleend.
        </p>
      </div>

      {/* Conversie-afsluiting met endowed-progress: stap 1 is al gedaan. De
          laagdrempeligste actie eerst (overzicht in de mail), dan het gesprek. */}
      <div
        ref={conversieRef}
        className="mt-10 scroll-mt-24 rounded-xl border border-border p-6 md:p-8"
        style={{ backgroundColor: "var(--card-soft)" }}
      >
        <h3 className="font-display text-[19px] font-semibold text-primary md:text-[21px]">
          Ontvang dit overzicht in je mail
        </h3>
        <div className="mt-5">
          <MailOverzicht input={input} adres={adres} regelingen={regelingen ?? []} />
        </div>

        <div className="my-6 h-px bg-border" role="separator" />

        <p className="max-w-xl text-[15px] leading-relaxed text-foreground/80">
          Liever direct weten wat er voor jou in zit? In een gratis gesprek zoeken we voor jouw adres uit welke
          regelingen je kunt combineren en stapelen, en regelen we de aanvraag.
        </p>
        <a
          href="/contact"
          className="mt-4 inline-flex items-center justify-center rounded-full border border-primary px-6 py-3 text-[15px] font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Plan een gratis gesprek
        </a>

        {/* Rustige geruststelling naast de CTA (geen verzonnen sterren). */}
        <ul className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1">
          {["Vrijblijvend", "Reactie binnen 24 uur", "Lokaal adviesteam"].map((belofte) => (
            <li key={belofte} className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground">
              <Check size={14} strokeWidth={2.5} className="shrink-0 text-accent" aria-hidden="true" />
              {belofte}
            </li>
          ))}
        </ul>
      </div>

      {/* Warm slot (peak-end): de pagina eindigt menselijk, niet juridisch. */}
      <p className="mt-6 text-center text-[15px] leading-relaxed text-foreground/70">
        Veel regelingen blijven onbenut. Jij bent nu een stap verder dan de meeste woningeigenaren.
      </p>
    </div>
  );
};
