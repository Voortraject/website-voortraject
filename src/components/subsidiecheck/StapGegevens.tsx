import { FormEvent, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Check, FileCheck, HardHat, ListChecks, Loader2 } from "lucide-react";

import adviseurFoto from "@/assets/adviseur-tim.webp";
import { useLaadsequentie } from "@/hooks/useLaadsequentie";
import { pandContourOpties, usePandContour } from "@/hooks/usePandContour";
import { useSubsidieCheck } from "@/hooks/useSubsidieCheck";
import { useWoningInfo, woningInfoGeldig, woningInfoOpties } from "@/hooks/useWoningInfo";
import { formulierFoutMelding } from "@/lib/formulierFout";
import { pushGtmEvent } from "@/lib/gtm";
import { maakEventId } from "@/lib/herkomst";
import type { PdokAdres } from "@/lib/pdok";
import { subsidieProvider, type SubsidieCheckInput, type SubsidieRegeling } from "@/lib/subsidies";
import { useTurnstile } from "@/lib/turnstile";

import { Bewijsregel } from "./Bewijsregel";
import { bewaarContact } from "./contactOpslag";
import { Energielabel } from "./Energielabel";
import { Luchtfoto } from "./Luchtfoto";
import {
  MIN_INVULTIJD_MS,
  schrijfSubsidiecheckLead,
  valideerContact,
  verstuurSubsidiecheckLead,
  type LeadVerrijking,
} from "./leadFormulier";
import { TOESTEMMING_TEKST, toestemmingVelden } from "./toestemming";
import { ZoekKaart } from "./Zoeksequentie";

// Wit en zacht verzonken, geen harde rand (.instap-invoer in src/index.css).
const inputClass = "instap-invoer w-full min-h-[54px] px-4 text-[16px] font-medium";

/**
 * Telt in ruim een halve seconde op van 0 naar `doel`, met een zachte rem aan
 * het eind. Bij prefers-reduced-motion staat het getal er meteen.
 */
const useOptellen = (doel: number) => {
  const [waarde, setWaarde] = useState(0);
  useEffect(() => {
    const rustig = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (rustig || doel === 0) {
      setWaarde(doel);
      return;
    }
    let frame = 0;
    const start = performance.now() + 350;
    const stap = (nu: number) => {
      const t = Math.min(1, Math.max(0, (nu - start) / 900));
      setWaarde(Math.round(doel * (1 - Math.pow(1 - t, 3))));
      if (t < 1) frame = requestAnimationFrame(stap);
    };
    frame = requestAnimationFrame(stap);
    return () => cancelAnimationFrame(frame);
  }, [doel]);
  return waarde;
};

// "Wil je ook hulp bij…?" Sinds 2026-10-28 niet verplicht, en zonder de tegel
// "Subsidies uitzoeken": die koos 94% van de bezoekers, en dat zegt niets wat de
// subsidiecheck zelf niet al zegt. Wat overblijft is extra signaal: wie naast het
// overzicht nog iets wil, wordt ongeveer twee keer zo vaak bewoner. Bewust géén
// vraag naar een termijn: daar kiest bijna iedereen de vrijblijvendste optie.
// Eén woord per tegel, zodat elk label ook op een telefoon op één regel past;
// de woorden en de volgorde koos de opdrachtgever. "Vakbedrijf" en niet
// "vakman": de uitvoerders zijn bedrijven, en "erkend" klinkt erin mee.
// De labels komen letterlijk in `subsidiecheck_hulpvragen` bij de lead te staan;
// het CRM en n8n tonen ze alleen. De ids blijven gelijk (GTM leest die), dus oude
// leads houden hun oude labels en de metingen lopen door.
const HULPVRAGEN = [
  { id: "aanvraag", label: "Papierwerk", Icon: FileCheck },
  { id: "uitvoerder", label: "Vakbedrijf", Icon: HardHat },
  { id: "plan", label: "Stappenplan", Icon: ListChecks },
] as const;

type HulpvraagId = (typeof HULPVRAGEN)[number]["id"];

// Hoe lang de poort maximaal op de bron wacht voordat het formulier hoe dan ook
// verschijnt. De zoeksequentie duurt zelf 3s; dit is de vangnetgrens voor
// een hangende bron.
const MAX_WACHT_MS = 8000;

// Ondergrens voor het overdrachtsmoment tussen "verzenden" en het resultaat.
//
// Er gebeurt op dit moment écht iets: de lead wordt weggeschreven en de mail met
// het overzicht gaat de deur uit. Alleen duurt dat soms 200ms en soms 1500ms, en
// bij die 200ms zag de bezoeker een spinner opflitsen en stond het hele resultaat
// er ineens. Dat las als een schermwissel, niet als een overdracht.
//
// Deze grens verlengt geen verzonnen werk; hij zorgt dat het echte werk lang
// genoeg zichtbaar is om als stap te lezen. Duurt het langer, dan wachten we
// niets extra's.
const MIN_OVERDRACHT_MS = 750;

/** Wacht tot `vanaf` minstens MIN_OVERDRACHT_MS geleden is. */
const rondOverdrachtAf = (vanaf: number) =>
  new Promise<void>((klaar) => setTimeout(klaar, Math.max(0, MIN_OVERDRACHT_MS - (Date.now() - vanaf))));

// Hoe lang het verzenden hooguit op de woninggegevens wacht (energielabel en
// bouwjaar). Staan ze al in de cache, wat normaal zo is omdat stap 1 ze
// prefetcht, dan kost dit niets. Ze lopen bovendien parallel aan het ophalen van
// de regelingen, dus in de praktijk voegt deze grens zelden wachttijd toe.
const VERRIJKING_WACHT_MS = 2500;

/** Wacht hooguit VERRIJKING_WACHT_MS op een belofte; tijd op of fout → undefined. */
const metGrens = <T,>(belofte: Promise<T>): Promise<T | undefined> =>
  Promise.race([
    belofte.catch(() => undefined),
    new Promise<undefined>((klaar) => setTimeout(() => klaar(undefined), VERRIJKING_WACHT_MS)),
  ]);

interface StapGegevensProps {
  input: SubsidieCheckInput;
  adres: PdokAdres;
  /** Gegevens opgeslagen → open het resultaat. */
  onOntgrendeld: () => void;
  /**
   * Link naar dit overzicht voor de mail (zie bouwOverzichtUrl in checkStaat.ts).
   * Niet `window.location.href`: daar staat het adres bewust niet meer in.
   */
  overzichtUrl?: string;
}

// De gegevens-poort: de tussenstap tussen "Jouw woning" en het resultaat.
//
// Opzet volgt het onderzoek naar dit soort poorten (zie tasks/todo.md): eerst
// iets geven, dan pas vragen. De stap geeft nu drie dingen, in deze volgorde:
//  1. het zoeken zelf, zichtbaar (ZoekKaart), vóór de vraag in plaats van erna;
//  2. het aantal gevonden regelingen, zónder titels of bedragen, zodat de
//     bezoeker weet dát er iets is maar niet wát;
//  3. wat we van de wóning weten: luchtfoto met pandcontour, bouwjaar en het
//     geregistreerde energielabel. Concreet, persoonlijk, en het bewijst dat we
//     naar dít adres hebben gekeken.
//
// Voornaam, achternaam, e-mail én telefoonnummer zijn verplicht. Let op: een
// verplicht telefoonnummer is aantoonbaar de duurste veldkeuze in een formulier
// (het hoogste verlaatpercentage na een wachtwoordveld). Het staat er op verzoek
// van de opdrachtgever, omdat het team bewoners telefonisch opvolgt. Zakt het
// aantal leads, dan is dit de eerste knop om aan te draaien.
//
// De lead gaat naar het CRM (`leads_bewoners`, bron "Voortraject", formulier
// "subsidietool") én het overzicht gaat per mail. Faalt de bron, dan gaat de lead
// er alsnog in (zonder mail) en toont het resultaat zelf de foutstaat.
export const StapGegevens = ({ input, adres, onOntgrendeld, overzichtUrl }: StapGegevensProps) => {
  const [voornaam, setVoornaam] = useState("");
  const [achternaam, setAchternaam] = useState("");
  const [email, setEmail] = useState("");
  const [telefoon, setTelefoon] = useState("");
  const [hulpvragen, setHulpvragen] = useState<HulpvraagId[]>([]);
  const [fout, setFout] = useState<string | null>(null);
  const [bezig, setBezig] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const geladenOp = useRef(Date.now());
  const bevrorenAantal = useRef<number | null>(null);
  const queryClient = useQueryClient();

  // De regelingen worden hier opgehaald, niet pas bij het verzenden: dat zet de
  // cache klaar zodat het resultaat straks meteen staat. Zelfde querysleutel als
  // StapResultaat. (De mail stuurt ze niet meer mee: de function haalt de lijst
  // sinds oktober 2026 zelf op bij onze eigen bron.)
  //
  // Nieuw is dat we het zoeken hier ook laten zíen, en daarna het aantal noemen.
  // Twee redenen. Ten eerste stond de zoeksequentie eerst op het resultaat, dus
  // ná de gegevensvraag: daar laat zichtbaar werk iemand wachten die al betaald
  // heeft, terwijl het effect (Buell & Norton) juist zit in het opbouwen van
  // waarde vóór de vraag. Ten tweede is het getal de reden om door te gaan: de
  // bezoeker weet nu dát er iets is, maar niet wát. Alleen het aantal dus, geen
  // titels of bedragen, anders is het overzicht zelf al weggegeven.
  const { data: gevonden, isPending: zoekBezig, isError: zoekFout } = useSubsidieCheck(input);

  // Bovengrens op het wachten. De zoekstap staat nu vóór de gegevensvraag, dus
  // een trage of hangende bron houdt de bezoeker weg bij het formulier en kost
  // dan een lead. Na MAX_WACHT_MS gaat de poort hoe dan ook open, zonder
  // telling. De lead is leidend, altijd.
  const [tijdOp, setTijdOp] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setTijdOp(true), MAX_WACHT_MS);
    return () => clearTimeout(t);
  }, []);

  const overslaan = zoekFout || tijdOp;
  const fase = useLaadsequentie(!zoekBezig, overslaan);
  const aantal = gevonden?.length ?? 0;
  // Het formulier staat pas in beeld na de zoekanimatie (zie de early return hieronder).
  const formulierInBeeld = !((zoekBezig && !overslaan) || fase < 3);
  // Het getal in de woningtegel telt op. Staat hier, vóór de early return
  // hieronder, omdat hooks altijd in dezelfde volgorde moeten lopen. Het doel
  // is dezelfde waarde die de telling verderop bevriest, zodat het getal en de
  // knop nooit iets anders zeggen.
  const teller = useOptellen(
    formulierInBeeld ? (bevrorenAantal.current ?? (zoekBezig || zoekFout ? 0 : aantal)) : 0,
  );
  // Onzichtbare controle dat hier een mens zit; het token gaat mee naar de
  // mailfunctie en wordt dáár gecontroleerd. Zie src/lib/turnstile.ts.
  const turnstile = useTurnstile(formulierInBeeld);
  // De invultijd telt vanaf het moment dat het formulier verschijnt, niet vanaf
  // het begin van de zoekanimatie: anders zit de animatie al in die 3 seconden
  // en zegt de controle niets meer.
  useEffect(() => {
    if (formulierInBeeld) geladenOp.current = Date.now();
  }, [formulierInBeeld]);

  // Wat we van de woning weten. Dubbel nut: het vult het kaartje hieronder én het
  // gaat als verrijking mee naar de lead, zodat het team het niet hoeft op te
  // zoeken. Deze hooks delen hun cache met de pagina, dus dit kost geen extra
  // verkeer.
  const { data: woning, isPending: woningBezig } = useWoningInfo(input.postcode, input.huisnummer, input.toevoeging);
  const { data: pand, isPending: pandBezig } = usePandContour(adres.centroideRd);

  // De verrijking voor de lead, opgehaald op het moment van verzenden.
  //
  // Bewust niet rechtstreeks de hookwaarden hierboven: die zijn nog leeg zolang
  // EP-Online en de BAG laden, en wie snel invult drukt op verzenden voordat ze
  // binnen zijn. Dan verdwenen beide velden geruisloos uit de lead, zonder fout
  // en zonder dat iemand het zag. `fetchQuery` gebruikt dezelfde sleutels als de
  // hooks, dus normaal komt dit direct uit de cache (stap 1 prefetcht het al) en
  // wacht het alleen als het écht nog niet binnen is.
  //
  // Wachten mag nooit een lead kosten: na VERRIJKING_WACHT_MS gaat het door met
  // wat er dan is, en een bron die faalt levert simpelweg niets op.
  const haalVerrijking = async (): Promise<LeadVerrijking> => {
    const [verseWoning, versPand] = await Promise.all([
      woningInfoGeldig(input.postcode, input.huisnummer)
        ? metGrens(queryClient.fetchQuery(woningInfoOpties(input.postcode, input.huisnummer, input.toevoeging)))
        : undefined,
      adres.centroideRd ? metGrens(queryClient.fetchQuery(pandContourOpties(adres.centroideRd))) : undefined,
    ]);
    return {
      energielabel: (verseWoning ?? woning)?.energielabel?.klasse,
      bouwjaar: (versPand ?? pand)?.bouwjaar,
    };
  };

  const adresKort = `${adres.straatnaam} ${input.huisnummer}${input.toevoeging ? ` ${input.toevoeging}` : ""}`;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (bezig) return;
    setFout(null);

    if (honeypot.trim() !== "") {
      onOntgrendeld(); // stil doorlaten voor bots (geen lead wegschrijven)
      return;
    }
    const duurMs = Date.now() - geladenOp.current;
    if (duurMs < MIN_INVULTIJD_MS) {
      setFout("Even geduld. Wacht een moment voordat je verstuurt.");
      return;
    }

    const resultaat = valideerContact({ voornaam, tussenvoegsel: "", achternaam, email, telefoon });
    if ("fout" in resultaat) {
      setFout(resultaat.fout);
      return;
    }
    // De gekozen tegels gaan als lijst naar `subsidiecheck_hulpvragen`, in de
    // volgorde van de tegels en niet van het aanklikken, zodat het CRM leest zoals
    // de bezoeker het zag. `notities` blijft van het team.
    const gekozenLabels = HULPVRAGEN.filter((h) => hulpvragen.includes(h.id)).map((h) => h.label);
    // Dezelfde keuze nog als tekstregel, voor twee paden die de lijst niet kennen:
    // een oudere edge function tijdens de overgang (de nieuwe negeert de regel
    // zodra `hulpvragen` er is), en de directe insert bij een bronfout hieronder,
    // die hem zoals voorheen in `notities` zet.
    //
    // Het toestemmingsbewijs dat de ACM per persoon verlangt stond hier ooit ook
    // als leesbare regel onder. Dat staat nu op één plek: `toestemming_op` en
    // `toestemming_tekst` (zie toestemming.ts), langs beide schrijfpaden.
    // Niets gekozen mag: dan geen regel, en geen lege "Wil hulp met:".
    const notitie = gekozenLabels.length ? `Wil hulp met: ${gekozenLabels.join(", ")}` : undefined;
    const toestemming = toestemmingVelden();

    setBezig(true);
    const verzondenOp = Date.now();
    // Eén id voor dit lead-moment: in de dataLayer-push (Meta krijgt hem als
    // eventID) én bij de lead in het CRM. Zo is een browser-event later te
    // ontdubbelen tegen een server-event via de Conversions API.
    const eventId = maakEventId();
    // Nu vast starten: dit loopt parallel aan het ophalen van de regelingen
    // hieronder, dus in het normale geval kost het geen extra wachttijd.
    const verrijkingBelofte = haalVerrijking();
    try {
      // De regelingen staan meestal al in de cache (de hook hierboven); zo niet,
      // dan halen we ze nu op. `retry: 1` gelijk aan useSubsidieCheck; de
      // standaard (3x met backoff) zou de bezoeker seconden laten wachten.
      let opgehaald: SubsidieRegeling[];
      try {
        opgehaald = await queryClient.fetchQuery({
          queryKey: ["subsidiecheck", input],
          queryFn: () => subsidieProvider.check(input),
          staleTime: 5 * 60 * 1000,
          retry: 1,
        });
      } catch (bronFout) {
        // Bron onbereikbaar: de lead is leidend en mag hier niet sneuvelen. We
        // schrijven 'm direct weg (zonder mail — een overzicht met 0 regelingen
        // mailen is erger dan niets) en laten de bezoeker door naar het
        // resultaat, dat zelf de eerlijke foutstaat met "Opnieuw proberen"
        // toont. Het team ziet de lead en volgt op.
        console.error("Subsidiecheck: bron faalde in de poort, lead zonder mail opgeslagen", bronFout);
        await schrijfSubsidiecheckLead({
          waarden: resultaat.waarden,
          input,
          adres,
          notitie,
          verrijking: await verrijkingBelofte,
          toestemming,
        });
        // Zonder lead-id: een vraag op het resultaat wordt dan een nieuwe lead.
        // Vervelend maar acceptabel; de vraag kwijtraken is erger.
        bewaarContact({ ...resultaat.waarden, hulpvragen: gekozenLabels });
        pushGtmEvent("subsidiecheck_lead", {
          bewonertype: input.bewonertype,
          aantal_regelingen: 0,
          hulpvraag: hulpvragen.join(","),
          // 1/0 en niet true/false: pushGtmEvent neemt alleen tekst en getallen.
          bron_fout: 1,
          event_id: eventId,
        });
        await rondOverdrachtAf(verzondenOp);
        onOntgrendeld();
        return;
      }
      const { leadId } = await verstuurSubsidiecheckLead({
        waarden: resultaat.waarden,
        input,
        adres,
        notitie,
        hulpvragen: gekozenLabels,
        verrijking: await verrijkingBelofte,
        toestemming,
        // Link naar dit resultaat (voor de "bekijk online"-link in de mail).
        overzichtUrl,
        honeypot,
        duurMs,
        turnstileToken: turnstile.token(),
        eventId,
      });
      // Onthouden voor de rest van deze sessie: het resultaat vraagt deze gegevens
      // dan niet opnieuw, en een vraag daar landt bij dezelfde lead.
      bewaarContact({ ...resultaat.waarden, leadId, hulpvragen: gekozenLabels });
      // Geen persoonsgegevens in het event (privacy) — alleen grove context.
      pushGtmEvent("subsidiecheck_lead", {
        bewonertype: input.bewonertype,
        aantal_regelingen: opgehaald.length,
        hulpvraag: hulpvragen.join(","),
        event_id: eventId,
      });
      await rondOverdrachtAf(verzondenOp);
      onOntgrendeld(); // component unmount hierna → bezig blijft bewust true
    } catch (err) {
      console.error("Subsidiecheck poort-lead submit failed", err);
      // De volumerem (PT429 op de directe insert, HTTP 429 van de mailfunctie)
      // krijgt een eigen melding mét telefoonnummer: dit is precies het moment
      // waarop je een échte lead kwijtraakt.
      setFout(
        formulierFoutMelding(err, "Er ging iets mis. Probeer het later nog eens of mail ons op info@voortraject.nl."),
      );
      // Een Turnstile-token is maar één keer bruikbaar; vraag een nieuw aan voor de volgende poging.
      turnstile.reset();
      setBezig(false);
    }
  };

  // Zolang we zoeken staat alleen de zoekkaart in beeld. Bij een bronfout of na
  // de bovengrens slaan we de sequentie over: dan valt er niets te tonen en mag
  // de bezoeker niet blijven wachten.
  if ((zoekBezig && !overslaan) || fase < 3) {
    return (
      <ZoekKaart
        adresRegel={`${adresKort}, ${adres.woonplaatsnaam}`}
        gemeente={input.gemeente}
        provincie={input.provincie}
        fase={fase}
        klaar={!zoekBezig}
      />
    );
  }

  // Bevriest de telling op het moment dat het formulier verschijnt. Een uitkomst
  // die daarna alsnog binnenkomt zou een regel boven het formulier inschuiven
  // terwijl de bezoeker aan het typen is.
  if (bevrorenAantal.current === null) bevrorenAantal.current = zoekBezig || zoekFout ? 0 : aantal;
  const telling = bevrorenAantal.current;

  // Tijdens het klaarzetten zakt alles wat de bezoeker net heeft ingevuld naar
  // de achtergrond, zodat de aandacht bij de knop en zijn melding ligt. Het
  // formulier is dan toch niet meer aan te raken (de knop staat op disabled).
  // Alleen de knop en de regel eronder houden hun volle dekking.
  const naarAchtergrond = `transition-opacity duration-500 ease-out ${bezig ? "opacity-45" : "opacity-100"}`;

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Wat we alvast teruggeven: de woning zelf, met daarnaast de uitkomst als
          getal. Hij weet nu dát er iets is, maar niet wát. Op een breed scherm
          staat de telling rechts van de foto, zodat de tegel laag blijft en het
          formulier eerder in beeld komt; op een telefoon eronder.

          Hier stonden ook "We vonden … voor jouw woning" boven de tegel en "Nog
          geen geregistreerd energielabel" erin. De telling staat nu in de tegel
          zelf, en een ontbrekend label is op dit moment geen nieuws. Een echt
          label tonen we wel, compact: dat is gratis informatie over dít huis.

          Bij nul regelingen (of een bronfout) laten we de telling weg: "0
          regelingen gevonden" vlak boven een gegevensvraag is geen aanbod. */}
      <div
        className={`instap-tegel-groen instap-in rounded-[24px] p-[18px] shadow-instap-tegel sm:p-[26px] ${naarAchtergrond}`}
        style={{ ["--i" as string]: 2 }}
      >
        <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-[230px_1fr] sm:gap-6">
          <Luchtfoto
            adres={adres}
            adresRegel={adresKort}
            pand={pand ?? null}
            pandBezig={pandBezig}
            className="aspect-[2/1] rounded-2xl shadow-instap-klein sm:aspect-[5/4]"
            verbergBron
          />
          <div className="min-w-0">
            <h2 className="instap-display text-[22px] leading-tight text-primary">{adresKort}</h2>
            <p className="mt-0.5 text-[15px] text-instap-zacht">
              {adres.woonplaatsnaam}
              {pand?.bouwjaar ? ` · Bouwjaar ${pand.bouwjaar}` : ""}
            </p>
            {!woningBezig && woning?.energielabel && (
              <div className="mt-3">
                <Energielabel klasse={woning.energielabel.klasse} compact />
              </div>
            )}
            {telling > 0 && (
              <>
                <div className="mt-3.5 flex items-center gap-2.5 sm:mt-[18px]">
                  <span
                    className="instap-display text-[48px] leading-[0.95] tracking-[-0.03em] text-instap-subsidie sm:text-[52px]"
                    aria-hidden="true"
                  >
                    {teller}
                  </span>
                  <span className="sr-only">{telling}</span>
                  <p className="text-[18px] font-bold leading-snug text-primary">
                    {telling === 1 ? "regeling gevonden" : "regelingen gevonden"}
                  </p>
                </div>
                <p className="mt-1 text-[15px] leading-snug text-instap-zacht">Vul je gegevens in, dan zie je ze meteen.</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Honeypot: gewoon tekstveld (géén type="hidden" — dat slaan bots juist over),
          alleen met CSS uit beeld. Naam bewust nietszeggend zodat browser-autofill
          hem niet herkent en een echte bezoeker hem gegarandeerd leeg laat. */}
      <div
        aria-hidden="true"
        style={{ position: "absolute", left: "-10000px", top: "auto", width: 1, height: 1, overflow: "hidden" }}
      >
        <label>
          Laat dit veld leeg
          <input type="text" name="vt_check" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
        </label>
      </div>

      <div className="instap-in mt-[18px] rounded-[24px] bg-card p-[18px] shadow-instap-tegel sm:p-[26px]" style={{ ["--i" as string]: 3 }}>
        {/* Eerst de gegevens: dat is waar deze stap over gaat en wat de bezoeker
            hier verwacht. De vraag eronder voelt daarna als een laatste detail in
            plaats van als een drempel vooraf. */}
        <fieldset className={naarAchtergrond}>
          <legend className="mb-3 block text-[15px] font-extrabold leading-snug text-primary">
            Waar mogen we je overzicht naartoe sturen?
          </legend>

          {/* Voor- en achternaam staan altijd naast elkaar, ook op mobiel: het zijn
              korte velden en samen vormen ze één ding. E-mail en telefoon krijgen
              de volle breedte. */}
          <div className="grid grid-cols-2 gap-3">
            <label className="sr-only" htmlFor="sc-gg-voornaam">
              Je voornaam (verplicht)
            </label>
            <input
              id="sc-gg-voornaam"
              type="text"
              autoComplete="given-name"
              aria-required="true"
              placeholder="Je voornaam"
              className={inputClass}
              value={voornaam}
              onChange={(e) => {
                setVoornaam(e.target.value);
                setFout(null);
              }}
              maxLength={100}
            />
            <label className="sr-only" htmlFor="sc-gg-achternaam">
              Je achternaam (verplicht)
            </label>
            <input
              id="sc-gg-achternaam"
              type="text"
              autoComplete="family-name"
              aria-required="true"
              placeholder="Je achternaam"
              className={inputClass}
              value={achternaam}
              onChange={(e) => {
                setAchternaam(e.target.value);
                setFout(null);
              }}
              maxLength={100}
            />
            <label className="sr-only" htmlFor="sc-gg-email">
              Je e-mailadres (verplicht)
            </label>
            <input
              id="sc-gg-email"
              type="email"
              autoComplete="email"
              aria-required="true"
              placeholder="Je e-mailadres"
              className={`${inputClass} col-span-2`}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setFout(null);
              }}
              maxLength={255}
            />
            {/* Telefoon is op verzoek van de opdrachtgever weer verplicht. Let op:
                een verplicht nummer is aantoonbaar de duurste veldkeuze in een
                formulier; als de leadaantallen teruglopen is dit de eerste knop om
                aan te draaien. */}
            <label className="sr-only" htmlFor="sc-gg-telefoon">
              Je telefoonnummer (verplicht)
            </label>
            <input
              id="sc-gg-telefoon"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              aria-required="true"
              placeholder="Je telefoonnummer"
              className={`${inputClass} col-span-2`}
              value={telefoon}
              onChange={(e) => {
                setTelefoon(e.target.value);
                setFout(null);
              }}
              maxLength={20}
            />
          </div>
        </fieldset>

        {/* Geruststelling hoort bij de velden die de twijfel veroorzaken, niet
            onderaan de pagina (Baymard). Een gezicht en een korte, lichte zin:
            "denkt graag met je mee". Eerder stond hier "belt je om je overzicht
            samen door te nemen"; de opdrachtgever vond dat terecht benauwend
            voor wie nog twijfelt. Dat we mogen bellen staat al in de regel onder
            de knop. De score staat er bewust zonder link: zie Bewijsregel. */}
        <div className={`mt-7 flex items-center gap-3.5 ${naarAchtergrond}`}>
          <img
            src={adviseurFoto}
            alt=""
            width={64}
            height={64}
            loading="lazy"
            className="h-16 w-16 shrink-0 rounded-full object-cover shadow-instap-klein"
          />
          <div className="min-w-0">
            <p className="text-[15px] leading-snug text-foreground">
              <span className="font-bold">Tim</span> of een collega denkt graag met je mee.
            </p>
            <Bewijsregel className="mt-1" alsLink={false} zonderAantal />
          </div>
        </div>

        {/* Geen, één of meer antwoorden: zie de toelichting bij HULPVRAGEN hierboven.
            Drie tegels: vanaf sm op één rij, op een telefoon twee naast elkaar en de
            derde over de volle breedte, zodat er geen los blokje achterblijft. */}
        <fieldset className={`mt-[30px] ${naarAchtergrond}`}>
          <legend className="mb-3 block text-[15px] font-extrabold text-primary">Wil je ook hulp bij…?</legend>
          <div
            className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3"
            role="group"
            aria-label="Wil je ook hulp bij…? Niet verplicht, meerdere antwoorden mogelijk."
          >
            {HULPVRAGEN.map(({ id, label, Icon }) => {
              const actief = hulpvragen.includes(id);
              return (
                <button
                  key={id}
                  type="button"
                  role="checkbox"
                  aria-checked={actief}
                  onClick={() => {
                    setHulpvragen((huidig) => (huidig.includes(id) ? huidig.filter((h) => h !== id) : [...huidig, id]));
                    setFout(null);
                  }}
                  className="instap-keus relative flex min-h-[64px] items-center gap-2.5 rounded-[18px] px-3 py-[13px] text-left last:col-span-2 sm:last:col-span-1 text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:gap-3 sm:px-4 sm:py-[15px]"
                >
                  <Icon size={21} strokeWidth={1.8} className="shrink-0" aria-hidden="true" />
                  <span className="text-[14px] font-bold leading-snug sm:pr-5 sm:text-[15.5px]">{label}</span>
                  {/* Op een telefoon is de tegel te smal voor een vinkje naast de
                      tekst; daar zegt het blauwe verloop met de rand genoeg. */}
                  {actief && (
                    <span
                      className="instap-vinkje absolute right-2.5 top-2.5 hidden h-[22px] w-[22px] items-center justify-center rounded-full sm:flex"
                      aria-hidden="true"
                    >
                      <Check size={13} strokeWidth={3} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </fieldset>

        {fout && (
          <p role="alert" className="mt-3 text-[14px] text-destructive">
            {fout}
          </p>
        )}

        {/* Turnstile (onzichtbaar). Blijft leeg, behalve als Cloudflare twijfelt en
            de bezoeker één klik laat doen. */}
        <div ref={turnstile.ref} className="mt-3 empty:hidden" />

        <button
          type="submit"
          disabled={bezig}
          // Bewust géén `disabled:opacity-70`. De knop is tijdens het klaarzetten
          // wel uitgeschakeld, maar hij draagt op dat moment de enige melding op
          // het scherm; alles eromheen staat al op 45%. Zou hij ook vervagen, dan
          // is het belangrijkste element het zwakste en leest het scherm als
          // "er is iets misgegaan" in plaats van "er wordt gewerkt".
          className="instap-knop mt-6 inline-flex min-h-[58px] w-full items-center justify-center gap-2.5 rounded-full px-7 text-[16.5px] font-extrabold disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {bezig ? (
            <>
              <Loader2 size={18} className="animate-spin" aria-hidden="true" />
              {/* Niet "Versturen…", want dat beschrijft wat de bezoeker doet.
                  Dit beschrijft wat wij doen, en het is waar: op dit moment gaat
                  de lead naar het team en vertrekt de mail met het overzicht. */}
              Je overzicht wordt klaargezet…
            </>
          ) : telling > 0 ? (
            // Het getal herhaalt waarom de bezoeker hier invult.
            `Bekijk mijn ${telling} ${telling === 1 ? "regeling" : "regelingen"}`
          ) : (
            "Bekijk mijn subsidieoverzicht"
          )}
        </button>

        {/* De toestemmingstekst, en verder niets: één regel onder de knop. Zie
            toestemming.ts voor waarom hij er zo staat en waarom hij letterlijk
            mee de lead in gaat. Hier stond eerder ook "Je gegevens blijven bij
            ons."; die viel weg om de regel op een telefoon op één regel te
            houden (akkoord opdrachtgever, 2026-10-21). Bewust geen ontkenning
            van wat de bezoeker vreest ("geen nieuwsbrief"): een privacygarantie
            wekt juist de zorg die ze wil wegnemen. */}
        <p className="mt-4 text-center text-[13px] leading-normal text-primary/70 min-[380px]:whitespace-nowrap sm:text-[13.5px]">
          {TOESTEMMING_TEKST}
        </p>
      </div>
    </form>
  );
};
