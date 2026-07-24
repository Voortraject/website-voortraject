import { FormEvent, useRef, useState } from "react";
import { Loader2, MapPin } from "lucide-react";

import { pushGtmEvent } from "@/lib/gtm";
import type { PdokAdres } from "@/lib/pdok";
import { BEWONERTYPE_LABELS, MAATREGEL_LABELS, type SubsidieCheckInput } from "@/lib/subsidies";

import { schrijfSubsidiecheckLead, valideerContact } from "./leadFormulier";

const inputClass =
  "w-full rounded-lg border border-input bg-background px-4 py-3.5 text-[16px] text-foreground outline-none transition min-h-[52px] focus:border-accent focus:shadow-[0_0_0_3px_hsl(var(--accent)/0.18)]";

interface StapGegevensProps {
  input: SubsidieCheckInput;
  adres: PdokAdres;
  /** Gegevens opgeslagen → open het resultaat. */
  onOntgrendeld: () => void;
}

// De gegevens-poort: de tussenstap tussen "Jouw woning" en het resultaat. We
// vragen naam + e-mail + telefoon, schrijven de lead naar het CRM
// (`leads_bewoners`, bron "Subsidiecheck") en tonen daarna pas het overzicht. Zo
// verzamelen we alvast leads terwijl de echte lancering nog een paar weken weg is.
// Bewust géén automatische overzicht-mail hier: de regelingen zijn op dit punt
// nog niet opgehaald, en de lead is leidend.
export const StapGegevens = ({ input, adres, onOntgrendeld }: StapGegevensProps) => {
  const [voornaam, setVoornaam] = useState("");
  const [tussenvoegsel, setTussenvoegsel] = useState("");
  const [achternaam, setAchternaam] = useState("");
  const [email, setEmail] = useState("");
  const [telefoon, setTelefoon] = useState("");
  const [fout, setFout] = useState<string | null>(null);
  const [bezig, setBezig] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const geladenOp = useRef(Date.now());

  const adresRegel = `${adres.straatnaam} ${input.huisnummer}${input.toevoeging ? ` ${input.toevoeging}` : ""}, ${adres.woonplaatsnaam}`;

  // Situatie + interesse mee in de notitie zodat het team gericht kan opvolgen.
  // Geen regelingen: die zijn op dit punt (vóór het resultaat) nog niet bekend.
  const bouwNotities = () =>
    [
      "Subsidiecheck: gegevens vooraf verzameld (voordat het overzicht getoond werd).",
      `Situatie: ${BEWONERTYPE_LABELS[input.bewonertype]}`,
      `Interesse: ${input.maatregelen.map((m) => MAATREGEL_LABELS[m]).join(", ")}`,
    ].join("\n");

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

    const resultaat = valideerContact({ voornaam, tussenvoegsel, achternaam, email, telefoon });
    if ("fout" in resultaat) {
      setFout(resultaat.fout);
      return;
    }

    setBezig(true);
    try {
      await schrijfSubsidiecheckLead({ waarden: resultaat.waarden, input, adres, notities: bouwNotities() });
      // Geen persoonsgegevens in het event (privacy) — alleen grove context.
      pushGtmEvent("subsidiecheck_lead", { bewonertype: input.bewonertype });
      onOntgrendeld(); // component unmount hierna → bezig blijft bewust true
    } catch (err) {
      console.error("Subsidiecheck poort-lead submit failed", err);
      setFout("Er ging iets mis. Probeer het later nog eens of mail ons op info@voortraject.nl.");
      setBezig(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* Waar dit overzicht voor is — geeft de gegevensvraag context. */}
      <p className="mb-5 inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3 text-[15px] text-foreground shadow-subtle">
        <MapPin size={16} className="text-muted-foreground" aria-hidden="true" />
        Je overzicht voor {adresRegel}
      </p>

      {/* Honeypot */}
      <div
        aria-hidden="true"
        style={{ position: "absolute", left: "-10000px", top: "auto", width: 1, height: 1, overflow: "hidden" }}
      >
        <label>
          Laat dit veld leeg
          <input type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
        </label>
      </div>

      {/* Naamvelden: voornaam volle breedte op mobiel, tussenvoegsel + achternaam
          samen op de tweede regel; op sm+ alle drie naast elkaar. */}
      <div className="grid grid-cols-[2fr_3fr] gap-3 sm:grid-cols-[1.2fr_0.7fr_1.4fr]">
        <label className="sr-only" htmlFor="sc-gg-voornaam">
          Je voornaam (verplicht)
        </label>
        <input
          id="sc-gg-voornaam"
          type="text"
          autoComplete="given-name"
          aria-required="true"
          placeholder="Je voornaam *"
          className={`${inputClass} col-span-2 sm:col-span-1`}
          value={voornaam}
          onChange={(e) => {
            setVoornaam(e.target.value);
            setFout(null);
          }}
          maxLength={100}
        />
        <label className="sr-only" htmlFor="sc-gg-tussenvoegsel">
          Tussenvoegsel (optioneel)
        </label>
        <input
          id="sc-gg-tussenvoegsel"
          type="text"
          placeholder="Tussenv."
          className={inputClass}
          value={tussenvoegsel}
          onChange={(e) => {
            setTussenvoegsel(e.target.value);
            setFout(null);
          }}
          maxLength={25}
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
      </div>

      {/* E-mail + telefoon. */}
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[1.4fr_1fr]">
        <label className="sr-only" htmlFor="sc-gg-email">
          Je e-mailadres (verplicht)
        </label>
        <input
          id="sc-gg-email"
          type="email"
          autoComplete="email"
          aria-required="true"
          placeholder="Je e-mailadres *"
          className={inputClass}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setFout(null);
          }}
          maxLength={255}
        />
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
          className={inputClass}
          value={telefoon}
          onChange={(e) => {
            setTelefoon(e.target.value);
            setFout(null);
          }}
          maxLength={20}
        />
      </div>

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
            Momentje…
          </>
        ) : (
          "Bekijk mijn subsidies"
        )}
      </button>

      <p className="mt-3 text-[12px] italic text-muted-foreground">
        Alleen om je overzicht te tonen en vrijblijvend contact op te nemen. Geen nieuwsbrief.
      </p>
    </form>
  );
};
