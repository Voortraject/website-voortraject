import { useEffect } from "react";
import { Layers, RefreshCw, Check, Users, LifeBuoy, Home, FileCheck, Scale } from "lucide-react";
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
  Stappen,
  SubsidieFaq,
  SubsidieHero,
  TussenCta,
  WaaromTegels,
} from "@/components/subsidies/SubsidiePagina";

const LAATST_BIJGEWERKT = "mei 2026";


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
      "Veel gemeenten bieden bewoners een gratis huisbezoek door een energiecoach. Geen subsidie in geld, maar wel een spaarpot aan praktisch advies en bespaartips.",
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
    titel: "Vrijblijvend telefoongesprek",
    tekst:
      "We bespreken kort jouw woning, je postcode en je wens. Aan het eind van het gesprek weten we al ruwweg welke regelingen voor jouw gemeente actueel zijn en of een huisbezoek zinvol is. Het gesprek duurt 15 minuten en is volledig vrijblijvend.",
  },
  {
    num: "02",
    titel: "Huisbezoek",
    tekst:
      "Een lokale adviseur uit jouw regio komt bij je langs en bekijkt samen met jou welke regelingen van toepassing zijn en hoe je ze slim combineert. Vrijblijvend en gratis.",
  },
  {
    num: "03",
    titel: "Stapelplan op maat",
    tekst:
      "Wij rekenen uit welke regelingen voor jouw woning samengaan en wat dat oplevert. Welke gestapeld kunnen worden, welke elkaar uitsluiten, en in welke volgorde je het beste aanvraagt. Jij hoeft niet zelf in regelingen te duiken.",
  },
  {
    num: "04",
    titel: "Erkende uitvoerder kiezen",
    tekst:
      "Werkt een niet-erkend bedrijf voor je, dan vervalt vaak de subsidie. Wij brengen je in contact met installateurs die voldoen aan alle eisen, ook de gemeentelijke. Geen vooringenomen keuze, gewoon wat werkt.",
  },
  {
    num: "05",
    titel: "Uitvoering en aanvragen indienen",
    tekst:
      "Wij bewaken de uitvoering, de meldcodes en alle bewijsstukken. Wij dienen ISDE in bij RVO, Nij Begun bij SNN en de gemeentelijke regelingen via het juiste kanaal, elk met de juiste timing.",
  },
  {
    num: "06",
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
    q: "In welke regio's zijn jullie actief?",
    a: "We kijken graag mee in elke Nederlandse gemeente. Voor jouw woning zoeken we uit welke regelingen er nu actueel zijn en hoe ze stapelen met ISDE.",
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Seo
        title="Regionale subsidies verduurzaming | Voortraject"
        description="Overzicht van regionale en gemeentelijke subsidies voor woningverduurzaming, gestapeld met landelijke regelingen voor maximaal voordeel."
        path="/subsidies/regionaal"
      />
      <Header ctaNaElement="subsidie-hero-knop" />

      {/* 1. HERO */}
      <SubsidieHero
        titel={
          <>
            Honderden tot duizenden euro's extra via je <Accent>gemeente</Accent>
          </>
        }
        intro="Boven op ISDE en Nij Begun bieden veel gemeenten eigen regelingen voor isolatie, ventilatie en verduurzaming. Veel bewoners weten dat niet, of weten niet welke nog actief zijn. Wij houden de actuele gemeentelijke subsidies bij en stapelen ze voor je."
        knop={<CtaButton href="/contact">Ja ik wil gratis advies</CtaButton>}
        tweede={<PijlLink href="/subsidies/stapelen">Zo werkt stapelen</PijlLink>}
        naast={
          <HeroLijst
            vlak="hs-zand"
            kleur="gemeente"
            items={[
              { Icon: Layers, tekst: <><strong>Stapelbaar</strong> met ISDE en Nij Begun</> },
              { Icon: RefreshCw, tekst: <><strong>Actuele regelingen</strong> worden door ons bijgehouden</> },
              { Icon: Users, tekst: <><strong>Eén aanspreekpunt</strong> voor alle aanvragen</> },
            ]}
          />
        }
      />

      {/* 2. WAT ZIJN GEMEENTELIJKE SUBSIDIES */}
      <Sectie>
        <Kop2>
          Wat zijn <Accent>gemeentelijke</Accent> subsidies?
        </Kop2>
        <div className="hs-tekst mt-4 max-w-3xl space-y-4 text-[16px] leading-[1.65] md:mt-5 md:text-[17px]" data-veer>
          <p>
            Veel gemeenten in Nederland bieden eigen subsidies om bewoners te helpen verduurzamen. Soms is dat een vast bedrag voor isolatie, soms een gratis energiecoach, soms een lening tegen gunstige voorwaarden. Anders dan ISDE of Nij Begun zijn deze regelingen lokaal, dus de bedragen, voorwaarden en aanvraagprocedures verschillen per gemeente.
          </p>
          <p>
            De regelingen wijzigen ook regelmatig. Een subsidie die vorig jaar bestond kan dit jaar gestopt zijn, of juist nieuw zijn. Wij houden bij wat er actueel is in jouw gemeente en stapelen het bovenop de landelijke en regionale subsidies waar je recht op hebt.
          </p>
        </div>
      </Sectie>

      {/* 3. WELKE REGELINGEN: gemeentelijk, dus zand en oker-bruin */}
      <Sectie band>
        <Kop2 lead="De regelingen verschillen per gemeente, maar er zijn een paar typen die vaak voorkomen. Hieronder zie je de belangrijkste. Wij checken tijdens het huisbezoek welke voor jouw gemeente nu open staan.">
          Welke <Accent>regelingen</Accent> kun je verwachten?
        </Kop2>

        <div className="mt-7 grid grid-cols-1 gap-3 md:mt-10 md:grid-cols-2 md:gap-5">
          {regelingen.map((r) => (
            <div key={r.titel} className="hs-tegel hs-zand grid grid-cols-[1fr_auto] items-start gap-x-3.5 p-[18px] md:p-6" data-veer>
              <h3 className="hs-h3 self-center">{r.titel}</h3>
              <Rondje Icon={Check} kleur="gemeente" maat={36} />
              <p className="hs-tekst col-span-2 mt-2 text-[15px] leading-[1.6]">{r.tekst}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center md:mt-8">
          <PijlLink href="/contact">Neem contact op</PijlLink>
        </div>
      </Sectie>

      {/* 4. STAPPENPLAN */}
      <Sectie>
        <Kop2 lead="Geen drie verschillende loketten, geen drie aanvragen die je zelf moet bewaken. Wij stapelen voor je en houden de termijnen in de gaten.">
          Zo verloopt jouw <Accent>traject</Accent>
        </Kop2>
        <Stappen stappen={stappen.map((s) => ({ n: s.num, t: s.titel, d: s.tekst }))} />
        <TussenCta
          kop={
            <>
              Geen drie loketten, <Accent>één aanspreekpunt</Accent>
            </>
          }
          tekst="Wij doen ISDE bij RVO, Nij Begun bij SNN en de gemeentelijke aanvraag bij jouw gemeente. Allemaal in één traject."
          knop={<CtaButton href="/contact">Neem contact op</CtaButton>}
        />
      </Sectie>

      {/* 5. FAQ */}
      <SubsidieFaq faqs={faqs} band />

      {/* 6. WAAROM VOORTRAJECT */}
      <Sectie>
        <Kop2 lead="Wat ons anders maakt dan een algemene subsidie-website of een gemeenteloket.">
          Waarom bewoners voor Voortraject <Accent>kiezen</Accent>
        </Kop2>
        <WaaromTegels
          redenen={[
            {
              Icon: Home,
              t: "Persoonlijk huisbezoek",
              d: "Geen wachtrij, geen formulier-eerst. Een lokale adviseur uit jouw regio komt persoonlijk langs binnen een week.",
            },
            {
              Icon: FileCheck,
              t: "Wij regelen alle aanvragen",
              d: "Geen drie loketten, geen drie procedures die je zelf moet bewaken. Wij dienen alles in en houden de termijnen bij.",
            },
            {
              Icon: Scale,
              t: "Eerlijk advies",
              d: "Wij hebben geen voorkeur voor bepaalde uitvoerders. We brengen je in contact met erkende installateurs die bij jouw woning passen.",
            },
            {
              Icon: LifeBuoy,
              t: "Nazorg en natraject",
              d: "Na de uitvoering blijven we beschikbaar. Voor vervolgmaatregelen, garantie of een nieuwe gemeentelijke regeling die later wordt gelanceerd.",
            },
          ]}
        />
      </Sectie>

      <Footer cta={<SlotCta laatstBijgewerkt={LAATST_BIJGEWERKT} />} />
    </div>
  );
};

export default SubsidiesRegionaal;
