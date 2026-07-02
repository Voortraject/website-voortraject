import { Thermometer } from "lucide-react";
import { MaatregelPagina } from "@/components/MaatregelPagina";
import warmtepompImage from "@/assets/maatregel-warmtepomp.webp";

const Warmtepomp = () => (
  <MaatregelPagina
    slug="warmtepomp"
    icon={Thermometer}
    seoTitle="Warmtepomp | Voortraject"
    seoDescription="Gasloos en comfortabel verwarmen met een warmtepomp. Wanneer is je woning er klaar voor, wat kost het en welke certificeringen zijn belangrijk?"
    heroTitle="Warmtepomp, [[comfort]] zonder gas"
    heroSub="Verwarmen zonder gas, mits je woning er klaar voor is. In een goed geïsoleerde woning is een warmtepomp een efficiënte stap, en de keuze tussen hybride en volledig elektrisch hangt af van je woning en einddoel."
    heroIntro=""
    heroImageSrc={warmtepompImage}
    heroImageAlt="Adviseur van Voortraject bekijkt de installatie en instellingen binnenshuis"
    heroImagePosition="center 30%"
    pastBij={[
      "Je van het gas af wilt, stap voor stap met een hybride of in één keer volledig elektrisch",
      "Je woning al redelijk geïsoleerd is, of je nog isoleert en met een hybride wilt starten",
      "Je lagetemperatuurverwarming hebt of wilt, zoals vloerverwarming; vooral van belang bij volledig elektrisch",
      "Je cv-ketel binnenkort aan vervanging toe is",
    ]}
    minderUrgent={[
      "Je geen ruimte hebt voor een buitenunit binnen de geluidsnormen",
      "Je woning nog slecht geïsoleerd is en je in één keer volledig elektrisch wilt; isoleer dan eerst of begin met een hybride",
      "Je oude radiatoren met hoge aanvoertemperaturen niet wilt aanpassen; volledig elektrisch past dan niet, een hybride vaak wel",
      "Je op zeer korte termijn verhuist",
    ]}
    watValtEronder={[
      "Hybride warmtepomp, werkt samen met je bestaande cv-ketel",
      "Volledig elektrische warmtepomp, verwarmt het hele huis zonder gas",
      "Lagetemperatuurverwarming als einddoel, zoals vloerverwarming of grotere radiatoren",
    ]}
    routeStep="slim"
    routeTekst="Een warmtepomp rendeert pas goed als de eerdere stappen zijn gezet. In een goed geïsoleerde woning werkt een warmtepomp efficiënt en betaalbaar. In een slecht geïsoleerde woning verbruikt hij veel en vallen de kosten tegen. Daarom is isolatie bijna altijd de eerste stap en komt slim verwarmen daarna. Een hybride warmtepomp kan een goede tussenstap zijn als volledig elektrisch nog niet haalbaar is."
    kostenItems={[
      {
        title: "Hybride warmtepomp",
        body: "Lagere investering en geschikt voor veel bestaande woningen. Werkt samen met je cv-ketel, waardoor je een deel van je gasverbruik vervangt door elektriciteit. Een goede tussenstap richting volledig gasloos.",
        pills: [
          { dim: "Investering", value: "Gemiddeld" },
          { dim: "Terugverdientijd", value: "Gemiddeld" },
          { dim: "Comfortwinst", value: "Hoog" },
        ],
      },
      {
        title: "Volledig elektrische warmtepomp",
        body: "Hogere investering, maar de grootste besparing op de lange termijn en geen gas meer nodig. Vraagt om een goed geïsoleerde woning en bij voorkeur lagetemperatuurverwarming om efficiënt te draaien.",
        pills: [
          { dim: "Investering", value: "Hoog" },
          { dim: "Terugverdientijd", value: "Lang" },
          { dim: "Comfortwinst", value: "Hoog" },
        ],
      },
    ]}
    kostenFooter="Wat het beïnvloedt zijn de isolatiegraad, het type verwarming, de grootte van de woning en de energieprijzen."
    zachteCtaTekst="Benieuwd of jouw woning klaar is voor een warmtepomp?"
    aandachtspunten={[
      "Een warmtepomp werkt alleen efficiënt in een voldoende geïsoleerde woning. Isoleer eerst.",
      "Volledig elektrisch werkt het beste met lagetemperatuurverwarming.",
      "De buitenunit produceert geluid. Er gelden geluidsnormen op de erfgrens.",
      "Kies een gecertificeerde installateur. Dat bepaalt de kwaliteit en veiligheid van de installatie.",
    ]}
    keurmerken={{
      kop: "Let op [[keurmerken]] en certificeringen",
      intro:
        "Een warmtepomp werkt met koudemiddelen en vraagt om vakkundige installatie. Werk alleen met installateurs die de juiste erkenningen hebben. Hier let je op:",
      items: [
        "BRL 6000-21, de erkenning voor het ontwerp en de installatie van warmtepompen",
        "BRL 100 en BRL 200 gerelateerde erkenningen voor installatiewerk",
        "STEK, verplichte certificering voor bedrijven die met koudemiddelen werken",
        "F-gassen vakbekwaamheid, categorie F1 en F2, voor het veilig werken met fluorhoudende koudemiddelen",
      ],
      voetregel:
        "Wij koppelen je alleen aan uitvoerders die deze certificeringen op orde hebben.",
    }}
    subsidiesIntro="Voor warmtepompen gelden aantrekkelijke regelingen, vaak combineerbaar:"
    subsidiesItems={[
      "ISDE (landelijk), een vast bedrag per type warmtepomp, verdubbelt bij twee of meer maatregelen",
      "Nij Begun en gemeentelijke regelingen, afhankelijk van je adres",
    ]}
    faqs={[
      {
        q: "Is mijn woning geschikt voor een warmtepomp?",
        a: "Dat hangt vooral af van je isolatie en je type verwarming. In een goed geïsoleerde woning met lagetemperatuurverwarming werkt een warmtepomp het best; is je woning daar nog niet klaar voor, dan kan een hybride een logische tussenstap zijn.",
      },
      {
        q: "Wat is het verschil tussen een hybride en een volledig elektrische warmtepomp?",
        a: "Een hybride werkt samen met je cv-ketel en vervangt een deel van je gasverbruik. Een volledig elektrische warmtepomp maakt je woning gasloos, vraagt een hogere investering, maar levert op lange termijn de grootste besparing.",
      },
      {
        q: "Maken warmtepompen veel geluid?",
        a: "Moderne warmtepompen zijn een stuk stiller en moeten voldoen aan wettelijke geluidsnormen op de perceelgrens. Met de juiste plaatsing van de buitenunit valt overlast voor jou en de buren in de praktijk mee.",
      },
      {
        q: "Heb ik een vergunning nodig voor de buitenunit?",
        a: "Meestal niet, maar er gelden regels rond geluid en plaatsing die per gemeente verschillen. We zorgen dat de uitvoerder daar rekening mee houdt en checken het bij twijfel voor jouw situatie.",
      },
      {
        q: "Kom ik in aanmerking voor subsidie of Nij Begun?",
        a: "Vaak wel. Voor een warmtepomp bestaat landelijke ISDE-subsidie, en in Groningen en Noord-Drenthe kan Nij Begun daar bovenop komen. Wat je precies krijgt hangt af van je woning en gebied; dat zoeken we voor je uit.",
      },
      {
        q: "Zit ik vast aan een bepaald merk?",
        a: "Nee. Wij zijn onafhankelijk en niet gebonden aan één merk of leverancier. We kijken puur naar wat het beste bij jouw woning en budget past.",
      },
    ]}
    finalCtaKop="Is jouw woning klaar voor een [[warmtepomp]]?"
    finalCtaTekst="In een gratis gesprek kijken we naar je isolatie, je verwarming en je woning, en vertellen we eerlijk of een warmtepomp nu logisch is of dat andere stappen eerst slimmer zijn. Wij verkopen geen installaties en koppelen je alleen aan gecertificeerde uitvoerders."
  />
);

export default Warmtepomp;
