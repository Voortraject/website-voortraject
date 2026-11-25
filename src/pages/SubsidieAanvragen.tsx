import {
  Building2,
  Coins,
  FileCheck,
  FolderCheck,
  Globe,
  KeyRound,
  ListChecks,
  Scale,
  Send,
  Trees,
} from "lucide-react";
import type { ReactNode } from "react";

import { CtaButton } from "@/components/CtaButton";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Seo } from "@/components/Seo";
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
  VinkRegel,
  WaaromTegels,
  type RondjeKleur,
  type Vraag,
} from "@/components/subsidies/SubsidiePagina";
import { AANMELDEN_URL, aanmeldUrl, type AanmeldRegeling } from "@/lib/aanmelden";

// De subsidiedienst: Voortraject doet de subsidieaanvraag van een bewoner, ook
// zonder dat het werk via ons loopt. Aanmelden gebeurt in het bewonersportaal op
// mijn.voortraject.nl (zie src/lib/aanmelden.ts).
//
// De bedragen en afspraken komen uit de vastgestelde voorwaarden van 17-11-2026
// (CRM, subsidiedienst_voorwaarden, versies 2026-11-17 en 2026-11-17-percentage)
// en de standaard per regeling in Instellingen (subsidiedienst_regelingen):
// Nij Begun vast € 275 vooraf, de rest 7,5% van de subsidie. Verandert daar iets,
// pas dan deze pagina mee aan.
//
// Schrijfregels van de eigenaar voor de dienst: je-vorm, luchtig, geen bezwaar
// voorzeggen, en geen "gratis" of "kost" (hier betaal je wel iets).

const LAATST_BIJGEWERKT = "november 2026";
const VASTE_VERGOEDING = "€275";
const PERCENTAGE = "7,5%";

const faqs: Vraag[] = [
  {
    q: "Voor welke subsidies doen jullie de aanvraag?",
    a: "Voor Nij Begun (ook met terugwerkende kracht), de Verduurzaming en Verbetering Groningen (VVG) en ISDE. Nij Begun en VVG zijn er voor woningen in Groningen en een deel van Drenthe. ISDE kan in heel Nederland.",
  },
  {
    q: "Moet het werk al klaar zijn?",
    a: "Nee. Bij Nij Begun vragen we de subsidie aan voordat het werk begint. Een aannemer uit het Nij Begun-netwerk doet het werk, en daarna vragen we per factuur het geld voor je aan. Bij ISDE en bij Nij Begun met terugwerkende kracht is het werk al gedaan en vragen we achteraf aan.",
  },
  {
    q: "Wanneer betaal ik?",
    a: `Bij Nij Begun, als het werk nog moet gebeuren, betaal je ${VASTE_VERGOEDING} vooraf, na je akkoord. Bij VVG, ISDE en Nij Begun met terugwerkende kracht betaal je niets vooraf: krijg je subsidie, dan betaal je ${PERCENTAGE} van dat bedrag. Alle bedragen zijn inclusief btw.`,
  },
  {
    q: "En als mijn aanvraag wordt afgewezen?",
    a: `Dan kijken we of een bezwaar kans maakt, en zo ja, dan maken we het voor je. Dat zit er gewoon bij in. Levert het niets op, dan krijg je bij Nij Begun je ${VASTE_VERGOEDING} terug en betaal je bij een percentage niets. De precieze afspraken lees je voordat je akkoord geeft.`,
  },
  {
    q: "Heb ik DigiD nodig?",
    a: "Nee, we vragen nooit om je DigiD. Je tekent een machtiging, zodat wij namens jou kunnen aanvragen. Bij ISDE doe je dat op je eigen pagina, bij SNN met een pen.",
  },
  {
    q: "Ik las dat ik jullie niets betaal. Hoe zit dat?",
    a: "Laat je het werk doen door een uitvoerder via ons, dan betaalt die uitvoerder ons en regelen we je aanvraag erbij. Deze dienst is voor als je alleen hulp wilt bij je aanvraag, bijvoorbeeld omdat het werk al klaar is of je zelf een aannemer hebt gekozen.",
  },
];

const stappen = [
  {
    n: "01",
    t: "Meld je aan",
    d: "Vul je adres in en beantwoord een paar korte vragen. Je ziet meteen welke subsidie waarschijnlijk bij je past.",
  },
  {
    n: "02",
    t: "Geef akkoord",
    d: "Je krijgt een eigen pagina op mijn.voortraject.nl. Daar lees je de afspraken en geef je akkoord. Binnen een paar werkdagen kijken we of de regeling echt bij je past.",
  },
  {
    n: "03",
    t: "Stuur je stukken",
    d: "Op je pagina zie je precies welke stukken we nodig hebben. Je zet ze erop en tekent de machtiging. Wij controleren alles.",
  },
  {
    n: "04",
    t: "Wij dienen in",
    d: "We dienen je aanvraag in bij SNN of RVO en handelen hun vragen af. Op je pagina zie je steeds hoe het ervoor staat.",
  },
];

/** De oker knop naar het aanmelden, zonder regeling: die kiest de bewoner zelf. */
const AanmeldKnop = () => <CtaButton href={AANMELDEN_URL}>Meld je aan</CtaButton>;

/** Een tegel per regeling, met een link die meteen die regeling kiest. */
const RegelingTegel = ({
  titel,
  Icon,
  kleur,
  vlak,
  regels,
  regeling,
  linkTekst,
  noot,
}: {
  titel: string;
  Icon: typeof Globe;
  kleur: RondjeKleur;
  vlak: string;
  regels: ReactNode[];
  regeling: AanmeldRegeling;
  linkTekst: string;
  noot?: string;
}) => (
  <div className={`hs-tegel ${vlak} flex flex-col p-[18px] md:p-7`} data-veer>
    <div className="flex items-center justify-between gap-3">
      <h3 className="hs-h3">{titel}</h3>
      <Rondje Icon={Icon} kleur={kleur} />
    </div>
    <ul className="mt-3">
      {regels.map((r, i) => (
        <VinkRegel key={i}>{r}</VinkRegel>
      ))}
    </ul>
    {noot && <p className="hs-tekst mt-2 text-[13.5px] leading-[1.5]">{noot}</p>}
    <div className="mt-auto pt-3">
      <PijlLink href={aanmeldUrl(regeling)}>{linkTekst}</PijlLink>
    </div>
  </div>
);

/** Een prijstegel: het bedrag groot, wat het inhoudt eronder. */
const PrijsTegel = ({
  bedrag,
  bij,
  titel,
  regels,
}: {
  bedrag: string;
  bij: string;
  titel: string;
  regels: string[];
}) => (
  <div className="hs-tegel hs-blauw-zacht p-[18px] md:p-7" data-veer>
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <span className="font-display text-[44px] font-bold leading-none tracking-[-0.03em] text-primary md:text-[52px]">{bedrag}</span>
      <span className="hs-tekst text-[15px] leading-[1.45]">{bij}</span>
    </div>
    <h3 className="hs-h3 mt-4">{titel}</h3>
    <ul className="mt-2">
      {regels.map((r) => (
        <VinkRegel key={r}>{r}</VinkRegel>
      ))}
    </ul>
  </div>
);

const SubsidieAanvragen = () => (
  <div className="min-h-screen bg-background text-foreground">
    <Seo
      title="Subsidie aanvragen? Wij regelen het voor je | Voortraject"
      description={`Wij doen je subsidieaanvraag voor Nij Begun, VVG en ISDE bij SNN of RVO. Nij Begun ${VASTE_VERGOEDING} vooraf, de rest ${PERCENTAGE} van je subsidie. Meld je online aan.`}
      path="/subsidies/aanvragen"
      jsonLd={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }}
    />
    <Header ctaNaElement="subsidie-hero-knop" />

    <main>
      {/* 1. HERO */}
      <SubsidieHero
        titel={
          <>
            Wij regelen je <Accent>subsidieaanvraag</Accent>
          </>
        }
        intro="Is het werk al klaar, of heb je al een aannemer? Wij zoeken uit welke stukken nodig zijn, controleren ze en dienen je aanvraag in bij SNN of RVO. Jij stuurt je stukken, wij doen de rest."
        knop={<AanmeldKnop />}
        tweede={<PijlLink href="#prijzen">Bekijk wat je betaalt</PijlLink>}
        naast={
          <HeroLijst
            vlak="hs-blauw-zacht"
            kleur="ink"
            items={[
              { Icon: FileCheck, tekst: <><strong>Nij Begun, VVG en ISDE</strong>, bij SNN of RVO</> },
              { Icon: KeyRound, tekst: <>We vragen <strong>nooit</strong> om je DigiD</> },
              { Icon: Coins, tekst: <><strong>Geen subsidie?</strong> Dan betaal je meestal niets</> },
            ]}
          />
        }
      />

      {/* 2. WAT WE DOEN */}
      <Sectie>
        <Kop2 lead="Een subsidieaanvraag is vooral papierwerk en goed opletten. Dat nemen we van je over, van de eerste check tot het besluit.">
          Wat we voor je <Accent>doen</Accent>
        </Kop2>
        <WaaromTegels
          redenen={[
            {
              Icon: ListChecks,
              t: "We checken of het past",
              d: "Na je aanmelding kijken we of je woning en je situatie bij de regeling passen. Past het niet, dan stoppen we en betaal je ons niets.",
            },
            {
              Icon: FolderCheck,
              t: "We controleren je stukken",
              d: "Je ziet precies wat er nodig is. Wij kijken alles na voordat het naar SNN of RVO gaat.",
            },
            {
              Icon: Send,
              t: "We dienen de aanvraag in",
              d: "Namens jou, met een machtiging. Vragen van SNN of RVO handelen wij af, en bij Nij Begun vragen we daarna per factuur het geld voor je aan.",
            },
            {
              Icon: Scale,
              t: "Bezwaar zit erbij in",
              d: "Wijst SNN of RVO je aanvraag af, dan kijken we of een bezwaar kans maakt. Zo ja, dan maken we het voor je.",
            },
          ]}
        />
      </Sectie>

      {/* 3. VOOR WIE: regionaal in de provinciekleur, ISDE landelijk in inktblauw */}
      <Sectie band>
        <Kop2 midden lead="Kies je subsidie, dan gaan we meteen verder met de vragen die daarbij horen. Weet je het niet zeker? Meld je dan gewoon aan, dan zie je het vanzelf.">
          Voor <Accent>wie</Accent> is het?
        </Kop2>
        <div className="mx-auto mt-7 grid max-w-6xl grid-cols-1 gap-3 md:mt-10 md:gap-5 lg:grid-cols-3">
          <RegelingTegel
            titel="Nij Begun"
            Icon={Building2}
            kleur="provincie"
            vlak="hs-tint-provincie"
            regels={[
              "Je hebt een woning in Groningen of Noord-Drenthe",
              "Je wilt laten isoleren, of je liet het al doen tussen april 2023 en juni 2025",
            ]}
            regeling="nij-begun"
            linkTekst="Meld je aan voor Nij Begun"
          />
          <RegelingTegel
            titel="VVG"
            Icon={Trees}
            kleur="provincie"
            vlak="hs-tint-provincie"
            regels={[
              "Je hebt een woning in de provincie Groningen, of op een Drentse postcode van de regeling",
              "Uit je antwoorden blijkt welke van de drie bedragen bij je past",
            ]}
            regeling="vvg"
            linkTekst="Meld je aan voor VVG"
          />
          <RegelingTegel
            titel="ISDE, in heel Nederland"
            Icon={Globe}
            kleur="ink"
            vlak="hs-blauw-zacht"
            regels={[
              "Je bent eigenaar en woont er zelf",
              "Een bedrijf heeft het werk al gedaan, zoals een warmtepomp, zonneboiler of isolatie",
            ]}
            noot="In Groningen en Noord-Drenthe loopt isolatie via Nij Begun."
            regeling="isde"
            linkTekst="Meld je aan voor ISDE"
          />
        </div>
      </Sectie>

      {/* 4. WAT BETAAL JE */}
      <Sectie id="prijzen">
        <Kop2 midden lead="Wat je betaalt hangt af van de regeling. Alle bedragen zijn inclusief btw.">
          Wat <Accent>betaal</Accent> je?
        </Kop2>
        <div className="mx-auto mt-7 grid max-w-5xl grid-cols-1 gap-3 md:mt-10 md:grid-cols-2 md:gap-5">
          <PrijsTegel
            bedrag={VASTE_VERGOEDING}
            bij="eenmalig, vooraf"
            titel="Nij Begun, als het werk nog moet gebeuren"
            regels={[
              "Je betaalt na je akkoord, daarna beginnen we",
              "Bezwaar zit erbij in",
              "Afgewezen en levert bezwaar niets op? Dan krijg je alles terug",
            ]}
          />
          <PrijsTegel
            bedrag={PERCENTAGE}
            bij="van de subsidie die je krijgt"
            titel="VVG, ISDE en Nij Begun met terugwerkende kracht"
            regels={[
              "Je betaalt niets vooraf",
              "Krijg je geen subsidie, dan betaal je meestal niets",
              "Voorbeeld: krijg je €10.000, dan betaal je €750",
            ]}
          />
        </div>
        <p className="hs-tekst mx-auto mt-4 max-w-3xl text-center text-[13.5px] leading-[1.5] md:mt-6">
          Je hebt 14 dagen bedenktijd. Alle afspraken lees je op je eigen pagina, voordat je akkoord geeft.
        </p>
      </Sectie>

      {/* 5. ZO WERKT HET */}
      <Sectie band>
        <Kop2 lead="Alles loopt via je eigen pagina op mijn.voortraject.nl. Daar zie je wat we nodig hebben en hoe je aanvraag ervoor staat.">
          Zo <Accent>werkt</Accent> het
        </Kop2>
        <Stappen stappen={stappen} />
        <TussenCta
          kop="Zullen we je aanvraag regelen?"
          tekst="Je zit nergens aan vast tot je akkoord geeft."
          knop={<AanmeldKnop />}
        />
      </Sectie>

      {/* 6. FAQ */}
      <SubsidieFaq faqs={faqs} />
    </main>

    <Footer
      cta={
        <SlotCta
          laatstBijgewerkt={LAATST_BIJGEWERKT}
          kop="Laat je subsidieaanvraag aan ons over"
          tekst={
            <>
              Meld je aan, dan kijken we binnen een paar werkdagen of je regeling past. Liever eerst even overleggen? Bel ons op{" "}
              <a href="tel:+31502112689" className="whitespace-nowrap font-semibold text-primary-foreground underline underline-offset-2 hover:text-accent">
                050 211 2689
              </a>
              .
            </>
          }
          knop={<AanmeldKnop />}
        />
      }
    />
  </div>
);

export default SubsidieAanvragen;
