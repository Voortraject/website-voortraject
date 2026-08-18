# Toon op /verduurzamen: geen maatregel meer wegzetten als te duur (2026-08-18)

**Vraag van de opdrachtgever.** Op de maatregelpagina's staat op meerdere plekken waarom een
maatregel duur is. Dat demotiveert een bewoner, terwijl het in heel veel gevallen
situatiegebonden is. Weghalen, zonder dat de site onwaar wordt.

**Afspraken vooraf** (beide keuzes zijn expliciet bevestigd):

1. De met bron onderbouwde claims (thuisbatterij verdient zich niet terug, mobiele airco) blijven
   staan, maar de toon draait om: eerst waarvoor het nu al zinvol is, dan het oordeel over
   terugverdienen, met bron.
2. De rode "NIET"-kaart wordt neutraal in plaats van verdwijnen: de informatie is nuttig, het
   afkeurende signaal niet.

## Plan

- [x] Inventariseren waar de negatieve lading zit (visueel, woordkeus, claims)
- [x] Sjabloon: rode kaart neutraal, rode pil-toon weg
- [x] Copy: de circa vijftien zinnen op de zeven pagina's, in de eigen secties en in `src/data`
- [x] Test die de afraderswoordenlijst en de kleuren bewaakt
- [x] `bun run test`, `bun run lint`, `bun run build`

## Wat er is gewijzigd

**Sjabloon** (`src/components/MaatregelPagina.tsx`)

- De tweede kolom bij "Past dit bij jouw woning?" was rood (`#FEF7F7`, `#C0392B`,
  `border-red-100`) met kruisjes en de kop "Niet". Nu: `card-soft` met de gewone rand, een
  klok-icoon en de kop "Nu even niet". De inhoud van die kolom ging bijna altijd over volgorde
  ("isoleer dan eerst", "je verhuist binnenkort"), niet over afkeuring.
- `pillTone` gaf "Investering: Hoog" en "Terugverdientijd: Lang" de rode toon. Die toon bestaat
  niet meer: een hoge investering is een eigenschap van de woning, geen fout. De ongebruikte
  `bad`-kleur is uit `PILL_TONES` gehaald en het type is versmald naar `PillTone`.

**Copy** (van oordeel naar situatie, altijd met een vervolg)

| Waar | Van | Naar |
| --- | --- | --- |
| Isolatie, WTW | "ook de duurste optie" | "de meest complete vorm ... vraagt de grootste investering en geeft daarvoor de meeste warmte terug" |
| Isolatie, glas | "Hogere investering en langere terugverdientijd" | "Betaalt zich vooral uit in comfort ... hangt sterk af van je kozijnen" |
| Isolatie, dak | "Hogere investering, maar ..." | "Een grotere stap die zich snel terugbetaalt" |
| Isolatie, route | "werkt inefficiënt en duur" | "haalt zijn rendement pas in een goed geïsoleerde woning" |
| Isolatie, aandachtspunt | "niet bij de duurste" | "Wat die oplevert, maakt de volgende stap makkelijker" |
| Ventilatie-blok | "De duurste optie" | "Vraagt de grootste investering ... levert daarvoor de meeste warmte terug" |
| Airco, route | "als eerste stap is hij een dure pleister" | "dan laat je liggen wat zonwering en isolatie al voor je doen" |
| Airco, mobiel | "de duurste manier om te koelen" | "voor de lange termijn koelt een vaste split zuiniger" |
| Warmtepomp, route | "vallen de kosten tegen" | "elke isolatiestap zie je terug in zijn verbruik" |
| Thuisbatterij, route | "betaalt het meeste voor het minste resultaat" | "haalt een batterij er ook echt uit wat erin zit" |
| Gevelisolatie (data) | "ingrijpend en duur" | "de meest ingrijpende route ... vraagt een kleinere investering" |

**Thuisbatterij, de omgedraaide toon**

`OORDEEL.kop` was "Voor de meeste huishoudens: nog niet" en `OORDEEL.kern` opende met "zo duur
dat". De kop noemt nu waarvoor een batterij nu al zinvol is (noodstroom, dynamisch contract, een
vol net); de kern zegt nog steeds dat je hem op je stroomrekening hoogstwaarschijnlijk niet
terugverdient, met Milieu Centraal erbij als bron. De kolomkop "Wanneer de rekensom anders ligt"
is "Wanneer het nu al loont" geworden. Hero, SEO-tekst, de FAQ over terugverdienen en de
kernvraag op de hub volgen dezelfde volgorde.

## Bewaking

`src/test/maatregelToon.test.tsx` (9 tests):

- rendert alle zeven pagina's en faalt op een woordenlijst met prijsoordelen (`duurste`,
  `te duur`, `zo duur`, `is duur`, `dure`, `vallen de kosten tegen`, `het meeste voor het
  minste`). Gecontroleerd dat die tekst echt in de DOM staat: kostenbodies, FAQ-antwoorden en de
  eigen secties komen er allemaal in mee, dus de test is niet leeg.
- controleert op het kale sjabloon dat er geen rode tint meer in de HTML zit en dat de tweede
  kolom "Nu even niet" heet.

## Resultaat

`bun run test`: 50 bestanden, 365 tests groen. `bun run build`: succesvol. `bun run lint`: negen
fouten, alle negen al aanwezig op `main` en geen ervan in een gewijzigd bestand.

Wat bewust is blijven staan: de veiligheidswaarschuwingen (stekkerbatterij, laden op een
stopcontact), de milieu-afweging bij de batterij, "Micro-omvormers zijn duurder" (een
vergelijking tussen twee varianten, geen oordeel over de maatregel) en alle "nu even
niet"-situaties zelf.

## Vervolg (2026-08-18, na de eerste merge)

De pillen zelf waren nog niet klaar. "Investering: Hoog" en "Terugverdientijd: Lang" stonden er
nog steeds, alleen niet meer in het rood, en dat blijft een minpunt op een kaart die hoort te
vertellen wat een maatregel oplevert. Op verzoek van de opdrachtgever:

- HR++ of triple glas: pillen zijn nu "Comfortwinst: Hoog" en "Geluidsdemping: Hoog".
- Ventilatie met WTW: "Comfortwinst: Hoog", "Luchtkwaliteit: Hoog", "Warmteterugwinning: Hoog".
- Vloerisolatie: comfortwinst van "Gemiddeld" naar "Hoog", want koude voeten en tochtgevoel
  verdwijnen juist daar het duidelijkst. De tekst van de kaart zei dat al.
- `KostenDimension` heeft er drie dimensies bij (geluidsdemping, luchtkwaliteit,
  warmteterugwinning) met een toelichting waarom investering en terugverdientijd alleen als
  pluspunt op een kaart horen.

Wat een maatregel duurder maakt staat nog steeds in de tekst van de kaart, met de nuance erbij
(bij glas bijvoorbeeld dat de kozijnen de prijs bepalen). `maatregelToon.test.tsx` heeft er zeven
tests bij die de twee minpunt-pillen op alle zeven pagina's tegenhouden. Bewezen dat die test
bijt: de pilteksten staan in exact die vorm in de gerenderde DOM.

Nog een open puntje: spouwmuurisolatie staat op "Comfortwinst: Gemiddeld". Dat is geen minpunt,
maar als koude buitenmuren voor jullie net zo zwaar wegen als een koude vloer, kan die ook naar
"Hoog".
