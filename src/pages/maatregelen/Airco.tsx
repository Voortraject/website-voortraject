import { Snowflake } from "lucide-react";
import { MaatregelPagina } from "@/components/MaatregelPagina";
import aircoImage from "@/assets/maatregel-airco.jpg";

const Airco = () => (
  <MaatregelPagina
    slug="airco"
    icon={Snowflake}
    seoTitle="Airco | Voortraject"
    seoDescription="Een airco koelt in de zomer en verwarmt zuinig in de winter. Wanneer is het slim, wat kost het en waar moet je op letten?"
    heroTitle="Airco, koelen en verwarmen in [[één]]"
    heroSub="Aangename verkoeling in de zomer en, met warmtepomptechniek, zuinig verwarmen in de winter. Vooral voor losse ruimtes of als bijverwarming een handige, energiezuinige oplossing."
    heroIntro=""
    heroImageSrc={aircoImage}
    heroImageAlt="Airco binnenunit aan een muur in een woonkamer"
    pastBij={[
      "Je in de zomer last hebt van warmte in huis",
      "Je losse ruimtes wilt koelen of verwarmen, zoals een thuiskantoor, slaapkamer of zolder",
      "Je een zuinig alternatief voor gas zoekt voor bepaalde ruimtes",
      "Je woning redelijk tot goed geïsoleerd is",
    ]}
    minderUrgent={[
      "Je je hele woning gasloos wilt verwarmen; kijk dan eerst naar een warmtepomp",
      "Je geen ruimte hebt voor een buitenunit binnen de geluidsnormen",
      "Je maar een enkele warme dag per jaar hebt en met ventilatie of zonwering uitkomt",
    ]}
    watValtEronder={[
      "Split airco met een binnenunit",
      "Multisplit airco met meerdere binnenunits",
      "Monoblock airco zonder buitenunit",
      "Mobiele airco als tijdelijke oplossing",
    ]}
    wanneerKop="Wanneer is dit relevant?"
    routeTekst="Een airco is vooral slim als bijverwarming of voor losse ruimtes die je niet continu hoeft te verwarmen. In een goed geisoleerde woning kun je er ruimtes mee koelen en verwarmen zonder gas. Wil je je hele woning gasloos verwarmen, dan is een warmtepomp meestal de logischere keuze, en kan een airco daar een aanvulling op zijn. Net als bij andere maatregelen geldt: hoe beter je woning geisoleerd is, hoe minder de airco hoeft te werken."
    kostenMode="single"
    kostenItems={[
      {
        title: "Airco",
        body: "Een airco met warmtepomptechniek koelt in de zomer en verwarmt zuinig in de winter. Het rendement hangt af van het juiste vermogen, de isolatie en hoeveel ruimtes je voorziet.",
      },
    ]}
    kostenSinglePills={[
      { dim: "Investering", value: "Gemiddeld" },
      { dim: "Terugverdientijd", value: "Gemiddeld" },
      { dim: "Comfortwinst", value: "Hoog" },
    ]}
    kostenFooter="Een te klein systeem presteert onvoldoende, een te groot systeem verbruikt onnodig veel. De juiste maat bepaalt het rendement."
    zachteCtaTekst="Benieuwd welke airco bij jouw ruimte past? Plan een gesprek"
    aandachtspunten={[
      "Het vermogen moet passen bij de ruimte, niet te klein en niet te groot",
      "Goede isolatie zorgt dat de airco minder hard hoeft te werken",
      "De buitenunit produceert geluid, er gelden geluidsnormen op de erfgrens",
      "Regelmatig onderhoud houdt de airco zuinig en de luchtkwaliteit goed",
    ]}
    keurmerken={{
      kop: "Let op [[keurmerken]] en certificeringen",
      intro:
        "Een airco werkt met koudemiddelen en vraagt vakkundige installatie. Werk alleen met installateurs die de juiste erkenningen hebben:",
      items: [
        "BRL 100 en BRL 200, erkenningen voor installatiewerk",
        "STEK, verplichte certificering voor bedrijven die met koudemiddelen werken",
        "F-gassen vakbekwaamheid, categorie F1 en F2, voor het veilig werken met fluorhoudende koudemiddelen",
      ],
      voetregel:
        "Wij koppelen je alleen aan uitvoerders die deze certificeringen op orde hebben.",
    }}
    onderhoud={{
      kop: "Onderhoud",
      tekst: "Een airco werkt het beste met regelmatig onderhoud. Filters schoonmaken of vervangen kun je vaak zelf, periodieke controle van het systeem en het koudemiddel doe je het beste door een specialist. Goed onderhoud verlengt de levensduur en voorkomt storingen.",
      linkHref: "/verduurzamen/onderhoud",
      linkLabel: "Lees meer over onderhoud",
    }}
    faqs={[
      {
        q: "Kan een airco ook verwarmen, of alleen koelen?",
        a: "Veel moderne airco's met warmtepomptechniek doen allebei: koelen in de zomer en zuinig verwarmen in de winter. Vooral voor losse ruimtes is dat een handige oplossing.",
      },
      {
        q: "Hoeveel stroom verbruikt een airco?",
        a: "Dat hangt af van het type, het vermogen en hoe vaak je hem gebruikt. Moderne airco's met een hoog energielabel zijn zuinig en verbruiken vaak minder dan gedacht.",
      },
      {
        q: "Is een airco slecht voor de gezondheid?",
        a: "Niet als hij goed onderhouden wordt. Regelmatig de filters reinigen en periodiek onderhoud houdt de lucht schoon.",
      },
      {
        q: "Hoe lang gaat een airco mee?",
        a: "Met goed onderhoud gaat een kwaliteitsairco doorgaans vele jaren mee. Periodiek onderhoud verlengt de levensduur en houdt het rendement op peil.",
      },
      {
        q: "Heb ik een vergunning nodig voor een airco?",
        a: "Voor de buitenunit gelden regels rond geluid en plaatsing, die per gemeente kunnen verschillen. Meestal is geen vergunning nodig, maar we houden er rekening mee.",
      },
      {
        q: "Zijn de uitvoerders gecertificeerd?",
        a: "Ja. We koppelen je alleen aan erkende, gecertificeerde vakbedrijven met de juiste keurmerken voor kwaliteit, vakmanschap en veiligheid.",
      },
    ]}
    finalCtaKop="Benieuwd welke airco bij jouw woning [[past]]?"
    finalCtaTekst="In een gratis gesprek kijken we naar je ruimtes, je isolatie en je wensen, en vertellen we eerlijk of een airco de juiste oplossing is of dat andere stappen slimmer zijn. Wij verkopen geen airco's en koppelen je alleen aan gecertificeerde uitvoerders."
  />
);

export default Airco;
