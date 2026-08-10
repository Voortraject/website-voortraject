import { Sun } from "lucide-react";
import { MaatregelPagina } from "@/components/MaatregelPagina";
import { SalderingStopt } from "@/components/maatregel/zonnepanelen/SalderingStopt";
import { DakOpbrengst } from "@/components/maatregel/zonnepanelen/DakOpbrengst";
import { OfferteEnCombineren } from "@/components/maatregel/zonnepanelen/OfferteEnCombineren";
import { euro, getal, PANEEL, SALDERING, SETS, ZELFVERBRUIK } from "@/data/zonnepanelen";
import zonnepanelenImage from "@/assets/maatregel-zonnepanelen.webp";

/**
 * Zes inhoudelijke secties plus de FAQ:
 *
 *   1 salderen stopt op 1 januari 2027  (eigen)
 *   2 past dit bij jouw woning          (template)
 *   3 waar dit staat in de route        (template)
 *   4 wat jouw dak kan                  (eigen)
 *   5 wat je investering oplevert       (template)
 *     subsidiecheck
 *   6 waar je op let bij een offerte    (eigen)
 *
 * De grote correctie: de oude tekst zei dat saldering "stapsgewijs wordt
 * afgebouwd". Dat is achterhaald. Hij stopt in één keer, en dat is over een
 * paar maanden. Een bezoeker die nu panelen overweegt rekent zich anders rijk.
 */

/** De middelste set, als voorbeeld in de FAQ. Cijfers uit één bron houden. */
const VOORBEELD = SETS[1];

const Zonnepanelen = () => (
  <MaatregelPagina
    slug="zonnepanelen"
    icon={Sun}
    badge="Vaak vervolgstap"
    seoTitle="Zonnepanelen | Voortraject"
    seoDescription="Salderen stopt op 1 januari 2027. Wat zonnepanelen daarna nog opleveren, wat jouw dak kan per richting en hellingshoek, en waar je op let bij een offerte."
    eigenSecties={[
      { na: "hero", bg: "wit", id: "saldering", inhoud: <SalderingStopt /> },
      { na: "route", bg: "wit", id: "dak", inhoud: <DakOpbrengst /> },
      { na: "subsidies", bg: "warm", id: "offerte", inhoud: <OfferteEnCombineren /> },
    ]}
    heroTitle="Zonnepanelen, stroom die [[loont]]"
    heroSub={`Nog steeds een verstandige stap, maar de rekensom verandert: salderen stopt op ${SALDERING.stopt}. Vanaf dan telt vooral hoeveel van je eigen opwek je zelf gebruikt.`}
    heroIntro=""
    heroImageSrc={zonnepanelenImage}
    heroImageAlt="Adviseur van Voortraject controleert de zonnepanelen op het dak van een woning"
    heroImagePosition="center"
    pastBij={[
      "Je een dak hebt met genoeg ruimte en niet te veel schaduw",
      "Je nu of straks meer stroom gaat gebruiken, bijvoorbeeld door een warmtepomp of elektrisch rijden",
      "Je overdag thuis bent of je verbruik naar de zonuren kunt verschuiven",
      "Je woning al redelijk geïsoleerd is",
    ]}
    minderUrgent={[
      `Je dak binnen ${PANEEL.levensduur} jaar vervangen moet worden; doe dat dan eerst en plaats de panelen daarna`,
      "Je dak veel schaduw heeft of op het noorden ligt met een steile helling",
      "Je vrijwel niets overdag verbruikt en niets wilt veranderen aan wanneer je stroom gebruikt",
      "Je binnenkort verhuist en de panelen niet meeneemt",
    ]}
    routeStep="opwekken"
    routeTekst="Zonnepanelen werken het beste in een al goed geïsoleerde woning. Dan verbruik je minder dan je opwekt, in plaats van andersom. Daarom komt opwekken in de route na het beperken van je verbruik. Nu salderen stopt, wordt de derde stap belangrijker dan hij ooit was: hoe meer van je eigen opwek je zelf gebruikt, hoe sneller de panelen zich terugverdienen."
    kostenItems={SETS.map((set) => ({
      title: `${set.panelen} panelen`,
      body: `${euro(set.prijs)} inclusief plaatsing, goed voor ongeveer ${getal(set.opbrengst)} kWh per jaar. Op je energierekening scheelt dat ${euro(set.besparingNu)} in 2026 en ${euro(set.besparingStraks)} vanaf 2027, bij ${ZELFVERBRUIK.gemiddeld} procent zelfverbruik.`,
    }))}
    kostenFooter={`Panelen gaan ongeveer ${PANEEL.levensduur} jaar mee en verdienen zich binnen die levensduur terug. Hoe snel precies hangt vooral af van hoeveel je zelf gebruikt: dat deel is ${ZELFVERBRUIK.verhouding} dan stroom die je inkoopt. Bedragen van Milieu Centraal, inclusief plaatsing en bij het huidige btw-tarief van ${PANEEL.btw}.`}
    faqs={[
      {
        q: "Wat betekent het stoppen van de saldering voor mij?",
        a: `Tot en met ${SALDERING.laatsteDag} streep je alles wat je teruglevert weg tegen wat je afneemt. Vanaf ${SALDERING.stopt} kan dat niet meer: je krijgt een vergoeding voor teruggeleverde stroom, die tot ${SALDERING.ondergrensTot} minstens ${SALDERING.ondergrens} moet zijn. Bij ${VOORBEELD.panelen} panelen en gemiddeld zelfverbruik scheelt dat op je rekening ongeveer ${euro(VOORBEELD.besparingNu)} in 2026 tegenover ${euro(VOORBEELD.besparingStraks)} daarna. Wat je eraan kunt doen is meer van je eigen stroom zelf gebruiken.`,
      },
      {
        q: "Zijn zonnepanelen dan nog wel de moeite waard?",
        a: `Voor de meeste daken wel, maar de rekensom is anders dan een paar jaar geleden. Panelen gaan ongeveer ${PANEEL.levensduur} jaar mee en verdienen zich binnen die levensduur terug. De winst zit vanaf 2027 vooral in de stroom die je zelf gebruikt in plaats van teruglevert, en dat is ${ZELFVERBRUIK.verhouding} dan stroom die je inkoopt.`,
      },
      {
        q: "Is mijn dak geschikt voor zonnepanelen?",
        a: "Richting, hellingshoek, schaduw en ruimte bepalen wat er kan. Een dak op het zuiden met 30 tot 45 graden helling levert het meest op, maar een oost-westopstelling doet nauwelijks onder en verdeelt de opwek beter over de dag. In het raster op deze pagina zoek je je eigen dak op.",
      },
      {
        q: "Wat is het verschil tussen een string-omvormer en micro-omvormers?",
        a: "Een string-omvormer zet de stroom van alle panelen samen om en is goedkoper. Micro-omvormers of optimizers doen dat per paneel en zijn nodig zodra er schaduw op een deel van de panelen valt of de panelen over meerdere dakvlakken liggen. Zonder schaduw voegen ze weinig toe.",
      },
      {
        q: "Wat zijn terugleverkosten?",
        a: "Kosten die je energieleverancier in rekening brengt voor het verwerken van de stroom die je teruglevert. Ze mogen alleen bestaan uit de kosten die de leverancier daar zelf voor maakt, maar ze verschillen per contract. Vergelijk ze voordat je een contract afsluit, want ze wegen vanaf 2027 zwaarder mee.",
      },
      {
        q: "Heb ik een vergunning nodig voor zonnepanelen?",
        a: "Voor de meeste woningen niet. Bij monumenten of een beschermd stadsgezicht gelden soms uitzonderingen; dat checken we voor je.",
      },
    ]}
    finalCtaKop="Benieuwd wat jouw dak nog [[oplevert]]?"
    finalCtaTekst="In een gratis gesprek kijken we naar je dak, je verbruik en je plannen, en rekenen we eerlijk voor wat panelen na het stoppen van de saldering nog opleveren. Wij verkopen geen panelen en koppelen je alleen aan vakkundige uitvoerders."
  />
);

export default Zonnepanelen;
