import { FormEvent, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { BadgeEuro, Check, FileCheck, HardHat, Home, Loader2, MapPin } from "lucide-react";

import { usePandContour } from "@/hooks/usePandContour";
import { useSubsidieCheck } from "@/hooks/useSubsidieCheck";
import { useWoningInfo } from "@/hooks/useWoningInfo";
import { pushGtmEvent } from "@/lib/gtm";
import type { PdokAdres } from "@/lib/pdok";
import { subsidieProvider, type SubsidieCheckInput, type SubsidieRegeling } from "@/lib/subsidies";

import { Bewijsregel } from "./Bewijsregel";
import { bewaarContact } from "./contactOpslag";
import { Energielabel } from "./Energielabel";
import { Luchtfoto } from "./Luchtfoto";
import { schrijfSubsidiecheckLead, valideerContact, verstuurSubsidiecheckLead } from "./leadFormulier";

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

interface StapGegevensProps {
  input: SubsidieCheckInput;
  adres: PdokAdres;
  /** Gegevens opgeslagen → open het resultaat. */
  onOntgrendeld: () => void;
}

// De gegevens-poort: de tussenstap tussen "Jouw woning" en het resultaat.
//
// Opzet volgt het onderzoek naar dit soort poorten (zie tasks/todo.md): eerst
// iets geven, dan pas vragen. Wat we geven is bewust géén voorproefje van de
// regelingen zelf, want dat haalt de spanning weg bij het resultaat (en maakt de
// zoekanimatie daar zinloos). Wel wat we van de wóning al weten: de luchtfoto met
// de pandcontour, het bouwjaar en het geregistreerde energielabel. Concreet,
// persoonlijk, en het bewijst dat we naar dít adres hebben gekeken.
//
// Alleen voornaam, achternaam en e-mail zijn verplicht; het telefoonnummer is
// optioneel, want een verplicht nummer is de duurste veldkeuze die er is en we
// vragen er op het resultaat alsnog om als iemand gebeld wil worden.
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
  const queryClient = useQueryClient();

  // De regelingen worden hier al stil opgehaald, niet pas bij het verzenden: dat
  // zet de cache klaar zodat het resultaat straks meteen staat en de mail het
  // echte overzicht kan meesturen. We tonen er hier bewust niets van. Zelfde
  // querysleutel als StapResultaat.
  useSubsidieCheck(input);

  // Wat we van de woning weten. Dubbel nut: het vult het kaartje hieronder én het
  // gaat als verrijking mee naar de lead, zodat het team het niet hoeft op te
  // zoeken. Deze hooks delen hun cache met de pagina, dus dit kost geen extra
  // verkeer.
  const { data: woning, isPending: woningBezig } = useWoningInfo(input.postcode, input.huisnummer, input.toevoeging);
  const { data: pand, isPending: pandBezig } = usePandContour(adres.centroideRd);

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
    const notitie = `Wil hulp met: ${gekozenLabels.join(", ")}`;
    const verrijking = {
      energielabel: woning?.energielabel?.klasse,
      bouwjaar: pand?.bouwjaar,
    };

    setBezig(true);
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
        await schrijfSubsidiecheckLead({ waarden: resultaat.waarden, input, adres, notitie, verrijking });
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
        onOntgrendeld();
        return;
      }
      const { leadId } = await verstuurSubsidiecheckLead({
        waarden: resultaat.waarden,
        input,
        adres,
        regelingen: opgehaald,
        notitie,
        verrijking,
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
      onOntgrendeld(); // component unmount hierna → bezig blijft bewust true
    } catch (err) {
      console.error("Subsidiecheck poort-lead submit failed", err);
      setFout("Er ging iets mis. Probeer het later nog eens of mail ons op info@voortraject.nl.");
      setBezig(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Wat we alvast teruggeven: de woning zelf. */}
      <div
        className="overflow-hidden rounded-2xl border-2 bg-card shadow-card"
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
            <p className="inline-flex items-center gap-1.5 text-[12.5px] text-muted-foreground">
              <MapPin size={13} aria-hidden="true" />
              We hebben jouw woning gevonden
            </p>
            <p className="mt-1 font-display text-[17px] font-semibold leading-snug text-primary sm:text-[19px]">
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
      <fieldset className="mt-6">
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
            placeholder="Je voornaam *"
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
            placeholder="Je achternaam *"
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
            placeholder="Je e-mailadres *"
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
            placeholder="Je telefoonnummer *"
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

      {/* Meerdere antwoorden mogen: zie de toelichting bij HULPVRAGEN hierboven. */}
      <fieldset className="mt-6">
        <legend className="mb-1 block text-[14px] font-semibold text-foreground">Waar kunnen we je mee helpen?</legend>
        <p className="mb-3 text-[13px] text-muted-foreground">Meerdere antwoorden mogelijk.</p>
        <div className="grid grid-cols-2 gap-2 sm:gap-3" role="group" aria-label="Waar kunnen we je mee helpen?">
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
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-7 py-3.5 text-[15px] font-semibold text-primary transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-70 min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {bezig ? (
          <>
            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            Versturen…
          </>
        ) : (
          "Bekijk mijn subsidieoverzicht"
        )}
      </button>

      {/* Geruststelling links, onze echte Google-score rechts: allebei bedoeld voor
          hetzelfde moment van twijfel, dus ze horen op één regel. Op een smal
          scherm valt de score vanzelf naar de regel eronder. Live data: is die er
          niet, dan staat hier alleen de zin. */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        {/* Op mobiel korter, anders passen de zin en de score samen niet op één
            regel en valt de score eronder. */}
        <p className="text-[12px] italic text-muted-foreground">
          Geen nieuwsbrief<span className="hidden sm:inline">, alleen jouw overzicht</span>.
        </p>
        <Bewijsregel />
      </div>
    </form>
  );
};
