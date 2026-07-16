import { useState, useEffect, useRef, FormEvent, ChangeEvent } from "react";
import { CheckCircle, Loader2 } from "lucide-react";
import { Header } from "@/components/Header";
import { Seo } from "@/components/Seo";
import { Footer } from "@/components/Footer";
import { supabaseExternal as supabase } from "@/integrations/supabase/external-client";
import { normalizePostcode, POSTCODE_RE, zoekAdres } from "@/lib/pdok";
import contactAdviseur from "@/assets/christian-koptelefoon.webp";

type Mode = "uitvoerder" | "bewoner";

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

const expectations: Record<Mode, string[]> = {
  uitvoerder: [
    "We nemen binnen 24 uur contact op",
    "Een kennismakingsgesprek van ongeveer 15 minuten, vrijblijvend",
    "We brengen in kaart waar jullie op vastlopen en waar wij kunnen helpen",
    "Geen verkooppraatje, wel een concreet vervolgplan",
  ],
  bewoner: [
    "We nemen binnen 24 uur contact op",
    "Een vrijblijvend gesprek van ongeveer 15 minuten, telefonisch of bij jou thuis",
    "We kijken samen wat er voor jouw woning logisch is",
    "Je hoeft niets voor te bereiden",
  ],
};

const belVoorkeurOpties = [
  "Per e-mail",
  "Telefonisch: Ochtend",
  "Telefonisch: Middag",
  "Telefonisch: Avond",
];

const initialBewoner = {
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

const initialUitvoerder = {
  bedrijfsnaam: "",
  contactpersoon_voornaam: "",
  contactpersoon_tussenvoegsel: "",
  contactpersoon_achternaam: "",
  email: "",
  telefoonnummer: "",
  vragen: "",
};

const MAX_NOTES = 2000;
const FREE_EMAIL_DOMAINS = ["gmail.com", "hotmail.com", "outlook.com", "live.nl", "yahoo.com", "ziggo.nl", "kpnmail.nl"];

// ---------- Validators ----------
const NAME_RE = /^[\p{L}\s'\-]+$/u;
const COMPANY_RE = /^[\p{L}\p{N}\s.,&\-'()/]+$/u;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

const validatePhoneNL = (raw: string): boolean => {
  const cleaned = raw.replace(/[\s\-]/g, "");
  if (!/^[+0-9]+$/.test(cleaned)) return false;
  // Accepteer 0xxxxxxxxx (10 digits) of +31xxxxxxxxx
  if (/^0[0-9]{9}$/.test(cleaned)) return true;
  if (/^\+31[0-9]{9}$/.test(cleaned)) return true;
  // Vaste lijn varianten met 10 cijfers ook gedekt door 0xxxxxxxxx
  return false;
};

// ---------- Component ----------
const Contact = () => {
  const [mode, setMode] = useState<Mode>("bewoner");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [emailWarning, setEmailWarning] = useState<string | null>(null);

  const [bewoner, setBewoner] = useState(initialBewoner);
  const [uitvoerder, setUitvoerder] = useState(initialUitvoerder);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [adresLocked, setAdresLocked] = useState(false);
  const [adresChecked, setAdresChecked] = useState(false);
  const [adresLoading, setAdresLoading] = useState(false);
  const [adresEditOverride, setAdresEditOverride] = useState(false);

  // Honeypot
  const [honeypot, setHoneypot] = useState("");
  // Time on page
  const pageLoadedAt = useRef<number>(Date.now());
  useEffect(() => {
    pageLoadedAt.current = Date.now();
  }, [mode]);

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
    if (mode === "bewoner") {
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
      else if (!validatePhoneNL(tel))
        e.telefoonnummer = "Vul een geldig Nederlands telefoonnummer in (bijvoorbeeld 06 12345678).";

      const pc = bewoner.postcode.trim();
      const hn = bewoner.huisnummer.trim();
      if (pc && !POSTCODE_RE.test(pc)) e.postcode = "Vul een geldige postcode in (bijvoorbeeld 1234 AB).";
      if (hn && (!/^[0-9]/.test(hn) || hn.length > 5)) e.huisnummer = "Huisnummer moet beginnen met een cijfer (max 5 karakters).";
      if (pc && !hn) e.huisnummer = "Vul ook een huisnummer in.";
      if (hn && !pc) e.postcode = "Vul ook een postcode in.";

      if (bewoner.vragen.length > MAX_NOTES) e.vragen = "Je bericht is te lang (maximaal 2000 karakters).";
    } else {
      const bn = uitvoerder.bedrijfsnaam.trim();
      if (!bn) e.bedrijfsnaam = "Vul de naam van jullie bedrijf in.";
      else if (bn.length < 2) e.bedrijfsnaam = "De bedrijfsnaam moet minimaal 2 karakters bevatten.";
      else if (bn.length > 150 || !COMPANY_RE.test(bn)) e.bedrijfsnaam = "De bedrijfsnaam bevat ongeldige tekens.";

      const cpVoornaam = uitvoerder.contactpersoon_voornaam.trim();
      if (!cpVoornaam) e.contactpersoon_voornaam = "Vul je voornaam in.";
      else if (cpVoornaam.length > 100 || !NAME_RE.test(cpVoornaam))
        e.contactpersoon_voornaam = "Je voornaam bevat ongeldige tekens.";

      const cpTussenvoegsel = uitvoerder.contactpersoon_tussenvoegsel.trim();
      if (cpTussenvoegsel && (cpTussenvoegsel.length > 25 || !NAME_RE.test(cpTussenvoegsel)))
        e.contactpersoon_tussenvoegsel = "Het tussenvoegsel bevat ongeldige tekens.";

      const cpAchternaam = uitvoerder.contactpersoon_achternaam.trim();
      if (!cpAchternaam) e.contactpersoon_achternaam = "Vul je achternaam in.";
      else if (cpAchternaam.length < 2) e.contactpersoon_achternaam = "Je achternaam moet minimaal 2 karakters bevatten.";
      else if (cpAchternaam.length > 100 || !NAME_RE.test(cpAchternaam))
        e.contactpersoon_achternaam = "Je achternaam bevat ongeldige tekens.";

      const email = uitvoerder.email.trim();
      if (!email) e.email = "Vul je e-mailadres in.";
      else if (!EMAIL_RE.test(email) || email.length > 255) e.email = "Dit lijkt geen geldig e-mailadres.";

      const tel = uitvoerder.telefoonnummer.trim();
      if (!tel) e.telefoonnummer = "Vul je telefoonnummer in.";
      else if (!validatePhoneNL(tel))
        e.telefoonnummer = "Vul een geldig Nederlands telefoonnummer in (bijvoorbeeld 06 12345678).";

      if (uitvoerder.vragen.length > MAX_NOTES) e.vragen = "Je bericht is te lang (maximaal 2000 karakters).";
    }
    return e;
  };

  // Free-email tip (uitvoerder)
  useEffect(() => {
    if (mode !== "uitvoerder") { setEmailWarning(null); return; }
    const em = uitvoerder.email.trim().toLowerCase();
    const dom = em.split("@")[1];
    if (dom && FREE_EMAIL_DOMAINS.includes(dom)) {
      setEmailWarning("Tip: vul bij voorkeur je zakelijke e-mailadres in.");
    } else {
      setEmailWarning(null);
    }
  }, [uitvoerder.email, mode]);

  const focusFirstError = (errs: Record<string, string>) => {
    const order =
      mode === "bewoner"
        ? ["voornaam", "tussenvoegsel", "achternaam", "email", "telefoonnummer", "postcode", "huisnummer", "straatnaam", "plaatsnaam", "vragen"]
        : ["bedrijfsnaam", "contactpersoon_voornaam", "contactpersoon_tussenvoegsel", "contactpersoon_achternaam", "email", "telefoonnummer", "vragen"];
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
      setErrorMsg("Even geduld — wacht een moment voordat je het formulier verstuurt.");
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
      if (mode === "bewoner") {
        const beltijd = bewoner.bel_voorkeur.trim();
        const opmerkingen = escapeHtml(bewoner.vragen.trim());
        let notities: string | null = null;
        if (beltijd && opmerkingen) notities = `Voorkeur voor contact: ${beltijd}\n${opmerkingen}`;
        else if (beltijd) notities = `Voorkeur voor contact: ${beltijd}`;
        else if (opmerkingen) notities = opmerkingen;

        // De kolom `naam` bewust niet meesturen: een BEFORE INSERT-trigger in het
        // CRM stelt die zelf samen uit voornaam/tussenvoegsel/achternaam.
        const { error } = await supabase.from("leads_bewoners").insert({
          tenant_id: "00000000-0000-0000-0000-000000000001",
          voornaam: escapeHtml(bewoner.voornaam.trim()),
          tussenvoegsel: bewoner.tussenvoegsel.trim() ? escapeHtml(bewoner.tussenvoegsel.trim()) : null,
          achternaam: escapeHtml(bewoner.achternaam.trim()),
          email: bewoner.email.trim(),
          telefoon: bewoner.telefoonnummer.trim(),
          postcode: bewoner.postcode ? normalizePostcode(bewoner.postcode) : null,
          huisnummer: bewoner.huisnummer.trim() || null,
          toevoeging: bewoner.toevoeging.trim() || null,
          straat: bewoner.straatnaam.trim() ? escapeHtml(bewoner.straatnaam.trim()) : null,
          stad: bewoner.plaatsnaam.trim() ? escapeHtml(bewoner.plaatsnaam.trim()) : null,
          notities,
          bron: "Website",
          status: "nieuw",
        } as any);
        if (error) throw error;
        setBewoner(initialBewoner);
        setAdresLocked(false);
        setAdresChecked(false);
        setSubmitted(true);
      } else {
        // De kolom `contactpersoon` bewust niet meesturen: een BEFORE INSERT-trigger
        // in het CRM stelt die zelf samen uit de drie contactpersoon-delen.
        const { error } = await supabase.from("leads_uitvoerders").insert({
          tenant_id: "00000000-0000-0000-0000-000000000001",
          bedrijfsnaam: escapeHtml(uitvoerder.bedrijfsnaam.trim()),
          contactpersoon_voornaam: escapeHtml(uitvoerder.contactpersoon_voornaam.trim()),
          contactpersoon_tussenvoegsel: uitvoerder.contactpersoon_tussenvoegsel.trim()
            ? escapeHtml(uitvoerder.contactpersoon_tussenvoegsel.trim())
            : null,
          contactpersoon_achternaam: escapeHtml(uitvoerder.contactpersoon_achternaam.trim()),
          email: uitvoerder.email.trim(),
          telefoon: uitvoerder.telefoonnummer.trim(),
          notities: uitvoerder.vragen.trim() ? escapeHtml(uitvoerder.vragen.trim()) : null,
          bron: "Website",
          status: "nieuw",
        } as any);
        if (error) throw error;
        setUitvoerder(initialUitvoerder);
        setSubmitted(true);
      }
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

  const onChangeUit = (k: keyof typeof uitvoerder) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setUitvoerder({ ...uitvoerder, [k]: e.target.value });
    clearError(k);
  };
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
            <p
              className="mx-auto font-sans"
              style={{ marginTop: 12, maxWidth: 760, fontSize: 16, color: "#6B6B6B", lineHeight: 1.5 }}
            >
              Vertel ons kort over je situatie. We nemen binnen 24 uur contact op voor een vrijblijvend gesprek.
            </p>

            <div
              className="flex sm:inline-flex w-full sm:w-auto"
              style={{ marginTop: 20, backgroundColor: "#E5E2DB", padding: 4, borderRadius: 999 }}
            >
              {(["bewoner", "uitvoerder"] as Mode[]).map((m) => {
                const active = mode === m;
                return (
                  <button
                    key={m}
                    onClick={() => {
                      setMode(m);
                      setSubmitted(false);
                      setErrorMsg(null);
                      setErrors({});
                    }}
                    className="font-sans transition-colors flex-1 sm:flex-initial text-[14px] sm:text-[15px]"
                    style={{
                      padding: "12px 28px",
                      borderRadius: 999,
                      fontWeight: 600,
                      backgroundColor: active ? "#E8B547" : "transparent",
                      color: active ? "#2B2B2B" : "#6B6B6B",
                      cursor: "pointer",
                      minHeight: 44,
                    }}
                    onMouseEnter={(e) => {
                      if (!active) e.currentTarget.style.color = "#152C4E";
                    }}
                    onMouseLeave={(e) => {
                      if (!active) e.currentTarget.style.color = "#6B6B6B";
                    }}
                  >
                    {m === "uitvoerder" ? "Ik ben een uitvoerder" : "Ik ben een bewoner"}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mx-auto px-6 md:px-12 mt-8 md:mt-10" style={{ maxWidth: 1200 }}>
          <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-8 md:gap-10 lg:gap-12 items-stretch">
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
                  <h3 className="font-display" style={{ fontSize: 22, fontWeight: 600, color: "#152C4E", marginBottom: 8 }}>
                    {mode === "uitvoerder" ? "Vertel ons over jullie bedrijf" : "Vertel ons over jouw situatie"}
                  </h3>
                  <p className="font-sans" style={{ fontSize: 14, color: "#6B6B6B", marginBottom: 24, lineHeight: 1.6 }}>
                    {mode === "uitvoerder"
                      ? "Hoe meer we vooraf weten, hoe scherper we het gesprek kunnen voeren."
                      : "Hoe meer we vooraf weten, hoe beter we je kunnen helpen."}
                  </p>

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
                    {/* Honeypot */}
                    <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", top: "auto", width: 1, height: 1, overflow: "hidden" }}>
                      <label>
                        Laat dit veld leeg
                        <input
                          type="text"
                          tabIndex={-1}
                          autoComplete="off"
                          value={honeypot}
                          onChange={(e) => setHoneypot(e.target.value)}
                        />
                      </label>
                    </div>

                    {mode === "uitvoerder" ? (
                      <>
                        <div className={fieldWrap}>
                          <label htmlFor="f-bedrijfsnaam" className={labelClass}>Bedrijfsnaam{required}</label>
                          <input
                            id="f-bedrijfsnaam"
                            name="bedrijfsnaam"
                            type="text"
                            aria-required="true"
                            aria-invalid={!!errors.bedrijfsnaam}
                            aria-describedby={errors.bedrijfsnaam ? errId("bedrijfsnaam") : undefined}
                            className={inputCls("bedrijfsnaam")}
                            value={uitvoerder.bedrijfsnaam}
                            onChange={onChangeUit("bedrijfsnaam")}
                            maxLength={150}
                          />
                          <FieldError name="bedrijfsnaam" />
                        </div>
                        {/* Naamvelden contactpersoon: groepslabel + placeholders (zelfde
                            patroon als het Adres-blok bij de bewoner) — de losse labels
                            "Voornaam contactpersoon" braken anders over twee regels. Op
                            brede schermen één rij, daaronder voornaam boven en
                            tussenvoegsel + achternaam samen op een rij. */}
                        <div className={fieldWrap}>
                          <label className={labelClass}>
                            Contactpersoon
                            <span className="text-[#8B8680] font-normal ml-1">(tussenvoegsel optioneel)</span>
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-[1fr_2fr] lg:grid-cols-[1fr_0.95fr_1.25fr] gap-4">
                            <div className="sm:col-span-2 lg:col-span-1">
                              <input
                                id="f-cp-voornaam"
                                name="contactpersoon_voornaam"
                                type="text"
                                autoComplete="given-name"
                                placeholder="Voornaam *"
                                aria-label="Voornaam contactpersoon"
                                aria-required="true"
                                aria-invalid={!!errors.contactpersoon_voornaam}
                                aria-describedby={errors.contactpersoon_voornaam ? errId("contactpersoon_voornaam") : undefined}
                                className={inputCls("contactpersoon_voornaam")}
                                value={uitvoerder.contactpersoon_voornaam}
                                onChange={onChangeUit("contactpersoon_voornaam")}
                                maxLength={100}
                              />
                            </div>
                            <input
                              id="f-cp-tussenvoegsel"
                              name="contactpersoon_tussenvoegsel"
                              type="text"
                              placeholder="Tussenvoegsel"
                              aria-label="Tussenvoegsel contactpersoon"
                              aria-invalid={!!errors.contactpersoon_tussenvoegsel}
                              aria-describedby={errors.contactpersoon_tussenvoegsel ? errId("contactpersoon_tussenvoegsel") : undefined}
                              className={inputCls("contactpersoon_tussenvoegsel")}
                              value={uitvoerder.contactpersoon_tussenvoegsel}
                              onChange={onChangeUit("contactpersoon_tussenvoegsel")}
                              maxLength={25}
                            />
                            <input
                              id="f-cp-achternaam"
                              name="contactpersoon_achternaam"
                              type="text"
                              autoComplete="family-name"
                              placeholder="Achternaam *"
                              aria-label="Achternaam contactpersoon"
                              aria-required="true"
                              aria-invalid={!!errors.contactpersoon_achternaam}
                              aria-describedby={errors.contactpersoon_achternaam ? errId("contactpersoon_achternaam") : undefined}
                              className={inputCls("contactpersoon_achternaam")}
                              value={uitvoerder.contactpersoon_achternaam}
                              onChange={onChangeUit("contactpersoon_achternaam")}
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
                            <label htmlFor="f-email-u" className={labelClass}>E-mailadres{required}</label>
                            <input
                              id="f-email-u"
                              name="email"
                              type="email"
                              aria-required="true"
                              aria-invalid={!!errors.email}
                              aria-describedby={errors.email ? errId("email") : emailWarning ? "email-tip" : undefined}
                              className={inputCls("email")}
                              value={uitvoerder.email}
                              onChange={onChangeUit("email")}
                              maxLength={255}
                            />
                            <FieldError name="email" />
                            {!errors.email && emailWarning && (
                              <p id="email-tip" className="font-sans mt-1.5 text-[13px]" style={{ color: "#92400e" }}>
                                {emailWarning}
                              </p>
                            )}
                          </div>
                          <div>
                            <label htmlFor="f-tel-u" className={labelClass}>Telefoonnummer{required}</label>
                            <input
                              id="f-tel-u"
                              name="telefoonnummer"
                              type="tel"
                              aria-required="true"
                              aria-invalid={!!errors.telefoonnummer}
                              aria-describedby={errors.telefoonnummer ? errId("telefoonnummer") : undefined}
                              className={inputCls("telefoonnummer")}
                              value={uitvoerder.telefoonnummer}
                              onChange={onChangeUit("telefoonnummer")}
                            />
                            <FieldError name="telefoonnummer" />
                          </div>
                        </div>
                        <div className={fieldWrap}>
                          <label htmlFor="f-vragen-u" className={labelClass}>Vragen of opmerkingen{optional}</label>
                          <textarea
                            id="f-vragen-u"
                            name="vragen"
                            aria-invalid={!!errors.vragen}
                            aria-describedby={errors.vragen ? errId("vragen") : "count-vragen-u"}
                            className={inputCls("vragen")}
                            placeholder="Stel hier je vraag of voeg toe wat je wil meegeven."
                            style={{ minHeight: 100, resize: "vertical" }}
                            value={uitvoerder.vragen}
                            onChange={onChangeUit("vragen")}
                            maxLength={MAX_NOTES}
                          />
                          <div className="flex justify-between items-center mt-1">
                            <FieldError name="vragen" />
                            {uitvoerder.vragen.length > 0 && (
                              <span id="count-vragen-u" className="font-sans text-[12px] ml-auto" style={{ color: "#8B8680" }}>
                                {uitvoerder.vragen.length} / {MAX_NOTES}
                              </span>
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Naamvelden: op brede schermen op één rij (tussenvoegsel smal),
                            op mobiel/tablet voornaam boven en tussenvoegsel + achternaam
                            samen op een rij. justify-end houdt de inputs uitgelijnd als
                            een label ooit over twee regels loopt. */}
                        <div className={cx("grid grid-cols-1 sm:grid-cols-[1fr_2fr] lg:grid-cols-[1.1fr_0.8fr_1.3fr] gap-4", fieldWrap)}>
                          <div className="sm:col-span-2 lg:col-span-1 flex flex-col justify-end">
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
                          <div className="flex flex-col justify-end">
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
                          <div className="flex flex-col justify-end">
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
                      </>
                    )}

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

            <div className="flex flex-col gap-8">
              <div
                className="overflow-hidden rounded-2xl aspect-[4/5] md:aspect-auto md:flex-1 md:min-h-0"
                style={{
                  border: "1px solid #E5E2DB",
                  boxShadow: "0 4px 24px rgba(21,44,78,0.06)",
                }}
              >
                <img
                  src={contactAdviseur}
                  alt="Adviseur van Voortraject helpt je persoonlijk verder"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                  style={{ objectPosition: "center 30%" }}
                />
              </div>
              <div>
                <h3
                  className="font-display"
                  style={{ fontSize: 22, fontWeight: 600, color: "#152C4E", marginBottom: 24 }}
                >
                  Wat kun je verwachten?
                </h3>
                <ul>
                  {expectations[mode].map((item) => (
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
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
