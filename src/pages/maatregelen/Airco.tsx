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
    heroSub="Aangename temperatuur in de zomer en een zuinig alternatief voor gas in de winter."
    heroIntro="Een airco zorgt voor verkoeling op warme dagen, maar kan met warmtepomptechniek ook ruimtes snel en zuinig verwarmen. Moderne airco's zijn een stuk energiezuiniger dan vroeger en passen goed in een duurzame woning. Vooral voor losse ruimtes of als bijverwarming is het een handige oplossing."
    heroImageSrc={aircoImage}
    heroImageAlt="Airco binnenunit aan een muur in een woonkamer"
    pastBij={[
      "Je in de zomer last hebt van warmte in huis",
      "Je losse ruimtes wilt verwarmen, zoals een thuiskantoor, slaapkamer, zolder of aanbouw",
      "Je een zuinig alternatief voor gas zoekt voor bepaalde ruimtes",
      "Je woning redelijk tot goed geisoleerd is",
    ]}
    minderUrgent={[
      "Je een hele woning gasloos wilt verwarmen, kijk dan eerst naar een warmtepomp",
      "Je geen ruimte hebt voor een buitenunit binnen de geluidsnormen",
    ]}
    watValtEronder={[
      "Split airco met een binnenunit",
      "Multisplit airco met meerdere binnenunits",
      "Monoblock airco zonder buitenunit",
      "Mobiele airco als tijdelijke oplossing",
    ]}
    wanneerKop="Wanneer is dit relevant?"
    routeTekst="Een airco is vooral slim als bijverwarming of voor losse ruimtes die je niet continu hoeft te verwarmen. In een goed geisoleerde woning kun je er ruimtes mee koelen en verwarmen zonder gas. Wil je je hele woning gasloos verwarmen, dan is een warmtepomp meestal de logischere keuze, en kan een airco daar een aanvulling op zijn. Net als bij andere maatregelen geldt: hoe beter je woning geisoleerd is, hoe minder de airco hoeft te werken."
    kostenItems={[
      {
        title: "Benodigde vermogen",
        body: "Afgestemd op de ruimte. Een te klein systeem presteert onvoldoende, een te groot systeem verbruikt onnodig veel.",
      },
      {
        title: "Isolatie van de woning",
        body: "Hoe beter de isolatie, hoe minder de airco hoeft te werken en hoe lager het verbruik.",
      },
      {
        title: "Aantal binnenunits",
        body: "Meer units betekenen hogere kosten, maar ook meer comfort in verschillende ruimtes.",
      },
      {
        title: "Aanschafprijs versus verbruik",
        body: "Een zuiniger model kost meer aanvankelijk, maar verdient zich terug door lager verbruik.",
      },
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
        q: "Hoeveel stroom verbruikt een airco?",
        a: "Dat hangt af van het type, het vermogen en hoe vaak je hem gebruikt. Moderne airco's met een hoog energielabel zijn zuinig en verbruiken vaak minder dan mensen denken. Gebruik je de airco ook om te verwarmen, dan is hij meestal efficienter dan elektrische kachels.",
      },
      {
        q: "Kan ik een airco het hele jaar gebruiken?",
        a: "Ja. De meeste moderne airco's koelen in de zomer en verwarmen in de winter met warmtepomptechniek. Daardoor is het comfortabel in elk seizoen.",
      },
      {
        q: "Kan een airco mijn cv-ketel vervangen?",
        a: "In een goed geisoleerde woning of voor losse ruimtes kan een airco een groot deel van je verwarming overnemen. Voor een hele woning is meestal een combinatie met andere verwarming verstandig. Wij kijken wat bij jouw situatie past.",
      },
      {
        q: "Heb ik een vergunning nodig voor een airco?",
        a: "Vaak niet, maar er gelden wel geluidsnormen op de erfgrens en soms regels van de gemeente of VvE. Een goede installateur houdt daar rekening mee.",
      },
      {
        q: "Maakt een airco veel geluid?",
        a: "Moderne airco's zijn stil, maar de buitenunit produceert geluid. Een goede plaatsing binnen de geluidsnormen voorkomt overlast.",
      },
    ]}
    finalCtaKop="Benieuwd welke airco bij jouw woning [[past]]?"
    finalCtaTekst="In een gratis gesprek kijken we naar je ruimtes, je isolatie en je wensen, en vertellen we eerlijk of een airco de juiste oplossing is of dat andere stappen slimmer zijn. Wij verkopen geen airco's en koppelen je alleen aan gecertificeerde uitvoerders."
  />
);

export default Airco;
