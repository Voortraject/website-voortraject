import { useEffect, useRef, useState } from "react";
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
  Hammer,
  LifeBuoy,
  FileCheck,
  Scale,
  Lightbulb,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import logoVoortrajectBlauw from "@/assets/logo-voortraject-blauw.png";
import logoNijBegun from "@/assets/logo-nij-begun.png";

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
const imgAanvraag = `${IMG}/Aanvraag_akkoord_afbeelding.webp`;

const faqs: { q: string; a: string }[] = [
  {
    q: "Tot wanneer kan ik subsidie aanvragen?",
    a: "Tot 3 juni 2035. Sinds eind augustus 2026 zijn alle postcodes geopend.",
  },
  {
    q: "Krijg ik 50% of 100% subsidie?",
    a: "Dat hangt af van of je in het versterkingsgebied woont én van je inkomen. Tijdens het huisbezoek checken we beide. De €1.000 advies- en afwerkbijdrage is er trouwens alleen voor de 100%-categorie.",
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
    a: "Niets. Ons huisbezoek en de begeleiding zijn gratis voor bewoners.",
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

const MeasureLi = ({ label, info }: { label: string; info: string }) => {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);
  return (
    <li className="flex items-start gap-2 py-1">
      <Check size={18} style={{ color: C.accent, marginTop: 3, flexShrink: 0 }} aria-hidden />
      <span style={{ fontSize: 15, color: C.text, lineHeight: 1.5 }} className="flex-1">
        {label}{" "}
        <span ref={wrapRef} style={{ position: "relative", display: "inline-block" }}>
          <button
            type="button"
            aria-label={`Meer informatie over ${label}`}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            onBlur={() => setOpen(false)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: C.accent,
              padding: 0,
              verticalAlign: "middle",
            }}
          >
            <Info size={16} aria-hidden />
          </button>
          {open && (
            <span
              role="tooltip"
              style={{
                position: "absolute",
                bottom: "calc(100% + 8px)",
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: "#FFFFFF",
                border: `1px solid ${C.accent}`,
                borderRadius: "0.5rem",
                padding: "12px 14px",
                width: "max-content",
                maxWidth: 320,
                fontSize: 13,
                color: C.text,
                lineHeight: 1.5,
                boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
                zIndex: 30,
                textAlign: "left",
                whiteSpace: "normal",
              }}
            >
              {info}
            </span>
          )}
        </span>
      </span>
    </li>
  );
};

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
      "Tot €40.000 subsidie voor isolatie via Nij Begun (Maatregel 29). Wij regelen het hele traject voor bewoners in Groningen en Noord-Drenthe."
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

  // Section 6: scroll progress indicator
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    const visible = new Set<number>();
    stepRefs.current.forEach((el, i) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) visible.add(i);
            else visible.delete(i);
          });
          if (visible.size > 0) {
            setActiveStep(Math.min(...Array.from(visible)));
          }
        },
        { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: C.bg, color: C.text }}>
      <Header />

      {/* 1. HERO */}
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
                Tot <Gold>€40.000 subsidie</Gold> voor het isoleren van jouw huis
              </h1>
              <p style={{ fontSize: 18, lineHeight: 1.6, color: C.muted, marginBottom: 28, maxWidth: 620 }}>
                Woon je in Groningen of Noord-Drenthe? Dan kun je je woning gratis of voor de helft laten isoleren via Nij Begun. Wij regelen het hele traject voor je, van advies tot oplevering.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a href="/contact" style={goldBtn}>
                  Plan een gratis huisbezoek
                </a>
                <a href="#bedragen" style={outlineBtn}>
                  Bekijk wat jij krijgt
                </a>
              </div>
            </div>

            <div>
              {/* Partnership-marker: twee logo's */}
              <div
                className="flex items-center justify-center"
                style={{ padding: "16px 24px", marginBottom: 16 }}
              >
                <img
                  src={logoVoortrajectBlauw}
                  alt="Voortraject"
                  style={{ maxHeight: 40, width: "auto", objectFit: "contain" }}
                  className="max-h-8 md:max-h-10"
                />
                <span
                  aria-hidden
                  style={{
                    display: "inline-block",
                    width: 1,
                    height: 40,
                    backgroundColor: C.primary,
                    opacity: 0.25,
                    margin: "0 20px",
                  }}
                  className="h-8 md:h-10"
                />
                <img
                  src={logoNijBegun}
                  alt="Nij Begun Groningen Noord-Drenthe"
                  style={{ maxHeight: 40, width: "auto", objectFit: "contain" }}
                  className="max-h-8 md:max-h-10"
                />
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
            <div>
              <Illustration src={imgKaart} alt="Kaart van Groningen met 50% en 100% subsidiegebieden" />
              <div
                className="flex items-start gap-2 mt-4"
                style={{ fontSize: 14, color: C.muted }}
              >
                <Info size={16} style={{ color: C.accent, flexShrink: 0, marginTop: 2 }} aria-hidden />
                <span>Niet zeker in welke categorie je valt? Wij checken dat tijdens het huisbezoek. Dat scheelt vaak duizenden euro's.</span>
              </div>
            </div>

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
              <div style={{ ...cardBase, padding: 28 }}>
                <div className="flex items-baseline gap-3">
                  <span style={{ fontSize: 44, fontWeight: 800, color: C.primary, letterSpacing: "-0.02em" }}>100%</span>
                  <span style={{ fontSize: 15, color: C.muted }}>tot <strong style={{ color: C.text }}>€40.000</strong> per woning, plus €1.000 advies- en afwerkbijdrage</span>
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
                  <MeasureLi
                    label="Spouwmuurisolatie"
                    info="Voor woningen met spouwmuren (bouwjaar na 1920) is dit vaak de eerste en meest gebruikelijke stap. Goed rendement voor relatief lage kosten."
                  />
                  <MeasureLi
                    label="Dak- en vloerisolatie"
                    info="Dakisolatie levert vaak het hoogste rendement op, omdat warmte vooral via het dak ontsnapt. Vloerisolatie is een logische volgende stap."
                  />
                  <MeasureLi
                    label="Gevelisolatie (binnen of buiten)"
                    info="Voor woningen zonder spouwmuren. Buitenisolatie is duurder maar effectiever, binnenisolatie verkleint de leefruimte iets."
                  />
                  <MeasureLi
                    label="HR++ glas of vacuümglas"
                    info="Vervangt enkel of dubbel glas. Vacuümglas is dunner en past vaak in bestaande kozijnen."
                  />
                  <MeasureLi
                    label="Triple glas met nieuwe kozijnen (30% subsidie)"
                    info="De hoogste isolatiewaarde voor ramen. Hier geldt een aparte 30%-regeling, los van het €20.000 of €40.000-plafond."
                  />
                  <MeasureLi
                    label="Mechanische ventilatie of balansventilatie"
                    info="Na goede isolatie verplicht. Voorkomt vocht en schimmel, houdt de lucht gezond."
                  />
                  <MeasureLi
                    label="Diervriendelijk isoleren"
                    info="Wettelijk verplicht als er vleermuizen, mussen of gierzwaluwen in of aan je woning leven."
                  />
                </ul>
              </div>

              {/* Standaard voor woningisolatie callout */}
              <div
                style={{
                  backgroundColor: C.cardSoft,
                  borderLeft: `4px solid ${C.accent}`,
                  borderRadius: "0.75rem",
                  padding: "20px 22px",
                  display: "flex",
                  gap: 14,
                  alignItems: "flex-start",
                }}
              >
                <Lightbulb size={22} style={{ color: C.accent, flexShrink: 0, marginTop: 2 }} aria-hidden />
                <p style={{ fontSize: 15, color: C.text, lineHeight: 1.6, margin: 0 }}>
                  Niet alle maatregelen passen bij elke woning. Het doel van Nij Begun is jouw woning naar de Standaard voor woningisolatie te brengen. Een adviseur kijkt naar wat jouw huis écht nodig heeft. Soms wijkt dat advies af van wat je had verwacht. Vloerisolatie of nieuwe deuren zijn niet altijd de eerste stap. De adviseur is daarin eerlijk, want het doel is een warm en zuinig huis, niet zoveel mogelijk maatregelen.
                </p>
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

      {/* 6. ZO VERLOOPT JOUW TRAJECT — kaarten + verticale tijdlijn + scroll progress */}
      <section style={{ backgroundColor: C.bg }} className="py-16 md:py-20">
        <div className="container-content">
          <div className="max-w-3xl mx-auto text-center">
            <H2>
              Zo verloopt jouw <Gold>traject</Gold>
            </H2>
            <p style={{ fontSize: 17, lineHeight: 1.6, color: C.muted, marginTop: 14 }}>
              Zo werkt het bij ons. Geen telefooncentrale, geen wachtrij, geen formulieren in pdf. Wij doen het zware werk, jij houdt de regie.
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto mt-12">
            {/* Scroll progress indicator (desktop) */}
            <div
              aria-hidden="true"
              className="hidden md:flex flex-col"
              style={{
                position: "sticky",
                float: "right",
                top: 24,
                right: 0,
                marginRight: -8,
                gap: 16,
                zIndex: 10,
                width: 14,
                alignItems: "center",
              }}
            >
              {[0, 1, 2, 3, 4, 5, 6].map((i) => {
                const isActive = i === activeStep;
                return (
                  <span
                    key={i}
                    style={{
                      width: isActive ? 12 : 10,
                      height: isActive ? 12 : 10,
                      borderRadius: 9999,
                      backgroundColor: isActive ? C.accent : C.primary,
                      opacity: isActive ? 1 : 0.2,
                      transform: isActive ? "scale(1.2)" : "scale(1)",
                      transition: "transform 200ms ease, background-color 200ms ease, opacity 200ms ease",
                      display: "inline-block",
                    }}
                  />
                );
              })}
            </div>

            {/* Verticale tijdlijn (achter de kaarten, links) */}
            <div
              aria-hidden
              className="hidden md:block absolute"
              style={{
                left: 16,
                top: 12,
                bottom: 12,
                width: 2,
                backgroundColor: C.accent,
              }}
            />

            <ol className="flex flex-col gap-8 md:gap-12 relative">
              {[
                {
                  n: "01",
                  icon: Phone,
                  t: "Gratis huisbezoek",
                  d: "Geen onbekende callcenter-medewerker, geen wachtlijst van weken. Een lokale adviseur uit Groningen of Drenthe komt binnen een week persoonlijk bij je langs. We bespreken jouw situatie, jouw woning en wat je verwacht.",
                },
                {
                  n: "02",
                  icon: MapPinned,
                  t: "Postcode- en inkomenscheck",
                  d: "We checken jouw postcode tegen het versterkingsgebied en je inkomen tegen de 140%-grens. Daarna weet je meteen of je voor 50% of 100% in aanmerking komt. Geen gedoe met regelingen, geen onduidelijkheid.",
                },
                {
                  n: "03",
                  icon: FileText,
                  t: "Isolatieplan op maat",
                  d: "Voor maatregelen boven €10.000 maakt een Nij Begun-isolatieadviseur een gratis plan op maat. Daarin staat welke isolatie jouw woning nodig heeft om aan de standaard te voldoen, in welke volgorde, en wat het ongeveer kost.",
                },
                {
                  n: "04",
                  icon: Send,
                  t: "Wij dienen de aanvraag in",
                  d: "Geen formulieren in pdf, geen DigiD-gedoe, geen termijnen die je zelf moet bewaken. Wij dienen de aanvraag in bij SNN en houden de 13 wekentermijn voor je in de gaten. Je hoort van ons zodra er beweging is.",
                },
                {
                  n: "05",
                  icon: CheckCircle2,
                  t: "Goedkeuring",
                  d: "Aanvraag akkoord! De subsidie is toegekend. Vanaf nu heb je 2 jaar de tijd om de werkzaamheden te laten uitvoeren door een aangesloten Nij Begun-bedrijf. Wij sturen je de toekenningsbrief en bespreken de vervolgstappen.",
                  image: imgAanvraag,
                  spotlight: true,
                },
                {
                  n: "06",
                  icon: Hammer,
                  t: "Uitvoering met begeleiding",
                  d: "Wij brengen je in contact met aangesloten uitvoerders die echt bij jouw woning passen. Geen verkooppraatje, geen vooringenomen keuze. Tijdens de uitvoering blijven we beschikbaar voor vragen en bewaken we de kwaliteit en planning.",
                },
                {
                  n: "07",
                  icon: LifeBuoy,
                  t: "Natraject en nazorg",
                  d: "Na de oplevering loopt het bij ons niet op nul. We blijven beschikbaar voor vragen over onderhoud, garantie of vervolgmaatregelen (zoals een warmtepomp via ISDE). Wij blijven jouw aanspreekpunt, ook als de uitvoerder zijn werk al heeft afgeleverd.",
                },
              ].map((s, i) => {
                const isSpotlight = (s as { spotlight?: boolean }).spotlight;
                return (
                  <li
                    key={s.n}
                    ref={(el) => (stepRefs.current[i] = el)}
                    className="relative md:ml-12"
                    style={{
                      backgroundColor: C.card,
                      border: `1px solid ${C.accentSoft}66`,
                      borderLeft: isSpotlight ? `4px solid ${C.accent}` : `1px solid ${C.accentSoft}66`,
                      borderRadius: "1rem",
                      boxShadow: isSpotlight
                        ? "0 8px 28px rgba(27,46,74,0.10)"
                        : "0 1px 3px rgba(0,0,0,0.04)",
                    }}
                  >
                    {/* Tijdlijn-dot */}
                    <span
                      aria-hidden
                      className="hidden md:block absolute"
                      style={{
                        left: -36,
                        top: 28,
                        width: 12,
                        height: 12,
                        borderRadius: 9999,
                        backgroundColor: C.accent,
                      }}
                    />
                    {isSpotlight && s.image ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-center p-6 md:p-8">
                        <div>
                          <div className="flex items-center gap-3 mb-3">
                            <span
                              className="font-display"
                              style={{
                                fontSize: 56,
                                fontWeight: 800,
                                color: C.accent,
                                lineHeight: 1,
                                letterSpacing: "-0.02em",
                              }}
                            >
                              {s.n}
                            </span>
                            <span
                              className="inline-flex items-center justify-center"
                              style={{
                                width: 40,
                                height: 40,
                                borderRadius: 9999,
                                backgroundColor: C.accent,
                                color: C.primary,
                              }}
                            >
                              <s.icon size={18} aria-hidden />
                            </span>
                          </div>
                          <h3
                            className="font-display"
                            style={{
                              fontSize: 24,
                              fontWeight: 700,
                              color: C.primary,
                              letterSpacing: "-0.01em",
                              marginBottom: 8,
                            }}
                          >
                            {s.t}
                          </h3>
                          <p style={{ fontSize: 16, color: C.text, lineHeight: 1.6, margin: 0 }}>{s.d}</p>
                        </div>
                        <Illustration src={s.image} alt="Aanvraag akkoord op laptop" />
                      </div>
                    ) : (
                      <div className="p-6 md:p-8">
                        <div className="flex items-center gap-3 mb-3">
                          <span
                            className="font-display"
                            style={{
                              fontSize: 56,
                              fontWeight: 800,
                              color: C.accent,
                              lineHeight: 1,
                              letterSpacing: "-0.02em",
                            }}
                          >
                            {s.n}
                          </span>
                          <span
                            className="inline-flex items-center justify-center"
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 9999,
                              backgroundColor: C.accent,
                              color: C.primary,
                            }}
                          >
                            <s.icon size={18} aria-hidden />
                          </span>
                        </div>
                        <h3
                          className="font-display"
                          style={{
                            fontSize: 22,
                            fontWeight: 700,
                            color: C.primary,
                            letterSpacing: "-0.01em",
                            marginBottom: 8,
                          }}
                        >
                          {s.t}
                        </h3>
                        <p style={{ fontSize: 16, color: C.text, lineHeight: 1.6, margin: 0 }}>{s.d}</p>
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Mini-CTA */}
          <div
            className="max-w-4xl mx-auto mt-14 text-center"
            style={{
              backgroundColor: C.card,
              border: `1px solid ${C.accentSoft}66`,
              borderRadius: "1rem",
              padding: "40px 24px",
            }}
          >
            <h3
              className="font-display"
              style={{ fontSize: "clamp(22px, 3vw, 28px)", fontWeight: 700, color: C.primary, letterSpacing: "-0.01em" }}
            >
              Wil je sneller door zonder gedoe?
            </h3>
            <p style={{ fontSize: 15, color: C.muted, marginTop: 10, maxWidth: 520, marginLeft: "auto", marginRight: "auto", lineHeight: 1.6 }}>
              Plan een gratis huisbezoek. Een lokale adviseur uit jouw regio belt of komt langs binnen een week.
            </p>
            <a href="/contact" style={{ ...goldBtn, marginTop: 20 }}>
              Plan een huisbezoek
            </a>
          </div>
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

      {/* 8. WAAROM VOORTRAJECT */}
      <section style={{ backgroundColor: C.cardSoft }} className="py-16 md:py-20">
        <div className="container-content">
          <div className="max-w-3xl mx-auto text-center">
            <H2>
              Waarom bewoners voor Voortraject <Gold>kiezen</Gold>
            </H2>
            <p style={{ fontSize: 17, lineHeight: 1.6, color: C.muted, marginTop: 14 }}>
              Wat ons anders maakt dan een gemeenteloket of een ingehuurde callcenter-helpdesk.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10 max-w-5xl mx-auto">
            {[
              {
                icon: Home,
                t: "Persoonlijk huisbezoek",
                d: "Geen wachtrij, geen formulier-eerst. Een lokale adviseur uit jouw regio belt of komt langs binnen een week.",
              },
              {
                icon: FileCheck,
                t: "Wij regelen de papierwinkel",
                d: "Geen DigiD-gedoe, geen termijnen die je zelf moet bewaken. Wij dienen in, bewaken de procedure en houden je op de hoogte.",
              },
              {
                icon: Scale,
                t: "Onafhankelijk advies",
                d: "Wij hebben geen voorkeur voor bepaalde uitvoerders. We brengen je in contact met aangesloten Nij Begun-bedrijven die bij jouw woning passen.",
              },
              {
                icon: LifeBuoy,
                t: "Nazorg en natraject",
                d: "Na de oplevering blijven we beschikbaar. Voor garantie, onderhoud of een vervolgvraag over warmtepomp of zonnepanelen.",
              },
            ].map((s) => (
              <div key={s.t} style={{ ...cardSoftBase, padding: 28 }}>
                <span
                  className="inline-flex items-center justify-center"
                  style={{ width: 40, height: 40, borderRadius: 9999, backgroundColor: C.accent, color: C.primary }}
                >
                  <s.icon size={18} aria-hidden />
                </span>
                <h3
                  className="font-display"
                  style={{ fontSize: 18, fontWeight: 700, color: C.primary, marginTop: 14, marginBottom: 8 }}
                >
                  {s.t}
                </h3>
                <p style={{ fontSize: 15, color: C.text, lineHeight: 1.6, margin: 0 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. FOOTER-CTA */}
      <section style={{ backgroundColor: C.primary }} className="py-20">
        <div className="container-content">
          <div className="text-center mx-auto" style={{ maxWidth: 600 }}>
            <h2
              className="font-display"
              style={{
                fontWeight: 700,
                fontSize: "clamp(28px, 4vw, 40px)",
                letterSpacing: "-0.02em",
                lineHeight: 1.15,
                color: "#fff",
              }}
            >
              Ontdek welke stap voor jou <Gold>logisch</Gold> is.
            </h2>
            <p style={{ fontSize: 17, lineHeight: 1.6, marginTop: 16, color: "rgba(255,255,255,0.8)" }}>
              Plan een gratis huisbezoek. Een lokale adviseur uit Groningen of Drenthe komt persoonlijk langs binnen een week. Geen verplichtingen, geen verkooppraatje.
            </p>
            <a href="/contact" style={{ ...goldBtn, marginTop: 24 }}>
              Plan een huisbezoek
            </a>
          </div>
          <p className="text-center mt-12" style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
            Laatst bijgewerkt: {LAATST_BIJGEWERKT}
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default SubsidiesNijBegun;
