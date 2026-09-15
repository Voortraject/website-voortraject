import { ArrowRight, ChevronRight } from "lucide-react";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Seo } from "@/components/Seo";
import { CtaButton } from "@/components/CtaButton";
import { OfBelOnsCta } from "@/components/OfBelOnsCta";
import { SubsidiecheckCta } from "@/components/sections/SubsidiecheckCta";
import { Accent, Sectie, SectieKop } from "@/components/maatregel/primitieven";
import { KLEUR } from "@/components/maatregel/stijl";
import { MAATREGEL_VOLGORDE, MAATREGELEN, ROUTE, type MaatregelSlug } from "@/data/maatregelen";
import { SITE_URL } from "@/lib/site";

import heroImage from "@/assets/helpen-subsidies.webp";
// De spouwmuurfoto: dezelfde die op de isolatiepagina zelf de hero is. De kaart
// toonde eerder de kruipruimte-foto (maatregel-isolatie.webp); die vertelde
// vooral "iemand kruipt onder de vloer", terwijl dit beeld laat zien wat we
// doen: eerst kijken wat er in de muur zit.
import isolatieImage from "@/assets/helpen-isolatie.webp";
import zonnepanelenImage from "@/assets/maatregel-zonnepanelen.webp";
import warmtepompImage from "@/assets/maatregel-warmtepomp.webp";
import thuisbatterijImage from "@/assets/maatregel-thuisbatterij.jpg";
import laadpaalImage from "@/assets/maatregel-laadpaal.jpg";
import aircoImage from "@/assets/maatregel-airco.webp";
import onderhoudImage from "@/assets/maatregel-onderhoud.webp";

/**
 * Overzichtspagina voor /verduurzamen.
 *
 * Deze URL redirectte naar de homepage en de nav-knop "Verduurzamen" opende de
 * isolatiepagina, wat voor een bezoeker niet te volgen was. Nu is dit het
 * startpunt: de route in drie stappen, de zeven pagina's als kaarten, en een
 * eerlijk antwoord op "waar begin ik".
 *
 * De volgorde is hier de inhoud. Wie zonnepanelen legt op een slecht
 * geïsoleerde woning betaalt het meeste voor het minste resultaat, en dat is
 * precies wat een overzichtspagina hoort recht te zetten.
 */

const BEELD: Record<MaatregelSlug, string> = {
  isolatie: isolatieImage,
  zonnepanelen: zonnepanelenImage,
  warmtepomp: warmtepompImage,
  thuisbatterij: thuisbatterijImage,
  laadpaal: laadpaalImage,
  airco: aircoImage,
  onderhoud: onderhoudImage,
};

const ALT: Record<MaatregelSlug, string> = {
  isolatie: "Adviseur van Voortraject bekijkt met een inspectiecamera wat er in de spouwmuur zit",
  zonnepanelen: "Zonnepanelen op het dak van een woning",
  warmtepomp: "Adviseur bekijkt de instellingen van een warmtepomp",
  thuisbatterij: "Thuisbatterij aan een muur in een bijkeuken",
  laadpaal: "Laadpaal naast een elektrische auto op een oprit",
  onderhoud: "Adviseur controleert de leidingen en ventilatie binnenshuis",
  airco: "Buitenunit van een airco tegen een gevel",
};

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Verduurzamen", item: `${SITE_URL}/verduurzamen` },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Maatregelen om je woning te verduurzamen",
    itemListElement: [...MAATREGEL_VOLGORDE, "onderhoud" as MaatregelSlug].map((slug, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: MAATREGELEN[slug].label,
      item: `${SITE_URL}${MAATREGELEN[slug].href}`,
    })),
  },
];

const MaatregelKaart = ({ slug, groot = false }: { slug: MaatregelSlug; groot?: boolean }) => {
  const maatregel = MAATREGELEN[slug];
  return (
    <a
      href={maatregel.href}
      className={`group flex overflow-hidden rounded-2xl transition-shadow hover:shadow-lg ${
        groot ? "flex-col sm:flex-row" : "flex-col"
      }`}
      style={{ backgroundColor: KLEUR.wit, border: `1px solid ${KLEUR.rand}` }}
    >
      <div
        className={`overflow-hidden shrink-0 ${groot ? "sm:w-[280px]" : ""}`}
        style={{ aspectRatio: groot ? "16 / 10" : "16 / 9", backgroundColor: KLEUR.warm }}
      >
        <img
          src={BEELD[slug]}
          alt={ALT[slug]}
          width={800}
          height={450}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex-1 p-6 flex flex-col">
        <h3
          className="text-[19px] font-semibold"
          style={{ color: KLEUR.navy, margin: 0, lineHeight: 1.3 }}
        >
          {maatregel.label}
        </h3>
        <p
          className="text-[15.5px] leading-relaxed"
          style={{ color: KLEUR.navy, opacity: 0.72, margin: "10px 0 0 0" }}
        >
          {maatregel.kernvraag}
        </p>
        <span
          className="mt-5 inline-flex items-center gap-1.5 text-[15px] font-semibold"
          style={{ color: KLEUR.navy }}
        >
          Lees verder
          <ArrowRight
            size={15}
            aria-hidden="true"
            className="transition-transform group-hover:translate-x-0.5"
          />
        </span>
      </div>
    </a>
  );
};

const Verduurzamen = () => (
  <div className="min-h-screen flex flex-col" style={{ backgroundColor: KLEUR.zand }}>
    <Seo
      title="Verduurzamen | Voortraject"
      description="De verduurzamingsroute in drie stappen: eerst beperken wat je verbruikt, dan zelf opwekken, dan slim gebruiken. Met per maatregel wat het oplevert en waar je op let."
      path="/verduurzamen"
      jsonLd={jsonLd}
    />
    <Header />
    <main className="flex-1">
      {/* 1 — HERO */}
      <section
        data-bg="zand"
        className="w-full py-12 md:py-[72px]"
        style={{ backgroundColor: KLEUR.zand }}
      >
        <div className="mx-auto max-w-[1180px] px-6">
          <nav aria-label="Kruimelpad" className="mb-5">
            <ol
              className="flex flex-wrap items-center gap-1.5 text-[13px]"
              style={{ color: KLEUR.navy }}
            >
              <li>
                <a
                  href="/"
                  className="underline-offset-4 transition-colors hover:underline"
                  style={{ opacity: 0.7 }}
                >
                  Home
                </a>
              </li>
              <ChevronRight size={13} aria-hidden="true" style={{ opacity: 0.45 }} />
              <li aria-current="page" style={{ fontWeight: 600 }}>
                Verduurzamen
              </li>
            </ol>
          </nav>
          {/* Zelfde opzet als de hero van de zeven maatregelpagina's: tekst
              links, beeld rechts in 4/3. Zo herkent de bezoeker de sectie
              meteen als hij van een maatregelpagina naar de hub gaat. */}
          <div className="flex flex-col md:flex-row md:items-center gap-10 md:gap-12">
            <div className="md:flex-1 min-w-0">
            <h1
              className="font-display"
              style={{
                color: KLEUR.navy,
                fontWeight: 700,
                fontSize: "clamp(32px, 4.4vw, 48px)",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                margin: 0,
              }}
            >
              <Accent tekst="Verduurzamen, in de volgorde die [[werkt]]" />
            </h1>
            <p
              className="mt-5 text-base md:text-lg leading-relaxed"
              style={{ color: KLEUR.navy, opacity: 0.85, maxWidth: 560 }}
            >
              De volgorde bepaalt wat je overhoudt. Zonnepanelen op een tochtig huis leveren minder
              op dan dezelfde panelen op een geïsoleerd huis, en een warmtepomp in een slecht
              geïsoleerde woning verbruikt meer dan hij bespaart. Daarom eerst beperken, dan
              opwekken, dan slim gebruiken.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
              <CtaButton href="/subsidiecheck" variant="primary">
                Check jouw subsidies
                <ArrowRight size={16} />
              </CtaButton>
              <a
                href="/contact"
                className="inline-flex items-center gap-2 text-[15px] font-semibold underline-offset-4 transition-colors hover:underline"
                style={{ color: KLEUR.navy }}
              >
                Of plan een gratis gesprek
                <ArrowRight size={15} aria-hidden="true" />
              </a>
            </div>
            </div>
            <div
              className="md:flex-1 overflow-hidden rounded-2xl"
              style={{ border: `1px solid ${KLEUR.rand}`, aspectRatio: "4 / 3" }}
            >
              <img
                src={heroImage}
                alt="Adviseur van Voortraject bespreekt de mogelijkheden met een bewoner aan tafel"
                className="w-full h-full object-cover"
                style={{ objectPosition: "center 58%" }}
                width={1200}
                height={900}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2 — DE ROUTE IN DRIE STAPPEN */}
      <Sectie bg="navy" id="route">
        <div className="text-center">
          <SectieKop center opDonker>
            <Accent tekst="De route in [[drie]] stappen" />
          </SectieKop>
          <p
            className="mt-4 mx-auto text-base leading-relaxed"
            style={{ color: KLEUR.wit, opacity: 0.8, maxWidth: 660 }}
          >
            Elke stap maakt de volgende goedkoper. Sla je hem over, dan betaal je de rekening
            verderop.
          </p>
        </div>

        <ol
          className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5"
          style={{ listStyle: "none", padding: 0, margin: "40px 0 0 0" }}
        >
          {ROUTE.map((stap, i) => {
            const hier = MAATREGEL_VOLGORDE.filter((slug) => MAATREGELEN[slug].stap === stap.stap);
            return (
              <li
                key={stap.stap}
                className="rounded-2xl p-6 flex flex-col"
                style={{ backgroundColor: "hsl(var(--card) / 0.07)", border: "1px solid hsl(var(--card) / 0.14)" }}
              >
                <span
                  className="font-display tabular-nums"
                  style={{ color: KLEUR.goud, fontWeight: 700, fontSize: 26, lineHeight: 1 }}
                  aria-hidden="true"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3
                  className="mt-3 text-[19px] font-semibold"
                  style={{ color: KLEUR.wit, margin: "12px 0 0 0", lineHeight: 1.3 }}
                >
                  {stap.titel}
                </h3>
                <p
                  className="text-[15px] leading-relaxed"
                  style={{ color: KLEUR.wit, opacity: 0.78, margin: "10px 0 0 0" }}
                >
                  {stap.korte}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {hier.map((slug) => (
                    <a
                      key={slug}
                      href={MAATREGELEN[slug].href}
                      className="inline-flex items-center rounded-full px-3 py-1 text-[13px] font-medium transition-colors"
                      style={{
                        backgroundColor: "hsl(var(--card) / 0.1)",
                        border: "1px solid hsl(var(--card) / 0.2)",
                        color: KLEUR.wit,
                      }}
                    >
                      {MAATREGELEN[slug].label}
                    </a>
                  ))}
                </div>
              </li>
            );
          })}
        </ol>
      </Sectie>

      {/* 3 — ALLE MAATREGELEN */}
      <Sectie bg="wit" id="maatregelen">
        <div className="text-center">
          <SectieKop center>
            <Accent tekst="Elke maatregel, met de vraag die hij [[beantwoordt]]" />
          </SectieKop>
        </div>
        {/* Zes kaarten in drie kolommen vullen precies twee rijen. Onderhoud
            staat daarbuiten als brede kaart: het is geen maatregel maar wat er
            daarna komt, en als zevende kaart liet het een gat vallen. */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {MAATREGEL_VOLGORDE.map((slug) => (
            <MaatregelKaart key={slug} slug={slug} />
          ))}
        </div>
        <div className="mt-5">
          <span className="label-eyebrow">En daarna</span>
          <div className="mt-3">
            <MaatregelKaart slug="onderhoud" groot />
          </div>
        </div>
      </Sectie>

      {/* 4 — SUBSIDIECHECK
          De sectie "Waar begin ik" stond hier tussen. Die is er op verzoek uit:
          de route bovenaan beantwoordt die vraag al, en de subsidiecheck geeft
          het antwoord voor het eigen adres beter dan een alinea erover. */}
      <SubsidiecheckCta />
    </main>
    <Footer
      cta={
        <section className="w-full py-12 md:py-[72px]">
          <div className="mx-auto max-w-[760px] px-6 text-center">
            <h2
              className="font-display"
              style={{
                color: KLEUR.wit,
                fontWeight: 700,
                fontSize: "clamp(26px, 3.2vw, 36px)",
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
                margin: 0,
              }}
            >
              <Accent tekst="Welke stap is bij jou de [[eerste]]?" />
            </h2>
            <p
              className="mt-4 text-base md:text-lg leading-relaxed"
              style={{ color: KLEUR.wit, opacity: 0.85 }}
            >
              In een gratis gesprek kijken we naar je woning, je plannen en je budget, en zetten we
              op een rij welke maatregelen in welke volgorde het meeste opleveren. Zonder
              verkooppraatje, want wij leveren zelf niets.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-5">
              <a
                href="/contact"
                className="inline-flex items-center justify-center rounded-full font-semibold transition-transform hover:scale-[1.02]"
                style={{
                  backgroundColor: KLEUR.goud,
                  color: KLEUR.navy,
                  padding: "14px 28px",
                  fontSize: 15,
                }}
              >
                Plan een gratis gesprek
              </a>
              <OfBelOnsCta color="#FFFFFF" align="center" />
            </div>
          </div>
        </section>
      }
    />
  </div>
);

export default Verduurzamen;
