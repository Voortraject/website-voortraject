import { Plug } from "lucide-react";
import { MaatregelPagina } from "@/components/MaatregelPagina";
import { EenOfDrieFase } from "@/components/maatregel/laadpaal/EenOfDrieFase";
import { VeiligLaden } from "@/components/maatregel/laadpaal/VeiligLaden";
import { LadenOpEigenZon } from "@/components/maatregel/laadpaal/LadenOpEigenZon";
import {
  AANSCHAF,
  ACCU,
  BENZINE,
  BRONNEN,
  euro,
  LADEN,
  perHonderdKm,
  REKENBASIS,
  VERSCHIL_PER_JAAR,
} from "@/data/laadpaal";
import laadpaalImage from "@/assets/maatregel-laadpaal.jpg";

/**
 * Zes inhoudelijke secties plus de FAQ, zoals afgesproken voor alle pagina's
 * onder /verduurzamen:
 *
 *   1 1-fase of 3-fase                (eigen)
 *   2 past dit bij jouw woning        (template)
 *   3 waar dit staat in de route      (template)
 *   4 veilig laden en load balancing  (eigen)
 *   5 wat het kost, thuis of openbaar (template)
 *     subsidiecheck
 *   6 laden op je eigen zon           (eigen)
 *
 * De achtergronden lopen daarmee zand, wit, warm, navy, wit, zand, warm, zand.
 * src/test/maatregelPagina.test.tsx bewaakt zowel het aantal secties als dat er
 * nooit twee dezelfde achtergronden naast elkaar komen.
 *
 * Wat eraf is gegaan: `watValtEronder` (de vier onderdelen die daar stonden
 * krijgen nu ieder een eigen plek), `aandachtspunten` (opgegaan in sectie 1 en
 * 4), `combineren` (de kruislinks staan nu in sectie 6, waar de vraag opkomt)
 * en het keurmerkenblok. Dat laatste noemde STEK als eis voor een laadpaal;
 * STEK gaat over koudemiddelen en die zitten hier niet in. Wat er wel moet
 * kloppen staat in sectie 4.
 */

/** De vergelijking uit de kostensectie, per manier van laden. */
const laadkosten = (perJaar: number, tarief?: string) =>
  [
    `${euro(perJaar)} per jaar, ongeveer ${perHonderdKm(perJaar)} per 100 km.`,
    tarief ? `Aan de meter is dat ${tarief}.` : null,
  ]
    .filter(Boolean)
    .join(" ");

const Laadpaal = () => (
  <MaatregelPagina
    slug="laadpaal"
    icon={Plug}
    seoTitle="Laadpaal | Voortraject"
    seoDescription="1-fase of 3-fase, wat kan er in jouw meterkast? Met de laadtijden per aansluiting, wat load balancing doet, en een eerlijke vergelijking tussen thuis en openbaar laden."
    eigenSecties={[
      { na: "hero", bg: "wit", id: "aansluiting", inhoud: <EenOfDrieFase /> },
      { na: "route", bg: "wit", id: "veilig-laden", inhoud: <VeiligLaden /> },
      { na: "subsidies", bg: "warm", id: "eigen-zon", inhoud: <LadenOpEigenZon /> },
    ]}
    heroTitle="Laadpaal, voordelig [[thuis]] laden"
    heroSub="Thuis laden is ruwweg de helft goedkoper dan alleen aan de openbare paal, en veiliger dan een gewoon stopcontact. Hoe snel je kunt laden hangt niet af van je auto maar van je meterkast."
    heroIntro=""
    heroImageSrc={laadpaalImage}
    heroImageAlt="Laadpaal naast een elektrische auto op een oprit"
    pastBij={[
      "Je een elektrische auto hebt of binnenkort gaat rijden",
      "Je een eigen oprit, garage of parkeerplek op eigen terrein hebt",
      "De auto 's nachts of overdag langere tijd stilstaat, want dan is laadsnelheid nauwelijks een probleem",
      "Je zonnepanelen hebt of overweegt en meer van je eigen opwek wilt gebruiken",
    ]}
    minderUrgent={[
      "Je geen eigen parkeerplek op eigen terrein hebt",
      "Je nauwelijks rijdt en een enkele keer openbaar laden voor jou volstaat",
      "Je meterkast al vol zit en je niet eerst naar de rest van je installatie wilt kijken",
      "Je binnenkort verhuist en de laadpaal niet meeneemt",
    ]}
    routeStep="slim"
    routeTekst={`Een laadpaal is geen stap in het isoleren van je woning, maar hij verandert wel je stroomverbruik ingrijpend. Een nieuwe accu is gemiddeld ${ACCU.gemiddeld} kWh, terwijl een huishouden op een dag minder dan ${ACCU.huishoudenPerDag} kWh gebruikt. Eén keer volladen is dus meer dan zes dagen huishouden. Daarmee is laden precies waar slim gebruiken concreet wordt: op het juiste moment, zoveel mogelijk op je eigen opwek, en zonder je aansluiting te overvragen.`}
    kostenItems={LADEN.map((manier) => ({
      title: manier.naam,
      body: `${manier.toelichting} ${laadkosten(manier.perJaar, manier.tarief)}`,
    }))}
    kostenFooter={`Gerekend voor ${REKENBASIS.kilometers.toLocaleString("nl-NL")} km per jaar, ${REKENBASIS.omschrijving}. Ter vergelijking: op benzine ben je ${euro(BENZINE.perJaar)} per jaar kwijt, oftewel ${perHonderdKm(BENZINE.perJaar)} per 100 km. Tussen alleen thuis en alleen openbaar laden zit ${euro(VERSCHIL_PER_JAAR)} per jaar, en een laadpaal laten plaatsen kost ${euro(AANSCHAF.van)} tot ${euro(AANSCHAF.tot)}. Hoeveel je daarvan terugziet hangt af van hoe vaak je thuis staat. Cijfers van ${BRONNEN.opladen.naam}, gecontroleerd op ${BRONNEN.opladen.gecontroleerd}.`}
    faqs={[
      {
        q: "Wat is het verschil tussen een 1-fase en een 3-fase laadpaal?",
        a: "Het verschil zit in je aansluiting, niet in de paal. Op een 1-faseaansluiting, wat ongeveer 70 procent van de huizen heeft, is 3,7 kW het maximum en duurt een lege accu volladen 10 tot 20 uur. Met een 3-fasenaansluiting kan 7,4 of 11 kW en is dat 3,5 tot 10 uur. Staat je auto 's nachts toch stil, dan merk je van dat verschil weinig.",
      },
      {
        q: "Kan ik niet gewoon aan een stopcontact laden?",
        a: "Dat wordt sterk afgeraden. Een gewoon stopcontact is niet gemaakt voor uren achtereen hoog vermogen, de installatie kan verhit raken en dat kan brand geven. Kan het echt niet anders, dan alleen met randaarde, op een aparte goed afgezekerde groep volgens NEN 1010 en met een laadbeveiliger in de kabel. Een verlengsnoer is nooit goed.",
      },
      {
        q: "Wat is load balancing en heb ik dat nodig?",
        a: "Load balancing laat de laadpaal meekijken met de rest van je huis. Gaat de kookplaat aan terwijl de warmtepomp draait, dan knijpt de laadpaal zichzelf af in plaats van dat de hoofdzekering eruit vliegt. Op een 1-faseaansluiting is dat vrijwel altijd verstandig. Heeft je laadpaal die functie niet, dan kan een voorrangsschakelaar in de meterkast hetzelfde doen.",
      },
      {
        q: "Moet ik mijn aansluiting laten verzwaren?",
        a: "Vaak niet. Veel huishoudens laden prima op 1-fase, zeker met load balancing erbij. En verzwaren is geen snelle uitweg: zit het net vol, dan verschilt de wachttijd per regio en kan die oplopen van enkele jaren tot 10 jaar. Kijk daarom eerst wat er binnen je huidige aansluiting past.",
      },
      {
        q: "Kan ik mijn auto laden op mijn eigen zonnepanelen?",
        a: "Ja, en dat gaat vanaf 1 januari 2027 zwaarder wegen, want dan stopt de salderingsregeling. Zonder extra maatregelen gebruik je gemiddeld ongeveer 30 procent van je zonnestroom zelf; laad je je auto overdag thuis, dan kan dat richting 50 procent. Veel laadpalen kunnen zo instellen dat ze vooral laden als je panelen opwekken.",
      },
      {
        q: "Is er subsidie voor een laadpaal?",
        a: "Voor een laadpaal bij een woning is er meestal geen aparte regeling. Wat er voor jouw adres wél is, hangt af van je gemeente en provincie en van de andere maatregelen die je neemt. Doe de subsidiecheck met je postcode, dan zie je wat er voor jouw woning geldt.",
      },
    ]}
    finalCtaKop="Benieuwd welke laadpaal bij jou [[past]]?"
    finalCtaTekst="In een gratis gesprek kijken we naar je meterkast, je rijgedrag en je eventuele zonnepanelen, en vertellen we eerlijk welk vermogen logisch is en wat er in je installatie moet gebeuren. Wij verkopen geen laadpalen en koppelen je alleen aan vakkundige uitvoerders."
  />
);

export default Laadpaal;
