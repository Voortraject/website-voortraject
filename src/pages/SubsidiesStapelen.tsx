import { Fragment, useEffect, useState } from "react";
import {
  Layers,
  RefreshCw,
  Users,
  Globe,
  Map as MapIcon,
  Building2,
  Plus,
  Equal,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Seo } from "@/components/Seo";
import { Footer } from "@/components/Footer";

// Page-scoped palette (identical to other subsidie pages)
const C = {
  primary: "#152C4E",
  accent: "#E8B547",
  accentSoft: "#E5C967",
  bg: "#F8F4ED",
  card: "#FFFFFF",
  cardSoft: "var(--card-soft)",
  text: "#1F2937",
  muted: "#6B7280",
};

const LAATST_BIJGEWERKT = "juni 2026";

const faqs: { q: string; a: string }[] = [
  {
    q: "Kan ik echt meerdere subsidies combineren?",
    a: "In veel gevallen wel. Welke precies samengaan hangt af van je woning, je maatregelen en je gebied, en dat zoeken we voor je uit.",
  },
  {
    q: "Wat kost jullie hulp hierbij?",
    a: "Voor bewoners is ons advies gratis. Wij worden betaald door de uitvoerders, voor het voorwerk dat we voor hen uit handen nemen.",
  },
  {
    q: "Welke subsidies gelden in mijn gebied?",
    a: "Dat verschilt per gemeente en regeling. We zoeken het voor jouw adres uit.",
  },
  {
    q: "Veranderen de regelingen niet steeds?",
    a: "Ja, en daarom houden wij ze voor je bij, zodat je niets misloopt.",
  },
];

const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2
    className="font-display"
    style={{
      color: C.primary,
      fontWeight: 700,
      fontSize: "clamp(28px, 4vw, 40px)",
      letterSpacing: "-0.02em",
      lineHeight: 1.15,
    }}
  >
    {children}
  </h2>
);

const Gold = ({ children }: { children: React.ReactNode }) => (
  <span style={{ color: C.accent }}>{children}</span>
);

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
  transition: "transform 150ms ease",
};

const outlineBtn: React.CSSProperties = {
  backgroundColor: "transparent",
  color: C.primary,
  fontWeight: 600,
  borderRadius: 9999,
  padding: "12px 26px",
  fontSize: 15,
  border: `2px solid ${C.accent}`,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

const IconCircle = ({ Icon, size = 20 }: { Icon: React.ComponentType<any>; size?: number }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: size === 20 ? 36 : 44,
      height: size === 20 ? 36 : 44,
      borderRadius: 9999,
      backgroundColor: `${C.accent}22`,
      flexShrink: 0,
    }}
  >
    <Icon size={size} color={C.accent} />
  </span>
);

const SubsidiesStapelen = () => {
  useEffect(() => {
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
      if (ld.parentNode) ld.parentNode.removeChild(ld);
    };
  }, []);

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const cardOnCream: React.CSSProperties = {
    backgroundColor: C.card,
    border: `1px solid ${C.accentSoft}66`,
    borderRadius: "1rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  };

  const bouwstenen = [
    {
      Icon: Globe,
      tag: "ISDE",
      titel: "Landelijk",
      tekst:
        "Vaste bedragen per maatregel voor isolatie, een warmtepomp, zonneboiler en meer. Aanvragen bij RVO.",
      footer: "geldt in heel Nederland",
    },
    {
      Icon: MapIcon,
      tag: "NIJ BEGUN",
      titel: "Regionaal",
      tekst:
        "Subsidie om je woning in Groningen en Noord-Drenthe te isoleren tot de isolatiestandaard. Vooraf aanvragen bij SNN, vóór je begint.",
      footer: "alleen in het werkgebied",
    },
    {
      Icon: Building2,
      tag: "PER GEMEENTE",
      titel: "Gemeentelijk",
      tekst:
        "Lokale potjes zoals een isolatiepremie, een duurzaamheidslening of een gratis energiecoach. Verschilt per gemeente.",
      footer: "vaak over het hoofd gezien",
    },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: C.bg, color: C.text }}>
      <Seo
        title="Subsidies stapelen voor verduurzaming | Voortraject"
        description="Combineer landelijke, regionale en gemeentelijke subsidies om je verduurzaming maximaal te laten renderen. Wij zoeken voor jou uit wat stapelt."
        path="/subsidies/stapelen"
      />
      <Header />

      {/* 1. HERO — cream */}
      <section style={{ backgroundColor: C.bg }} className="py-12 md:py-20">
        <div className="container-content">
          <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-10 lg:gap-14 items-center">
            <div>
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
                Subsidies stapelen, haal het <Gold>maximale</Gold> eruit
              </h1>
              <p style={{ fontSize: 18, lineHeight: 1.6, color: C.text, marginBottom: 28, maxWidth: 620 }}>
                Veel huishoudens laten geld liggen omdat ze niet weten dat subsidies vaak te combineren zijn. Een landelijke regeling, een regionale regeling zoals Nij Begun, een gemeentelijk potje en voordelige financiering kunnen samen je kosten flink drukken. Wij zoeken voor jou uit wat je kunt stapelen en begeleiden de aanvraag. Gratis.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="/contact" style={goldBtn}>
                  Ja ik wil gratis advies
                </a>
                <a
                  href="#stapelen"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById("stapelen")?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  style={outlineBtn}
                >
                  Zo werkt stapelen
                </a>
              </div>
            </div>

            <div style={{ ...cardOnCream, padding: 24 }}>
              <ul style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {[
                  {
                    Icon: Layers,
                    text: (
                      <>
                        <strong style={{ color: C.primary }}>Stapelbaar</strong>: landelijk, regionaal én gemeentelijk
                      </>
                    ),
                  },
                  {
                    Icon: RefreshCw,
                    text: (
                      <>
                        <strong style={{ color: C.primary }}>Actuele regelingen</strong> worden door ons bijgehouden
                      </>
                    ),
                  },
                  {
                    Icon: Users,
                    text: (
                      <>
                        <strong style={{ color: C.primary }}>Eén aanspreekpunt</strong> voor al je aanvragen
                      </>
                    ),
                  },
                ].map((it, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <IconCircle Icon={it.Icon} />
                    <span style={{ fontSize: 15, color: C.text, lineHeight: 1.5, paddingTop: 6 }}>{it.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 2. WAT IS SUBSIDIES STAPELEN — wit */}
      <section style={{ backgroundColor: "#FFFFFF" }} className="py-16 md:py-24">
        <div className="container-content max-w-3xl">
          <H2>
            Wat is subsidies <Gold>stapelen</Gold>?
          </H2>
          <div style={{ marginTop: 24, fontSize: 17, lineHeight: 1.7, color: C.text }}>
            <p style={{ marginBottom: 18 }}>
              Verduurzamen wordt vaak met meerdere regelingen tegelijk ondersteund: een landelijke subsidie, een regionale regeling en soms voordelige financiering. Die kun je in veel gevallen combineren, oftewel stapelen, waardoor je netto minder betaalt dan met één regeling alleen.
            </p>
            <p>
              De kunst zit in weten welke regelingen samengaan, in welke volgorde je ze aanvraagt en welke voor jouw woning en gebied gelden. Dat verandert regelmatig, en daar laten veel mensen geld liggen.
            </p>
          </div>
        </div>
      </section>

      {/* 3. DE BOUWSTENEN — cream */}
      <section id="stapelen" style={{ backgroundColor: C.bg }} className="py-16 md:py-24">
        <div className="container-content">
          <div className="max-w-3xl text-center mx-auto">
            <H2>
              De bouwstenen die je kunt <Gold>combineren</Gold>
            </H2>
            <p style={{ marginTop: 20, fontSize: 17, lineHeight: 1.7, color: C.text }}>
              Er zijn meerdere regelingen die je kunt combineren. Welke voor jou gelden hangt af van je woning en je gebied; je hebt ze niet allemaal nodig om voordeel te halen. Wij zoeken uit welke combinatie voor jou het meeste oplevert.
            </p>
          </div>

          <div className="mt-10 flex flex-col md:flex-row md:items-stretch gap-4 md:gap-3">
            {bouwstenen.map((c, i, arr) => (
              <Fragment key={i}>
                <div style={{ ...cardOnCream, padding: 24, display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
                  <div className="flex items-center gap-3">
                    <IconCircle Icon={c.Icon} size={22} />
                    <h3 style={{ fontSize: 22, fontWeight: 700, color: C.primary, margin: 0 }}>{c.titel}</h3>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: C.accent }}>
                    {c.tag}
                  </span>
                  <p style={{ fontSize: 15, color: C.text, lineHeight: 1.6, margin: 0 }}>{c.tekst}</p>
                  <span style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>{c.footer}</span>
                </div>
                {i < arr.length - 1 && (
                  <div
                    aria-hidden="true"
                    className="flex items-center justify-center"
                    style={{ color: C.accent, fontSize: 32, fontWeight: 700, lineHeight: 1, padding: "4px 0" }}
                  >
                    +
                  </div>
                )}
              </Fragment>
            ))}
          </div>

          {/* Samenvattingsblok */}
          <div
            style={{
              ...cardOnCream,
              marginTop: 32,
              padding: "32px 28px",
              textAlign: "center",
              borderColor: C.accent,
              borderWidth: 2,
              borderStyle: "solid",
            }}
          >
            <div className="flex items-center justify-center gap-4 md:gap-6 mb-4 flex-wrap">
              <IconCircle Icon={Plus} size={22} />
              <IconCircle Icon={Plus} size={22} />
              <IconCircle Icon={Equal} size={22} />
              <IconCircle Icon={CheckCircle2} size={22} />
            </div>
            <p style={{ fontSize: "clamp(20px, 2.4vw, 26px)", fontWeight: 700, color: C.primary, margin: 0 }}>
              Wat de juiste <Gold>combinatie</Gold> oplevert, rekenen we voor jou uit
            </p>
            <div style={{ marginTop: 22 }}>
              <a href="/contact" style={goldBtn}>
                Plan een gratis adviesgesprek
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FAQ */}
      <section className="py-[64px] md:py-[96px]" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="h2-section text-center" style={{ color: "#152C4E", fontWeight: 600 }}>
            Veelgestelde <span style={{ color: "hsl(var(--accent))" }}>vragen</span>
          </h2>
          <p
            className="text-center mx-auto"
            style={{ color: "#152C4E", opacity: 0.75, fontSize: 16, marginTop: 16, marginBottom: 40 }}
          >
            Wat we het vaakst gevraagd krijgen, kort beantwoord.
          </p>
          <div
            className="mx-auto"
            style={{
              maxWidth: 820,
              backgroundColor: "#FFFFFF",
              border: "1px solid #E5E2DB",
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            {faqs.map((f, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  style={{ borderBottom: i === faqs.length - 1 ? "none" : "1px solid #E5E2DB" }}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                    id={`faq-btn-${i}`}
                    className="w-full flex items-center text-left"
                    style={{ padding: "20px 24px", background: "transparent", border: "none", cursor: "pointer", gap: 20 }}
                  >
                    <h3
                      className="font-display flex-1"
                      style={{ fontSize: 18, fontWeight: 500, color: "#152C4E", letterSpacing: "-0.01em", lineHeight: 1.3, margin: 0 }}
                    >
                      {f.q}
                    </h3>
                    <ChevronDown
                      size={20}
                      color="#E8B547"
                      style={{
                        opacity: 0.5,
                        transition: "transform 200ms ease",
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                        flexShrink: 0,
                      }}
                      aria-hidden="true"
                    />
                  </button>
                  <div
                    id={`faq-panel-${i}`}
                    role="region"
                    aria-labelledby={`faq-btn-${i}`}
                    style={{ maxHeight: isOpen ? 400 : 0, overflow: "hidden", transition: "max-height 300ms ease" }}
                  >
                    <p style={{ fontSize: 15, color: "#6B6B6B", lineHeight: 1.6, margin: 0, padding: "0 24px 20px 24px" }}>
                      {f.a}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. FOOTER-CTA — donkerblauw */}
      <section style={{ backgroundColor: C.primary }} className="py-20">
        <div className="container-content" style={{ maxWidth: 600, textAlign: "center" }}>
          <h2
            className="font-display"
            style={{
              color: "#FFFFFF",
              fontWeight: 700,
              fontSize: "clamp(26px, 3.6vw, 36px)",
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}
          >
            Benieuwd wat jij kunt stapelen?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 16, lineHeight: 1.65, marginTop: 18 }}>
            In een gratis gesprek zoeken we uit welke regelingen je voor jouw woning kunt combineren.
          </p>
          <div style={{ marginTop: 26 }}>
            <a href="/contact" style={goldBtn}>
              Plan een gratis adviesgesprek
            </a>
          </div>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 28 }}>
            Laatst bijgewerkt: {LAATST_BIJGEWERKT}
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SubsidiesStapelen;
