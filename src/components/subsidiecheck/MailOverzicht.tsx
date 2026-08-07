import { FormEvent, useRef, useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";

import { pushGtmEvent } from "@/lib/gtm";
import type { PdokAdres } from "@/lib/pdok";
import type { SubsidieCheckInput, SubsidieRegeling } from "@/lib/subsidies";

import { bewaarContact } from "./contactOpslag";
import { valideerContact, verstuurSubsidiecheckLead } from "./leadFormulier";

const inputClass =
  "w-full rounded-lg border border-input bg-background px-4 py-3 text-[16px] lg:text-[15px] text-foreground outline-none transition min-h-[48px] focus:border-accent focus:shadow-[0_0_0_3px_hsl(var(--accent)/0.18)]";

interface MailOverzichtProps {
  input: SubsidieCheckInput;
  adres: PdokAdres;
  regelingen: SubsidieRegeling[];
}

// De zachte conversieroute: e-mail + naam → lead in het CRM (zelfde
// `leads_bewoners`-tabel en kolommen als het contactformulier, met
// `bron: "Voortraject"` en `formulier: "subsidietool"`). De aangevinkte interesses gaan mee in
// `subsidiecheck_interesses` zodat het team gericht kan opvolgen.
export const MailOverzicht = ({ input, adres, regelingen }: MailOverzichtProps) => {
  const [voornaam, setVoornaam] = useState("");
  const [tussenvoegsel, setTussenvoegsel] = useState("");
  const [achternaam, setAchternaam] = useState("");
  const [email, setEmail] = useState("");
  const [telefoon, setTelefoon] = useState("");
  const [fout, setFout] = useState<string | null>(null);
  const [bezig, setBezig] = useState(false);
  const [verstuurd, setVerstuurd] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const geladenOp = useRef(Date.now());

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (bezig) return;
    setFout(null);

    if (honeypot.trim() !== "") {
      setVerstuurd(true); // stil falen voor bots
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
      const { leadId } = await verstuurSubsidiecheckLead({
        waarden: resultaat.waarden,
        input,
        adres,
        regelingen,
        // Deelbare URL van dit resultaat (voor de "bekijk online"-link in de mail).
        overzichtUrl: typeof window !== "undefined" ? window.location.href : undefined,
        honeypot,
      });
      // Vanaf hier is de bezoeker bekend: het vraagblok eronder hoeft dan geen
      // naam en e-mail meer te vragen en de vraag landt bij dezelfde lead.
      bewaarContact({ ...resultaat.waarden, leadId });
      // Geen naam/e-mail in het event — alleen dat er een lead is (privacy).
      pushGtmEvent("subsidiecheck_lead", { aantal_regelingen: regelingen.length });
      setVerstuurd(true);
    } catch (err) {
      console.error("Subsidiecheck lead submit failed", err);
      setFout("Er ging iets mis. Probeer het later nog eens of mail ons op info@voortraject.nl.");
    } finally {
      setBezig(false);
    }
  };

  if (verstuurd) {
    return (
      <div role="status" aria-live="polite" className="flex items-start gap-3">
        <CheckCircle size={20} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
        <p className="text-[15px] leading-relaxed text-foreground">
          Dankjewel! We sturen het overzicht naar <strong>{email.trim()}</strong>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
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

      {/* Regel 1: de drie naamvelden (tussenvoegsel smal). Op mobiel krijgt de
          voornaam de volle breedte en zakken tussenvoegsel + achternaam samen
          naar de tweede regel (het tussenvoegsel hoort bij de achternaam). */}
      <div className="grid grid-cols-[2fr_3fr] gap-3 sm:grid-cols-[1.2fr_0.7fr_1.4fr]">
        <label className="sr-only" htmlFor="sc-mail-voornaam">
          Je voornaam (verplicht)
        </label>
        <input
          id="sc-mail-voornaam"
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
        <label className="sr-only" htmlFor="sc-mail-tussenvoegsel">
          Tussenvoegsel (optioneel)
        </label>
        <input
          id="sc-mail-tussenvoegsel"
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
        <label className="sr-only" htmlFor="sc-mail-achternaam">
          Je achternaam (verplicht)
        </label>
        <input
          id="sc-mail-achternaam"
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

      {/* Regel 2: e-mail, telefoon en de verstuurknop. */}
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[1.4fr_1fr_auto]">
        <label className="sr-only" htmlFor="sc-mail-email">
          Je e-mailadres (verplicht)
        </label>
        <input
          id="sc-mail-email"
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
        <label className="sr-only" htmlFor="sc-mail-telefoon">
          Je telefoonnummer (verplicht)
        </label>
        <input
          id="sc-mail-telefoon"
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
        <button
          type="submit"
          disabled={bezig}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-6 py-3 text-[15px] font-semibold text-primary transition-colors hover:bg-accent-hover disabled:opacity-70 min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          {bezig ? (
            <>
              <Loader2 size={15} className="animate-spin" aria-hidden="true" />
              Versturen…
            </>
          ) : (
            "Mail mij dit overzicht"
          )}
        </button>
      </div>

      {fout && (
        <p role="alert" className="mt-2 text-[14px] text-destructive">
          {fout}
        </p>
      )}
      <p className="mt-2 text-[12px] italic text-muted-foreground">
        Alleen om dit overzicht te sturen en vrijblijvend contact op te nemen. Geen nieuwsbrief.
      </p>
    </form>
  );
};
