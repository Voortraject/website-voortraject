# Plan: Verduurzamen-pagina's naar enterprise-niveau

Status: **ter bespreking**, nog niets geïmplementeerd.
Scope: de 7 pagina's onder `/verduurzamen/*` plus een nieuwe hub-pagina `/verduurzamen`.

## Vastgelegde uitgangspunten (2026-08-10)

1. **Harde cijfers mogen**, mits uit officiële bronnen (RVO, Milieu Centraal,
   Rijksoverheid) met bronvermelding en een "laatst gecontroleerd"-datum per cijfer. Wat ik
   niet kan verifiëren komt er niet in.
2. **Foto's:** we werken met het bestaande materiaal. Zodra een sectie echt een ander beeld
   nodig heeft, meld ik dat concreet en zoekt de opdrachtgever er een op. Ik ontwerp de
   secties zo dat ze niet omvallen zonder extra foto.
3. **Onderhoud is puur informatief.** Voortraject doet niets met onderhoud; de
   service-belofte gaat van de pagina af, de pagina blijft voor kennis en SEO.
4. **Hub-pagina `/verduurzamen` komt er**, als laatste stap.
5. **Alleen publieke bronnen.** Geen eigen praktijkcijfers van Voortraject; alles komt uit
   RVO, Milieu Centraal, Rijksoverheid en vergelijkbare bronnen, met bron en controledatum.
6. **CTA-opzet:** de subsidiecheck halverwege de pagina, het gratis gesprek als afsluiter.
7. **Maximaal 6 secties plus de FAQ** per pagina (afgesproken 2026-08-10). De hero telt niet mee,
   de subsidiecheck-band en de afsluitende CTA-band ook niet: dat is conversie, geen inhoud. Een
   pagina wordt korter door props weg te laten, niet door het template te veranderen. Content die
   als losse sectie sneuvelt gaat naar de sectie waar hij bruikbaar is, of vervalt omdat een
   sterkere sectie hem al dekt.

---

## 1. Diagnose: waarom deze pagina's nu generiek voelen

Ik heb alle 7 pagina's en het template gelezen. Drie dingen vallen op.

### a) De helft van de content wordt niet getoond

`MaatregelPagina.tsx` accepteert 30+ props, maar rendert er maar een deel van. Deze props
worden op de pagina's netjes ingevuld en vervolgens **stilletjes weggegooid**:

| Prop | Waar ingevuld | Wordt getoond? |
|---|---|---|
| `watValtEronder` | alle 6 | nee |
| `routeStep` / `routeTekst` | alle 6 | nee |
| `aandachtspunten` | alle 6 | nee |
| `keurmerken` | warmtepomp, airco, laadpaal | nee (alleen als badge-tekst, en die badges worden ook niet gerenderd) |
| `subsidiesIntro` / `subsidiesItems` | alle 6 | nee |
| `kostenFooter` | alle 6 | nee (er staat een vaste, identieke voetnoot in de plaats) |
| `zachteCtaTekst` | alle 6 | nee |
| `extraInfo` | thuisbatterij | nee |
| `onderhoud` | airco | nee |
| `combineren` | laadpaal | nee |

Er staat dus al een flinke hoeveelheid goede, specifieke tekst in de codebase die bezoekers
nooit zien. Dat verklaart voor een groot deel het "generieke" gevoel: wat overblijft zijn 5
secties waarvan er 3 op elke pagina bijna identiek zijn.

### b) Wat er wél staat is grotendeels identiek per pagina

- Sectie "Zo pakken wij het voor je op": **op alle 6 pagina's exact dezelfde 3 stappen**
  (de `DEFAULT_PROCES`, geen enkele pagina levert eigen stappen aan).
- Sectie "Past dit bij jouw woning": zelfde subkop op elke pagina.
- Sectie "Wat je investering oplevert": zelfde afsluitende voetnoot op elke pagina.
- Eén foto per pagina, verder alleen tekst in kaartjes. Geen diagram, geen tabel, geen
  vergelijking, geen cijfer.

### c) Het niveauverschil met de rest van de site is groot

| Pagina | Regels | Eigen secties |
|---|---|---|
| `/subsidies/nij-begun` | 1025 | 8, met tabellen, traject-tijdlijn, foto's, uitklappers |
| `/subsidies/landelijk` | 979 | 9, met bedragentabel, rekenvoorbeeld, stappenplan |
| `/subsidies/regionaal` | 648 | eigen |
| `/verduurzamen/onderhoud` | 364 | 5, eigen opmaak (wijkt af van de andere 6) |
| **de andere 6 verduurzamen-pagina's** | **89 tot 121** | **0, alles uit het template** |

De subsidiepagina's laten precies zien wat het huis-niveau is: cijfers met bronvermelding,
"laatst bijgewerkt", tabellen, uitklapbare verdieping, iconen-in-cirkels, een stappenplan en
een "waarom Voortraject"-blok. Dat is de lat.

### Overige gaten

- **Geen enkele interne link** tussen maatregelen onderling of naar de subsidiepagina's,
  behalve de niet-gerenderde `combineren`-prop. Slecht voor SEO en voor de bezoeker.
- **Geen subsidiecheck-CTA** op de maatregelpagina's, terwijl dat het sterkste
  conversiemiddel van de site is.
- **Geen reviews** op deze pagina's (`ReviewsCompact` bestaat en wordt elders gebruikt).
- **Geen JSON-LD**: `Seo` heeft een `jsonLd`-prop die nergens in de site wordt gebruikt.
  FAQPage- en BreadcrumbList-schema zijn hier laaghangend fruit, elke pagina heeft al 4 tot 6 FAQ's.
- **Geen kruimelpad**, terwijl `/verduurzamen` zelf naar de homepage redirect. De nav-knop
  "Verduurzamen" linkt nu naar de isolatiepagina, wat verwarrend is.
- **Kleuren hardgecodeerd** (`NAVY = "#152C4E"` etc.) in plaats van de design-tokens. Dat is
  in strijd met de projectregel en maakt latere huisstijlwijzigingen risicovol.
- **Onderhoud wijkt qua opmaak af** van de andere 6 (eigen `Section`, andere paddings, andere
  hero-typografie). Ziet er nu uit als een andere website.

---

## 2. Gedeeld fundament (eerste PR, vóór de pagina's zelf)

Voorstel: **één gedeeld template met een sectiebibliotheek**, niet 7 keer maatwerk. Elke
pagina kiest welke modules hij gebruikt en levert eigen inhoud aan, plus ruimte voor 1 of 2
pagina-eigen modules waar de maatregel dat verdient. Zo blijft de reeks visueel één geheel
(dat is precies wat "enterprise" hier betekent) en blijft onderhoud behapbaar.

Wat in het fundament komt:

1. **Sectiebibliotheek** in `src/components/maatregel/`: `MaatregelHero`, `WelNiet`,
   `VergelijkTabel`, `Volgorde­strip`, `KostenBlok`, `SubsidieBlok`, `KeurmerkBlok`,
   `Aandachtspunten`, `OnderhoudsKalender`, `Faq`, `KruimelPad`, `LaatstBijgewerkt`.
2. **Data losgetrokken van opmaak**: `src/data/verduurzamen/<maatregel>.ts` met per cijfer
   een `bron` en `gecontroleerdOp`. De ISDE-bedragen staan nu hardgecodeerd in
   `SubsidiesLandelijk.tsx`; die verhuizen naar één gedeelde module zodat de bedragen op de
   maatregelpagina's en de subsidiepagina nooit uit elkaar lopen.
3. **Design-tokens** in plaats van hex-constanten, conform de projectregel.
4. **SEO-laag**: FAQPage + BreadcrumbList JSON-LD per pagina, kruimelpad, per-pagina
   OG-afbeelding, `Product`/`Service`-schema waar passend.
5. **Conversielaag**, consequent onderaan elke pagina: subsidiecheck-CTA, compacte reviews,
   "combineert goed met"-kruislinks, afsluitende donkere CTA-band (bestaat al).
6. **Onderhoud** wordt op hetzelfde fundament gezet, zodat alle 7 één familie zijn.

Meetbaar resultaat van deze PR alleen al: alle nu-weggegooide content wordt zichtbaar,
zonder dat er één woord bijgeschreven hoeft te worden.

---

## 3. Plan per pagina

Per pagina: wat er nu mist, welke expertise erbij komt, welk visueel element het draagt, en
wat ik van jou nodig heb.

---

### 3.1 Isolatie & ventilatie (`/verduurzamen/isolatie`)

De belangrijkste pagina van de zeven: isolatie is de eerste stap, het best gesubsidieerd en
de grootste zoekvraag.

**Nu:** 5 isolatiemaatregelen als kaartjes met "Laag / Gemiddeld / Hoog"-pillen. Geen enkel
concreet getal, geen eis, geen bedrag.

**Wat erbij komt:**
- **Sectie "De schil van je woning"**: een SVG-doorsnede van een woning waarin elk vlak (dak,
  gevel, spouw, vloer, ramen, ventilatie) aanklikbaar is. Per vlak: aandeel warmteverlies,
  welke maatregel, de subsidie-eis (Rd-waarde) en het ISDE-bedrag per m². Dit is hét element
  dat de pagina draagt en het is meteen het meest deelbare beeld van de site.
- **Bedragentabel**: maatregel × minimale Rd-waarde × minimaal aantal m² × ISDE bij 1
  maatregel × ISDE bij 2 of meer. Die bedragen staan al in de codebase (subsidiepagina);
  hier komen de technische eisen erbij.
- **Rekenvoorbeeld** (uitklapbaar, zelfde patroon als de ISDE-pagina): "rijwoning 1975,
  spouw + dak" met m², bedragen en het verdubbelingseffect.
- **Volgorde-blok**: de al geschreven `routeTekst` als visuele strip beperken → opwekken →
  slim gebruiken, met links naar zonnepanelen, warmtepomp en thuisbatterij.
- **Ventilatie krijgt een eigen blok** in plaats van een regel in een opsomming: natuurlijk /
  mechanisch / WTW naast elkaar, met het vocht-en-schimmelrisico expliciet. Dit is het
  onderdeel waar de meeste bewoners fout zitten en waar jullie expertise het hardst telt.
- **Aandachtspunten** (al geschreven, nu onzichtbaar) als "wat wij in de praktijk zien".

**Foto's:** de huidige hero (`helpen-isolatie.webp`) is sterk en van jullie zelf. Ik zou er
graag 2 tot 3 uitvoeringsfoto's bij hebben: spouwmuur boren, dakisolatie van binnen,
vloer/bodemisolatie kruipruimte.

---

### 3.2 Warmtepomp (`/verduurzamen/warmtepomp`)

**Nu:** 2 kaartjes (hybride, volledig elektrisch) met pillen. De keurmerken-sectie is
geschreven maar onzichtbaar.

**Wat erbij komt:**
- **Vergelijkingstabel hybride vs. volledig elektrisch** over de assen die er echt toe doen:
  investering, aandeel gasbesparing, benodigde isolatie, radiatoren/vloerverwarming,
  aanvoertemperatuur, ruimte buitenunit, ISDE-bedrag, geschikt wanneer. Dit is de vraag
  waarmee bezoekers binnenkomen en nu nergens beantwoord wordt.
- **"Is jouw woning er klaar voor?"**: de praktische stooklijn-test (zet je cv op een koude
  dag op een lagere aanvoertemperatuur en kijk of het warm blijft). Concreet, uitvoerbaar,
  en precies het soort advies dat vertrouwen wekt.
- **Geluid en plaatsing**: de wettelijke norm op de erfgrens, plus wat plaatsing in de
  praktijk doet. Met een klein schema van de buitenunit-opstelling.
- **Keurmerkenblok** zichtbaar maken (BRL 6000-21, STEK, F-gassen) als visuele badges met
  uitleg bij hover, niet als opsomming.
- **Rendement uitgelegd**: wat SCOP betekent en waarom isolatie het rendement bepaalt.

**Foto's:** huidige hero is binnenshuis. Graag ook een buitenunit-foto van een eigen project
en, als die er is, een meterkast/binnenunit-foto.

---

### 3.3 Zonnepanelen (`/verduurzamen/zonnepanelen`)

**Nu:** één blok tekst met drie pillen. De salderingstekst staat in de niet-gerenderde
`subsidiesIntro`.

**Wat erbij komt:**
- **Tijdlijn afbouw saldering**: wat er wanneer verandert en wat dat per jaar voor een
  gemiddeld huishouden betekent. Dit is dé vraag van dit moment en verdient het centrale
  visuele element van de pagina.
- **Opbrengst per dakoriëntatie**: een dakroos of staafje-vergelijking (zuid / oost-west /
  noord, en hellingshoek), met de indicatieve opbrengst per paneel per jaar.
- **Eigen verbruik-blok**: waarom het aandeel dat je zelf gebruikt de terugverdientijd
  bepaalt, met 2 tot 3 scenario's (zonder batterij, met batterij, met warmtepomp of laadpaal).
- **Waar je op let bij offertes**: omvormertype (string vs. micro), garanties, montage,
  dakvervanging eerst. Praktische, onafhankelijke checklist.
- **Kruislinks** naar thuisbatterij en laadpaal, precies waar de bezoeker die vraag krijgt.

**Foto's:** huidige hero is van jullie. Graag een dakfoto van een afgerond project en zo
mogelijk een omvormer/meterkast-foto.

---

### 3.4 Thuisbatterij & opslag (`/verduurzamen/thuisbatterij`)

De eerlijkste pagina om te maken: de businesscase is voor veel huishoudens nog beperkt, en
dat past bij jullie positionering. Daar valt juist een sterke pagina van te maken.

**Nu:** één blok, drie pillen, en een goed `extraInfo`-blok dat niet wordt getoond.

**Wat erbij komt:**
- **Beslisboom "loont het bij jou?"**: 4 tot 5 vragen (zonnepanelen ja/nee, verbruik,
  contractvorm, terugleverkosten) die uitkomen op wel / nog niet / afhankelijk. Visueel het
  hart van de pagina en volledig eerlijk, ook als de uitkomst "nog niet" is.
- **Waarom nu in opkomst** (het bestaande `extraInfo`-blok) als tijdlijn: afbouw saldering,
  terugleverkosten, netcongestie, dynamische contracten.
- **Capaciteit kiezen**: hoe je van je avond- en nachtverbruik naar een kWh-maat komt, met
  een vuistregel en waarom groter niet beter is.
- **Veiligheid en plaatsing**: normen, plek in huis, brandveiligheid, back-upfunctie
  (die lang niet elke batterij heeft).

**Foto's:** de huidige hero (`maatregel-thuisbatterij.jpg`) oogt als stockmateriaal en wijkt
af van de rest. Hier heb ik echt een eigen foto nodig, anders zakt de pagina visueel door.

---

### 3.5 Airco (`/verduurzamen/airco`)

**Nu:** één blok, drie pillen. Keurmerken- en onderhoudsblok geschreven maar onzichtbaar.

**Wat erbij komt:**
- **Systeemvergelijking**: split / multisplit / monoblock / mobiel, over aantal ruimtes,
  buitenunit, verwarmen ja-nee, geluid, indicatieve investering en geschikt wanneer.
- **Vermogen kiezen**: een vuistregel per ruimtegrootte, met de uitleg waarom te groot
  net zo slecht is als te klein. Praktisch en meteen bruikbaar.
- **Airco als verwarming**: waar de grens ligt tussen airco en warmtepomp, met een duidelijke
  doorverwijzing. Voorkomt dat mensen de verkeerde oplossing kopen, en dat is exact jullie rol.
- **Keurmerkenblok** zichtbaar (STEK, F-gassen, BRL).
- **Onderhoudsblok** zichtbaar, met link naar de onderhoudspagina.

**Foto's:** huidige hero is van jullie. Graag nog een buitenunit- en een montagefoto.

---

### 3.6 Laadpaal (`/verduurzamen/laadpaal`)

**Nu:** één blok, drie pillen. Het `combineren`-blok is geschreven maar onzichtbaar.

**Wat erbij komt:**
- **1-fase vs. 3-fase**: tabel met vermogen, laadtijd voor een volle accu, eisen aan de
  meterkast en wanneer welke logisch is. Met een concreet laadtijd-voorbeeld.
- **Load balancing uitgelegd** met een klein schema: wat er gebeurt als de auto laadt terwijl
  de inductiekookplaat en de warmtepomp draaien. Dit is technisch, onzichtbaar en precies
  waar mensen mee de mist in gaan.
- **Laden op eigen zon**: hoe slim laden werkt en wat het scheelt ten opzichte van openbaar
  laden. Kruislinks naar zonnepanelen en thuisbatterij.
- **Kosten thuis vs. openbaar**: een eerlijke rekensom per 100 km.
- **Veiligheid en normen**: waarom een vaste laadpaal en geen stopcontact, NEN-installatie.

**Foto's:** `maatregel-laadpaal.jpg` oogt eveneens als stock. Graag een eigen foto van een
geplaatste laadpaal.

---

### 3.7 Onderhoud (`/verduurzamen/onderhoud`)

**Nu:** de enige pagina met eigen opmaak, inhoudelijk het dunst (4 generieke voordelen,
4 korte alinea's per installatie, zelf-doen-lijstje).

**Wat erbij komt:**
- **Onderhoudskalender** als centraal element: per installatie wat er wanneer moet gebeuren
  (jaarlijks, 2-jaarlijks, 5-jaarlijks), wie het doet (zelf of specialist) en waarom het moet.
  Eén overzicht dat bezoekers willen bewaren of printen.
- **Wettelijke en garantieverplichtingen**: waar onderhoud verplicht is (koudemiddelen,
  lekcontrole) en waar het alleen je garantie raakt. Dat onderscheid maakt vrijwel niemand.
- **Storingssignalen per installatie**: waar je aan merkt dat er iets mis is, voordat het
  duur wordt.
- **Zelf doen vs. uitbesteden** blijft, maar in de nieuwe vormgeving.
- Pagina wordt op het gedeelde fundament gezet zodat hij bij de andere zes hoort.

**Besloten:** de pagina is puur informatief. De huidige belofte "wij houden overzicht op het
onderhoud van je installaties" gaat eruit; wat blijft is kennis, plus een doorverwijzing naar
het gratis gesprek voor de verduurzamingsstappen zelf.

---

### 3.8 Voorstel: hub-pagina `/verduurzamen` (nieuw)

`/verduurzamen` redirect nu naar de homepage en de nav-knop "Verduurzamen" opent de
isolatiepagina. Voor een site van dit niveau hoort daar een overzichtspagina:

- de verduurzamingsroute (beperken → opwekken → slim gebruiken) als visuele volgorde,
- de 7 maatregelen als kaarten met foto en kernvraag,
- "waar begin ik?" met doorverwijzing naar de subsidiecheck,
- SEO-waarde: één sterke pagina die naar alle zeven linkt en die zeven terug.

**Besloten:** deze pagina komt er, als laatste stap. De nav-knop "Verduurzamen" gaat dan naar
`/verduurzamen` in plaats van naar de isolatiepagina, en de redirect naar de homepage vervalt.

---

## 4. Volgorde van werken

Elke stap is een eigen branch en PR, conform de projectregels.

| # | PR | Inhoud |
|---|---|---|
| 0 | fundament ✅ | sectiebibliotheek, datamodule, tokens, SEO-laag, conversielaag |
| 1 | isolatie | grootste pagina, zet de standaard voor de rest |
| 2 | warmtepomp | |
| 3 | zonnepanelen | |
| 4 | thuisbatterij | |
| 5 | airco | |
| 6 | laadpaal | |
| 7 | onderhoud | inclusief overzetten naar het fundament |
| 8 | hub `/verduurzamen` | inclusief nav-wijziging en vervallen redirect |

Na PR 1 bespreken we het resultaat voordat de rest volgt: als het patroon daar goed zit,
gaat de rest sneller en consistenter.

---

## 5. Nog open

1. **Beeldverzoeken** komen per pagina, op het moment dat een sectie er echt niet zonder kan.

---

## 6. Review PR 0 (fundament)

Branch `feat/verduurzamen-fundament`. Geen nieuwe copy geschreven: dit maakt zichtbaar wat
er al stond en zet de structuur klaar voor de pagina-PR's.

**Nieuw**
- `src/components/maatregel/`: `stijl.ts` (tokens), `primitieven.tsx` (Sectie, kop, kaart,
  Accent), `Blokken.tsx` (WatValtEronder, Aandachtspunten, Keurmerken, SubsidieBlok,
  InfoBlok, LinkKaart), `RouteStrip.tsx`, `Kruimelpad.tsx`, `jsonLd.ts`.
- `src/data/maatregelen.ts`: slugs, labels en de drie routestappen op één plek.
- `src/test/maatregelPagina.test.tsx`: 9 tests die bewaken dat de aangeleverde content ook
  echt wordt gerenderd. Dat was de oorspronkelijke fout en die gaf geen enkele melding.

**Gewijzigd**: `MaatregelPagina.tsx` van 5 naar maximaal 13 secties.

**Wat er nu zichtbaar is dat eerder werd weggegooid**: `watValtEronder`, `routeStep` +
`routeTekst` (als donkere routeband), `aandachtspunten`, `keurmerken`, `subsidiesIntro` +
`subsidiesItems`, `kostenFooter`, `extraInfo`, `onderhoud`, `combineren`, plus de zesde FAQ
die buiten de oude `slice(0, 5)` viel.

**Verder**: kruimelpad, FAQPage- en BreadcrumbList-JSON-LD, subsidiecheck-CTA halverwege,
hexcodes vervangen door design-tokens.

**Geverifieerd**: 208 tests groen (was 199), `tsc` schoon, build slaagt, lint 17 problemen
tegenover 18 op main (dus geen nieuwe). Visueel gecontroleerd op 1440px (isolatie,
warmtepomp) en 390px (thuisbatterij).

**Bewuste keuze**: "Wat valt hieronder" is compact gehouden (één kaart, twee kolommen). Als
volwaardige sectie herhaalde het op isolatie en warmtepomp bijna letterlijk de kostensectie.

**Let op bij de pagina-PR's**: als een pagina géén `aandachtspunten` én géén `keurmerken`
heeft, komen twee witte secties naast elkaar. Alle zes de pagina's hebben nu
aandachtspunten, dus het speelt nog niet.
