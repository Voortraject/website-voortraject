import { Home } from "lucide-react";
import { MaatregelPagina } from "@/components/MaatregelPagina";
import isolatieImage from "@/assets/maatregel-isolatie.jpg";

const Isolatie = () => (
  <MaatregelPagina
    slug="isolatie"
    icon={Home}
    badge="Vaak eerste stap"
    seoTitle="Isolatie & ventilatie | Voortraject"
    seoDescription="Isolatie en ventilatie vormen de basis van elke verduurzaming. Wat valt eronder, wanneer is het slim en welke subsidies passen erbij."
    heroTitle="Isolatie & ventilatie, de [[basis]]"
    heroSub="Minder warmteverlies, meer comfort en lagere energiekosten, vrijwel altijd de slimste eerste stap. Het is de basis waarop een warmtepomp of zonnepanelen pas echt renderen, en goed isoleren vraagt om goed ventileren."
    heroIntro=""
    heroImageSrc={isolatieImage}
    heroImageAlt="Isolatiewerkzaamheden aan een woning"
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
    watValtEronder={[
      "Dakisolatie, vaak de kortste terugverdientijd",
      "Vloer- of bodemisolatie",
      "Spouwmuurisolatie, relatief goedkoop en snel terugverdiend",
      "HR++ of triple glas met goede kozijnen",
      "Ventilatie: natuurlijk, mechanisch, of balansventilatie met warmteterugwinning (WTW)",
    ]}
    routeStep="beperk"
    routeTekst="Isolatie is bijna altijd de eerste stap. Het verlaagt je energieverbruik direct en maakt elke volgende maatregel effectiever. Een warmtepomp in een slecht geïsoleerde woning werkt inefficiënt en duur. Zonnepanelen leveren minder op als je verbruik onnodig hoog blijft. Daarom eerst beperken wat je verbruikt, dan pas opwekken en slim gebruiken. Ventilatie hoort direct bij of vlak na het isoleren, want een luchtdichte woning heeft gezonde luchtverversing nodig."
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
        body: "Hogere investering, maar een grote besparing op je stookkosten. Doordat warmte vooral via het dak verdwijnt, is de terugverdientijd toch kort.",
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
        body: "Hogere investering en langere terugverdientijd. De grootste winst zit hier in comfort en geluidsdemping, en in de stap richting een warmtepomp.",
        pills: [
          { dim: "Investering", value: "Hoog" },
          { dim: "Terugverdientijd", value: "Lang" },
          { dim: "Comfortwinst", value: "Hoog" },
        ],
      },
      {
        title: "Ventilatie met warmteterugwinning (WTW)",
        body: "De meest energiezuinige vorm van ventileren, maar ook de duurste optie. Past goed bij een luchtdichte, goed geïsoleerde woning.",
        pills: [
          { dim: "Investering", value: "Hoog" },
          { dim: "Terugverdientijd", value: "Lang" },
          { dim: "Comfortwinst", value: "Hoog" },
        ],
      },
    ]}
    kostenFooter="Wat het beïnvloedt zijn bouwjaar, huidige isolatiewaarden, woningtype en de combinatie die je kiest."
    zachteCtaTekst="Benieuwd wat voor jouw woning de meeste winst oplevert?"
    aandachtspunten={[
      "Goed isoleren zonder goed ventileren geeft vocht en schimmel. Behandel ze altijd samen.",
      "Begin bij de maatregel met de kortste terugverdientijd, vaak dak of spouw, niet bij de duurste.",
      "De kwaliteit van uitvoering bepaalt het resultaat. Een goed product, slecht aangebracht, levert weinig op.",
    ]}
    subsidiesIntro="Isolatie is een van de best gesubsidieerde maatregelen en vaak combineerbaar:"
    subsidiesItems={[
      "ISDE (landelijk), verdubbelt bij twee of meer maatregelen",
      "Nij Begun, tot 100 procent vergoed voor eigenaar-bewoners in Groningen en Noord-Drenthe",
      "Gemeentelijke regelingen, stapelbaar bovenop bovenstaande",
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
        a: "HR++ glas isoleert goed en is geschikt voor de meeste woningen. Triple glas isoleert nog beter, maar is duurder en vraagt vaak zwaardere kozijnen. Triple loont vooral als je naar een volledig gasloze woning met lage temperatuurverwarming toewerkt. In andere gevallen is HR++ meestal de slimmere keuze.",
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
