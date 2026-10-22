import { useRef } from "react";
import { HardHat, Wrench, Building2, Landmark, KeyRound, ClipboardCheck } from "lucide-react";
import { Header } from "@/components/Header";
import { Seo } from "@/components/Seo";
import { Footer } from "@/components/Footer";
import { OfBelOnsCta } from "@/components/OfBelOnsCta";
import { CtaButton } from "@/components/CtaButton";
import { ZakelijkContactFormulier } from "@/components/ZakelijkContactFormulier";
import heroUitvoerders from "@/assets/partners-overleg.webp";
import { useStaffel } from "@/lib/beweging";

// De typen bedrijven waarmee we samenwerken. Uitvoerders blijven de kern van de
// pagina; dit blok laat zien dat het daar niet bij ophoudt.
// De oker knop in de hero; de headerknop met dezelfde kleur wacht tot die uit beeld is.
export const ZAKELIJK_HERO_KNOP = "zakelijk-hero-knop";

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

// Bewust een korte pagina: hero, voor wie we werken, formulier. Wie meer wil
// weten, hoort dat liever in het kennismakingsgesprek dan in nog vier secties.
const Zakelijk = () => {
  const main = useRef<HTMLElement>(null);
  useStaffel(main);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Seo
        title="Zakelijk | Voortraject"
        description="Voortraject ontzorgt uitvoerders, installateurs en andere bedrijven in het voortraject: wij vangen bewonersvragen op, bereiden dossiers voor en bewaken opvolging."
        path="/zakelijk"
      />
      <Header ctaNaElement={ZAKELIJK_HERO_KNOP} />
      <main ref={main} className="flex-1">
        {/* HERO */}
        <section className="pt-6 md:pt-12 pb-12 md:pb-[88px]" aria-labelledby="zak-hero-title">
          <div className="container-content">
            <div className="grid grid-cols-1 lg:grid-cols-[58fr_42fr] gap-8 lg:gap-14 items-center">
              <div>
                <h1
                  id="zak-hero-title"
                  className="font-['Inter_Tight',_'Inter',_sans-serif] text-[30px] md:text-[44px] lg:text-[48px] font-bold leading-[1.12] tracking-[-0.03em] text-primary max-w-[720px] [text-wrap:balance]"
                >
                  Wij vangen het <span className="hs-accent">voortraject</span> op, zodat jullie kunnen bouwen
                </h1>
                <p className="hs-tekst mt-4 md:mt-6 max-w-[560px] text-[16.5px] md:text-[19px] leading-[1.6]">
                  Uitvoerders, installateurs en andere bedrijven in verduurzaming werken met ons samen. Wij nemen bewonerscontact, offerte-opvolging, akkoordtrajecten en nazorg uit handen, zodat jullie team zich richt op planning en uitvoering.
                </p>
                <div className="mt-7 md:mt-9 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5">
                  {/* De id laat de oker headerknop wachten tot deze knop uit beeld is. */}
                  <div id={ZAKELIJK_HERO_KNOP} className="w-full sm:w-auto">
                    <CtaButton href="#contact" className="w-full sm:w-auto">
                      Plan een kennismaking
                    </CtaButton>
                  </div>
                  <OfBelOnsCta />
                </div>
              </div>
              <div>
                <img
                  src={heroUitvoerders}
                  alt="Adviseur van Voortraject neemt het adviesgesprek met een bewoner uit handen aan de keukentafel"
                  loading="lazy"
                  className="hs-foto w-full object-cover object-center h-[224px] sm:h-[320px] lg:h-[460px]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* VOOR WIE WE WERKEN. Rustige tegels zonder rand; het oude
            blur-op-de-andere-kaarten-effect (.card-grid) is eruit, dat was te
            druk. */}
        <section className="hs-band py-12 md:py-[88px]" aria-labelledby="zak-doelgroepen-title">
          <div className="container-content">
            <div className="text-center mx-auto max-w-[820px]">
              <h2 id="zak-doelgroepen-title" className="hs-h2">
                Voor wie we <span className="hs-accent">werken</span>
              </h2>
              <p className="hs-tekst mx-auto mt-3 md:mt-4 text-[16px] md:text-[18px] leading-[1.6]">
                Uitvoerders vormen de kern van ons werk, maar het voortraject speelt bij meer partijen. Herken je jezelf hierin, dan past een kennismaking.
              </p>
            </div>
            <div className="mt-6 md:mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5 items-stretch">
              {doelgroepen.map(({ icon: Icon, title, body }) => (
                <article key={title} data-veer className="hs-tegel hs-blauw-zacht p-[18px] md:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="hs-h3">{title}</h3>
                    <span className="hs-rondje hs-rondje-ink" aria-hidden="true">
                      <Icon size={19} strokeWidth={2} />
                    </span>
                  </div>
                  <p className="hs-tekst mt-2 text-[15px] leading-[1.6]">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CONTACT: sinds /contact bewoner-only is, loopt de zakelijke lead hier
            binnen. De CTA in de hero ankert naar deze sectie. */}
        <section id="contact" className="py-12 md:py-[88px] scroll-mt-24" aria-labelledby="zak-contact-title">
          <div className="container-content">
            <div data-veer className="hs-tegel hs-blauw-zacht mx-auto max-w-[760px] px-4 py-5 min-[380px]:p-5 md:p-9">
              <h2 id="zak-contact-title" className="hs-h2 text-[25px] md:text-[34px]">
                Plan een kennismaking
              </h2>
              <p className="hs-tekst mt-2 mb-6 text-[15px] md:text-[16px] leading-[1.6]">
                Vertel ons kort over jullie bedrijf. Hoe meer we vooraf weten, hoe scherper we het gesprek kunnen voeren.
              </p>
              <ZakelijkContactFormulier />
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
