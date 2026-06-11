import { Thermometer } from "lucide-react";
import { MaatregelPagina } from "@/components/MaatregelPagina";
import warmtepompImage from "@/assets/maatregel-warmtepomp.jpg";

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
    heroImageAlt="Warmtepomp buitenunit naast een woning"
    pastBij={[
      "Je woning al redelijk tot goed geïsoleerd is",
      "Je stap voor stap of in één keer van het gas af wilt",
      "Je lagetemperatuurverwarming hebt of wilt, zoals vloerverwarming",
      "Je cv-ketel binnenkort moet worden vervangen",
    ]}
    minderUrgent={[
      "Je woning slecht geïsoleerd is, isoleer dan eerst",
      "Je geen ruimte hebt voor een buitenunit binnen de geluidsnormen",
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
      },
      {
        title: "Volledig elektrische warmtepomp",
        body: "Hogere investering, maar de grootste besparing op de lange termijn en geen gas meer nodig. Vraagt om een goed geïsoleerde woning en bij voorkeur lagetemperatuurverwarming om efficiënt te draaien.",
      },
      {
        title: "Lagetemperatuurverwarming",
        body: "Extra investering bovenop de warmtepomp zelf, maar vaak nodig voor optimale efficiëntie. Denk aan vloerverwarming of grotere radiatoren die de warmte beter afgeven bij lagere aanvoertemperaturen.",
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
        q: "Werkt een warmtepomp ook in een oudere woning?",
        a: "Dat hangt af van de isolatie. In een goed geïsoleerde woning werkt een volledig elektrische warmtepomp efficiënt. Is je woning matig geïsoleerd, dan is een hybride warmtepomp vaak een verstandige tussenstap, omdat die samenwerkt met je bestaande cv-ketel.",
      },
      {
        q: "Wat is het verschil tussen een hybride en een volledig elektrische warmtepomp?",
        a: "Een hybride warmtepomp combineert een warmtepomp met je cv-ketel en is geschikt voor veel bestaande woningen. Een volledig elektrische warmtepomp verwarmt het hele huis zonder gas, maar vraagt om een goed geïsoleerde woning en bij voorkeur lagetemperatuurverwarming.",
      },
      {
        q: "Heb ik vloerverwarming nodig voor een warmtepomp?",
        a: "Niet per se, maar het helpt. Warmtepompen werken het beste met lagetemperatuurverwarming, zoals vloerverwarming of grotere radiatoren. In een goed geïsoleerde woning kan het ook met aangepaste radiatoren.",
      },
      {
        q: "Maakt een warmtepomp veel geluid?",
        a: "Moderne warmtepompen zijn relatief stil, maar de buitenunit produceert geluid. Er gelden geluidsnormen voor de erfgrens. Een goede installateur houdt daar rekening mee bij de plaatsing.",
      },
    ]}
    finalCtaKop="Is jouw woning klaar voor een [[warmtepomp]]?"
    finalCtaTekst="In een gratis gesprek kijken we naar je isolatie, je verwarming en je woning, en vertellen we eerlijk of een warmtepomp nu logisch is of dat andere stappen eerst slimmer zijn. Wij verkopen geen installaties en koppelen je alleen aan gecertificeerde uitvoerders."
  />
);

export default Warmtepomp;
