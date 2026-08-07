import { Check, HardHat, Wrench, Building2, Landmark, KeyRound, ClipboardCheck, Mail, Phone } from "lucide-react";
import { Header } from "@/components/Header";
import { Seo } from "@/components/Seo";
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

const verwachtingen = [
  "We nemen binnen 24 uur contact op",
  "Een kennismakingsgesprek van ongeveer 15 minuten, vrijblijvend",
  "We brengen in kaart waar jullie op vastlopen en waar wij kunnen helpen",
  "Geen verkooppraatje, wel een concreet vervolgplan",
];

// Bewust een korte pagina: hero, voor wie we werken, formulier. Wie meer wil
// weten, hoort dat liever in het kennismakingsgesprek dan in nog vier secties.
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
          style={{ backgroundColor: "hsl(var(--card))" }}
          aria-labelledby="zak-hero-title"
        >
          <div className="container-content">
            <div className="grid grid-cols-1 lg:grid-cols-[58fr_42fr] gap-10 lg:gap-12 items-center">
              <div style={{ textAlign: "left" }}>
                <h1
                  id="zak-hero-title"
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
                  style={{ color: "hsl(var(--muted-foreground))", fontSize: 18, fontWeight: 400, lineHeight: 1.6, maxWidth: 560, textAlign: "left" }}
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
                    boxShadow: "0 4px 24px hsl(var(--primary) / 0.06)",
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

        {/* CONTACT — sinds /contact bewoner-only is, loopt de zakelijke lead hier
            binnen. De CTA in de hero ankert naar deze sectie. */}
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
                  {verwachtingen.map((item) => (
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
      {/* Geen sluit-CTA: die zou pal onder het formulier nog een keer om dezelfde
          kennismaking vragen. */}
      <Footer />
    </div>
  );
};

export default Zakelijk;
