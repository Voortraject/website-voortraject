import { Snowflake } from "lucide-react";
import { MaatregelPagina } from "@/components/MaatregelPagina";
import { WatKoelenKost } from "@/components/maatregel/airco/WatKoelenKost";
import { VerwarmenMetAirco } from "@/components/maatregel/airco/VerwarmenMetAirco";
import { VakmanschapEnOnderhoud } from "@/components/maatregel/airco/VakmanschapEnOnderhoud";
import { euro, getal, KOELSYSTEMEN, REKENBASIS } from "@/data/airco";
import aircoImage from "@/assets/maatregel-airco.webp";

/**
 * Zes inhoudelijke secties plus de FAQ:
 *
 *   1 wat koelen echt kost          (eigen)
 *   2 past dit bij jouw woning      (template)
 *   3 waar dit staat in de route    (template)
 *   4 een airco is ook een warmtepomp (eigen)
 *   5 wat je investering oplevert   (template)
 *     subsidiecheck
 *   6 goed geplaatst en onderhouden (eigen)
 *
 * De oude pagina begon met "aangename verkoeling" en noemde geen enkel cijfer.
 * Nu staat het verbruik vooraan, inclusief de ventilator, want dat is het
 * eerlijke antwoord van een partij die zelf geen airco's verkoopt.
 */

const Airco = () => (
  <MaatregelPagina
    slug="airco"
    icon={Snowflake}
    seoTitle="Airco | Voortraject"
    seoDescription="Wat koelen echt kost, van ventilator tot multi split, en waar de grens ligt tussen een airco en een warmtepomp. Met de geluidsnorm voor de buitenunit."
    eigenSecties={[
      { na: "hero", bg: "wit", id: "verbruik", inhoud: <WatKoelenKost /> },
      { na: "route", bg: "wit", id: "verwarmen", inhoud: <VerwarmenMetAirco /> },
      { na: "subsidies", bg: "warm", id: "vakmanschap", inhoud: <VakmanschapEnOnderhoud /> },
    ]}
    heroTitle="Airco, koelen en verwarmen in [[één]]"
    heroSub="Een split-airco koelt in de zomer en kan een losse ruimte in de winter verwarmen, want het is dezelfde techniek als een warmtepomp. De vraag is vooral of je hem nodig hebt, en welk type."
    heroIntro=""
    heroImageSrc={aircoImage}
    heroImageAlt="Adviseur van Voortraject bekijkt een airco-binnenunit aan de muur"
    heroImagePosition="center 25%"
    pastBij={[
      "Je in de zomer echt last hebt van warmte, ook met zonwering en 's nachts luchten",
      "Je losse ruimtes wilt koelen of verwarmen, zoals een zolder, thuiskantoor of aanbouw",
      "Je een ruimte nu met gas of elektrische kachels verwarmt en dat zuiniger wilt",
      "Je een oplossing zonder verbouwing zoekt",
    ]}
    minderUrgent={[
      "Je je hele woning gasloos wilt verwarmen; kijk dan eerst naar een warmtepomp",
      "Je geen plek hebt voor een buitenunit binnen de geluidsnorm op de perceelgrens",
      "Je met zonwering, isolatie en een ventilator uitkomt op de paar warme dagen die je hebt",
      "Je een mobiele airco overweegt als permanente oplossing; dat is de duurste manier om te koelen",
    ]}
    wanneerKop="Wanneer is dit relevant?"
    routeTekst="Een airco hoort bij de laatste stap: slim gebruiken. Hoe beter je woning geïsoleerd is en hoe meer warmte je buiten houdt met zonwering, hoe minder hij hoeft te draaien. Wek je bovendien zelf stroom op, dan koelt hij precies op de uren dat de zon schijnt en je panelen het meeste leveren. In die volgorde is een airco een prima aanvulling; als eerste stap is hij een dure pleister."
    kostenItems={KOELSYSTEMEN.filter((s) => s.naam !== "Ventilator").map((systeem) => ({
      title: systeem.naam,
      body: `${systeem.toelichting} Over ${REKENBASIS.uren} uur gebruik: ${getal(systeem.kwh)} kWh, ongeveer ${euro(systeem.euro)} en ${getal(systeem.co2)} kg CO2.`,
    }))}
    kostenFooter={`Gerekend met ${REKENBASIS.stroomprijs}, cijfers van Milieu Centraal. Het vermogen moet passen bij de ruimte: te klein haalt het niet, te groot slaat steeds aan en uit en verbruikt daardoor onnodig veel. Dat bepaalt in de praktijk meer dan het merk.`}
    faqs={[
      {
        q: "Hoeveel stroom verbruikt een airco?",
        a: `Over ${REKENBASIS.uren} uur gebruik komt een vaste single split op ongeveer 80 kWh, een mobiele airco op 110 kWh en een multi split op 180 kWh. Ter vergelijking: een ventilator gebruikt in diezelfde uren 5,5 kWh. Draait een mobiele airco 300 uur per jaar, dan is dat ongeveer 300 kWh, zo'n € 60.`,
      },
      {
        q: "Is een mobiele airco geen goedkoper alternatief?",
        a: "In aanschaf wel, in gebruik niet. De slang door het raam laat warme lucht terug naar binnen, waardoor het apparaat harder moet werken dan een vaste split. Als tijdelijke oplossing prima, als vaste oplossing de duurste keuze.",
      },
      {
        q: "Kan een airco ook verwarmen, of alleen koelen?",
        a: "Een split-airco is technisch een lucht-lucht warmtepomp en kan dus ook verwarmen. Voor een losse ruimte of om bij te verwarmen in het voor- en naseizoen werkt dat goed. Voor de hele woning gasloos is hij niet geschikt: hij blaast warme lucht en verwarmt geen tapwater.",
      },
      {
        q: "Wat mag de buitenunit aan geluid maken?",
        a: "Op de perceelgrens maximaal 40 dB in de avond en de nacht, en overdag onder voorwaarden 45 dB. Dat staat in het Besluit bouwwerken leefomgeving en is dezelfde eis als voor de buitenunit van een warmtepomp. De plek waar de unit komt te hangen bepaalt of dat lukt.",
      },
      {
        q: "Wie mag een airco installeren?",
        a: "Iemand met een F-gassencertificaat, want er komt koudemiddel in het systeem. Vraag daarnaast naar de erkenning van het bedrijf. Wij koppelen je alleen aan uitvoerders die dat op orde hebben.",
      },
      {
        q: "Hoeveel onderhoud vraagt een airco?",
        a: "De filters reinig of vervang je een paar keer per seizoen; dat doen de meeste mensen zelf. De controle van het systeem en het koudemiddel laat je aan een specialist over. Een vervuilde airco verbruikt meer en blaast slechtere lucht de kamer in.",
      },
    ]}
    finalCtaKop="Benieuwd of je echt een airco [[nodig]] hebt?"
    finalCtaTekst="In een gratis gesprek kijken we naar je ruimtes, je isolatie en je zonwering, en vertellen we eerlijk of een airco de juiste oplossing is of dat andere stappen meer opleveren. Wij verkopen geen airco's en koppelen je alleen aan gecertificeerde uitvoerders."
  />
);

export default Airco;
