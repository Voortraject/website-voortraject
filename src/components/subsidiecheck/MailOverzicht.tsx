import { FormEvent, useRef, useState } from "react";
import { CheckCircle, Loader2 } from "lucide-react";

import { supabaseExternal as supabase } from "@/integrations/supabase/external-client";
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
const NAME_RE = /^[\p{L}\s'\-]+$/u;

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
  const [naam, setNaam] = useState("");
  const [email, setEmail] = useState("");
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

    const n = naam.trim();
    if (!n || n.length < 2 || n.length > 100 || !NAME_RE.test(n)) {
      setFout("Vul je naam in.");
      return;
    }
    const em = email.trim();
    if (!EMAIL_RE.test(em) || em.length > 255) {
      setFout("Dit lijkt geen geldig e-mailadres.");
      return;
    }

    setBezig(true);
    try {
      const notities = [
        `Subsidiecheck ingevuld: ${regelingen.length} regelingen gevonden.`,
        `Situatie: ${BEWONERTYPE_LABELS[input.bewonertype]}`,
        `Interesse: ${input.maatregelen.map((m) => MAATREGEL_LABELS[m]).join(", ")}`,
        `Regelingen: ${regelingen.map((r) => r.titel).join("; ")}`,
        `Verzoek: overzicht per e-mail ontvangen.`,
      ].join("\n");

      const { error } = await supabase.from("leads_bewoners").insert({
        tenant_id: "00000000-0000-0000-0000-000000000001",
        naam: escapeHtml(n),
        email: em,
        telefoon: null,
        postcode: normalizePostcode(input.postcode),
        huisnummer: input.huisnummer,
        toevoeging: input.toevoeging?.trim() ? escapeHtml(input.toevoeging.trim()) : null,
        straat: escapeHtml(adres.straatnaam),
        stad: escapeHtml(adres.woonplaatsnaam),
        notities,
        bron: "Subsidiecheck",
        status: "nieuw",
      } as never);
      if (error) throw error;
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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1.4fr_auto]">
        <label className="sr-only" htmlFor="sc-mail-naam">
          Je naam
        </label>
        <input
          id="sc-mail-naam"
          type="text"
          autoComplete="name"
          placeholder="Je naam"
          className={inputClass}
          value={naam}
          onChange={(e) => {
            setNaam(e.target.value);
            setFout(null);
          }}
          maxLength={100}
        />
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
        Alleen om dit overzicht te sturen. Geen nieuwsbrief.
      </p>
    </form>
  );
};
