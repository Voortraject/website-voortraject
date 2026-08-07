import { useState, useEffect, useRef, FormEvent, ChangeEvent } from "react";
import { Loader2 } from "lucide-react";
import { supabaseExternal as supabase } from "@/integrations/supabase/external-client";
import { TELEFOON_FOUT, validatePhoneNL } from "@/lib/telefoon";
import { pushGtmEvent } from "@/lib/gtm";

// Zakelijk contactformulier, hoort bij /zakelijk. Dit is sinds de bewoner-only
// ombouw van /contact de enige route naar `leads_uitvoerders`.
//
// LET OP bij wijzigen: `src/integrations/supabase/types.ts` beschrijft
// `leads_uitvoerders` nog met de oude kolommen (naam_contactpersoon /
// telefoonnummer / vragen). De live CRM-tabel gebruikt de kolommen hieronder;
// vandaar de `as any` op de insert. Types opnieuw genereren lost dat op.

const baseInputClass =
  "w-full rounded-lg border bg-[hsl(var(--background))] px-4 py-3 text-[16px] lg:text-[15px] text-foreground outline-none transition min-h-[44px]";
const inputOk =
  "border-[hsl(var(--border))] focus:border-[hsl(var(--accent))] focus:shadow-[0_0_0_3px_hsl(var(--accent)/0.15)]";
const inputErr =
  "border-destructive focus:border-destructive focus:shadow-[0_0_0_3px_hsl(var(--destructive)/0.15)]";

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");
const labelClass = "block mb-2 text-[14px] font-semibold text-foreground";
const fieldWrap = "mb-4";
const required = <span className="text-accent ml-1" aria-hidden="true">*</span>;

const initieel = {
  bedrijfsnaam: "",
  contactpersoon_voornaam: "",
  contactpersoon_tussenvoegsel: "",
  contactpersoon_achternaam: "",
  email: "",
  telefoonnummer: "",
  vragen: "",
};

// Ruim genoeg voor een alinea of twee ("dit zijn wij, hier lopen we tegenaan"),
// zonder een open veld te zijn waar iemand een boek in kwijt kan.
const MAX_NOTES = 1000;
const FREE_EMAIL_DOMAINS = ["gmail.com", "hotmail.com", "outlook.com", "live.nl", "yahoo.com", "ziggo.nl", "kpnmail.nl"];

// Bewust géén HTML-escaping op de invoer: wat we opslaan moet exact zijn wat de
// bezoeker typte. Escapen hoort bij het renderen, niet bij het opslaan.
// Het koppelteken staat achteraan in de klasse, dan is het letterlijk en hoeft
// het niet ge-escaped te worden.
const NAME_RE = /^[\p{L}\s'-]+$/u;
const COMPANY_RE = /^[\p{L}\p{N}\s.,&\-'()/]+$/u;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const VELD_VOLGORDE = [
  "bedrijfsnaam",
  "contactpersoon_voornaam",
  "contactpersoon_tussenvoegsel",
  "contactpersoon_achternaam",
  "email",
  "telefoonnummer",
  "vragen",
];

export const ZakelijkContactFormulier = () => {
  const [velden, setVelden] = useState(initieel);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [emailWarning, setEmailWarning] = useState<string | null>(null);

  // Honeypot + tijd-op-pagina, hetzelfde recept als het bewonersformulier en de
  // subsidiecheck.
  const [honeypot, setHoneypot] = useState("");
  const pageLoadedAt = useRef<number>(Date.now());

  const formRef = useRef<HTMLFormElement>(null);

  const clearError = (key: string) =>
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });

  // ---------- Validatie ----------
  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {};

    const bn = velden.bedrijfsnaam.trim();
    if (!bn) e.bedrijfsnaam = "Vul de naam van jullie bedrijf in.";
    else if (bn.length < 2) e.bedrijfsnaam = "De bedrijfsnaam moet minimaal 2 karakters bevatten.";
    else if (bn.length > 150 || !COMPANY_RE.test(bn)) e.bedrijfsnaam = "De bedrijfsnaam bevat ongeldige tekens.";

    const cpVoornaam = velden.contactpersoon_voornaam.trim();
    if (!cpVoornaam) e.contactpersoon_voornaam = "Vul je voornaam in.";
    else if (cpVoornaam.length > 100 || !NAME_RE.test(cpVoornaam))
      e.contactpersoon_voornaam = "Je voornaam bevat ongeldige tekens.";

    const cpTussenvoegsel = velden.contactpersoon_tussenvoegsel.trim();
    if (cpTussenvoegsel && (cpTussenvoegsel.length > 25 || !NAME_RE.test(cpTussenvoegsel)))
      e.contactpersoon_tussenvoegsel = "Het tussenvoegsel bevat ongeldige tekens.";

    const cpAchternaam = velden.contactpersoon_achternaam.trim();
    if (!cpAchternaam) e.contactpersoon_achternaam = "Vul je achternaam in.";
    else if (cpAchternaam.length < 2) e.contactpersoon_achternaam = "Je achternaam moet minimaal 2 karakters bevatten.";
    else if (cpAchternaam.length > 100 || !NAME_RE.test(cpAchternaam))
      e.contactpersoon_achternaam = "Je achternaam bevat ongeldige tekens.";

    const email = velden.email.trim();
    if (!email) e.email = "Vul je e-mailadres in.";
    else if (!EMAIL_RE.test(email) || email.length > 255) e.email = "Dit lijkt geen geldig e-mailadres.";

    const tel = velden.telefoonnummer.trim();
    if (!tel) e.telefoonnummer = "Vul je telefoonnummer in.";
    else if (!validatePhoneNL(tel)) e.telefoonnummer = TELEFOON_FOUT;

    const bericht = velden.vragen.trim();
    if (!bericht) e.vragen = "Vul je bericht in.";
    else if (velden.vragen.length > MAX_NOTES)
      e.vragen = `Je bericht is te lang (maximaal ${MAX_NOTES} karakters).`;

    return e;
  };

  // Tip bij een gratis e-maildomein: zakelijke leads willen we het liefst op een
  // zakelijk adres.
  useEffect(() => {
    const dom = velden.email.trim().toLowerCase().split("@")[1];
    setEmailWarning(
      dom && FREE_EMAIL_DOMAINS.includes(dom)
        ? "Tip: vul bij voorkeur je zakelijke e-mailadres in."
        : null,
    );
  }, [velden.email]);

  const focusFirstError = (errs: Record<string, string>) => {
    const first = VELD_VOLGORDE.find((k) => errs[k]);
    if (!first || !formRef.current) return;
    const el = formRef.current.querySelector<HTMLElement>(`[name="${first}"]`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => el.focus(), 200);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setErrorMsg(null);

    // Honeypot gevuld: stil doen alsof het gelukt is, zonder insert.
    if (honeypot.trim() !== "") {
      setSubmitted(true);
      return;
    }
    if (Date.now() - pageLoadedAt.current < 2000) {
      setErrorMsg("Even geduld, wacht een moment voordat je het formulier verstuurt.");
      return;
    }

    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      focusFirstError(errs);
      return;
    }

    setSubmitting(true);
    try {
      // De kolom `contactpersoon` bewust niet meesturen: een BEFORE INSERT-trigger
      // in het CRM stelt die zelf samen uit de drie contactpersoon-delen.
      const { error } = await supabase.from("leads_uitvoerders").insert({
        tenant_id: "00000000-0000-0000-0000-000000000001",
        bedrijfsnaam: velden.bedrijfsnaam.trim(),
        contactpersoon_voornaam: velden.contactpersoon_voornaam.trim(),
        contactpersoon_tussenvoegsel: velden.contactpersoon_tussenvoegsel.trim() || null,
        contactpersoon_achternaam: velden.contactpersoon_achternaam.trim(),
        email: velden.email.trim(),
        telefoon: velden.telefoonnummer.trim(),
        // Verplicht veld, dus altijd gevuld.
        notities: velden.vragen.trim(),
        // Eigen lead van onze eigen site: bron "Voortraject". Het CRM normaliseert
        // dat (trigger `normaliseer_lead_bron`) naar de code `voortraject`.
        bron: "Voortraject",
        status: "nieuw",
        // De gegenereerde types voor leads_uitvoerders lopen achter op de live
        // CRM-tabel (zie de toelichting bovenaan dit bestand), vandaar de cast.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
      if (error) throw error;
      // Geen persoonsgegevens mee in de dataLayer.
      pushGtmEvent("zakelijk_lead");
      setVelden(initieel);
      setSubmitted(true);
    } catch (err) {
      console.error("Zakelijke lead submit failed", err);
      setErrorMsg(
        "Er ging iets mis bij het versturen. Probeer het later nog eens of mail ons direct op info@voortraject.nl.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- Renderhulpjes ----------
  const errId = (k: string) => `zak-err-${k}`;

  const FieldError = ({ name }: { name: string }) =>
    errors[name] ? (
      <p id={errId(name)} role="alert" className="font-sans mt-1.5 text-[13px] text-destructive">
        {errors[name]}
      </p>
    ) : null;

  const inputCls = (name: string) => cx(baseInputClass, errors[name] ? inputErr : inputOk);

  const onChange =
    (k: keyof typeof velden) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setVelden({ ...velden, [k]: e.target.value });
      clearError(k);
    };

  if (submitted) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="text-center rounded-xl border border-[#b7e4c7] bg-[#f0faf4] p-6"
      >
        <h3 className="font-display text-[22px] font-semibold text-[#15803d] mb-3">Bedankt!</h3>
        <p className="font-sans text-[15px] leading-relaxed text-[#166534]">
          We hebben je bericht ontvangen en nemen binnen 24 uur contact met je op.
        </p>
      </div>
    );
  }

  return (
    <>
      {errorMsg && (
        <div
          role="alert"
          className="font-sans mb-4 rounded-lg border border-[hsl(var(--destructive)/0.3)] bg-[hsl(var(--destructive)/0.07)] px-4 py-3 text-[14px] text-destructive"
        >
          {errorMsg}
        </div>
      )}

      {/* Er is bewust geen enkel uploadveld: het formulier kent alleen tekstvelden,
          dus er kan niets binnenkomen behalve tekst. De drop-guard is puur comfort:
          zonder deze regel navigeert de browser weg naar een bestand dat iemand op
          het formulier sleept, en is alles wat er getypt was verdwenen. */}
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        noValidate
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => e.preventDefault()}
      >
        {/* Honeypot: een gewoon tekstveld (géén type="hidden" — dat slaan bots juist
            over) dat alleen met CSS uit beeld staat. De naam is bewust nietszeggend:
            browser-autofill herkent `vt_check` niet, dus een echte bezoeker laat hem
            gegarandeerd leeg. */}
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

        <div className={fieldWrap}>
          <label htmlFor="zak-bedrijfsnaam" className={labelClass}>Bedrijfsnaam{required}</label>
          <input
            id="zak-bedrijfsnaam"
            name="bedrijfsnaam"
            type="text"
            autoComplete="organization"
            aria-required="true"
            aria-invalid={!!errors.bedrijfsnaam}
            aria-describedby={errors.bedrijfsnaam ? errId("bedrijfsnaam") : undefined}
            className={inputCls("bedrijfsnaam")}
            value={velden.bedrijfsnaam}
            onChange={onChange("bedrijfsnaam")}
            maxLength={150}
          />
          <FieldError name="bedrijfsnaam" />
        </div>

        {/* Naamvelden contactpersoon: groepslabel + placeholders. Losse labels
            ("Voornaam contactpersoon") braken anders over twee regels. */}
        <div className={fieldWrap}>
          <label className={labelClass}>
            Contactpersoon
            <span className="text-muted-foreground font-normal ml-1">(tussenvoegsel optioneel)</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_2fr] lg:grid-cols-[1fr_0.95fr_1.25fr] gap-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <input
                id="zak-cp-voornaam"
                name="contactpersoon_voornaam"
                type="text"
                autoComplete="given-name"
                placeholder="Voornaam *"
                aria-label="Voornaam contactpersoon"
                aria-required="true"
                aria-invalid={!!errors.contactpersoon_voornaam}
                aria-describedby={errors.contactpersoon_voornaam ? errId("contactpersoon_voornaam") : undefined}
                className={inputCls("contactpersoon_voornaam")}
                value={velden.contactpersoon_voornaam}
                onChange={onChange("contactpersoon_voornaam")}
                maxLength={100}
              />
            </div>
            <input
              id="zak-cp-tussenvoegsel"
              name="contactpersoon_tussenvoegsel"
              type="text"
              placeholder="Tussenvoegsel"
              aria-label="Tussenvoegsel contactpersoon"
              aria-invalid={!!errors.contactpersoon_tussenvoegsel}
              aria-describedby={errors.contactpersoon_tussenvoegsel ? errId("contactpersoon_tussenvoegsel") : undefined}
              className={inputCls("contactpersoon_tussenvoegsel")}
              value={velden.contactpersoon_tussenvoegsel}
              onChange={onChange("contactpersoon_tussenvoegsel")}
              maxLength={25}
            />
            <input
              id="zak-cp-achternaam"
              name="contactpersoon_achternaam"
              type="text"
              autoComplete="family-name"
              placeholder="Achternaam *"
              aria-label="Achternaam contactpersoon"
              aria-required="true"
              aria-invalid={!!errors.contactpersoon_achternaam}
              aria-describedby={errors.contactpersoon_achternaam ? errId("contactpersoon_achternaam") : undefined}
              className={inputCls("contactpersoon_achternaam")}
              value={velden.contactpersoon_achternaam}
              onChange={onChange("contactpersoon_achternaam")}
              maxLength={100}
            />
          </div>
          <div className="mt-1">
            <FieldError name="contactpersoon_voornaam" />
            <FieldError name="contactpersoon_tussenvoegsel" />
            <FieldError name="contactpersoon_achternaam" />
          </div>
        </div>

        <div className={cx("grid grid-cols-1 sm:grid-cols-2 gap-4", fieldWrap)}>
          <div>
            <label htmlFor="zak-email" className={labelClass}>E-mailadres{required}</label>
            <input
              id="zak-email"
              name="email"
              type="email"
              autoComplete="email"
              aria-required="true"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? errId("email") : emailWarning ? "zak-email-tip" : undefined}
              className={inputCls("email")}
              value={velden.email}
              onChange={onChange("email")}
              maxLength={255}
            />
            <FieldError name="email" />
            {!errors.email && emailWarning && (
              <p id="zak-email-tip" className="font-sans mt-1.5 text-[13px] text-[#92400e]">
                {emailWarning}
              </p>
            )}
          </div>
          <div>
            <label htmlFor="zak-tel" className={labelClass}>Telefoonnummer{required}</label>
            <input
              id="zak-tel"
              name="telefoonnummer"
              type="tel"
              autoComplete="tel"
              aria-required="true"
              aria-invalid={!!errors.telefoonnummer}
              aria-describedby={errors.telefoonnummer ? errId("telefoonnummer") : undefined}
              className={inputCls("telefoonnummer")}
              value={velden.telefoonnummer}
              onChange={onChange("telefoonnummer")}
            />
            <FieldError name="telefoonnummer" />
          </div>
        </div>

        <div className={fieldWrap}>
          {/* Tekenlimiet staat alleen in de teller onder het veld. */}
          <label htmlFor="zak-vragen" className={labelClass}>Bericht{required}</label>
          <textarea
            id="zak-vragen"
            name="vragen"
            aria-required="true"
            aria-invalid={!!errors.vragen}
            aria-describedby={errors.vragen ? errId("vragen") : "zak-count-vragen"}
            className={inputCls("vragen")}
            placeholder="Vertel kort waar jullie tegenaan lopen of wat je wil weten."
            style={{ minHeight: 100, resize: "vertical" }}
            value={velden.vragen}
            onChange={onChange("vragen")}
            maxLength={MAX_NOTES}
          />
          <div className="flex justify-between items-center mt-1">
            <FieldError name="vragen" />
            <span id="zak-count-vragen" className="font-sans text-[12px] ml-auto text-muted-foreground">
              {velden.vragen.length} / {MAX_NOTES}
            </span>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-accent hover:bg-accent-hover text-primary font-semibold text-[15px] px-8 py-3 min-h-[48px] transition-colors disabled:opacity-70"
        >
          {submitting && <Loader2 size={18} className="animate-spin" aria-hidden="true" />}
          {submitting ? "Versturen..." : "Verstuur bericht"}
        </button>

        <p className="font-sans mt-4 text-[13px] leading-relaxed text-muted-foreground">
          We nemen binnen 24 uur contact op. Je gegevens gebruiken we alleen om je vraag te
          beantwoorden, zie onze <a href="/privacy" className="underline underline-offset-2 hover:text-foreground">privacyverklaring</a>.
        </p>
      </form>
    </>
  );
};

export default ZakelijkContactFormulier;
