import { useEffect, useState, FormEvent } from "react";
import {
  BookOpen,
  MapPin,
  Building2,
  Trees,
  Search,
  Euro,
  User,
  Star,
  Wrench,
  ListChecks,
  Phone,
  CheckCircle2,
  MessageCircle,
  HelpCircle,
  Check,
  Home,
  Coins,
  Clock,
  Lightbulb,
  AlertCircle,
  Globe,
  ChevronDown,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

// Editable constants
const INKOMEN_ALLEEN = "€28.063";
const INKOMEN_SAMEN = "€40.088";
const PEILJAAR = "2025";
const LAATST_BIJGEWERKT = "mei 2026";

// Image paths
const IMG = "/images/nij-begun";
const imgLogo = `${IMG}/Logo_Nij_begun_-_isolatie.webp`;
const imgKaart = `${IMG}/Afbeelding_50-100_Groningen.webp`;
const imgHuis = `${IMG}/Isolatie_huis_afbeelding.webp`;
const imgAdviseur = `${IMG}/Adviseur_-_Isolatieplan_afbeelding.webp`;
const imgIsolatieplan = `${IMG}/Isolatieplan_-_kosten_en_maatregelen.webp`;
const imgSubsidieBedrijf = `${IMG}/Subsidie_naar_bedrijf_afbeelding.webp`;
const imgAanvraagAkkoord = `${IMG}/Aanvraag_akkoord_afbeelding.webp`;
const imgTweeJaar = `${IMG}/Aanvraag_akkoord_-_2_jaar_tijd.webp`;

// Colors (kept consistent with site palette while using mint accent for this page per brief)
const C = {
  blue: "#152C4E",
  mint: "#10B981",
  mintSoft: "#ECFDF5",
  mintBorder: "#A7F3D0",
  text: "#1F2937",
  muted: "#6B7280",
  bg: "#FBFAF7",
  white: "#FFFFFF",
  border: "#E5E7EB",
  amberLeft: "#F59E0B",
};

const faqs: { q: string; a: string }[] = [
  {
    q: "Tot wanneer kan ik subsidie aanvragen?",
    a: "Tot 3 juni 2035. Vanaf eind augustus 2026 zijn alle postcodes geopend, dus iedereen in het gebied kan nu aanvragen.",
  },
  {
    q: "Mag ik nu al beginnen met isoleren?",
    a: "Ja. Voor maatregelen onder €10.000 hoef je niet te wachten op een isolatieplan. Boven €10.000 is een isolatieplan verplicht — dat krijg je gratis via Nij Begun.",
  },
  {
    q: "Krijg ik 50% of 100% subsidie?",
    a: "Dat hangt af van twee dingen: (1) of je woning in het versterkingsgebied ligt, en (2) of je inkomen onder 140% sociaal minimum valt. In onze intake checken we beide voor je.",
  },
  {
    q: "Heb ik een isolatieplan nodig?",
    a: "Een isolatieplan is verplicht als je maatregelen meer dan €10.000 inclusief btw kosten. Of als je woning een rijksmonument, provinciaal of gemeentelijk monument is. In andere gevallen niet.",
  },
  {
    q: "Mag ik Nij Begun stapelen met ISDE?",
    a: "Voor isolatie en ventilatie zit ISDE al automatisch in Nij Begun verwerkt — je hoeft hem niet apart aan te vragen. Voor warmtepomp, zonneboiler of warmtenetaansluiting blijft ISDE wél een aparte aanvraag bij RVO.",
  },
  {
    q: "Welk bedrijf mag het werk uitvoeren?",
    a: "Alleen bedrijven die zijn aangesloten bij het Bedrijvennetwerk Isolatieaanpak Nij Begun. Werk je met een niet-aangesloten bedrijf, dan vervalt je subsidie. Wij werken alleen met aangesloten partners.",
  },
  {
    q: "Wat als de werkzaamheden duurder uitvallen dan begroot?",
    a: "De subsidie wordt vastgesteld op basis van de officiële maatregelencatalogus. Als de werkelijke kosten hoger zijn, betaal je het verschil zelf. Als ze lager zijn, krijg je het lagere bedrag (op basis van factuur).",
  },
  {
    q: "Hoe lang duurt het voor ik subsidie ontvang?",
    a: "SNN beslist binnen 13 weken (verlengbaar met 8 weken). Daarna heb je 2 jaar om de werkzaamheden te laten uitvoeren. Uitbetaling volgt op basis van de eindfactuur.",
  },
  {
    q: "Wat als ik zelf wil klussen?",
    a: "Doe-het-zelven mag, mits je woning aan de voorwaarden voldoet. Je krijgt subsidie op de aanschaf van materialen. Een energiecoach moet de werkzaamheden achteraf bevestigen.",
  },
  {
    q: "Wat kost jullie hulp?",
    a: "Niets. Onze intake en begeleiding zijn gratis voor bewoners. Wij worden betaald door installatiebedrijven die met ons samenwerken.",
  },
];

const SectionEyebrow = ({ icon: Icon, children }: { icon: any; children: React.ReactNode }) => (
  <div className="flex items-center gap-3 mb-4">
    <span
      className="inline-flex items-center justify-center rounded-lg"
      style={{ width: 40, height: 40, backgroundColor: C.mintSoft, color: C.mint }}
      aria-hidden="true"
    >
      <Icon size={22} />
    </span>
    <span className="label-eyebrow" style={{ color: C.mint, letterSpacing: "0.08em" }}>
      {children}
    </span>
  </div>
);

const H2 = ({ children }: { children: React.ReactNode }) => (
  <h2
    className="font-display"
    style={{
      fontWeight: 700,
      fontSize: "clamp(28px, 4vw, 40px)",
      letterSpacing: "-0.02em",
      lineHeight: 1.15,
      color: C.blue,
      marginBottom: 16,
    }}
  >
    {children}
  </h2>
);

const Para = ({ children, muted }: { children: React.ReactNode; muted?: boolean }) => (
  <p
    className="font-sans"
    style={{
      fontSize: 17,
      lineHeight: 1.7,
      color: muted ? C.muted : C.text,
      marginBottom: 16,
    }}
  >
    {children}
  </p>
);

const IllustrationFrame = ({
  src,
  alt,
  maxH,
  priority,
}: {
  src: string;
  alt: string;
  maxH?: number;
  priority?: boolean;
}) => (
  <div
    className="overflow-hidden mx-auto"
    style={{
      borderRadius: 16,
      boxShadow: "0 4px 16px rgba(15, 42, 71, 0.08)",
      border: `1px solid ${C.border}`,
      backgroundColor: "#FFC72C",
      maxWidth: "100%",
    }}
  >
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className="block w-full h-auto"
      style={maxH ? { maxHeight: maxH, objectFit: "contain", margin: "0 auto" } : undefined}
    />
  </div>
);

const CheckItem = ({ children }: { children: React.ReactNode }) => (
  <li className="flex items-start gap-2 py-1.5">
    <Check size={18} color={C.mint} className="shrink-0 mt-1" aria-hidden="true" />
    <span className="font-sans" style={{ fontSize: 16, color: C.text, lineHeight: 1.5 }}>
      {children}
    </span>
  </li>
);

const SubsidiesNijBegun = () => {
  // SEO meta
  useEffect(() => {
    const prevTitle = document.title;
    document.title =
      "Subsidie Nij Begun aanvragen in Groningen & Noord-Drenthe | Voortraject";

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
    const desc = setMeta(
      "description",
      "Tot €40.000 subsidie voor isolatie via Nij Begun (Maatregel 29). Check of jouw woning in Groningen of Noord-Drenthe in aanmerking komt. Wij regelen de intake."
    );
    const ogTitle = setMeta("og:title", "Subsidie Nij Begun aanvragen | Voortraject", "property");
    const ogDesc = setMeta(
      "og:description",
      "Tot €40.000 subsidie voor isolatie via Nij Begun. Check of jouw woning in aanmerking komt.",
      "property"
    );
    const ogType = setMeta("og:type", "article", "property");

    // Canonical
    let canon = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    const created = !canon;
    if (!canon) {
      canon = document.createElement("link");
      canon.rel = "canonical";
      document.head.appendChild(canon);
    }
    canon.href = `${window.location.origin}/subsidies/nij-begun`;

    // JSON-LD
    const ld = document.createElement("script");
    ld.type = "application/ld+json";
    ld.text = JSON.stringify([
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@context": "https://schema.org",
        "@type": "Service",
        serviceType: "Intake en begeleiding subsidieaanvraag Isolatie Nij Begun",
        provider: {
          "@type": "Organization",
          name: "Voortraject",
          url: typeof window !== "undefined" ? window.location.origin : "",
        },
        areaServed: [
          { "@type": "AdministrativeArea", name: "Provincie Groningen" },
          { "@type": "AdministrativeArea", name: "Aa en Hunze" },
          { "@type": "AdministrativeArea", name: "Noordenveld" },
          { "@type": "AdministrativeArea", name: "Tynaarlo" },
        ],
        description:
          "Voortraject begeleidt bewoners in Groningen en Noord-Drenthe bij het aanvragen van de Isolatieaanpak Nij Begun (Maatregel 29).",
      },
    ]);
    document.head.appendChild(ld);

    return () => {
      document.title = prevTitle;
      ld.remove();
      if (created && canon) canon.remove();
    };
  }, []);

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Form state
  const [submitted, setSubmitted] = useState(false);
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    try {
      await fetch("/api/intake-nij-begun", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(data.entries())),
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      // ignore — placeholder endpoint
    }
    setSubmitted(true);
  };

  const inputClass =
    "w-full rounded-lg border border-[#D4D2CC] bg-white px-4 py-3 text-[16px] text-[#1F2937] outline-none transition focus:border-[#10B981] focus:shadow-[0_0_0_3px_rgba(16,185,129,0.18)]";

  return (
    <div className="min-h-screen" style={{ backgroundColor: C.bg }}>
      <Header />

      {/* 1. HERO */}
      <section style={{ backgroundColor: C.bg }} className="py-12 md:py-20">
        <div className="container-content">
          <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-10 lg:gap-16 items-center">
            <div>
              <div
                className="font-sans"
                style={{
                  color: C.mint,
                  textTransform: "uppercase",
                  fontSize: 12,
                  letterSpacing: "0.12em",
                  fontWeight: 600,
                  marginBottom: 16,
                }}
              >
                MAATREGEL 29 — GRONINGEN &amp; NOORD-DRENTHE
              </div>
              <h1
                className="font-display"
                style={{
                  fontWeight: 700,
                  fontSize: "clamp(36px, 5.5vw, 60px)",
                  letterSpacing: "-0.03em",
                  lineHeight: 1.05,
                  color: C.blue,
                  marginBottom: 20,
                }}
              >
                Tot <span style={{ color: C.mint }}>€40.000 subsidie</span> voor het isoleren van jouw huis
              </h1>
              <p
                className="font-sans"
                style={{ fontSize: 19, lineHeight: 1.6, color: C.muted, marginBottom: 28, maxWidth: 620 }}
              >
                Woon je in Groningen of Noord-Drenthe? Dan kun je via de Isolatieaanpak Nij Begun je woning gratis of voor de helft van de kosten laten isoleren. Wij helpen je van intake tot aanvraag.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="#contactformulier"
                  className="inline-flex items-center justify-center font-sans transition-colors"
                  style={{
                    backgroundColor: C.mint,
                    color: "#fff",
                    padding: "14px 28px",
                    borderRadius: 10,
                    fontWeight: 600,
                    fontSize: 16,
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0EA371")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = C.mint)}
                >
                  Plan een gratis intake
                </a>
                <a
                  href="#bedragen"
                  className="inline-flex items-center justify-center font-sans transition-colors"
                  style={{
                    border: `2px solid ${C.blue}`,
                    color: C.blue,
                    padding: "12px 26px",
                    borderRadius: 10,
                    fontWeight: 600,
                    fontSize: 16,
                    backgroundColor: "transparent",
                  }}
                >
                  Bekijk hoeveel je krijgt
                </a>
              </div>
            </div>

            <div
              style={{
                backgroundColor: C.white,
                borderRadius: 20,
                boxShadow: "0 12px 40px rgba(15, 42, 71, 0.10)",
                padding: 24,
              }}
            >
              <div
                className="font-sans"
                style={{ fontSize: 12, color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12, textAlign: "center" }}
              >
                Officiële regeling van
              </div>
              <div
                className="flex items-center justify-center"
                style={{ padding: "12px 16px", borderRadius: 12, backgroundColor: "#FFC72C" }}
              >
                <img
                  src={imgLogo}
                  alt="Officieel logo van Isolatie Nij Begun"
                  style={{ maxHeight: 80, width: "auto", display: "block" }}
                />
              </div>
              <div style={{ borderTop: `1px solid ${C.border}`, margin: "20px 0" }} />
              <ul className="space-y-4">
                {[
                  { icon: Home, text: <><strong>300.000+</strong> woningen komen in aanmerking</> },
                  { icon: Coins, text: <><strong>€1,65 miljard</strong> beschikbaar tot 2035</> },
                  { icon: Clock, text: <><strong>2 jaar</strong> de tijd na toekenning</> },
                ].map((s, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <s.icon size={20} color={C.mint} className="shrink-0 mt-0.5" aria-hidden="true" />
                    <span className="font-sans" style={{ fontSize: 15, color: C.text, lineHeight: 1.5 }}>
                      {s.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div
            className="font-sans"
            style={{ marginTop: 24, fontSize: 14, color: C.muted, textAlign: "center" }}
          >
            ✓ Geen kosten &nbsp;—&nbsp; ✓ Geen verplichtingen &nbsp;—&nbsp; ✓ Lokale adviseur
          </div>
        </div>
      </section>

      {/* 2. WAT IS NIJ BEGUN */}
      <section style={{ backgroundColor: C.white }} className="py-16 md:py-24">
        <div className="container-content max-w-4xl mx-auto">
          <SectionEyebrow icon={BookOpen}>Achtergrond</SectionEyebrow>
          <H2>Wat is de Isolatieaanpak Nij Begun?</H2>
          <Para>
            Nij Begun is Gronings voor "nieuw begin". Het is de manier waarop de overheid bewoners in Groningen en Noord-Drenthe compenseert voor de schade van de gaswinning. Onderdeel van dit pakket is <strong>Maatregel 29</strong>: een ruimhartige subsidie om je woning te isoleren en ventileren.
          </Para>
          <Para>
            Voor de hele aanpak staat <strong>€1,65 miljard</strong> klaar. De regeling loopt tot <strong>3 juni 2035</strong>, dus je hebt ruim de tijd.
          </Para>
          <div
            className="flex items-start gap-3 mt-6"
            style={{
              backgroundColor: C.mintSoft,
              borderLeft: `4px solid ${C.mint}`,
              padding: "20px 24px",
              borderRadius: 12,
            }}
          >
            <Lightbulb size={22} color={C.mint} className="shrink-0 mt-0.5" aria-hidden="true" />
            <p className="font-sans" style={{ fontSize: 16, lineHeight: 1.6, color: C.text, margin: 0 }}>
              <strong>Goed om te weten:</strong> anders dan bij andere subsidies bepaalt Nij Begun het bedrag op basis van een vaste prijslijst (de maatregelencatalogus). Je hoeft dus niet te onderhandelen over offertes — de prijzen zijn marktconform vastgesteld.
            </p>
          </div>
        </div>
      </section>

      {/* 3. SUBSIDIEGEBIED */}
      <section style={{ backgroundColor: C.bg }} className="py-16 md:py-24">
        <div className="container-content">
          <div className="max-w-4xl mx-auto">
            <SectionEyebrow icon={MapPin}>Subsidiegebied</SectionEyebrow>
            <H2>Komt jouw woning in aanmerking?</H2>
            <Para>
              De subsidie geldt voor woningeigenaren in <strong>de hele provincie Groningen</strong> en in <strong>drie Drentse gemeenten</strong>: Aa en Hunze, Noordenveld en Tynaarlo. Hieronder zie je per gemeente of jouw woning erbij hoort.
            </Para>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10 max-w-5xl mx-auto">
            <div style={{ backgroundColor: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: 28 }}>
              <Building2 size={24} color={C.mint} aria-hidden="true" />
              <h3 className="font-display" style={{ fontSize: 20, fontWeight: 600, color: C.blue, marginTop: 12, marginBottom: 16 }}>
                Provincie Groningen — alle 10 gemeenten
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
                {[
                  "Eemsdelta",
                  "Groningen",
                  "Het Hogeland",
                  "Midden-Groningen",
                  "Oldambt",
                  "Pekela",
                  "Stadskanaal",
                  "Veendam",
                  "Westerkwartier",
                  "Westerwolde",
                ].map((g) => (
                  <CheckItem key={g}>{g}</CheckItem>
                ))}
              </ul>
            </div>
            <div style={{ backgroundColor: C.white, borderRadius: 16, border: `1px solid ${C.border}`, padding: 28 }}>
              <Trees size={24} color={C.mint} aria-hidden="true" />
              <h3 className="font-display" style={{ fontSize: 20, fontWeight: 600, color: C.blue, marginTop: 12, marginBottom: 16 }}>
                Noord-Drenthe — drie gemeenten
              </h3>
              <ul>
                {["Aa en Hunze", "Noordenveld", "Tynaarlo"].map((g) => (
                  <CheckItem key={g}>{g}</CheckItem>
                ))}
              </ul>
              <div
                className="mt-6 flex items-start gap-2"
                style={{ fontSize: 14, color: C.muted, lineHeight: 1.5 }}
              >
                <AlertCircle size={18} color={C.amberLeft} className="shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  Andere Drentse gemeenten (Assen, Emmen, Coevorden, etc.) vallen NIET onder Nij Begun. Voor hen gelden andere subsidies.
                </span>
              </div>
            </div>
          </div>

          <div
            className="mt-10 max-w-5xl mx-auto"
            style={{
              backgroundColor: C.mintSoft,
              borderRadius: 16,
              padding: "28px 32px",
              border: `1px solid ${C.mintBorder}`,
            }}
          >
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex items-start gap-4 flex-1">
                <Search size={28} color={C.mint} className="shrink-0 mt-1" aria-hidden="true" />
                <div>
                  <h3 className="font-display" style={{ fontSize: 20, fontWeight: 600, color: C.blue, marginBottom: 6 }}>
                    Niet zeker of jouw postcode al open is?
                  </h3>
                  <p className="font-sans" style={{ fontSize: 15, color: C.text, lineHeight: 1.6, margin: 0 }}>
                    De subsidie ging stap voor stap open per postcode. Sinds eind augustus 2026 kun je in alle postcodes aanvragen. Even checken kan via de officiële postcodechecker.
                  </p>
                </div>
              </div>
              <a
                href="https://isolatie.nijbegun.nl"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center font-sans shrink-0"
                style={{
                  border: `2px solid ${C.blue}`,
                  color: C.blue,
                  padding: "12px 22px",
                  borderRadius: 10,
                  fontWeight: 600,
                  fontSize: 15,
                  backgroundColor: "transparent",
                }}
              >
                Open postcodechecker
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 4. BEDRAGEN */}
      <section id="bedragen" style={{ backgroundColor: C.white }} className="py-16 md:py-24">
        <div className="container-content">
          <div className="max-w-4xl mx-auto">
            <SectionEyebrow icon={Euro}>Bedragen</SectionEyebrow>
            <H2>Hoeveel subsidie krijg je precies?</H2>
            <Para>
              Het bedrag dat je krijgt hangt af van <strong>waar precies in het gebied</strong> je woont en van <strong>je inkomen</strong>. Er zijn twee categorieën — en die maken een groot verschil.
            </Para>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-10 items-start max-w-6xl mx-auto">
            <div>
              <IllustrationFrame
                src={imgKaart}
                alt="Kaart van Groningen en Noord-Drenthe met aanduiding van het 100%-versterkingsgebied en het 50%-gebied"
              />
              <p
                className="font-sans"
                style={{ marginTop: 10, fontSize: 13, color: C.muted, fontStyle: "italic", textAlign: "center" }}
              >
                Bron: officiële Nij Begun-illustratie
              </p>
            </div>

            <div className="flex flex-col gap-5">
              {/* 50% card */}
              <div style={{ backgroundColor: "#F9FAFB", borderRadius: 16, border: `1px solid ${C.border}`, padding: 28 }}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-display" style={{ fontSize: 44, fontWeight: 700, color: C.blue, lineHeight: 1 }}>
                      50%
                    </div>
                    <div className="font-sans mt-1" style={{ fontSize: 15, color: C.muted }}>
                      tot <strong>€20.000</strong> per woning
                    </div>
                  </div>
                  <User size={28} color={C.muted} aria-hidden="true" />
                </div>
                <div className="font-sans mt-5" style={{ fontSize: 14, fontWeight: 600, color: C.blue, marginBottom: 6 }}>
                  Voor wie?
                </div>
                <ul>
                  <CheckItem>Alle woningeigenaren in het Nij Begun-gebied</CheckItem>
                  <CheckItem>Buiten het versterkingsgebied</CheckItem>
                  <CheckItem>Met een inkomen boven 140% sociaal minimum</CheckItem>
                </ul>
              </div>

              {/* 100% card */}
              <div
                style={{
                  backgroundColor: C.white,
                  borderRadius: 16,
                  border: `2px solid ${C.mint}`,
                  padding: 28,
                  boxShadow: "0 6px 24px rgba(16, 185, 129, 0.12)",
                  position: "relative",
                }}
              >
                <span
                  className="font-sans"
                  style={{
                    position: "absolute",
                    top: -12,
                    left: 24,
                    backgroundColor: C.mint,
                    color: "#fff",
                    padding: "4px 12px",
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                  }}
                >
                  MEEST GUNSTIG
                </span>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-display" style={{ fontSize: 44, fontWeight: 700, color: C.mint, lineHeight: 1 }}>
                      100%
                    </div>
                    <div className="font-sans mt-1" style={{ fontSize: 15, color: C.muted }}>
                      tot <strong>€40.000</strong> per woning + <strong>€1.000</strong> advies-/afwerktegemoetkoming
                    </div>
                  </div>
                  <Star size={28} color={C.mint} aria-hidden="true" />
                </div>
                <div className="font-sans mt-5" style={{ fontSize: 14, fontWeight: 600, color: C.blue, marginBottom: 6 }}>
                  Voor wie?
                </div>
                <ul>
                  <CheckItem>Bewoners in het versterkingsgebied (NCG)</CheckItem>
                  <CheckItem>Bewoners in het versterkingsprogramma</CheckItem>
                  <CheckItem>
                    Inkomen onder 140% sociaal minimum (alleenstaand {INKOMEN_ALLEEN} / samen {INKOMEN_SAMEN} in {PEILJAAR})
                  </CheckItem>
                  <CheckItem>VvE's en kleine verhuurders in versterkingsgebied</CheckItem>
                </ul>
              </div>
            </div>
          </div>

          <div
            className="mt-10 max-w-6xl mx-auto"
            style={{
              backgroundColor: "#F0F6FF",
              borderLeft: `4px solid ${C.blue}`,
              padding: "20px 24px",
              borderRadius: 12,
            }}
          >
            <p className="font-sans" style={{ fontSize: 16, lineHeight: 1.6, color: C.text, margin: 0 }}>
              💡 <strong>Niet zeker in welke categorie je valt?</strong> Dat is precies waar onze intake voor is. Wij checken voor je of je woning in het versterkingsgebied ligt en of je inkomen onder de grens valt. Dat scheelt vaak duizenden euro's.
            </p>
          </div>

          <div className="mt-12 max-w-4xl mx-auto">
            <h3 className="font-display" style={{ fontSize: 22, fontWeight: 600, color: C.blue, marginBottom: 10 }}>
              En triple glas dan?
            </h3>
            <p className="font-sans" style={{ fontSize: 16, lineHeight: 1.7, color: C.text }}>
              Voor <strong>triple glas met nieuwe kozijnen</strong> geldt een aparte regeling: <strong>30% subsidie</strong>, los van het €20.000/€40.000-plafond. Mits het glas Ug ≤ 0,7 W/m²K is en het kozijn Uf ≤ 1,5 W/m²K. Je intake-adviseur rekent het voor je uit.
            </p>
          </div>
        </div>
      </section>

      {/* 5. WAT WORDT VERGOED */}
      <section style={{ backgroundColor: C.bg }} className="py-16 md:py-24">
        <div className="container-content">
          <div className="max-w-4xl mx-auto">
            <SectionEyebrow icon={Wrench}>Vergoede maatregelen</SectionEyebrow>
            <H2>Welke isolatie- en ventilatiemaatregelen worden vergoed?</H2>
            <Para>
              Nij Begun vergoedt vrijwel alle gangbare isolatie- en ventilatiemaatregelen. De vier belangrijkste zie je hieronder, met daaronder de volledige lijst.
            </Para>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-10 items-center max-w-6xl mx-auto">
            <IllustrationFrame
              src={imgHuis}
              alt="Schematische tekening van een huis met de vier hoofd-isolatiemaatregelen: spouwmuurisolatie, dak- en vloerisolatie, HR++ glas en ventilatie"
            />
            <div className="space-y-5">
              {[
                ["Spouwmuurisolatie", "Isoleren van bestaande spouwmuren. De goedkoopste maatregel met direct effect."],
                ["Dak- en vloerisolatie", "Voorkomt dat warmte naar boven en koude van onder doorslaat."],
                ["HR++ glas", "Vervangt enkel of dubbel glas door isolerend glas."],
                ["Ventilatie", "Verplicht na isolatie, voorkomt schimmel en houdt lucht gezond."],
              ].map(([t, b]) => (
                <div key={t}>
                  <h3 className="font-display" style={{ fontSize: 18, fontWeight: 600, color: C.blue, marginBottom: 4 }}>
                    {t}
                  </h3>
                  <p className="font-sans" style={{ fontSize: 15, color: C.text, lineHeight: 1.6, margin: 0 }}>
                    {b}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-14 max-w-6xl mx-auto">
            <h3 className="font-display" style={{ fontSize: 22, fontWeight: 600, color: C.blue, marginBottom: 16 }}>
              Volledige lijst van vergoede maatregelen
            </h3>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
              {[
                "Spouwmuurisolatie",
                "Gevelisolatie (binnen of buiten)",
                "Dakisolatie (hellend en plat)",
                "Zoldervloerisolatie",
                "Vloerisolatie",
                "Bodemisolatie",
                "HR++ glas of vacuümglas",
                "Triple glas + nieuwe kozijnen (30%-regeling)",
                "Isolerende deuren of kozijnpanelen",
                "Ventilatieroosters, mechanische ventilatie (C+)",
                "Balansventilatie (D)",
                "Diervriendelijk isoleren (verplicht voor vleermuizen, mussen, gierzwaluwen)",
              ].map((m) => (
                <CheckItem key={m}>{m}</CheckItem>
              ))}
            </ul>

            <div
              className="mt-10"
              style={{
                backgroundColor: "#FFF7ED",
                borderLeft: `4px solid ${C.amberLeft}`,
                borderRadius: 12,
                padding: "20px 24px",
              }}
            >
              <div className="flex items-start gap-3">
                <AlertCircle size={22} color={C.amberLeft} className="shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <div className="font-sans" style={{ fontWeight: 700, color: C.text, marginBottom: 8 }}>
                    Wat valt er NIET onder Nij Begun:
                  </div>
                  <ul className="font-sans" style={{ fontSize: 15, color: C.text, lineHeight: 1.7, margin: 0, paddingLeft: 18, listStyle: "disc" }}>
                    <li>Zonnepanelen (wel via 0% btw + ISDE)</li>
                    <li>Warmtepomp en zonneboiler (wel via ISDE)</li>
                    <li>Schilderwerk, behang, esthetische afwerking</li>
                    <li>Een nieuwe aanbouw of extra verdieping</li>
                    <li>Sloop-nieuwbouw na 1 juli 2012</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. STAPPENPLAN */}
      <section style={{ backgroundColor: C.white }} className="py-16 md:py-24">
        <div className="container-content">
          <div className="max-w-4xl mx-auto">
            <SectionEyebrow icon={ListChecks}>Stappenplan</SectionEyebrow>
            <H2>Zo werkt het — van intake tot uitbetaling</H2>
            <Para>Het proces voelt overzichtelijk als je weet wat er staat te gebeuren. Zo ziet het eruit:</Para>
          </div>

          <div className="mt-12 max-w-6xl mx-auto flex flex-col gap-16 md:gap-20">
            <Step
              num="01"
              title="Gratis intake"
              text="Wij komen langs voor een vrijblijvend intakegesprek. We bespreken jouw woning, doel en mogelijkheden. Geen kosten, geen verplichtingen."
              iconNode={<IconCircle icon={Phone} />}
              reverse={false}
            />
            <Step
              num="02"
              title="Postcode- en inkomenscheck"
              text="We controleren of je in het versterkingsgebied valt en of je voor 100% in aanmerking komt. Een verschil van duizenden euro's hangt hieraan vast."
              imageSrc={imgAdviseur}
              imageAlt="Adviseur bekijkt woning en stelt isolatieplan op"
              imageMaxH={480}
              reverse={true}
            />
            <Step
              num="03"
              title="Isolatieplan opstellen"
              text="Voor maatregelen boven €10.000 maakt een Nij Begun-isolatieadviseur een gratis isolatieplan op maat. Daarin staat welke maatregelen jouw woning nodig heeft om aan de standaard te voldoen — én wat het kost."
              imageSrc={imgIsolatieplan}
              imageAlt="Isolatieplan met kostenbreakdown per maatregel: dak isoleren, HR++ glas, ventilatiesysteem, spouwmuurisolatie"
              imageMaxH={480}
              reverse={false}
            />
            <Step
              num="04"
              title="Aangesloten bedrijven"
              text={
                <>
                  We halen offertes op bij bedrijven die zijn aangesloten bij het <strong>Bedrijvennetwerk Nij Begun</strong>. Niet-aangesloten bedrijven werken vaak goedkoper, maar dan vervalt je subsidie volledig. Wij werken alléén met aangesloten partners.
                </>
              }
              imageSrc={imgSubsidieBedrijf}
              imageAlt="Schema toont dat alleen aangesloten Nij Begun-bedrijven subsidie krijgen — twee van de drie uitvoerders zijn aangevinkt"
              reverse={true}
            />
            <Step
              num="05"
              title="Aanvraag indienen"
              text={
                <>
                  We dienen jouw aanvraag in bij SNN (Samenwerkingsverband Noord-Nederland). De beslistermijn is <strong>maximaal 13 weken</strong>, met een mogelijke verlenging van 8 weken.
                </>
              }
              imageSrc={imgAanvraagAkkoord}
              imageAlt='Laptop toont melding "aanvraag akkoord!"'
              reverse={false}
            />
            <Step
              num="06"
              title="Werkzaamheden uitvoeren"
              text={
                <>
                  Na toekenning heb je <strong>2 jaar de tijd</strong> om de isolatie te laten uitvoeren door een aangesloten partner. Dat geeft ruimte om dingen op het juiste moment te plannen.
                </>
              }
              imageSrc={imgTweeJaar}
              imageAlt="Na goedkeuring heb je 2 jaar de tijd om aangesloten Nij Begun-uitvoerders het werk te laten doen"
              reverse={true}
            />
            <Step
              num="07"
              title="Subsidie ontvangen"
              text="SNN keert het bedrag uit op basis van de eindfactuur. Klaar."
              iconNode={<IconCircle icon={CheckCircle2} />}
              reverse={false}
            />
          </div>

          <p
            className="font-sans max-w-4xl mx-auto mt-12"
            style={{ fontSize: 14, fontStyle: "italic", color: C.muted, lineHeight: 1.6 }}
          >
            💬 Tip: alleen werk uitgevoerd door een aangesloten Nij Begun-bedrijf komt in aanmerking voor subsidie. Wij werken alleen met aangesloten partners — dat scheelt teleurstelling achteraf.
          </p>
        </div>
      </section>

      {/* 7. VOORBEELDCASE */}
      <section style={{ backgroundColor: C.bg }} className="py-16 md:py-24">
        <div className="container-content max-w-4xl mx-auto">
          <SectionEyebrow icon={MessageCircle}>Voorbeeld</SectionEyebrow>
          <H2>Een voorbeeld uit de praktijk</H2>
          <div
            style={{
              backgroundColor: "rgba(236, 253, 245, 0.6)",
              borderRadius: 20,
              padding: "32px 32px",
              border: `1px solid ${C.mintBorder}`,
            }}
            className="md:p-12"
          >
            <Para>
              Neem een rijtjeshuis uit 1972 in Appingedam — gemeente Eemsdelta, postcode in het versterkingsgebied. Energielabel E. De eigenaar wil spouwmuur, bodem, dak, HR++ glas én mechanische ventilatie laten doen.
            </Para>
            <p className="font-sans" style={{ fontSize: 18, fontWeight: 600, color: C.blue, marginBottom: 16 }}>
              Totale kosten: ongeveer <strong>€18.500</strong>.
            </p>
            <div className="font-sans" style={{ fontWeight: 600, color: C.blue, marginBottom: 8, fontSize: 16 }}>
              Wat krijg je?
            </div>
            <ul className="mb-4">
              <CheckItem>
                <strong>Subsidie (100%):</strong> €18.500
              </CheckItem>
              <CheckItem>
                <strong>Aanvullende advies-/afwerkbijdrage:</strong> €1.000
              </CheckItem>
              <CheckItem>
                <strong>Verwachte besparing op gas:</strong> van ~1.700 m³ naar ~900 m³ per jaar
              </CheckItem>
              <CheckItem>
                <strong>Eigen bijdrage:</strong> €0
              </CheckItem>
            </ul>
            <p className="font-sans" style={{ fontSize: 15, color: C.muted, lineHeight: 1.6, margin: 0 }}>
              Deze case is mogelijk omdat het huis in het versterkingsgebied ligt — buiten dat gebied zou de subsidie 50% (max €20.000) zijn, dus nog steeds een fors bedrag.
            </p>
          </div>
        </div>
      </section>

      {/* 8. FAQ */}
      <section style={{ backgroundColor: C.white }} className="py-16 md:py-24">
        <div className="container-content max-w-3xl mx-auto">
          <SectionEyebrow icon={HelpCircle}>FAQ</SectionEyebrow>
          <H2>Veelgestelde vragen</H2>

          <div className="mt-8 flex flex-col gap-3">
            {faqs.map((f, i) => {
              const open = openFaq === i;
              return (
                <div
                  key={i}
                  style={{
                    border: `1px solid ${C.border}`,
                    borderRadius: 12,
                    backgroundColor: C.white,
                    overflow: "hidden",
                  }}
                >
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={`faq-panel-${i}`}
                    id={`faq-trigger-${i}`}
                    onClick={() => setOpenFaq(open ? null : i)}
                    className="w-full text-left flex items-center justify-between gap-4 transition-colors"
                    style={{
                      padding: "18px 20px",
                      backgroundColor: open ? "#F9FAFB" : "transparent",
                      cursor: "pointer",
                      minHeight: 56,
                    }}
                  >
                    <span className="font-sans" style={{ fontSize: 16, fontWeight: 600, color: C.blue, lineHeight: 1.4 }}>
                      {f.q}
                    </span>
                    <ChevronDown
                      size={20}
                      color={C.mint}
                      aria-hidden="true"
                      style={{ transition: "transform 200ms ease", transform: open ? "rotate(180deg)" : "rotate(0)" }}
                    />
                  </button>
                  {open && (
                    <div
                      id={`faq-panel-${i}`}
                      role="region"
                      aria-labelledby={`faq-trigger-${i}`}
                      className="font-sans"
                      style={{
                        padding: "0 20px 20px",
                        fontSize: 15,
                        lineHeight: 1.7,
                        color: C.text,
                      }}
                    >
                      {f.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. CTA + FORM */}
      <section
        id="contactformulier"
        style={{ backgroundColor: C.blue }}
        className="py-16 md:py-24"
      >
        <div className="container-content">
          <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-10 lg:gap-16 items-start">
            <div>
              <h2
                className="font-display"
                style={{
                  fontWeight: 700,
                  fontSize: "clamp(28px, 4vw, 40px)",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.15,
                  color: "#fff",
                  marginBottom: 16,
                }}
              >
                Klaar om jouw subsidie aan te vragen?
              </h2>
              <p className="font-sans" style={{ fontSize: 18, color: "rgba(255,255,255,0.85)", lineHeight: 1.6, marginBottom: 24, maxWidth: 560 }}>
                Plan een vrijblijvende intake. We komen langs, checken jouw situatie en rekenen precies uit wat je krijgt. Geen kosten, geen verplichtingen.
              </p>
              <ul className="space-y-3">
                {[
                  "Lokale adviseur uit Groningen of Drenthe",
                  "Persoonlijk huisbezoek binnen 1 week",
                  "Wij werken alleen met aangesloten Nij Begun-bedrijven",
                ].map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <Check size={20} color={C.mint} className="shrink-0 mt-1" aria-hidden="true" />
                    <span className="font-sans" style={{ fontSize: 16, color: "rgba(255,255,255,0.92)", lineHeight: 1.5 }}>
                      {b}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div
              style={{
                backgroundColor: C.white,
                borderRadius: 20,
                boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
                padding: 28,
              }}
            >
              {submitted ? (
                <div className="text-center py-6">
                  <div
                    className="mx-auto mb-4 flex items-center justify-center"
                    style={{ width: 64, height: 64, borderRadius: 999, backgroundColor: C.mintSoft }}
                  >
                    <CheckCircle2 size={36} color={C.mint} />
                  </div>
                  <h3 className="font-display" style={{ fontSize: 20, fontWeight: 600, color: C.blue, marginBottom: 8 }}>
                    Bedankt! We nemen binnen 1 werkdag contact op.
                  </h3>
                </div>
              ) : (
                <>
                  <h3 className="font-display" style={{ fontSize: 22, fontWeight: 600, color: C.blue, marginBottom: 16 }}>
                    Plan jouw gratis intake
                  </h3>
                  <form onSubmit={handleSubmit} noValidate={false}>
                    <div className="flex flex-col gap-3">
                      <input name="naam" required type="text" placeholder="Naam" className={inputClass} aria-label="Naam" />
                      <input name="email" required type="email" placeholder="E-mailadres" className={inputClass} aria-label="E-mailadres" />
                      <input name="telefoon" required type="tel" placeholder="Telefoonnummer" className={inputClass} aria-label="Telefoonnummer" />
                      <input
                        name="postcode"
                        required
                        type="text"
                        placeholder="Postcode (bv. 9711AA)"
                        pattern="^[1-9][0-9]{3}\s?[A-Za-z]{2}$"
                        title="Geldig NL-postcode formaat, bv. 9711AA"
                        className={inputClass}
                        aria-label="Postcode"
                      />
                      <input name="adres" required type="text" placeholder="Adres" className={inputClass} aria-label="Adres" />
                      <input
                        name="bouwjaar"
                        type="number"
                        min={1800}
                        max={2026}
                        placeholder="Bouwjaar van je woning (optioneel)"
                        className={inputClass}
                        aria-label="Bouwjaar"
                      />
                      <textarea
                        name="toelichting"
                        placeholder="Bijv: ik wil dak en vloer laten isoleren"
                        className={inputClass}
                        style={{ minHeight: 100, resize: "vertical" }}
                        aria-label="Korte toelichting"
                      />
                      <label className="flex items-start gap-2 mt-1">
                        <input type="checkbox" required className="mt-1" />
                        <span className="font-sans" style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>
                          Ik ga akkoord met het{" "}
                          <a href="/privacy" style={{ color: C.mint, textDecoration: "underline" }}>
                            privacybeleid
                          </a>
                          .
                        </span>
                      </label>
                      <button
                        type="submit"
                        className="w-full font-sans transition-colors"
                        style={{
                          marginTop: 8,
                          backgroundColor: C.mint,
                          color: "#fff",
                          padding: "14px 24px",
                          borderRadius: 10,
                          fontSize: 16,
                          fontWeight: 600,
                          cursor: "pointer",
                          minHeight: 48,
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#0EA371")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = C.mint)}
                      >
                        Verstuur intake-aanvraag
                      </button>
                      <div className="font-sans text-center" style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>
                        Wij reageren binnen 1 werkdag.
                      </div>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 10. ANDERE SUBSIDIES */}
      <section style={{ backgroundColor: C.bg }} className="py-14 md:py-20">
        <div className="container-content max-w-5xl mx-auto">
          <h3 className="font-display" style={{ fontSize: 22, fontWeight: 600, color: C.blue, marginBottom: 20 }}>
            Andere subsidies die misschien interessant zijn
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <a
              href="/subsidies/landelijk"
              className="block transition-transform hover:-translate-y-0.5"
              style={{
                backgroundColor: C.white,
                border: `1px solid ${C.border}`,
                borderRadius: 16,
                padding: 24,
                textDecoration: "none",
              }}
            >
              <Globe size={24} color={C.mint} aria-hidden="true" />
              <div className="font-display mt-3" style={{ fontSize: 18, fontWeight: 600, color: C.blue, marginBottom: 6 }}>
                Landelijke subsidies (ISDE)
              </div>
              <p className="font-sans" style={{ fontSize: 15, color: C.text, lineHeight: 1.6, margin: 0 }}>
                Voor warmtepomp, zonneboiler en isolatie buiten het Nij Begun-gebied.
              </p>
              <div className="font-sans mt-4" style={{ fontSize: 14, color: C.mint, fontWeight: 600 }}>
                Bekijk landelijke subsidies →
              </div>
            </a>
            <a
              href="/subsidies/regionaal"
              className="block transition-transform hover:-translate-y-0.5"
              style={{
                backgroundColor: C.white,
                border: `1px solid ${C.border}`,
                borderRadius: 16,
                padding: 24,
                textDecoration: "none",
              }}
            >
              <MapPin size={24} color={C.mint} aria-hidden="true" />
              <div className="font-display mt-3" style={{ fontSize: 18, fontWeight: 600, color: C.blue, marginBottom: 6 }}>
                Regionale en gemeentelijke subsidies
              </div>
              <p className="font-sans" style={{ fontSize: 15, color: C.text, lineHeight: 1.6, margin: 0 }}>
                Aanvullende regelingen per gemeente, vaak stapelbaar met ISDE.
              </p>
              <div className="font-sans mt-4" style={{ fontSize: 14, color: C.mint, fontWeight: 600 }}>
                Bekijk regionale subsidies →
              </div>
            </a>
          </div>

          <p className="font-sans text-center mt-12" style={{ fontSize: 13, color: C.muted }}>
            Laatst bijgewerkt: {LAATST_BIJGEWERKT}
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

// --- helper components for the stappenplan ---

const IconCircle = ({ icon: Icon }: { icon: any }) => (
  <span
    className="inline-flex items-center justify-center"
    style={{
      width: 160,
      height: 160,
      borderRadius: 999,
      backgroundColor: "#ECFDF5",
      color: "#10B981",
      margin: "0 auto",
    }}
    aria-hidden="true"
  >
    <Icon size={64} />
  </span>
);

const Step = ({
  num,
  title,
  text,
  iconNode,
  imageSrc,
  imageAlt,
  imageMaxH,
  reverse,
}: {
  num: string;
  title: string;
  text: React.ReactNode;
  iconNode?: React.ReactNode;
  imageSrc?: string;
  imageAlt?: string;
  imageMaxH?: number;
  reverse: boolean;
}) => {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14 items-center ${
        reverse ? "md:[&>*:first-child]:order-2" : ""
      }`}
    >
      {imageSrc ? (
        <div>
          <IllustrationFrame src={imageSrc} alt={imageAlt || ""} maxH={imageMaxH} />
        </div>
      ) : (
        <div className="flex justify-center">{iconNode}</div>
      )}
      <div>
        <div
          className="font-display"
          style={{ fontSize: 56, fontWeight: 700, color: "#10B981", lineHeight: 1, marginBottom: 8 }}
        >
          {num}
        </div>
        <h3 className="font-display" style={{ fontSize: 26, fontWeight: 600, color: "#152C4E", marginBottom: 12 }}>
          {title}
        </h3>
        <p className="font-sans" style={{ fontSize: 17, lineHeight: 1.7, color: "#1F2937", margin: 0 }}>
          {text}
        </p>
      </div>
    </div>
  );
};

export default SubsidiesNijBegun;
