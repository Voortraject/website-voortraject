# Todo

Planning & progress tracking for the Voortraject website. One section per task/change.

## Subsidietool: de check doorgeven, en het mailblok op orde (2026-08-09)

Vervolg op de sectie hieronder, zelfde dag. Vier opdrachten van de opdrachtgever.

- [x] **Slotzin weg.** "Veel regelingen blijven onbenut. Jij bent nu een stap verder dan de
      meeste woningeigenaren." De pagina eindigde met een compliment dat niets vroeg.
- [x] **Delen gaat over de tool, niet over dit overzicht.** De knop "Kopieer link naar dit
      overzicht" kopieerde `window.location.href`, mét postcode en huisnummer. Wie dat naar
      de buurman stuurde deelde zijn eigen adres, en de buurman keek naar het verkeerde huis.
      Nieuw blok `DeelDeCheck` op de plek van de slotzin: WhatsApp (contactkiezer, geen
      nummer van ons) en kopieer-link, allebei naar `voortraject.nl/subsidiecheck`.
- [x] **Meting aan twee kanten.** Verzendkant: nieuw event `subsidiecheck_deel` met `kanaal`.
      Ontvangkant: utm-tags in de gedeelde link. Zonder die tags is WhatsApp-verkeer
      onzichtbaar (geen referrer), en telt een doorgestuurde bezoeker als direct verkeer.
      Container bijgewerkt (variabele `dlv - kanaal`, trigger + tag 31).
- [x] **Mailblok "een vraag over dit overzicht"** opnieuw opgezet: knoppen met één woord
      plus icoon en `white-space:nowrap`, zodat ze op één regel passen. "op Google" is nu
      het Google-logo, met alt-tekst "Google" als terugval bij geblokkeerde afbeeldingen.
- [x] **Deelregel in de mail.** De mail is het enige deel van de check dat wordt bewaard en
      doorgestuurd; daar hoort een link in waarmee de ontvanger zijn eigen adres invult.

Na de eerste ronde nog drie correcties van de opdrachtgever:

- [x] **Eén WhatsApp-logo op de hele site.** De zwevende knop rechtsonder had het officiële
      merk-logo inline staan; de WhatsApp-knoppen in de check gebruikten een generiek
      tekstballonnetje. Dezelfde actie zag er dus op twee plekken anders uit. Nu één
      component `WhatsAppLogo`, gebruikt door de zwevende knop, "Vraag via WhatsApp" en de
      mobiele actiebalk (die op het resultaat de zwevende knop vervángt, dus daar hoort
      hetzelfde logo).
- [x] **"Deel via WhatsApp" eruit.** Eén knop is genoeg: de gekopieerde link werkt in élk
      kanaal, en de pagina heeft al twee WhatsApp-knoppen. Daarmee vervielen ook het
      voorgeschreven WhatsApp-bericht, het kanaal `whatsapp` in de utm-tags en de
      GTM-variabele `dlv - kanaal` — het event houdt alleen `bewonertype` over.
- [x] **Tekst korter, en familie erbij.** De uitleg over bouwjaren en gratis checken eronder
      is geschrapt; wie de link doorstuurt weet zelf wel waarom.
- [x] **En daarna nog compacter, plus een andere toon.** Vier regels onder elkaar (kop,
      regel, knop, privacyregel) is te veel gewicht voor een terzijde: het woog zwaarder dan
      het adviesblok erboven. Tekst en knop staan nu naast elkaar, op mobiel onder elkaar, en
      het zijn er twee. De kop was "Ken je iemand die dit ook moet doen?" — niemand moet
      iets. Het is een tip die de ander geld kan schelen, dus wie hem doorgeeft bewijst een
      dienst, en dát is ook precies waarom mensen zoiets doorsturen. Nu: "Ken je buren of
      familie die hier wat aan hebben?"
- [x] **Laatste ronde:** de regel "Je deelt voortraject.nl/subsidiecheck, niet jouw gegevens"
      eruit, en de knop heet "Deel de tool". Wat overblijft is één vraag met één knop.
      `deelDeCheck.test.tsx` bewaakt sindsdien wat die knop op het klembord zet: de kale
      check, zonder `pc`, `hn`, `tv`, `str` of `pl`. Die garantie stond eerst alleen in de
      copy die nu weg is.

### De poort dicht, structureel (opdracht: "nooit iemand zonder gegevens bij het resultaat")

Aanleiding: de opdrachtgever kwam in een incognitovenster zonder gegevens bij het resultaat.
Oorzaak was niet de code op `main` maar de dev-server: `SUBSIDIECHECK_GEGEVENS_POORT` stond
lokaal even op `false` om te kunnen screenshotten. Zie `tasks/lessons.md`. De opdracht daarna
was breder: zorg dat dit niet kán. Twee dingen weggehaald die het mogelijk maakten.

- [x] **De schakelaar is weg.** `SUBSIDIECHECK_GEGEVENS_POORT` bestaat niet meer; de poort is
      geen tussenoplossing maar hoe de check werkt. Er is dus geen stand van de code waarin
      het overzicht zonder gegevens verschijnt. Daarmee vervielen ook de tweestapsflow, het
      blok "Ontvang dit overzicht in je mail" (`MailOverzicht`, verwijderd), de knop "Mail mij
      dit overzicht" in de samenvatting en de props `verbergMail` / `alGezocht`.
- [x] **De ontsnappingssleutel is weg.** De poort ging open bij
      `sessionStorage.sc_poort_ontgrendeld === "1"`: één regel in de console van elke browser.
      Nu telt alleen het bewaarde contact zelf (`sc_contact`, met een geldig e-mailadres én een
      voornaam — zie `contactOpslag`). Wie dat wil nabootsen vult die gegevens alsnog in.
- [x] `src/test/poortDicht.test.tsx` legt het vast: gedeelde link toont de gegevensstap, de
      oude vlag doet niets, halve of onzinnige gegevens tellen niet, en een compleet contact
      mag door.
- [x] Meting: het veld `poort` op `subsidiecheck_stap` is vervallen (stond in elke rij op 1).
      Variabele `dlv - poort` en de tagparameter zijn uit de container gehaald.

**Wat dit niet is.** Een bezoeker die zelf een `sc_contact` in de opslag zet, komt er nog
steeds door: het overzicht wordt client-side opgebouwd uit een publieke bron. Echt afdwingen
vraagt een server-side sleutel op de regelingen-endpoint. Wat hier verdwenen is, is de
onbedoelde route: een verkeerd gezette vlag, en een sleutel die letterlijk "1" was.

**Gemeten in een headless Chrome, met Arial (het lettertype dat mailclients pakken als Inter
ontbreekt — de ongunstigste variant):** de twee knoppen staan op één regel bij een
mailbreedte van 320 t/m 430px, en houden ~48px over binnen het blok. Ter vergelijking: de
oude knoppen braken op 390px allebei over twee tot drie regels.

**Reviews in de mail zijn niet statisch.** `haalBeoordeling()` leest `google_place_stats` bij
élke verzending, en die tabel wordt dagelijks om 06:00 UTC ververst door de cron op
`sync-google-reviews`. Nagekeken op 2026-08-09: `synced_at` stond op die dag 06:00:01Z,
rating 4,9 bij 14 reviews. Staat er geen rij, dan valt de hele bewijsregel weg — liever geen
cijfer dan een oud cijfer.

**Iconen staan in `public/mail/`,** niet in de storage-bucket waar het logo staat. Zo horen
ze bij de code die ze gebruikt en gaan ze mee in dezelfde PR. Gevolg: **deploy de site vóór
de edge function**, anders wijst de mail even naar een plaatje dat nog niet bestaat (de
alt-tekst vangt dat op). Ze zijn gerenderd op 96px voor schermen met hoge pixeldichtheid en
worden op 14-16px getoond.

## Subsidietool: rustiger op de telefoon, eerlijker subregel, andere CTA (2026-08-09)

Zes losse opmerkingen van de opdrachtgever, na het doorlopen van de check op een telefoon.

- [x] **Stap 1, onder de knop rustiger op mobiel.** Daar stonden vier regels tekst onder
      "Zoek mijn subsidies": de aankondiging van de gegevensvraag (twee regels), de drie
      beloftes, en de Google-score. De bijzin van de aankondiging vervalt op mobiel
      ("Daarna vragen we kort je gegevens." — één regel) en de score staat nu vanaf `sm`.
      Twee regels in plaats van vier. Het bewijs is niet weg: op stap 2 staat het pal naast
      de velden, precies op het moment van de twijfel.
- [x] **Subregel klopte niet.** "…als startpunt voor je verduurzaming" veronderstelt dat de
      bewoner nog moet beginnen, terwijl een deel al van alles heeft gedaan. Nu: "Alle
      regelingen die bij jouw adres passen." Kort genoeg om ook op een telefoon op één
      regel te passen, dus `subVerbergMobiel` kon eruit — die vlag bestond alleen voor deze
      ene regel.
- [x] **"We hebben jouw woning gevonden" weg** (stap 2). Stond tussen "We vonden 10
      regelingen voor …" en het adres met foto en bouwjaar: drie keer hetzelfde.
- [x] **Kop van stap 2 naar "voor jouw woning"** in plaats van het adres. Het exacte adres
      staat een handbreedte lager al in het kaartje.
- [x] **Sterretjes bij de velden weg.** Alles is verplicht, dus onderscheiden ze niets. In
      alle drie de formulieren van de check (poort, vraagblok, mail-mij-overzicht), anders
      staat er op de ene plek wel een sterretje en op de andere niet. Voor screenreaders
      verandert er niets: de `sr-only`-labels zeggen nog steeds "(verplicht)" en
      `aria-required` blijft staan.
- [x] **CTA "Ik heb een vraag" → "Ik wil gratis advies".** De oude tekst vraagt de bezoeker
      om zelf al een vraag te hebben; op dat punt heeft hij vooral een lijst gezien waar hij
      nog geen weg in weet. De kop van het blok waar de knop heen springt werd mee
      aangepast ("Gratis advies over jouw overzicht"), anders belooft de knop iets anders
      dan wat de bezoeker aantreft.
- [x] **De bouwjaarzin ook in de overzichtsmail.** Dezelfde tekst als "de eerste stap" op
      het resultaat, direct onder het samenvattingskaartje. Het bouwjaar zat al in de
      payload (het gaat als verrijking mee naar de lead), dus er hoefde niets extra's
      opgehaald te worden.

**Meting (Chrome, Manrope):** de nieuwe subregel en de ingekorte aankondiging passen allebei
op één regel bij een schermbreedte van 320, 360 en 390px.

**Gedupliceerde tekst, en hoe die niet wegloopt.** De edge function draait op Deno en kan
niets uit `src/` importeren, dus staat de bouwjaartekst daar een tweede keer. Dat is precies
het soort duplicaat dat stilletjes uit elkaar groeit: de bewoner leest dan op de site iets
anders dan in zijn mail, over hetzelfde huis. `src/test/eersteStap.test.ts` vergelijkt daarom
de zinnen uit `eersteStapTekst.ts` letterlijk met de inhoud van de edge function.

**Nog te doen:** `subsidiecheck-mail` handmatig deployen (Supabase-dashboard, CRM-project
`lfelnfukbrxznkevnevr`). Tot dat moment staat de bouwjaarzin wel op de site maar nog niet in
de mail.

## Subsidietool: adviseursblok, gebouwtype en de persoonlijke eerste stap (2026-08-09)

Vervolg op het traject van 2026-08-08 (PR's #106 t/m #111, allemaal gemerged). Vier opdrachten:
adviseursblok inkorten, gebouwtype uit EP-Online meenemen, een persoonlijke eerste stap op het
resultaat, en onderzoek naar best practice.

Stand: **alles gemerged** (#112, #113, #114, #115) en de edge function is gedeployed. Wat er nog
openstaat, staat onderaan deze sectie.

### PR 1 — Poort: minder ruis, andere geruststelling, rustiger aankomst (#112)

- [x] Subregel boven het formulier weg (zei wat de titel en de legenda al zeggen)
- [x] "Meerdere antwoorden mogelijk" weg; blijft in het `aria-label`, want een screenreader kan het
      niet aan de vorm zien
- [x] Adviseurszin naar "Hij of een collega denkt gratis en vrijblijvend met je mee"
- [x] "Je gegevens blijven bij ons" vooraan de privacyregel
- [x] Zoeksequentie naar 3s (3 × 1000ms)
- [x] De overgang van poort naar resultaat

**Over de adviseurszin.** Eerst stond er "belt je voor gratis en vrijblijvend advies". Die noemde
wél gratis en vrijblijvend, maar kondigde nog steeds een telefoontje aan, en niet iedereen wil dat.
"Denkt met je mee" zegt hetzelfde zonder de bezoeker een gesprek in te duwen dat hij nog niet
gevraagd heeft.

Meting op 390px, voor en na alle tekstingrepen:

| | voor | na |
|---|---|---|
| hoogte formulier | 1132px | 1108px |
| telefoonveld → verzendknop | 384px | 360px |
| hoogte adviseursblok | 114px | 114px |

Het adviseursblok blijft even hoog: elke variant van de zin breekt bij 390px op drie regels, want de
foto van 44px plus marges laat maar ~270px tekstbreedte over. Wie het blok écht lichter wil, moet
onder de ~85 tekens komen of de foto kleiner maken.

**Variant B, gebouwd en gemeten maar niet ingediend:** hetzelfde blok ná de hulpvraag en pal boven
de verzendknop. Formulierhoogte identiek, alleen de volgorde verschilt. Variant A (huidig) zet het
bewijs pal onder het telefoonveld dat de twijfel veroorzaakt; in B leest de bezoeker "we denken met
je mee" pas ná het invullen, en dat ondermijnt de reden dat het blok er staat. Gekozen: A.

**Over de overgang naar het resultaat.** Twee rondes nodig. De eerste maakte de wissel netter (fade
van 12px/0,6s naar 6px/0,42s, uitloop van het formulier, geen feestpill meer) maar niet trager, en
het bleef als een knip lezen. De oorzaak zat niet in de animatie: het échte wachtmoment was
onzichtbaar. Bij het verzenden gaat de lead naar het team en vertrekt de mail, maar dat zat weggestopt
in een spinner van 16px in de knop, duurde soms 200ms, en daarna verscheen het hele resultaat in één
keer. Nu:

- de knop zegt wat er gebeurt ("Je overzicht wordt klaargezet…") in plaats van wat de bezoeker deed;
- alles wat de bezoeker net invulde zakt naar 45%, de knop blijft juist op volle sterkte (zijn
  `disabled:opacity-70` is eruit: een vervaagde knop met de enige tekst op het scherm leest als
  "er ging iets mis");
- ondergrens van 750ms op dat moment, zodat het niet opflitst als de calls snel zijn. Dat verlengt
  geen verzonnen werk, het geeft echt werk de tijd om als stap gelezen te worden;
- uitloop van het formulier 340ms, daarna bouwt het resultaat zich op in drie stappen (0 / 120 /
  260ms). De kaarten binnen een groep doen bij de aankomst niet meer hun eigen trapje: twee geneste
  animaties over elkaar maken de opbouw troebel. Bij een herlaad blijft dat trapje wel staan.

Samen ongeveer anderhalve seconde, met onderweg de smooth scroll terug naar de kop die er al was.
Bewegingsreductie slaat alles over.

### PR 2 — Gebouwtype en gebouwklasse uit EP-Online (#113)

- [x] `normaliseerGebouw()` naast `normaliseerEpOnline()`, met een eigen rijselectie
- [x] `WoningInfo.gebouw` aan beide kanten van de brug (edge function + `src/lib/woninginfo`)
- [x] 5 unittests; 163 tests groen (was 158)
- [x] **Edge function gedeployed op het CRM-project `lfelnfukbrxznkevnevr`** (2026-08-09, handmatig)
- [x] Ná de deploy: de echte waarden uitgelezen

Bevestigd in het schema `PandEnergielabelV5` (public.ep-online.nl/swagger/v5/swagger.json): de
velden `Gebouwklasse` ("Het soort gebouw: een woning of een utiliteitsgebouw"), `Gebouwtype` ("Het
woningtype") en `Gebouwsubtype` ("de ligging van het appartement in het woongebouw") bestaan alle
drie, als string, **zonder enum**. De waarden gaan daarom ruw door, alleen getrimd: een eigen
vertaallijst zou gokwerk zijn dat stil de verkeerde kant op valt.

Zolang het veld leeg is verandert er zichtbaar niets, en er is nog geen consument in de UI.

#### Wat de bron werkelijk teruggeeft (9766PJ 15, live na de deploy)

```json
"gebouw": {
  "type": "Twee-onder-een-kap / rijwoning hoek",
  "klasse": "Woningbouw",
  "subtype": "Twee-onder-een-kap"
}
```

Drie dingen die je hier niet uit de swagger had kunnen halen, en die de keuze om niet te vertalen
achteraf bevestigen:

1. **`Gebouwtype` is geen enkelvoudig type maar een samengesteld label met een schuine streep.**
   "Twee-onder-een-kap / rijwoning hoek" is één waarde, niet twee. Een naïeve mapping op
   `type === "Rijwoning"` had hier dus niets herkend, en een `includes("rijwoning")` zou een
   twee-onder-een-kap als rijwoning classificeren. Wie hierop wil filteren, moet eerst een reeks
   adressen verzamelen en de échte lijst opbouwen.
2. **`Gebouwsubtype` doet bij dit adres iets anders dan de swagger beweert.** Daar staat "de ligging
   van het appartement in het woongebouw", maar bij dit eengezinshuis staat er
   `"Twee-onder-een-kap"`: het veld kiest één kant van de schuine streep in `Gebouwtype`.
3. **`Gebouwklasse` is `"Woningbouw"`,** voluit, niet een code als `W` of `Woning`.

#### De waardenlijst, uit 203 adressen (2026-08-09)

Verzameld door adressen uit 21 postcodes in Groningen en Drenthe langs de function te halen; 110
daarvan hebben een geregistreerd label en dus gebouwgegevens.

**`Gebouwklasse`** — twee waarden: `Woningbouw` (95) en `Utiliteitsbouw` (15).

**`Gebouwtype`** — bij utiliteitsbouw altijd leeg. Bij woningbouw negen waarden:

| aantal | waarde |
|---|---|
| 28 | `Appartement` |
| 24 | `Flatwoning (overig)` |
| 13 | `Twee-onder-een-kap / rijwoning hoek` |
| 11 | `Vrijstaande woning` |
| 8 | `Rijwoning tussen` |
| 4 | `Woonwagen` |
| 3 | `Maisonnette` |
| 3 | `Twee-onder-één-kap` |
| 1 | `Rijwoning hoek` |

**`Gebouwsubtype`** — leeg bij grondgebonden woningen, gevuld bij gestapelde bouw:
`Tussenmidden` (20), `Hoekdak` (10), `Hoekmidden` (10), `Tussendak` (10), `Tussendakvloer` (2),
`Hoekvloer` (2), `Hoekdakvloer` (1). Plus 13× `Twee-onder-een-kap`, uitsluitend bij het
samengestelde type hierboven.

Drie dingen om te onthouden voordat er ooit logica op komt:

- **Er zijn twee spellingen van hetzelfde woningtype.** `Twee-onder-een-kap / rijwoning hoek` (13×,
  mét subtype) naast `Twee-onder-één-kap` (3×, zonder subtype, met een é). Dezelfde woning, twee
  registratiewijzen. Elke vergelijking op tekst moet allebei kennen, of normaliseren op accenten.
- **`Gebouwsubtype` heeft twee betekenissen.** Bij `Appartement`, `Flatwoning (overig)` en
  `Maisonnette` is het de positie in het gebouw (hoek/tussen × dak/vloer/midden), precies zoals de
  swagger zegt. Alleen bij het samengestelde type is het een disambiguatie. De eerdere conclusie
  hierboven dat subtype "waarschijnlijk het bruikbaardere veld" is, klopte dus niet: het is
  aanvullend, niet vervangend.
- **`Rijwoning hoek` bestaat als losse waarde én verstopt in het samengestelde type.** Wie hoekhuizen
  wil tellen, mist er dus dertien als hij alleen op de losse waarde kijkt.

Nog onbekend: of er buiten Groningen en Drenthe andere waarden voorkomen, en wat er staat bij
woonboten en monumenten.

### Feiten voor de persoonlijke eerste stap (geverifieerd bij Milieu Centraal)

Voorwaarde die de opdrachtgever stelde: nooit een uitspraak over dít huis (we weten niet wat er al
gedaan is), wél over de woningvoorraad, eindigend in een vraag. Onderstaande citaten komen
letterlijk van milieucentraal.nl (opgehaald 2026-08-09, pagina's laatst gewijzigd 8 juli 2026).

**Spouwmuur** (`/energie-besparen/isoleren-en-besparen/spouwmuurisolatie/`):
- "Ongeveer 1 van de 4 woningen heeft nog géén geïsoleerde buitenmuren."
- vóór 1920: "Dan heeft het waarschijnlijk geen spouwmuur."
- na 1920: "Dan is de kans groot dat het bij de bouw buitenmuren met een spouw heeft gekregen."
- 1920 tot 1975: "Grote kans dat het bij de bouw buitenmuren met een spouw heeft gekregen, maar nog
  zonder isolatie. De spouwmuur kan wel na-geïsoleerd zijn."
- 1975 tot 1991: "In deze periode werden buitenmuren bijna altijd geïsoleerd, meestal in de spouw.
  Maar de isolatiewaarde van deze huizen kan beter."
- na 1991: "Dan heeft het al goede gevelisolatie (Rc van 2,5 of hoger) en dat hoef je niet verder
  te verbeteren."

**Dak** (`/energie-besparen/isoleren-en-besparen/dakisolatie/`):
- "Meer dan 85% van de woningen heeft al een isolatielaag. Vaak is dat een dunne laag met een
  matige isolatiewaarde." En: "Veel mensen denken 'mijn dak is al geïsoleerd, dus ik hoef niks meer
  te doen', maar het tegendeel is vaak waar."
- vóór 1975: "Bij de bouw is geen isolatie aangebracht."
- 1975 tot 1992: "waarschijnlijk een matige isolatielaag van 3 tot 5 centimeter"
- 1992 of later: "redelijke tot goede isolatie meegekregen (8 tot 10 centimeter of meer)"

Twee dingen vallen op en die sturen de tekst:
1. **Milieu Centraal schrijft zelf al in kansen** ("grote kans", "waarschijnlijk", "bijna altijd").
   Dat is precies de vorm die we nodig hebben: een uitspraak over de voorraad, niet over dit huis.
2. **De dak-zin is de sterkste**, want die werkt óók als het dak al geïsoleerd is. "85% heeft al
   een laag, meestal te dun" is geen gok over deze woning maar een feit over alle woningen, en het
   raakt precies de reden waarom mensen niets doen.

Grenzen die hieruit volgen: **1920 / 1975 / 1992**. Niet zelf verzonnen, maar de indeling die
Milieu Centraal zelf hanteert.

### PR 3 — De persoonlijke eerste stap (#115, gestapeld op #112)

- [x] Conceptteksten goedgekeurd door de opdrachtgever
- [x] `eersteStapTekst.ts` (pure logica) + `EersteStap.tsx`, onder de conclusie en boven de lijst
- [x] 9 tests; 171 tests groen. Twee daarvan bewaken de inhoudelijke regels: geen bewering over
      "jouw huis/woning/muren/dak" na de openingszin, en geen maatregel bij naam
- [x] Drie varianten live nagelopen (1935, 2007, huurder), inclusief de klik die het vraagveld vult
- [x] Meting via het bestaande `subsidiecheck_vraag_cta` met `plek: eerste_stap`, dus **zonder**
      wijziging in de GTM-container
- [ ] Beslissen: op mobiel staat het blok pal onder de navy knop "Ik heb een vraag", die naar
      dezelfde plek gaat. Blok naar boven verplaatsen, generieke knop weg, of laten staan?

**Waarom de eerdere twee opzetten sneuvelden.** Versie A hing aan de spouwmuur, versie B aan het
dak. Allebei kozen ze één maatregel en dus één verhaal, terwijl we niet weten welke maatregel voor
deze woning speelt. Wat bouwjaar maatregelonafhankelijk vertelt is **wat er bij de bouw in ging**,
en dat dekt muren, dak, vloer en glas tegelijk.

De zin "Wat er daarna is gedaan verschilt per woning" doet het eigenlijke werk: die zegt hardop dat
we het niet weten, en precies daarom is de vraag erna een logisch vervolg in plaats van een
verkooptruc.

**Bijvangst:** de BAG-geometrie is hiervoor niet meer nodig. Het woningtype voegde aan dit verhaal
niets toe, dus het hele stuk waarin uit de buurpanden afgeleid moest worden of het een rijwoning is,
met alle kans op fouten, vervalt. Dat was het risicovolste deel van het oorspronkelijke plan.

**Grenzen:** 1975 en 1992. De dak- en spouwmuurpagina van Milieu Centraal leggen hun bovengrens net
anders (1991 vs 1992); we houden 1992 aan, de conservatieve kant. Een woning uit 1991 valt dan in de
"dunne laag"-groep, en dat is bij twijfel de uitspraak die niemand tekortdoet.

### PR 4 — Toestemming voor telefonisch opvolgen (#117)

Sinds 1 juli 2021 mag telemarketing richting consumenten alleen met toestemming vooraf (art. 11.7
lid 2 Telecommunicatiewet; het bel-me-niet-register verviel toen). De ACM verlangt dat je die per
persoon kunt aantónen. Een telefoonnummer in een formulier is op zichzelf geen toestemming: er moet
staan waar de bezoeker ja tegen zegt, op het moment dat hij het zegt.

- [x] Eén regel onder de verzendknop: "Je gegevens blijven bij ons. Door te versturen mogen wij je
      mailen of bellen over jouw verduurzaming."
- [x] Het bewijs gaat mee de lead in: moment plus de letterlijke tekst die op dat scherm stond
- [x] Eén bron voor beide (`toestemming.ts`), zodat er nooit licht zit tussen wat de bezoeker las en
      wat wij bewaren, ook niet als de copy later verandert
- [x] Test die dat verband bewaakt, ook op het noodpad bij een bronfout

**Bewust géén aanvinkvakje.** Dat is juridisch het sterkst, maar het is een extra handeling vlak
voor de knop, en bij 11 leads per week is dat een dure ingreep die we niet kunnen meten. Dit is het
zwaarste dat zonder extra handeling kan: de tekst staat pal bij de knop, is specifiek over kanaal en
onderwerp, en het versturen zelf is de actieve handeling. Wil je het waterdicht, dan is het vakje de
volgende stap; dat is een keuze tussen bewijskracht en leadvolume.

### Nog open, vraagt een beslissing van de opdrachtgever

- ~~**Huurder-tak.**~~ **Beantwoord (2026-08-09):** Voortraject kan ook voor huurders altijd kijken
  wat er mogelijk is. Verwerkt in de eerste stap (#115): huurders krijgen dezelfde uitspraak over de
  woningvoorraad, maar de slotvraag wordt "wat er in jouw situatie mogelijk is". Het onderliggende
  probleem blijft wel staan: 1 regeling in Groningen is een mager resultaat op zichzelf.
- ~~**De waardenlijst van `Gebouwtype` / `Gebouwsubtype`.**~~ **Gedaan (2026-08-09):** uit 203
  adressen, zie hierboven.
- ~~**Een eigen kolom voor de toestemming in het CRM.**~~ **Akkoord (2026-08-10), zit in #117.**
  Migratie `20260810000000_leads_bewoners_toestemming.sql` staat klaar. Uitvoeren vraagt twee
  handelingen van de opdrachtgever, in deze volgorde:
  1. de migratie draaien op het CRM-project `lfelnfukbrxznkevnevr`;
  2. de edge function opnieuw uitrollen:
     `bunx supabase functions deploy subsidiecheck-mail --project-ref lfelnfukbrxznkevnevr`
     (vanuit de repo-root, zodat `config.toml` `verify_jwt = false` meegeeft).

  Volgorde maakt niet uit voor de werking, alleen voor wanneer de kolommen vullen. Gebeurt geen van
  beide, dan blijft alles werken: de insert valt terug op de basisvelden en het bewijs staat dan nog
  steeds als regel in `notities`.
- **GTM-event `subsidiecheck_verbreed`** bij het verbreden na 0 regelingen. Kan pas als de
  container in `docs/gtm/` weer stabiel is, want `gtmContainer.test.ts` eist trigger én tag.

## Subsidietool: eerlijker, geen doodlopende einden, andere volgorde (2026-08-08)

Aanleiding: analyse van de hele tool op conversie en waarde. Wat de analyse als eerste opleverde
was geen conversietruc maar een reeks beweringen die niet klopten, plus twee schermen waar de
bezoeker letterlijk vastliep. Die gaan voor.

**Meetkanttekening vooraf, en die stuurt alles.** De nulmeting is 11 leads in de week van 3
augustus. Bij dat volume is A/B-testen wiskundig onmogelijk: een verbetering van 20% aantonen
vraagt duizenden bezoekers per variant. Elke wijziging hieronder is daarom gekozen omdat ze op
zichzelf verdedigbaar is (waar, minder drempel, betere volgorde), niet omdat een test het zegt.
Reken ook niet op grote losse effecten; bij Microsoft is ruwweg een derde van goed opgezette
experimenten positief.

**Geverifieerd tegen de live bron** (edge function `subsidiecheck`, 2026-08-08), niet aangenomen:
- 9711AB Groningen, woningeigenaar: 10 regelingen. 7811AB Emmen: 12. 1012AB Amsterdam: 9.
- Alleen "Thuisbatterij" aanvinken: **0 regelingen**, op elk getest adres.
- "Huurder" in Groningen: **1 regeling**. Alleen "Zonnepanelen": 7, waarvan geen enkele een
  zonnepanelensubsidie (allemaal leningen).
- De bron levert **geen** einddatums of budgetuitputting, en **geen** maatregelen per regeling.
  `voorWie` komt bij geen enkele regeling meer terug; die sectie bestaat niet meer op de
  detailpagina's van Verbeterjehuis.

### PR 1 — Alleen claims die we kunnen waarmaken (`fix/subsidiecheck-eerlijke-claims`)
- [x] Maatregelregel van de kaart. De parser vult `maatregelen` met alle acht, dus elke kaart
      toonde "Voor vrijwel alle maatregelen", ook een isolatiesubsidie voor Emmen.
- [x] "Geen account nodig" → "Vrijblijvend", "Klaar in 1 minuut" → "Klaar in 2 minuten", in
      `src/config/beloftes.ts` (stond dubbel en liep uit elkaar). Stap 1 kondigt nu aan dat de
      gegevens nog komen.
- [x] De combineer-belofte stond op elke kaart; staat nu één keer op het resultaat, met een
      verwijzing naar `/subsidies/stapelen`.
- [x] Tweede deelknop weg: twee knoppen naast elkaar die allebei "Link gekopieerd" tonen.
- [x] `MailOverzicht` NIET verwijderd. Bij nader inzien geen dode code maar flag-gestuurde,
      geteste code (vijf testbestanden), en de enige mailroute als de poort ooit uit gaat.

### PR 2 — Geen doodlopende einden (`feat/subsidiecheck-geen-doodlopend-eind`)
- [x] `GeenRegelingen.tsx`: bij nul resultaten ná eigen filtering halen we de verbrede uitkomst op
      en noemen het getal ("dan zijn er wél 12"), met één knop die de `m`-parameter weghaalt. Ook
      breder niets → geen loze knop.
- [x] "Label aanvragen" linkte naar `/contact` met een leeg formulier. Springt nu naar het
      vraagblok mét de aanvraag ingevuld.
- [ ] **Bewust niet gedaan:** eigen GTM-event voor het verbreden. `gtmContainer.test.ts` eist een
      trigger én tag in `docs/gtm/`, en die container werd op dat moment elders herzien. Toevoegen
      zodra dat werk klaar is: `subsidiecheck_verbreed` met `aantal_regelingen`.
- [ ] **Openstaand, vraag aan de opdrachtgever:** de huurder-tak (1 regeling in Groningen). Een
      goede tekst daarvoor doet een uitspraak over wat Voortraject voor huurders doet; die wil ik
      bevestigd hebben voor hij live gaat.

### PR 3 — Eerst zoeken en tellen, dan pas vragen (`feat/subsidiecheck-zoeken-voor-vragen`)
- [x] Zoeksequentie van het resultaat naar de poort (`Zoeksequentie.tsx`). Hij stond áchter de
      gegevensvraag, op een antwoord dat toen al in de cache stond.
- [x] "We vonden 12 regelingen voor Hoofdstraat 34" boven het bestaande woningkaartje. Alleen het
      aantal, geen titels of bedragen.
- [x] Randgevallen: bronfout, hangende bron (8s-grens), nul regelingen, en de telling wordt
      bevroren zodra het formulier verschijnt.
- [x] `prefers-reduced-motion` staat aan in de testomgeving, anders wacht elke test ruim drie
      seconden op echte timers.

### PR 4 — Bewijs op het punt van twijfel (`feat/subsidiecheck-bewijs-bij-de-vraag`)
Op basis van onderzoek naar bewijs bij formulieren. De uitkomst weersprak deels het eigen plan:
een volledige reviewkaart op de poort is **niet** aan te raden.
- [x] De Google-score staat niet meer onder de verzendknop maar bij de contactvelden. Baymard:
      mensen ervaren alleen díe delen van een pagina als veilig waar het signaal staat.
- [x] Score is daar **niet klikbaar**. Een `target="_blank"`-link vlak bij een verzendknop is een
      uitgang op het beslismoment.
- [x] "Geen nieuwsbrief, alleen jouw overzicht" weg. Die zin noemt het gevreesde ding; vier
      experimenten in JCR laten zien dat een privacygarantie zorgen wekt die anders sluimerend
      waren gebleven. Nu een positieve doelomschrijving, wat de AVG hier toch al vraagt.
- [x] Een gezicht: Tim (bewonersadviseur), met de eerlijke mededeling dat hij of een
      collega contact opneemt. Dat is meteen de transparantie die het verplichte telefoonnummer
      nodig heeft. Nieuwe asset `adviseur-tim.webp` (2,9 KB; het origineel is 1,7 MB).
      Stond eerst op Christian (subsidiespecialist); op verzoek gewisseld naar Tim, en
      daarmee ook de functie mee, want Tim staat op Over ons als bewonersadviseur.
- [x] Integratietest voor de labelaanvraag uit PR 2 (die leunt op de testopzet uit PR 3).
- [ ] **Niet gedaan, wacht op akkoord:** de "persoonlijke eerste stap". Zie hieronder.

### Openstaand: de persoonlijke eerste stap waterdicht maken
De opdrachtgever wil dit, maar terecht alleen als het klopt: veel woningen hebben geen
geregistreerd energielabel, en een label van 3+ jaar oud zegt weinig. Voorstel is om het niet op
het label te bouwen maar op **bouwjaar** (BAG, altijd aanwezig, veroudert niet), het label alleen
te gebruiken als het er is én recent, en nooit een uitspraak te doen over dít huis maar over de
woningvoorraad, eindigend in een vraag. Vraagt eerst akkoord, want het zijn feitelijke uitspraken
op een publieke site.

### Juridisch: het telefoonnummer
Aparte, urgentere kwestie. De poort vraagt een verplicht telefoonnummer onder de kop "Waar mogen we
je overzicht naartoe sturen?", zonder belvraag. Artikel 11.7 lid 2 Telecommunicatiewet vraagt per
persoon aantoonbare toestemming of een eigen verzoek; de ACM verwerpt een procesbeschrijving of
bellijst uitdrukkelijk als bewijs. PR 4 maakt nu expliciet dat er contact wordt opgenomen, wat de
transparantie flink verbetert, maar het is geen vastgelegde toestemming per lead. Zie het gesprek
met de opdrachtgever: nummer blijft verplicht (zijn keuze, team volgt telefonisch op), maar
toestemming vastleggen is nog te doen.

## Google-tags opschonen + indexering op orde (2026-08-08)

Aanleiding: de meting is deels verouderd (de site is veranderd, de GTM-container niet) en voor de
subsidietool komt er nauwelijks iets aan in GA4. Daarnaast moeten alle pagina's nog geïndexeerd.

Audit van de container (export v1 t/m v5 + workspace 6, GA4 `G-VQL43876VN`). Draft = v5, dus er
staat niets ongepubliceerd klaar. Bevindingen:

1. **Nav-trigger verouderd.** Regex 11 zoekt op `voor uitvoerders|voor bewoners|maatregelen|…`;
   die drie labels bestaan niet meer (`/uitvoerders` en `/partners` → `/zakelijk`, `/maatregelen`
   → `/`). Van de 17 nav-items in `Header.tsx` matchen er nog 6. Gemist: Verduurzamen, Zakelijk,
   Contact, Subsidiecheck en de hele Verduurzamen-dropdown (7 maatregelpagina's).
2. **`klik_uitvoerder` / `klik_bewoner` zijn dood.** Geen van beide woorden staat nog in header of
   footer. Het zijn "alle elementen"-klik-triggers, dus ze vuren nu op lopende tekst (Privacy
   bevat "uitvoerder" 9×). Meten ruis, niet gedrag.
3. **Consent-risico.** GA4-config vuurt op trigger `2147479573` (Consent Initialization, door
   Google gereserveerd voor de CMP zelf). De Consent Mode-default wordt in `index.html` pas ná het
   GTM-snippet gezet, via de async Axeptio-SDK. Een nog niet gezet signaal geldt als *granted*, dus
   er is een venster waarin GA4 cookies kan zetten vóór toestemming.
4. **Alle event-parameters gaan verloren.** Nul zelfgedefinieerde variabelen in de container,
   terwijl de code gemeente, provincie, bewonertype, aantal_regelingen, hulpvraag, bron_fout, plek,
   wil_gebeld en bekend_contact meestuurt.
5. **5 van de 7 dataLayer-events hebben geen trigger** (`subsidiecheck_start`, `_vraag`,
   `_vraag_cta`, `_whatsapp`, `zakelijk_lead`). Funnel dus niet te maken terwijl de data er is.
6. Geen page_view bij routewissels (SPA); scroll-trigger staat op `WINDOW_LOAD` en is na de eerste
   navigatie onbetrouwbaar.

Afgestemd met de opdrachtgever (2026-08-08):
- GTM-kant als **importeerbare container-JSON** (nieuwe workspace, merge/overwrite, zelf publiceren
  na Preview; v5 blijft rollback).
- Eventnamen: **behouden wat leeft**, alleen `klik_uitvoerder` en `klik_bewoner` eruit. Nieuwe
  events krijgen een consistente naam. Historische GA4-data blijft zo vergelijkbaar.

### PR 1 — SEO-basis (#99, gemerged)
- [x] `Sitemap:`-regel in `public/robots.txt`
- [x] `/subsidies/stapelen`, `/privacy`, `/cookieverklaring` in de sitemap (route bestaat, ontbrak)
- [x] `lastmod` per pagina (uit git-historie), `changefreq`/`priority` eruit (Google negeert die)

### PR 2 — Tracking-fundament (#100, gemerged)
- [x] Consent-default inline bovenaan `<head>`, vóór het GTM-snippet
- [x] `RouteTracker`: `virtual_page_view` bij routewissel, ná de Helmet-titelupdate
- [x] `bewoner_lead` op het contactformulier (meet nu niets)
- [x] `whatsapp_klik` op de zwevende knop, `telefoon_klik` / `mail_klik` op tel- en mailto-links
- [x] `docs/tracking.md` als contract tussen code en GTM

### PR 3 — Subsidiecheck-funnel (#101, gemerged)
- [x] `subsidiecheck_stap` bij elke stapwissel (geeft de ontbrekende noemer voor uitval per stap)

### PR 4 — GTM-container (#102, gemerged)
- [x] Container-JSON v6 in `docs/gtm/`, met importprocedure in `docs/gtm/README.md`
- [x] `src/test/gtmContainer.test.ts` bewaakt dat container en code niet wegdrijven

### Buiten het repo (opdrachtgever)
- [ ] Search Console: domain property verifiëren, sitemap indienen (niet per pagina handmatig)
- [ ] Container v6 importeren (Overschrijven, nieuwe werkruimte) en publiceren
- [ ] GA4: 15 aangepaste dimensies, 2 statistieken, 3 sleutelgebeurtenissen (lijst in `docs/gtm/README.md`)

## Review (2026-08-08)

Alle vier de PR's gemerged en live. 130 tests groen op `main` (22 bestanden, 14 nieuw).

In productie geverifieerd na de deploy:
- `robots.txt` bevat de `Sitemap:`-regel
- `sitemap.xml` serveert 18 URL's mét `lastmod`, inclusief `/subsidies/stapelen`
- In de live `<head>` staat de consent-default (regel 17) vóór het GTM-snippet (regel 32) en
  vóór Axeptio (regel 99)

Wat de audit onderweg nog opleverde, buiten de oorspronkelijke opzet:
- **Een adres-lek naar GA4.** De GA4-configuratie stuurde de kale URL mee als `page_location`,
  inclusief `?pc=…&hn=…` van de subsidiecheck. Opgelost met een variabele die alleen de
  adresparameters strippt en utm laat staan.
- **Een verkeerde aanname van mijzelf.** Ik ging uit van client-side navigatie omdat dit een SPA
  is. Er staat geen enkele react-router `Link` in de codebase; alles is `<a href>`. Het echte gat
  zat bij `SubsidiecheckCta`, die wél `navigate()` doet. Zie `tasks/lessons.md`.

Wat bewust níet is opgelost: de scroll-trigger start op `WINDOW_LOAD` en telt daardoor niet
opnieuw na de paar client-side navigaties. Kleine winst, meer onderhoud dan het waard is.

## Subsidietool optimaliseren: contactdrempel, poort en mobiel (2026-08-07)

Aanleiding: de tool wordt gebruikt, maar bezoekers nemen daarna nauwelijks contact op. Doel:
zo laagdrempelig mogelijk een vraag kunnen stellen of contact opnemen, bezoekers zichzelf beter
laten kwalificeren vóór het resultaat, en meer (eerlijke) overtuigingstechniek.

Afgestemd met de opdrachtgever (2026-08-07):
- Contactroutes: **WhatsApp met vooringevuld bericht** + een **vrij vraagveld**. Een bericht komt
  in `notities` op de lead én per mail bij het team binnen.
- Overtuiging: **alleen aantoonbaar ware claims**. Geen verzonnen schaarste of deadlines.
- Reactiebelofte: **binnen 24 uur** (consistent met `/contact`).
- Poort: opnieuw vormgeven op basis van onderzoek (zie hieronder).
- Cijfers moeten **zichzelf bijwerken**; geen maandelijks handwerk.

Onderzoeksconclusies die de poort sturen:
1. Het moment klopt al: vragen vlak vóór de onthulling is het sterkste punt.
2. Een **verplicht telefoonnummer** is de duurste veldkeuze (metingen: 5 tot ruim 50% minder
   inzendingen). Nu verplicht, samen met voornaam, tussenvoegsel, achternaam en e-mail.
3. **Gedeeltelijke onthulling** (eerst een echt stukje van de uitkomst tonen, dan pas vragen)
   verslaat een harde poort in zowel aantal als leadkwaliteit.
4. **Progressive profiling**: de rest van de gegevens ná de eerste toezegging ophalen.

Bronnen voor zelf-bijwerkende cijfers (uitgezocht):
- **Google-reviews**: score + aantal komen live binnen via `sync-google-reviews`, zie
  `src/components/ReviewsCompact.tsx`. Nul onderhoud. Inzetten in de tool.
- **Uit de check zelf**: aantal regelingen, hoogste percentage/bedrag via `topBedragen()`.
- **Niet beschikbaar**: einddatums en budgetuitputting. De Energiesubsidiewijzer levert die
  velden niet (geverifieerd in `src/lib/subsidies/energiesubsidiewijzer.ts` en de fixtures).
  Dus géén deadline-urgentie; die zou handmatig onderhoud en verouderde claims opleveren.
- Resterende vaste cijfers in één bestand `src/config/bewijs.ts` met peildatum, halfjaarlijks na
  te lopen. Formuleringen kiezen die niet bederven.

**CRM-cijfers, opgehaald 2026-08-07 (nulmeting vóór de wijzigingen):**
- Week van 3 augustus: **11 leads uit de subsidietool, 0 uit het contactformulier**. Week ervoor:
  1 en 1. Daarvoor niets. De tool ís dus de leadmotor; het contactformulier levert vrijwel niets.
- **Alle 11 leads hadden een telefoonnummer**, logisch: dat veld was verplicht. Dit is het
  getal om te bewaken nu telefoon optioneel is. Zakt het aandeel hard terwijl het totaal niet
  stijgt, dan is optioneel maken hier de verkeerde keuze geweest.
- 4 van de 11 hadden een notitie. Dat waren teamnotities (de tool schreef `notities` toen nog niet).
  **Let op: die maatstaf verandert nu van betekenis**, want elke nieuwe subsidietool-lead krijgt
  automatisch de regel "Wil hulp met: …". Meet voortaan met `notities like 'Wil hulp met:%'`.

**Schema-antwoorden (2026-08-07):**
- `achternaam` is **NOT NULL** en heeft een CHECK dat 'ie niet leeg mag zijn. Het veld kan dus
  niet uit de poort; drie verplichte velden is het minimum. `voornaam` en `email` zijn technisch
  nullable, maar die hebben we nodig om iemand aan te spreken en te antwoorden.
- Er staat **geen CHECK op `energielabel` of `bouwjaar`**. De terugval-insert zonder verrijking
  blijft als goedkope verzekering staan, maar zal in de praktijk niet afgaan.
- De CHECKs die er wél zijn (`formulier`, `subsidiecheck_type_bewoner`) sluiten precies aan op
  wat de code stuurt.

Openstaand bij de opdrachtgever:
- [ ] Akkoord op welke bestaande CRM-kolommen we mogen vullen (`energielabel`, `bouwjaar`,
      `voorkeurskanaal`).
- [ ] Wil n8n/CRM iets extra's met een bericht, of volstaat notitie + teammail?
- [ ] Eventueel: read-only aggregatie-view in het CRM voor een "aantal geholpen bewoners"-getal
      (migratie op de CRM-database, dus alleen met expliciet akkoord).

### PR 1 — Contactdrempel op het resultaat (`feat/subsidiecheck-contactdrempel`) ✅
De grootste en snelste winst: de enige actie was "Plan een gratis gesprek" naar `/contact`,
waar de bezoeker álles opnieuw invulde wat hij in de poort al gaf.
- [x] Inline vraagblok op het resultaat (`DirectContact.tsx`), zonder navigatie weg van het
      resultaat. Bevestiging in beeld, geen aparte bedankpagina.
- [x] Bericht schrijft naar `leads_bewoners.notities` en triggert een aparte teammail met
      onderwerp "Vraag via subsidietool: <adres>", met de bezoeker als antwoordadres.
- [x] WhatsApp-knop met vooringevuld bericht (adres van de bezoeker).
- [x] Terugbelroute: afgeweken van het plan. In plaats van een los blok een vinkje "Ik word
      liever gebeld" onder de vraag; het telefoonveld verschijnt pas dan (en is vooringevuld als
      we het nummer al hebben). Eén formulier, twee uitkomsten, en het nummer wordt gevraagd op
      het moment dat de bezoeker er zelf om vraagt.
- [x] Mobiele actiebalk onderaan het resultaat (`MobieleActiebalk.tsx`), verbergt de zwevende
      WhatsApp-knop zolang hij in beeld is.
- [x] `/contact`-CTA: afgeweken van het plan. Niet vóórinvullen maar wéghalen van het resultaat.
      `DirectContact` dekt vraag, WhatsApp, bellen en terugbelverzoek af; een tweede route naar
      een leeg formulier voegt alleen keuzestress toe.
- [x] Ook in de "geen regelingen"-tak, waar de lead voorheen volledig verdween.
- [x] GTM-events: `subsidiecheck_vraag`, `subsidiecheck_whatsapp`, `subsidiecheck_bellen`.
- [x] Geen dubbele leads: de function geeft nu het `leadId` terug, de site onthoudt dat voor de
      sessie (`contactOpslag.ts`) en een vraag vult de notitie bij díe lead aan.

**Review PR 1.** Getest met `bun run test` (113 tests, waarvan 11 nieuw in
`src/test/subsidiecheckContact.test.ts`) en met een CDP-doorloop van de echte flow op
390px-breedte, met alle schrijfcalls onderschept zodat er geen testlead in de productie-CRM
belandde. Geverifieerd: 12/12 checks mobiel (poort → resultaat → vraag versturen, geen dubbele
contactvelden, actiebalk in beeld, `actie: "bericht"` met het juiste `leadId`, nul directe
inserts) en 4/4 op desktop (balk weg, zwevende knop terug, contactvelden verschijnen wél voor een
onbekende bezoeker). Terzijde meegenomen: `bron_fout: true` in `StapGegevens` was een bestaande
typefout (`pushGtmEvent` neemt alleen tekst en getallen) waardoor `tsc` niet doorliep; nu `1`.

**Tweaks na de eerste review (2026-08-07), doorgevoerd in dezelfde PR:**
- "Ik word liever gebeld" (vinkje) werd "Ik word het liefst…" met twee tapbare kaarten,
  Gemaild of Gebeld, in hetzelfde patroon als "Ik ben…" in stap 1.
- De belofteregel staat nu naast de verzendknop (op mobiel eronder: daar is de knop volle
  breedte, en die smaller maken kost meer dan die regel oplevert).
- "Deel de tool" is van de samenvatting naar de voet van het resultaat verhuisd, met een
  kopieer-icoon. Boven de vouw kostte die te veel ruimte.
- Luchtfoto en 3D-model staan mobiel naast elkaar (scheelt bijna een halve schermhoogte); vanaf
  md weer onder elkaar in de smalle kolom. De bronvermelding op de foto is mobiel een maatje
  kleiner, anders bedekt die op halve breedte het halve dak.
- `TrajectStrip` ("Jouw verduurzamingstraject") is van het resultaat gehaald. Het component
  blijft staan voor later.

**Nog nodig voor deze PR:** de edge function `subsidiecheck-mail` moet gedeployed worden door de
opdrachtgever (Claude heeft geen Supabase-token). Zonder deploy blijft de site werken, maar dan
levert de function geen `leadId` en wordt een vraag een tweede lead in plaats van een notitie bij
de bestaande. Optioneel secret: `MAIL_TEAM` (valt anders terug op `MAIL_BCC`, dan op
info@voortraject.nl).

### PR 2 — Poort opnieuw vormgeven (`feat/subsidiecheck-poort`) ✅
- [x] De regelingen worden nu in de poort zelf opgehaald, niet pas bij het verzenden. Dat voedt
      de teaser ("11 regelingen gevonden, waaronder tot 100% subsidie") én zet de cache klaar,
      zodat het resultaat daarna meteen staat.
- [x] Velden: voornaam, achternaam en e-mail verplicht; tussenvoegsel eruit; telefoon optioneel
      met de reden erbij. Van vijf verplichte velden naar drie.
- [x] Eén kwalificatievraag ná de velden: "Waar kunnen we je mee helpen?" (vier keuzes, één tik).
      Gaat als kopregel naar `notities`, zelfde patroon als de belvoorkeur op het
      contactformulier.
      **Herzien na review (2026-08-07):** eerst stond hier "Wanneer wil je aan de slag?" vóór de
      velden. Terecht bezwaar van de opdrachtgever: bij een termijnvraag kiest bijna iedereen de
      vrijblijvendste optie ("ik oriënteer me"), en dan weet het team nog niets. Nu vier
      hulpvragen die stuk voor stuk een dienst van Voortraject zijn, zodat élk antwoord de
      adviseur vertelt waarmee hij het gesprek opent en er geen vage uitweg bestaat. De vraag
      staat nu ná de contactvelden: die velden zijn waar deze stap over gaat.
- [x] **Teaser herzien:** geen aantallen en bedragen meer in de poort. Dat gaf de uitkomst weg en
      maakte de zoekanimatie op het resultaat (labor illusion, bewust ingebouwd) zinloos. In
      plaats daarvan geven we terug wat we van de wóning weten: luchtfoto met pandcontour,
      bouwjaar en energielabel. Even persoonlijk, zonder de spanning weg te nemen. De regelingen
      worden nog steeds stil voorgeladen, alleen niet meer getoond.
- [x] Voortgang: een balkje met percentage geprobeerd, op verzoek weer verwijderd. De drie
      stappen met labels blijven zoals ze waren.
- [x] Automatische verrijking met wat we al ophalen: energielabel (EP-Online) en bouwjaar (BAG).
      Faalt de insert mét die velden, dan gaat 'ie één keer opnieuw zónder: een lead verliezen
      om een extraatje mag nooit. Geldt in de edge function én in de client-terugval.
- [x] `bag_verblijfsobject_id` bewust NIET gevuld: wij hebben een pand-id, geen
      verblijfsobject-id. Verkeerde data is erger dan geen data.
- [x] Knoplabel "Mail mij dit overzicht" → "Bekijk mijn overzicht": dát is wat de bezoeker wil.
- [x] Achternaam eruit halen: **kan niet**. De kolom is NOT NULL mét een CHECK op niet-leeg
      (geverifieerd 2026-08-07). Drie verplichte velden is dus het minimum.
- [ ] Vraagveld in de poort zelf: bewust niet gedaan. De poort heeft nu al een teaser, een
      kwalificatievraag en vier velden; het vraagveld staat één stap verderop op het resultaat,
      waar de bezoeker weet wát hij wil vragen.

**Review PR 2.** `bun run test`: 115 groen (drie nieuwe rond de poort). CDP-doorloop op 390px:
13/13, met in de payload `notitie: "Wil aan de slag: Binnen 3 maanden"`, `energielabel: "A+++"`
en `bouwjaar: 1931`. Precies dat "A+++" laat zien waarom de terugval nodig is: als er een CHECK
op die kolom staat die zo'n waarde niet kent, gaat de lead nu niet verloren.

### PR 3 — Mobiele optimalisatie van het resultaat (`feat/subsidiecheck-mobiel`) ✅
Eerst gemeten op 390px (CDP), niet gegokt. Uitgangssituatie: resultaat 6544px = 7,8 schermen,
samenvatting 623px, eerste regeling op y=1297, vraagblok op y=4200, elf kaarten van ~250px.
- [x] Stap 1: **al goed**, geen wijziging nodig. De knop staat op y=625, dus ook op een iPhone
      SE (667px hoog) binnen één scherm.
- [x] Kaarten compacter op mobiel: padding 20 → 16, en aanbieder + "Bekijk voorwaarden" op één
      regel in plaats van twee. Scheelt ~40px per kaart.
- [x] Samenvatting: de acht maatregelen staan op mobiel als één doorlopende regel in plaats van
      vier rijen met vinkjes. Zelfde informatie, ~50px korter. Op md+ blijft de vinkjeslijst.
- [x] Resultaat: 6544 → 6015px (7,1 schermen), vraagblok van y=4200 naar y=3672. Alles blijft
      zichtbaar; er is niets ingeklapt of weggelaten.
- [x] Laadsequentie (~3,4s) **bewust ongemoeid gelaten**. Buell & Norton (Harvard, 2011) laten
      zien dat zichtbaar "werk" de gewaardeerde waarde van een uitkomst verhoogt, zelfs als het
      wachten daardoor langer duurt (operational transparency / labor illusion). De opdrachtgever
      heeft die animatie bewust laten bouwen; hem inkorten zou precies dat effect weggooien.
- [ ] Optie voor later, als de lijst te lang blijft voelen: groepen onder de eerste inklappen
      met de telling zichtbaar ("Gemeente · 3"). Bewust niet gedaan zonder cijfers: het ruilt
      zichtbare waarde in voor minder scrollen, en dat is een keuze van de opdrachtgever.

### PR 4 — Eerlijke overtuiging (`feat/subsidiecheck-bewijs`) ✅
- [x] Live Google-score en reviewaantal (`Bewijsregel`) op de twee momenten waarop we iets
      vragen: onder de knop van de poort en naast de verzendknop van het vraagblok. Sociale
      bewijskracht doet zijn werk op het punt van twijfel, niet ergens onderaan de pagina.
      Data komt uit `sync-google-reviews`, dus altijd actueel en nul onderhoud. Geen data =
      geen regel; liever niets dan een verzonnen cijfer.
- [ ] `src/config/bewijs.ts` met vaste claims: **nog niet gemaakt**, want daar is nog geen
      aangeleverd, verifieerbaar cijfer voor (aantal geholpen bewoners, hoogst binnengehaalde
      subsidie). Zodra die er zijn, kan dit erbij.
- [x] Peak-end-copy op het slot: staat al ("Veel regelingen blijven onbenut. Jij bent nu een stap
      verder dan de meeste woningeigenaren."), ongewijzigd gelaten.

### Verificatie (elke PR)
- [ ] `bun run test` + `bun run lint`.
- [ ] Formulieren testen via CDP-interceptie (zie lessons 2026-07-26), nooit echte leads in de
      productie-CRM schrijven.
- [ ] Mobiel gecontroleerd op echte breedtes, niet alleen desktop-resize.
- [ ] Geen gedachtestreepjes in zichtbare copy.

## Partners wordt Zakelijk (2026-08-07)

Branch: `feat/zakelijk-pagina`, af te takken van de huidige branch
`feat/hero-cta-subsidiecheck-primair` (want dit bouwt voort op commit `3475d1b`, waarin het
contactformulier bewoner-only werd). PR ready-for-review, niet zelf mergen. Als de PR van de
hero-branch eerder merget: rebasen op `main`.

Aanleiding: de Partners-pagina heet straks **Zakelijk** en wordt de plek waar uitvoerende
partijen en bedrijven in het algemeen vinden wat wij voor hen doen én hoe ze contact opnemen.

Belangrijke context: in commit `3475d1b` is de uitvoerder-variant van `/contact` volledig
verwijderd (toggle, velden, validatie en de insert naar `leads_uitvoerders`). Daarmee heeft
de site op dit moment **geen enkele route meer voor een zakelijke lead**. Het zakelijke
formulier komt daarom op deze pagina te staan, en de CTA's op deze pagina mogen niet meer
naar `/contact` wijzen (die is nu puur voor bewoners).

Afgestemd (2026-08-07):
- URL gaat mee: `/partners` → `/zakelijk`, met 301-redirects.
- Doelgroep verbreedt: uitvoerders blijven de kern, bedrijven breder erbij.
- Volledig zakelijk contactformulier op de pagina zelf, naar `leads_uitvoerders`.

### 1. Route en naam
- [ ] `src/pages/Partners.tsx` → `git mv` naar `src/pages/Zakelijk.tsx`, export hernoemen.
- [ ] `src/App.tsx`: route `/zakelijk`; `/partners` én `/uitvoerders` worden
      `<Navigate to="/zakelijk" replace />` (geen redirect-ketting).
- [ ] `public/_redirects`: `/partners /zakelijk 301` toevoegen en de bestaande regel
      `/uitvoerders /partners 301` ombouwen naar `/uitvoerders /zakelijk 301`. De
      www-regel blijft ongemoeid.
- [ ] `scripts/generate-sitemap.ts`: `/partners` → `/zakelijk` (sitemap.xml wordt door
      predev/prebuild opnieuw geschreven, niet met de hand aanpassen).
- [ ] Label + href op `Zakelijk` in `src/components/Header.tsx` (`links`) en
      `src/components/Footer.tsx` (`navCols`).
- [ ] `src/components/sections/ClosingCta.tsx`: href naar `/zakelijk` en de zin
      "Bekijk onze partnerpagina" herschrijven naar bedrijven.
- [ ] `src/components/sections/Audiences.tsx`: href `/uitvoerders` → `/zakelijk`.
      (Component wordt nergens gerenderd, maar houdt zo geen dode link.)
- [ ] `<Seo>` op de pagina: `path="/zakelijk"`, titel/omschrijving richting bedrijven.

Actieve staat in de header werkt op exacte href-vergelijking, dus `/zakelijk` licht vanzelf
op zodra de href klopt. Er is verder niets href-afhankelijk in Header/Footer.

### 2. Inhoud verbreden naar bedrijven
Bestaande secties blijven staan (pijnpunten, `<Why/>`, voor/na, waarom dit werkt): die zijn
sterk en gaan over uitvoerders. Wat verandert:
- [ ] Hero: H1 en subkop naar bedrijven, met uitvoerders expliciet genoemd als kern.
- [ ] Nieuwe sectie "Voor wie we werken" met korte kaarten per type bedrijf.

**Te bevestigen bij het plan:** welke typen bedrijven noemen we? Voorstel, graag corrigeren
want dit is een feitelijke uitspraak op een publieke site:
uitvoerders/aannemers, installateurs, VvE-beheerders, woningcorporaties, makelaars,
energieadviseurs. Wat niet klopt, haal ik eruit.

### 3. Zakelijk contactformulier op de pagina
Nieuw, zelfstandig component `src/components/ZakelijkContactFormulier.tsx`, in een sectie met
`id="contact"` onderaan de pagina. Contact.tsx blijft volledig ongemoeid: het bewoner-only
formulier is net opgeleverd en dat wil ik niet opnieuw aanraken.

Opzet volgt het huisrecept van `src/components/subsidiecheck/StapGegevens.tsx` en het
verwijderde uitvoerder-formulier:
- Velden: bedrijfsnaam, contactpersoon (voornaam / tussenvoegsel / achternaam), e-mail,
  telefoonnummer, vragen of opmerkingen (max 2000).
- Honeypot `vt_check` (offscreen via CSS, geen `type=hidden`) + minimaal 2 seconden op de
  pagina; honeypot gevuld betekent stil bedankscherm zonder insert.
- Validatie met de bestaande helpers: `validatePhoneNL` / `TELEFOON_FOUT` uit
  `src/lib/telefoon.ts`, plus de naam-, bedrijfs- en e-mailpatronen. Inclusief de tip bij een
  gratis e-maildomein (gmail/hotmail/…), zoals het oude formulier had.
- `pushGtmEvent("zakelijk_lead")` uit `src/lib/gtm.ts` na een geslaagde inzending, zonder PII.
- Insert via `supabaseExternal` naar `leads_uitvoerders` met exact de kolommen die tot
  `3475d1b` in productie werkten: `tenant_id`, `bedrijfsnaam`, `contactpersoon_voornaam`,
  `contactpersoon_tussenvoegsel`, `contactpersoon_achternaam`, `email`, `telefoon`,
  `notities`, `bron: "Voortraject"`, `status: "nieuw"`. De kolommen `contactpersoon` en
  `naam` worden bewust niet meegestuurd (CRM-trigger stelt die samen), en `formulier` bestaat
  alleen op `leads_bewoners`.
- [ ] De drie CTA's op de pagina (`href="/contact"`) worden ankers naar `#contact`, met
      `<OfBelOnsCta/>` ernaast voor bellen.

**Let op, stale types.** `src/integrations/supabase/types.ts` beschrijft `leads_uitvoerders`
met `naam_contactpersoon` / `telefoonnummer` / `vragen`, terwijl de live CRM-tabel
`contactpersoon_*` / `telefoon` / `notities` gebruikt. De oude code omzeilde dat met `as any`;
dat doe ik ook. Ik heb hier geen Supabase-token, dus de types kan ik niet regenereren:
- [ ] Actie voor jou: `leads_uitvoerders` opnieuw laten genereren zodat code en database weer
      in sync zijn. Geen schemawijziging op het CRM-project, alleen types.

### 4. Tests
- [ ] Nieuw `src/test/zakelijkFormulier.test.tsx`, met de cases die in `3475d1b` uit
      `honeypot.test.tsx` / `formulierKolom.test.tsx` / `leadOpslagRuw.test.tsx` zijn
      verwijderd, nu tegen het nieuwe component: honeypot-opzet, insert naar
      `leads_uitvoerders`, honeypot gevuld = geen insert maar wel bedankscherm, en
      `bron: "Voortraject"`.

### 5. Verificatie
- [ ] `bun run test` groen, `bun run lint` schoon, `bun run build` slaagt.
- [ ] `bun run dev`: `/zakelijk` rendert, `/partners` en `/uitvoerders` leiden door,
      header/footer tonen "Zakelijk" en lichten actief op.
- [ ] Gegenereerde `public/sitemap.xml` bevat `/zakelijk` en niet meer `/partners`.
- [ ] Formulier echt inzenden op dev en in het CRM controleren dat de lead binnenkomt met
      bron "Voortraject" en een correct samengestelde contactpersoon.

### Review (2026-08-07)
Alles uit het plan is gebouwd op branch `feat/zakelijk-pagina`.

- Route: `src/pages/Partners.tsx` → `Zakelijk.tsx` op `/zakelijk`. `/partners` en
  `/uitvoerders` wijzen allebei rechtstreeks door, zowel in `public/_redirects` (301) als in
  de SPA-router. Geen redirect-ketting.
- Naam "Zakelijk" in header, footer en de verwijzing in `ClosingCta`; `Audiences` (dode
  component) wijst niet langer naar het oude adres.
- Pagina teruggebracht tot drie secties (2e ronde, op verzoek): hero, "Voor wie we werken"
  en meteen daarna het formulier. De secties "vastlopen", `<Why/>`, "voor en na" en "waarom
  dit werkt" zijn eruit, net als de sluit-CTA in de footer: die zou pal onder het formulier
  nog een keer om dezelfde kennismaking vragen.
- De "Plan een kennismaking"-CTA in de hero ankert naar `#contact` in plaats van naar
  `/contact`, want die pagina is sinds `3475d1b` bewoner-only.
- Gevolg: `src/components/sections/Why.tsx` wordt nu nergens meer gebruikt. Laten staan of
  opruimen is een aparte keuze, buiten deze branch gelaten.
- `src/components/ZakelijkContactFormulier.tsx` is nieuw en zelfstandig; `Contact.tsx` is
  niet aangeraakt. Nieuwe code gebruikt de design tokens in plaats van hex-waarden.
- Tests: 3 cases in `honeypot.test.tsx` (opzet, insert met de exacte kolommen + bron, gevuld
  honeypot = bedankscherm zonder insert) en `zakelijkPagina.test.tsx` als rooktest op de
  doelgroepen, het formulier en de CTA-hrefs.

Geverifieerd: 92 tests groen (15 bestanden), `tsc --noEmit` schoon, `bun run build` slaagt en
de gegenereerde sitemap bevat `/zakelijk` en niet meer `/partners`. ESLint blijft op exact de
baseline van vóór deze branch (17 problemen, 9 errors) — de nieuwe bestanden voegen er nul toe.

Nog open (staat hierboven aangevinkt als jouw actie): de types voor `leads_uitvoerders`
regenereren, en één echte inzending controleren in het CRM.

## Subsidiecheck — gegevens vooraf verzamelen (tussenoplossing) (2026-07-24)

Branch: `feat/subsidiecheck-gegevens-poort` (vanaf `main`). PR ready-for-review, niet zelf mergen.

Aanleiding: de echte subsidiecheck (afscherming, PR #66) gaat pas over een paar weken live. In
de tussentijd wil de opdrachtgever nu al leads verzamelen: na de stap "Jouw woning" komt een
extra stap "Je gegevens" (voornaam, tussenvoegsel, achternaam, e-mail, telefoon) die als
toegangspoort naar het resultaat fungeert.

Afgestemd (2026-07-24):
- Aparte tussenstap i.p.v. alles op één scherm (drempel/schermruimte/hergebruik van het
  bestaande contactformulier in `MailOverzicht`).
- Gegevens = toegangspoort: ná het invullen ziet de bezoeker het resultaat.
- Situatie + interesse blijven op stap 1 (kwalificatie + korte gegevensstap).
- Poort via client-state (niet via de URL): een gedeelde of ververste link vraagt opnieuw om
  gegevens (meer leads). `sessionStorage` verzacht: binnen dezelfde sessie niet dubbel vragen.
- Het "mail mij dit overzicht"-blok onderaan het resultaat vervalt (gegevens zijn al binnen).

LET OP / te bevestigen: toont het resultaat op productie nu echte regelingen of nog
voorbeelddata? De live provider (`energiesubsidiewijzerProvider`) valt terug op mock
("Voorbeeldgegevens") als `VITE_SUBSIDIECHECK_URL` niet staat of de `subsidiecheck` edge
function niet gedeployed is. Gegevens vóór het resultaat zetten heeft alleen zin als de
bezoeker daarna echte data ziet, niet voorbeelddata.

### Flow (3 stappen)
Voortgangsbalk: Jouw woning → Je gegevens → Resultaat.
1. **Jouw woning** (StapAdres, ongewijzigd behalve knoplabel "Verder" i.p.v. "Bekijk mijn
   subsidies" zolang de poort aan staat).
2. **Je gegevens** (nieuw, StapGegevens): naam/e-mail/telefoon → lead naar `leads_bewoners`
   (bron "Subsidiecheck", zonder regelingen in de notities). Bij succes: ontgrendel → resultaat.
3. **Resultaat** (StapResultaat, MailOverzicht-blok eruit; "plan een gratis gesprek"-CTA blijft).

### Plan
- [x] Feature-flag `SUBSIDIECHECK_GEGEVENS_POORT = true` in `src/config/features.ts` (makkelijk
      terug te draaien bij de echte launch: flag uit = resultaat weer direct na stap 1).
- [x] `src/components/subsidiecheck/leadFormulier.ts` (nieuw, gepland als `contactValidatie.ts`):
      gedeelde validators (`EMAIL_RE`, `NAME_RE`, `validatePhoneNL`, `escapeHtml`) +
      `valideerContact()` + `schrijfSubsidiecheckLead()` die de directe `leads_bewoners`-insert
      centraliseert (exact dezelfde kolommen; data-integriteit, CLAUDE.md-regel 2). `MailOverzicht`
      gerefactord naar dezelfde helper (geen kolomdrift).
- [x] `src/components/subsidiecheck/StapGegevens.tsx` (nieuw): het poortformulier. Zelfde
      velden/validatie/honeypot/timing als `MailOverzicht`, maar directe lead-insert (geen mail:
      geen regelingen op dit punt). GTM `subsidiecheck_lead` (alleen bewonertype, geen PII). Bij
      succes `onOntgrendeld()`.
- [x] `Subsidiecheck.tsx`: `stap` 1|2|3, client-state `ontgrendeld` (+ `sessionStorage` zodat een
      refresh binnen de sessie niet opnieuw vraagt), StapGegevens tussen adres en resultaat, kop +
      prefetch ongemoeid. Flag uit = huidige 2-stappenflow.
- [x] `Voortgang.tsx`: generiek gemaakt (prop `stappen` + `huidige`), 2 of 3 stappen, terug-naar-
      stap-1 klikbaar.
- [x] `StapAdres.tsx`: knoplabel via prop `knopLabel` ("Verder" bij de poort, default "Bekijk mijn
      subsidies").
- [x] `StapResultaat.tsx` (prop `verbergMail`) + `Samenvatting.tsx` (prop `toonMailKnop`): het
      "Ontvang dit overzicht in je mail"-blok én de "mail mij dit overzicht"-knop verborgen bij de
      poort; "plan een gratis gesprek"-CTA + warm slot blijven.
- [x] Test `src/test/leadFormulier.test.ts` (vitest): `valideerContact` (alle veldregels) +
      `validatePhoneNL`. Pure-functietest, past bij de bestaande lib-tests.
- [x] Verificatie: `tsc` schoon · eslint baseline ongewijzigd (11 err/8 warn, allemaal in niet-
      geraakte bestanden) · 60/60 vitest (49 + 11 nieuw) · `bun run build` groen · headless Chrome
      desktop + mobiel: stap 1 (3-staps-balk + knop "Verder") en de poort (kop/adres-pill/velden/
      knop) renderen correct.
- [x] Commit + PR (ready-for-review), niet zelf mergen.

### Review
- Flow werkt zoals afgesproken: Jouw woning → Je gegevens (poort, schrijft de lead) → Resultaat.
  De poort staat achter `SUBSIDIECHECK_GEGEVENS_POORT`; flag op `false` = exact de oude
  2-stappenflow (Voortgang, koppen, breedte en render vallen dan terug).
- Poort via client-state + `sessionStorage` (`sc_poort_ontgrendeld`), bewust niet in de URL: een
  gedeelde of ververste link (andere browser/incognito) vraagt opnieuw om gegevens. Wie op het
  resultaat het adres/situatie aanpast (`edit`/`sit`) blijft ontgrendeld (geen dubbele poort).
- Vervolg (2026-07-24, afgestemd): de poort **mailt het overzicht nu ook**. Op "Mail mij dit
  overzicht" halen we de regelingen op (primeert meteen de cache voor stap 3) en sturen we het
  overzicht per mail via de gedeelde `verstuurSubsidiecheckLead` (edge function `subsidiecheck-mail`
  + Resend), net als het oude mail-blok. Subline: "Dan sturen we jouw persoonlijke overzicht naar je
  toe." `MailOverzicht` gebruikt nu dezelfde helper (mailfunctie stond daar al).
- **LET OP (afhankelijkheid):** dit mailt alleen echt als `VITE_SUBSIDIECHECK_MAIL_URL` in
  Cloudflare gezet is én `subsidiecheck-mail` gedeployed staat (Resend). Zo niet, dan valt het stil
  terug op alleen de lead-insert (geen mail) en klopt de belofte in de subline/knop niet. Te
  verifiëren voor de belofte waargemaakt wordt.
- Deelknoppen op het resultaat blijven staan.
- Niet headless getest (zou een echte CRM-lead + mail sturen): de daadwerkelijke submit + stap 3 na
  ontgrendelen. De validatie (`valideerContact`) is los getest; de insert/mail is ongewijzigd
  hergebruikt. Eventueel end-to-end te checken op de PR-preview (schrijft dan 1 lead + 1 mail).

### Open / beslispunten
- Echte data vs voorbeelddata achter de poort (zie LET OP hierboven).
- Deelknoppen op het resultaat ("kopieer link naar dit overzicht") worden met een harde poort
  minder logisch; voor nu laten staan, tenzij anders gewenst.
- `sessionStorage`-ontgrendeling geldt sessiebreed (één keer lead = niet opnieuw vragen, ook
  voor een tweede adres). Akkoord tenzij anders gewenst.

## 3D BAG persistente cache (optie E) (2026-07-23)

Branch: `feat/3dbag-persistente-cache` (vanaf `main`, ná merge van PR #73). PR ready-for-review,
NIET zelf mergen: raakt de CRM-database (migratie), dus mens beslist + past de migratie toe.

Aanleiding: vervolg op PR #73. De bottleneck blijft api.3dbag.nl (1,5 tot 3,5s per item, soms
502). De in-memory cache in de edge function is per-instance en vluchtig (Supabase spint
functions af). Optie E maakt de cache persistent en gedeeld: een adres dat één keer is
opgehaald laadt daarna direct, ook voor andere bezoekers en gedeelde links, en is immuun voor
3dbag-storingen. Met opdrachtgever afgestemd ("Doe dat voor mij").

### Plan
- [x] **Migratie** `supabase/migrations/20260723120000_pand_3d_cache.sql`: tabel `pand_3d_cache`
      (`cache_key text pk`, `model jsonb not null`, `updated_at timestamptz`). RLS AAN, géén
      policies voor anon/authenticated (clients raken 'm nooit aan), `grant all ... to service_role`.
      Puur een cache, geen persoonsgegevens, geen relatie met CRM-tabellen.
- [x] **Edge function** `woninginfo`: supabase-client (service_role, auto-geïnjecteerde
      `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`, zelfde patroon als subsidiecheck-mail).
      Leeslaag `leesModelCache` + schrijflaag `schrijfModelCache`, met `MODEL_VERSION`-prefix in
      de sleutel (bump = oude rijen negeren) en 90-dagen TTL. Handler: in-memory → persistente
      cache → 3dbag; alleen niet-lege modellen worden persistent bewaard.
- [x] **Graceful fallback**: ontbreekt de tabel of de env, of faalt een DB-call, dan valt alles
      stil terug op in-memory + 3dbag (try/catch, `null`). De function kan dus vóór de migratie
      al gedeployed worden zonder iets te breken.

### Verificatie
- esbuild-syntaxcheck + eslint schoon; 49/49 vitest groen. (`deno check` bij deploy.)
- Frontend ongewijzigd: de persistente cache is volledig server-side.

### Nog te doen (opdrachtgever, Supabase-toegang, CRM-project lfelnfukbrxznkevnevr)
1. Migratie toepassen (`supabase db push`, of het SQL uit de migratie draaien in de dashboard).
2. `supabase functions deploy woninginfo --project-ref lfelnfukbrxznkevnevr`.
3. (Optioneel) Supabase-types regenereren; de edge function gebruikt geen gegenereerde types,
   dus niet strikt nodig.
4. Testen: zelfde adres 2x opvragen → 2e keer direct (rij in `pand_3d_cache`, geen 3dbag-call).

## 3D BAG sneller laden op de subsidiecheck (2026-07-23)

Branch: `perf/subsidiecheck-3dbag-laden` (vanaf `main`). PR ready-for-review, niet mergen.

Aanleiding: het 3D-model op de resultaatpagina laadt traag. Gemeten waar de tijd zit
(curl tegen de echte upstreams):
- PDOK BAG WFS (contour/pand-id én buur-selectie): ~0,08 tot 0,10s. Niet de bottleneck.
- **api.3dbag.nl, één item: 1,5 tot 3,5s, af en toe een 502.** Hier zit alle tijd.
- api.3dbag.nl bbox-endpoint (alles in één call): 15 tot 20s. Terecht al vermeden in de code.

Al goed: progressief laden (subject eerst zonder buren, daarna de volledige versie met
buren), serverside decoding, lichte SVG-render (geen 3D-lib). Scope met opdrachtgever
afgestemd: A+B+C (geen DB-wijziging). Alles in de edge function `woninginfo` (CRM-project
`lfelnfukbrxznkevnevr`), die de opdrachtgever nog moet deployen.

### Plan
- [x] **A. `Cache-Control` op het model-antwoord.** Gevuld model lang cachen
      (`max-age=86400, stale-while-revalidate=2592000`; gebouwen zijn statisch), leeg model
      kort (`max-age=60`) zodat een volgende poging snel weer echt ophaalt. Browser /
      terug-navigatie / gedeelde link hoeft dan niet opnieuw naar het trage 3dbag.
      Helper `model3dResponse()`, `json()` kreeg een `extraHeaders`-parameter.
- [x] **B. Buren parallel aan de subject ophalen.** `haal3dBag` startte de buur-items pas
      ná de trage subject-fetch, terwijl de buur-id's al na ~0,1s uit de WFS komen. Nu lopen
      subject (met retry) en buren (pool 2, na de snelle WFS) parallel. Piek-concurrency op
      3dbag blijft 3 (1 subject + 2 buren), binnen de betrouwbare grens.
- [x] **C. Subject-item retry bij 502/timeout.** Nieuwe `fetchItemMetRetry` (2 pogingen) voor
      alleen de subject (kritiek: zonder subject geen model). Voorkomt dat een transiente 502
      de héle client-call (incl. WFS + buren) laat herhalen. Buren mogen wegvallen (context).
- [x] **D. Dubbele PDOK-lookup weg (frontend).** `StapAdres` valideerde het adres met een losse
      `zoekAdres` (buiten react-query), waarna de pagina hem via `usePdokAdres` opnieuw ophaalde.
      Nu seedt `StapAdres` na een geslaagde lookup de react-query-cache met exact dezelfde sleutel
      (`["pdok-adres", normalizePostcode(pc), hn, tv]`), zodat de pagina-lookup een directe cache-hit
      is en de 3D-prefetch ~0,1s eerder start (plus geen "Adres controleren…"-flits meer).

### Verificatie
- esbuild-syntaxcheck van `index.ts` groen (Deno niet lokaal geïnstalleerd; `deno check` bij deploy).
- eslint op `index.ts` schoon; 49/49 vitest groen (pure decoder-tests ongemoeid, alleen `index.ts` geraakt).
- Live tegen de echte API getest: subject + 2 buren tegelijk (piek 3) → 3× 200, geen overload-502,
  volledige set in ~2s wall-clock (vs. ~4 tot 6s bij subject-dan-buren sequentieel).

### Nog te doen (opdrachtgever, Supabase-toegang)
- `supabase functions deploy woninginfo --project-ref lfelnfukbrxznkevnevr`.
- Na deploy in de network-tab checken dat de `?pandid=...`-respons de `Cache-Control`-header
  draagt en dat een tweede load van hetzelfde adres direct uit de cache komt.

## Subsidiecheck achter "binnenkort"-schakelaar (2026-07-22)

Branch: `feat/subsidiecheck-binnenkort` (vanaf `main`). PR ready-for-review, niet mergen.

Aanleiding: de subsidiecheck mag nog niet gebruikt kunnen worden (postcodecheck), hij
gaat later pas echt live. Met opdrachtgever afgestemd (3 keuzes): (1) de /subsidiecheck-
pagina blíjft bestaan maar toont een "binnenkort"-melding, (2) instappunten laten staan →
ze leiden naar die melding, (3) géén e-mailverzameling, alleen een nette melding + CTA.

### Plan
- [x] Feature-flag `src/config/features.ts` → `SUBSIDIECHECK_LIVE = false` (puur een
      constante, geen React-import, zodat het sitemap-script hem ook kan importeren).
- [x] `Seo.tsx`: optionele `noindex`-prop → `<meta name="robots" content="noindex, follow">`.
- [x] `src/components/subsidiecheck/Binnenkort.tsx`: kalme melding in huisstijl (Header +
      Footer, oker klok-icoon, kop "De subsidiecheck komt eraan", uitleg, `CtaButton` naar
      /contact + telefoonlink). Geen denkstreepjes. Seo met noindex.
- [x] `Subsidiecheck.tsx`: bestaande component → `SubsidiecheckLive` (ongewijzigd); dunne
      wrapper `Subsidiecheck` toont bij `!SUBSIDIECHECK_LIVE` de melding. Postcodecheck wordt
      dan niet eens gerenderd (ook niet via directe link/oude Google-hit). Wrapper roept geen
      hooks aan → hook-volgorde in Live blijft heel.
- [x] `scripts/generate-sitemap.ts`: `/subsidiecheck` alleen in de sitemap als de flag `true` is.

### Launch — één handeling
- [x] Zet `SUBSIDIECHECK_LIVE = true` in `src/config/features.ts` → check + sitemap-entry +
      indexering komen in één keer terug. Verder geen wijziging nodig. **Gedaan 2026-07-22**
      (opdrachtgever: "weer helemaal op actief"), branch `chore/subsidiecheck-weer-actief`.
      De schakelaar-code blijft staan (slapend) voor eventueel later opnieuw afschermen.
      Geverifieerd: sitemap 14 → 15 (`/subsidiecheck` terug), tsc/build groen, visueel de
      echte stap-1-check weer op /subsidiecheck.

### Review
- Verificatie: `tsc` schoon · eslint op de 4 geraakte bestanden schoon · 49/49 vitest ·
  `bun run build` groen · sitemap 15 → 14 entries (`/subsidiecheck` eruit, geverifieerd 0 hits).
- Visueel (headless Chrome tegen `vite preview`): desktop 1440px + mobiel 480px tonen de
  melding correct (kop op één regel, tekst breekt netjes, gouden CTA + telefoonlink,
  Header/Footer/WhatsApp intact). De 390px-headless-shot sneed rechts af = bekend
  headless-artefact (clamp ~500px, zie lessons.md), geen echte overflow.
- Bewust NIET gedaan (conform keuzes opdrachtgever): instappunten (homepage-formulier,
  hero-knop, header-tool) blijven staan en leiden naar de melding; geen e-mailverzameling.

## Naamvelden splitsen: voornaam / tussenvoegsel / achternaam (2026-07-16)

Branch: `feat/naamvelden-gesplitst`. CRM-database heeft de kolommen al; een BEFORE
INSERT-trigger stelt `naam`/`contactpersoon` zelf samen. Website stuurt alleen nog de
drie losse delen (getrimd, leeg = null; achternaam verplicht).

### Plan
- [x] `/contact` bewoner: "Volledige naam *" → Voornaam (opt) + Tussenvoegsel (opt, smal) + Achternaam (verplicht); payload `voornaam`/`tussenvoegsel`/`achternaam`, kolom `naam` weglaten
- [x] `/contact` uitvoerder: "Naam contactpersoon *" → drie velden; payload `contactpersoon_voornaam`/`_tussenvoegsel`/`_achternaam`, kolom `contactpersoon` weglaten
- [x] `/subsidiecheck` MailOverzicht: "Je naam" → Je voornaam / Tussenvoegsel / Je achternaam (2 regels, mobiel stapelend); client-insert én function-payload op de drie velden
- [x] Edge function `subsidiecheck-mail`: drie velden accepteren + wegschrijven (zonder `naam`), aanhef samenstellen, legacy-terugval voor oude bundles die nog `naam` sturen
- [x] Lokale dev-server voor visuele controle gebruiker (http://localhost:8081)
- [x] Verificatie: tsc schoon · eslint alleen de 4 baseline-fouten die ook op main staan · 49/49 vitest · build groen · 3 testinzendingen via de echte formulieren (headless CDP) + DB-controle via `supabase db query --linked`
- [x] Edge function gedeployed naar CRM-project (neemt ook de nog niet gedeployde telefoon-wijziging van PR #65 en de mail-wijzigingen van PR #60 mee); productiepad + legacy-pad daarna live getest via curl
- [x] PR openen; testrijen rapporteren aan CRM-team (niet zelf verwijderen)

### Review
- DB-verificatie (leads_bewoners): "Jan / van der / Testcontact" → `naam` door trigger
  "Jan van der Testcontact", bron Website; "Jan / van der / Testsubsidie" → bron
  Subsidiecheck mét postcode/straat/notities intact. (leads_uitvoerders): "Piet / de /
  Testuitvoerder" → `contactpersoon` "Piet de Testuitvoerder".
- Functie-test na deploy: nieuw pad ("Testfunctie") én legacy pad (alleen `naam`
  "Jan Legacytest") geven ok+mailed; de CRM-trigger blijkt een legacy `naam` zelfs zelf
  te splitsen in voornaam/achternaam. Legacy-terugval in de functie kan weg zodra `naam`
  een generated column wordt.
- Testrijen (door CRM-team te verwijderen): leads_bewoners achternaam Testcontact,
  Testsubsidie, Testfunctie + naam "Jan Legacytest"; leads_uitvoerders achternaam
  Testuitvoerder.
- Tussenvoegsel bewust zonder autoComplete (geen standaard token); voornaam/achternaam
  kregen given-name/family-name. Optionele naamdelen: ongeldige tekens → veldfout client-
  side; serverside mild (ongeldig deel weglaten) zodat een lead nooit verloren gaat.
- Vervolg 2 (zelfde dag, afgestemd): voornaam overal verplicht (contact bewoner +
  uitvoerder + subsidiecheck); naamvelden op lg+ op één rij, daaronder voornaam boven en
  tussenvoegsel + achternaam samen. Uitvoerder-variant naar het Adres-groepspatroon
  (groepslabel "Contactpersoon (tussenvoegsel optioneel)" + placeholders) omdat de losse
  labels over twee regels braken. Tussenvoegsel blijft optioneel (geen *). Geverifieerd:
  tsc/49 tests/baseline-eslint + headless (één rij desktop, stapeling tablet/mobiel,
  "Vul je voornaam in."-fout op beide formulieren zonder insert).
- Vervolg (zelfde dag, afgestemd): mail-aanhef persoonlijker. Met voornaam "Hallo Jan,";
  zonder voornaam "Beste heer/mevrouw Van der Berg," (geslacht wordt niet uitgevraagd →
  gecombineerde vorm; tussenvoegsel/naam met hoofdletter in weergave, DB blijft zoals
  getypt); legacy-pad blijft "Hallo {naam},". Opnieuw gedeployed + live getest (2 extra
  testrijen leads_bewoners, achternaam Testaanhef; mails ter controle op info@).

## Visuele aanpassingen Over ons + Partners (2026-07-16)

Branch: `tweak/team-partners-visuals` (nieuw, vanaf `main`). PR ready-for-review, niet mergen.

### Plan
- [x] Nieuwe branch vanaf `main` (huidige `feat/subsidiecheck-afscherming` blijft onaangeroerd, PR #66 open)
- [x] **Over ons:** persoonlijke quotes per teamlid verwijderen (`quote`-veld + weergaveblok met scheidingslijn); naam + functie blijven
- [x] **Partners:** hele pakkettensectie ("Kies wat past bij jullie", pakket 01/02/03) verwijderen, incl. `PackageCard`, `packages`-data, types en dan ongebruikte imports (`useState`, `ChevronDown`, `FileCheck`, `ShieldCheck`, `AnimatedGradientBorder`, `LucideIcon`)
- [x] **Partners hero:** titel donkerblauw (`hsl(var(--primary))` = #152C4E), het woord "voortraject" blijft oker (accent)
- [x] **Partners fontcontrole:** hele pagina langsgelopen. Bevinding: alles volgt de huisstijl (Manrope + Inter Tight via `h2-section`), behalve de hero-h1: weight 600 / -0.02em waar alle andere paginahero's Manrope 700 / -0.03em gebruiken → gelijkgetrokken. (De pakkettensectie met afwijkende inline JetBrains Mono/Inter Tight is sowieso weg.)
- [x] **Partners CTA's:** de "Plan een kennismaking"-knoppen (hero, voor/na-sectie, footer-CTA) vervangen door de bestaande `CtaButton`-component = exact de headerknop-stijl (gouden pill, rounded-full, sheen-glans). Label blijft "Plan een kennismaking". Ongebruikte `ctaButton`-const opgeruimd.
- [x] Over ons footer-CTA ook naar `CtaButton` (afgestemd: "ook Over ons")
- [x] Verificatie: `tsc` schoon · eslint op beide bestanden schoon (baseline 11 err/8 warn ongewijzigd, in niet-aangeraakte bestanden) · 49/49 vitest · `bun run build` groen · visueel geverifieerd via dev-server + headless Chrome (desktop + mobiel, beide pagina's)
- [x] Commit + PR (ready-for-review)

### Review
- Teamkaarten Over ons tonen nu alleen naam + functie; scheidingslijn onder de functie is mee verwijderd (hing anders los onderaan de kaart).
- Partners: sectie-anchor `#pakketten` bestond nergens als link, dus veilig verwijderd; sectiecomment "INLEIDING PAKKETTEN (Vastlopen)" hernoemd naar "VASTLOPEN".
- Mobiele headless-screenshot (390px) toont rechts afgesneden content, maar productie doet in dezelfde headless-opstelling exact hetzelfde → pre-existing artefact van headless Chrome + `overflow-x: clip`, geen regressie.
- Bewust niet aangepast: "Zonder/Met Voortraject"-h3's en footer-CTA-koppen gebruiken sitebreed `font-display` (Manrope); dat is de bestaande conventie, geen afwijking van de Partners-pagina.

## Subsidiecheck — stap 1 desktop-polish (2026-07-15)

Branch: `tweak/subsidiecheck-stap1-desktop`. Kleine vervolg-tweaks op de 2-stappen-flow
(PR #56), alleen in `src/pages/Subsidiecheck.tsx`.

### Keuzes (met opdrachtgever afgestemd)
- Interesses-uitklap **ingeklapt houden** op desktop én mobiel (rustig, "alle maatregelen"
  als default) — géén wijziging.
- Stap-1-breedte van **760 → 640px** (interesses staan standaard ingeklapt, dus de
  "Ik ben…"-2×2 mag compacter). Stap 2 blijft 1040.

### Gedaan
- [x] `maxWidth` stap 1: 760 → 640 (comment bijgewerkt).
- [x] Adres-zoeksubregel ("We zoeken alle regelingen…") op mobiel verborgen via
      `hidden sm:block` (nieuw veldje `subVerbergMobiel` op de kop-config); de
      "Nog één stap"-subregel (bekend adres) blijft op alle schermen staan.
- [x] Verificatie: `tsc` schoon · `eslint` op het bestand schoon (baseline 11 err/8 warn
      ongewijzigd, in níet-aangeraakte bestanden) · 49/49 vitest · `bun run build` groen.

### Bewust NIET gedaan
- Interesse-chips op echte mobiel vallen (gerekend, 360px) in ~4 regels i.p.v. ≤3;
  "Warmtenet-aansluiting"/"Isolatie & glas" zijn de brede labels. Omdat de chips op mobiel
  achter de opt-in-uitklap zitten, acceptabel gelaten. Kortere mobiele labels zouden de
  gedeelde `MAATREGEL_LABELS` raken → alleen op verzoek.

## Social preview / deel-kaart subsidiecheck (2026-07-15)

Branch: `feat/subsidiecheck-social-preview`. Aanleiding: de "Deel de tool"-knop op
het resultaat toonde in WhatsApp alleen kale tekst + link, geen preview-kaart.

### Diagnose (op productie geverifieerd met curl + WhatsApp-UA)
- `voortraject.nl/subsidiecheck` gaf 200 mét OG-tags, en de `og:image` was bereikbaar
  — technisch dus "geldig". Tóch geen kaart, omdat:
  1. De afbeelding was een **Lovable-restje: 568 KB op een extern `…r2.dev`-domein**.
     WhatsApp toont previews boven ~300 KB en/of cross-domain vaak niet.
  2. `og:url` en `og:image:width/height` ontbraken.
- Extra: WhatsApp **cachet per URL** lang → na de fix testen met een verse URL (`?v=2`).

### Gedaan
- [x] Eigen gebrande deel-kaart `public/og/voortraject-subsidiecheck.jpg` (1200×630, **96 KB**):
      hero-adviesgesprek-foto + navy-scrim + wit woordmerk + oker accent +
      "Gratis subsidiecheck". Gerenderd via headless Chrome (2×) + ImageMagick.
- [x] `index.html`: Lovable-URL vervangen door de eigen afbeelding; volledige tags
      toegevoegd (`og:url`, `og:site_name`, `og:locale`, `og:image:width/height/alt/type`).
- [x] `Seo.tsx`: `og:image`/`twitter:image`/`twitter:card`/`og:site_name` toegevoegd,
      met optionele `image`-prop (voor latere per-pagina kaarten = Tier 2).
- [x] `StapResultaat.tsx`: deeltekst ingekort/betrouwbaarder gemaakt (emoji weg).

### Bewust (nog) NIET gedaan
- **Tier 2 (per-pagina kaart via Cloudflare Pages Function).** Nu 1 sitebrede kaart:
  elke gedeelde link toont de subsidiecheck-kaart. Prima voor de deel-knop; homepage
  toont dan óók die kaart. Optioneel later opsplitsen.

### Na deploy (productie) — testen
1. Cloudflare-deploy afwachten. 2. Facebook Sharing Debugger de URL laten her-scrapen.
3. In WhatsApp `voortraject.nl/subsidiecheck?v=2` delen (cache-bust) → kaart moet verschijnen.

## Subsidiechecker — conversietool (2026-07-12)

Branch: `feat/subsidiecheck` (langlopende feature-branch, meerdere dagen; regelmatig
`main` erin mergen tegen drift). **Nog niet gebouwd — dit is het plan.**

### Doel
Een postcode-gedreven subsidiechecker die bezoekers naar de site trekt en omzet in leads.
Bezoeker vult postcode (+ huisnummer) in → ziet in één rustig overzicht álle relevante
verduurzamingssubsidies (landelijk + provinciaal + gemeentelijk) voor heel Noord-Nederland.

**Leidend principe: value-first, conversie-tweede.** De tool verdient vertrouwen door écht
nuttig te zijn; de CTA is "wij nemen het uitzoek- en aanvraagwerk van je over", nooit
"koop nu". Kalme, betrouwbare huisstijl (institutional B2B) — geen hype, geen "GRATIS GELD".

### Databron-strategie (belangrijk)
- Data komt van een **externe, onderhouden bron** (voorkeur: Milieu Centraal /
  Energiesubsidiewijzer API — gratis, CC-0, gezaghebbend; mail is verstuurd, wachten op
  whitelist + docs). Bevestigd dat die bron voor een Emmen-adres rijk + provincie + gemeente
  teruggeeft.
- **We bouwen achter een adapter zodat de bron verwisselbaar is** en we NIET op de mail
  hoeven te wachten. Alleen de laatste bekabeling (endpoint/auth/veldnamen) wacht.
- Fallback-bronnen indien Milieu Centraal afwijst: Altum AI Subsidies API (betaald) of eigen
  gecureerde DB (ruggengraat: landelijk + Nij Begun/SNN + provinciaal). Zie geheugen
  `business-scope-noord-nederland` en `supabase-crm-only-active`.

### Architectuur — adapterlaag (`src/lib/subsidies/`)
- `types.ts` — `SubsidieNiveau = 'rijk' | 'provincie' | 'gemeente' | 'overig'`;
  `SubsidieResultaat { id, titel, niveau, omschrijving, bedragIndicatie?, bronUrl, aanbieder }`;
  `SubsidieCheckInput { postcode, huisnummer, bewonertype, maatregelen[] }`;
  `Bewonertype = 'woningeigenaar' | 'huurder' | 'vve' | 'verhuurder'`.
- `provider.ts` — interface `SubsidieProvider { check(input): Promise<SubsidieResultaat[]> }`.
- `mockProvider.ts` — realistische mockdata in het Verbeterjehuis-formaat, met
  postcode-afhankelijke variatie (Groningen→Nij Begun/SNN, Drenthe→provinciale/gemeentelijke,
  landelijk altijd ISDE/Warmtefonds). Zodat de hele flow nu al echt werkt.
- `milieuCentraalProvider.ts` — stub, in te vullen zodra docs binnen zijn.
- `index.ts` — exporteert de actieve provider (één plek om te wisselen: mock → echt).
- `useSubsidieCheck` hook (react-query) om provider te wrappen: caching, loading, error.

### Herbruikbare bouwstenen (bestaan al)
- **PDOK adres-lookup** staat al in `Contact.tsx` (`lookupAdres`, `POSTCODE_RE`,
  `normalizePostcode`). → **Refactor naar `src/lib/pdok.ts` + `usePdokAdres` hook** en laat
  zowel Contact als Subsidiecheck die delen (DRY, één implementatie).
- **Lead-insert** gaat al naar `supabaseExternal.from("leads_bewoners").insert({...})` met
  velden tenant_id, naam, email, telefoon, postcode, huisnummer, toevoeging, straat, stad,
  notities, bron, status. → Hergebruiken met `bron: "Subsidiecheck"`; geselecteerde
  maatregelen + gevonden subsidies in `notities`. **Exact dezelfde tabel/kolommen — niet
  hernoemen** (data-integriteit, CLAUDE.md-regel 2).
- `CtaButton`, `Seo`, sectiepatronen, design-tokens (`text-accent`, `text-primary`,
  `bg-secondary`, `bg-card-soft`).

### UX-flow (elk detail)
**1. Homepage-instappunt — sectie direct ónder `LogoCarousel`** (nieuw
`src/components/sections/SubsidiecheckCta.tsx`, ingevoegd in `Index.tsx` tussen
`<LogoCarousel/>` en `<Herkenning/>`):
- Rustige sectie (bijv. `bg-secondary` sand of `bg-card-soft` cream, contrast met witte strip).
- Kop: "Ontdek welke subsidies er voor jouw woning zijn". Subregel: "Vul je postcode in en
  zie in één overzicht alle regelingen — landelijk, provinciaal én van jouw gemeente."
- **Inline postcode + huisnummer-veld direct in de sectie** + knop "Bekijk mijn subsidies →".
  Start de flow al op de home; navigeert naar `/subsidiecheck?pc=…&hn=…` (voorinvullen).
- Subtiele trust-cue: "Gratis · geen account nodig · klaar in 1 minuut". Klein, niet schreeuwerig.

**2. Hero secundaire CTA** — op de plek van "Of bel direct: 050 211 2689" in `Hero.tsx` komt
"Check jouw subsidies" (zelfde outline/secundaire stijl, concurreert niet met de gouden
"Plan een gratis gesprek"). Telefoon blijft bereikbaar via de header-pill + WhatsApp-knop.
→ *Beslispunt bevestigd met opdrachtgever: telefoon-CTA hier vervangen is akkoord.*

**3. De tool — `/subsidiecheck` (nieuw `src/pages/Subsidiecheck.tsx`)**, lichte stapper met
voortgangsindicator (afrondingspsychologie), mobile-first, tapdoelen ≥44px:
- **Stap 1 — Adres:** postcode + huisnummer (voorgevuld vanaf home). PDOK bevestigt zichtbaar
  ("Kerkstraat 12, Groningen ✓") → vertrouwen + minder fouten. Duidelijke, vriendelijke
  foutmeldingen bij geen match.
- **Stap 2 — Situatie (kort houden = hogere completion):**
  - Type bewoner (woningeigenaar/huurder/VvE/verhuurder) als grote tapbare kaarten, geen dropdown.
  - Maatregelen van interesse (isolatie, warmtepomp, zonnepanelen, ventilatie, …) als
    multi-select chips. **Default "toon alles"** zodat een luie gebruiker tóch resultaat krijgt.
  - Niet méér vragen dan de bron nodig heeft (Verbeterjehuis gebruikt enkel postcode +
    bewonertype + maatregelfilters — geen bouwjaar/woningtype forceren).
- **Stap 3 — Resultaat (de payoff):**
  - Kopregel: "We vonden X regelingen voor jouw adres."
  - Scanbare lijst, **gegroepeerd per niveau** (Rijksoverheid / Provincie / Gemeente / Overig)
    met gekleurde labels zoals Verbeterjehuis. `SubsidieCard`: titel + niveau-tag + 1 regel
    uitleg + indicatief bedrag (indien beschikbaar) + "Meer info" → officiële bron.
  - Skeleton-loading tijdens ophalen; nette empty- en error-state.
- **Conversie aan het eind (kalm, contextueel):**
  - Primair: "Subsidies stapelen is ingewikkeld — wij regelen de aanvraag gratis voor je.
    → Plan een gratis gesprek" (`CtaButton` naar `/contact`).
  - Zacht (minst commercieel, hoogste opbrengst): **"Mail mij dit overzicht"** — vangt e-mail
    + adres → `leads_bewoners` (`bron: "Subsidiecheck"`). Lage drempel, hoge waarde, voedt CRM.

### Conversie zonder commercieel te ogen
- Waarde vóórop (het overzicht), CTA als hulp geframed, niet als verkoop.
- Twee conversieroutes: gesprek (warm) + e-mail-overzicht (zacht) — beide naar CRM met
  onderscheidende `bron`.
- Snelle resultaten, voortgangsbalk, grote tapdoelen, één kolom op mobiel.

### Taken per fase
**Fase 0 — Scaffolding**
- [x] Adapterlaag `src/lib/subsidies/` (types, provider-interface, mockProvider, index)
- [x] `useSubsidieCheck` hook (react-query)
- [x] Refactor PDOK naar `src/lib/pdok.ts` + `usePdokAdres`; Contact.tsx laten hergebruiken
- [x] Route `/subsidiecheck` in `App.tsx` + pagina (Header/Seo/Footer)

**Fase 1 — De flow (mockdata, volledig gestyled)**
- [x] Stapper + voortgangsindicator, focus-management tussen stappen
- [x] Stap 1 Adres (PDOK-bevestiging), Stap 2 Situatie (kaarten + chips), Stap 3 Resultaat
- [x] `SubsidieCard` + groepering per niveau + laadsequentie/empty/error-states
- [x] Extra's na review opdrachtgever: pill-verfijning home (velden #F5F3ED, streepje weg),
      postcode auto-hoofdletters + autosprong, "situatie aanpassen" op resultaat,
      maatregel-tags op kaarten, kopieer-link naar overzicht
- [x] Feedbackronde 2 (2026-07-12): toevoeging-veld ook in de homepage-pill (loopt mee als
      `tv` in de deeplink); sitewide `ScrollToTop` in App.tsx — SPA behield scrollpositie
      bij navigatie, dus wie vanaf de home-CTA (onder de vouw) doorklikte landde onderaan
      /subsidiecheck. Push/replace → naar boven, back-knop (POP) blijft hersteld. Headless
      geverifieerd: na submit scrollY 0 + `tv` in URL, na back scrollY 974 hersteld,
      mobiel 390px geen overflow.

**Fase 2 — Instappunten**
- [x] Homepage-sectie `SubsidiecheckCta` onder `LogoCarousel` (inline postcode → deeplink)
- [x] Hero secundaire CTA "Check jouw subsidies" i.p.v. "Of bel direct"
- [x] Nav: uitgelicht item in `Subsidies`-dropdown (icoon + "Tool"-label + divider) — desktop
      én mobiel menu in `Header.tsx`

**Fase 3 — Lead capture**
- [x] "Mail mij dit overzicht" → `leads_bewoners` (bron "Subsidiecheck", maatregelen+aantal in
      notities), zelfde validatie/honeypot-patroon als Contact.tsx
- [x] Consent-aware GTM-events in code (`src/lib/gtm.ts`): `subsidiecheck_start` (adres
      bevestigd), `subsidiecheck_voltooid` (resultaat, incl. aantal/bewonertype/gemeente/
      provincie), `subsidiecheck_lead` (mail-overzicht) — géén persoonsgegevens in de events
- [ ] **GTM-container inrichten (klikwerk op tagmanager.google.com, container GTM-P6W5MNN4;
      kan los van de site-deploy, ~10 min):**
      1. *Triggers* (type "Aangepaste gebeurtenis"): `subsidiecheck_start`,
         `subsidiecheck_voltooid`, `subsidiecheck_lead`
      2. *Gegevenslaagvariabelen*: `aantal_regelingen`, `bewonertype`, `gemeente`, `provincie`
      3. *GA4-gebeurtenistags* (3×): zelfde eventnamen, parameters uit stap 2 meesturen,
         gekoppeld aan de triggers uit stap 1 — vereist bestaande GA4-basistag (meet-ID
         `G-…`); zo niet, eerst GA4-property + Google-tag aanmaken
      Daarna testen via Voorbeeld-modus (werkt ook op localhost, eerst Axeptio accepteren)
      en publiceren.

**Fase 4 — Polish & verificatie**
- [x] A11y: semantische stappen, `aria-live` op resultaat, focus naar kop bij stapwissel, labels
- [x] SEO: `/subsidiecheck` meta + opgenomen in `scripts/generate-sitemap.ts`
- [x] Tests (vitest, 12): adapter groepeert/filtert correct; postcodevalidatie
- [x] `prefers-reduced-motion`, headless visuele verificatie desktop + mobiel (zie geheugen)
- [x] Typecheck + `bun run build` groen; lint 0 nieuwe issues (20 pre-existing)

**Fase 5 — Echte bron inpluggen (wacht op Milieu Centraal)**
- [ ] `milieuCentraalProvider` invullen (endpoint/auth/veldnamen), provider omwisselen in `index.ts`
- [ ] Verifiëren tegen echte responses (postcodeniveau vs adresniveau bevestigen)
- [ ] E-mailverzending voor "Mail mij dit overzicht" (edge function of handmatig vanuit CRM
      binnen 24u — zolang dat niet geregeld is belooft de UI iets dat het team moet waarmaken)

### Resultaatpagina-herontwerp na CRO/psychologie-analyse (2026-07-12)
Kritische analyse (eigen frisse blik + onderzoek naar bezoekerspsychologie: NN/g,
Baymard, peer-reviewed labor-illusion/peak-end/goal-gradient, live vergelijk met
Verbeterjehuis/Independer/Gaslicht). Doel: de meest gebruiksvriendelijke, duidelijke en
overzichtelijke subsidiewijzer van Noord-Nederland. Alles op mockdata; verdwijnt/wisselt
mee zodra de echte provider is aangesloten. **Doorgevoerd:**
- **Datamodel** (`types.ts`): `SubsidieType = 'subsidie' | 'lening'` + `type` op elke
  regeling; optionele `voorWie` + `belangrijksteVoorwaarde` (uitklap-verdieping);
  `maakSamenvatting()` (aantal, subsidie/lening-split, per-niveau — **bewust géén verzonnen
  totaalbedrag**, niet verdedigbaar op mock/niet-stapelbaar); `NIVEAU_KORT` + `TYPE_LABELS`;
  `NIVEAU_LABELS.overig` → "Leningen en overig".
- **Samenvattingskaart** (nieuw `Samenvatting.tsx`) bovenaan het resultaat = de piek
  (inverted pyramid + peak-end): groot aantal (cijfers stoppen het oog), situatie
  teruggekoppeld ("voor jouw koopwoning in Groningen", endowment), subsidie/lening-split,
  niveaulegenda die dubbelt als kleurcode voor de kaarten, de keuzestress-wegnemende zin
  ("je hoeft niets te kiezen, veel is te combineren, wij zoeken het uit"), en een
  "Mail mij dit overzicht"-quicklink die naar het formulier scrollt + het e-mailveld focust.
- **SubsidieCard herontworpen**: type-kicker (SUBSIDIE muted / **LENING** terracotta —
  lost de "€ 71.000 lening leest als subsidie"-val op), bedrag op vaste plek rechtsboven
  (verticaal scanbaar), body 14→15px (45+-leesbaarheid), maatregelen als rustige leesregel
  i.p.v. chips (leken op de klikbare filterchips), en een **uitklap** (drielagenmodel
  Independer: beslissen → begrijpen → verifiëren) met Voor wie / Belangrijkste voorwaarde /
  combineerbaarheid / officiële bronlink. Kaartactie links uitgelijnd op mobiel (uit de
  WhatsApp-hoek).
- **StapResultaat herstructureerd**: groepen nu gestápeld (landelijk → lokaal, layer-cake)
  met kaarten 2-koloms binnen een groep i.p.v. groepen naast elkaar; conversieblok met
  endowed-progress ("Stap 1 is klaar"), mail-CTA met meerwaarde (incl. aanvraaglinks),
  gesprek-CTA met geruststellende microcopy (Vrijblijvend · Reactie binnen 24 uur · Lokaal
  adviesteam); **disclaimer weg van de allerlaatste plek** (nu naast de kopieer-link), pagina
  eindigt **warm** ("Veel regelingen blijven onbenut. Jij bent nu een stap verder…").
- **Sitewide `ScrollToTop`** (eerder deze sessie) + pagina bottom-padding `pb-28` op mobiel
  voor WhatsApp-FAB-clearance.
- **Bewust NIET gedaan (met reden):** geen resultaten achter e-mail gaten (vertrouwen +
  positionering); geen hype-totaalanker; **sticky mobiele mail-balk overgeslagen** omdat die
  botst met de vaste WhatsApp-knop (twee zwevende dingen rechtsonder = rommelig voor een
  "kalme" merk) — de mail-quicklink in de samenvatting dekt de vroege toegang af; button-copy
  "Plan een gratis gesprek" blijft (sitewide één-CTA-regel > eerste-persoon-winst hier);
  numerieke sortering binnen groepen uitgesteld tot echte data (relevantie-metadata); geen
  verzonnen review-sterren (feitelijke trust-microcopy i.p.v.).
- **Geverifieerd:** `tsc` schoon; 12/12 vitest groen; lint 0 nieuwe meldingen (nieuwe
  bestanden 0, totaal blijft 20 pre-existing); `bun run build` groen; headless CDP desktop +
  mobiel (samenvatting/kaarten/conversie/warm slot correct, LENING-badge terracotta, geen
  390px-overflow) + interactietest (mail-knop scrollt naar & focust e-mailveld; uitklap toont
  voorwaarde + officiële link met aria-expanded).

### ▶ STATUS 2026-07-13 — live-brug gebouwd, hier verdergaan
De bouw tegen de echte bron werkt lokaal. **Af (op `feat/subsidiecheck`, gepusht):**
- Parser `src/lib/subsidies/energiesubsidiewijzer.ts` (25/25 tests, fixtures in `src/test/fixtures/`).
- Provider `energiesubsidiewijzerProvider.ts` actief in `index.ts`; DEV via Vite-proxy `/esw`
  (`vite.config.ts`) + client-side detail-verrijking; terugval op mock. Lokaal geverifieerd:
  18 echte regelingen voor 9742HJ mét bedragen.

**Resterende stappen om live te gaan (akkoord "helemaal afmaken"):**
1. [x] **Edge function** (CRM-project `lfelnfukbrxznkevnevr`) — GEBOUWD 2026-07-13, nog te deployen.
2. [x] **E-mail**: keuze = **automatisch via Resend** — GEBOUWD 2026-07-13, nog te deployen + DNS.
3. [ ] **GTM-container**: 3 triggers / 4 variabelen / 3 tags (zie Fase 3-blok). Klikwerk.
4. [ ] **`main` mergen** in de branch → PR → review → merge (productie via Cloudflare).

#### ▶ STATUS 2026-07-13 (2e sessie) — edge functions + Resend gebouwd, klaar om te deployen
Twee Deno-edge-functions in `supabase/functions/` (gaan naar het **CRM**-project; `config.toml`
`project_id` → `lfelnfukbrxznkevnevr` gezet):
- **`subsidiecheck`** — databrug: haalt serverside de Energiesubsidiewijzer op, parset + verrijkt
  (bedrag/voorwaarde/officiële bron, concurrency-limiet 6) + **in-memory cache** (lijst 12u,
  detail 24u) + open CORS, levert JSON. Parser is een **zelfstandige kopie** van
  `src/lib/subsidies/energiesubsidiewijzer.ts` + `types.ts` mét `.ts`-imports (Deno eist extensies);
  kopie is regel-identiek aan de bron (bij parserwijziging: sync!). Geen secrets, geen DB.
- **`subsidiecheck-mail`** — schrijft de lead (service_role, exact `leads_bewoners`-kolommen) én
  stuurt de bezoeker het overzicht via **Resend** (nette HTML-mail in huisstijl, gegroepeerd per
  niveau, CTA → /contact, teamkopie via `MAIL_BCC`). Lead is leidend: mail-hapering verliest nooit
  een lead (`ok:true` zolang de lead staat). Secrets: `RESEND_API_KEY`, `MAIL_FROM`, `MAIL_BCC?`,
  `MAIL_REPLY_TO?`, `SITE_URL?`.

Frontend-bekabeling (met stille terugval, zoals google-reviews):
- Provider: `VITE_SUBSIDIECHECK_URL` gezet → JSON via function; anders DEV-proxy `/esw` +
  client-verrijking; faalt de bron → mock. Aanroep stuurt CRM-anon-key als `apikey`-header mee
  (gateway-eis, ook bij verify_jwt=false).
- `MailOverzicht`: `VITE_SUBSIDIECHECK_MAIL_URL` gezet → function (mail+lead); anders directe
  client-insert (lead zonder mail). Zo breekt niets vóór deploy.
- `.env.example` bijgewerkt met beide publieke function-URLs. Anon-key + URL geëxporteerd uit
  `external-client.ts`.
- Geverifieerd: 25/25 tests, tsc/lint/build groen, 4 Deno-bestanden syntax-valide (esbuild),
  DEV-proxy levert 18 kaarten. Deno `deno check` NIET lokaal gedraaid (Deno niet geïnstalleerd) —
  gebeurt bij deploy.

**DEPLOY-STAPPEN (mens, met Supabase-toegang) — zie de sessie-samenvatting / hieronder:**
A. Resend: account → domein voortraject.nl verifiëren (DKIM/SPF DNS) → API-key.
B. Supabase-secrets (CRM-project) zetten: RESEND_API_KEY, MAIL_FROM="Voortraject <noreply@voortraject.nl>",
   MAIL_BCC=info@voortraject.nl, MAIL_REPLY_TO=info@voortraject.nl, SITE_URL=https://www.voortraject.nl.
C. `supabase functions deploy subsidiecheck --project-ref lfelnfukbrxznkevnevr` (idem `subsidiecheck-mail`).
D. Env-vars in Cloudflare Pages (+ lokale .env): VITE_SUBSIDIECHECK_URL + VITE_SUBSIDIECHECK_MAIL_URL
   = `https://lfelnfukbrxznkevnevr.supabase.co/functions/v1/<naam>`. Redeploy site.
E. Test: `curl ".../functions/v1/subsidiecheck?postalcode=9742HJ"` → JSON; formulier op de site →
   mail ontvangen + lead in CRM.

### ▶ DRAAIBOEK: oppakken zodra de Milieu Centraal-API binnen is (status 2026-07-12)
**Waar alles staat.** Branch `feat/subsidiecheck` (gepusht naar origin, 25 commits, GEEN
PR — bewust: pas live mét echte data). Bouw is af t/m polish; mock levert voorbeelddata
met zichtbare gele melding op de resultaatpagina (verdwijnt automatisch bij echte provider).

**Brononderzoek 2026-07-12 (belangrijk — plan bijgesteld):**
- De XML-webservice uit de data.overheid.nl-catalogus (`energiesubsidiewijzer.nl/
  Energiesubsidiewijzer.svc`) is **opgeheven**: 301-redirect naar verbeterjehuis.nl. De
  catalogus-entry is verouderd. Er is dus géén losse XML/SOAP-API meer.
- Wél werkt **nu, publiek, zonder key, CC-0**: `GET https://www.verbeterjehuis.nl/
  energiesubsidiewijzer?postalcode=<PC6>` geeft een server-rendered resultaatpagina
  (voor 9742HJ: 18 kaarten). Schone, parsebare HTML per kaart:
  - titel: `h2.register-card__title`
  - niveau: `span.register-card__label--{national-government|municipality|other}`
    (→ Rijksoverheid/Gemeente/Overige aanbieders; **let op:** hun taxonomie kent geen
    losse "provincie" — SNN/Nij Begun valt bij hen onder Rijksoverheid. Mapping-keuze
    maken; onze `provincie`-groep blijft mogelijk leeg of we reclassificeren op aanbieder.)
  - type: kaart in `#register-subsidies` = subsidie, in `#register-loans` = lening
  - omschrijving: `span.register-card__body`; detail-link = de `href` van de kaart
  - **bedrag + voorWie + belangrijksteVoorwaarde + officiële externe bronlink staan NIET
    op de lijst** — die zitten op de detailpagina per regeling (N+1 fetches nodig).
- **Aanpak:** edge function in het CRM-Supabaseproject die serverside de HTML ophaalt +
  parset naar `SubsidieRegeling[]` (voorkomt CORS + houdt scraping van de client). De
  frontend-`milieuCentraalProvider` roept die function aan. Cachen (dag) tegen fragiliteit.
- **Afweging:** HTML-parsen is fragiel (markup kan wijzigen) en is technisch de "achterdeur"
  die dit draaiboek eerder wilde vermijden — maar de data is officieel open (CC-0), dus
  juridisch prima. Beste plan: **bouw nu tegen de HTML als brug** (dan zijn we niet meer
  geblokkeerd), en houd de nette REST/JSON-koppeling (mail naar Milieu Centraal) als
  robuustere einddoel. De provider-interface maakt later omwisselen triviaal.

**Stap 1 — API aansluiten (~dagdeel):**
1. Maak `src/lib/subsidies/milieuCentraalProvider.ts` conform interface in `provider.ts`
   (naam ≠ "Voorbeeldgegevens", anders blijft de voorbeelddata-melding staan).
2. Map hun categorieën → onze `Maatregel`-types (types.ts) en niveaus → `SubsidieNiveau`.
   **Ook verplicht per regeling:** `type` (`'subsidie' | 'lening'` — bepaalt het kaartlabel
   én de subsidie/lening-split in de samenvatting; leningen ≠ subsidies). Optioneel maar
   aanbevolen: `voorWie` + `belangrijksteVoorwaarde` (vullen de kaart-uitklap; zonder deze
   toont de uitklap alleen de combineerbaarheid + bronlink).
   Check: postcode-only bevestigd; monument-parameter meenemen als de API die kent.
3. Wissel om in `src/lib/subsidies/index.ts` (één regel). API-key? Dan NIET client-side
   als die geheim moet blijven → edge function als proxy in het CRM-Supabaseproject.
4. Verifieer met echte adressen: Groningen-stad, Emmen, Leeuwarden, Randstad-adres
   (buiten werkgebied), huurder, VvE. Vergelijk met verbeterjehuis.nl/energiesubsidiewijzer.
5. `bun run test` (pas mock-tests aan indien nodig), lint/tsc/build, headless visueel
   (zie geheugen: Chrome clampt width op ~500px).

**Stap 2 — Go-live-checklist:**
- [ ] E-mailverzending geregeld (edge function + Resend + SPF/DKIM, óf werkafspraak
      handmatig <24u vanuit CRM) — de mail is de primaire CTA-belofte
- [ ] GTM-container ingericht (zie Fase 3-blok hierboven: 3 triggers, 4 variabelen, 3 tags)
- [ ] `main` in de branch mergen (branch is van 2026-07-12; drift wegwerken)
- [ ] PR openen → review → merge (main = productie via Cloudflare Pages)
- [ ] Na livegang: GTM realtime checken + een echte testlead door CRM zien lopen

**Fallback als Milieu Centraal afwijst:** Altum AI Subsidies API (betaald, zelfde
provider-interface) of eigen gecureerde DB in het CRM-Supabaseproject (zie geheugen
`supabase-crm-only-active`). Mail verstuurd 2026-07-12; reminder rond 20 juli als stil.

### Suggesties uit vergelijk met Verbeterjehuis (2026-07-12)
- **Energiesubsidiewijzer werkt op postcode-only (PC6), bevestigd** door hun aanvraagform.
  Ons huisnummer blijft voor het vertrouwensmoment (adresbevestiging) + leadkwaliteit,
  niet voor het resultaat.
- [ ] **Monument-vinkje** ("Mijn woning is een monument") — zij vragen het; afwijkende
      regels/regelingen. Meenemen in **Fase 5** als de API de parameter ondersteunt; tot
      die tijd adviseur-territorium.
- [x] Optioneel toevoeging-veld in stap 1 — gebouwd (2026-07-12): verfijnt de PDOK-match,
      loopt mee in URL (`tv`), adres-pill, resultaatkop en de lead (`toevoeging`-kolom).
- **Chips-lijst bevestigd (8)** na vergelijk met hun 18 filteropties: bewust weggelaten:
  kleine maatregelen, gasaansluiting verwijderen, energieadvies (concurreert met eigen
  gratis advies!), zonwering, vergroenen-tak, proces ondersteuning. Asbest verwijderen =
  "misschien later" (agrarisch Noord-NL, combi met dakisolatie). Airco heeft geen eigen
  chip nodig: ISDE schaart warmtepomp-airco's onder warmtepomp.
- Verbetercheck ≠ Energiesubsidiewijzer: hun 15+-vragen-wizard rekent subsidiebedragen per
  maatregel uit; bewust NIET nabouwen (botst met "klaar in 1 minuut" — onze CTA/adviseur ís
  de verdieping). Hun "prefill + pas aan"-patroon doen wij al via PDOK (gemeente/provincie
  zonder vraag). Sticky samenvattings-zijbalk: bewaren voor eventuele rekenlaag later.

### Open beslissingen / risico's
- Granulariteit bron: Verbeterjehuis-URL gebruikt alleen `postalcode` (geen huisnummer) →
  waarschijnlijk PC6-niveau. Huisnummer dan vooral voor adresbevestiging + lead. Bevestigen bij docs.
- Geen ongesanctioneerde website-URL van Milieu Centraal als "achterdeur-API" in productie.
- Data-integriteit: `leads_bewoners`-schema is een gedeelde CRM-tabel — kolommen exact
  overnemen zoals in Contact.tsx (geverifieerd), geen nieuwe velden zonder bevestiging.

### Review (2026-07-12 — Fase 0 t/m 4 af, flow werkt end-to-end op mock)
- **Gebouwd:** adapterlaag (`src/lib/subsidies/`: types, provider-interface, mockProvider
  met regiofiltering op PDOK-gemeente/-provincie), hooks `usePdokAdres` +
  `useSubsidieCheck` (react-query), PDOK gedeeld via `src/lib/pdok.ts` (Contact.tsx
  gerefactord, gedrag identiek), pagina `/subsidiecheck` met stapper (state volledig in
  URL → back-button, herladen en delen werken), homepage-sectie `SubsidiecheckCta`,
  hero-CTA "Check jouw subsidies" (i.p.v. "Of bel direct"), uitgelicht Tool-item in de
  Subsidies-dropdown (desktop + mobiel), "Mail mij dit overzicht" → `leads_bewoners`
  (bron "Subsidiecheck"), sitemap-entry.
- **Geverifieerd:** 12/12 vitest groen (filtering, groepering, postcodevalidatie);
  tsc schoon; build groen (sitemap 15 entries); lint 0 níeuwe issues (20 pre-existing,
  identiek met/zonder deze diff); headless visueel: stap 1→2→3 op desktop én mobiel,
  met échte PDOK-lookup (Emmen: rijk + provincie + 2× gemeente + Warmtefonds correct
  gegroepeerd). Gotcha vastgelegd: Chrome headless clampt window-width op ~500px.
- **Bewust buiten scope gelaten:** de 20 pre-existing lint-issues; verwijderde
  `christian-bellen.webp` in de working tree (was al zo, niet van deze taak; niet
  gecommit).
- **Open voor merge:** consent-aware GTM-event (Fase 3-restje), e-mailverzending
  overzicht, echte Milieu Centraal-provider (Fase 5). Mock is als bron zichtbaar
  ("Voorbeeldgegevens") dus niet stiekem.

## Google Reviews auto-sync op de home (2026-07-09)

Branch: `feat/google-reviews-sync`. Vervangt de handmatige review-array door een
automatische sync met onze Google-reviews. Huisstijl blijft 100% identiek.

### Aanpak (na sparren met de opdrachtgever)
- **Bron:** Google **Places API (New)** — Place Details (max 5 reviews, Google-gekozen).
  Business Profile API (OAuth + Google-goedkeuring) is **niet** nodig: het ontwerp is
  "toon 5 mooie + doorklikken naar Google", dus de 5-limiet is geen probleem, ook niet
  bij 100+ reviews later.
- **Fetch loskoppelen van render:** een **Supabase Edge Function** haalt op (API-key blijft
  server-side), **filtert >= 4 sterren**, sorteert nieuwste, schrijft naar Supabase. De
  frontend leest uit Supabase → geen third-party script client-side (consent/perf/SEO/AVG
  blijven schoon).
- **Dagelijkse cron** (~30 calls/mnd → ruim binnen gratis tier; quota-cap als harde garantie).
- **Fallback:** zolang de backend niet geactiveerd is (of bij fout / < 2 reviews) toont het
  component de huidige hardcoded reviews. De site kan dus niet breken.
- **"Alle reviews op Google"-knop** → doorklikken naar de volledige reviewpagina.

### Taken
- [x] SQL-migratie: `google_reviews` + `google_place_stats` (RLS: alleen publiek lezen)
- [x] Edge Function `sync-google-reviews` (Places API New, filter >=4, upsert + prune)
- [x] `config.toml` functie-entry (`verify_jwt = false`) + `.env.example` publieke URL
- [x] Hook `useGoogleReviews` (leest Supabase, stil terugvallen bij fout)
- [x] `Reviews.tsx` data-driven maken met fallback + Google-knop
- [x] Typecheck + lint + build groen
- [ ] Commit, push, PR met activatie-checklist

### Activatie (handmatige stappen voor Voortraject — NA merge, buiten deze PR)
1. Google Cloud Console: **quota-cap** op de Places API (bv. 100/dag) + **budget-alert (EUR 1)**.
2. Supabase secrets: `GOOGLE_MAPS_API_KEY` + `GOOGLE_PLACE_ID` zetten.
3. Migratie toepassen + Edge Function deployen; daarna **Supabase types regenereren**
   (dan kunnen de `any`-casts in de hook weg).
4. Dagelijkse cron op de functie inschakelen.
5. `VITE_GOOGLE_REVIEWS_URL` in de omgeving zetten (publieke Google-reviewpagina).

### Review (2026-07-09)
- **Projectkeuze (belangrijk):** de reviews leven in het **CRM-project**
  (`lfelnfukbrxznkevnevr`) via `supabaseExternal`, NIET in het oude Lovable-website-
  project (`zvsmazjcfzjyvnjrlnma`) dat de opdrachtgever niet meer gebruikt. Expliciet
  akkoord gegeven op 2026-07-09 om (alleen-lezen) reviewtabellen in CRM te zetten.
  De hook is daarom omgezet van `supabase` → `supabaseExternal`; casts vervielen
  (die client is ongetypeerd).
- **Veiligheidsprincipe geborgd:** de frontend valt stil terug op de hardcoded
  reviews zodra de query faalt (tabel bestaat nog niet, netwerk, < 2 reviews). Tot
  activatie toont de site dus exact de huidige 3 reviews — merge kan niets breken.
- **Nieuwe/gewijzigde bestanden:**
  - `supabase/migrations/20260709120000_google_reviews.sql` — 2 tabellen, RLS
    alleen-lezen voor anon (schrijven = service_role via de functie).
  - `supabase/functions/sync-google-reviews/index.ts` — Places API (New), FieldMask
    (kosten laag), filter >= 4, upsert op `google_review_id`, prune via `synced_at`.
  - `supabase/config.toml` — functie-entry `verify_jwt = false`.
  - `.env.example` — publieke `VITE_GOOGLE_REVIEWS_URL` (knop; geen secret).
  - `src/hooks/useGoogleReviews.ts` — leest Supabase, stil falen.
  - `src/components/sections/Reviews.tsx` — data-driven; huisstijl identiek.
- **Bewuste keuzes:**
  - Sterren tonen nu het **echte** aantal (4 of 5), niet altijd 5 — eerlijk.
  - Avatar heeft een **onError-vangnet**: breekt een Google-foto-URL, dan letter-avatar.
  - "Lees meer" is generiek per kaart (line-clamp-5) i.p.v. de oude vaste
    quote/vervolg-splitsing, omdat live reviewtekst variabele lengte heeft.
  - `any`-casts in de hook (tabellen staan nog niet in `types.ts`) — met
    `eslint-disable` per regel; verdwijnen zodra types na de migratie geregenereerd zijn.
- **Geverifieerd:** `tsc --noEmit` clean · `eslint` op gewijzigde files clean ·
  `bun run build` ok · `bun run test` groen. Live-pad (echte Google-data) pas te
  verifiëren na activatie (secrets + deploy); daarvoor is de activatie-checklist.

## Homepage-herbouw volgens sectieplan (2026-07-03)

Branch: `feat/homepage-herbouw`. Bron: gedetailleerd sectieplan van de opdrachtgever
(11 secties, vaste ritmiek). Systeemregels: sectiepadding exact 96px desktop / 64px mobiel
(= bestaande `.section-pad`), contentbreedte max 1200px (nieuwe `.container-home`),
achtergrondritme hero → wit → licht → wit → licht → wit → navy → wit → licht → wit → navy,
één CTA-stijl (goud, "Plan een gratis gesprek"), iconen in gouden cirkel, nergens de
formulering "geen commissie".

Foto-mapping: FOTO-HERO=`hero-adviesgesprek.webp` · FOTO-KEUKEN=`bewoners-keukentafel.webp`
· FOTO-HANDDRUK=`waarom-vertrouwen.webp` · FOTO-POLOS=`subsidies-uitzoeken.webp` ·
FOTO-SERRE=`hero-keukentafel.webp` en FOTO-TUIN=`herkenning-voortuin.webp` vervallen op home.

Linkbeslissingen (geen bestaande overzichtspagina's): tegel "Duurzame installaties" → geen
tegel-link maar 5 tekstlinks (spec-fallback); "Subsidies"-tegel en "Bekijk alle regelingen"
→ `/subsidies/stapelen`.

- [x] 0. `index.css`: `.container-home` (max 1200px) toevoegen
- [x] 1. Hero — ongewijzigd behouden (check: geen reviewclaim)
- [x] 2. Trustbar — `LogoCarousel` compact (±48px padding, één regel kleine tekst
      "Wij werken met alle officiële regelingen", grijstinten → kleur op hover)
- [x] 3. Probleemherkenning — `Herkenning.tsx` herschrijven: 3 kaarten, geen foto,
      kop "Verduurzamen zou niet zo ingewikkeld moeten zijn"
- [x] 4. Zo werkt het — `HelderPlan.tsx` herschrijven: FOTO-KEUKEN links, tijdlijn
      01/02/03 in goud, afsluitregel + CTA
- [x] 5. Waar we bij helpen — nieuw `WaarWeBijHelpen.tsx`: 3 tegels (Isolatie /
      Duurzame installaties / Subsidies), Onderhoud bewust niet
- [x] 6. Waarom Voortraject — `WaaromKiezen.tsx` herschrijven: 4 punten + FOTO-HANDDRUK,
      verdienmodel transparant (uitvoerder betaalt), "geen commissie"-claim eruit
- [x] 7. Reviews — nieuw `Reviews.tsx`: navy, 3 witte kaarten, Julian afgekapt met
      in-place "Lees meer", gelijke ingeklapte hoogte
- [x] 8. Subsidies stapelen — `Subsidies.tsx` herschrijven: kader met gouden accentrand,
      3 vinkjes, tekstlink + CTA
- [x] 9. Ons team — nieuw `Team.tsx`: FOTO-POLOS links, 3 zinnen, geen CTA
- [x] 10. FAQ — `Faq.tsx`: volgorde aanpassen, antwoord vraag 2 herformuleren
      (verdienmodel zonder "geen commissie"), vraag 4 check Groningen/Drenthe/Friesland
- [x] 11. Slot-CTA — ongewijzigd behouden
- [x] `Index.tsx`: nieuwe sectievolgorde
- [x] Eindcheck (headless Chrome tegen dev-server, 1440px + 375px): padding exact
      96/64/48, achtergrondritme conform spec, kaarthoogtes gelijk per rij
      (247/297/250), Julian-kaart 250→355 zonder vervorming van de andere twee,
      CTA-computed-styles identiek, FAQ-volgorde + nieuw antwoord gerenderd, geen
      horizontale overflow op 375px, alle interne links naar bestaande routes;
      vitest + vite build groen; lint alleen bestaande fouten in niet-aangeraakte
      bestanden
- [x] PR openen

### Review (2026-07-03)
- Alle 11 secties conform sectieplan; hero en slot-CTA onaangeraakt.
- "geen commissie" komt sitewide niet meer voor (was alleen homepage).
- FOTO-SERRE (`hero-keukentafel.webp`) en FOTO-TUIN (`herkenning-voortuin.webp`)
  nu ongebruikt op home, bewust in assets gelaten voor subpagina's.
- Linkkeuze: subsidie-overzicht bestaat niet als pagina → tegel + "Bekijk alle
  regelingen" wijzen naar `/subsidies/stapelen`. Verduurzamen-overzicht bestaat
  niet → tegel 2 niet klikbaar, 5 tekstlinks (spec-fallback).

## Bewonersgerichte website-ombouw (2026-07-02)

Bronnen: V3-handboek (identiteit/toon), CRO-rapport (diagnose), "Volledige website copy"
(bouwplan). Besluiten van de opdrachtgever:

- **Toon:** V3 is leidend (rustig, geen subsidie-FOMO/angst-framing), máár de conversielaag
  blijft sterk: prominente en herhaalde CTA's ("Plan een gratis gesprek" + risico-verlagende
  microtekst) op alle pagina's.
- **Aanspreekvorm:** je-vorm (consistent met huidige site en nieuwe copy).
- **Reviews:** voorlopig overslaan; komt in een latere fase zodra er echte reviews zijn.
- **Eigen foto's:** nog niet beschikbaar — bestaande beelden behouden tot de fotoshoot.

Fases (elk: eigen branch vanaf `main` → PR):

- [x] **Fase 1 — Homepage bewonersgericht** (`feat/home-bewoners`) — KLAAR, nog niet gemerged
  - [x] Header omgebouwd naar zwevende "pill"-stijl (DDJ-model): losse witte pills voor
        logo (blauwe variant), nav, telefoon + oker CTA; hero loopt er transparant achter door
  - [x] Hero: full-bleed foto-achtergrond + donkere gradient, witte H1 op twee regels
        ("Gratis advies over / verduurzamen en subsidies"), 3 korte vinkjes-claims
        (Lokaal adviesteam · Kennis van alle subsidieregelingen · Begeleiding tot de
        uitvoering klaar is), CTA "Plan een gratis gesprek" + belknop
  - [x] Sectie "Waar moet je beginnen?" (probleemherkenning, 4 tegels + foto + brugzin)
        → vervangt oude `ForWhom` (verwijderd)
  - [x] Sectie "Van twijfel naar een helder plan" (5 punten + foto)
  - [x] Subsidie-blok "Welke subsidies gelden er voor jouw woning?" — V3-getoetst (geen
        geld-FOMO), foto links + tekst rechts, stapel-highlight, CTA. De 3 regeling-kaarten
        zijn eruit; regelingpagina's blijven via het menu bereikbaar. Op `bg-secondary`.
  - [x] Sectie "Waarom bewoners voor ons kiezen" — onafhankelijkheidsbelofte uit FAQ naar
        voren (accent-rand), 4 redenen + begeleidingsregel + foto (handdruk) + CTA
  - [x] Instantie-logo's (`LogoCarousel`) behouden (opdrachtgever wil deze houden)
  - [x] "Hoe wij te werk gaan" (`HowWeWork`) VERWIJDERD (op verzoek)
  - [x] "Over ons"/team-sectie (`AboutTeam`) VERWIJDERD (externe CRM-groepsfoto; op verzoek)
  - [x] **Fase 1 afgerond:** eind-CTA (`ClosingCta`) herschreven → bewoner-first + V3-toon
        ("Snel duidelijkheid voor jouw woning", regie-zin "je bepaalt zelf wat je ermee
        doet"), risico-verlagende microtekst (Vrijblijvend · Binnen 24 uur reactie · niets
        voorbereiden) en kleine partnerverwijzing onderaan (link → `/uitvoerders`, wordt in
        Fase 2 `/partners`). Knop nu vaste CTA "Plan een gratis gesprek" (was "Plan een
        kennismaking"), token-classes i.p.v. inline hex.
  - [x] FAQ (`Faq.tsx`) → bewoner-first + je-vorm: dubbele-doelgroep-vraag ("Voor wie
        werken jullie?") eruit; nu Wat doet Voortraject / Wat kost het mij / Hoe verdienen
        jullie dan geld / Werkgebied / Hoe snel een gesprek / Verschil met energiecoach.
  - [x] SEO home bijgewerkt: title "Gratis advies over verduurzamen en subsidies |
        Voortraject" + bewoner-first description — in `Index.tsx` (helmet) én `index.html`
        (title/description/og/twitter + JSON-LD org description). og:image + stale
        hero-houses.webp-preload bewust NIET aangeraakt (buiten scope — zie review).
  - Homepage-volgorde nu: Hero → Herkenning → HelderPlan → Subsidies → WaaromKiezen →
    LogoCarousel → Faq → eind-CTA(Footer)
  - **Openstaand:** opdrachtgever wil nog **1 extra logo** toevoegen aan de instantie-
    carrousel — bestand komt in `public/images/instanties/`, daarna registreren in
    `defaultLogos` in `LogoCarousel.tsx`.
- [x] **Fase 2 — Uitvoerders → Partners** (`feat/partners-rename`, gestackt op
      `feat/home-bewoners` omdat die de nieuwe Header/Footer bevat; PR-base =
      feat/home-bewoners, retarget naar main zodra PR #6 gemerged is) — KLAAR, nog niet gemerged
  - [x] `src/pages/Uitvoerders.tsx` → `Partners.tsx` (git mv; component + `export default`
        hernoemd), Seo `path="/partners"`, H1 "…zodat jij kunt bouwen" + subtitel je-vorm
        ("jouw team"). B2B-body verder ongewijzigd; het woord "uitvoerders" blijft als
        vakterm (dat is de doelgroep), alleen de paginanaam/URL/nav-label wordt Partners.
  - [x] Route `/partners` + client-side redirect `/uitvoerders` → `<Navigate to="/partners">`
        (voor dev + SPA-fallback) én echte 301 in Cloudflare `public/_redirects`
        (`/uitvoerders /partners 301`).
  - [x] Header + Footer: label Uitvoerders → Partners; nav-volgorde Bewoners · Verduurzamen ·
        Subsidies · Over ons · Partners (footer: Bewoners · Partners · Over ons · Contact).
  - [x] Interne links: partnerverwijzing in `ClosingCta` → `/partners`; sitemap-script +
        `public/sitemap.xml` (regenerated, 15 entries) → `/partners`.
  - **Bewust NIET aangeraakt (data-integriteit / vaktaal):** Supabase-tabel
        `leads_uitvoerders` (Contact-form insert) en `AudienceContext`-type
        `"uitvoerders" | "bewoners"`; prose-vermeldingen van "uitvoerders" op subsidie-/
        maatregel-/Privacy-pagina's; dode `Audiences.tsx` (nergens geïmporteerd).
- [x] **Fase 3 t/m 5 + foto-refresh** (`feat/fase-3-5-fotos`, gestackt op
      `feat/partners-rename`) — KLAAR, nog niet gemerged. Bevat ook een homepage-fix
      (WaaromKiezen-foto lijnde niet uit met de tekst).
  - [x] **Homepage-fix WaaromKiezen:** portret-foto ballonde uit via `lg:h-full` en
        werd hoger dan de tekst. Nu absoluut gepositioneerd binnen `order-2 relative`
        (`lg:absolute lg:inset-0`), zodat de foto de kolomhoogte van de tekst vult en
        nooit langer wordt. Boven/onder uitgelijnd met de tekst. (Visueel bevestigd.)
  - [x] **Fase 3 — Bewoners:** H1 "Onafhankelijk advies over verduurzamen en subsidies,
        zonder wachtrijen"; subtitel V3 ("rust en overzicht … Gratis."); risico-microtekst
        onder hero-CTA én eind-CTA (Vrijblijvend · Binnen 24 uur · niets voorbereiden).
  - [x] **Fase 4 — maatregel:** vaste CTA-label → "Plan een gratis gesprek" (default in
        `MaatregelPagina`, dekt 6 pagina's). Tailored `finalCtaKop/Tekst` per maatregel
        BEHOUDEN (beter dan generiek; al V3-getoetst). Onderhoud gebruikt geen template
        maar had het label al goed.
  - [x] **Fase 4 — subsidie:** 4 closing-CTA's geüniformeerd naar de verzamel-CTA
        ("Ontdek welke subsidies voor jouw woning gelden" + "Wij zoeken het voor jouw adres
        uit … Eén gesprek, geen loketten. Vrijblijvend en gratis." + knop "Plan een gratis
        gesprek"). "Laatst bijgewerkt"-regels behouden.
  - [x] **Fase 5 — Contact:** H1 "Ontdek gratis wat mogelijk is voor jouw woning" +
        subtitel. Formulier stond al standaard op bewoner (geen wijziging nodig).
  - [x] **Foto's toegevoegd (HEIC→WebP, echte shoot):** Bewoners-hero → `bewoners-
        keukentafel.webp` (IMG_4857); Partners-hero → `partners-overleg.webp` (IMG_4872).
        Contact heeft geen foto-slot (geen swap). Why-sectie (Partners) niet geswapt: beste
        kandidaten hadden "KING LEGEND"-polobranding — bewust vermeden.
  - [x] **Oude foto's verwijderd:** `bewoners-hero.jpg`, `uitvoerders-hero.jpg` (vervangen)
        + wees-bestanden `bewoners-1/2.jpg`, `route-hero.jpg`, `hero-houses.jpg/.webp`
        (+ stale preload uit `index.html`). Maatregel-productfoto's behouden (topicaal;
        geen consistente echte set). `why-photo.jpg` + dode `Process.tsx`/`process-photo*`
        blijven (buiten scope).
  - **Foto-caveat:** de goede team-/headset-shots (IMG_4770/4779/4785/4792/4809) dragen
        het "KING LEGEND"-polologo prominent → niet gebruiken op nieuwe plekken.
- [x] **Instantie-logo + maatregelfoto's** (`feat/instantie-en-maatregelfotos`, vanaf `main`)
  - [x] Logo **Natuur Vriendelijk Isoleren** toegevoegd aan `public/images/instanties/`
        (`natuurvriendelijk-isoleren.png`) + geregistreerd in `defaultLogos` (LogoCarousel).
  - [x] Echte shoot-foto's op de 5 maatregelpagina's (bron: `voortraject-fotos/`):
        Zonnepanelen ← **IMG_4735**, Airco ← IMG_4631, Isolatie ← IMG_4752 (kruipruimte),
        Warmtepomp ← IMG_4612 (binnenunit), Onderhoud ← **IMG_4674** (leidingen/ventilatie).
        (Opdrachtgever koos IMG_4735 + IMG_4674 expliciet; eerdere IMG_4712/IMG_4589 vervangen.)
        `MaatregelPagina` kreeg een optionele `heroImagePosition`-prop om de 4:3-crop te sturen
        (Onderhoud is een custom pagina → inline `objectPosition`). Oude stock-jpg's verwijderd.
  - [x] **Contactpagina:** subtiele adviseur-foto (headset, IMG_4792 → `contact-adviseur.webp`)
        boven in de rechter kolom; face-focused crop (object-position center 22%) → gezicht =
        vertrouwen/conversie, en de "KING LEGEND"-polotekst valt onder de crop weg. Niet
        afleidend t.o.v. het formulier.
  - **Opmerking:** één hero per pagina (template heeft geen gallery). Extra bruikbare shots
        ongebruikt (zonnepanelen: IMG_4699/4735/4736; meterkast: IMG_4583/4593) — optioneel
        later een fotostrip/gallery per maatregel.
  - **Bonus beschikbaar:** `Downloads/Verbeterde AI foto's/` bevat 3 AI-bewerkte advies-
        foto's waar het "KING LEGEND"-polologo vervangen is door **voortraject** — bruikbaar om
        de Why-sectie (Partners) alsnog te swappen of King-Legend-shots te vervangen.
- [x] **UI-verfijningen** (`feat/bg-alternatie-fotofix`, vanaf `main`)
  - [x] **Homepage achtergrond-alternatie:** dark hero → off-white → wit → off-white → wit → …
        Max 2 kleuren: off-white `#F5F3ED` + wit `#FFFFFF`. Start met off-white ná de donkere
        hero (minder contrast). Secties: Herkenning=off-white, HelderPlan=wit, Subsidies=
        off-white, LogoCarousel=wit, WaaromKiezen=off-white, Faq=wit. (was 4+ bg's; eerste
        crème `#F4EEE0` was te beige/"smerig" → schoner `#F5F3ED`.)
  - [x] Herkenning-sectietitel: "Waar moet je beginnen?" → **"Herken je dit?"**
  - [x] **Contact:** "Liever direct contact?"-kaart weg (+ ongebruikte consts/icon-imports
        opgeruimd). Sidebar: foto vult de kolom (`md:flex-1`), "Wat kun je verwachten?" lijnt
        onderaan uit met het formulier (grid `items-stretch`).
  - [x] **Onderhoud-hero:** van 4:5 terug naar 4:3 (kleiner), `object-position center top`
        zodat de leidingen/buizen goed zichtbaar blijven.
- [x] **Feedbackronde: /bewoners weg + homepage-links + subsidie-randjes**
      (`feat/bewoners-verwijderen-homepage-links`, vanaf `main`) — KLAAR, PR open
  - [x] **/bewoners-pagina verwijderd:** `src/pages/Bewoners.tsx` gedeletet; de route is nu een
        client-redirect `<Navigate to="/" replace />` (zelfde patroon als /uitvoerders →
        /partners; beter voor SEO dan een 404 op een eerder-gesitemapte URL). Nav-item weg uit
        Header **én** Footer; sitemap-entry weg (script + `public/sitemap.xml` geregen → 14
        entries). Asset `bewoners-keukentafel.webp` behouden (nog in gebruik door HelderPlan).
        Dode `Audiences.tsx` (nergens geïmporteerd) bewust ongemoeid (buiten scope).
  - [x] **WaarWeBijHelpen:** alle 3 tegels nu hetzelfde tekstlink-patroon als de installatie-
        tegel (geen hele-tegel-link/pijl meer — kan niet met geneste `<a>`). Isolatie-tegel
        kreeg link "Isolatie & ventilatie"; subsidie-tegel de 4 subsidiepagina's (Nij Begun,
        Landelijke/Regionale subsidies, Subsidies stapelen). Gedeelde `TegelLinks`-helper.
  - [x] **Oker randje op kaarten (Subsidies-stapelen + Herkenning):** oker randje via token
        `borderColor: hsl(var(--accent) / 0.8)` (i.p.v. `border-border`). NB: de class-opacity-
        modifier `/50` werkt hier niet (tokens missen de `<alpha-value>`-placeholder) → inline
        via de CSS-var, zoals `index.css` het accent al met alpha gebruikt. (In rondes opgevoerd
        0.5 → 0.65 → 0.8; daarna hetzelfde randje ook op de Herkenning-kaarten toegepast.)
  - [x] **Header-dropdowns (Verduurzamen + Subsidies):** frosted-glass in lijn met de header-
        pills — eigen `glassPanel` (`bg-white/90 backdrop-blur-xl`) + `pillShadow` +
        `overflow-hidden`. Bewust hogere witdekking dan de pills (`/70`): de dropdown hangt over
        een donkerder deel van de hero én zit genest in de nav-`backdrop-filter` (blurt zwakker),
        dus `/70` oogde daar te transparant; bij `/90` leest 'ie net zo mat als de pills.
  - Geverifieerd: `bun run lint` (geen nieuwe errors — alle bestaande), `tsc --noEmit` (clean),
        `bun run build` (ok), + headless CDP-screenshots (nav zonder Bewoners; 10 helpen-links;
        3 kaarten met `borderColor rgba(230,182,71,.5)`).
- [ ] **Later / geblokkeerd**
  - [ ] Reviews-sectie (wacht op echte reviews met naam/plaats/resultaat)
  - [ ] Over ons: eigen teamfoto's + eind-CTA (fotoshoot is er nu — kan opgepakt worden)

Implementatienotities:
- Alle nieuwe copy langs de V3-toets: geen "claim/direct profiteren/laatste kans"; bij
  uitvoerder-koppeling vrije keuze expliciet houden ("jij kiest zelf").
- Nieuwe componenten met design tokens (geen hardcoded hex — bestaande secties overtreden
  dit her en der; bij herschrijven meteen netjes doen, niet buiten scope refactoren).
- Footer-glow-patroon respecteren: closing CTA's gaan via de `Footer cta={...}` prop
  (zie lessons 2026-06-24).

Foto-workflow (Fase 1):
- Originele HEIC's staan in `voortraject-fotos/` (gitignored). Converteren naar WebP in
  `src/assets/` met ImageMagick: `& 'C:\Program Files\ImageMagick-7.1.2-Q16\magick.exe'
  <src>.heic -auto-orient -resize <breedte>x -quality <70-80> <dest>.webp`.
  (Windows/WIC kan HEIC niet zelf lezen; ImageMagick Q16 is via winget geïnstalleerd.)
- Portret-headshots team-*.png in `src/assets` zijn echte, nette headshots (lichte
  achtergrond) — bruikbaar. Groepsfoto stond op externe CRM-Supabase-opslag (verwijderd).
- Regel: geen foto twee keer op dezelfde pagina. Homepage-inzet (HEIC → asset):
  - Hero: IMG_4868 → `hero-adviesgesprek.webp` (full-bleed)
  - Herkenning: IMG_4556 → `herkenning-voortuin.webp`
  - Helder plan: IMG_4845 → `hero-keukentafel.webp`
  - Subsidies: IMG_4779 → `subsidies-uitzoeken.webp` (liggend, bureau)
  - Waarom kiezen: IMG_4837 → `waarom-vertrouwen.webp` (handdruk voordeur)
  - Let op: op sommige foto's staan vreemde merklogo's op de polo's (King Legend / Brand
    Solutions) en op meterkast-flyers "€ 10.500" — die niet prominent gebruiken.

Praktische gotcha's:
- Dev server draait al (`bun run dev`) op http://localhost:8080/ (achtergrondtaak).
- Git-commits met accolade-heredoc in PowerShell: GEEN apostroffen of dubbele quotes in
  de boodschap zetten (breekt de here-string parsing). Houd commit messages quote-vrij.
- Header en Footer zijn site-breed; wijzigingen daar raken alle pagina's — even doorklikken.

## Project bootstrap (2026-06-23)

- [x] Adapt `CLAUDE.md` from the CRM repo to the website
- [x] Create `.claudeignore`, `tasks/todo.md`, `tasks/lessons.md`
- [x] Connect the GitHub repo — cloned `Voortraject/website-voortraject` (default branch `main`)
- [x] Confirm against the code and update `CLAUDE.md`:
  - [x] Package manager → **bun** (`bun.lockb`, `bunx` in scripts)
  - [x] Supabase: **two** projects — own `zvsmazjcfzjyvnjrlnma` (`client.ts`) +
        CRM `lfelnfukbrxznkevnevr` (`external-client.ts`, `supabaseExternal`)
  - [x] File paths: `src/integrations/supabase/{client,external-client,types}.ts`
  - [x] Color palette from `src/index.css` (ink blue / mustard / off-white / sand)
- [x] Commit the scaffold (`CLAUDE.md`, `.claudeignore`, `tasks/`) via a branch + PR
      — done in PR #1 (commit `8fdf868`)
- [x] **Decide on the committed `.env`** (see Review note) — done in PR #2
      (commit `078f49b`): stopped tracking `.env`, added `.env.example`, `.env` now gitignored

### Review (2026-06-23)
- GitHub is connected via clone into `c:\dev\website-voortraject`; working on `main`.
- Stack confirmed: React 18 + Vite + TS + Tailwind + shadcn/ui, bun, vitest.
- Two Supabase connections confirmed (own project + external CRM project).
- **Security note (low severity, worth fixing):** `.env` is committed to this *public*
  repo and is **not** in `.gitignore`. The values are the Supabase URL + *publishable/anon*
  key, which are public by design (they ship to the browser anyway), so this is not a
  breach. The real risk is forward-looking: if anyone ever adds a true secret (e.g. a
  `service_role` key) to `.env`, it would leak. Recommended: add `.env` to `.gitignore` and
  stop tracking it (`git rm --cached .env`). Do this via a branch + PR, and confirm it
  won't break the Lovable/Cloudflare build first.

### Review (2026-07-14) — fix bronlinks subsidiecheck (PR #53)
- Bug: "Naar de officiële regeling" (site) en "Meer info" (mail) wezen voor veel
  regelingen naar de generieke ministerie-footerlink van Verbeterjehuis
  (rijksoverheid.nl/ministeries/…). Oorzaak: `officieleBron()` scande de hele
  pagina en viel terug op de eerste rijksoverheid.nl-link; de uitvoerder-whitelist
  was te smal (belastingdienst/svn/nhg/nijbegun/gemeente.groningen vielen erbuiten).
- Fix: alleen content vóór `<footer` scannen; fallback = eerste echte externe
  contentlink; ministerie-/campagnelinks uitgesloten. Beide parser-kopieën
  (frontend + edge function) + 2 echte fixtures + 3 regressietests (32 tests groen).
- Edge function gedeployed naar CRM-project en live geverifieerd (9742HJ,
  Woningeigenaar): alle 12 regelingen hebben nu een eigen echte bron.
- Observatie (buiten scope, evt. later): "Subsidie Verduurzaming en Verbetering
  Groningen" linkt naar een snn.nl-PDF (postcodelijst) omdat dat de eerste
  snn.nl-link op de detailpagina is; een pagina-link zou netter zijn.
- Verfijning (zelfde PR, 2e commit): PDF-links (postcodelijsten/voorwaarden) krijgen
  lagere rang dan echte pagina's (uitvoerder-pagina > uitvoerder-PDF > andere pagina >
  andere PDF). VVG Groningen en Onderhoudsfonds VvE's linken nu naar de regelingpagina
  (snn.nl / svn.nl). Breed herverifieerd: 52 regelingen, 14 postcodes, 0 PDF's,
  0 ministerie-links. "Energiebespaarlening Fryslân" → warmtefonds.nl/vve is conform
  de bron (enige externe link op die pagina).

### Review (2026-08-09) — conversie eerste stap subsidiecheck
- Aanleiding: aan de tool zelf is veel verbeterd, aan stap 1 (het adresscherm)
  nog nauwelijks. Zes van de tien voorgestelde ingrepen zijn gekozen; 4 (preview
  van het resultaat), 8 (mobiele veldindeling), 9 (testimonials) en 10 (urgentie)
  bewust niet gedaan.
- (1) Compacte header op /subsidiecheck: alleen het logo. De nav, de dropdowns en
  een "Check jouw subsidies"-knop die naar de eigen pagina wees waren op een
  funnelpagina louter uitgang (attention ratio). Volledige navigatie staat nog
  gewoon in de footer. `<Header compact />`; de "binnenkort"-variant houdt de
  normale header, want dat is een doodlopend eind en geen funnel.
- (2) Kop belooft de uitkomst: "Welke subsidies zijn er voor jouw huis?" i.p.v.
  "Waar staat jouw woning?" (dat beschreef de taak, die de veldlabels al doen).
  Bewust "zijn er voor" en niet "krijg jij": wij tonen wat van toepassing is,
  niet wat toegekend wordt.
- (3) Hard cijfer boven de velden: "Gemiddeld 5 subsidies per adres in Groningen
  en Drenthe". Gemeten, niet geschat: `scripts/meet-subsidieaantal.mjs` roept
  dezelfde productie-edge-function aan voor één bestaand adres per gemeente in
  alle 22 gemeenten (27 adressen, PDOK-geverifieerd). Uitkomst 2026-08-09:
  subsidies gem. 5,41 (min 4, max 7), leningen gem. 4,85, totaal gem. 10,26.
  We tonen 5: naar beneden afgerond én zonder leningen, want een lening is geen
  subsidie. Alleen zichtbaar voor woningeigenaren, want dat is de gemeten groep.
- (5) Endowed progress: het lijntje naar stap 2 begint op 20% en loopt naar 70%
  zodra de live adrescheck het huis herkent. StapAdres meldt dat via
  `onAdresHerkend`; de balk beweegt dus op échte voortgang.
- (6) Geruststelling verplaatst naar pal onder de adresvelden: "Je adres
  gebruiken we om de regelingen op te zoeken." Stond eerder alleen ónder de knop,
  dus ná het moment van de twijfel.
- (7) Keuzeblok "Waarop we zoeken" terug naar één zin ("We zoeken voor
  woningeigenaren op alle maatregelen. Aanpassen"). Het omkaderde blok stond in
  de blikrichting naar de CTA terwijl er voor de meeste bezoekers niets te kiezen
  valt.
- Bewaakt door `src/test/subsidiecheckEersteStap.test.tsx` (14 tests): cijfer en
  zin blijven synchroon, het cijfer verschijnt niet bij huurders/VvE's/
  verhuurders, de geruststelling staat vóór de knop, de compacte header heeft
  precies één link, en de voortgangsbalk begint niet op nul.
- 34 testbestanden / 193 tests groen, lint schoon op de gewijzigde bestanden
  (de 9 bestaande lint-errors staan in niet-geraakte pagina's), productiebuild ok.
- Nog open: het cijfer is een momentopname. Verandert het subsidieaanbod, dan
  script opnieuw draaien en `GEMIDDELD_AANTAL_SUBSIDIES` bijstellen.

### Review (2026-08-09, tweede ronde) — feedback op stap 1 verwerkt
- (1) Voortgang was onzichtbaar: de verbindingslijn was 1px, dus 20% vulling zag
  je niet. Nu een balkje van 3px met ronde hoeken; het meelopende deel is accent
  (de kleur van "hier sta je nu"), afgeronde stappen blijven primary.
- (2) Het cijfer is nu een badge met een lampje op zandkleur i.p.v. weer een
  grijze regel. En de regio is eruit: iemand uit Friesland of Overijssel hoort
  zich niet uitgesloten te voelen. Dat betekende wél opnieuw meten, want zonder
  regio moet het getal ook landelijk kloppen.
  - Meetscript herschreven: het haalt nu per plaats een écht adres bij PDOK op
    (`q=*` + filter op `woonplaatsnaam`). De oude vrije zoekopdracht vond voor de
    meeste steden niets en koos bij "Vries" een adres in de provincie Groningen.
  - Nieuwe meting, 51 adressen door heel Nederland: regelingen gemiddeld 9,12
    (min 5, max 13), waarvan subsidies 4,41. In het werkgebied ligt het hoger:
    10,27 regelingen en 5,38 subsidies over 26 adressen.
  - Gevolg: "Gemiddeld 5 subsidies per adres" kon niet blijven staan, want
    landelijk is dat 4,4. Nu "Gemiddeld 9 regelingen per adres": het landelijke
    getal naar beneden afgerond, en "regelingen" is precies het woord dat de
    resultaatpagina zelf gebruikt (leningen zitten erin, en een lening is geen
    subsidie).
- (3) "Je adres gebruiken we om de regelingen op te zoeken." verwijderd: ruis.
- (4) Subregel ingekort tot "Vul je adres in, dan zoeken we alle regelingen bij
  elkaar." op elk formaat, zodat kop en subregel op mobiel niet allebei twee
  regels vullen.
- (5) Vinkjes en Google-score staan weer op mobiel. Kon nu, doordat de regel uit
  punt 3 weg is en de stapel onder de knop dus niet te hoog wordt. De score staat
  bewust als `alsLink={false}`: een link met target="_blank" pal naast de
  verzendknop is een uitgang precies waar we er geen willen (staat zo ook in de
  toelichting van Bewijsregel zelf).
- 34 testbestanden / 195 tests groen, lint schoon op de gewijzigde bestanden,
  productiebuild ok.

### Review (2026-08-09, derde ronde) — voortgangsindicator herzien
- "Daarna vragen we kort je gegevens…" verwijderd. Die regel kwam uit de tijd dat
  stap 1 nog "geen account nodig" beloofde; die belofte staat er niet meer, dus
  de tegenspraak die hij moest opvangen bestaat niet meer. Wat er hierna komt
  staat bovendien in de voortgangsindicator ("Je gegevens").
- Voortgangsindicator opnieuw ontworpen. De bolletjes van 10px vielen niet op en
  een balkje van 3px alleen was nog te subtiel. Nagezocht wat gangbaar is
  (USWDS-designsysteem, checkout-onderzoek Baymard, NN/g-wizardrichtlijnen) en
  daaruit overgenomen:
  - genummerde cirkels van 28px in plaats van kale bolletjes: het nummer zegt
    waar je bent én hoeveel stappen er zijn, zonder extra regel tekst;
  - drie duidelijk verschillende toestanden, met de HUIDIGE stap het meest
    opvallend (expliciete USWDS-regel): afgerond = primary met vinkje, huidig =
    accent met ring, nog te doen = randje met grijs nummer;
  - vinkje bij wat af is, want dat leest sneller dan een nummer;
  - toegankelijkheid: cirkels op aria-hidden, aria-current="step" op de huidige,
    en per stap verborgen tekst met de status (afgerond / huidige stap / nog te
    doen).
- Basisvulling van het balkje van 20% naar 30%, zodat de "je bent al begonnen"-
  vulling ook echt zichtbaar is. Bij een herkend adres nog steeds 70%.
- Bewust NIET toegevoegd: een aparte regel "Stap 1 van 3". USWDS raadt die aan,
  maar de nummers in de cirkels dragen dat al, en er is deze ronde juist gesnoeid
  in kleine grijze regels. Screenreaders krijgen het via de aria-label van de lijst.
- 34 testbestanden / 199 tests groen (4 nieuwe voor de indicator), lint schoon op
  de gewijzigde bestanden, productiebuild ok.

### Review (2026-08-09, vierde ronde) — bredere voortgangsbalk, subregel op één regel
- Balkjes tussen de stappen verbreed: 32px → 48px vanaf 400px schermbreedte →
  96px vanaf sm. Een langer balkje maakt de gedeeltelijke vulling beter
  afleesbaar (30% van 96px is 29px, van 32px maar 10px).
  - Bewust NIET verbreed onder de 400px. De labels bepalen daar de breedte: de
    drie labels zijn samen zo'n 194px en op een telefoon van 360px blijft er na
    px-6 nog 312px over. Met 32px per balkje zit je dan al op ~290px; breder
    past er domweg niet bij zonder dat de labels gaan breken.
  - Gecontroleerd dat de arbitraire breakpoint `min-[400px]:` echt meecompileert
    (staat als `min-width: 400px` in de gebouwde CSS). Tailwind is 3.4.
- Subregel ingekort tot "Vul je adres in, dan zoeken we alle regelingen." (47
  tekens). Budget: op 360px blijft 312px over en Manrope op 14px doet ~6,3px per
  teken, dus ~49 tekens passen op één regel. Met "bij elkaar" erachter waren het
  er 58 en brak de zin. Het tekenbudget staat als comment bij de tekst, zodat een
  volgende tekstwijziging niet stilletjes weer twee regels oplevert.
- 34 testbestanden / 199 tests groen, lint schoon, productiebuild ok.
