import { useEffect, useRef, useState } from "react";
import {
  MapPin,
  Layers,
  RefreshCw,
  Globe,
  Map as MapIcon,
  Building2,
  Plus,
  Equal,
  Check,
  CheckCircle2,
  Phone,
  Calendar,
  Users,
  Hammer,
  Send,
  LifeBuoy,
  ChevronDown,
  Home,
  FileCheck,
  Scale,
  Trees,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

// Page-scoped palette (identical to Nij Begun & Landelijk)
const C = {
  primary: "#1B2E4A",
  accent: "#D4AF3D",
  accentSoft: "#E5C967",
  bg: "#F8F4ED",
  card: "#FFFFFF",
  cardSoft: "var(--card-soft)",
  text: "#1F2937",
  muted: "#6B7280",
};

const LAATST_BIJGEWERKT = "mei 2026";

// TODO: vervang door schone werkgebied-kaart zonder 50%/100%-labels.
const WERKGEBIED_KAART = "/images/nij-begun/Afbeelding_50-100_Groningen.webp";

const gemeentenGroningen = [
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
];

const gemeentenDrenthe = ["Aa en Hunze", "Noordenveld", "Tynaarlo"];

const regelingen = [
  {
    titel: "Isolatiepremie",
    tekst:
      "Vaste bijdrage van de gemeente bovenop ISDE. Vaak een paar honderd tot een paar duizend euro per woning, soms gekoppeld aan een specifieke maatregel zoals dakisolatie of HR++ glas.",
  },
  {
    titel: "Duurzaamheidslening",
    tekst:
      "Lening tegen gunstige rente, beheerd door de gemeente of via SVn (Stimuleringsfonds Volkshuisvesting). Handig als je liever de investering uitsmeert dan in één keer betaalt.",
  },
  {
    titel: "Gratis energiecoach",
    tekst:
      "Veel gemeenten bieden bewoners een gratis huisbezoek door een onafhankelijke energiecoach. Geen subsidie in geld, maar wel een spaarpot aan praktisch advies en bespaartips.",
  },
  {
    titel: "Voucher voor kleine maatregelen",
    tekst:
      "Een tegoed van vaak €70 tot €150 dat je kunt besteden aan radiatorfolie, tochtstrips, brievenbusborstel of een led-lampenpakket. Vaak via het Energieloket van de gemeente.",
  },
  {
    titel: "Subsidie groen dak of regenwaterberging",
    tekst:
      "Sommige gemeenten geven extra voor klimaat-adaptief bouwen, zoals een groen dak of een regenwatertank. Dit valt buiten ISDE en Nij Begun, dus volledig stapelbaar.",
  },
  {
    titel: "Aanvullende regeling voor monumenten",
    tekst:
      "Eigenaren van een rijksmonument, provinciaal of gemeentelijk monument hebben vaak aparte regelingen, omdat normale isolatie niet altijd mag. Voortraject kent de monumentenroute.",
  },
];

const stappen = [
  {
    num: "01",
    icon: Phone,
    titel: "Vrijblijvend telefoongesprek",
    tekst:
      "Geen wachtrij, geen formulier-eerst. We bellen rustig met je over jouw woning, je postcode en je wens. Aan het eind van het gesprek weten we al ruwweg welke regelingen voor jouw gemeente actueel zijn.",
  },
  {
    num: "02",
    icon: Calendar,
    titel: "Afspraak voor een huisbezoek",
    tekst:
      "Klikt het? Dan plannen we binnen een week een huisbezoek in. Een lokale adviseur uit jouw regio komt persoonlijk langs. Vrijblijvend en onafhankelijk.",
  },
  {
    num: "03",
    icon: Layers,
    titel: "Stapelplan op maat",
    tekst:
      "Wij rekenen uit welke regelingen voor jouw woning samengaan en wat dat oplevert. Welke gestapeld kunnen worden, welke elkaar uitsluiten, en in welke volgorde je het beste aanvraagt. Jij hoeft niet zelf in regelingen te duiken.",
  },
  {
    num: "04",
    icon: Users,
    titel: "Erkende uitvoerder kiezen",
    tekst:
      "Werkt een niet-erkend bedrijf voor je, dan vervalt vaak de subsidie. Wij brengen je in contact met installateurs die voldoen aan alle eisen, ook de gemeentelijke. Geen vooringenomen keuze, gewoon wat werkt.",
  },
  {
    num: "05",
    icon: Hammer,
    titel: "Uitvoering met begeleiding",
    tekst:
      "Tijdens de uitvoering bewaken wij de meldcodes, de fotodocumentatie en alle bewijsstukken. Voor één regeling, voor drie regelingen, wij houden alles bij.",
  },
  {
    num: "06",
    icon: Send,
    titel: "Wij dienen alle aanvragen in",
    tekst:
      "Geen drie loketten, geen drie aanvragen die je zelf moet bewaken. Wij dienen ISDE in bij RVO, Nij Begun bij SNN, en de gemeentelijke regelingen via het juiste kanaal. Elk met de juiste timing.",
  },
  {
    num: "07",
    icon: LifeBuoy,
    titel: "Vervolgmaatregelen en natraject",
    tekst:
      "Wil je daarna meer doen? Wij blijven jouw aanspreekpunt. Voor vervolgmaatregelen, voor vragen over onderhoud of garantie, of voor advies als de gemeente een nieuwe regeling lanceert.",
  },
];

const faqs: { q: string; a: string }[] = [
  {
    q: "Hoe weet ik welke regelingen mijn gemeente nu heeft?",
    a: "Dat is precies wat wij voor je uitzoeken. Tijdens het huisbezoek checken we welke regelingen op dat moment open staan in jouw gemeente, en welke voor jouw woning gelden.",
  },
  {
    q: "Kan ik echt drie subsidies tegelijk krijgen?",
    a: "In veel gevallen wel: ISDE, Nij Begun (waar van toepassing) en een gemeentelijke regeling kunnen vaak naast elkaar bestaan. Soms sluiten ze elkaar deels uit. Wij weten welke combinaties wel en niet werken.",
  },
  {
    q: "Wat als de gemeentelijke regeling stopt?",
    a: "Sommige gemeentelijke regelingen hebben een beperkt budget en stoppen als de pot leeg is. Daarom werken we per woning en plannen we de aanvraag op het juiste moment. Wachten kan geld kosten.",
  },
  {
    q: "Werken jullie alleen in het Nij Begun-gebied?",
    a: "Wij kennen het Nij Begun-gebied het best, dus daar weten we zeker wat actueel is. Voor andere gemeenten kijken we graag mee, neem contact op en we vertellen je wat we kunnen.",
  },
  {
    q: "Hoe lang duurt het voor ik gemeentelijke subsidie krijg?",
    a: "Dat verschilt sterk per regeling. Sommige zijn binnen weken op je rekening, andere kunnen maanden duren. Wij houden de procedure voor je bij.",
  },
  {
    q: "Wat kost jullie hulp?",
    a: "Niets. Ons huisbezoek en de begeleiding zijn gratis voor bewoners. Wij worden betaald door installatiebedrijven die met ons samenwerken.",
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

const GemeenteBadge = ({ name }: { name: string }) => (
  <span
    className="transition-shadow hover:shadow-md"
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      backgroundColor: "var(--card-soft)",
      border: "1px solid rgba(229, 201, 103, 0.3)",
      borderRadius: 9999,
      padding: "8px 16px",
      fontSize: 14,
      fontWeight: 500,
      color: "#1B2E4A",
    }}
  >
    <MapPin size={12} color="#D4AF3D" />
    {name}
  </span>
);

const SubsidiesRegionaal = () => {
  useEffect(() => {
    const prevTitle = document.title;
    document.title = "Gemeentelijke subsidies voor verduurzaming | Voortraject";

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
      "Veel gemeenten bieden eigen subsidies bovenop ISDE en Nij Begun. Wij houden de actuele regelingen bij en stapelen ze voor je. Gratis huisbezoek."
    );

    let canon = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    const created = !canon;
    if (!canon) {
      canon = document.createElement("link");
      canon.rel = "canonical";
      document.head.appendChild(canon);
    }
    canon.href = `${window.location.origin}/subsidies/regionaal`;

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
      if (ld.parentNode) ld.parentNode.removeChild(ld);
      if (created && canon && canon.parentNode) canon.parentNode.removeChild(canon);
    };
  }, []);

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Scroll-fade-in voor stappen
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [visibleSteps, setVisibleSteps] = useState<Set<number>>(new Set());
  useEffect(() => {
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      setVisibleSteps(new Set(stappen.map((_, i) => i)));
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        setVisibleSteps((prev) => {
          let changed = false;
          const next = new Set(prev);
          entries.forEach((e) => {
            if (e.isIntersecting) {
              const idx = Number((e.target as HTMLElement).dataset.stepIndex);
              if (!next.has(idx)) {
                next.add(idx);
                changed = true;
                obs.unobserve(e.target);
              }
            }
          });
          return changed ? next : prev;
        });
      },
      { threshold: 0.3 }
    );
    stepRefs.current.forEach((el) => {
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  const scrollToGemeenten = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById("gemeenten")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const cardOnCream: React.CSSProperties = {
    backgroundColor: C.card,
    border: `1px solid ${C.accentSoft}66`,
    borderRadius: "1rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  };

  const cardOnWhite: React.CSSProperties = {
    backgroundColor: C.cardSoft,
    border: `1px solid ${C.accentSoft}66`,
    borderRadius: "1rem",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: C.bg, color: C.text }}>
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
                Honderden tot duizenden euro's extra via je <Gold>gemeente</Gold>
              </h1>
              <p style={{ fontSize: 18, lineHeight: 1.6, color: C.text, marginBottom: 28, maxWidth: 620 }}>
                Boven op ISDE en Nij Begun bieden veel gemeenten eigen regelingen voor isolatie, ventilatie en verduurzaming. Veel bewoners weten dat niet, of weten niet welke nog actief zijn. Wij houden de actuele gemeentelijke subsidies bij en stapelen ze voor je.
              </p>
              <div className="flex flex-wrap gap-3">
                <a href="/contact" style={goldBtn}>
                  Vraag een gratis check aan
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

            <div
              style={{
                ...cardOnCream,
                padding: 24,
              }}
            >
              <ul style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                {[
                  { Icon: Layers, text: <><strong style={{ color: C.primary }}>Stapelbaar</strong> met ISDE en Nij Begun</> },
                  { Icon: RefreshCw, text: <><strong style={{ color: C.primary }}>Actuele regelingen</strong> worden door ons bijgehouden</> },
                  { Icon: Users, text: <><strong style={{ color: C.primary }}>Eén aanspreekpunt</strong> voor alle aanvragen</> },
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

      {/* 2. WAT ZIJN GEMEENTELIJKE SUBSIDIES — wit */}
      <section style={{ backgroundColor: "#FFFFFF" }} className="py-16 md:py-24">
        <div className="container-content max-w-3xl">
          <H2>
            Wat zijn <Gold>gemeentelijke</Gold> subsidies?
          </H2>
          <div style={{ marginTop: 24, fontSize: 17, lineHeight: 1.7, color: C.text }}>
            <p style={{ marginBottom: 18 }}>
              Veel gemeenten in Nederland bieden eigen subsidies om bewoners te helpen verduurzamen. Soms is dat een vast bedrag voor isolatie, soms een gratis energiecoach, soms een lening tegen gunstige voorwaarden. Anders dan ISDE of Nij Begun zijn deze regelingen lokaal, dus de bedragen, voorwaarden en aanvraagprocedures verschillen per gemeente.
            </p>
            <p>
              De regelingen wijzigen ook regelmatig. Een subsidie die vorig jaar bestond kan dit jaar gestopt zijn, of juist nieuw zijn. Wij houden bij wat er actueel is in jouw gemeente en stapelen het bovenop de landelijke en regionale subsidies waar je recht op hebt.
            </p>
          </div>
        </div>
      </section>

      {/* 3. ZO WERKT STAPELEN — cream */}
      <section id="stapelen" style={{ backgroundColor: C.bg }} className="py-16 md:py-24">
        <div className="container-content">
          <div className="max-w-3xl">
            <H2>
              Stapelen levert je <Gold>honderden tot duizenden</Gold> euro's extra op
            </H2>
            <p style={{ marginTop: 20, fontSize: 17, lineHeight: 1.7, color: C.text }}>
              Veel bewoners denken dat ze één subsidie kiezen. Maar in veel gevallen kun je drie regelingen tegelijk gebruiken, mits ze elkaar niet uitsluiten. Wij rekenen voor jouw woning uit wat samengaat en wat niet.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            {[
              {
                Icon: Globe,
                tag: "LANDELIJK",
                titel: "ISDE",
                tekst: "Vaste bedragen voor warmtepomp, isolatie, zonneboiler en meer. Achteraf aanvragen bij RVO.",
                bedrag: "tot duizenden euro's",
              },
              {
                Icon: MapIcon,
                tag: "GRONINGEN & NOORD-DRENTHE",
                titel: "Nij Begun",
                tekst: "50% of 100% subsidie voor isolatie. Vooraf aanvragen bij SNN. Alleen voor bewoners in het werkgebied.",
                bedrag: "tot €40.000",
              },
              {
                Icon: Building2,
                tag: "PER GEMEENTE",
                titel: "Lokale regelingen",
                tekst: "Verschilt per gemeente. Vaak isolatiepremie, lening of gratis energiecoach. Wij weten wat actueel is.",
                bedrag: "vaak honderden tot duizenden euro's",
              },
            ].map((c, i) => (
              <div key={i} style={{ ...cardOnCream, padding: 24, display: "flex", flexDirection: "column", gap: 12 }}>
                <IconCircle Icon={c.Icon} size={22} />
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: C.accent }}>
                  {c.tag}
                </span>
                <h3 style={{ fontSize: 22, fontWeight: 700, color: C.primary, margin: 0 }}>{c.titel}</h3>
                <p style={{ fontSize: 15, color: C.text, lineHeight: 1.6, margin: 0 }}>{c.tekst}</p>
                <span style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>{c.bedrag}</span>
              </div>
            ))}
          </div>

          {/* Banner */}
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
              Samen levert dat vaak <Gold>duizenden euro's</Gold> op
            </p>
            <p style={{ fontSize: 15, color: C.muted, marginTop: 10 }}>
              Wij rekenen voor jouw woning precies uit hoe ver je kunt komen.
            </p>
            <div style={{ marginTop: 22 }}>
              <a href="/contact" style={outlineBtn}>
                Reken het voor mijn woning uit
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WELKE REGELINGEN — wit */}
      <section style={{ backgroundColor: "#FFFFFF" }} className="py-16 md:py-24">
        <div className="container-content">
          <div className="max-w-3xl">
            <H2>
              Welke <Gold>regelingen</Gold> kun je verwachten?
            </H2>
            <p style={{ marginTop: 20, fontSize: 17, lineHeight: 1.7, color: C.text }}>
              De regelingen verschillen per gemeente, maar er zijn een paar typen die vaak voorkomen. Hieronder zie je de belangrijkste. Wij checken tijdens het huisbezoek welke voor jouw gemeente nu open staan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-10">
            {regelingen.map((r, i) => (
              <div key={i} style={{ ...cardOnCream, padding: 22, display: "flex", gap: 14 }}>
                <Check size={22} color={C.accent} style={{ marginTop: 2, flexShrink: 0 }} />
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: C.primary, margin: 0, marginBottom: 6 }}>
                    {r.titel}
                  </h3>
                  <p style={{ fontSize: 15, color: C.text, lineHeight: 1.6, margin: 0 }}>{r.tekst}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 32 }}>
            <a href="/contact" style={outlineBtn}>
              Plan een gratis check
            </a>
          </div>
        </div>
      </section>

      {/* 6. STAPPENPLAN — wit */}
      <section style={{ backgroundColor: "#FFFFFF" }} className="py-16 md:py-24">
        <div className="container-content">
          <div className="max-w-3xl">
            <H2>
              Zo verloopt jouw <Gold>traject</Gold>
            </H2>
            <p style={{ marginTop: 20, fontSize: 17, lineHeight: 1.7, color: C.text }}>
              Geen drie verschillende loketten, geen drie aanvragen die je zelf moet bewaken. Wij stapelen voor je en houden de termijnen in de gaten.
            </p>
          </div>

          <ol className="mt-12 flex flex-col gap-12 md:gap-16" style={{ listStyle: "none", padding: 0 }}>
            {stappen.map((s, i) => {
              const visible = visibleSteps.has(i);
              const Icon = s.icon;
              return (
                <li
                  key={s.num}
                  ref={(el) => (stepRefs.current[i] = el)}
                  data-step-index={i}
                  style={{
                    ...cardOnWhite,
                    padding: "28px 28px",
                    opacity: visible ? 1 : 0,
                    transform: visible ? "translateY(0)" : "translateY(20px)",
                    transition: "opacity 500ms ease, transform 500ms ease",
                  }}
                >
                  <div className="flex items-start gap-5">
                    <span
                      style={{
                        fontSize: "clamp(48px, 7vw, 80px)",
                        fontWeight: 800,
                        color: C.accent,
                        lineHeight: 1,
                        letterSpacing: "-0.04em",
                      }}
                    >
                      {s.num}
                    </span>
                    <div style={{ paddingTop: 8 }}>
                      <IconCircle Icon={Icon} size={20} />
                    </div>
                  </div>
                  <h3 style={{ fontSize: 22, fontWeight: 700, color: C.primary, margin: "16px 0 8px" }}>
                    {s.titel}
                  </h3>
                  <p style={{ fontSize: 16, color: C.text, lineHeight: 1.65, margin: 0 }}>{s.tekst}</p>
                </li>
              );
            })}
          </ol>

          <div
            style={{
              ...cardOnWhite,
              marginTop: 48,
              padding: "32px 28px",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: "clamp(20px, 2.4vw, 26px)", fontWeight: 700, color: C.primary, margin: 0 }}>
              Geen drie loketten, <Gold>één aanspreekpunt</Gold>
            </p>
            <p style={{ fontSize: 15, color: C.muted, marginTop: 10 }}>
              Wij doen ISDE bij RVO, Nij Begun bij SNN en de gemeentelijke aanvraag bij jouw gemeente. Allemaal in één traject.
            </p>
            <div style={{ marginTop: 20 }}>
              <a href="/contact" style={goldBtn}>
                Vraag een huisbezoek aan
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ — cream */}
      <section style={{ backgroundColor: C.bg }} className="py-16 md:py-24">
        <div className="container-content max-w-3xl">
          <H2>
            Veelgestelde <Gold>vragen</Gold>
          </H2>
          <div className="mt-8" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {faqs.map((f, i) => {
              const open = openFaq === i;
              return (
                <div
                  key={i}
                  style={{
                    ...cardOnCream,
                    overflow: "hidden",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? null : i)}
                    aria-expanded={open}
                    aria-controls={`faq-panel-${i}`}
                    id={`faq-btn-${i}`}
                    className="w-full flex items-center justify-between text-left"
                    style={{
                      padding: "18px 22px",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      gap: 16,
                    }}
                  >
                    <span style={{ fontSize: 17, fontWeight: 600, color: C.primary, lineHeight: 1.4 }}>{f.q}</span>
                    <ChevronDown
                      size={20}
                      color={C.accent}
                      style={{
                        flexShrink: 0,
                        transition: "transform 200ms ease",
                        transform: open ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                      aria-hidden
                    />
                  </button>
                  {open && (
                    <div
                      id={`faq-panel-${i}`}
                      role="region"
                      aria-labelledby={`faq-btn-${i}`}
                      style={{ padding: "0 22px 20px", fontSize: 15, color: C.text, lineHeight: 1.65 }}
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

      {/* 8. WAAROM VOORTRAJECT — wit */}
      <section style={{ backgroundColor: "#FFFFFF" }} className="py-16 md:py-24">
        <div className="container-content">
          <div className="max-w-3xl">
            <H2>
              Waarom bewoners voor Voortraject <Gold>kiezen</Gold>
            </H2>
            <p style={{ marginTop: 20, fontSize: 17, lineHeight: 1.7, color: C.text }}>
              Wat ons anders maakt dan een algemene subsidie-website of een gemeenteloket.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-10">
            {[
              {
                Icon: Home,
                titel: "Persoonlijk huisbezoek",
                tekst:
                  "Geen wachtrij, geen formulier-eerst. Een lokale adviseur uit jouw regio komt persoonlijk langs binnen een week.",
              },
              {
                Icon: FileCheck,
                titel: "Wij regelen alle aanvragen",
                tekst:
                  "Geen drie loketten, geen drie procedures die je zelf moet bewaken. Wij dienen alles in en houden de termijnen bij.",
              },
              {
                Icon: Scale,
                titel: "Onafhankelijk advies",
                tekst:
                  "Wij hebben geen voorkeur voor bepaalde uitvoerders. We brengen je in contact met erkende installateurs die bij jouw woning passen.",
              },
              {
                Icon: LifeBuoy,
                titel: "Nazorg en natraject",
                tekst:
                  "Na de uitvoering blijven we beschikbaar. Voor vervolgmaatregelen, garantie of een nieuwe gemeentelijke regeling die later wordt gelanceerd.",
              },
            ].map((b, i) => (
              <div key={i} style={{ ...cardOnWhite, padding: 24, display: "flex", gap: 16 }}>
                <IconCircle Icon={b.Icon} size={22} />
                <div>
                  <h3 style={{ fontSize: 19, fontWeight: 700, color: C.primary, margin: 0, marginBottom: 6 }}>
                    {b.titel}
                  </h3>
                  <p style={{ fontSize: 15, color: C.text, lineHeight: 1.65, margin: 0 }}>{b.tekst}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. FOOTER-CTA — donkerblauw */}
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
            Welke regelingen liggen open in <span style={{ color: C.accent }}>jouw gemeente</span>?
          </h2>
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 16, lineHeight: 1.65, marginTop: 18 }}>
            Wij zoeken het voor jouw woning uit en stapelen alles bovenop ISDE en Nij Begun. Geen drie loketten, één gesprek. Vrijblijvend en gratis.
          </p>
          <div style={{ marginTop: 26 }}>
            <a href="/contact" style={goldBtn}>
              Plan een gratis check
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

export default SubsidiesRegionaal;
