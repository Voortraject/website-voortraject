import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Link2, Loader2 } from "lucide-react";

import { CtaButton } from "@/components/CtaButton";
import { usePand3d } from "@/hooks/usePand3d";
import { usePandContour } from "@/hooks/usePandContour";
import { useSubsidieCheck } from "@/hooks/useSubsidieCheck";
import { useWoningInfo } from "@/hooks/useWoningInfo";
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
import { Woningpaneel } from "./Woningpaneel";

interface StapResultaatProps {
  input: SubsidieCheckInput;
  adres: PdokAdres;
}

// Duur per zoekstap in de laadsequentie. Bewust ruim (~1,13s × 3 stappen ≈ 3,4s
// totaal): een zichtbare, benoemde zoekstap verhoogt de gepercipieerde waarde
// van het resultaat (labor illusion). De laatste stap wacht bovendien op de
// echte fetch, dus bij een tragere bron duurt het vanzelf iets langer.
const STAP_MS = 1133;

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
  const { data: woning, isPending: woningBezig } = useWoningInfo(input.postcode, input.huisnummer, input.toevoeging);
  // Pand + 3D-model op topniveau (dus vóór de vroege returns): ze starten meteen
  // bij het mounten van dit scherm — bij het klikken naar het resultaat — en zijn
  // dus al klaar wanneer het woningpaneel verschijnt. Adresgebaseerd, dus gelijk
  // voor elke bewonertype-situatie.
  const { data: pand, isPending: pandBezig } = usePandContour(adres.centroideRd);
  // Progressief laden: eerst het subject-model zonder buren (1 item-fetch, ~2s)
  // zodat het huis snel verschijnt; de volledige versie mét buurpanden (~5s)
  // vervangt het zodra die klaar is.
  const { data: modelSubject, isPending: subjectBezig } = usePand3d(pand?.pandId);
  const { data: modelVol } = usePand3d(pand?.pandId, adres.centroideRd);
  const model = modelVol ?? modelSubject ?? null;
  const modelBezig = !model && !!pand?.pandId && subjectBezig;
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

  // Deel de tool zelf (niet dit overzicht): via de native deel-sheet (Web Share
  // API — WhatsApp, mail, enz.), met kopieer-link als terugval op desktop.
  const [gedeeld, setGedeeld] = useState(false);
  const deelTimer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(deelTimer.current), []);
  const deelTool = async () => {
    // Deel de kale URL (de mooiste variant, net als handmatig plakken). WhatsApp
    // toont bij een kale link de rijke preview-kaart; sturen we er tekst bij mee,
    // dan slaat WhatsApp die preview bij het delen vaak over.
    const url = `${window.location.origin}/subsidiecheck`;
    if (navigator.share) {
      try {
        await navigator.share({ url });
      } catch {
        /* door de gebruiker geannuleerd */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setGedeeld(true);
      clearTimeout(deelTimer.current);
      deelTimer.current = setTimeout(() => setGedeeld(false), 2500);
    } catch {
      /* clipboard geweigerd */
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

  // Eén woningpaneel-element, gebruikt in zowel de "geen regelingen"-tak als het
  // normale resultaat — zo verschijnt het in elke situatie (bewonertype/aantal).
  const woningpaneel = (
    <Woningpaneel
      adres={adres}
      input={input}
      pand={pand ?? null}
      pandBezig={pandBezig}
      model={model}
      modelBezig={modelBezig}
    />
  );

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
    // Eén zoekstap tegelijk, prominent in beeld; de stappen wisselen elkaar
    // rustig kruisvervagend af (fase stuurt welke actief is).
    const idx = Math.min(fase, stappen.length - 1);
    return (
      <div
        className="mx-auto max-w-[560px] animate-fade-up rounded-2xl border border-border bg-card p-8 text-center shadow-card md:p-10"
        aria-live="polite"
        aria-busy="true"
      >
        <p className="text-[13.5px] text-muted-foreground">We zoeken de regelingen voor {adresRegel}</p>

        <Loader2 size={26} className="mx-auto mt-8 animate-spin text-accent" aria-hidden="true" />

        {/* De actuele stap groot in beeld; absoluut gestapeld zodat ze rustig
            in elkaar overvloeien zonder de layout te laten springen. */}
        <div className="relative mx-auto mt-4 h-[64px]">
          {stappen.map((label, i) => (
            <p
              key={i}
              className="absolute inset-0 flex items-center justify-center px-4 text-[18px] font-semibold leading-snug text-primary transition-all duration-500 ease-out md:text-[20px]"
              style={{
                opacity: i === idx ? 1 : 0,
                transform: i === idx ? "translateY(0)" : i < idx ? "translateY(-12px)" : "translateY(12px)",
              }}
              aria-hidden={i !== idx}
            >
              {label}
            </p>
          ))}
        </div>

        {/* Voortgangsstippen: de actieve rekt rustig uit tot een okerbalkje. */}
        <div className="mt-7 flex items-center justify-center gap-2.5" aria-hidden="true">
          {stappen.map((_, i) => (
            <span
              key={i}
              className="h-2 rounded-full transition-all duration-500 ease-out"
              style={{
                width: i === idx ? 24 : 8,
                backgroundColor: i <= idx ? "hsl(var(--accent))" : "hsl(var(--border))",
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  const aantal = regelingen?.length ?? 0;

  if (aantal === 0) {
    return (
      <div className="grid gap-4 md:grid-cols-[1fr_300px] md:items-start md:gap-6">
        <div className="rounded-2xl border border-border bg-card p-6 text-center md:p-8">
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
        {woningpaneel}
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

      {/* Split-hero: links het persoonlijke woningpaneel (luchtfoto +
          energielabel), rechts de samenvatting — die het zwaartepunt houdt
          (bredere kolom). Op mobiel onder elkaar, woningpaneel eerst. */}
      <div className="grid gap-4 md:grid-cols-[1fr_300px] md:items-start md:gap-6">
        {/* De piek: conclusie eerst (inverted pyramid), dan pas de lijst. De
            foto staat rechts (smalle kolom), de samenvatting links (breed). */}
        <Samenvatting
          data={samenvatting}
          bewonertype={input.bewonertype}
          plaats={input.gemeente ?? input.provincie}
          maatregelen={input.maatregelen}
          bedragen={bedragen}
          energielabel={woning?.energielabel ?? null}
          energielabelBezig={woningBezig}
          onMailKlik={scrollNaarMail}
          onDeelTool={deelTool}
          deelGedeeld={gedeeld}
        />
        {woningpaneel}
      </div>

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
