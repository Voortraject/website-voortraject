import { FormEvent, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, MapPin } from "lucide-react";

import { pushGtmEvent } from "@/lib/gtm";
import type { PdokAdres } from "@/lib/pdok";
import { subsidieProvider, type SubsidieCheckInput, type SubsidieRegeling } from "@/lib/subsidies";

import { schrijfSubsidiecheckLead, valideerContact, verstuurSubsidiecheckLead } from "./leadFormulier";

const inputClass =
  "w-full rounded-lg border border-input bg-background px-4 py-3.5 text-[16px] text-foreground outline-none transition min-h-[52px] focus:border-accent focus:shadow-[0_0_0_3px_hsl(var(--accent)/0.18)]";

interface StapGegevensProps {
  input: SubsidieCheckInput;
  adres: PdokAdres;
  /** Gegevens opgeslagen → open het resultaat. */
  onOntgrendeld: () => void;
}

// De gegevens-poort: de tussenstap tussen "Jouw woning" en het resultaat. We
// vragen naam + e-mail + telefoon, halen de regelingen op (primeert meteen de
// cache voor het resultaat), schrijven de lead naar het CRM (`leads_bewoners`,
// bron "Subsidiecheck") én sturen het overzicht per mail. Daarna openen we het
// resultaat op het scherm. Zo verzamelen we alvast leads terwijl de echte
// lancering nog een paar weken weg is. Faalt de bron, dan gaat de lead er
// alsnog in (zonder mail) en toont het resultaat zelf de foutstaat.
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
  const queryClient = useQueryClient();

  const adresRegel = `${adres.straatnaam} ${input.huisnummer}${input.toevoeging ? ` ${input.toevoeging}` : ""}, ${adres.woonplaatsnaam}`;

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
      // Haal de regelingen op (primeert meteen de react-query-cache voor het
      // resultaat) zodat de mail het echte overzicht kan meesturen. `retry: 1`
      // gelijk aan useSubsidieCheck; de standaard (3x met backoff) zou de
      // bezoeker hier seconden laten wachten.
      let regelingen: SubsidieRegeling[];
      try {
        regelingen = await queryClient.fetchQuery({
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
        await schrijfSubsidiecheckLead({ waarden: resultaat.waarden, input, adres });
        pushGtmEvent("subsidiecheck_lead", {
          bewonertype: input.bewonertype,
          aantal_regelingen: 0,
          bron_fout: true,
        });
        onOntgrendeld();
        return;
      }
      await verstuurSubsidiecheckLead({
        waarden: resultaat.waarden,
        input,
        adres,
        regelingen,
        // Deelbare URL van dit resultaat (voor de "bekijk online"-link in de mail).
        overzichtUrl: typeof window !== "undefined" ? window.location.href : undefined,
        honeypot,
      });
      // Geen persoonsgegevens in het event (privacy) — alleen grove context.
      pushGtmEvent("subsidiecheck_lead", { bewonertype: input.bewonertype, aantal_regelingen: regelingen.length });
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
            Versturen…
          </>
        ) : (
          "Mail mij dit overzicht"
        )}
      </button>

      <p className="mt-3 text-[12px] italic text-muted-foreground">
        Alleen om je overzicht te sturen en vrijblijvend contact op te nemen. Geen nieuwsbrief.
      </p>
    </form>
  );
};
