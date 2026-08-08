import { FormEvent, useEffect, useRef, useState } from "react";
import { Check, Loader2, Mail, MessageCircle, Phone, Send } from "lucide-react";

import { pushGtmEvent } from "@/lib/gtm";
import type { PdokAdres } from "@/lib/pdok";
import { whatsappUrl } from "@/lib/whatsapp";
import type { SubsidieCheckInput } from "@/lib/subsidies";

import { Bewijsregel } from "./Bewijsregel";
import { leesContact, vulContactAan } from "./contactOpslag";
import { MAX_BERICHT, valideerBericht, valideerContact, verstuurSubsidiecheckBericht } from "./leadFormulier";

const inputClass =
  "w-full rounded-lg border border-input bg-background px-4 py-3.5 text-[16px] text-foreground outline-none transition min-h-[52px] focus:border-accent focus:shadow-[0_0_0_3px_hsl(var(--accent)/0.18)]";

interface DirectContactProps {
  input: SubsidieCheckInput;
  adres: PdokAdres;
  /** Deelbare URL van dit overzicht, gaat mee in de mail naar het team. */
  overzichtUrl?: string;
  /** Voorgestelde vraagtekst, gezet door een knop elders op het resultaat
      (bijvoorbeeld "Label aanvragen"). `n` telt de kliks, zodat hetzelfde
      voorstel opnieuw geplaatst wordt als de bezoeker het veld leegde. */
  voorstel?: { tekst: string; n: number };
}

// Het contactblok onder het resultaat: één vraag stellen zonder de pagina te
// verlaten. Reden van bestaan: tot nu toe was de enige actie een link naar
// /contact, waar de bezoeker álles opnieuw moest invullen wat hij in de poort al
// had gegeven. Wie door de poort kwam heeft hier nog maar één veld: zijn vraag.
//
// Daarnaast twee directe routes voor wie liever niet typt: WhatsApp (met het
// adres al in het bericht) en bellen. Die gaan buiten ons systeem om en zijn
// daarom altijd zichtbaar, ook als het formulier net gefaald is.
export const DirectContact = ({ input, adres, overzichtUrl, voorstel }: DirectContactProps) => {
  // Eén keer lezen bij het mounten: wisselt niet meer binnen dit scherm.
  const [bekend] = useState(() => leesContact());

  const [bericht, setBericht] = useState("");

  // Een voorstel van elders op het resultaat vult het veld alleen als de
  // bezoeker er zelf nog niets in heeft gezet. Zijn eigen tekst overschrijven
  // zou erger zijn dan het voorstel missen; hij is dan toch al hier.
  useEffect(() => {
    if (!voorstel?.tekst) return;
    setBericht((huidig) => (huidig.trim() === "" ? voorstel.tekst : huidig));
  }, [voorstel]);
  const [voornaam, setVoornaam] = useState("");
  const [achternaam, setAchternaam] = useState("");
  const [email, setEmail] = useState("");
  const [wilGebeld, setWilGebeld] = useState(false);
  const [telefoon, setTelefoon] = useState(bekend?.telefoon ?? "");
  const [fout, setFout] = useState<string | null>(null);
  const [bezig, setBezig] = useState(false);
  const [verstuurd, setVerstuurd] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const geladenOp = useRef(Date.now());

  const adresRegel = `${adres.straatnaam} ${input.huisnummer}${input.toevoeging ? ` ${input.toevoeging}` : ""}, ${adres.woonplaatsnaam}`;
  const antwoordAdres = bekend?.email ?? email.trim();

  // Vooringevuld WhatsApp-bericht: de bezoeker hoeft alleen zijn vraag nog te
  // typen, wij weten meteen over welk adres het gaat.
  const waLink = whatsappUrl(
    `Hallo, ik heb de subsidiecheck gedaan voor ${adresRegel}. Ik heb daar een vraag over:`,
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (bezig) return;
    setFout(null);

    if (honeypot.trim() !== "") {
      setVerstuurd(true); // stil doorlaten voor bots, niets wegschrijven
      return;
    }
    if (Date.now() - geladenOp.current < 2000) {
      setFout("Even geduld. Wacht een moment voordat je verstuurt.");
      return;
    }

    const berichtFout = valideerBericht(bericht);
    if (berichtFout) {
      setFout(berichtFout);
      return;
    }

    // Wie door de poort kwam is al bekend; anders vragen we het minimum om te
    // kunnen antwoorden. Een telefoonnummer alleen als de bezoeker gebeld wil
    // worden, en dan wél verplicht: zonder nummer kunnen we dat niet waarmaken.
    const resultaat = valideerContact(
      {
        voornaam: bekend?.voornaam ?? voornaam,
        tussenvoegsel: bekend?.tussenvoegsel ?? "",
        achternaam: bekend?.achternaam ?? achternaam,
        email: bekend?.email ?? email,
        telefoon,
      },
      { telefoonVerplicht: wilGebeld },
    );
    if ("fout" in resultaat) {
      setFout(resultaat.fout);
      return;
    }

    setBezig(true);
    try {
      // De belvoorkeur staat vóór de vraag in de notitie, zodat het team het
      // meteen ziet. Zelfde opbouw als het contactformulier.
      const notitie = wilGebeld ? `Wil graag gebeld worden.\n${bericht.trim()}` : bericht.trim();
      await verstuurSubsidiecheckBericht({
        waarden: resultaat.waarden,
        bericht: notitie,
        input,
        adres,
        leadId: bekend?.leadId,
        overzichtUrl,
        honeypot,
      });
      // Een nummer dat hier voor het eerst binnenkomt onthouden we voor de rest
      // van de sessie.
      if (resultaat.waarden.telefoon) vulContactAan({ telefoon: resultaat.waarden.telefoon });
      pushGtmEvent("subsidiecheck_vraag", {
        bewonertype: input.bewonertype,
        wil_gebeld: wilGebeld ? 1 : 0,
        bekend_contact: bekend ? 1 : 0,
      });
      setVerstuurd(true);
    } catch (err) {
      console.error("Subsidiecheck vraag versturen faalde", err);
      setFout("Er ging iets mis. Probeer het nog eens, of stuur ons een WhatsApp-bericht.");
      setBezig(false);
    }
  };

  // WhatsApp staat naast de verzendknop en blijft ook in de bevestiging staan:
  // die route gaat buiten ons formulier om en werkt dus altijd.
  const whatsappKnop = (
    <a
      href={waLink}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => pushGtmEvent("subsidiecheck_whatsapp", { bewonertype: input.bewonertype })}
      className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-[15px] font-semibold text-primary transition-colors hover:border-primary/40 min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <MessageCircle size={17} strokeWidth={2} aria-hidden="true" />
      Vraag via WhatsApp
    </a>
  );

  if (verstuurd) {
    return (
      <div
        id="sc-vraag"
        className="scroll-mt-24 rounded-xl border border-border p-6 md:p-8"
        style={{ backgroundColor: "var(--card-soft)" }}
      >
        <div role="status" className="flex items-start gap-3">
          <span
            className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent"
            aria-hidden="true"
          >
            <Check size={18} strokeWidth={3} className="text-primary" />
          </span>
          <div>
            <h3 className="font-display text-[19px] font-semibold text-primary md:text-[21px]">
              Je vraag is bij ons binnen
            </h3>
            <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-foreground/80">
              We reageren binnen 24 uur
              {antwoordAdres ? (
                <>
                  {" "}
                  op <span className="font-semibold text-foreground">{antwoordAdres}</span>
                </>
              ) : null}
              {wilGebeld ? ", en we bellen je." : "."} Je hoeft niets voor te bereiden.
            </p>
          </div>
        </div>
        <div className="mt-5">{whatsappKnop}</div>
      </div>
    );
  }

  return (
    <div
      id="sc-vraag"
      className="scroll-mt-24 rounded-xl border border-border p-6 md:p-8"
      style={{ backgroundColor: "var(--card-soft)" }}
    >
      <h3 className="font-display text-[19px] font-semibold text-primary md:text-[21px]">
        Een vraag over jouw overzicht?
      </h3>

      <form onSubmit={handleSubmit} noValidate className="mt-4">
        {/* Honeypot: gewoon tekstveld, alleen met CSS uit beeld. Zie StapGegevens. */}
        <div
          aria-hidden="true"
          style={{ position: "absolute", left: "-10000px", top: "auto", width: 1, height: 1, overflow: "hidden" }}
        >
          <label>
            Laat dit veld leeg
            <input
              type="text"
              name="vt_check"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
            />
          </label>
        </div>

        <label className="sr-only" htmlFor="sc-vraag-tekst">
          Je vraag
        </label>
        <textarea
          id="sc-vraag-tekst"
          rows={3}
          placeholder="Bijvoorbeeld: welke van deze regelingen kan ik combineren?"
          className={`${inputClass} resize-y`}
          value={bericht}
          maxLength={MAX_BERICHT}
          onChange={(e) => {
            setBericht(e.target.value);
            setFout(null);
          }}
        />

        {/* Alleen vragen wat we nog niet weten. Wie net door de gegevens-poort
            kwam, ziet hier dus geen enkel extra veld. */}
        {!bekend && (
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="sr-only" htmlFor="sc-vraag-voornaam">
              Je voornaam (verplicht)
            </label>
            <input
              id="sc-vraag-voornaam"
              type="text"
              autoComplete="given-name"
              aria-required="true"
              placeholder="Je voornaam *"
              className={inputClass}
              value={voornaam}
              maxLength={100}
              onChange={(e) => {
                setVoornaam(e.target.value);
                setFout(null);
              }}
            />
            <label className="sr-only" htmlFor="sc-vraag-achternaam">
              Je achternaam (verplicht)
            </label>
            <input
              id="sc-vraag-achternaam"
              type="text"
              autoComplete="family-name"
              aria-required="true"
              placeholder="Je achternaam *"
              className={inputClass}
              value={achternaam}
              maxLength={100}
              onChange={(e) => {
                setAchternaam(e.target.value);
                setFout(null);
              }}
            />
            <label className="sr-only" htmlFor="sc-vraag-email">
              Je e-mailadres (verplicht)
            </label>
            <input
              id="sc-vraag-email"
              type="email"
              autoComplete="email"
              aria-required="true"
              placeholder="Je e-mailadres *"
              className={`${inputClass} sm:col-span-2`}
              value={email}
              maxLength={255}
              onChange={(e) => {
                setEmail(e.target.value);
                setFout(null);
              }}
            />
          </div>
        )}

        {/* Voorkeurskanaal als twee tapbare kaarten, zelfde patroon als "Ik ben…"
            in stap 1. Gemaild staat voor: het telefoonveld verschijnt pas als de
            bezoeker zelf om een telefoontje vraagt. */}
        <fieldset className="mt-5">
          <legend className="mb-3 block text-[14px] font-semibold text-foreground">Ik word het liefst…</legend>
          <div className="grid grid-cols-2 gap-2 sm:gap-3" role="radiogroup" aria-label="Hoe wil je antwoord?">
            {[
              { id: "mail", label: "Gemaild", toelichting: "Antwoord in je inbox", Icon: Mail },
              { id: "bel", label: "Gebeld", toelichting: "We bellen je even", Icon: Phone },
            ].map(({ id, label, toelichting, Icon }) => {
              const actief = id === "bel" ? wilGebeld : !wilGebeld;
              return (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={actief}
                  onClick={() => {
                    setWilGebeld(id === "bel");
                    setFout(null);
                  }}
                  className={`relative flex items-start gap-2 rounded-lg border-2 px-3 py-3 text-left transition-colors min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:gap-3 sm:px-4 ${
                    actief ? "border-accent bg-accent/10" : "border-border bg-card hover:border-primary/30"
                  }`}
                >
                  <Icon size={20} strokeWidth={1.75} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                  <span>
                    <span className="block text-[14px] font-semibold leading-snug text-primary sm:text-[15px]">
                      {label}
                    </span>
                    {/* Toelichting kost mobiel te veel ruimte → alleen op sm+. */}
                    <span className="mt-0.5 hidden text-[13px] text-muted-foreground sm:block">{toelichting}</span>
                  </span>
                  {actief && (
                    <span
                      className="absolute right-2.5 top-2.5 hidden h-5 w-5 items-center justify-center rounded-full bg-accent sm:flex"
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
        {wilGebeld && (
          <div className="mt-3 animate-fade-up">
            <label className="sr-only" htmlFor="sc-vraag-telefoon">
              Je telefoonnummer
            </label>
            <input
              id="sc-vraag-telefoon"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              placeholder="Je telefoonnummer *"
              className={inputClass}
              value={telefoon}
              maxLength={20}
              onChange={(e) => {
                setTelefoon(e.target.value);
                setFout(null);
              }}
            />
          </div>
        )}

        {fout && (
          <p role="alert" className="mt-3 text-[14px] text-destructive">
            {fout}
          </p>
        )}

        {/* Versturen en WhatsApp naast elkaar: twee even makkelijke routes naar
            hetzelfde antwoord. Op mobiel onder elkaar, volle breedte. */}
        <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
          <button
            type="submit"
            disabled={bezig}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-7 py-3 text-[15px] font-semibold text-primary transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-70 min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {bezig ? (
              <>
                <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                Versturen…
              </>
            ) : (
              <>
                <Send size={16} strokeWidth={2} aria-hidden="true" />
                Verstuur mijn vraag
              </>
            )}
          </button>
          {whatsappKnop}
        </div>

        <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
          {bekend
            ? `We antwoorden binnen 24 uur op ${bekend.email}.`
            : "We antwoorden binnen 24 uur. Geen nieuwsbrief."}
        </p>
      </form>
    </div>
  );
};
