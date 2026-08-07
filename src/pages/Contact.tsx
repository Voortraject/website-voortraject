import { useState, useRef, FormEvent, ChangeEvent } from "react";
import { CheckCircle, Loader2, Mail, MapPin, Phone } from "lucide-react";
import { Header } from "@/components/Header";
import { Seo } from "@/components/Seo";
import { Footer } from "@/components/Footer";
import { Reviews } from "@/components/sections/Reviews";
import { supabaseExternal as supabase } from "@/integrations/supabase/external-client";
import { normalizePostcode, POSTCODE_RE, zoekAdres } from "@/lib/pdok";
import { TELEFOON_FOUT, validatePhoneNL } from "@/lib/telefoon";

const baseInputClass =
  "w-full rounded-lg border bg-[#FBFAF7] px-4 py-3 text-[16px] lg:text-[15px] text-[#2B2B2B] outline-none transition min-h-[44px]";
const inputOk =
  "border-[#D4D2CC] focus:border-[#E8B547] focus:shadow-[0_0_0_3px_rgba(232,181,71,0.15)]";
const inputErr =
  "border-[#dc2626] focus:border-[#dc2626] focus:shadow-[0_0_0_3px_rgba(220,38,38,0.15)]";

const cx = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(" ");
const labelClass = "block mb-2 text-[14px] font-semibold text-[#2B2B2B]";
const fieldWrap = "mb-4";
const required = <span className="text-[#E8B547] ml-1" aria-hidden="true">*</span>;
const optional = <span className="text-[#8B8680] font-normal ml-1">(optioneel)</span>;

const expectations = [
  "We nemen binnen 24 uur contact op",
  "We kijken samen wat er voor jouw woning logisch is",
  "Je hoeft niets voor te bereiden",
];

// Dezelfde gegevens als in de footer: één plek om ons te bereiken zonder eerst
// het formulier in te vullen.
const contactBlokken = [
  { icon: MapPin, label: "Vestiging", waarde: "Viaductstraat 3-15, Groningen" },
  { icon: Mail, label: "E-mailadres", waarde: "info@voortraject.nl", href: "mailto:info@voortraject.nl" },
  { icon: Phone, label: "Telefoonnummer", waarde: "050 211 2689", href: "tel:+31502112689" },
];

// Exact de drie waarden die het CRM zelf in zijn lead-formulieren aanbiedt
// (kolom `leads_bewoners.aanhef`, vrije tekst). Afwijken zou de aanhef in het
// CRM en in de mailsjablonen laten rammelen.
const aanhefOpties = ["Dhr.", "Mevr.", "Fam."];

const belVoorkeurOpties = [
  "Per e-mail",
  "Telefonisch: Ochtend",
  "Telefonisch: Middag",
  "Telefonisch: Avond",
];

const initialBewoner = {
  aanhef: "",
  voornaam: "",
  tussenvoegsel: "",
  achternaam: "",
  email: "",
  telefoonnummer: "",
  postcode: "",
  huisnummer: "",
  toevoeging: "",
  straatnaam: "",
  plaatsnaam: "",
  bel_voorkeur: "",
  vragen: "",
};

const MAX_NOTES = 2000;

// ---------- Validators ----------
const NAME_RE = /^[\p{L}\s'\-]+$/u;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Bewust géén HTML-escaping op de invoer: wat we opslaan moet exact zijn wat de
// bezoeker typte. Escapen hoort bij het renderen (React doet dat zelf, en het
// CRM toont deze kolommen als platte tekst), niet bij het opslaan.

// De nummercheck zelf staat in src/lib/telefoon.ts, gedeeld met de subsidiecheck.

// ---------- Component ----------
const Contact = () => {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [bewoner, setBewoner] = useState(initialBewoner);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [adresLocked, setAdresLocked] = useState(false);
  const [adresChecked, setAdresChecked] = useState(false);
  const [adresLoading, setAdresLoading] = useState(false);
  const [adresEditOverride, setAdresEditOverride] = useState(false);

  // Honeypot
  const [honeypot, setHoneypot] = useState("");
  // Time on page
  const pageLoadedAt = useRef<number>(Date.now());

  const formRef = useRef<HTMLFormElement>(null);

  const clearError = (key: string) =>
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });

  // ---------- PDOK lookup (gedeeld met de subsidiecheck, zie src/lib/pdok.ts) ----------
  const lookupAdres = async () => {
    const hn = bewoner.huisnummer.trim();
    if (!POSTCODE_RE.test(bewoner.postcode) || !/^[0-9]/.test(hn)) return;
    setAdresLoading(true);
    setAdresChecked(false);
    const adres = await zoekAdres(bewoner.postcode, hn);
    setAdresChecked(true);
    if (adres) {
      setBewoner((b) => ({ ...b, straatnaam: adres.straatnaam, plaatsnaam: adres.woonplaatsnaam }));
      setAdresLocked(true);
      setAdresEditOverride(false);
      clearError("straatnaam");
      clearError("plaatsnaam");
    } else {
      setAdresLocked(false);
    }
    setAdresLoading(false);
  };

  const handlePostcodeChange = (v: string) => {
    setBewoner((b) => ({ ...b, postcode: v, straatnaam: "", plaatsnaam: "" }));
    setAdresLocked(false);
    setAdresChecked(false);
    setAdresEditOverride(false);
    clearError("postcode");
  };
  const handleHuisnummerChange = (v: string) => {
    setBewoner((b) => ({ ...b, huisnummer: v, straatnaam: "", plaatsnaam: "" }));
    setAdresLocked(false);
    setAdresChecked(false);
    setAdresEditOverride(false);
    clearError("huisnummer");
  };

  // ---------- Validation ----------
  const validate = (): Record<string, string> => {
    const e: Record<string, string> = {};

    const voornaam = bewoner.voornaam.trim();
    if (!voornaam) e.voornaam = "Vul je voornaam in.";
    else if (voornaam.length > 100 || !NAME_RE.test(voornaam))
      e.voornaam = "Je voornaam bevat ongeldige tekens.";

    const tussenvoegsel = bewoner.tussenvoegsel.trim();
    if (tussenvoegsel && (tussenvoegsel.length > 25 || !NAME_RE.test(tussenvoegsel)))
      e.tussenvoegsel = "Het tussenvoegsel bevat ongeldige tekens.";

    const achternaam = bewoner.achternaam.trim();
    if (!achternaam) e.achternaam = "Vul je achternaam in.";
    else if (achternaam.length < 2) e.achternaam = "Je achternaam moet minimaal 2 karakters bevatten.";
    else if (achternaam.length > 100 || !NAME_RE.test(achternaam)) e.achternaam = "Je achternaam bevat ongeldige tekens.";

    const email = bewoner.email.trim();
    if (!email) e.email = "Vul je e-mailadres in.";
    else if (!EMAIL_RE.test(email) || email.length > 255) e.email = "Dit lijkt geen geldig e-mailadres.";

    const tel = bewoner.telefoonnummer.trim();
    if (!tel) e.telefoonnummer = "Vul je telefoonnummer in.";
    else if (!validatePhoneNL(tel)) e.telefoonnummer = TELEFOON_FOUT;

    const pc = bewoner.postcode.trim();
    const hn = bewoner.huisnummer.trim();
    if (pc && !POSTCODE_RE.test(pc)) e.postcode = "Vul een geldige postcode in (bijvoorbeeld 1234 AB).";
    if (hn && (!/^[0-9]/.test(hn) || hn.length > 5)) e.huisnummer = "Huisnummer moet beginnen met een cijfer (max 5 karakters).";
    if (pc && !hn) e.huisnummer = "Vul ook een huisnummer in.";
    if (hn && !pc) e.postcode = "Vul ook een postcode in.";

    if (bewoner.vragen.length > MAX_NOTES) e.vragen = "Je bericht is te lang (maximaal 2000 karakters).";

    return e;
  };

  const focusFirstError = (errs: Record<string, string>) => {
    const order = [
      "voornaam",
      "tussenvoegsel",
      "achternaam",
      "email",
      "telefoonnummer",
      "postcode",
      "huisnummer",
      "straatnaam",
      "plaatsnaam",
      "vragen",
    ];
    const first = order.find((k) => errs[k]);
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

    // Honeypot
    if (honeypot.trim() !== "") {
      // silent fail
      setSubmitted(true);
      return;
    }
    // Time on page check (min 2s)
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
      const beltijd = bewoner.bel_voorkeur.trim();
      const opmerkingen = bewoner.vragen.trim();
      let notities: string | null = null;
      if (beltijd && opmerkingen) notities = `Voorkeur voor contact: ${beltijd}\n${opmerkingen}`;
      else if (beltijd) notities = `Voorkeur voor contact: ${beltijd}`;
      else if (opmerkingen) notities = opmerkingen;

      // De kolom `naam` bewust niet meesturen: een BEFORE INSERT-trigger in het
      // CRM stelt die zelf samen uit voornaam/tussenvoegsel/achternaam.
      const { error } = await supabase.from("leads_bewoners").insert({
        tenant_id: "00000000-0000-0000-0000-000000000001",
        aanhef: bewoner.aanhef || null,
        voornaam: bewoner.voornaam.trim(),
        tussenvoegsel: bewoner.tussenvoegsel.trim() || null,
        achternaam: bewoner.achternaam.trim(),
        email: bewoner.email.trim(),
        telefoon: bewoner.telefoonnummer.trim(),
        postcode: bewoner.postcode ? normalizePostcode(bewoner.postcode) : null,
        huisnummer: bewoner.huisnummer.trim() || null,
        toevoeging: bewoner.toevoeging.trim() || null,
        straat: bewoner.straatnaam.trim() || null,
        stad: bewoner.plaatsnaam.trim() || null,
        notities,
        // Eigen lead van onze eigen site: bron "Voortraject". Het CRM
        // normaliseert dat (trigger `normaliseer_lead_bron`) via de naam in
        // `lead_bronnen` naar de code `voortraject`. De oude waarde "Website"
        // werd code `website`, en die bron is in het CRM niet meer in gebruik.
        bron: "Voortraject",
        // Welk formulier de lead opleverde. n8n bepaalt hiermee de taaktitel én
        // of de bevestigingsmail ("binnen 24 uur contact") uitgaat. Er staat een
        // CHECK op: alleen 'contactformulier', 'subsidietool' of NULL.
        formulier: "contactformulier",
        status: "nieuw",
      } as any);
      if (error) throw error;
      setBewoner(initialBewoner);
      setAdresLocked(false);
      setAdresChecked(false);
      setSubmitted(true);
    } catch (err) {
      console.error("Lead submit failed", err);
      setErrorMsg(
        "Er ging iets mis bij het versturen. Probeer het later nog eens of mail ons direct op info@voortraject.nl.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- Reusable field renderers ----------
  const errId = (k: string) => `err-${k}`;

  const FieldError = ({ name }: { name: string }) =>
    errors[name] ? (
      <p
        id={errId(name)}
        role="alert"
        className="font-sans mt-1.5 text-[13px]"
        style={{ color: "#dc2626" }}
      >
        {errors[name]}
      </p>
    ) : null;

  const inputCls = (name: string) => cx(baseInputClass, errors[name] ? inputErr : inputOk);

  const onChangeBew = (k: keyof typeof bewoner) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setBewoner({ ...bewoner, [k]: e.target.value });
    clearError(k);
  };

  return (
    <div className="min-h-screen bg-background">
      <Seo
        title="Contact | Voortraject"
        description="Plan een vrijblijvende kennismaking met Voortraject. We reageren binnen 24 uur en helpen je verder met je verduurzamingsvraag."
        path="/contact"
      />
      <Header />

      {/* Hero + Form (samengevoegd) */}
      <section style={{ backgroundColor: "#F5F2EC" }} className="pt-6 md:pt-10 pb-12 md:pb-16">
        <div className="mx-auto px-6 md:px-12" style={{ maxWidth: 1200 }}>
          <div className="mx-auto text-center" style={{ maxWidth: 900 }}>
            <h1
              className="font-display"
              style={{
                fontWeight: 700,
                fontSize: "clamp(28px, 4vw, 44px)",
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                color: "#2B2B2B",
              }}
            >
              Ontdek gratis wat mogelijk is voor <span style={{ color: "#E8B547" }}>jouw woning</span>
            </h1>
          </div>
        </div>

        <div className="mx-auto px-6 md:px-12 mt-8 md:mt-10" style={{ maxWidth: 1200 }}>
          <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-8 md:gap-10 lg:gap-12 items-start">
            <div
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 16,
                border: "1px solid #E5E2DB",
                boxShadow: "0 4px 24px rgba(21,44,78,0.06)",
              }}
              className="p-7 md:p-10"
            >
              {submitted ? (
                <div
                  role="status"
                  aria-live="polite"
                  className="text-center"
                  style={{
                    border: "1px solid #b7e4c7",
                    backgroundColor: "#f0faf4",
                    borderRadius: 12,
                    padding: 24,
                  }}
                >
                  <h3 className="font-display" style={{ fontSize: 22, fontWeight: 600, color: "#15803d", marginBottom: 12 }}>
                    Bedankt!
                  </h3>
                  <p className="font-sans" style={{ fontSize: 15, color: "#166534", lineHeight: 1.6 }}>
                    We hebben je bericht ontvangen en nemen binnen 24 uur contact met je op.
                  </p>
                </div>
              ) : (
                <>
                  <h3 className="font-display" style={{ fontSize: 22, fontWeight: 600, color: "#152C4E", marginBottom: 24 }}>
                    Vertel ons over jouw situatie
                  </h3>

                  {errorMsg && (
                    <div
                      role="alert"
                      className="font-sans"
                      style={{
                        marginBottom: 16,
                        padding: "12px 16px",
                        borderRadius: 8,
                        border: "1px solid #fecaca",
                        backgroundColor: "#fef2f2",
                        color: "#991b1b",
                        fontSize: 14,
                      }}
                    >
                      {errorMsg}
                    </div>
                  )}

                  <form ref={formRef} onSubmit={handleSubmit} noValidate>
                    {/* Honeypot: een gewoon tekstveld (géén type="hidden" — dat slaan
                        bots juist over) dat alleen met CSS uit beeld staat. De naam is
                        bewust nietszeggend: browser-autofill herkent `vt_check` niet, dus
                        een echte bezoeker laat hem gegarandeerd leeg. */}
                    <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", top: "auto", width: 1, height: 1, overflow: "hidden" }}>
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

                    {/* Naamvelden in hetzelfde raster als de lead-invoer in het CRM:
                        aanhef (smal) naast voornaam, daaronder tussenvoegsel (smal)
                        naast achternaam. Onder sm: 50/50 — in 2 van 6 kolommen past
                        het woord "Tussenvoegsel" niet en liep het label buiten zijn
                        vak. justify-end houdt de inputs op één lijn als een label
                        over twee regels breekt. */}
                    <div className={cx("grid grid-cols-2 sm:grid-cols-6 gap-4", fieldWrap)}>
                      <div className="sm:col-span-2 min-w-0 flex flex-col justify-end">
                        <label htmlFor="f-aanhef" className={labelClass}>Aanhef</label>
                        <select
                          id="f-aanhef"
                          name="aanhef"
                          className={cx(baseInputClass, inputOk)}
                          value={bewoner.aanhef}
                          onChange={onChangeBew("aanhef")}
                        >
                          <option value="">—</option>
                          {aanhefOpties.map((o) => (
                            <option key={o} value={o}>
                              {o}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="sm:col-span-4 min-w-0 flex flex-col justify-end">
                        <label htmlFor="f-voornaam" className={labelClass}>Voornaam{required}</label>
                        <input
                          id="f-voornaam"
                          name="voornaam"
                          type="text"
                          autoComplete="given-name"
                          aria-required="true"
                          aria-invalid={!!errors.voornaam}
                          aria-describedby={errors.voornaam ? errId("voornaam") : undefined}
                          className={inputCls("voornaam")}
                          value={bewoner.voornaam}
                          onChange={onChangeBew("voornaam")}
                          maxLength={100}
                        />
                      </div>
                      <div className="sm:col-span-2 min-w-0 flex flex-col justify-end">
                        <label htmlFor="f-tussenvoegsel" className={labelClass}>Tussenvoegsel</label>
                        <input
                          id="f-tussenvoegsel"
                          name="tussenvoegsel"
                          type="text"
                          placeholder="van der"
                          aria-invalid={!!errors.tussenvoegsel}
                          aria-describedby={errors.tussenvoegsel ? errId("tussenvoegsel") : undefined}
                          className={inputCls("tussenvoegsel")}
                          value={bewoner.tussenvoegsel}
                          onChange={onChangeBew("tussenvoegsel")}
                          maxLength={25}
                        />
                      </div>
                      <div className="sm:col-span-4 min-w-0 flex flex-col justify-end">
                        <label htmlFor="f-achternaam" className={labelClass}>Achternaam{required}</label>
                        <input
                          id="f-achternaam"
                          name="achternaam"
                          type="text"
                          autoComplete="family-name"
                          aria-required="true"
                          aria-invalid={!!errors.achternaam}
                          aria-describedby={errors.achternaam ? errId("achternaam") : undefined}
                          className={inputCls("achternaam")}
                          value={bewoner.achternaam}
                          onChange={onChangeBew("achternaam")}
                          maxLength={100}
                        />
                      </div>
                      {(errors.voornaam || errors.tussenvoegsel || errors.achternaam) && (
                        <div className="col-span-full -mt-2">
                          <FieldError name="voornaam" />
                          <FieldError name="tussenvoegsel" />
                          <FieldError name="achternaam" />
                        </div>
                      )}
                    </div>
                    <div className={cx("grid grid-cols-1 sm:grid-cols-2 gap-4", fieldWrap)}>
                      <div>
                        <label htmlFor="f-email-b" className={labelClass}>E-mailadres{required}</label>
                        <input
                          id="f-email-b"
                          name="email"
                          type="email"
                          aria-required="true"
                          aria-invalid={!!errors.email}
                          aria-describedby={errors.email ? errId("email") : undefined}
                          className={inputCls("email")}
                          value={bewoner.email}
                          onChange={onChangeBew("email")}
                          maxLength={255}
                        />
                        <FieldError name="email" />
                      </div>
                      <div>
                        <label htmlFor="f-tel-b" className={labelClass}>Telefoonnummer{required}</label>
                        <input
                          id="f-tel-b"
                          name="telefoonnummer"
                          type="tel"
                          aria-required="true"
                          aria-invalid={!!errors.telefoonnummer}
                          aria-describedby={errors.telefoonnummer ? errId("telefoonnummer") : undefined}
                          className={inputCls("telefoonnummer")}
                          value={bewoner.telefoonnummer}
                          onChange={onChangeBew("telefoonnummer")}
                        />
                        <FieldError name="telefoonnummer" />
                      </div>
                    </div>

                    <div className={fieldWrap}>
                      <label className={labelClass}>
                        Adres
                        <span className="text-[#8B8680] font-normal ml-1">(toevoeging optioneel)</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr] gap-3">
                        <div>
                          <input
                            name="postcode"
                            type="text"
                            placeholder="Postcode"
                            aria-label="Postcode"
                            aria-invalid={!!errors.postcode}
                            aria-describedby={errors.postcode ? errId("postcode") : undefined}
                            className={inputCls("postcode")}
                            value={bewoner.postcode}
                            onChange={(e) => handlePostcodeChange(e.target.value)}
                            onBlur={lookupAdres}
                          />
                        </div>
                        <div>
                          <input
                            name="huisnummer"
                            type="text"
                            placeholder="Huisnummer"
                            aria-label="Huisnummer"
                            aria-invalid={!!errors.huisnummer}
                            aria-describedby={errors.huisnummer ? errId("huisnummer") : undefined}
                            className={inputCls("huisnummer")}
                            value={bewoner.huisnummer}
                            onChange={(e) => handleHuisnummerChange(e.target.value)}
                            onBlur={lookupAdres}
                            maxLength={5}
                          />
                        </div>
                        <input
                          name="toevoeging"
                          type="text"
                          placeholder="Toevoeging"
                          aria-label="Toevoeging"
                          className={cx(baseInputClass, inputOk)}
                          value={bewoner.toevoeging}
                          onChange={onChangeBew("toevoeging")}
                          maxLength={10}
                        />
                      </div>
                      <div className="mt-1">
                        <FieldError name="postcode" />
                        <FieldError name="huisnummer" />
                      </div>
                      {adresLoading && (
                        <p className="font-sans flex items-center gap-2 mt-2 text-[13px]" style={{ color: "#6B6B6B" }}>
                          <Loader2 size={14} className="animate-spin" /> Adres zoeken...
                        </p>
                      )}
                      {adresChecked && !adresLocked && !adresLoading && bewoner.postcode && bewoner.huisnummer && (
                        <p className="font-sans mt-2 text-[13px]" style={{ color: "#92400e" }}>
                          Geen adres gevonden bij deze combinatie van postcode en huisnummer. Controleer je invoer of vul Straatnaam en Plaatsnaam zelf in.
                        </p>
                      )}
                    </div>

                    <div
                      className={cx(
                        "grid transition-all duration-300 ease-in-out",
                        (bewoner.postcode.trim() && bewoner.huisnummer.trim())
                          ? "grid-rows-[1fr] opacity-100"
                          : "grid-rows-[0fr] opacity-0"
                      )}
                      aria-hidden={!(bewoner.postcode.trim() && bewoner.huisnummer.trim())}
                    >
                      <div className="overflow-hidden">
                        <div className={fieldWrap}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[13px]" style={{ color: "#8B8680" }}>
                              {adresLocked && !adresEditOverride ? "Automatisch ingevuld" : ""}
                            </span>
                            {adresLocked && !adresEditOverride && (
                              <button
                                type="button"
                                onClick={() => { setAdresEditOverride(true); setAdresLocked(false); }}
                                className="text-[13px] underline"
                                style={{ color: "#152C4E" }}
                              >
                                bewerken
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input
                              name="straatnaam"
                              type="text"
                              placeholder="Straatnaam"
                              aria-label="Straatnaam"
                              tabIndex={(bewoner.postcode.trim() && bewoner.huisnummer.trim()) ? 0 : -1}
                              readOnly={adresLocked && !adresEditOverride}
                              className={cx(baseInputClass, inputOk)}
                              style={adresLocked && !adresEditOverride ? { backgroundColor: "#F0EEE9", cursor: "not-allowed" } : undefined}
                              value={bewoner.straatnaam}
                              onChange={onChangeBew("straatnaam")}
                              maxLength={150}
                            />
                            <input
                              name="plaatsnaam"
                              type="text"
                              placeholder="Plaatsnaam"
                              aria-label="Plaatsnaam"
                              tabIndex={(bewoner.postcode.trim() && bewoner.huisnummer.trim()) ? 0 : -1}
                              readOnly={adresLocked && !adresEditOverride}
                              className={cx(baseInputClass, inputOk)}
                              style={adresLocked && !adresEditOverride ? { backgroundColor: "#F0EEE9", cursor: "not-allowed" } : undefined}
                              value={bewoner.plaatsnaam}
                              onChange={onChangeBew("plaatsnaam")}
                              maxLength={100}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={fieldWrap}>
                      <label htmlFor="f-bel" className={labelClass}>Voorkeur voor contact{optional}</label>
                      <select
                        id="f-bel"
                        name="bel_voorkeur"
                        className={cx(baseInputClass, inputOk)}
                        value={bewoner.bel_voorkeur}
                        onChange={onChangeBew("bel_voorkeur")}
                      >
                        <option value="">Maak een keuze</option>
                        {belVoorkeurOpties.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={fieldWrap}>
                      <label htmlFor="f-vragen-b" className={labelClass}>Vragen of opmerkingen{optional}</label>
                      <textarea
                        id="f-vragen-b"
                        name="vragen"
                        aria-invalid={!!errors.vragen}
                        aria-describedby={errors.vragen ? errId("vragen") : "count-vragen-b"}
                        className={inputCls("vragen")}
                        placeholder="Stel hier je vraag of voeg toe wat je wil meegeven."
                        style={{ minHeight: 120, resize: "vertical" }}
                        value={bewoner.vragen}
                        onChange={onChangeBew("vragen")}
                        maxLength={MAX_NOTES}
                      />
                      <div className="flex justify-between items-center mt-1">
                        <FieldError name="vragen" />
                        {bewoner.vragen.length > 0 && (
                          <span id="count-vragen-b" className="font-sans text-[12px] ml-auto" style={{ color: "#8B8680" }}>
                            {bewoner.vragen.length} / {MAX_NOTES}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full font-sans transition-colors inline-flex items-center justify-center gap-2"
                      style={{
                        marginTop: 12,
                        backgroundColor: "#E8B547",
                        color: "#2B2B2B",
                        padding: "14px 32px",
                        borderRadius: 8,
                        fontSize: 15,
                        fontWeight: 600,
                        cursor: submitting ? "not-allowed" : "pointer",
                        opacity: submitting ? 0.7 : 1,
                        minHeight: 48,
                      }}
                      onMouseEnter={(e) => {
                        if (!submitting) e.currentTarget.style.backgroundColor = "#D9A538";
                      }}
                      onMouseLeave={(e) => {
                        if (!submitting) e.currentTarget.style.backgroundColor = "#E8B547";
                      }}
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Bezig met versturen...
                        </>
                      ) : (
                        "Verstuur bericht"
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>

            <div>
              <h3
                className="font-display"
                style={{ fontSize: 22, fontWeight: 600, color: "#152C4E", marginBottom: 24 }}
              >
                Wat kun je verwachten?
              </h3>
              <ul>
                {expectations.map((item) => (
                  <li
                    key={item}
                    className="flex items-start"
                    style={{ gap: 12, paddingTop: 14, paddingBottom: 14 }}
                  >
                    <CheckCircle size={20} color="#E8B547" className="shrink-0 mt-0.5" />
                    <span className="font-sans" style={{ fontSize: 15, color: "#2B2B2B", lineHeight: 1.5 }}>
                      {item}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-col gap-3">
                {contactBlokken.map(({ icon: Icon, label, waarde, href }) => (
                  <div
                    key={label}
                    className="flex items-start gap-4 rounded-xl border border-border bg-card p-4"
                  >
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/15"
                      aria-hidden="true"
                    >
                      <Icon size={18} strokeWidth={2} className="text-primary" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-display text-[15px] font-semibold text-primary">{label}</p>
                      {href ? (
                        <a
                          href={href}
                          className="font-sans text-[15px] text-muted-foreground underline-offset-2 hover:text-primary hover:underline break-words"
                        >
                          {waarde}
                        </a>
                      ) : (
                        <p className="font-sans text-[15px] text-muted-foreground break-words">{waarde}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dezelfde reviewsectie als op de homepagina, direct onder het formulier. */}
      <Reviews />

      <Footer />
    </div>
  );
};

export default Contact;
