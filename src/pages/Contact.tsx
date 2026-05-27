import { useState, useEffect, useRef, FormEvent, ChangeEvent } from "react";
import { CheckCircle, Mail, Phone, MapPin, Loader2 } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabaseExternal as supabase } from "@/integrations/supabase/external-client";

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

const contactIntros: Record<Mode, string> = {
  uitvoerder: "Liever eerst even bellen of mailen? Je kunt ons altijd direct bereiken.",
  bewoner: "Liever even bellen voor een eerste vraag? Dat kan natuurlijk ook.",
};

const contactRows = [
  { icon: Mail, value: "info@voortraject.nl", href: "mailto:info@voortraject.nl" },
  { icon: Phone, value: "+31 6 40248371", href: "tel:+31640248371" },
  { icon: MapPin, value: "Groningen, Nederland" },
];

const belVoorkeurOpties = [
  "Ochtend (9:00 – 12:00)",
  "Middag (12:00 – 17:00)",
  "Avond (17:00 – 20:00)",
  "Geen voorkeur",
];

const initialBewoner = {
  naam: "",
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
  naam_contactpersoon: "",
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
const POSTCODE_RE = /^[1-9][0-9]{3}\s?[A-Za-z]{2}$/;

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

const normalizePostcode = (s: string) => s.replace(/\s+/g, "").toUpperCase();

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

  // ---------- PDOK lookup ----------
  const lookupAdres = async () => {
    const pc = normalizePostcode(bewoner.postcode);
    const hn = bewoner.huisnummer.trim();
    if (!POSTCODE_RE.test(bewoner.postcode) || !/^[0-9]/.test(hn)) return;
    setAdresLoading(true);
    setAdresChecked(false);
    try {
      const url = `https://api.pdok.nl/bzk/locatieserver/search/v3_1/free?q=${encodeURIComponent(pc)}+${encodeURIComponent(hn)}&fq=type:adres&fl=straatnaam,woonplaatsnaam&rows=1`;
      const res = await fetch(url);
      setAdresChecked(true);
      if (res.ok) {
        const data = await res.json();
        const doc = data?.response?.docs?.[0];
        if (doc?.straatnaam && doc?.woonplaatsnaam) {
          setBewoner((b) => ({ ...b, straatnaam: doc.straatnaam, plaatsnaam: doc.woonplaatsnaam }));
          setAdresLocked(true);
          setAdresEditOverride(false);
          clearError("straatnaam");
          clearError("plaatsnaam");
          return;
        }
      }
      setAdresLocked(false);
    } catch (err) {
      console.error("PDOK lookup failed", err);
      setAdresChecked(true);
      setAdresLocked(false);
    } finally {
      setAdresLoading(false);
    }
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
      const naam = bewoner.naam.trim();
      if (!naam) e.naam = "Vul je naam in.";
      else if (naam.length < 2) e.naam = "Je naam moet minimaal 2 karakters bevatten.";
      else if (naam.length > 100 || !NAME_RE.test(naam)) e.naam = "Je naam bevat ongeldige tekens.";

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

      const cp = uitvoerder.naam_contactpersoon.trim();
      if (!cp) e.naam_contactpersoon = "Vul je naam in.";
      else if (cp.length < 2) e.naam_contactpersoon = "Je naam moet minimaal 2 karakters bevatten.";
      else if (cp.length > 100 || !NAME_RE.test(cp)) e.naam_contactpersoon = "Je naam bevat ongeldige tekens.";

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
        ? ["naam", "email", "telefoonnummer", "postcode", "huisnummer", "straatnaam", "plaatsnaam", "vragen"]
        : ["bedrijfsnaam", "naam_contactpersoon", "email", "telefoonnummer", "vragen"];
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
        if (beltijd && opmerkingen) notities = `Voorkeur beltijd: ${beltijd}\n${opmerkingen}`;
        else if (beltijd) notities = `Voorkeur beltijd: ${beltijd}`;
        else if (opmerkingen) notities = opmerkingen;

        const { error } = await supabase.from("leads_bewoners").insert({
          tenant_id: "00000000-0000-0000-0000-000000000001",
          naam: escapeHtml(bewoner.naam.trim()),
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
        const { error } = await supabase.from("leads_uitvoerders").insert({
          tenant_id: "00000000-0000-0000-0000-000000000001",
          bedrijfsnaam: escapeHtml(uitvoerder.bedrijfsnaam.trim()),
          contactpersoon: escapeHtml(uitvoerder.naam_contactpersoon.trim()),
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
      <Header />

      {/* Hero */}
      <section style={{ backgroundColor: "#FBFAF7" }}>
        <div className="mx-auto px-6 md:px-12" style={{ maxWidth: 1200 }}>
          <div className="mx-auto text-center py-8 md:py-12" style={{ maxWidth: 900 }}>
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
              Laten we <span style={{ color: "#E8B547" }}>kennismaken</span>
            </h1>
            <p
              className="mx-auto font-sans"
              style={{ marginTop: 16, maxWidth: 760, fontSize: 16, color: "#6B6B6B", lineHeight: 1.5 }}
            >
              Vertel ons waar je op zoek naar bent. We nemen binnen 24 uur contact op.
            </p>

            <div
              className="flex sm:inline-flex w-full sm:w-auto"
              style={{ marginTop: 24, backgroundColor: "#E5E2DB", padding: 4, borderRadius: 999 }}
            >
              {(["uitvoerder", "bewoner"] as Mode[]).map((m) => {
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
      </section>

      <section style={{ backgroundColor: "#F5F2EC" }} className="py-12 md:py-16">
        <div className="mx-auto px-6 md:px-12" style={{ maxWidth: 1200 }}>
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
                        <div className={fieldWrap}>
                          <label htmlFor="f-cp" className={labelClass}>Naam contactpersoon{required}</label>
                          <input
                            id="f-cp"
                            name="naam_contactpersoon"
                            type="text"
                            aria-required="true"
                            aria-invalid={!!errors.naam_contactpersoon}
                            aria-describedby={errors.naam_contactpersoon ? errId("naam_contactpersoon") : undefined}
                            className={inputCls("naam_contactpersoon")}
                            value={uitvoerder.naam_contactpersoon}
                            onChange={onChangeUit("naam_contactpersoon")}
                            maxLength={100}
                          />
                          <FieldError name="naam_contactpersoon" />
                        </div>
                        <div className={fieldWrap}>
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
                        <div className={fieldWrap}>
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
                        <div className={fieldWrap}>
                          <label htmlFor="f-naam" className={labelClass}>Naam{required}</label>
                          <input
                            id="f-naam"
                            name="naam"
                            type="text"
                            aria-required="true"
                            aria-invalid={!!errors.naam}
                            aria-describedby={errors.naam ? errId("naam") : undefined}
                            className={inputCls("naam")}
                            value={bewoner.naam}
                            onChange={onChangeBew("naam")}
                            maxLength={100}
                          />
                          <FieldError name="naam" />
                        </div>
                        <div className={fieldWrap}>
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
                        <div className={fieldWrap}>
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
                              readOnly={adresLocked && !adresEditOverride}
                              className={cx(baseInputClass, inputOk)}
                              style={adresLocked && !adresEditOverride ? { backgroundColor: "#F0EEE9", cursor: "not-allowed" } : undefined}
                              value={bewoner.plaatsnaam}
                              onChange={onChangeBew("plaatsnaam")}
                              maxLength={100}
                            />
                          </div>
                        </div>

                        <div className={fieldWrap}>
                          <label htmlFor="f-bel" className={labelClass}>Wanneer word je het liefst gebeld?{optional}</label>
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

            <div className="flex flex-col" style={{ gap: 32 }}>
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

              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 12,
                  border: "1px solid #E5E2DB",
                  padding: 28,
                }}
              >
                <h3 className="font-display" style={{ fontSize: 18, fontWeight: 600, color: "#152C4E", marginBottom: 8 }}>
                  Liever direct contact?
                </h3>
                <p className="font-sans" style={{ fontSize: 14, color: "#6B6B6B", lineHeight: 1.5, marginBottom: 24 }}>
                  {contactIntros[mode]}
                </p>

                <ul>
                  {contactRows.map((row, idx) => {
                    const Icon = row.icon;
                    const isLast = idx === contactRows.length - 1;
                    return (
                      <li
                        key={row.value}
                        className="flex items-center"
                        style={{
                          gap: 12,
                          paddingTop: 10,
                          paddingBottom: 10,
                          borderBottom: isLast ? "none" : "1px solid #E5E2DB",
                        }}
                      >
                        <Icon size={18} color="#152C4E" className="shrink-0" />
                        {row.href ? (
                          <a
                            href={row.href}
                            className="font-sans hover:text-[#E8B547] transition-colors"
                            style={{ fontSize: 15, fontWeight: 500, color: "#2B2B2B" }}
                          >
                            {row.value}
                          </a>
                        ) : (
                          <span className="font-sans" style={{ fontSize: 15, fontWeight: 500, color: "#2B2B2B" }}>
                            {row.value}
                          </span>
                        )}
                      </li>
                    );
                  })}
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
