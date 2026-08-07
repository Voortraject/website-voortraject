import {
  Check, Inbox, FileText, Bell, X, PhoneCall, MessageCircle, FolderOpen, AlertCircle,
  HardHat, Wrench, Building2, Landmark, KeyRound, ClipboardCheck, Mail, Phone,
} from "lucide-react";
import { BorderRotate } from "@/components/ui/animated-gradient-border";

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
import { Seo } from "@/components/Seo";
import { Why } from "@/components/sections/Why";
import { Footer } from "@/components/Footer";
import { OfBelOnsCta } from "@/components/OfBelOnsCta";
import { CtaButton } from "@/components/CtaButton";
import { ZakelijkContactFormulier } from "@/components/ZakelijkContactFormulier";
import heroUitvoerders from "@/assets/partners-overleg.webp";

// De typen bedrijven waarmee we samenwerken. Uitvoerders blijven de kern van de
// pagina; dit blok laat zien dat het daar niet bij ophoudt.
const doelgroepen = [
  {
    icon: HardHat,
    title: "Uitvoerders en aannemers",
    body: "Isolatie-, bouw- en verduurzamingsbedrijven die het voorwerk en de nazorg uit handen willen geven.",
  },
  {
    icon: Wrench,
    title: "Installateurs",
    body: "Warmtepompen, zonnepanelen, laadpalen. Wij regelen de intake, de subsidiekant en de opvolging eromheen.",
  },
  {
    icon: Building2,
    title: "VvE-beheerders",
    body: "Trajecten met veel eigenaren en besluitvorming. Wij houden bewoners aangehaakt en het dossier compleet.",
  },
  {
    icon: Landmark,
    title: "Woningcorporaties",
    body: "Ondersteuning bij bewonerscommunicatie en dossiervorming rond de verduurzaming van het bezit.",
  },
  {
    icon: KeyRound,
    title: "Makelaars",
    body: "Kopers en verkopers met verduurzamingsvragen kunnen bij ons terecht voor onafhankelijk advies.",
  },
  {
    icon: ClipboardCheck,
    title: "Energieadviseurs",
    body: "Het advies is jullie werk. Wij pakken het traject eromheen op, van offerte tot oplevering.",
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

const Zakelijk = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Seo
        title="Zakelijk | Voortraject"
        description="Voortraject ontzorgt uitvoerders, installateurs en andere bedrijven in het voortraject: wij vangen bewonersvragen op, bereiden dossiers voor en bewaken opvolging."
        path="/zakelijk"
      />
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
                  className="font-display"
                  style={{
                    color: "hsl(var(--primary))",
                    fontWeight: 700,
                    fontSize: "clamp(32px, 3.6vw, 48px)",
                    lineHeight: 1.15,
                    letterSpacing: "-0.03em",
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
                  Uitvoerders, installateurs en andere bedrijven in verduurzaming werken met ons samen. Wij nemen bewonerscontact, offerte-opvolging, akkoordtrajecten en nazorg uit handen, zodat jullie team zich richt op planning en uitvoering.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5" style={{ textAlign: "left" }}>
                  <CtaButton href="#contact" className="px-8 w-full sm:w-auto">
                    Plan een kennismaking
                  </CtaButton>
                  <OfBelOnsCta />
                </div>
              </div>
              <div>
                <img
                  src={heroUitvoerders}
                  alt="Adviseur van Voortraject neemt het adviesgesprek met een bewoner uit handen aan de keukentafel"
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

        {/* VOOR WIE WE WERKEN */}
        <section
          className="py-[48px] md:py-[72px]"
          style={{ backgroundColor: "var(--card-soft)" }}
          aria-labelledby="zak-doelgroepen-title"
        >
          <div className="container-content">
            <div className="text-center mx-auto" style={{ maxWidth: 820 }}>
              <h2 id="zak-doelgroepen-title" className="h2-section" style={{ color: "hsl(var(--primary))", marginBottom: 16 }}>
                Voor wie we <span style={{ color: "hsl(var(--accent))" }}>werken</span>
              </h2>
              <p
                className="mx-auto"
                style={{ fontSize: 17, color: "hsl(var(--muted-foreground))", lineHeight: 1.6, marginBottom: 48 }}
              >
                Uitvoerders vormen de kern van ons werk, maar het voortraject speelt bij meer partijen. Herken je jezelf hierin, dan past een kennismaking.
              </p>
            </div>
            <div className="card-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 items-stretch">
              {doelgroepen.map(({ icon: Icon, title, body }) => (
                <article
                  key={title}
                  className="card flex flex-col bg-card border border-border"
                  style={{ borderRadius: 16, padding: 24, gap: 12 }}
                >
                  <div className="flex flex-row items-center gap-3">
                    <div
                      className="flex items-center justify-center rounded-full shrink-0"
                      style={{ width: 44, height: 44, backgroundColor: "hsl(var(--secondary))" }}
                    >
                      <Icon size={20} color="hsl(var(--primary))" strokeWidth={2.25} aria-hidden="true" />
                    </div>
                    <h3
                      className="font-display"
                      style={{ fontSize: 16, fontWeight: 600, color: "hsl(var(--primary))", lineHeight: 1.3, margin: 0 }}
                    >
                      {title}
                    </h3>
                  </div>
                  <p style={{ fontSize: 14, color: "hsl(var(--muted-foreground))", lineHeight: 1.55, margin: 0 }}>
                    {body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* VASTLOPEN */}
        <section className="py-[48px] md:py-[72px]" style={{ backgroundColor: "#F9F9F7" }}>
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
                { icon: MessageCircle, title: "Plannen steeds opnieuw uitleggen", body: "Verduurzamingsplannen en losse maatregelen vragen tijd om iedere keer toe te lichten aan een nieuwe bewoner." },
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

        {/* WAT BLIJFT LIGGEN */}
        <Why />

        {/* VOORTRAJECT VERGELIJKING */}
        <section className="py-[48px] md:py-[72px]" style={{ backgroundColor: "#F9F9F7" }}>
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
              <BorderRotate
                animationMode="auto-rotate"
                animationSpeed={4}
                gradientColors={{ primary: '#92701a', secondary: '#c9a227', accent: '#f5d176' }}
                backgroundColor="#ffffff"
                borderWidth={2}
                borderRadius={12}
              >
                <div
                  style={{
                    backgroundColor: "#FFFFFF",
                    borderRadius: 10,
                    padding: 40,
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
              </BorderRotate>
            </div>

            <div className="mt-16 text-center flex flex-col items-stretch sm:items-center">
              <CtaButton href="#contact" className="px-8 w-full sm:w-auto">
                Plan een kennismaking
              </CtaButton>
            </div>
          </div>
        </section>

        {/* WAAROM DIT WERKT */}
        <section className="py-[48px] md:py-[72px]" style={{ backgroundColor: "#FFFFFF" }}>
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

        {/* CONTACT — sinds /contact bewoner-only is, loopt de zakelijke lead hier
            binnen. De CTA's op deze pagina ankeren naar deze sectie. */}
        <section
          id="contact"
          className="py-[48px] md:py-[72px] scroll-mt-24"
          style={{ backgroundColor: "hsl(var(--background))" }}
          aria-labelledby="zak-contact-title"
        >
          <div className="container-content">
            <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8 lg:gap-12 items-start">
              <div
                className="bg-card border border-border p-7 md:p-10"
                style={{ borderRadius: 16, boxShadow: "0 4px 24px hsl(var(--primary) / 0.06)" }}
              >
                <h2
                  id="zak-contact-title"
                  className="font-display"
                  style={{ fontSize: 26, fontWeight: 600, color: "hsl(var(--primary))", letterSpacing: "-0.01em", lineHeight: 1.25, marginBottom: 8 }}
                >
                  Plan een kennismaking
                </h2>
                <p style={{ fontSize: 15, color: "hsl(var(--muted-foreground))", lineHeight: 1.6, marginBottom: 24 }}>
                  Vertel ons kort over jullie bedrijf. Hoe meer we vooraf weten, hoe scherper we het gesprek kunnen voeren.
                </p>
                <ZakelijkContactFormulier />
              </div>

              <div className="lg:pt-4">
                <h3
                  className="font-display"
                  style={{ fontSize: 20, fontWeight: 600, color: "hsl(var(--primary))", lineHeight: 1.3, marginBottom: 16 }}
                >
                  Wat kun je verwachten?
                </h3>
                <ul className="space-y-4" style={{ marginBottom: 32 }}>
                  {[
                    "We nemen binnen 24 uur contact op",
                    "Een kennismakingsgesprek van ongeveer 15 minuten, vrijblijvend",
                    "We brengen in kaart waar jullie op vastlopen en waar wij kunnen helpen",
                    "Geen verkooppraatje, wel een concreet vervolgplan",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span
                        className="flex items-center justify-center rounded-full flex-shrink-0"
                        style={{ width: 24, height: 24, backgroundColor: "hsl(var(--secondary))", marginTop: 2 }}
                      >
                        <Check size={14} color="hsl(var(--accent))" strokeWidth={3} aria-hidden="true" />
                      </span>
                      <span style={{ fontSize: 15, color: "hsl(var(--primary))", lineHeight: 1.6 }}>{item}</span>
                    </li>
                  ))}
                </ul>

                <h3
                  className="font-display"
                  style={{ fontSize: 20, fontWeight: 600, color: "hsl(var(--primary))", lineHeight: 1.3, marginBottom: 16 }}
                >
                  Liever direct contact?
                </h3>
                <div className="flex flex-col gap-3">
                  <a
                    href="tel:+31502112689"
                    className="inline-flex items-center gap-3 hover:text-accent transition-colors"
                    style={{ fontSize: 15, color: "hsl(var(--primary))" }}
                  >
                    <Phone size={18} strokeWidth={2} aria-hidden="true" />
                    050 211 2689
                  </a>
                  <a
                    href="mailto:info@voortraject.nl"
                    className="inline-flex items-center gap-3 hover:text-accent transition-colors"
                    style={{ fontSize: 15, color: "hsl(var(--primary))" }}
                  >
                    <Mail size={18} strokeWidth={2} aria-hidden="true" />
                    info@voortraject.nl
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer
        cta={
          /* SLUIT-CTA */
          <section className="text-primary-foreground py-[56px] md:py-[80px]">
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
                Wil je sneller van aanvraag naar uitvoering, zonder extra kantoorlast?
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
                Wij nemen het voortraject uit handen. Jullie houden de focus op bouwen.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
                <CtaButton href="#contact" className="px-8 w-full sm:w-auto">
                  Plan een kennismaking
                </CtaButton>
                <OfBelOnsCta color="#FFFFFF" align="center" />
              </div>
            </div>
          </section>
        }
      />
    </div>
  );
};

export default Zakelijk;
