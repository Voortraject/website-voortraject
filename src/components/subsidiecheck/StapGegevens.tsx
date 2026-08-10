import { FormEvent, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { BadgeEuro, Check, FileCheck, HardHat, Home, Loader2 } from "lucide-react";

import adviseurFoto from "@/assets/adviseur-tim.webp";
import { useLaadsequentie } from "@/hooks/useLaadsequentie";
import { pandContourOpties, usePandContour } from "@/hooks/usePandContour";
import { useSubsidieCheck } from "@/hooks/useSubsidieCheck";
import { useWoningInfo, woningInfoGeldig, woningInfoOpties } from "@/hooks/useWoningInfo";
import { pushGtmEvent } from "@/lib/gtm";
import type { PdokAdres } from "@/lib/pdok";
import { subsidieProvider, type SubsidieCheckInput, type SubsidieRegeling } from "@/lib/subsidies";

import { Bewijsregel } from "./Bewijsregel";
import { bewaarContact } from "./contactOpslag";
import { Energielabel } from "./Energielabel";
import { Luchtfoto } from "./Luchtfoto";
import {
  schrijfSubsidiecheckLead,
  valideerContact,
  verstuurSubsidiecheckLead,
  type LeadVerrijking,
} from "./leadFormulier";
import { TOESTEMMING_TEKST, toestemmingVelden } from "./toestemming";
import { ZoekKaart } from "./Zoeksequentie";

const inputClass =
  "w-full rounded-lg border border-input bg-background px-4 py-3.5 text-[16px] text-foreground outline-none transition min-h-[52px] focus:border-accent focus:shadow-[0_0_0_3px_hsl(var(--accent)/0.18)]";

// Waar kunnen we je mee helpen? Bewust géén vraag naar een termijn ("wanneer wil
// je aan de slag?"): daar kiest bijna iedereen de vrijblijvendste optie, en dan
// weet het team nog niets. Deze vier zijn stuk voor stuk dingen die Voortraject
// écht doet, dus élk antwoord vertelt de adviseur waarmee hij het gesprek opent.
// Geen "vage" uitweg, want alle vier zijn even legitiem, en meerdere aanvinken
// mag: wie zowel de subsidies als de aanvraag uit handen wil geven, zegt dat.
// De labels komen letterlijk in de notitie bij de lead te staan. Kort en gelijk
// van vorm, zodat de vier tegels in één oogopslag te vergelijken zijn.
const HULPVRAGEN = [
  { id: "subsidies", label: "Subsidies uitzoeken", Icon: BadgeEuro },
  { id: "aanvraag", label: "De aanvraag regelen", Icon: FileCheck },
  { id: "uitvoerder", label: "Een uitvoerder vinden", Icon: HardHat },
  { id: "plan", label: "Een plan voor mijn huis", Icon: Home },
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
export const StapGegevens = ({ input, adres, onOntgrendeld }: StapGegevensProps) => {
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
  // cache klaar zodat het resultaat straks meteen staat en de mail het echte
  // overzicht kan meesturen. Zelfde querysleutel als StapResultaat.
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
    if (Date.now() - geladenOp.current < 2000) {
      setFout("Even geduld. Wacht een moment voordat je verstuurt.");
      return;
    }

    const resultaat = valideerContact({ voornaam, tussenvoegsel: "", achternaam, email, telefoon });
    if ("fout" in resultaat) {
      setFout(resultaat.fout);
      return;
    }
    if (hulpvragen.length === 0) {
      setFout("Kies even waar we je mee kunnen helpen.");
      return;
    }

    // Zelfde opbouw als het contactformulier: een kopregel in `notities` die het
    // team meteen ziet. Een latere vraag van de bezoeker komt eronder. Volgorde
    // van de tegels, niet van het aanklikken, zodat het CRM leest zoals de
    // bezoeker het zag.
    const gekozenLabels = HULPVRAGEN.filter((h) => hulpvragen.includes(h.id)).map((h) => h.label);
    // `notities` bevat alleen de hulpvraag: dat is het veld waar het team zelf in
    // werkt. Het toestemmingsbewijs dat de ACM per persoon verlangt stond hier
    // ook als leesbare regel onder, als terugval voor de tijd dat de kolommen nog
    // niet bestonden. Die kolommen zijn er nu en vullen aantoonbaar, dus het
    // bewijs staat nog op één plek: `toestemming_op` en `toestemming_tekst`.
    // Zie toestemming.ts. Het reist mee langs beide schrijfpaden, de edge
    // function én de directe insert bij een bronfout.
    const notitie = `Wil hulp met: ${gekozenLabels.join(", ")}`;
    const toestemming = toestemmingVelden();

    setBezig(true);
    const verzondenOp = Date.now();
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
        bewaarContact({ ...resultaat.waarden });
        pushGtmEvent("subsidiecheck_lead", {
          bewonertype: input.bewonertype,
          aantal_regelingen: 0,
          hulpvraag: hulpvragen.join(","),
          // 1/0 en niet true/false: pushGtmEvent neemt alleen tekst en getallen.
          bron_fout: 1,
        });
        await rondOverdrachtAf(verzondenOp);
        onOntgrendeld();
        return;
      }
      const { leadId } = await verstuurSubsidiecheckLead({
        waarden: resultaat.waarden,
        input,
        adres,
        regelingen: opgehaald,
        notitie,
        verrijking: await verrijkingBelofte,
        toestemming,
        // Deelbare URL van dit resultaat (voor de "bekijk online"-link in de mail).
        overzichtUrl: typeof window !== "undefined" ? window.location.href : undefined,
        honeypot,
      });
      // Onthouden voor de rest van deze sessie: het resultaat vraagt deze gegevens
      // dan niet opnieuw, en een vraag daar landt bij dezelfde lead.
      bewaarContact({ ...resultaat.waarden, leadId });
      // Geen persoonsgegevens in het event (privacy) — alleen grove context.
      pushGtmEvent("subsidiecheck_lead", {
        bewonertype: input.bewonertype,
        aantal_regelingen: opgehaald.length,
        hulpvraag: hulpvragen.join(","),
      });
      await rondOverdrachtAf(verzondenOp);
      onOntgrendeld(); // component unmount hierna → bezig blijft bewust true
    } catch (err) {
      console.error("Subsidiecheck poort-lead submit failed", err);
      setFout("Er ging iets mis. Probeer het later nog eens of mail ons op info@voortraject.nl.");
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
      {/* De uitkomst als getal, nog zonder inhoud: dít is waarom de bezoeker
          zijn gegevens geeft. Hij weet nu dát er iets is, maar niet wát.
          Bij nul (of een bronfout) laten we deze regel weg: "We vonden 0
          regelingen" vlak boven een gegevensvraag is geen aanbod.

          "Jouw woning" en niet het adres: het exacte adres staat in het kaartje
          eronder, met foto en bouwjaar erbij. Twee keer hetzelfde adres binnen
          een handbreedte las als herhaling. */}
      {telling > 0 && (
        <p
          className={`mb-4 text-center font-display text-[19px] font-semibold leading-snug text-primary md:text-[22px] ${naarAchtergrond}`}
        >
          We vonden{" "}
          <span className="text-[hsl(var(--subsidie))]">
            {telling} {telling === 1 ? "regeling" : "regelingen"}
          </span>{" "}
          voor jouw woning.
        </p>
      )}

      {/* Wat we alvast teruggeven: de woning zelf. */}
      <div
        className={`overflow-hidden rounded-2xl border-2 bg-card shadow-card ${naarAchtergrond}`}
        style={{ borderColor: "hsl(var(--accent) / 0.8)" }}
      >
        {/* Mobiel de foto als brede band bovenaan en de tekst eronder: naast
            elkaar werd de foto een smalle strook en brak elke regel in tweeën.
            Vanaf sm past het wél naast elkaar. */}
        <div className="flex flex-col sm:flex-row sm:items-stretch">
          <Luchtfoto
            adres={adres}
            adresRegel={adresKort}
            pand={pand ?? null}
            pandBezig={pandBezig}
            // Mobiel een lage band (2:1) zodat dit blok weinig hoogte kost; vanaf
            // sm een vaste kolom die de volle kaarthoogte vult, tot aan de rand.
            className="aspect-[2/1] sm:aspect-auto sm:w-[240px] sm:shrink-0"
            verbergBron
          />
          <div className="flex-1 p-4 sm:p-5">
            {/* Hier stond "We hebben jouw woning gevonden". Dat zei de regel
                erboven ("We vonden … voor jouw woning") al, en de foto met het
                adres eronder laat het gewoon zien. */}
            <p className="font-display text-[17px] font-semibold leading-snug text-primary sm:text-[19px]">
              {adresKort}
            </p>
            <p className="text-[13px] text-muted-foreground">
              {adres.woonplaatsnaam}
              {pand?.bouwjaar ? ` · Bouwjaar ${pand.bouwjaar}` : ""}
            </p>

            {/* Het energielabel is echte, opzoekbare informatie die de bezoeker
                hier gratis krijgt. Zelfde gekleurde schaal als op het resultaat,
                zodat het meteen herkenbaar is. Nog aan het laden → niets tonen;
                geen label → dat is ook een antwoord. */}
            {!woningBezig && (
              <div className="mt-4">
                {woning?.energielabel ? (
                  <>
                    <p className="mb-1.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                      Energielabel
                    </p>
                    <Energielabel klasse={woning.energielabel.klasse} compact />
                  </>
                ) : (
                  <p className="text-[13.5px] text-foreground/80">Nog geen geregistreerd energielabel</p>
                )}
              </div>
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

      {/* Eerst de gegevens: dat is waar deze stap over gaat en wat de bezoeker
          hier verwacht. De vraag eronder voelt daarna als een laatste detail in
          plaats van als een drempel vooraf. */}
      <fieldset className={`mt-4 ${naarAchtergrond}`}>
        <legend className="mb-3 block text-[14px] font-semibold text-foreground">
          Waar mogen we je overzicht naartoe sturen?
        </legend>

        {/* Voor- en achternaam staan altijd naast elkaar, ook op mobiel: het zijn
            korte velden en samen vormen ze één ding. E-mail en telefoon krijgen op
            mobiel de volle breedte. */}
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
            className={`${inputClass} col-span-2 sm:col-span-1`}
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
            className={`${inputClass} col-span-2 sm:col-span-1`}
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
          onderaan de pagina. Baymard ziet in zijn checkout-onderzoek dat mensen
          alleen díe delen van een pagina als veilig ervaren waar het signaal
          staat, en beveelt aan het pal naast de gevoelige velden te zetten. Hier
          stond het bewijs onder de verzendknop; daar komt de twijfel te laat.
          De score staat er bewust zónder link: zie Bewijsregel.

          Het gezicht en de zin erbij doen nog iets tweeds. Deze stap vraagt een
          telefoonnummer omdat het team bewoners telefonisch opvolgt, en dan hoort
          de bezoeker vóór het invullen te weten dat er iemand belt. Dat is niet
          alleen netjes, het is ook wat het nummer van een drempel in een dienst
          verandert. */}
      <div
        className={`mt-6 flex items-center gap-3 rounded-xl border border-border p-3.5 ${naarAchtergrond}`}
        style={{ backgroundColor: "var(--card-soft)" }}
      >
        <img
          src={adviseurFoto}
          alt=""
          width={44}
          height={44}
          loading="lazy"
          className="h-11 w-11 shrink-0 rounded-full object-cover"
        />
        <div className="min-w-0">
          <p className="text-[13.5px] leading-snug text-foreground">
            <span className="font-semibold">Tim</span>, bewonersadviseur. Hij of een collega denkt gratis en
            vrijblijvend met je mee.
          </p>
          <Bewijsregel className="mt-1.5" alsLink={false} />
        </div>
      </div>

      {/* Meerdere antwoorden mogen: zie de toelichting bij HULPVRAGEN hierboven. */}
      <fieldset className={`mt-6 ${naarAchtergrond}`}>
        {/* "Meerdere antwoorden mogelijk" staat er niet meer. De tegels zijn
            checkboxes (role="checkbox"), dus wie er twee aanklikt ziet gewoon
            dat het kan; wie er één aanklikt mist niets. De regel loste een
            probleem op dat de bezoeker niet heeft. */}
        <legend className="mb-3 block text-[14px] font-semibold text-foreground">Waar kunnen we je mee helpen?</legend>
        <div className="grid grid-cols-2 gap-2 sm:gap-3" role="group" aria-label="Waar kunnen we je mee helpen? Meerdere antwoorden mogelijk.">
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
                className={`relative flex items-center gap-2.5 rounded-lg border-2 px-3 py-3 text-left text-[14px] font-semibold leading-snug text-primary transition-colors min-h-[56px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:gap-3 sm:px-4 sm:text-[15px] ${
                  actief ? "border-accent bg-accent/10" : "border-border bg-card hover:border-primary/30"
                }`}
              >
                <Icon size={20} strokeWidth={1.75} className="shrink-0 text-primary" aria-hidden="true" />
                <span>{label}</span>
                {actief && (
                  <span
                    className="absolute right-2 top-2 hidden h-5 w-5 items-center justify-center rounded-full bg-accent sm:flex"
                    aria-hidden="true"
                  >
                    <Check size={13} strokeWidth={3} className="text-primary" />
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

      <button
        type="submit"
        disabled={bezig}
        // Bewust géén `disabled:opacity-70`. De knop is tijdens het klaarzetten
        // wel uitgeschakeld, maar hij draagt op dat moment de enige melding op
        // het scherm; alles eromheen staat al op 45%. Zou hij ook vervagen, dan
        // is het belangrijkste element het zwakste en leest het scherm als
        // "er is iets misgegaan" in plaats van "er wordt gewerkt".
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-7 py-3.5 text-[15px] font-semibold text-primary transition-colors hover:bg-accent-hover disabled:cursor-not-allowed min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {bezig ? (
          <>
            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            {/* Niet "Versturen…", want dat beschrijft wat de bezoeker doet.
                Dit beschrijft wat wij doen, en het is waar: op dit moment gaat
                de lead naar het team en vertrekt de mail met het overzicht. */}
            Je overzicht wordt klaargezet…
          </>
        ) : (
          "Bekijk mijn subsidieoverzicht"
        )}
      </button>

      {/* Hier stond "Geen nieuwsbrief, alleen jouw overzicht." Die zin nóemt het
          gevreesde ding, en dat is precies het patroon dat averechts werkt: vier
          experimenten in de Journal of Consumer Research laten zien dat een
          privacygarantie zorgen wekt "which, without assurances, would have
          remained dormant". Dus geen ontkenning meer, maar gewoon zeggen waar we
          de gegevens voor gebruiken. Dat is meteen wat de AVG hier vraagt.

          De score staat niet meer onder de knop maar bij de velden hierboven. */}
      {/* "Blijven bij ons" is bewust drie woorden en geen alinea. In deze markt
          verkopen de offertesites je gegevens door aan tot zes bedrijven, en hun
          recensies staan vol met bezoekers die daarna door onbekende nummers
          werden gebeld. Wij doen dat niet: de lead gaat naar ons eigen CRM en
          verder nergens heen. Dat is dus een ware claim, en een die de
          concurrent niet kan maken. Kort houden, want een uitgebreide
          privacybelofte wekt juist de zorg die ze wil wegnemen. */}
      <p className="mt-3 text-[12px] text-muted-foreground">
        Je gegevens blijven bij ons. {TOESTEMMING_TEKST}
      </p>
    </form>
  );
};
