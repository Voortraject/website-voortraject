import { useEffect, useState, FormEvent } from "react";
import {
  Home,
  Coins,
  Clock,
  Building2,
  Trees,
  Check,
  X as XIcon,
  Info,
  Phone,
  MapPinned,
  FileText,
  Send,
  CheckCircle2,
  ChevronDown,
  Globe,
  MapPin,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

// Editable constants
const LAATST_BIJGEWERKT = "mei 2026";
const INKOMEN_ALLEEN = "€28.063";
const INKOMEN_SAMEN = "€40.088";

// Palette (page-scoped)
const C = {
  primary: "#1B2E4A",
  accent: "#D4AF3D",
  accentSoft: "#E5C967",
  bg: "#F8F4ED",
  card: "#FFFFFF",
  cardSoft: "#F4ECDC",
  text: "#1F2937",
  muted: "#6B7280",
};

const IMG = "/images/nij-begun";
const imgKaart = `${IMG}/Afbeelding_50-100_Groningen.webp`;
const imgHuis = `${IMG}/Isolatie_huis_afbeelding.webp`;

const faqs: { q: string; a: string }[] = [
  {
    q: "Tot wanneer kan ik subsidie aanvragen?",
    a: "Tot 3 juni 2035. Sinds eind augustus 2026 zijn alle postcodes geopend.",
  },
  {
    q: "Krijg ik 50% of 100% subsidie?",
    a: "Dat hangt af van of je in het versterkingsgebied woont en van je inkomen. Tijdens de intake checken we beide.",
  },
  {
    q: "Heb ik een isolatieplan nodig?",
    a: "Alleen als je maatregelen meer dan €10.000 inclusief btw kosten. Het plan is gratis en wordt door een Nij Begun-adviseur gemaakt.",
  },
  {
    q: "Mag ik Nij Begun stapelen met ISDE?",
    a: "Voor isolatie en ventilatie zit ISDE al verwerkt in Nij Begun. Voor warmtepomp of zonneboiler is ISDE wel een aparte aanvraag bij RVO.",
  },
  {
    q: "Hoe lang duurt het voor ik subsidie ontvang?",
    a: "SNN beslist binnen 13 weken (verlengbaar met 8 weken). Daarna heb je 2 jaar om de werkzaamheden te laten uitvoeren.",
  },
  {
    q: "Wat kost jullie hulp?",
    a: "Niets. Onze intake en begeleiding zijn gratis voor bewoners.",
  },
];

// Reusable: heading with one gold word
const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2
    className="font-display"
    style={{
      fontWeight: 700,
      fontSize: "clamp(28px, 4vw, 40px)",
      letterSpacing: "-0.02em",
      lineHeight: 1.15,
      color: C.primary,
    }}
  >
    {children}
  </h2>
);

const Gold = ({ children }: { children: React.ReactNode }) => (
  <span style={{ color: C.accent }}>{children}</span>
);

const Illustration = ({ src, alt }: { src: string; alt: string }) => (
  <div
    style={{
      aspectRatio: "5 / 3",
      width: "100%",
      borderRadius: "1rem",
      overflow: "hidden",
      backgroundColor: "#FFC72C",
    }}
  >
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition: "center",
      }}
    />
  </div>
);

const CheckLi = ({ children }: { children: React.ReactNode }) => (
  <li className="flex items-start gap-2 py-1">
    <Check size={18} style={{ color: C.accent, marginTop: 3, flexShrink: 0 }} aria-hidden />
    <span style={{ fontSize: 15, color: C.text, lineHeight: 1.5 }}>{children}</span>
  </li>
);

const XLi = ({ children }: { children: React.ReactNode }) => (
  <li className="flex items-start gap-2 py-1">
    <XIcon size={18} style={{ color: C.muted, marginTop: 3, flexShrink: 0 }} aria-hidden />
    <span style={{ fontSize: 15, color: C.text, lineHeight: 1.5 }}>{children}</span>
  </li>
);

const cardBase: React.CSSProperties = {
  backgroundColor: C.card,
  border: `1px solid ${C.accentSoft}66`,
  borderRadius: "1rem",
  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
};

const cardSoftBase: React.CSSProperties = {
  ...cardBase,
  backgroundColor: C.cardSoft,
};

const goldBtn: React.CSSProperties = {
  backgroundColor: C.accent,
  color: C.primary,
  fontWeight: 700,
  borderRadius: 9999,
  padding: "14px 28px",
  fontSize: 15,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "background-color 150ms ease",
};

const outlineBtn: React.CSSProperties = {
  backgroundColor: "transparent",
  color: C.primary,
  fontWeight: 600,
  borderRadius: 9999,
  padding: "12px 26px",
  fontSize: 15,
  border: `2px solid ${C.primary}`,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

const SubsidiesNijBegun = () => {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = "Subsidie Nij Begun aanvragen in Groningen en Noord-Drenthe | Voortraject";

    const setMeta = (name: string, content: string, attr: "name" | "property" = "name") => {
      let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
      return el;
    };
    setMeta(
      "description",
      "Tot €40.000 subsidie voor isolatie via Nij Begun (Maatregel 29). Wij regelen de intake voor bewoners in Groningen en Noord-Drenthe."
    );

    let canon = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    const created = !canon;
    if (!canon) {
      canon = document.createElement("link");
      canon.rel = "canonical";
      document.head.appendChild(canon);
    }
    canon.href = `${window.location.origin}/subsidies/nij-begun`;

    const ld = document.createElement("script");
    ld.type = "application/ld+json";
    ld.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
    document.head.appendChild(ld);

    return () => {
      document.title = prevTitle;
      ld.remove();
      if (created && canon) canon.remove();
    };
  }, []);

  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const obj = Object.fromEntries(data.entries()) as Record<string, string>;
    const next: Record<string, string> = {};
    if (!obj.naam?.trim()) next.naam = "Vul je naam in";
    if (!obj.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(obj.email)) next.email = "Vul een geldig e-mailadres in";
    if (!obj.telefoon?.trim()) next.telefoon = "Vul je telefoonnummer in";
    if (!obj.postcode?.trim() || !/^\d{4}\s?[A-Za-z]{2}$/.test(obj.postcode)) next.postcode = "Vul een geldige postcode in (1234 AB)";
    if (!obj.adres?.trim()) next.adres = "Vul je adres in";
    if (!obj.privacy) next.privacy = "Akkoord met privacybeleid is vereist";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    try {
      await fetch("/api/intake-nij-begun", {
        method: "POST",
        body: JSON.stringify(obj),
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      // placeholder endpoint
    }
    setSubmitted(true);
  };

  const inputCls =
    "w-full rounded-lg border bg-white px-4 py-3 text-[15px] outline-none transition focus:shadow-[0_0_0_3px_rgba(212,175,61,0.25)]";
  const inputStyle: React.CSSProperties = {
    borderColor: `${C.accentSoft}99`,
    color: C.text,
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: C.bg, color: C.text }}>
      <Header />

      {/* 1. HERO */}
      <section style={{ backgroundColor: C.bg }} className="py-12 md:py-20">
        <div className="container-content">
          <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-10 lg:gap-14 items-center">
            <div>
              <div
                style={{
                  color: C.accent,
                  textTransform: "uppercase",
                  fontSize: 12,
                  letterSpacing: "0.14em",
                  fontWeight: 700,
                  marginBottom: 16,
                }}
              >
                MAATREGEL 29
              </div>
              <h1
                className="font-display"
                style={{
                  fontWeight: 700,
                  fontSize: "clamp(36px, 5.5vw, 60px)",
                  letterSpacing: "-0.03em",
                  lineHeight: 1.05,
                  color: C.primary,
                  marginBottom: 20,
                }}
              >
                Tot <Gold>€40.000 subsidie</Gold> voor het isoleren van jouw huis
              </h1>
              <p style={{ fontSize: 18, lineHeight: 1.6, color: C.muted, marginBottom: 28, maxWidth: 620 }}>
                Woon je in Groningen of Noord-Drenthe? Via de Isolatieaanpak Nij Begun kun je je woning gratis of voor de helft van de kosten laten isoleren. Wij regelen de intake.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a href="#contactformulier" style={goldBtn}>
                  Plan een gratis intake
                </a>
                <a href="#bedragen" style={outlineBtn}>
                  Bekijk hoeveel je krijgt
                </a>
              </div>
            </div>

            <div style={{ ...cardBase, padding: 24 }}>
              <ul className="space-y-4">
                {[
                  { icon: Home, text: <><strong>300.000+</strong> woningen komen in aanmerking</> },
                  { icon: Coins, text: <><strong>€1,65 miljard</strong> beschikbaar tot 2035</> },
                  { icon: Clock, text: <><strong>2 jaar</strong> de tijd na toekenning</> },
                ].map((s, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span
                      className="inline-flex items-center justify-center shrink-0"
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 9999,
                        backgroundColor: C.cardSoft,
                        color: C.accent,
                      }}
                    >
                      <s.icon size={18} aria-hidden />
                    </span>
                    <span style={{ fontSize: 15, color: C.text, lineHeight: 1.5, paddingTop: 6 }}>
                      {s.text}
                    </span>
                  </li>
                ))}
              </ul>
              <div style={{ borderTop: `1px solid ${C.accentSoft}66`, marginTop: 20, paddingTop: 12 }}>
                <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>
                  Officiële regeling van Nij Begun
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. WAT IS NIJ BEGUN */}
      <section style={{ backgroundColor: C.card }} className="py-16 md:py-20">
        <div className="container-content max-w-3xl mx-auto">
          <H2>
            Wat is de <Gold>Isolatieaanpak</Gold> Nij Begun?
          </H2>
          <p style={{ fontSize: 17, lineHeight: 1.7, color: C.text, marginTop: 16 }}>
            Nij Begun is Gronings voor "nieuw begin". Het is de manier waarop de overheid bewoners in Groningen en Noord-Drenthe compenseert voor de schade van de gaswinning. Een groot deel van het pakket gaat naar Maatregel 29: subsidie om je woning te isoleren en ventileren.
          </p>
          <p style={{ fontSize: 17, lineHeight: 1.7, color: C.text, marginTop: 12 }}>
            Voor deze aanpak staat <strong>€1,65 miljard</strong> klaar. De regeling loopt tot <strong>3 juni 2035</strong>.
          </p>
        </div>
      </section>

      {/* 3. AANMERKING */}
      <section style={{ backgroundColor: C.bg }} className="py-16 md:py-20">
        <div className="container-content">
          <div className="max-w-3xl mx-auto text-center">
            <H2>
              Komt jouw woning in <Gold>aanmerking</Gold>?
            </H2>
            <p style={{ fontSize: 17, lineHeight: 1.7, color: C.text, marginTop: 16 }}>
              De subsidie geldt voor woningeigenaren in <strong>de hele provincie Groningen</strong> en in <strong>drie Drentse gemeenten</strong>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10 max-w-5xl mx-auto">
            <div style={{ ...cardSoftBase, padding: 28 }}>
              <span
                className="inline-flex items-center justify-center"
                style={{ width: 36, height: 36, borderRadius: 9999, backgroundColor: C.card, color: C.accent }}
              >
                <Building2 size={18} aria-hidden />
              </span>
              <h3
                className="font-display"
                style={{ fontSize: 18, fontWeight: 700, color: C.primary, marginTop: 12, marginBottom: 14 }}
              >
                Provincie Groningen, alle 10 gemeenten
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                {[
                  "Eemsdelta", "Groningen",
                  "Het Hogeland", "Midden-Groningen",
                  "Oldambt", "Pekela",
                  "Stadskanaal", "Veendam",
                  "Westerkwartier", "Westerwolde",
                ].map((g) => (
                  <CheckLi key={g}>{g}</CheckLi>
                ))}
              </ul>
            </div>

            <div style={{ ...cardSoftBase, padding: 28 }}>
              <span
                className="inline-flex items-center justify-center"
                style={{ width: 36, height: 36, borderRadius: 9999, backgroundColor: C.card, color: C.accent }}
              >
                <Trees size={18} aria-hidden />
              </span>
              <h3
                className="font-display"
                style={{ fontSize: 18, fontWeight: 700, color: C.primary, marginTop: 12, marginBottom: 14 }}
              >
                Noord-Drenthe, drie gemeenten
              </h3>
              <ul>
                <CheckLi>Aa en Hunze</CheckLi>
                <CheckLi>Noordenveld</CheckLi>
                <CheckLi>Tynaarlo</CheckLi>
              </ul>
            </div>
          </div>

          <p
            className="text-center mt-6 max-w-3xl mx-auto"
            style={{ fontSize: 13, color: C.muted }}
          >
            Andere Drentse gemeenten zoals Assen, Emmen en Coevorden vallen niet onder Nij Begun. Voor hen gelden andere subsidies.
          </p>
        </div>
      </section>

      {/* 4. HOEVEEL */}
      <section id="bedragen" style={{ backgroundColor: C.card }} className="py-16 md:py-20">
        <div className="container-content">
          <div className="max-w-3xl mx-auto text-center">
            <H2>
              Hoeveel <Gold>subsidie</Gold> krijg je precies?
            </H2>
            <p style={{ fontSize: 17, lineHeight: 1.7, color: C.text, marginTop: 16 }}>
              Het bedrag hangt af van <strong>waar precies in het gebied</strong> je woont en van <strong>je inkomen</strong>. Er zijn twee categorieën.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mt-10 items-center max-w-6xl mx-auto">
            <Illustration src={imgKaart} alt="Kaart van Groningen met 50% en 100% subsidiegebieden" />

            <div className="space-y-6">
              {/* Card 50% */}
              <div style={{ ...cardBase, padding: 28 }}>
                <div className="flex items-baseline gap-3">
                  <span style={{ fontSize: 44, fontWeight: 800, color: C.primary, letterSpacing: "-0.02em" }}>50%</span>
                  <span style={{ fontSize: 15, color: C.muted }}>tot <strong style={{ color: C.text }}>€20.000</strong> per woning</span>
                </div>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: C.primary, marginTop: 14, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Voor wie?
                </h4>
                <ul>
                  <CheckLi>Alle woningeigenaren in het Nij Begun-gebied</CheckLi>
                  <CheckLi>Buiten het versterkingsgebied</CheckLi>
                  <CheckLi>Inkomen boven 140% sociaal minimum</CheckLi>
                </ul>
              </div>

              {/* Card 100% */}
              <div
                style={{
                  ...cardSoftBase,
                  padding: 28,
                  border: `2px solid ${C.accent}`,
                  position: "relative",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: -12,
                    left: 24,
                    backgroundColor: C.accent,
                    color: C.primary,
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: "0.1em",
                    padding: "4px 10px",
                    borderRadius: 9999,
                  }}
                >
                  MEEST GUNSTIG
                </span>
                <div className="flex items-baseline gap-3 mt-2">
                  <span style={{ fontSize: 44, fontWeight: 800, color: C.primary, letterSpacing: "-0.02em" }}>100%</span>
                  <span style={{ fontSize: 15, color: C.muted }}>tot <strong style={{ color: C.text }}>€40.000</strong> per woning, plus €1.000 advies</span>
                </div>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: C.primary, marginTop: 14, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Voor wie?
                </h4>
                <ul>
                  <CheckLi>Bewoners in het versterkingsgebied</CheckLi>
                  <CheckLi>Bewoners in NCG-versterkingsprogramma</CheckLi>
                  <CheckLi>Inkomen onder 140% sociaal minimum</CheckLi>
                </ul>
              </div>
            </div>
          </div>

          <div
            className="flex items-center gap-2 max-w-6xl mx-auto mt-6"
            style={{ fontSize: 14, color: C.muted }}
          >
            <Info size={16} style={{ color: C.accent, flexShrink: 0 }} aria-hidden />
            <span>Niet zeker in welke categorie je valt? Wij checken het tijdens de intake.</span>
          </div>
        </div>
      </section>

      {/* 5. WAT WORDT VERGOED */}
      <section style={{ backgroundColor: C.bg }} className="py-16 md:py-20">
        <div className="container-content">
          <div className="max-w-3xl mx-auto text-center">
            <H2>
              Welke isolatie wordt <Gold>vergoed</Gold>?
            </H2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mt-10 items-center max-w-6xl mx-auto">
            <Illustration src={imgHuis} alt="Doorsnede van een huis met de vergoede isolatiemaatregelen" />

            <div className="space-y-8">
              <div>
                <h3 className="font-display" style={{ fontSize: 18, fontWeight: 700, color: C.primary, marginBottom: 10 }}>
                  Vergoede maatregelen
                </h3>
                <ul>
                  <CheckLi>Spouwmuurisolatie</CheckLi>
                  <CheckLi>Dak en vloerisolatie</CheckLi>
                  <CheckLi>Gevelisolatie (binnen of buiten)</CheckLi>
                  <CheckLi>HR++ glas of vacuümglas</CheckLi>
                  <CheckLi>Triple glas met nieuwe kozijnen (30% subsidie)</CheckLi>
                  <CheckLi>Mechanische ventilatie of balansventilatie</CheckLi>
                  <CheckLi>Diervriendelijk isoleren</CheckLi>
                </ul>
              </div>

              <div>
                <h3 className="font-display" style={{ fontSize: 18, fontWeight: 700, color: C.primary, marginBottom: 10 }}>
                  Niet vergoed
                </h3>
                <ul>
                  <XLi>Zonnepanelen, warmtepomp, zonneboiler (wel via ISDE)</XLi>
                  <XLi>Schilderwerk, behang, esthetische afwerking</XLi>
                  <XLi>Aanbouwen of nieuwbouw na 1 juli 2012</XLi>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. ZO WERKT HET */}
      <section style={{ backgroundColor: C.card }} className="py-16 md:py-20">
        <div className="container-content">
          <div className="max-w-3xl mx-auto text-center">
            <H2>
              Zo werkt het van intake tot <Gold>uitbetaling</Gold>
            </H2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-10 max-w-6xl mx-auto">
            {[
              { n: "01", icon: Phone, t: "Gratis intake", d: "Wij komen langs voor een vrijblijvend gesprek over jouw woning." },
              { n: "02", icon: MapPinned, t: "Postcode en inkomenscheck", d: "Wij controleren of je voor 50% of 100% in aanmerking komt." },
              { n: "03", icon: FileText, t: "Isolatieplan", d: "Voor maatregelen boven €10.000 maakt een Nij Begun-adviseur een gratis plan." },
              { n: "04", icon: Send, t: "Aanvraag bij SNN", d: "Wij dienen de aanvraag in. De beslistermijn is maximaal 13 weken." },
              { n: "05", icon: CheckCircle2, t: "Uitvoering en uitbetaling", d: "Na toekenning heb je 2 jaar voor de werkzaamheden. SNN keert daarna uit." },
            ].map((s) => (
              <div key={s.n} style={{ ...cardBase, padding: 20 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: C.accent, letterSpacing: "0.05em" }}>{s.n}</div>
                <span
                  className="inline-flex items-center justify-center mt-3"
                  style={{ width: 36, height: 36, borderRadius: 9999, backgroundColor: C.cardSoft, color: C.accent }}
                >
                  <s.icon size={18} aria-hidden />
                </span>
                <h4 className="font-display" style={{ fontSize: 15, fontWeight: 700, color: C.primary, marginTop: 12, marginBottom: 6 }}>
                  {s.t}
                </h4>
                <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.5, margin: 0 }}>{s.d}</p>
              </div>
            ))}
          </div>

          <p className="text-center mt-8 max-w-3xl mx-auto" style={{ fontSize: 13, color: C.muted }}>
            Werk uitgevoerd door een niet-aangesloten bedrijf komt niet in aanmerking voor subsidie. Wij werken alleen met aangesloten partners.
          </p>
        </div>
      </section>

      {/* 7. FAQ */}
      <section style={{ backgroundColor: C.bg }} className="py-16 md:py-20">
        <div className="container-content max-w-3xl mx-auto">
          <H2>
            Veelgestelde <Gold>vragen</Gold>
          </H2>
          <div className="mt-8 divide-y" style={{ borderTop: `1px solid ${C.accentSoft}66`, borderBottom: `1px solid ${C.accentSoft}66` }}>
            {faqs.map((f, i) => {
              const open = openFaq === i;
              return (
                <div key={i} style={{ borderColor: `${C.accentSoft}66` }}>
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setOpenFaq(open ? null : i)}
                    className="w-full flex items-center justify-between gap-4 py-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    style={{ color: C.primary }}
                  >
                    <span className="font-display" style={{ fontSize: 17, fontWeight: 600 }}>
                      {f.q}
                    </span>
                    <ChevronDown
                      size={20}
                      style={{
                        color: C.accent,
                        transition: "transform 200ms ease",
                        transform: open ? "rotate(180deg)" : "rotate(0deg)",
                        flexShrink: 0,
                      }}
                      aria-hidden
                    />
                  </button>
                  {open && (
                    <div style={{ paddingBottom: 20, fontSize: 15, color: C.text, lineHeight: 1.6 }}>{f.a}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. CONTACT */}
      <section id="contactformulier" style={{ backgroundColor: C.primary }} className="py-16 md:py-24">
        <div className="container-content">
          <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-10 lg:gap-14 items-start">
            <div className="text-white">
              <H2>
                <span style={{ color: "#fff" }}>Klaar om jouw subsidie aan te </span>
                <Gold>vragen</Gold>
                <span style={{ color: "#fff" }}>?</span>
              </H2>
              <p style={{ fontSize: 17, lineHeight: 1.6, marginTop: 16, color: "rgba(255,255,255,0.8)" }}>
                Plan een vrijblijvende intake. Wij komen langs, checken jouw situatie en rekenen uit wat je krijgt.
              </p>
              <ul className="mt-8 space-y-3">
                {[
                  "Lokale adviseur uit Groningen of Drenthe",
                  "Persoonlijk huisbezoek binnen 1 week",
                  "Wij werken alleen met aangesloten Nij Begun-bedrijven",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3">
                    <Check size={20} style={{ color: C.accent, marginTop: 2, flexShrink: 0 }} aria-hidden />
                    <span style={{ fontSize: 16, color: "#fff" }}>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ ...cardSoftBase, padding: 28 }}>
              {submitted ? (
                <div className="flex flex-col items-center text-center py-6">
                  <CheckCircle2 size={48} style={{ color: C.accent }} aria-hidden />
                  <p className="font-display mt-4" style={{ fontSize: 20, fontWeight: 700, color: C.primary }}>
                    Bedankt!
                  </p>
                  <p style={{ fontSize: 15, color: C.text, marginTop: 6 }}>
                    We nemen binnen 1 werkdag contact op.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  <h3 className="font-display" style={{ fontSize: 20, fontWeight: 700, color: C.primary, marginBottom: 16 }}>
                    Plan jouw gratis intake
                  </h3>
                  <div className="space-y-3">
                    {[
                      { name: "naam", label: "Naam", type: "text" },
                      { name: "email", label: "E-mailadres", type: "email" },
                      { name: "telefoon", label: "Telefoonnummer", type: "tel" },
                      { name: "postcode", label: "Postcode", type: "text", placeholder: "1234 AB" },
                      { name: "adres", label: "Adres", type: "text" },
                      { name: "bouwjaar", label: "Bouwjaar woning (optioneel)", type: "number" },
                    ].map((f) => (
                      <div key={f.name}>
                        <label
                          htmlFor={f.name}
                          style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.primary, marginBottom: 4 }}
                        >
                          {f.label}
                        </label>
                        <input
                          id={f.name}
                          name={f.name}
                          type={f.type}
                          placeholder={f.placeholder}
                          className={inputCls}
                          style={inputStyle}
                          maxLength={120}
                        />
                        {errors[f.name] && (
                          <p style={{ fontSize: 12, color: "#B91C1C", marginTop: 4 }}>{errors[f.name]}</p>
                        )}
                      </div>
                    ))}
                    <div>
                      <label
                        htmlFor="toelichting"
                        style={{ display: "block", fontSize: 13, fontWeight: 600, color: C.primary, marginBottom: 4 }}
                      >
                        Korte toelichting (optioneel)
                      </label>
                      <textarea
                        id="toelichting"
                        name="toelichting"
                        rows={3}
                        maxLength={500}
                        placeholder="Bijv: ik wil dak en vloer laten isoleren"
                        className={inputCls}
                        style={inputStyle}
                      />
                    </div>
                    <label className="flex items-start gap-2 mt-2" style={{ fontSize: 13, color: C.text }}>
                      <input type="checkbox" name="privacy" className="mt-1" />
                      <span>
                        Ik ga akkoord met het{" "}
                        <a href="/privacy" style={{ color: C.accent, textDecoration: "underline" }}>
                          privacybeleid
                        </a>
                      </span>
                    </label>
                    {errors.privacy && (
                      <p style={{ fontSize: 12, color: "#B91C1C", marginTop: -4 }}>{errors.privacy}</p>
                    )}
                    <button
                      type="submit"
                      style={{ ...goldBtn, width: "100%", marginTop: 8 }}
                    >
                      Verstuur intake-aanvraag
                    </button>
                    <p style={{ fontSize: 12, color: C.muted, textAlign: "center", marginTop: 4 }}>
                      Wij reageren binnen 1 werkdag.
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 9. ANDERE SUBSIDIES */}
      <section style={{ backgroundColor: C.cardSoft }} className="py-14 md:py-16">
        <div className="container-content max-w-5xl mx-auto">
          <h3 className="font-display" style={{ fontSize: 22, fontWeight: 700, color: C.primary, marginBottom: 20 }}>
            Andere subsidies die <Gold>misschien interessant</Gold> zijn
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div style={{ ...cardBase, padding: 24 }}>
              <span
                className="inline-flex items-center justify-center"
                style={{ width: 36, height: 36, borderRadius: 9999, backgroundColor: C.cardSoft, color: C.accent }}
              >
                <Globe size={18} aria-hidden />
              </span>
              <h4 className="font-display" style={{ fontSize: 17, fontWeight: 700, color: C.primary, marginTop: 12 }}>
                Landelijke subsidies (ISDE)
              </h4>
              <p style={{ fontSize: 14, color: C.text, lineHeight: 1.6, marginTop: 6 }}>
                Voor warmtepomp, zonneboiler en isolatie buiten het Nij Begun-gebied.
              </p>
              <a
                href="/subsidies/landelijk"
                style={{ color: C.accent, fontWeight: 600, fontSize: 14, marginTop: 12, display: "inline-block" }}
              >
                Bekijk landelijke subsidies →
              </a>
            </div>
            <div style={{ ...cardBase, padding: 24 }}>
              <span
                className="inline-flex items-center justify-center"
                style={{ width: 36, height: 36, borderRadius: 9999, backgroundColor: C.cardSoft, color: C.accent }}
              >
                <MapPin size={18} aria-hidden />
              </span>
              <h4 className="font-display" style={{ fontSize: 17, fontWeight: 700, color: C.primary, marginTop: 12 }}>
                Regionale en gemeentelijke subsidies
              </h4>
              <p style={{ fontSize: 14, color: C.text, lineHeight: 1.6, marginTop: 6 }}>
                Aanvullende regelingen per gemeente, vaak stapelbaar met ISDE.
              </p>
              <a
                href="/subsidies/regionaal"
                style={{ color: C.accent, fontWeight: 600, fontSize: 14, marginTop: 12, display: "inline-block" }}
              >
                Bekijk regionale subsidies →
              </a>
            </div>
          </div>
          <p className="text-center mt-10" style={{ fontSize: 12, color: C.muted }}>
            Laatst bijgewerkt: {LAATST_BIJGEWERKT}
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SubsidiesNijBegun;
