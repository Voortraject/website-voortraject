import { Fragment, useEffect } from "react";
import {
  Layers,
  RefreshCw,
  Users,
  Globe,
  Map as MapIcon,
  Building2,
  Plus,
  Equal,
  CheckCircle2,
} from "lucide-react";
import { Header } from "@/components/Header";
import { Seo } from "@/components/Seo";
import { Footer } from "@/components/Footer";
import { CtaButton } from "@/components/CtaButton";
import {
  Accent,
  HeroLijst,
  Kop2,
  PijlLink,
  Rondje,
  Sectie,
  SlotCta,
  SubsidieFaq,
  SubsidieHero,
  type RondjeKleur,
} from "@/components/subsidies/SubsidiePagina";
import bewonersKeukentafel from "@/assets/bewoners-keukentafel.webp";

const LAATST_BIJGEWERKT = "juni 2026";

const faqs: { q: string; a: string }[] = [
  {
    q: "Kan ik echt meerdere subsidies combineren?",
    a: "In veel gevallen wel. Welke precies samengaan hangt af van je woning, je maatregelen en je gebied, en dat zoeken we voor je uit.",
  },
  {
    q: "Wat kost jullie hulp hierbij?",
    a: "Voor bewoners is ons advies gratis. Wij worden betaald door de uitvoerders, voor het voorwerk dat we voor hen uit handen nemen.",
  },
  {
    q: "Welke subsidies gelden in mijn gebied?",
    a: "Dat verschilt per gemeente en regeling. We zoeken het voor jouw adres uit.",
  },
  {
    q: "Veranderen de regelingen niet steeds?",
    a: "Ja, en daarom houden wij ze voor je bij, zodat je niets misloopt.",
  },
];

// De drie niveaus in de kleuren van de subsidietool: landelijk inktblauw,
// regionaal (provincie) petrol, gemeentelijk oker-bruin.
const bouwstenen: {
  Icon: typeof Globe;
  tag: string;
  titel: string;
  tekst: string;
  footer: string;
  vlak: string;
  kleur: RondjeKleur;
  tagKleur: string;
}[] = [
  {
    Icon: Globe,
    tag: "ISDE",
    titel: "Landelijk",
    tekst: "Vaste bedragen per maatregel voor isolatie, een warmtepomp, zonneboiler en meer. Aanvragen bij RVO.",
    footer: "geldt in heel Nederland",
    vlak: "hs-blauw",
    kleur: "ink",
    tagKleur: "text-[hsl(var(--rs-getal))]",
  },
  {
    Icon: MapIcon,
    tag: "NIJ BEGUN",
    titel: "Regionaal",
    tekst:
      "Subsidie om je woning in Groningen en Noord-Drenthe te isoleren tot de isolatiestandaard. Vooraf aanvragen bij SNN, vóór je begint.",
    footer: "alleen in het werkgebied",
    vlak: "hs-tint-provincie",
    kleur: "provincie",
    tagKleur: "text-[hsl(var(--niveau-provincie))]",
  },
  {
    Icon: Building2,
    tag: "PER GEMEENTE",
    titel: "Gemeentelijk",
    tekst: "Lokale potjes zoals een isolatiepremie, een duurzaamheidslening of een gratis energiecoach. Verschilt per gemeente.",
    footer: "vaak over het hoofd gezien",
    vlak: "hs-zand",
    kleur: "gemeente",
    tagKleur: "text-[hsl(var(--niveau-gemeente))]",
  },
];

const SubsidiesStapelen = () => {
  useEffect(() => {
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo
        title="Subsidies stapelen voor verduurzaming | Voortraject"
        description="Combineer landelijke, regionale en gemeentelijke subsidies om je verduurzaming maximaal te laten renderen. Wij zoeken voor jou uit wat stapelt."
        path="/subsidies/stapelen"
      />
      <Header ctaNaElement="subsidie-hero-knop" />

      {/* 1. HERO */}
      <SubsidieHero
        titel={
          <>
            Subsidies stapelen, haal het <Accent>maximale</Accent> eruit
          </>
        }
        intro="Veel huishoudens laten geld liggen omdat ze niet weten dat subsidies vaak te combineren zijn. Een landelijke regeling, een regionale regeling zoals Nij Begun, een gemeentelijk potje en voordelige financiering kunnen samen je kosten flink drukken. Wij zoeken voor jou uit wat je kunt stapelen en begeleiden de aanvraag. Gratis."
        knop={<CtaButton href="/contact">Ja ik wil gratis advies</CtaButton>}
        tweede={
          <PijlLink
            href="#stapelen"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("stapelen")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
          >
            Zo werkt stapelen
          </PijlLink>
        }
        naast={
          <HeroLijst
            vlak="hs-blauw-zacht"
            kleur="ink"
            items={[
              { Icon: Layers, tekst: <><strong>Stapelbaar</strong>: landelijk, regionaal én gemeentelijk</> },
              { Icon: RefreshCw, tekst: <><strong>Actuele regelingen</strong> worden door ons bijgehouden</> },
              { Icon: Users, tekst: <><strong>Eén aanspreekpunt</strong> voor al je aanvragen</> },
            ]}
          />
        }
      />

      {/* 2. WAT IS SUBSIDIES STAPELEN */}
      <Sectie>
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-14">
          <div className="order-2 lg:order-1" data-veer>
            <img
              src={bewonersKeukentafel}
              alt="Adviseur van Voortraject legt een bewoner aan de keukentafel uit hoe subsidies te combineren zijn"
              loading="lazy"
              decoding="async"
              className="hs-foto h-56 w-full object-cover sm:h-80 lg:h-[420px]"
            />
          </div>
          <div className="order-1 min-w-0 lg:order-2">
            <Kop2>
              Wat is subsidies <Accent>stapelen</Accent>?
            </Kop2>
            <div className="hs-tekst mt-4 space-y-4 text-[16px] leading-[1.65] md:mt-5 md:text-[17px]" data-veer>
              <p>
                Verduurzamen wordt vaak met meerdere regelingen tegelijk ondersteund: een landelijke subsidie, een regionale regeling en soms voordelige financiering. Die kun je in veel gevallen combineren, oftewel stapelen, waardoor je netto minder betaalt dan met één regeling alleen.
              </p>
              <p>
                De kunst zit in weten welke regelingen samengaan, in welke volgorde je ze aanvraagt en welke voor jouw woning en gebied gelden. Dat verandert regelmatig, en daar laten veel mensen geld liggen.
              </p>
            </div>
          </div>
        </div>
      </Sectie>

      {/* 3. DE BOUWSTENEN */}
      <Sectie id="stapelen" band>
        <Kop2
          midden
          lead="Er zijn meerdere regelingen die je kunt combineren. Welke voor jou gelden hangt af van je woning en je gebied; je hebt ze niet allemaal nodig om voordeel te halen. Wij zoeken uit welke combinatie voor jou het meeste oplevert."
        >
          De bouwstenen die je kunt <Accent>combineren</Accent>
        </Kop2>

        <div className="mt-7 grid grid-cols-1 gap-3 md:mt-10 md:grid-cols-[1fr_44px_1fr_44px_1fr] md:gap-0">
          {bouwstenen.map((c, i, arr) => (
            <Fragment key={c.titel}>
              <article className={`hs-tegel ${c.vlak} flex flex-col p-[18px] md:p-6`} data-veer>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className={`block text-[13.5px] font-extrabold tracking-[0.06em] ${c.tagKleur}`}>{c.tag}</span>
                    <h3 className="hs-h3 mt-0.5">{c.titel}</h3>
                  </div>
                  <Rondje Icon={c.Icon} kleur={c.kleur} />
                </div>
                <p className="hs-tekst mt-2 text-[15px] leading-[1.6]">{c.tekst}</p>
                <span className="mt-auto pt-3 text-[13.5px] font-semibold text-primary">{c.footer}</span>
              </article>
              {i < arr.length - 1 && (
                <div aria-hidden="true" className="relative z-[2] grid h-0 place-items-center md:h-auto">
                  <Rondje Icon={Plus} kleur="wit" maat={36} className="-my-6 md:-mx-3.5 md:my-0" />
                </div>
              )}
            </Fragment>
          ))}
        </div>

        {/* Samenvattingsblok */}
        <div className="hs-tegel hs-groen mx-auto mt-8 max-w-[860px] px-5 py-7 text-center md:mt-10 md:px-8 md:py-10" data-veer>
          <div className="flex items-center justify-center gap-3 md:gap-4" aria-hidden="true">
            <Rondje Icon={Plus} kleur="wit" maat={34} />
            <Rondje Icon={Plus} kleur="wit" maat={34} />
            <Rondje Icon={Equal} kleur="wit" maat={34} />
            <Rondje Icon={CheckCircle2} kleur="groen" maat={34} />
          </div>
          <p className="mx-auto mt-4 max-w-[560px] font-display text-[20px] font-bold leading-[1.3] tracking-[-0.01em] text-primary md:text-[26px]">
            Wat de juiste <Accent>combinatie</Accent> oplevert, rekenen we voor jou uit
          </p>
          <div className="mt-5 md:mt-6">
            <CtaButton href="/contact">Plan een gratis adviesgesprek</CtaButton>
          </div>
        </div>
      </Sectie>

      {/* 4. FAQ */}
      <SubsidieFaq faqs={faqs} />

      <Footer cta={<SlotCta laatstBijgewerkt={LAATST_BIJGEWERKT} />} />
    </div>
  );
};

export default SubsidiesStapelen;
