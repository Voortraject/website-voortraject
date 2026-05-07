import { Check, Inbox, FileText, Bell, X, PhoneCall, MessageCircle, FolderOpen, AlertCircle } from "lucide-react";

const withoutItems = [
  "Bewoners bellen en appen dezelfde vragen, keer op keer",
  "Elk nieuw dossier kost uren aan uitleg en terugzoeken",
  "Offertes liggen te wachten terwijl de bouwplanning doorloopt",
  "Mails, appjes en notities verspreid over vijf plekken, niets compleet",
  "Na uitvoering blijven facturen, stukken en openstaande acties hangen",
  "Groeien betekent meer kantoorwerk erbij, niet minder",
];

const withItems = [
  "Wij vangen bewonersvragen en uitleg aan de voorkant op.",
  "Wij helpen plannen, maatregelen en keuzes helder doorlopen.",
  "Wij bereiden offertes en dossiers overzichtelijk voor.",
  "Wij houden opvolging en akkoordmomenten scherp in beeld.",
  "Wij helpen ook na uitvoering overzicht houden op wat nog openstaat (het natraject).",
  "Jullie houden de volledige focus op planning, uitvoering en groei.",
];
import { Header } from "@/components/Header";
import { Why } from "@/components/sections/Why";
import { Footer } from "@/components/Footer";
import heroUitvoerders from "@/assets/uitvoerders-hero.jpg";

type Package = {
  title: string;
  subtitle: string;
  bullets: string[];
  result: string;
  badge: string | null;
  featured?: boolean;
};

const packages: Package[] = [
  {
    title: "Offerte & dossier",
    subtitle: "Voor uitvoerders die tijd verliezen op papierwerk en dossiervorming.",
    bullets: [
      "Offertevoorbereiding en opmaak",
      "Dossieropbouw en controle",
      "Overdracht compleet dossier",
    ],
    result: "Jullie aanvraag gaat sneller van intake naar klaar dossier, zonder dat er iets tussenuit valt.",
    badge: null,
  },
  {
    title: "Akkoord & begeleiding",
    subtitle: "Voor uitvoerders die bewonersvragen en opvolging tot akkoord willen loslaten.",
    bullets: [
      "Alles uit Offerte & dossier",
      "Begeleiding rond akkoordtraject",
      "Uitleg plannen en regelingen",
      "Opvolging tot getekend akkoord",
    ],
    result: "Geen bewoners meer die wachten op uitleg of het akkoord niet begrijpen. Jullie hoeven niet meer terug te bellen.",
    badge: null,
  },
  {
    title: "Totaal Ontzorging",
    subtitle: "Voor uitvoerders die het volledige voortraject buiten de deur willen zetten.",
    bullets: [
      "Alles uit Akkoord & begeleiding",
      "Intake en eerste bewonerscontact",
      "Bewonerscommunicatie tot overdracht",
      "Overzicht op natraject en nazorg",
      "Begeleiding tot 5-sterren review",
    ],
    result: "Jullie bouwen. Wij regelen alles van eerste bewonerscontact tot afgerond traject.",
    badge: "Meest gekozen",
    featured: true,
  },
  {
    title: "AI-workflow ondersteuning",
    subtitle: "Voor uitvoerders die het voortraject intern willen houden, maar veel efficiënter willen werken.",
    bullets: [
      "Slimme intake en dossieropbouw",
      "Snelle offertevoorbereiding",
      "Opvolging openstaande acties",
      "Grip op wat na uitvoering blijft hangen",
    ],
    result: "Minder handmatig werk intern, betere opvolging, en sneller van aanvraag naar uitvoering.",
    badge: null,
  },
  {
    title: "Nazorg Traject",
    subtitle: "Voor de uitvoerder die grip wil op de afronding en een vlekkeloze reputatie.",
    bullets: [
      "Facturatie per uitvoering",
      "Vervolgplanning voor woning",
      "Begeleiding naar 5-sterren review",
      "Eén vast aanspreekpunt",
    ],
    result: "Facturen sneller betaald, reviews die binnenkomen, en bewoners die jullie blijven aanbevelen.",
    badge: null,
  },
];

const whyCards = [
  {
    icon: Inbox,
    title: "Automatische intake",
    body: "Geen verloren contactmomenten meer in mails of appjes.",
  },
  {
    icon: FileText,
    title: "Slimme offertevoorbereiding",
    body: "Sneller van plan naar akkoord zonder dat het blijft liggen.",
  },
  {
    icon: Bell,
    title: "Opvolging zonder gejaag",
    body: "Grip op openstaande acties en losse eindjes, ook na uitvoering.",
  },
];

const ctaButton =
  "inline-flex items-center justify-center font-sans font-semibold text-[15px] transition-colors";

const Uitvoerders = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        {/* HERO */}
        <section
          className="pt-8 md:pt-12 pb-[56px] md:pb-[80px]"
          style={{ backgroundColor: "#FFFFFF" }}
          aria-labelledby="uitv-hero-title"
        >
          <div className="container-content">
            <div className="grid grid-cols-1 lg:grid-cols-[58fr_42fr] gap-10 lg:gap-12 items-center">
              <div style={{ textAlign: "left" }}>
                <h1
                  id="uitv-hero-title"
                  className="font-display font-semibold"
                  style={{
                    color: "#2B2B2B",
                    fontSize: "clamp(32px, 3.6vw, 48px)",
                    lineHeight: 1.15,
                    letterSpacing: "-0.02em",
                    maxWidth: 720,
                    textAlign: "left",
                  }}
                >
                  Wij vangen het{" "}
                  <span style={{ color: "hsl(var(--accent))" }}>voortraject</span>{" "}
                  op, zodat jullie kunnen bouwen
                </h1>
                <p
                  className="mt-8"
                  style={{ color: "#6B6B6B", fontSize: 18, fontWeight: 400, lineHeight: 1.6, maxWidth: 560, textAlign: "left" }}
                >
                  Wij nemen bewonerscontact, offerte-opvolging, akkoordtrajecten en nazorg uit handen, zodat jullie minder tijd verliezen aan kantoorwerk en meer focus houden op de uitvoering.
                </p>
                <div className="mt-10" style={{ textAlign: "left" }}>
                  <a
                    href="/contact"
                    className={`${ctaButton} w-full sm:w-auto`}
                    style={{
                      backgroundColor: "#E8B547",
                      color: "#2B2B2B",
                      padding: "14px 32px",
                      borderRadius: 8,
                      minHeight: 44,
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#D9A538")}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#E8B547")}
                  >
                    Plan een kennismaking
                  </a>
                </div>
              </div>
              <div>
                <img
                  src={heroUitvoerders}
                  alt="Uitvoerder en adviseur bespreken plannen bij zonnepanelen"
                  loading="lazy"
                  className="w-full object-cover"
                  style={{
                    height: "clamp(280px, 38vw, 480px)",
                    borderRadius: 16,
                    boxShadow: "0 4px 24px rgba(21,44,78,0.06)",
                    objectPosition: "center",
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* VOORTRAJECT VERGELIJKING */}
        <section className="py-[64px] md:py-[96px]" style={{ backgroundColor: "#F9F9F7" }}>
          <div className="container-content">
            <h2 className="h2-section text-center mx-auto" style={{ color: "#152C4E", maxWidth: 900 }}>
              Voor en <span style={{ color: "hsl(var(--accent))" }}>na</span>
            </h2>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-stretch">
              {/* Zonder */}
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 16,
                  padding: 40,
                  boxShadow: "0 4px 24px rgba(21,44,78,0.06)",
                }}
              >
                <h3
                  className="font-display font-semibold"
                  style={{ fontSize: 24, color: "#152C4E", letterSpacing: "-0.01em", lineHeight: 1.3, marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #E5E2DB" }}
                >
                  Zonder Voortraject
                </h3>
                <ul className="space-y-5">
                  {withoutItems.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span
                        className="flex items-center justify-center rounded-full flex-shrink-0"
                        style={{ width: 24, height: 24, backgroundColor: "#FBE5E5", marginTop: 2 }}
                      >
                        <X size={14} color="#C0392B" strokeWidth={3} aria-hidden="true" />
                      </span>
                      <span style={{ fontSize: 16, color: "#152C4E", lineHeight: 1.6 }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Met */}
              <div
                style={{
                  backgroundColor: "#FFFFFF",
                  border: "2px solid #E8B547",
                  borderRadius: 16,
                  padding: 40,
                  boxShadow: "0 4px 24px rgba(21,44,78,0.06)",
                }}
              >
                <h3
                  className="font-display font-semibold"
                  style={{ fontSize: 24, color: "#152C4E", letterSpacing: "-0.01em", lineHeight: 1.3, marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #F0E4D0" }}
                >
                  Met Voortraject
                </h3>
                <ul className="space-y-5">
                  {withItems.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span
                        className="flex items-center justify-center rounded-full flex-shrink-0"
                        style={{ width: 24, height: 24, backgroundColor: "#F0E4D0", marginTop: 2 }}
                      >
                        <Check size={14} color="#E8B547" strokeWidth={3} aria-hidden="true" />
                      </span>
                      <span style={{ fontSize: 16, color: "#152C4E", lineHeight: 1.6 }}>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-16 text-center flex flex-col items-stretch sm:items-center">
              <a
                href="/contact"
                className={`${ctaButton} w-full sm:w-auto`}
                style={{
                  backgroundColor: "#E8B547",
                  color: "#2B2B2B",
                  padding: "14px 32px",
                  borderRadius: 8,
                  minHeight: 44,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#D9A538")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#E8B547")}
              >
                Plan een kennismaking
              </a>
            </div>
          </div>
        </section>

        {/* INLEIDING PAKKETTEN */}
        <section className="py-[64px] md:py-[96px]" style={{ backgroundColor: "#FFFFFF" }}>
          <div className="container-content">
            <div className="mx-auto" style={{ maxWidth: 820 }}>
              <h2
                className="h2-section text-center"
                style={{ color: "#152C4E", marginBottom: 32 }}
              >
                Waar uitvoerders in dit soort trajecten op{" "}
                <span style={{ color: "hsl(var(--accent))" }}>vastlopen</span>
              </h2>
              <p
                className="text-center mx-auto"
                style={{
                  maxWidth: 768,
                  fontSize: 18,
                  lineHeight: 1.6,
                  color: "#152C4E",
                  marginBottom: 48,
                }}
              >
                De meeste tijd lekt niet weg op de bouwplaats, maar in alles eromheen. Vijf plekken waar uitvoerders structureel op vastlopen:
              </p>
            </div>

            {(() => {
              const painCards = [
                { icon: PhoneCall, title: "Bewonersvragen blijven binnenkomen", body: "Telefoontjes en appjes over planning, maatregelen en verwachtingen blijven naar jullie kant lopen." },
                { icon: MessageCircle, title: "Plannen steeds opnieuw uitleggen", body: "Isolatieplannen en losse maatregelen vragen tijd om iedere keer toe te lichten aan een nieuwe bewoner." },
                { icon: FileText, title: "Offertes blijven liggen", body: "Tussen uitvoering door komen offertes vaak pas 's avonds aan de beurt, en blijven dan hangen." },
                { icon: FolderOpen, title: "Dossiers raken versnipperd", body: "Afspraken, mails en notities zitten verspreid over verschillende plekken. Iets compleet maken kost tijd." },
                { icon: AlertCircle, title: "Na uitvoering blijft er hangen", body: "Facturen, ontbrekende stukken en openstaande acties krijgen geen prioriteit als de bouw weer roept." },
              ];
              const renderCard = (c: typeof painCards[number]) => {
                const Icon = c.icon;
                return (
                  <article
                    key={c.title}
                    className="card flex flex-col"
                    style={{
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #E5E2DB",
                      borderRadius: 16,
                      padding: 24,
                      gap: 12,
                    }}
                  >
                    <div className="flex flex-row items-center gap-3">
                      <Icon size={22} color="#E8B547" strokeWidth={2} className="shrink-0" aria-hidden="true" />
                      <h3 style={{ color: "#152C4E", fontSize: 16, fontWeight: 600, margin: 0, lineHeight: 1.3 }}>{c.title}</h3>
                    </div>
                    <p style={{ color: "#152C4E", opacity: 0.75, fontSize: 14, lineHeight: 1.5, margin: 0 }}>{c.body}</p>
                  </article>
                );
              };
              return (
                <div className="card-grid">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" style={{ gap: 16 }}>
                    {painCards.slice(0, 3).map(renderCard)}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 mx-auto" style={{ gap: 16, maxWidth: "42rem", marginTop: 16 }}>
                    {painCards.slice(3).map(renderCard)}
                  </div>
                </div>
              );
            })()}

            <p
              className="text-center mx-auto"
              style={{
                maxWidth: "42rem",
                marginTop: 32,
                color: "#152C4E",
                fontSize: 18,
                fontWeight: 500,
                fontStyle: "italic",
                lineHeight: 1.5,
              }}
            >
              Juist op deze plekken brengen wij overzicht en rust terug.
            </p>
          </div>
        </section>

        {/* PAKKETTEN */}
        <section id="pakketten" className="py-[64px] md:py-[96px]" style={{ backgroundColor: "#F9F9F7" }}>
          <div className="container-content">
            <h2 className="h2-section text-center mx-auto" style={{ color: "#152C4E" }}>
              <span style={{ color: "hsl(var(--accent))" }}>Kies</span> wat past bij jullie
            </h2>
            <p
              className="mt-6 text-[18px] text-center mx-auto"
              style={{ color: "#6B6B6B", lineHeight: 1.6, maxWidth: 720 }}
            >
              Vijf pakketten, van losse offerte- en dossieropbouw tot volledige ontzorging.
            </p>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 items-stretch">
              {packages.map((p, i) => {
                const colStart = i === 3 ? "lg:col-start-2" : "";
                const borderColor = p.featured ? "#E8B547" : "#E5E2DB";
                const borderWidth = p.featured ? "2px" : "1px";

                return (
                  <article
                    key={p.title}
                    className={`relative flex flex-col transition-all duration-200 ease-out lg:col-span-2 ${colStart}`}
                    style={{
                      backgroundColor: "#FFFFFF",
                      borderRadius: 16,
                      padding: 32,
                      border: `${borderWidth} solid ${borderColor}`,
                      boxShadow: "0 4px 24px rgba(21,44,78,0.04)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "0 8px 32px rgba(21,44,78,0.08)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "0 4px 24px rgba(21,44,78,0.04)";
                    }}
                  >
                    {p.badge && (
                      <span
                        className="absolute font-sans font-semibold"
                        style={{
                          top: 16,
                          right: 16,
                          backgroundColor: "#E8B547",
                          color: "#2B2B2B",
                          padding: "6px 12px",
                          borderRadius: 999,
                          fontSize: 12,
                        }}
                      >
                        {p.badge}
                      </span>
                    )}
                    <h3
                      className="font-display font-semibold"
                      style={{
                        fontSize: 20,
                        color: "#152C4E",
                        letterSpacing: "-0.02em",
                        lineHeight: 1.25,
                        paddingRight: p.badge ? 110 : 0,
                      }}
                    >
                      {p.title}
                    </h3>
                    <p
                      style={{
                        marginTop: 8,
                        fontSize: 13,
                        color: "#6B6B6B",
                        lineHeight: 1.4,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                      title={p.subtitle}
                    >
                      {p.subtitle}
                    </p>
                    <hr style={{ margin: "20px 0", border: "none", borderTop: "1px solid #E5E2DB" }} />
                    <ul className="space-y-3">
                      {p.bullets.map((b) => (
                        <li key={b} className="flex items-center gap-3">
                          <span
                            className="flex items-center justify-center rounded-full flex-shrink-0"
                            style={{
                              width: 20,
                              height: 20,
                              backgroundColor: "#F0E4D0",
                            }}
                          >
                            <Check size={12} color="#E8B547" strokeWidth={3} aria-hidden="true" />
                          </span>
                          <span
                            className="lg:whitespace-nowrap lg:overflow-hidden lg:text-ellipsis"
                            style={{
                              fontSize: 14,
                              color: "#2B2B2B",
                              lineHeight: 1.4,
                            }}
                          >
                            {b}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <div
                      style={{
                        marginTop: 24,
                        padding: 16,
                        backgroundColor: "#FFFFFF",
                        borderRadius: 10,
                        border: "1px solid #ECE7DD",
                      }}
                    >
                      <p
                        className="font-sans font-semibold"
                        style={{
                          fontSize: 12,
                          color: "#152C4E",
                          letterSpacing: "0.04em",
                          textTransform: "uppercase",
                          marginBottom: 6,
                        }}
                      >
                        Wat het oplevert
                      </p>
                      <p style={{ fontSize: 14, color: "#2B2B2B", lineHeight: 1.55 }}>{p.result}</p>
                    </div>

                    <div style={{ marginTop: "auto", paddingTop: 24 }}>
                      <a
                        href="/contact"
                        className={`${ctaButton} w-full`}
                        style={{
                          backgroundColor: "#E8B547",
                          color: "#2B2B2B",
                          padding: "12px 20px",
                          borderRadius: 8,
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#D9A538")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#E8B547")}
                      >
                        Selecteer pakket
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* WAAROM DIT WERKT */}
        <section className="py-[64px] md:py-[96px]" style={{ backgroundColor: "#FFFFFF" }}>
          <div className="container-content">
            <div className="text-center mx-auto" style={{ maxWidth: 820 }}>
              <h2 className="h2-section" style={{ color: "#152C4E", marginBottom: 16 }}>
                Menselijke begeleiding, <span style={{ color: "#E8B547" }}>ondersteund</span> door slimme systemen
              </h2>
              <p
                className="mx-auto"
                style={{ fontSize: 17, color: "#6B6B6B", lineHeight: 1.6, marginBottom: 48 }}
              >
                Eén lijn voor bewonerscontact, offertes en dossiers, ondersteund door slimme systemen die voorkomen dat er iets blijft liggen.
              </p>
            </div>
            <div className="card-grid grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              {whyCards.map(({ icon: Icon, title, body }) => (
                <article
                  key={title}
                  className="card bg-white flex flex-col"
                  style={{
                    borderRadius: 16,
                    padding: 32,
                    border: "1px solid #E5E2DB",
                    boxShadow: "0 4px 24px rgba(21,44,78,0.04)",
                  }}
                >
                  <div className="flex flex-row items-center" style={{ gap: 12 }}>
                    <div
                      className="flex items-center justify-center rounded-full shrink-0"
                      style={{ width: 48, height: 48, backgroundColor: "#F0E4D0" }}
                    >
                      <Icon size={22} color="#152C4E" strokeWidth={2.25} aria-hidden="true" />
                    </div>
                    <h3
                      className="font-display"
                      style={{
                        fontSize: "1.05rem",
                        fontWeight: 600,
                        color: "#152C4E",
                        letterSpacing: "-0.01em",
                        lineHeight: 1.3,
                        margin: 0,
                      }}
                    >
                      {title}
                    </h3>
                  </div>
                  <p style={{ marginTop: 16, fontSize: 15, color: "#6B6B6B", lineHeight: 1.6 }}>
                    {body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <Why />

        {/* SLUIT-CTA */}
        <section
          className="text-primary-foreground py-[56px] md:py-[80px]"
          style={{ backgroundColor: "#152C4E" }}
        >
          <div className="container-content text-center flex flex-col items-center">
            <h2
              className="font-display"
              style={{
                fontWeight: 600,
                fontSize: "clamp(28px, 4.5vw, 44px)",
                color: "#FFFFFF",
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
                maxWidth: 900,
                marginBottom: 20,
              }}
            >
              Zoek je extra capaciteit zonder extra kantoorlast?
            </h2>
            <p
              style={{
                color: "rgba(255,255,255,0.85)",
                fontSize: 17,
                lineHeight: 1.6,
                maxWidth: 760,
                marginBottom: 32,
              }}
            >
              Wij helpen uitvoerders sneller schakelen in bewonerscontact, offerte-opbouw, opvolging en dossiervorming.
            </p>
            <a
              href="/contact"
              className={ctaButton}
              style={{
                backgroundColor: "#E8B547",
                color: "#2B2B2B",
                padding: "14px 32px",
                borderRadius: 8,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#D9A538")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#E8B547")}
            >
              Plan een kennismaking
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Uitvoerders;
