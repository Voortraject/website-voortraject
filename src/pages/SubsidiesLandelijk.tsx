import { useEffect, useRef, useState } from "react";
import {
  Globe,
  Coins,
  TrendingUp,
  User,
  Calendar,
  Thermometer,
  Sun,
  Home,
  Wind,
  Info,
  Calculator,
  Leaf,
  Check,
  X as XIcon,
  Phone,
  FileText,
  Users,
  Hammer,
  Send,
  LifeBuoy,
  ChevronDown,
  FileCheck,
  Scale,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

// Page-scoped palette (identical to Nij Begun page)
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

// Editable ISDE constants (jaarlijks updatebaar)
const ISDE = {
  budget2026: "€500 miljoen",
  warmtenetBedrag: "€3.775",
  ventilatieBedrag: "€400",
  zonneboilerMin: "€300",
  warmtepompMin: "€500",
  warmtepompMax: "€13.000",
  isolatie: [
    { naam: "Spouwmuurisolatie", een: "€5,25 / m²", twee: "€10,50 / m²" },
    { naam: "Dakisolatie", een: "€16,25 / m²", twee: "€32,50 / m²" },
    { naam: "Gevelisolatie (binnen of buiten)", een: "€20,25 / m²", twee: "€40,50 / m²" },
    { naam: "Vloerisolatie", een: "€5,50 / m²", twee: "€11,00 / m²" },
    { naam: "Bodemisolatie", een: "€3,00 / m²", twee: "€6,00 / m²" },
    { naam: "Zolder- en vlieringisolatie", een: "€4,00 / m²", twee: "€8,00 / m²" },
  ],
};

const faqs: { q: string; a: string }[] = [
  {
    q: "Kan ik ISDE combineren met Nij Begun?",
    a: "Voor warmtepomp en zonneboiler kan dat. Voor isolatie zit ISDE al verwerkt in Nij Begun, dus dan vraag je het niet apart aan. Wij regelen beide aanvragen waar dat van toepassing is.",
  },
  {
    q: "Vraag ik vooraf of achteraf aan?",
    a: "Achteraf. Eerst laat je de maatregel uitvoeren door een erkend bedrijf, daarna dien je binnen 24 maanden de aanvraag in. Wij doen de aanvraag voor je zodra de uitvoering klaar is.",
  },
  {
    q: "Wat als de subsidiepot leeg raakt?",
    a: "Dat is jaarlijks een aandachtspunt. Het budget voor 2026 is €500 miljoen, maar in populaire jaren is er sneller op. Daarom adviseren we om niet te lang te wachten, vooral als je een grotere combinatie plant.",
  },
  {
    q: "Krijg ik subsidie als ik zelf isoleer?",
    a: "Nee. Doe-het-zelf werk komt niet in aanmerking voor ISDE. Het werk moet door een erkend bedrijf worden uitgevoerd, met een geldige meldcode op de factuur.",
  },
  {
    q: "Hoe lang duurt het voor ik mijn subsidie krijg?",
    a: "RVO beslist meestal binnen 8 weken na een complete aanvraag. Bij goedkeuring wordt het bedrag rechtstreeks op je rekening gestort.",
  },
  {
    q: "Wat kost jullie hulp?",
    a: "Niets. Ons huisbezoek en de begeleiding zijn gratis voor bewoners. Wij worden betaald door de installatiebedrijven die met ons samenwerken.",
  },
];

// Heading with one gold word
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

const PrimaryBtn = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a
    href={href}
    className="inline-flex items-center justify-center rounded-full font-semibold transition-transform hover:scale-[1.02]"
    style={{
      backgroundColor: C.accent,
      color: C.primary,
      padding: "14px 24px",
      fontSize: 15,
    }}
  >
    {children}
  </a>
);

const OutlineBtn = ({ href, children, onClick }: { href?: string; children: React.ReactNode; onClick?: () => void }) => {
  const cls = "inline-flex items-center justify-center rounded-full font-semibold transition-colors";
  const style = {
    backgroundColor: "transparent",
    color: C.primary,
    border: `1.5px solid ${C.accent}`,
    padding: "12px 22px",
    fontSize: 15,
  } as React.CSSProperties;
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cls} style={style}>
        {children}
      </button>
    );
  }
  return (
    <a href={href} className={cls} style={style}>
      {children}
    </a>
  );
};

// Card variant helper — strict color rule
const cardStyle = (variant: "on-cream" | "on-white"): React.CSSProperties => ({
  backgroundColor: variant === "on-cream" ? C.card : C.bg,
  border: `1px solid ${C.accentSoft}66`,
  borderRadius: 16,
  padding: 28,
});

// Icon circle (used as left-prefix in card headers)
const IconCircle = ({
  Icon,
  size = 44,
}: {
  Icon: React.ComponentType<any>;
  size?: number;
}) => (
  <span
    className="inline-flex items-center justify-center rounded-full"
    style={{
      backgroundColor: C.accent,
      width: size,
      height: size,
      color: C.primary,
      flexShrink: 0,
    }}
  >
    <Icon size={Math.round(size * 0.5)} />
  </span>
);

// Tooltip-toegankelijke maatregel
const MeasureLi = ({ label, tip }: { label: string; tip: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <li className="flex items-start gap-3 py-2">
      <Check size={20} style={{ color: C.accent, flexShrink: 0, marginTop: 2 }} aria-hidden />
      <span style={{ color: C.text, fontSize: 16, lineHeight: 1.6, flex: 1 }}>{label}</span>
      <span className="relative inline-flex">
        <button
          type="button"
          aria-label={`Meer info over ${label}`}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          onBlur={() => setOpen(false)}
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          className="inline-flex items-center justify-center rounded-full focus:outline-none focus-visible:ring-2"
          style={{ width: 22, height: 22, color: C.accent }}
        >
          <Info size={16} />
        </button>
        {open && (
          <span
            role="tooltip"
            className="absolute right-0 top-full mt-2 z-20"
            style={{
              backgroundColor: "#fff",
              border: `1px solid ${C.accent}`,
              borderRadius: 12,
              padding: "12px 14px",
              fontSize: 13,
              lineHeight: 1.5,
              color: C.text,
              width: 280,
              maxWidth: "80vw",
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            }}
          >
            {tip}
          </span>
        )}
      </span>
    </li>
  );
};

const SubsidiesLandelijk = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [visibleSteps, setVisibleSteps] = useState<Set<number>>(new Set());

  useEffect(() => {
    document.title = "ISDE-subsidie aanvragen voor isolatie, warmtepomp en meer | Voortraject";
    const meta = document.querySelector('meta[name="description"]') || (() => {
      const m = document.createElement("meta");
      m.setAttribute("name", "description");
      document.head.appendChild(m);
      return m;
    })();
    meta.setAttribute(
      "content",
      "Tot duizenden euro's ISDE-subsidie voor warmtepomp, isolatie, zonneboiler en meer. Wij regelen de aanvraag voor je, in heel Nederland."
    );

    // FAQ JSON-LD
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

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setVisibleSteps(new Set(stepRefs.current.map((_, i) => i)));
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        setVisibleSteps((prev) => {
          const next = new Set(prev);
          entries.forEach((e) => {
            if (e.isIntersecting) {
              const idx = Number((e.target as HTMLElement).dataset.stepIndex);
              next.add(idx);
              obs.unobserve(e.target);
            }
          });
          return next;
        });
      },
      { threshold: 0.3 }
    );
    stepRefs.current.forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const scrollToBedragen = () => {
    document.getElementById("bedragen")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const steps = [
    { n: "01", t: "Vrijblijvend telefoongesprek", icon: Phone, d: "Geen wachtrij, geen formulier-eerst. We bellen rustig met je over jouw woning en wens. Aan het eind van het gesprek weet je grofweg welke ISDE-bedragen voor jou interessant zijn, en of een huisbezoek zin heeft." },
    { n: "02", t: "Afspraak voor een huisbezoek", icon: Calendar, d: "Klikt het? Dan plannen we binnen een week een huisbezoek in. Een lokale adviseur uit jouw regio komt persoonlijk bij je langs. Geen verplichtingen, geen verkooppraatje." },
    { n: "03", t: "Plan op maat met optimale combinatie", icon: FileText, d: "Wij kennen de regeling. Tijdens het bezoek rekenen we uit welke maatregelen voor jouw woning slim zijn én in welke volgorde. Vaak levert combineren duizenden euro's extra op. Jij hoeft niet zelf in regelingen te duiken." },
    { n: "04", t: "Erkende uitvoerder kiezen", icon: Users, d: "Werkt een niet-erkend bedrijf voor je, dan vervalt je subsidie volledig. Wij brengen je in contact met installateurs die voldoen aan de ISDE-eisen en bij jouw woning passen. Geen vooringenomen keuze, gewoon wat werkt." },
    { n: "05", t: "Uitvoering met begeleiding", icon: Hammer, d: "Tijdens de uitvoering bewaken wij de meldcodes, de fotodocumentatie en de planning. Dat zijn straks de bewijsstukken voor je aanvraag. Eén ontbrekende foto kost een hoop geld. Wij zorgen dat dat niet gebeurt." },
    { n: "06", t: "Wij dienen de aanvraag in bij RVO", icon: Send, d: "Geen DigiD-gedoe, geen formulieren. Wij dienen de aanvraag in via mijnRVO.nl en wachten samen met jou de beslissing af. RVO beslist doorgaans binnen 8 weken en stort het bedrag op jouw rekening." },
    { n: "07", t: "Vervolgmaatregelen en natraject", icon: LifeBuoy, d: "Wil je daarna nog meer doen? Combineren binnen 24 maanden levert verdubbelde subsidie op. Wij blijven jouw aanspreekpunt voor vervolgmaatregelen, vragen over onderhoud, of advies over warmtepomp of warmtenet." },
  ];

  const categories = [
    { icon: Thermometer, t: "Warmtepomp", b: `tot ${ISDE.warmtepompMax} (water-water), vanaf ${ISDE.warmtepompMin} (kleinere pompen)`, d: "Hybride, lucht-water of water-water. Lucht-water start op €1.025 plus €225 per kW vermogen." },
    { icon: Sun, t: "Zonneboiler", b: `vanaf ${ISDE.zonneboilerMin}`, d: "Voor zonneboilers met collector, boilervat en circulatiepomp. Het exacte bedrag staat per apparaat op de meldcodelijst." },
    { icon: Home, t: "Isolatie", b: "per m², verdubbeld bij 2+ maatregelen", d: "Spouwmuur, dak, vloer, gevel, glas. Combineer voor maximale subsidie. Bedragen staan in het overzicht hieronder." },
    { icon: Wind, t: "Warmtenet & ventilatie", b: `${ISDE.warmtenetBedrag} (warmtenet) of ${ISDE.ventilatieBedrag} (ventilatie)`, d: "Warmtenetaansluiting is een vast bedrag. Ventilatie (nieuw in 2026) krijg je alleen in combinatie met een isolatiemaatregel." },
  ];

  const measures = [
    { l: "Warmtepomp (hybride, lucht-water, water-water)", tip: "Moet op de RVO-meldcodelijst staan en minimaal energielabel A++ hebben. Maximaal eens per 3 jaar aanvragen. Bonus van €200 voor A+++ pompen." },
    { l: "Zonneboiler", tip: "Bestaat uit collector, boilervat en circulatiepomp. Moet op de Apparatenlijst Zonneboilers staan. Minimumbedrag €300." },
    { l: "Spouwmuurisolatie", tip: "Minimaal 10 m². Rd-waarde minimaal 1,1 m²K/W. Voor woningen met spouwmuren (bouwjaar na 1920). Vaak de goedkoopste maatregel met direct effect." },
    { l: "Dakisolatie", tip: "Minimaal 20 m², maximaal 200 m² per aanvraag. Rd-waarde minimaal 3,5 m²K/W. Levert vaak de hoogste subsidie per m² op." },
    { l: "Gevelisolatie (binnen of buiten)", tip: "Voor woningen zonder spouwmuren. Minimaal 10 m², Rd-waarde minimaal 3,5. Buitenisolatie is duurder maar effectiever." },
    { l: "Vloer- en bodemisolatie", tip: "Minimaal 20 m². Vloer: Rd-waarde minimaal 3,5. Bodem: Rd of Rbf-waarde minimaal 3,5 (sinds 2026 mag je kiezen)." },
    { l: "HR++ glas, triple glas of vacuümglas", tip: "Aparte bedragen per type glas. Sinds 2026 is de Uf-waarde-eis voor kozijnen vervallen, alleen de Ug-waarde van het glas telt nog." },
    { l: "Aansluiting op warmtenet", tip: "Vast bedrag van €3.775. Sinds 2026 volstaat een bevestiging van de netbeheerder, geen aansluitcontract meer nodig." },
    { l: "Energiezuinige ventilatie (nieuw in 2026)", tip: "€400 vast bedrag. Alleen in combinatie met een isolatiemaatregel. Mechanische ventilatie type C met 2 CO2-sensoren, of balansventilatie met WTW-unit." },
  ];

  const niet = [
    "Zonnepanelen (vallen onder de 0% btw-regeling, niet ISDE)",
    "Doe-het-zelf werkzaamheden",
    "Tussenvloerisolatie (alleen vloeren boven onverwarmde ruimte tellen)",
    "Nieuwbouwwoningen in de bouwfase",
    "Vakantiewoningen, tweede woningen, verhuurde panden (zie SVOH)",
    "Esthetische afwerking, schilderwerk",
  ];

  const why = [
    { icon: Home, t: "Persoonlijk huisbezoek", d: "Geen wachtrij, geen formulier-eerst. Een lokale adviseur komt persoonlijk bij je langs binnen een week." },
    { icon: FileCheck, t: "Wij regelen de aanvraag", d: "Geen DigiD-gedoe, geen termijnen die je zelf moet bewaken. Wij dienen de ISDE-aanvraag in bij RVO en bewaken het proces." },
    { icon: Scale, t: "Onafhankelijk advies", d: "Wij hebben geen voorkeur voor bepaalde uitvoerders. We brengen je in contact met erkende installateurs die bij jouw woning passen." },
    { icon: LifeBuoy, t: "Nazorg en natraject", d: "Na de uitvoering blijven we beschikbaar. Voor vervolgmaatregelen, garantie, of advies over warmtepomp of warmtenet." },
  ];

  // Half-and-half splitter for 2-column lists
  const half = <T,>(arr: T[]): [T[], T[]] => {
    const mid = Math.ceil(arr.length / 2);
    return [arr.slice(0, mid), arr.slice(mid)];
  };
  const [measuresLeft, measuresRight] = half(measures);
  const [nietLeft, nietRight] = half(niet);

  return (
    <div style={{ backgroundColor: C.bg }}>
      <Header />
      <main style={{ color: C.text }}>
        {/* SECTIE 1: HERO — cream */}
        <section className="container-content pt-16 md:pt-24 pb-16 md:pb-20">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 md:gap-14 items-center">
            <div className="md:col-span-3">
              <h1
                className="font-display"
                style={{
                  color: C.primary,
                  fontWeight: 800,
                  fontSize: "clamp(36px, 5.5vw, 64px)",
                  letterSpacing: "-0.03em",
                  lineHeight: 1.05,
                }}
              >
                Subsidie voor jouw <Gold>verduurzaming</Gold>, in heel Nederland.
              </h1>
              <p style={{ marginTop: 24, fontSize: 18, lineHeight: 1.6, color: C.text }}>
                Via ISDE krijg je honderden tot duizenden euro's terug op je verduurzaming. Maar je vraagt achteraf aan met meldcodes, foto's en de juiste timing. Eén foutje kost geld of vertraging. Wij regelen het van advies tot aanvraag bij RVO. Jij krijgt het bedrag op je rekening.
              </p>
              <div className="flex flex-wrap gap-3 mt-8">
                <PrimaryBtn href="/contact">Ja ik wil gratis advies</PrimaryBtn>
                <OutlineBtn onClick={scrollToBedragen}>Bekijk wat je kunt krijgen</OutlineBtn>
              </div>
            </div>
            <div className="md:col-span-2">
              {/* Logos — vergroot, in balans */}
              <div
                className="flex items-center justify-center"
                style={{ padding: "16px 24px", marginBottom: 16, gap: 24 }}
              >
                <img
                  src="/images/landelijk/logo-voortraject-blauw.png"
                  alt="Voortraject"
                  className="object-contain"
                  style={{ maxHeight: 56, height: "auto", width: "auto" }}
                />
                <span
                  aria-hidden
                  className="hidden sm:inline-block"
                  style={{
                    width: 1,
                    height: 56,
                    backgroundColor: "#1B2E4A",
                    opacity: 0.25,
                  }}
                />
                <img
                  src="/images/landelijk/rijksoverheid_logo.svg"
                  alt="Rijksoverheid"
                  className="object-contain"
                  style={{ maxHeight: 56, height: "auto", width: "auto" }}
                />
              </div>
              {/* Statkaart — wit op cream */}
              <div style={{ ...cardStyle("on-cream"), padding: 24 }}>
                <ul className="space-y-4">
                  {[
                    { icon: Globe, t: <>Heel Nederland komt in aanmerking</> },
                    { icon: Coins, t: <><strong>{ISDE.budget2026}</strong> budget in 2026</> },
                    { icon: TrendingUp, t: <>Verdubbel bij <strong>2 of meer</strong> maatregelen</> },
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
                        {s.t}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* SECTIE 2: WAT IS ISDE — wit */}
        <section style={{ backgroundColor: "#FFFFFF" }} className="py-12 md:py-16">
          <div className="container-content">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 items-center">
              <div>
                <H2>
                  Wat is <Gold>ISDE</Gold> precies?
                </H2>
                <p style={{ marginTop: 20, fontSize: 17, lineHeight: 1.7 }}>
                  ISDE staat voor Investeringssubsidie Duurzame Energie en Klimaattransitie. Het is de landelijke subsidie van de Rijksoverheid voor woningeigenaren die hun huis verduurzamen. De regeling wordt uitgevoerd door RVO en loopt door tot 2031.
                </p>
                <p style={{ marginTop: 16, fontSize: 17, lineHeight: 1.7 }}>
                  Anders dan Nij Begun werkt ISDE met vaste bedragen per maatregel. Voor isolatie krijg je een bedrag per vierkante meter. Voor een warmtepomp of zonneboiler een vast bedrag per apparaat. En als je twee of meer maatregelen combineert, verdubbelt de subsidie per vierkante meter voor isolatie.
                </p>
              </div>
              <div
                style={{
                  border: `1px solid rgba(229, 201, 103, 0.4)`,
                  borderRadius: 16,
                  padding: 16,
                  backgroundColor: "transparent",
                }}
              >
                <div style={{ aspectRatio: "5 / 3", width: "100%" }}>
                  <img
                    src="/images/landelijk/isde-subsidie.jpg"
                    alt="Schematische illustratie van een woning met groen blad en energielabels A tot G, symbool voor verduurzaming via de ISDE-subsidie"
                    loading="lazy"
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTIE 3: VOOR WIE — cream */}
        <section className="container-content py-12 md:py-16">
          <H2>
            Voor wie is ISDE <Gold>bedoeld</Gold>?
          </H2>
          <p style={{ marginTop: 16, fontSize: 17, lineHeight: 1.6, maxWidth: 760 }}>
            De ISDE-subsidie is er voor woningeigenaren die hun bestaande woning verduurzamen. Heel Nederland, geen inkomenstoets, geen postcode-check.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {[
              {
                icon: User,
                t: "Wie kan aanvragen?",
                items: [
                  "Eigenaar én bewoner van de woning",
                  "Woning staat in Nederland",
                  "Bestaande woning (geen nieuwbouw in de bouwfase)",
                  "Geen inkomenstoets, geen postcodebeperking",
                ],
              },
              {
                icon: Calendar,
                t: "Wanneer aanvragen?",
                items: [
                  "Eerst de maatregel laten uitvoeren door een erkend bedrijf",
                  "Aanvraag indienen binnen 24 maanden na uitvoering",
                  "Doe-het-zelf telt niet mee voor subsidie",
                  "Foto's en factuur zijn verplicht bij de aanvraag",
                ],
              },
            ].map((card) => (
              <div key={card.t} style={cardStyle("on-cream")}>
                {/* Icon-left header */}
                <div className="flex items-center gap-4">
                  <IconCircle Icon={card.icon} size={48} />
                  <h3
                    className="font-display"
                    style={{ color: C.primary, fontWeight: 700, fontSize: 22, margin: 0 }}
                  >
                    {card.t}
                  </h3>
                </div>
                <ul className="mt-5 space-y-2">
                  {card.items.map((it) => (
                    <li key={it} className="flex items-start gap-3">
                      <Check size={20} style={{ color: C.accent, flexShrink: 0, marginTop: 2 }} aria-hidden />
                      <span style={{ fontSize: 15.5, lineHeight: 1.55 }}>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 20, fontSize: 13, color: C.muted }}>
            Verhuurders en VvE's hebben een aparte regeling (SVOH). Voor hen geldt ISDE niet.
          </p>
        </section>

        {/* SECTIE 4: HOEVEEL SUBSIDIE — wit */}
        <section id="bedragen" style={{ backgroundColor: "#FFFFFF" }} className="py-12 md:py-16">
          <div className="container-content">
          <H2>
            Hoeveel <Gold>subsidie</Gold> krijg je?
          </H2>
          <p style={{ marginTop: 16, fontSize: 17, lineHeight: 1.6, maxWidth: 820 }}>
            De bedragen verschillen per maatregel, maar één regel maakt het écht interessant: combineer je twee of meer maatregelen binnen 24 maanden, dan <strong>verdubbelt</strong> het isolatiebedrag per vierkante meter. Wij rekenen voor jouw woning uit hoe je daar het maximale uit haalt.
          </p>

          {/* 4.1 Categoriekaarten — cream-soft op wit, icoon links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            {categories.map((c) => (
              <div
                key={c.t}
                className="transition-shadow hover:shadow-md"
                style={cardStyle("on-white")}
              >
                <div className="flex items-start gap-4">
                  <IconCircle Icon={c.icon} size={48} />
                  <div className="flex-1 min-w-0">
                    <h3
                      className="font-display"
                      style={{ color: C.primary, fontWeight: 700, fontSize: 22, margin: 0 }}
                    >
                      {c.t}
                    </h3>
                    <p style={{ marginTop: 4, color: C.accent, fontWeight: 700, fontSize: 16 }}>{c.b}</p>
                  </div>
                </div>
                <p style={{ marginTop: 14, fontSize: 15, lineHeight: 1.55, color: C.text }}>{c.d}</p>
              </div>
            ))}
          </div>

          {/* 4.2a Combineer-banner */}
          <div
            className="mt-8"
            style={{
              backgroundColor: C.cardSoft,
              borderLeft: `4px solid ${C.accent}`,
              borderRadius: 8,
              padding: 24,
            }}
          >
            <div className="flex items-start gap-3">
              <TrendingUp size={22} style={{ color: C.accent, flexShrink: 0, marginTop: 2 }} aria-hidden />
              <div>
                <h4 className="font-display" style={{ color: C.primary, fontWeight: 700, fontSize: 18 }}>
                  Combineren is waar de winst zit
                </h4>
                <p style={{ marginTop: 8, fontSize: 15.5, lineHeight: 1.6 }}>
                  Eén isolatiemaatregel levert ongeveer 15% van je investering aan subsidie op. Twee maatregelen, of één maatregel plus een warmtepomp of zonneboiler, brengt dat naar ongeveer 30%. Dat is letterlijk verdubbelen.
                </p>
              </div>
            </div>
          </div>

          {/* 4.2 Tabel */}
          <div
            className="mt-8"
            style={{
              backgroundColor: C.cardSoft,
              border: `1px solid ${C.accentSoft}66`,
              borderRadius: 16,
              padding: 28,
            }}
          >
            <h3 className="font-display" style={{ color: C.primary, fontWeight: 700, fontSize: 20 }}>
              Isolatie per vierkante meter
            </h3>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.accentSoft}66` }}>
                    <th style={{ padding: "12px 12px", color: C.primary, fontWeight: 700, fontSize: 14 }}>Maatregel</th>
                    <th style={{ padding: "12px 12px", color: C.primary, fontWeight: 700, fontSize: 14 }}>1 maatregel</th>
                    <th
                      style={{
                        padding: "12px 12px",
                        color: C.primary,
                        fontWeight: 800,
                        fontSize: 14,
                        backgroundColor: C.accent,
                      }}
                    >
                      2+ maatregelen
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ISDE.isolatie.map((row, i) => (
                    <tr key={row.naam} style={{ borderBottom: i === ISDE.isolatie.length - 1 ? "none" : `1px solid ${C.accentSoft}33` }}>
                      <td style={{ padding: "12px 12px", fontSize: 15 }}>{row.naam}</td>
                      <td style={{ padding: "12px 12px", fontSize: 15 }}>{row.een}</td>
                      <td style={{ padding: "12px 12px", fontSize: 15, fontWeight: 700, color: C.accent, backgroundColor: "rgba(229, 201, 103, 0.08)" }}>
                        {row.twee}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-5 flex items-start gap-2" style={{ color: C.muted, fontSize: 13 }}>
              <Info size={16} style={{ flexShrink: 0, marginTop: 2 }} aria-hidden />
              <span>Voor glas (HR++ of triple) gelden aparte bedragen. Bedragen kunnen jaarlijks wijzigen, check rvo.nl voor de actuele tarieven.</span>
            </div>
          </div>

          {/* 4.3 Voorbeeld callout */}
          <div
            className="mt-8"
            style={{
              backgroundColor: C.cardSoft,
              borderLeft: `4px solid ${C.accent}`,
              borderRadius: 8,
              padding: 24,
            }}
          >
            <div className="flex items-start gap-3">
              <Calculator size={22} style={{ color: C.accent, flexShrink: 0, marginTop: 2 }} aria-hidden />
              <div>
                <h4 className="font-display" style={{ color: C.primary, fontWeight: 700, fontSize: 18 }}>
                  Voorbeeld: dak en vloer combineren
                </h4>
                <p style={{ marginTop: 8, fontSize: 15.5, lineHeight: 1.6 }}>
                  Stel: je laat 80 m² dakisolatie en 60 m² vloerisolatie tegelijk uitvoeren. Door de combinatie verdubbelen beide bedragen.
                </p>
                <ul className="mt-3 space-y-1" style={{ fontSize: 15.5, lineHeight: 1.6 }}>
                  <li>Dakisolatie: 80 × €32,50 = <strong>€2.600</strong></li>
                  <li>Vloerisolatie: 60 × €11,00 = <strong>€660</strong></li>
                </ul>
                <p style={{ marginTop: 10, fontSize: 15.5, lineHeight: 1.6 }}>
                  Totaal: <strong style={{ color: C.primary }}>€3.260</strong> subsidie. Zonder combineren: €1.630. Verschil: <strong style={{ color: C.accent }}>€1.630 extra</strong> door slim te combineren.
                </p>
              </div>
            </div>
          </div>

          {/* 4.4 Mini-CTA */}
          <div className="mt-10 text-center">
            <p style={{ color: C.primary, fontWeight: 700, fontSize: 18 }}>
              Bang dat je geld laat liggen?
            </p>
            <p style={{ color: C.muted, fontSize: 14, marginTop: 6 }}>
              Tijdens het huisbezoek rekenen we voor jouw woning uit welke combinatie het slimst is. Vrijblijvend en gratis.
            </p>
            <div className="mt-5">
              <OutlineBtn href="/contact">Neem contact op</OutlineBtn>
            </div>
          </div>
          </div>
        </section>

        {/* SECTIE 5: WELKE MAATREGELEN — cream, twee koloms */}
        <section className="container-content py-12 md:py-16">
          <H2>
            Welke maatregelen worden <Gold>vergoed</Gold>?
          </H2>
          <p style={{ marginTop: 16, fontSize: 17, lineHeight: 1.6, maxWidth: 820 }}>
            ISDE vergoedt isolatie, warmtepomp, zonneboiler, warmtenet en (sinds 2026) ventilatie. Per maatregel gelden eisen aan de installatie, het materiaal en het oppervlak.
          </p>

          {/* 5.1 Hoofdlijst maatregelen — twee koloms op desktop, in witte card op cream */}
          <div className="mt-8" style={cardStyle("on-cream")}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
              <ul>
                {measuresLeft.map((m) => (
                  <MeasureLi key={m.l} label={m.l} tip={m.tip} />
                ))}
              </ul>
              <ul>
                {measuresRight.map((m) => (
                  <MeasureLi key={m.l} label={m.l} tip={m.tip} />
                ))}
              </ul>
            </div>
          </div>

          {/* 5.2 Biobased callout — volle breedte */}
          <div
            className="mt-6"
            style={{
              backgroundColor: C.card,
              borderLeft: `4px solid ${C.accent}`,
              borderRadius: 8,
              padding: 24,
            }}
          >
            <div className="flex items-start gap-3">
              <Leaf size={22} style={{ color: C.accent, flexShrink: 0, marginTop: 2 }} aria-hidden />
              <div>
                <h4 className="font-display" style={{ color: C.primary, fontWeight: 700, fontSize: 18 }}>
                  Bonus voor biobased isolatie
                </h4>
                <p style={{ marginTop: 8, fontSize: 15.5, lineHeight: 1.6 }}>
                  Kies je voor isolatiemateriaal uit hernieuwbare bronnen (zoals hennep, vlas, houtvezel of cellulose), dan krijg je een extra bedrag per vierkante meter. Deze bonus wordt niet verdubbeld bij combineren, maar telt wel op bij het standaardbedrag. Wij weten welke materialen kwalificeren en bespreken het tijdens het huisbezoek.
                </p>
              </div>
            </div>
          </div>

          {/* 5.3 Niet vergoed — twee koloms */}
          <div className="mt-10">
            <h3 className="font-display" style={{ color: C.primary, fontWeight: 700, fontSize: 20 }}>
              Niet vergoed via ISDE
            </h3>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-2">
              <ul className="space-y-2">
                {nietLeft.map((n) => (
                  <li key={n} className="flex items-start gap-3">
                    <XIcon size={18} style={{ color: C.muted, flexShrink: 0, marginTop: 3 }} aria-hidden />
                    <span style={{ fontSize: 15.5, lineHeight: 1.55 }}>{n}</span>
                  </li>
                ))}
              </ul>
              <ul className="space-y-2">
                {nietRight.map((n) => (
                  <li key={n} className="flex items-start gap-3">
                    <XIcon size={18} style={{ color: C.muted, flexShrink: 0, marginTop: 3 }} aria-hidden />
                    <span style={{ fontSize: 15.5, lineHeight: 1.55 }}>{n}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* SECTIE 6: STAPPENPLAN — wit */}
        <section style={{ backgroundColor: "#FFFFFF" }} className="py-12 md:py-16">
          <div className="container-content">
            <div className="max-w-3xl">
              <H2>
                Zo verloopt jouw <Gold>traject</Gold>
              </H2>
              <p style={{ marginTop: 16, fontSize: 17, lineHeight: 1.6 }}>
                Geen formulieren, geen DigiD-gedoe, geen termijnen die je zelf moet bewaken. Wij doen het zware werk, jij houdt de regie.
              </p>
            </div>

            <div className="mt-10 flex flex-col gap-8 md:gap-10">
              {steps.map((s, i) => {
                const visible = visibleSteps.has(i);
                return (
                  <div
                    key={s.n}
                    ref={(el) => (stepRefs.current[i] = el)}
                    data-step-index={i}
                    style={{
                      ...cardStyle("on-white"),
                      boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                      opacity: visible ? 1 : 0,
                      transform: visible ? "translateY(0)" : "translateY(20px)",
                      transition: "opacity 400ms ease-out, transform 400ms ease-out",
                    }}
                  >
                    <div className="flex items-center gap-5">
                      <span
                        className="font-display"
                        style={{
                          color: C.accent,
                          fontWeight: 800,
                          fontSize: "clamp(48px, 7vw, 80px)",
                          lineHeight: 1,
                          letterSpacing: "-0.04em",
                        }}
                      >
                        {s.n}
                      </span>
                      <span
                        className="inline-flex items-center justify-center rounded-full"
                        style={{ backgroundColor: C.accent, width: 40, height: 40, color: C.primary, flexShrink: 0 }}
                      >
                        <s.icon size={20} />
                      </span>
                    </div>
                    <h3
                      className="font-display"
                      style={{ marginTop: 12, color: C.primary, fontWeight: 700, fontSize: 22 }}
                    >
                      {s.t}
                    </h3>
                    <p style={{ marginTop: 10, fontSize: 16, lineHeight: 1.65 }}>{s.d}</p>
                  </div>
                );
              })}
            </div>

            <div
              className="mt-12 text-center mx-auto"
              style={{
                backgroundColor: C.cardSoft,
                borderRadius: 16,
                padding: "32px 24px",
                maxWidth: 720,
              }}
            >
              <p className="font-display" style={{ color: C.primary, fontWeight: 700, fontSize: 22 }}>
                Wil je sneller verder zonder gedoe?
              </p>
              <div className="mt-6">
                <PrimaryBtn href="/contact">Plan een huisbezoek</PrimaryBtn>
              </div>
            </div>
          </div>
        </section>

        {/* SECTIE 7: FAQ — cream, smal voor leesbaarheid */}
        <section className="py-12 md:py-16">
          <div className="mx-auto px-6" style={{ maxWidth: 768 }}>
            <H2>
              Veelgestelde <Gold>vragen</Gold>
            </H2>
            <div
              className="mt-8"
              style={{
                backgroundColor: C.card,
                border: `1px solid ${C.accentSoft}66`,
                borderRadius: 16,
                overflow: "hidden",
              }}
            >
              {faqs.map((f, i) => {
                const open = openFaq === i;
                return (
                  <div
                    key={f.q}
                    style={{ borderBottom: i === faqs.length - 1 ? "none" : `1px solid ${C.accentSoft}33` }}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(open ? null : i)}
                      aria-expanded={open}
                      className="w-full flex items-center text-left gap-4 focus:outline-none focus-visible:ring-2"
                      style={{ padding: "20px 24px", background: "transparent", border: "none", cursor: "pointer" }}
                    >
                      <h3
                        className="flex-1 font-display"
                        style={{ color: C.primary, fontWeight: 600, fontSize: 17, margin: 0, lineHeight: 1.35 }}
                      >
                        {f.q}
                      </h3>
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
                    <div
                      style={{
                        maxHeight: open ? 400 : 0,
                        overflow: "hidden",
                        transition: "max-height 300ms ease",
                      }}
                    >
                      <p style={{ padding: "0 24px 20px 24px", margin: 0, color: C.text, fontSize: 15.5, lineHeight: 1.65 }}>
                        {f.a}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* SECTIE 8: WAAROM VOORTRAJECT — wit */}
        <section style={{ backgroundColor: "#FFFFFF" }} className="py-12 md:py-16">
          <div className="container-content">
            <div className="max-w-3xl">
              <H2>
                Waarom bewoners voor Voortraject <Gold>kiezen</Gold>
              </H2>
              <p style={{ marginTop: 16, fontSize: 17, lineHeight: 1.6 }}>
                Wat ons anders maakt dan een algemene subsidie-website of een ingehuurde callcenter-helpdesk.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-8">
              {why.map((w) => (
                <div key={w.t} style={cardStyle("on-white")}>
                  <div className="flex items-center gap-4">
                    <IconCircle Icon={w.icon} size={48} />
                    <h3
                      className="font-display"
                      style={{ color: C.primary, fontWeight: 700, fontSize: 20, margin: 0 }}
                    >
                      {w.t}
                    </h3>
                  </div>
                  <p style={{ marginTop: 12, fontSize: 15.5, lineHeight: 1.6 }}>{w.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTIE 9: FOOTER CTA — donkerblauw, compact */}
        <section style={{ backgroundColor: C.primary }} className="py-16 md:py-20">
          <div className="mx-auto px-6 text-center" style={{ maxWidth: 600 }}>
            <h2
              className="font-display"
              style={{ color: "#fff", fontWeight: 700, fontSize: "clamp(26px, 3.5vw, 36px)", lineHeight: 1.2 }}
            >
              Wil je sneller verder met je <Gold>verduurzaming</Gold>?
            </h2>
            <p style={{ marginTop: 16, color: "rgba(255,255,255,0.8)", fontSize: 16, lineHeight: 1.6 }}>
              Neem contact op. Wij rekenen voor jouw woning uit wat je via ISDE kunt krijgen, en hoe je optimaal combineert. Geen verplichtingen, geen verkooppraatje.
            </p>
            <div className="mt-8">
              <PrimaryBtn href="/contact">Plan een huisbezoek</PrimaryBtn>
            </div>
            <p style={{ marginTop: 24, color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
              Laatst bijgewerkt: {LAATST_BIJGEWERKT}
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default SubsidiesLandelijk;
