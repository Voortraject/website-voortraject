import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Link2, MessageCircle } from "lucide-react";

import { useLaadsequentie } from "@/hooks/useLaadsequentie";
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

import { Bewijsregel } from "./Bewijsregel";
import { DirectContact } from "./DirectContact";
import { GeenRegelingen } from "./GeenRegelingen";
import { MailOverzicht } from "./MailOverzicht";
import { MobieleActiebalk } from "./MobieleActiebalk";
import { Samenvatting } from "./Samenvatting";
import { SubsidieCard } from "./SubsidieCard";
import { scrollNaarVraag } from "./vraagFocus";
import { Woningpaneel } from "./Woningpaneel";
import { ZoekKaart } from "./Zoeksequentie";

interface StapResultaatProps {
  input: SubsidieCheckInput;
  adres: PdokAdres;
  /** Met de gegevens-poort zijn naam/e-mail/telefoon al binnen: dan geen
      "mail mij dit overzicht"-blok (en -knop) meer op het resultaat. */
  verbergMail?: boolean;
  /** De zoeksequentie draaide al in de poort. Hem hier herhalen zou de bezoeker
      een tweede keer laten wachten op iets dat al in de cache staat. */
  alGezocht?: boolean;
}

export const StapResultaat = ({ input, adres, verbergMail = false, alGezocht = false }: StapResultaatProps) => {
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
  // Met de poort aan is er hier niets meer te zoeken: dat gebeurde al op de
  // vorige stap en het antwoord staat in de cache.
  const fase = useLaadsequentie(!isPending, alGezocht);
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

  // Hier stond een tweede knop "Deel de tool" naast "Kopieer link naar dit
  // overzicht". Twee deelknoppen naast elkaar die bij het klikken allebei "Link
  // gekopieerd" tonen, terwijl ze een andere link kopiëren. Die van het overzicht
  // blijft: overleggen met een partner is een echte stap in dit traject, en die
  // link bevat het adres. Wie de tool zelf wil doorgeven, kan dezelfde link
  // sturen.

  // Een voorstel voor het vraagveld onderaan, gezet door knoppen die iets
  // concreets vragen (zoals "Label aanvragen"). De teller telt de kliks mee,
  // zodat hetzelfde voorstel opnieuw wordt ingevuld als de bezoeker het veld
  // tussendoor heeft leeggemaakt; zonder die teller verandert het object niet
  // en gebeurt er bij de tweede klik niets.
  const [voorstel, setVoorstel] = useState<{ tekst: string; n: number } | undefined>();
  const vraagMetVoorstel = (tekst: string, plek: string) => {
    setVoorstel((huidig) => ({ tekst, n: (huidig?.n ?? 0) + 1 }));
    pushGtmEvent("subsidiecheck_vraag_cta", { bewonertype: input.bewonertype, plek });
    scrollNaarVraag();
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
  // Deelbare URL van dit overzicht: gaat mee naar het team, zodat een adviseur
  // precies ziet waar de vraag over gaat.
  const overzichtUrl = typeof window !== "undefined" ? window.location.href : undefined;
  const whatsappBericht = `Hallo, ik heb de subsidiecheck gedaan voor ${adresRegel}. Ik heb daar een vraag over:`;

  // Eén woningpaneel-element, gebruikt in zowel de "geen regelingen"-tak als het
  // normale resultaat — zo verschijnt het in elke situatie (bewonertype/aantal).
  // De contactknop staat onder het woningkaartje, buiten het witte vlak: binnenin
  // leek "Ik heb een vraag" over de foto's te gaan.
  const woningpaneel = (
    <div className="flex flex-col gap-3">
      <Woningpaneel
        adres={adres}
        input={input}
        pand={pand ?? null}
        pandBezig={pandBezig}
        model={model}
        modelBezig={modelBezig}
      />
      <button
        type="button"
        onClick={() => {
          pushGtmEvent("subsidiecheck_vraag_cta", { bewonertype: input.bewonertype, plek: "woningpaneel" });
          scrollNaarVraag();
        }}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-[14px] font-semibold text-primary-foreground transition-opacity hover:opacity-90 min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <MessageCircle size={16} strokeWidth={2} aria-hidden="true" />
        Ik heb een vraag
      </button>
    </div>
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
    return (
      <ZoekKaart adresRegel={adresRegel} gemeente={input.gemeente} provincie={input.provincie} fase={fase} />
    );
  }

  const aantal = regelingen?.length ?? 0;

  if (aantal === 0) {
    // Ook zonder regelingen blijft de bezoeker hier: vroeger stond hier alleen een
    // link naar /contact en verdween de vraag (en de lead) volledig.
    return (
      <>
        <div className="grid gap-4 md:grid-cols-[1fr_300px] md:items-start md:gap-6">
          <GeenRegelingen input={input} />
          {woningpaneel}
        </div>
        <div className="mt-6">
          <DirectContact input={input} adres={adres} overzichtUrl={overzichtUrl} voorstel={voorstel} />
        </div>
        <MobieleActiebalk whatsappBericht={whatsappBericht} bewonertype={input.bewonertype} />
      </>
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
          toonMailKnop={!verbergMail}
          // "Label aanvragen" stuurde de bezoeker naar /contact, waar hij alles
          // opnieuw moest invullen wat hij hier al gaf. Nu springt hij naar het
          // vraagblok onderaan met de aanvraag al ingevuld: alleen nog versturen.
          onLabelAanvraag={() =>
            vraagMetVoorstel(
              "Ik wil graag een energielabel laten aanvragen voor mijn woning. Kunnen jullie dat voor mij regelen?",
              "energielabel",
            )
          }
        />
        {woningpaneel}
      </div>

      {/* Bronvermelding — de subsidie-informatie komt uit de Energiesubsidiewijzer
          van Milieu Centraal. Staat bewust bij de getoonde regelingen. */}
      <p className="mt-6 text-center text-[12.5px] leading-relaxed text-muted-foreground">
        Subsidie-informatie in samenwerking met voorlichtingsorganisatie{" "}
        <a
          href="https://www.milieucentraal.nl"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-sm underline underline-offset-2 transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Milieu Centraal
        </a>
        .
      </p>

      {/* De combineer-uitleg, één keer. Stond eerder op élke kaart in de uitklap
          ("Vaak te combineren met andere regelingen…"), dus twaalf keer dezelfde
          zin. Hier staat hij op het moment dat de vraag opkomt: de bezoeker ziet
          net een lijst en vraagt zich af of hij moet kiezen. Bewust rustig
          vormgegeven, geen tweede CTA: de contactroute staat onder de lijst. */}
      <div
        className="mt-6 rounded-xl border border-border px-5 py-4 md:px-6"
        style={{ backgroundColor: "var(--card-soft)" }}
      >
        <p className="text-[15px] leading-relaxed text-foreground/80">
          <span className="font-semibold text-primary">Je hoeft hier niet uit te kiezen.</span> Veel van deze
          regelingen zijn te combineren, maar niet allemaal en niet in elke volgorde. Wij zoeken gratis voor je uit
          welke combinatie voor jouw woning het meeste oplevert.{" "}
          <a
            href="/subsidies/stapelen"
            className="rounded-sm font-semibold text-primary underline underline-offset-4 transition-opacity hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Hoe stapelen werkt
          </a>
        </p>
      </div>

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

      {/* Zachte mail-route: met de gegevens-poort (verbergMail) zijn deze gegevens
          al vooraf opgehaald, dan slaan we dit blok over. */}
      {!verbergMail && (
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
        </div>
      )}

      {/* De contactstap: één veld voor wie door de poort kwam, plus WhatsApp en
          bellen voor wie liever niet typt. Verving de losse "Plan een gratis
          gesprek"-link naar /contact, waar de bezoeker álles opnieuw invulde wat
          hij hier al had gegeven. */}
      <div className={verbergMail ? "mt-10" : "mt-6"}>
        <DirectContact input={input} adres={adres} overzichtUrl={overzichtUrl} voorstel={voorstel} />
      </div>

      {/* Rustige geruststelling onder de CTA, met onze echte Google-score ernaast.
          Op mobiel vallen de vinkjes weg en scheiden puntjes de beloftes, zodat
          die drie naast elkaar blijven staan. */}
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
        <ul className="flex flex-nowrap items-center gap-x-2 whitespace-nowrap text-[12px] text-muted-foreground sm:gap-x-4 sm:text-[13px]">
          {["Vrijblijvend", "Reactie binnen 24 uur", "Lokaal adviesteam"].map((belofte, i) => (
            <li key={belofte} className="inline-flex items-center gap-1.5">
              {i > 0 && (
                <span aria-hidden="true" className="text-border sm:hidden">
                  ·
                </span>
              )}
              <Check size={14} strokeWidth={2.5} className="hidden shrink-0 text-accent sm:inline" aria-hidden="true" />
              {belofte}
            </li>
          ))}
        </ul>
        <Bewijsregel />
      </div>

      {/* Warm slot (peak-end): de pagina eindigt menselijk, niet juridisch. */}
      <p className="mt-6 text-center text-[15px] leading-relaxed text-foreground/70">
        Veel regelingen blijven onbenut. Jij bent nu een stap verder dan de meeste woningeigenaren.
      </p>

      <MobieleActiebalk whatsappBericht={whatsappBericht} bewonertype={input.bewonertype} />
    </div>
  );
};
