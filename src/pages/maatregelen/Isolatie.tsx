import { Home } from "lucide-react";
import { MaatregelPagina } from "@/components/MaatregelPagina";
import { WoningSchil } from "@/components/maatregel/isolatie/WoningSchil";
import { Ventilatie } from "@/components/maatregel/isolatie/Ventilatie";
import isolatieImage from "@/assets/helpen-isolatie.webp";

/**
 * Zes inhoudelijke secties plus de FAQ, zoals afgesproken voor alle pagina's
 * onder /verduurzamen:
 *
 *   1 maak de schil van je woning dicht (eigen configurator)
 *   2 past dit bij jouw woning
 *   3 waar dit staat in de route
 *   4 wat je investering oplevert
 *   5 goed isoleren vraagt om goed ventileren (eigen)
 *     subsidiecheck
 *   6 waar wij in de praktijk op letten
 *
 * De subsidiesectie is vervallen: de configurator zegt al dat er geen subsidie
 * in de bedragen zit en dat het van je adres afhangt, en daar horen de
 * regelingen dus ook bij te staan. Als losse sectie stond hetzelfde verhaal een
 * paar schermen verderop nog een keer.
 *
 * De achtergronden worden: zand, wit, warm, navy, zand, warm, sand(CTA), warm,
 * zand. src/test/maatregelPagina.test.tsx bewaakt dat er nooit twee dezelfde
 * naast elkaar komen; src/test/isolatiePagina.test.tsx bewaakt het aantal.
 */
const Isolatie = () => (
  <MaatregelPagina
    slug="isolatie"
    icon={Home}
    badge="Vaak eerste stap"
    seoTitle="Isolatie & ventilatie | Voortraject"
    seoDescription="Zie per bouwdeel wat isoleren je woning oplevert, met besparing per jaar voor jouw woningtype. Plus waarom goed isoleren om goed ventileren vraagt."
    eigenSecties={[
      { na: "hero", bg: "wit", id: "schil", inhoud: <WoningSchil /> },
      { na: "kosten", bg: "warm", id: "ventilatie", inhoud: <Ventilatie /> },
    ]}
    heroTitle="Isolatie & ventilatie, de [[basis]]"
    heroSub="Minder warmteverlies, meer comfort en lagere energiekosten, vrijwel altijd de slimste eerste stap. Het is de basis waarop een warmtepomp of zonnepanelen pas echt renderen, en goed isoleren vraagt om goed ventileren."
    heroIntro=""
    heroImageSrc={isolatieImage}
    heroImageAlt="Adviseur van Voortraject meet de gevel op voor isolatie"
    heroImagePosition="center 30%"
    pastBij={[
      "Je woning nog enkel glas of een ongeïsoleerd dak, vloer of spouwmuur heeft",
      "Je vertrekken traag warm worden, snel afkoelen of het merkbaar tocht",
      "Je een warmtepomp of zonnepanelen overweegt",
      "Je energierekening hoger is dan je zou willen",
    ]}
    minderUrgent={[
      "Je woning al goed is geïsoleerd, met bijvoorbeeld HR++ of triple glas en een geïsoleerde gevel, vloer en dak",
      "Je op zeer korte termijn verhuist",
      "Je een monument hebt; dan gelden strikte regels en kijken we eerst naar wat mag",
    ]}
    routeStep="beperk"
    routeTekst="Isolatie is bijna altijd de eerste stap. Het verlaagt je energieverbruik direct en maakt elke volgende maatregel effectiever. Een warmtepomp haalt zijn rendement pas in een goed geïsoleerde woning. Zonnepanelen leveren minder op als je verbruik onnodig hoog blijft. Daarom eerst beperken wat je verbruikt, dan pas opwekken en slim gebruiken. Ventilatie hoort direct bij of vlak na het isoleren, want een luchtdichte woning heeft gezonde luchtverversing nodig."
    kostenItems={[
      {
        title: "Spouwmuurisolatie",
        body: "Lage investering en korte terugverdientijd. Vaak één van de eerste maatregelen die zichzelf snel terugverdient bij woningen van voor 1990.",
        pills: [
          { dim: "Investering", value: "Laag" },
          { dim: "Terugverdientijd", value: "Kort" },
          { dim: "Comfortwinst", value: "Gemiddeld" },
        ],
      },
      {
        title: "Dakisolatie",
        body: "Een grotere stap die zich snel terugbetaalt. Warmte verdwijnt vooral via het dak, dus de besparing op je stookkosten is groot en de terugverdientijd kort.",
        pills: [
          { dim: "Investering", value: "Gemiddeld" },
          { dim: "Terugverdientijd", value: "Kort" },
          { dim: "Comfortwinst", value: "Hoog" },
        ],
      },
      {
        title: "Vloerisolatie",
        body: "Beperkte investering met een merkbaar comfortverschil. Vooral koude voeten en tochtgevoel verminderen sterk.",
        pills: [
          { dim: "Investering", value: "Laag" },
          { dim: "Terugverdientijd", value: "Gemiddeld" },
          { dim: "Comfortwinst", value: "Gemiddeld" },
        ],
      },
      {
        title: "HR++ of triple glas",
        body: "Betaalt zich vooral uit in comfort en geluidsdemping, en in de stap richting een warmtepomp. Wat het bij jou kost hangt sterk af van je kozijnen: soms kan het glas eruit en blijft de rest staan.",
        pills: [
          { dim: "Investering", value: "Hoog" },
          { dim: "Terugverdientijd", value: "Lang" },
          { dim: "Comfortwinst", value: "Hoog" },
        ],
      },
      {
        title: "Ventilatie met warmteterugwinning (WTW)",
        body: "De meest complete vorm van ventileren: hij vraagt de grootste investering en geeft daarvoor de meeste warmte terug. Past bij een luchtdichte, goed geïsoleerde woning of een ingrijpende verbouwing.",
        pills: [
          { dim: "Investering", value: "Hoog" },
          { dim: "Terugverdientijd", value: "Lang" },
          { dim: "Comfortwinst", value: "Hoog" },
        ],
      },
    ]}
    kostenFooter="Wat het beïnvloedt zijn bouwjaar, huidige isolatiewaarden, woningtype en de combinatie die je kiest. Twee woningen in dezelfde straat komen daardoor op heel verschillende bedragen uit."
    zachteCtaTekst="Benieuwd wat voor jouw woning de meeste winst oplevert?"
    aandachtspunten={[
      "Goed isoleren zonder goed ventileren geeft vocht en schimmel. Behandel ze altijd samen.",
      "Begin bij de maatregel met de kortste terugverdientijd, vaak dak of spouw. Wat die oplevert, maakt de volgende stap makkelijker.",
      "De kwaliteit van uitvoering bepaalt het resultaat. Een goed product, slecht aangebracht, levert weinig op.",
    ]}
    faqs={[
      {
        q: "Moet ik alles tegelijk isoleren of mag het in fases?",
        a: "In fases mag prima. Veel bewoners beginnen bij de maatregel met de kortste terugverdientijd, vaak dakisolatie of spouwmuurisolatie, en pakken de rest later op. Neem ventilatie wel meteen mee zodra de woning luchtdichter wordt.",
      },
      {
        q: "Heb ik na isolatie nog mechanische ventilatie nodig?",
        a: "Vaak wel. Hoe beter je isoleert, hoe luchtdichter de woning wordt, en dan is bewuste luchtverversing nodig om vocht en schimmel te voorkomen. Welke vorm past hangt af van je woning. Soms volstaat natuurlijke ventilatie, soms is mechanische of balansventilatie met warmteterugwinning verstandiger.",
      },
      {
        q: "Wat is het verschil tussen HR++ en triple glas, en is triple de meerprijs waard?",
        a: "HR++ glas heeft een U-waarde van ongeveer 1,1 en triple glas 0,4 tot 0,9, tegen 5,8 voor enkel glas: hoe lager, hoe beter het isoleert. Op je gasrekening scheelt dat verschil weinig. Milieu Centraal komt voor triple op dezelfde besparing uit als voor HR++, want allebei zijn ze zoveel beter dan wat er zat dat de rest verwaarloosbaar is. Het verschil zit in comfort bij het raam en in de prijs: triple is zwaarder en dikker en vraagt vaak nieuwe kozijnen, en dat bepaalt de prijs meer dan het glas zelf. Triple loont vooral als je naar een volledig gasloze woning met lagetemperatuurverwarming toewerkt. In andere gevallen is HR++ meestal de slimmere keuze.",
      },
      {
        q: "Kan ik isoleren als ik later van het gas af wil?",
        a: "Juist dan is isoleren de logische eerste stap. Een goed geïsoleerde woning maakt de overstap naar een warmtepomp haalbaar en betaalbaar. Zonder isolatie werkt een warmtepomp inefficiënt. Wie van het gas af wil, begint bij de schil van de woning.",
      },
    ]}
    finalCtaKop="Niet zeker waar je moet [[beginnen]]?"
    finalCtaTekst="In een gratis gesprek kijken we naar jouw woning en vertellen we eerlijk welke isolatiestap nu het meeste oplevert. Wij verkopen geen materiaal en hebben geen installateur te slijten. Ons advies is onafhankelijk."
  />
);

export default Isolatie;
