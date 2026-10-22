import { useRef } from "react";
import { ArrowRight, Search } from "lucide-react";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Seo } from "@/components/Seo";
import { CtaButton } from "@/components/CtaButton";
import { SubsidiecheckCta } from "@/components/sections/SubsidiecheckCta";
import { Kruimelpad } from "@/components/maatregel/Kruimelpad";
import { SlotCta } from "@/components/maatregel/SlotCta";
import { Accent, NummerRondje, Sectie, SectieKop } from "@/components/maatregel/primitieven";
import { MAATREGEL_VOLGORDE, MAATREGELEN, ROUTE, type MaatregelSlug } from "@/data/maatregelen";
import { useStaffel } from "@/lib/beweging";
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
  // Op de telefoon een lage tegel met de foto ernaast, zodat zeven kaarten
  // geen zeven schermen kosten; vanaf sm de foto erboven (of ernaast voor de
  // brede onderhoudskaart).
  return (
    <a
      href={maatregel.href}
      className={`vd-beeld hs-tegel hs-klik group flex h-full flex-row overflow-hidden ${
        groot ? "" : "sm:flex-col"
      }`}
      data-veer
    >
      <div
        className={`relative w-[112px] shrink-0 overflow-hidden bg-[hsl(var(--rs-hoofd-midden))] ${
          groot ? "sm:min-h-[190px] sm:w-[280px]" : "sm:aspect-video sm:w-full"
        }`}
      >
        <img
          src={BEELD[slug]}
          alt={ALT[slug]}
          width={800}
          height={450}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col px-4 py-4 sm:p-6">
        <h3 className="hs-h3 m-0">{maatregel.label}</h3>
        <p className="vd-tekst mb-0 mt-1.5 sm:mt-2 sm:text-[15.5px]">{maatregel.kernvraag}</p>
        <span className="hs-pijl-link mt-2 sm:mt-auto sm:pt-4">
          Lees verder
          <ArrowRight size={17} strokeWidth={2.2} className="hs-pijl" aria-hidden="true" />
        </span>
      </div>
    </a>
  );
};

const Verduurzamen = () => {
  const mainRef = useRef<HTMLElement>(null);
  useStaffel(mainRef);
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Seo
        title="Verduurzamen | Voortraject"
        description="De verduurzamingsroute in drie stappen: eerst beperken wat je verbruikt, dan zelf opwekken, dan slim gebruiken. Met per maatregel wat het oplevert en waar je op let."
        path="/verduurzamen"
        jsonLd={jsonLd}
      />
      <Header ctaNaElement="verduurzamen-hero-knop" />
      <main className="flex-1" ref={mainRef}>
        {/* 1 — HERO */}
        <section data-bg="zand" className="w-full bg-background pt-5 pb-12 md:pt-8 md:pb-20">
          <div className="mx-auto max-w-[1180px] px-6">
            <Kruimelpad />
            {/* Zelfde opzet als de hero van de zeven maatregelpagina's: tekst
                links, beeld rechts. Zo herkent de bezoeker de sectie meteen als
                hij van een maatregelpagina naar de hub gaat. */}
            <div className="flex flex-col gap-8 md:flex-row md:items-center md:gap-12">
              <div className="min-w-0 md:flex-1">
                <h1
                  className="m-0 text-[clamp(29px,8.2vw,34px)] font-bold leading-[1.08] tracking-[-0.03em] text-primary md:text-[clamp(38px,4.4vw,52px)] [text-wrap:balance]"
                  style={{ fontFamily: "'Inter Tight', 'Inter', sans-serif" }}
                >
                  <Accent tekst="Verduurzamen, in de volgorde die [[werkt]]" />
                </h1>
                <p className="vd-lead mt-4 max-w-[560px] md:mt-5">
                  De volgorde bepaalt wat je overhoudt. Zonnepanelen op een tochtig huis leveren minder
                  op dan dezelfde panelen op een geïsoleerd huis, en een warmtepomp in een slecht
                  geïsoleerde woning verbruikt meer dan hij bespaart. Daarom eerst beperken, dan
                  opwekken, dan slim gebruiken.
                </p>
                <div id="verduurzamen-hero-knop" className="mt-6 grid gap-3 sm:flex sm:items-center sm:gap-6 md:mt-8">
                  <CtaButton href="/subsidiecheck" variant="accent" className="w-full sm:w-auto">
                    <Search size={17} strokeWidth={2.2} aria-hidden="true" />
                    Check jouw subsidies
                  </CtaButton>
                  <a href="/contact" className="hs-pijl-link justify-center min-h-[44px] sm:justify-start">
                    Of plan een gratis gesprek
                    <ArrowRight size={17} strokeWidth={2.2} className="hs-pijl" aria-hidden="true" />
                  </a>
                </div>
              </div>
              <div className="md:flex-1">
                <img
                  src={heroImage}
                  alt="Adviseur van Voortraject bespreekt de mogelijkheden met een bewoner aan tafel"
                  className="hs-foto block aspect-[3/2] w-full object-cover md:aspect-[4/3]"
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
            <p className="mx-auto mt-3 max-w-[660px] text-base leading-relaxed text-primary-foreground/85">
              Elke stap maakt de volgende goedkoper. Sla je hem over, dan betaal je de rekening
              verderop.
            </p>
          </div>

          <ol className="mt-7 grid list-none grid-cols-1 gap-3 p-0 md:mt-10 md:grid-cols-3 md:gap-5">
            {ROUTE.map((stap, i) => {
              const hier = MAATREGEL_VOLGORDE.filter((slug) => MAATREGELEN[slug].stap === stap.stap);
              return (
                <li key={stap.stap} className="vd-glas flex flex-col rounded-[22px] p-5 md:p-6" data-veer>
                  <div className="flex items-center gap-3">
                    <NummerRondje n={i + 1} size={36} kleur="oker" />
                    <h3 className="hs-h3 m-0 text-primary-foreground">{stap.titel}</h3>
                  </div>
                  <p className="mb-0 mt-2.5 text-[15px] leading-relaxed text-primary-foreground/80">
                    {stap.korte}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-1.5 md:gap-2">
                    {hier.map((slug) => (
                      <a
                        key={slug}
                        href={MAATREGELEN[slug].href}
                        className="hs-chip min-h-[32px] bg-[hsl(var(--primary-foreground)/0.12)] px-3 text-[13.5px] text-primary-foreground hover:bg-[hsl(var(--primary-foreground)/0.2)]"
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

        {/* 3 — ALLE MAATREGELEN
            Op de warme band, zodat de witte tegels en de subsidiecheck eronder
            allebei contrast hebben. */}
        <Sectie bg="warm" id="maatregelen">
          <div className="text-center">
            <SectieKop center>
              <Accent tekst="Elke maatregel, met de vraag die hij [[beantwoordt]]" />
            </SectieKop>
          </div>
          {/* Zes kaarten in drie kolommen vullen precies twee rijen. Onderhoud
              staat daarbuiten als brede kaart: het is geen maatregel maar wat er
              daarna komt, en als zevende kaart liet het een gat vallen. */}
          <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5 md:mt-10 lg:grid-cols-3">
            {MAATREGEL_VOLGORDE.map((slug) => (
              <MaatregelKaart key={slug} slug={slug} />
            ))}
          </div>
          <div className="mt-7 md:mt-8">
            <span className="vd-label">En daarna</span>
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
      {/* De subsidiecheck vlak erboven heeft de oker knop van dit scherm; de
          slotknop is hier daarom licht. */}
      <Footer
        cta={
          <SlotCta
            kop="Welke stap is bij jou de [[eerste]]?"
            tekst="In een gratis gesprek kijken we naar je woning, je plannen en je budget, en zetten we op een rij welke maatregelen in welke volgorde het meeste opleveren. Zonder verkooppraatje, want wij leveren zelf niets."
            label="Plan een gratis gesprek"
            href="/contact"
            knop="licht"
          />
        }
      />
    </div>
  );
};

export default Verduurzamen;
