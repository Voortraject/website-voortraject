import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check } from "lucide-react";

import { isTestmodus } from "@/config/testmodus";
import { useLaadsequentie } from "@/hooks/useLaadsequentie";
import { usePand3d } from "@/hooks/usePand3d";
import { usePandContour } from "@/hooks/usePandContour";
import { useSubsidieCheck } from "@/hooks/useSubsidieCheck";
import { useWoningInfo } from "@/hooks/useWoningInfo";
import { pushGtmEvent } from "@/lib/gtm";
import { inNijBegunGebied } from "@/lib/nijBegun";
import type { PdokAdres } from "@/lib/pdok";
import {
  groepeerPerNiveau,
  maakSamenvatting,
  NIVEAU_LABELS,
  subsidieProvider,
  type SubsidieCheckInput,
  topBedragen,
} from "@/lib/subsidies";

import "./resultaat.css";

import { useStaffel } from "./beweging";
import { Bewijsregel } from "./Bewijsregel";
import { leesContact } from "./contactOpslag";
import { DeelDeCheck } from "./DeelDeCheck";
import { DirectContact } from "./DirectContact";
import { EersteStap } from "./EersteStap";
import { GeenRegelingen } from "./GeenRegelingen";
import { kanOverzichtMailen } from "./leadFormulier";
import { MobieleActiebalk } from "./MobieleActiebalk";
import { Samenvatting } from "./Samenvatting";
import { SubsidieCard } from "./SubsidieCard";
import { LastigsteVraag } from "./LastigsteVraag";
import { IsolatieplanRij, LabelRegel, MiniTellers, Tellers } from "./Tellers";
import { stuurSessieBericht } from "./uitzoekAanvraag";
import { useBreed } from "./useBreed";
import { useUitzoek } from "./useUitzoek";
import { scrollNaarVraag } from "./vraagFocus";
import { Woningpaneel } from "./Woningpaneel";
import { ZoekKaart } from "./Zoeksequentie";

interface StapResultaatProps {
  input: SubsidieCheckInput;
  adres: PdokAdres;
  /** De bezoeker komt hier net vandaan de poort (niet via een herlaad of een
      gedeelde link). Dan tonen we het aankomstmoment. */
  netBinnen?: boolean;
}

// De vragen die een knop elders op het resultaat in het vraagblok zet.
const LABEL_VRAAG =
  "Ik wil graag een energielabel laten aanvragen voor mijn woning. Kunnen jullie dat voor mij regelen?";
const PLAN_VRAAG = "Ik wil graag een isolatieplan aanvragen voor mijn woning. Kunnen jullie dat voor mij regelen?";
// Als de oker knop niet in één klik kan (geen gegevens uit de poort in deze
// sessie), staat het verzoek zo klaar in het vraagblok.
const UITZOEK_VRAAG = "Ik wil graag dat jullie gratis uitzoeken wat ik voor mijn woning kan krijgen.";

export const StapResultaat = ({
  input,
  adres,
  netBinnen = false,
}: StapResultaatProps) => {
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
  // Hier valt niets meer te zoeken: dat gebeurde al zichtbaar op de poortstap en
  // het antwoord staat in de cache. De sequentie hier herhalen zou de bezoeker
  // een tweede keer laten wachten op iets dat er al is.
  const fase = useLaadsequentie(!isPending, true);
  const laden = isPending || fase < 3;

  // Delen zit nu in DeelDeCheck onderaan de pagina: dat deelt de kále tool, niet
  // deze URL. De URL van dit overzicht bevat postcode en huisnummer, dus wie hem
  // doorstuurde deelde zijn eigen adres en liet de ander naar het verkeerde huis
  // kijken. Voor de bezoeker zelf blijft die link gewoon bestaan — hij staat in
  // zijn mail ("bekijk of deel je volledige overzicht online").

  // Het aankomstmoment. De bezoeker heeft net zijn gegevens gegeven en krijgt
  // waar hij op wachtte; dat kwam er tot nu toe als een harde swap in, want de
  // regelingen stonden al in de cache. Eén regel bevestiging plus een rustige
  // beweging maken er een aankomst van in plaats van een schermwissel.
  //
  // Alleen op de rendering direct na het verzenden (`netBinnen`), dus niet bij
  // een herlaad of een gedeelde link: dan is er niets te vieren en zou het
  // permanente ruis zijn.
  //
  // Bewegingsreductie respecteren we zoals elders in de check: dan geen
  // animatieklassen, wel gewoon de bevestiging.
  const reducedMotion = useMemo(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );
  const beweeg = netBinnen && !reducedMotion;
  // De mail is alleen echt verstuurd als er een mailroute is én we niet in
  // testmodus zitten. Beloven dat er een mail onderweg is die niet komt, is
  // precies het soort onwaarheid dat we net overal hebben weggehaald.
  const gemaildNaar = netBinnen && kanOverzichtMailen && !isTestmodus() ? leesContact()?.email : undefined;

  // Een voorstel voor het vraagveld onderaan, gezet door knoppen die iets
  // concreets vragen (zoals "Label aanvragen"). De teller telt de kliks mee,
  // zodat hetzelfde voorstel opnieuw wordt ingevuld als de bezoeker het veld
  // tussendoor heeft leeggemaakt; zonder die teller verandert het object niet
  // en gebeurt er bij de tweede klik niets.
  const [voorstel, setVoorstel] = useState<{ tekst: string; n: number } | undefined>();
  const vraagMetVoorstel = useCallback(
    (tekst: string, plek: string) => {
      setVoorstel((huidig) => ({ tekst, n: (huidig?.n ?? 0) + 1 }));
      pushGtmEvent("subsidiecheck_vraag_cta", { bewonertype: input.bewonertype, plek });
      scrollNaarVraag();
    },
    [input.bewonertype],
  );

  const groepen = useMemo(() => groepeerPerNiveau(regelingen ?? []), [regelingen]);
  const samenvatting = useMemo(() => maakSamenvatting(regelingen ?? []), [regelingen]);
  const bedragen = useMemo(() => topBedragen(regelingen ?? []), [regelingen]);
  const adresRegel = `${adres.straatnaam} ${input.huisnummer}${input.toevoeging ? ` ${input.toevoeging}` : ""}, ${adres.woonplaatsnaam}`;
  // Deelbare URL van dit overzicht: gaat mee naar het team, zodat een adviseur
  // precies ziet waar de vraag over gaat.
  const overzichtUrl = typeof window !== "undefined" ? window.location.href : undefined;
  const whatsappBericht = `Hallo, ik heb de subsidiecheck gedaan voor ${adresRegel}. Ik heb daar een vraag over:`;
  const nijBegun = inNijBegunGebied(adres);

  // De oker knop "Laat gratis uitzoeken wat ik krijg". Eén klik dient het
  // verzoek in met de gegevens uit de poort; de hoofdtegel en de mobiele
  // actiebalk delen deze toestand, want het is dezelfde knop.
  const geenContact = useCallback(() => vraagMetVoorstel(UITZOEK_VRAAG, "uitzoeken"), [vraagMetVoorstel]);
  const aanvraag = useUitzoek({ input, adres, overzichtUrl, geenContact });
  const knopZone = useRef<HTMLDivElement>(null);
  const pagina = useRef<HTMLDivElement>(null);
  const breed = useBreed();
  const resultaatSinds = useRef(Date.now());
  const stuurLastigst = useCallback(
    async (bericht: string) => {
      await stuurSessieBericht({ input, adres, overzichtUrl, sindsMs: resultaatSinds.current, bericht });
    },
    [input, adres, overzichtUrl],
  );
  const vraagLabel = () => vraagMetVoorstel(LABEL_VRAAG, "energielabel");
  const vraagPlan = () => vraagMetVoorstel(PLAN_VRAAG, "isolatieplan");

  // Eén woningpaneel-element, gebruikt in zowel de "geen regelingen"-tak als het
  // normale resultaat, zodat het in elke situatie verschijnt.
  //
  // Hier stond onder het paneel nog de knop "Ik wil gratis advies". Die is weg:
  // de oker knop in de hoofdtegel ernaast is de ene volgende stap, en een
  // tweede knop naar hetzelfde doel maakte het scherm drukker zonder iets toe te
  // voegen.
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

  // De eerste stap: één uitspraak over woningen uit dit bouwjaar, zonder link.
  // Desktop: in de hoofdtegel, onder het aantal, als context bij de knop. Daar
  // blijft hij staan: in de smalle woningkolom zou de zin die kolom hoger maken
  // dan de hoofdtegel, en dan is er weer lege ruimte. Telefoon: bij de woning.
  const eersteStap = <EersteStap bouwjaar={pand?.bouwjaar} bewonertype={input.bewonertype} />;

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

  // Blokken veren gestaffeld in; wat lager staat wacht tot het in beeld scrolt.
  useStaffel(pagina, !laden && !isError && (regelingen?.length ?? 0) > 0);

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
      <ZoekKaart
        adresRegel={adresRegel}
        gemeente={input.gemeente}
        provincie={input.provincie}
        fase={fase}
        klaar={!isPending}
      />
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
    <div ref={pagina}>
      {/* Zolang de mock actief is: eerlijk melden dat dit voorbeelddata is.
          Verdwijnt vanzelf zodra de echte provider is aangesloten. */}
      {subsidieProvider.naam === "Voorbeeldgegevens" && (
        <p className="mx-auto mb-4 max-w-xl rounded-lg border border-accent/50 bg-accent/10 px-4 py-2.5 text-center text-[13px] text-foreground/80">
          <strong className="font-semibold">Let op:</strong> dit zijn voorbeeldgegevens om de tool te testen.
          De echte subsidiebron wordt nog aangesloten.
        </p>
      )}

      {/* Het aankomstmoment, alléén als er echt iets te melden valt: dat de mail
          onderweg is. Dat is informatie die nergens anders staat. Zonder mail is
          de schermwissel zelf de bevestiging. */}
      {netBinnen && gemaildNaar && (
        <p
          role="status"
          className={`mb-4 flex items-center justify-center gap-2 text-center text-[14px] text-[hsl(var(--rs-tekst-zacht))] ${
            beweeg ? "animate-onthul" : ""
          }`}
        >
          <Check size={15} strokeWidth={2.5} className="shrink-0 text-[hsl(var(--subsidie))]" aria-hidden="true" />
          <span>
            Je overzicht is ook gemaild naar <span className="font-semibold text-foreground">{gemaildNaar}</span>
          </span>
        </p>
      )}

      {/* De indeling volgt één hiërarchie: eerst de kern (het aantal en de ene
          volgende stap), dan snel de regelingen zelf, en wat ondersteunt
          (woning, bouwjaar, label) daarna.

          Telefoon: de tellers als mini-rij in de hoofdtegel, het isolatieplan
          als één lage rij eronder, dan meteen de regelingen. De woning met de
          bouwjaarzin en het label staat na de eerste groep: daar onderbreekt
          hij de lijst rustig in plaats van hem weg te duwen.

          Desktop: de hoofdtegel breed met de woning als smalle kolom ernaast,
          daaronder de tellers met het isolatieplan, dan de regelingen. */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-stretch">
        {/* Op desktop even hoog als het woningpaneel ernaast. */}
        <div data-veer className="flex min-w-0 [&>section]:min-w-0 [&>section]:flex-1">
          <Samenvatting
            ref={knopZone}
            data={samenvatting}
            bewonertype={input.bewonertype}
            plaats={input.gemeente ?? input.provincie}
            // "Waaronder …" alleen op desktop: op de telefoon komt de eerste
            // regeling zo eerder in beeld, en de mini-rij noemt de aantallen al.
            bedragen={breed ? bedragen : {}}
            voet={breed ? eersteStap : undefined}
            tellers={
              breed ? undefined : <MiniTellers subsidies={samenvatting.subsidies} leningen={samenvatting.leningen} />
            }
            aanvraag={aanvraag}
            // Na de klik: één vraag die het belgesprek helpt. Bewaard bij
            // dezelfde lead, via dezelfde route als de knop zelf.
            naAanvraag={<LastigsteVraag verstuur={stuurLastigst} />}
          />
        </div>
        {breed && woningpaneel}
      </div>

      {breed ? (
        // Tellers zoals het CRM-dashboard, plus het isolatieplan in het Nij
        // Begun-gebied (anders het energielabel). "Label aanvragen" en het
        // isolatieplan springen naar het vraagblok met de aanvraag al ingevuld.
        <Tellers
          className="mt-4 grid"
          subsidies={samenvatting.subsidies}
          leningen={samenvatting.leningen}
          nijBegun={nijBegun}
          energielabel={woning?.energielabel ?? null}
          energielabelBezig={woningBezig}
          onLabelAanvraag={vraagLabel}
          onIsolatieplan={vraagPlan}
        />
      ) : (
        nijBegun && (
          <div className="mt-4">
            <IsolatieplanRij onIsolatieplan={vraagPlan} />
          </div>
        )
      )}

      {/* De regelingen: groepen onder elkaar (landelijk naar lokaal), met de
          kaarten binnen een groep naast elkaar op desktop. */}
      <div className="mt-8 flex flex-col gap-8 lg:mt-10 lg:gap-9">
        {/* Hier stond "Deze regelingen komen van verschillende overheden.
            Daarom kun je ze vaak naast elkaar aanvragen." Eraf op verzoek van
            de opdrachtgever (oktober 2026): de groepskoppen zeggen het al, en
            elke regel vóór de eerste regeling duwt die verder naar beneden. */}
        {groepen.map(({ niveau, regelingen: groep }, i) => (
          <Fragment key={niveau}>
            <section aria-label={NIVEAU_LABELS[niveau]}>
              <h2 className="flex items-baseline gap-2.5 font-display text-[20px] font-bold tracking-[-0.015em] text-primary lg:text-[22px]">
                {NIVEAU_LABELS[niveau]}
                <span className="font-sans text-[15px] font-bold tracking-normal text-[hsl(var(--rs-tekst-zacht))] lg:text-[16px]">
                  {groep.length}
                </span>
              </h2>
              <div className="mt-3.5 grid grid-cols-1 items-start gap-4 md:grid-cols-2 lg:mt-4">
                {groep.map((regeling) => (
                  <div key={regeling.id} data-veer>
                    <SubsidieCard regeling={regeling} />
                  </div>
                ))}
              </div>
            </section>

            {!breed && i === 0 && (
              <Woningpaneel
                adres={adres}
                input={input}
                pand={pand ?? null}
                pandBezig={pandBezig}
                model={model}
                modelBezig={modelBezig}
              >
                {eersteStap}
                <LabelRegel
                  energielabel={woning?.energielabel ?? null}
                  bezig={woningBezig}
                  onLabelAanvraag={vraagLabel}
                />
              </Woningpaneel>
            )}
          </Fragment>
        ))}
      </div>

      {/* Bronvermelding (Energiesubsidiewijzer van Milieu Centraal) en het
          voorbehoud, samen onder de lijst: ze horen bij de regelingen, maar
          hoeven niet vóór de eerste regeling te staan. */}
      <div className="mt-8 grid gap-1.5 text-[14px] leading-relaxed text-[hsl(var(--rs-tekst-zacht))]">
        <p>
          Subsidie-informatie in samenwerking met voorlichtingsorganisatie{" "}
          <a
            href="https://www.milieucentraal.nl"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-sm font-bold text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Milieu Centraal
          </a>
          .
        </p>
        <p>Indicatief overzicht op basis van je postcode. Aan dit overzicht kunnen geen rechten worden ontleend.</p>
      </div>

      {/* Het vraagblok: één veld voor wie door de poort kwam, plus WhatsApp voor
          wie liever niet typt. Hier landen ook "Label aanvragen", het
          isolatieplan en de vraag bij de eerste stap. */}
      <div className="mt-12">
        <DirectContact input={input} adres={adres} overzichtUrl={overzichtUrl} voorstel={voorstel} />
      </div>

      {/* Rustige geruststelling onder de CTA, met onze echte Google-score ernaast.
          Op mobiel vallen de vinkjes weg en scheiden puntjes de beloftes, zodat
          die drie naast elkaar blijven staan. */}
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
        <ul className="flex flex-nowrap items-center gap-x-2 whitespace-nowrap text-[12px] text-muted-foreground sm:gap-x-4 sm:text-[13px]">
          {["Vrijblijvend", "Reactie binnen 1 werkdag", "Lokaal adviesteam"].map((belofte, i) => (
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

      {/* Het slot van de pagina. Stond hier eerder als één warme zin ("veel
          regelingen blijven onbenut…"); die vroeg niets en is vervangen door de
          enige actie die op deze plek nog logisch is: geef de check door. Ná het
          adviesblok, zodat de twee niet om dezelfde aandacht vechten. */}
      <DeelDeCheck bewonertype={input.bewonertype} />

      <MobieleActiebalk
        whatsappBericht={whatsappBericht}
        bewonertype={input.bewonertype}
        aanvraag={{ status: aanvraag.status, start: aanvraag.start, knopZone }}
      />
    </div>
  );
};
