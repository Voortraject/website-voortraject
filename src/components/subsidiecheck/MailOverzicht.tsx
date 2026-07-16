import { FormEvent, useRef, useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";

import {
  SUPABASE_EXTERNAL_ANON_KEY,
  supabaseExternal as supabase,
} from "@/integrations/supabase/external-client";
import { pushGtmEvent } from "@/lib/gtm";
import type { PdokAdres } from "@/lib/pdok";
import { normalizePostcode } from "@/lib/pdok";
import {
  BEWONERTYPE_LABELS,
  MAATREGEL_LABELS,
  type SubsidieCheckInput,
  type SubsidieRegeling,
} from "@/lib/subsidies";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const NAME_RE = /^[\p{L}\s'-]+$/u;

// Zelfde NL-nummercheck als het contactformulier: 0xxxxxxxxx of +31xxxxxxxxx.
const validatePhoneNL = (raw: string): boolean => {
  const cleaned = raw.replace(/[\s-]/g, "");
  if (!/^[+0-9]+$/.test(cleaned)) return false;
  return /^0[0-9]{9}$/.test(cleaned) || /^\+31[0-9]{9}$/.test(cleaned);
};

// Productie: de edge function schrijft de lead én stuurt de bezoeker het
// overzicht automatisch per e-mail (Resend). Is de var niet gezet, dan valt de
// component terug op een directe lead-insert (zoals voorheen) — dan komt er nog
// geen automatische mail, maar gaat de lead niet verloren.
const MAIL_FUNCTIE_URL = import.meta.env.VITE_SUBSIDIECHECK_MAIL_URL as string | undefined;

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

const inputClass =
  "w-full rounded-lg border border-input bg-background px-4 py-3 text-[16px] lg:text-[15px] text-foreground outline-none transition min-h-[48px] focus:border-accent focus:shadow-[0_0_0_3px_hsl(var(--accent)/0.18)]";

interface MailOverzichtProps {
  input: SubsidieCheckInput;
  adres: PdokAdres;
  regelingen: SubsidieRegeling[];
}

// De zachte conversieroute: e-mail + naam → lead in het CRM (zelfde
// `leads_bewoners`-tabel en kolommen als het contactformulier, alleen
// `bron: "Subsidiecheck"`). De gevonden regelingen gaan mee in `notities`
// zodat het team het overzicht kan nasturen en gericht kan opvolgen.
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

  // Samengestelde notitie voor de lead (zowel client- als serverpad tonen dit
  // in het CRM zodat het team gericht kan opvolgen).
  const bouwNotities = () =>
    [
      `Subsidiecheck ingevuld: ${regelingen.length} regelingen gevonden.`,
      `Situatie: ${BEWONERTYPE_LABELS[input.bewonertype]}`,
      `Interesse: ${input.maatregelen.map((m) => MAATREGEL_LABELS[m]).join(", ")}`,
      `Regelingen: ${regelingen.map((r) => r.titel).join("; ")}`,
      `Verzoek: overzicht per e-mail ontvangen.`,
    ].join("\n");

  // Productie: edge function → schrijft de lead + stuurt de mail via Resend.
  const verstuurViaFunctie = async (vn: string, tv: string, an: string, em: string, tel: string) => {
    const res = await fetch(MAIL_FUNCTIE_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Vereist door de Supabase function-gateway; anon-key is publiek.
        apikey: SUPABASE_EXTERNAL_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_EXTERNAL_ANON_KEY}`,
      },
      body: JSON.stringify({
        voornaam: vn || undefined,
        tussenvoegsel: tv || undefined,
        achternaam: an,
        email: em,
        telefoon: tel,
        honeypot,
        input: {
          postcode: normalizePostcode(input.postcode),
          huisnummer: input.huisnummer,
          toevoeging: input.toevoeging?.trim() || undefined,
          bewonertype: input.bewonertype,
          maatregelen: input.maatregelen,
        },
        adres: { straatnaam: adres.straatnaam, woonplaatsnaam: adres.woonplaatsnaam },
        // Deelbare URL van dit resultaat (voor de "bekijk online"-link in de mail).
        overzichtUrl: typeof window !== "undefined" ? window.location.href : undefined,
        // Alleen wat de mail nodig heeft — geen interne filtervelden meesturen.
        regelingen: regelingen.map((r) => ({
          titel: r.titel,
          niveau: r.niveau,
          type: r.type,
          bedragIndicatie: r.bedragIndicatie,
          omschrijving: r.omschrijving,
          bronUrl: r.bronUrl,
        })),
      }),
    });
    if (!res.ok) throw new Error(`subsidiecheck-mail gaf status ${res.status}`);
  };

  // Terugval (function nog niet gedeployed): directe lead-insert in het CRM,
  // exact dezelfde tabel/kolommen. Er gaat dan nog geen automatische mail uit.
  // De kolom `naam` bewust niet meesturen: een BEFORE INSERT-trigger in het CRM
  // stelt die zelf samen uit voornaam/tussenvoegsel/achternaam.
  const verstuurViaClientInsert = async (vn: string, tv: string, an: string, em: string, tel: string) => {
    const { error } = await supabase.from("leads_bewoners").insert({
      tenant_id: "00000000-0000-0000-0000-000000000001",
      voornaam: vn ? escapeHtml(vn) : null,
      tussenvoegsel: tv ? escapeHtml(tv) : null,
      achternaam: escapeHtml(an),
      email: em,
      telefoon: tel,
      postcode: normalizePostcode(input.postcode),
      huisnummer: input.huisnummer,
      toevoeging: input.toevoeging?.trim() ? escapeHtml(input.toevoeging.trim()) : null,
      straat: escapeHtml(adres.straatnaam),
      stad: escapeHtml(adres.woonplaatsnaam),
      notities: bouwNotities(),
      bron: "Subsidiecheck",
      status: "nieuw",
    } as never);
    if (error) throw error;
  };

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

    const vn = voornaam.trim();
    if (vn && (vn.length > 100 || !NAME_RE.test(vn))) {
      setFout("Je voornaam bevat ongeldige tekens.");
      return;
    }
    const tv = tussenvoegsel.trim();
    if (tv && (tv.length > 25 || !NAME_RE.test(tv))) {
      setFout("Het tussenvoegsel bevat ongeldige tekens.");
      return;
    }
    const an = achternaam.trim();
    if (!an || an.length < 2 || an.length > 100 || !NAME_RE.test(an)) {
      setFout("Vul je achternaam in.");
      return;
    }
    const em = email.trim();
    if (!EMAIL_RE.test(em) || em.length > 255) {
      setFout("Dit lijkt geen geldig e-mailadres.");
      return;
    }
    const tel = telefoon.trim();
    if (!tel) {
      setFout("Vul je telefoonnummer in.");
      return;
    }
    if (!validatePhoneNL(tel)) {
      setFout("Vul een geldig Nederlands telefoonnummer in (bijvoorbeeld 06 12345678).");
      return;
    }

    setBezig(true);
    try {
      if (MAIL_FUNCTIE_URL) {
        await verstuurViaFunctie(vn, tv, an, em, tel);
      } else {
        await verstuurViaClientInsert(vn, tv, an, em, tel);
      }
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

      {/* Regel 1: de drie naamvelden (tussenvoegsel smal). Op mobiel stapelt alles. */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1.2fr_0.7fr_1.4fr]">
        <label className="sr-only" htmlFor="sc-mail-voornaam">
          Je voornaam (optioneel)
        </label>
        <input
          id="sc-mail-voornaam"
          type="text"
          autoComplete="given-name"
          placeholder="Je voornaam"
          className={inputClass}
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
          placeholder="Tussenvoegsel"
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
          Je e-mailadres
        </label>
        <input
          id="sc-mail-email"
          type="email"
          autoComplete="email"
          placeholder="Je e-mailadres"
          className={inputClass}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setFout(null);
          }}
          maxLength={255}
        />
        <label className="sr-only" htmlFor="sc-mail-telefoon">
          Je telefoonnummer
        </label>
        <input
          id="sc-mail-telefoon"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          placeholder="Je telefoonnummer"
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
