import { useState, FormEvent } from "react";
import { CheckCircle, Mail, Phone, MapPin } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

type Mode = "uitvoerder" | "bewoner";

const inputClass =
  "w-full rounded-lg border border-[#D4D2CC] bg-[#FBFAF7] px-4 py-3 text-[16px] lg:text-[15px] text-[#2B2B2B] outline-none transition focus:border-[#E8B547] focus:shadow-[0_0_0_3px_rgba(232,181,71,0.15)] min-h-[44px]";
const labelClass = "block mb-2 text-[14px] font-semibold text-[#2B2B2B]";
const fieldWrap = "mb-4";
const required = <span className="text-[#E8B547] ml-1">*</span>;
const optional = <span className="text-[#8B8680] font-normal ml-1">(optioneel)</span>;

const expectations: Record<Mode, string[]> = {
  uitvoerder: [
    "We nemen binnen één werkdag contact op",
    "Een kennismakingsgesprek van ongeveer 15 minuten, vrijblijvend",
    "We brengen in kaart waar jullie op vastlopen en waar wij kunnen helpen",
    "Geen verkooppraatje, wel een concreet vervolgplan",
  ],
  bewoner: [
    "We nemen binnen één werkdag contact op",
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

const Contact = () => {
  const [mode, setMode] = useState<Mode>("uitvoerder");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [bewoner, setBewoner] = useState(initialBewoner);
  const [uitvoerder, setUitvoerder] = useState(initialUitvoerder);
  const [adresLocked, setAdresLocked] = useState(false);
  const [adresChecked, setAdresChecked] = useState(false);

  const lookupAdres = async () => {
    const pc = bewoner.postcode.replace(/\s+/g, "").toUpperCase();
    const hn = bewoner.huisnummer.trim();
    if (!pc || !hn) return;
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
          return;
        }
      }
      setAdresLocked(false);
    } catch (err) {
      console.error("PDOK lookup failed", err);
      setAdresChecked(true);
      setAdresLocked(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);
    try {
      if (mode === "bewoner") {
        const { error } = await supabase.from("leads_bewoners").insert({
          tenant_id: "8c847155-fc29-481f-84d4-ffef6816a181",
          naam: bewoner.naam,
          email: bewoner.email,
          telefoonnummer: bewoner.telefoonnummer,
          postcode: bewoner.postcode || null,
          huisnummer: bewoner.huisnummer || null,
          toevoeging: bewoner.toevoeging || null,
          straatnaam: bewoner.straatnaam || null,
          plaatsnaam: bewoner.plaatsnaam || null,
          bel_voorkeur: bewoner.bel_voorkeur || null,
          vragen: bewoner.vragen || null,
          bron: "website",
          status: "nieuw",
        });
        if (error) throw error;
        setBewoner(initialBewoner);
        setAdresLocked(false);
        setAdresChecked(false);
        setSubmitted(true);
      } else {
        const { error } = await supabase.from("leads_uitvoerders").insert({
          bedrijfsnaam: uitvoerder.bedrijfsnaam,
          naam_contactpersoon: uitvoerder.naam_contactpersoon,
          email: uitvoerder.email,
          telefoonnummer: uitvoerder.telefoonnummer,
          vragen: uitvoerder.vragen || null,
          bron: "website",
          status: "nieuw",
        });
        if (error) throw error;
        setUitvoerder(initialUitvoerder);
        setSubmitted(true);
      }
    } catch (err) {
      console.error("Lead submit failed", err);
      setErrorMsg(
        mode === "bewoner"
          ? "Er ging iets mis. Probeer het opnieuw of bel ons direct op 06 402 48 371."
          : "Er ging iets mis. Probeer het opnieuw of bel ons direct.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const adresPlaceholder = adresChecked && !adresLocked ? "Niet gevonden — vul zelf in" : "";

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
              Vertel ons waar je op zoek naar bent. We nemen binnen één werkdag contact op.
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
                <div className="text-center">
                  <h3 className="font-display" style={{ fontSize: 22, fontWeight: 600, color: "#152C4E", marginBottom: 12 }}>
                    Bedankt!
                  </h3>
                  <p className="font-sans" style={{ fontSize: 15, color: "#6B6B6B", lineHeight: 1.6 }}>
                    We nemen binnen één werkdag contact met je op.
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

                  <form onSubmit={handleSubmit}>
                    {mode === "uitvoerder" ? (
                      <>
                        <div className={fieldWrap}>
                          <label className={labelClass}>Bedrijfsnaam{required}</label>
                          <input
                            type="text"
                            required
                            className={inputClass}
                            value={uitvoerder.bedrijfsnaam}
                            onChange={(e) => setUitvoerder({ ...uitvoerder, bedrijfsnaam: e.target.value })}
                          />
                        </div>
                        <div className={fieldWrap}>
                          <label className={labelClass}>Naam contactpersoon{required}</label>
                          <input
                            type="text"
                            required
                            className={inputClass}
                            value={uitvoerder.naam_contactpersoon}
                            onChange={(e) => setUitvoerder({ ...uitvoerder, naam_contactpersoon: e.target.value })}
                          />
                        </div>
                        <div className={fieldWrap}>
                          <label className={labelClass}>E-mailadres{required}</label>
                          <input
                            type="email"
                            required
                            className={inputClass}
                            value={uitvoerder.email}
                            onChange={(e) => setUitvoerder({ ...uitvoerder, email: e.target.value })}
                          />
                        </div>
                        <div className={fieldWrap}>
                          <label className={labelClass}>Telefoonnummer{required}</label>
                          <input
                            type="tel"
                            required
                            className={inputClass}
                            value={uitvoerder.telefoonnummer}
                            onChange={(e) => setUitvoerder({ ...uitvoerder, telefoonnummer: e.target.value })}
                          />
                        </div>
                        <div className={fieldWrap}>
                          <label className={labelClass}>Vragen of opmerkingen{optional}</label>
                          <textarea
                            className={inputClass}
                            placeholder="Stel hier je vraag of voeg toe wat je wil meegeven."
                            style={{ minHeight: 100, resize: "vertical" }}
                            value={uitvoerder.vragen}
                            onChange={(e) => setUitvoerder({ ...uitvoerder, vragen: e.target.value })}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className={fieldWrap}>
                          <label className={labelClass}>Naam{required}</label>
                          <input
                            type="text"
                            required
                            className={inputClass}
                            value={bewoner.naam}
                            onChange={(e) => setBewoner({ ...bewoner, naam: e.target.value })}
                          />
                        </div>
                        <div className={fieldWrap}>
                          <label className={labelClass}>E-mailadres{required}</label>
                          <input
                            type="email"
                            required
                            className={inputClass}
                            value={bewoner.email}
                            onChange={(e) => setBewoner({ ...bewoner, email: e.target.value })}
                          />
                        </div>
                        <div className={fieldWrap}>
                          <label className={labelClass}>Telefoonnummer{required}</label>
                          <input
                            type="tel"
                            required
                            className={inputClass}
                            value={bewoner.telefoonnummer}
                            onChange={(e) => setBewoner({ ...bewoner, telefoonnummer: e.target.value })}
                          />
                        </div>

                        <div className={fieldWrap}>
                          <label className={labelClass}>
                            Adres
                            <span className="text-[#8B8680] font-normal ml-1">(toevoeging optioneel)</span>
                          </label>
                          <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr] gap-3">
                            <input
                              type="text"
                              placeholder="Postcode"
                              className={inputClass}
                              value={bewoner.postcode}
                              onChange={(e) => {
                                setBewoner({ ...bewoner, postcode: e.target.value });
                                setAdresLocked(false);
                                setAdresChecked(false);
                              }}
                            />
                            <input
                              type="text"
                              placeholder="Huisnummer"
                              className={inputClass}
                              value={bewoner.huisnummer}
                              onChange={(e) => {
                                setBewoner({ ...bewoner, huisnummer: e.target.value });
                                setAdresLocked(false);
                                setAdresChecked(false);
                              }}
                              onBlur={lookupAdres}
                            />
                            <input
                              type="text"
                              placeholder="Toevoeging"
                              className={inputClass}
                              value={bewoner.toevoeging}
                              onChange={(e) => setBewoner({ ...bewoner, toevoeging: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className={fieldWrap}>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <input
                              type="text"
                              placeholder={adresPlaceholder || "Straatnaam"}
                              readOnly={adresLocked}
                              className={inputClass}
                              style={adresLocked ? { backgroundColor: "#F0EEE9", cursor: "not-allowed" } : undefined}
                              value={bewoner.straatnaam}
                              onChange={(e) => setBewoner({ ...bewoner, straatnaam: e.target.value })}
                            />
                            <input
                              type="text"
                              placeholder={adresPlaceholder || "Plaatsnaam"}
                              readOnly={adresLocked}
                              className={inputClass}
                              style={adresLocked ? { backgroundColor: "#F0EEE9", cursor: "not-allowed" } : undefined}
                              value={bewoner.plaatsnaam}
                              onChange={(e) => setBewoner({ ...bewoner, plaatsnaam: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className={fieldWrap}>
                          <label className={labelClass}>Wanneer word je het liefst gebeld?{optional}</label>
                          <select
                            className={inputClass}
                            value={bewoner.bel_voorkeur}
                            onChange={(e) => setBewoner({ ...bewoner, bel_voorkeur: e.target.value })}
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
                          <label className={labelClass}>Vragen of opmerkingen{optional}</label>
                          <textarea
                            className={inputClass}
                            placeholder="Stel hier je vraag of voeg toe wat je wil meegeven."
                            style={{ minHeight: 120, resize: "vertical" }}
                            value={bewoner.vragen}
                            onChange={(e) => setBewoner({ ...bewoner, vragen: e.target.value })}
                          />
                        </div>
                      </>
                    )}

                    {errorMsg && (
                      <p
                        className="font-sans"
                        style={{ marginBottom: 12, fontSize: 14, color: "#B3261E" }}
                      >
                        {errorMsg}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full font-sans transition-colors"
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
                      }}
                      onMouseEnter={(e) => {
                        if (!submitting) e.currentTarget.style.backgroundColor = "#D9A538";
                      }}
                      onMouseLeave={(e) => {
                        if (!submitting) e.currentTarget.style.backgroundColor = "#E8B547";
                      }}
                    >
                      {submitting ? "Versturen..." : "Verstuur bericht"}
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
