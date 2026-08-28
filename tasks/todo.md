# Subsidiecheck: over naar de officiële Milieu Centraal API (2026-08-28)

**Aanleiding.** Milieu Centraal heeft de API-key voor de Energiesubsidiewijzer geleverd, plus de
API Guide (21 mei 2025). Tot nu draait de tool op een live-scrape van hun publieke website. Die
kan nu weg. De key is per mail binnengekomen en is getest tegen alle drie de endpoints.

**Randvoorwaarde van de opdrachtgever.** De live versie mag er geen nadeel van ondervinden, en
de key komt niet in de frontend te staan.

---

## 1. Wat de API oplevert (getest, niet aangenomen)

Drie endpoints, allemaal geverifieerd met onze key op `https://www.verbeterjehuis.nl/api/v1/`:

| endpoint | wat we ermee doen |
|---|---|
| `regulation/getfilters` | de lijsten met bewonertypes, maatregelen (19 stuks) en gemeenten. Wij hardcoden nu de maatregel-id's; de guide zegt expliciet dat dat niet mag. |
| `regulation/search` | de regelingen per postcode. Geeft **alles** in één keer terug. |
| `regulation/getdetail` | levert exact hetzelfde object als `search`. **Hebben we dus niet nodig.** |

**`search` geeft per regeling meteen:** `Title`, `Intro`, `AmountsText`, `Conditions`,
`ProviderName`, `ProviderUrl`, `Type` (`subsidy`/`loan`/`other`), `TargetGroup`, `Locations`,
`Tags` (de maatregelen per regeling), `Url` en `DateEnd`.

**Bewijs dat de uitkomst identiek blijft.** Vijf postcodes vergeleken tussen de officiële API
(plus onze maatregelfilter) en wat er op dit moment live staat:

| postcode | API | live nu | verschil |
|---|---|---|---|
| 9742HJ Groningen | 10 | 10 | geen |
| 8911AA Leeuwarden | 10 | 10 | geen |
| 3511AA Utrecht | 8 | 8 | geen |
| 9531AA Borger | 13 | 13 | geen |
| 7811AA Emmen | 0 | 0 | geen |

Niet alleen de aantallen: het zijn per postcode exact dezelfde regelingen, en de bedragen komen
overeen ("tot € 28.000", "50-100% van de kosten", "tot € 4.000").

**Snelheid:** 85 tot 270 ms voor de API, tegen 400 tot 560 ms voor onze huidige functie mét
warme cache. Eén request in plaats van dertien (lijstpagina plus een detailpagina per regeling).

---

## 2. Waar de key komt te staan

- **Productie:** Supabase-secret `ESW_API_KEY` op het CRM-project `lfelnfukbrxznkevnevr`, gezet
  met `bunx supabase secrets set --project-ref lfelnfukbrxznkevnevr`. Alleen de edge function
  leest hem. Niet in de repo, niet in git, nooit in de browserbundle.
- **Lokaal:** dezelfde naam in `.env` (staat al in `.gitignore` én `.claudeignore`), **zonder**
  `VITE_`-prefix. De Vite-dev-proxy leest hem via `loadEnv(mode, process.cwd(), "")` en zet de
  `apiKey`-header er server-side op. `vite.config.ts` draait in Node, dus de key komt niet in de
  bundle terecht. `.env.example` krijgt een lege regel met uitleg.
- **n8n:** geen credential nodig. n8n praat alleen met het CRM, niet met Verbeterjehuis. Aan de
  lead-, mail- en taakketen verandert niets.

---

## 3. Uitrol: schakelaar met de oude route als vangnet

Gekozen door de opdrachtgever. Het idee: de edge function houdt **exact hetzelfde contract**
naar de site (zelfde queryparameters, zelfde JSON), zodat de frontend niets merkt en ook oude,
nog gecachete browserbundles blijven werken. Alleen de binnenkant wisselt.

- [ ] **Stap 1.** Deploy de nieuwe functie terwijl `ESW_API_KEY` nog niet gezet is. De functie
      ziet geen key en gebruikt de oude route. **Live gedraagt zich exact als nu.**
- [ ] **Stap 2.** Secret zetten. De functie schakelt bij de eerstvolgende cold start om naar de
      API.
- [ ] **Stap 3.** Op productie verifiëren: 9742HJ over vier bewonertypes (verwacht 10/6/1/3),
      plus de vier postcodes uit de tabel hierboven, plus de resultaatpagina en een echte
      overzichtsmail.
- [ ] **Stap 4.** Gaat er iets mis: secret weghalen. Dan valt hij terug op de oude route, zonder
      deploy en zonder release. Ook als de API zelf hapert of een 5xx geeft, valt de functie per
      request terug op de oude route in plaats van de bezoeker een foutmelding te geven.
- [ ] **Stap 5.** Na ongeveer een week meekijken: opruim-PR die de scrape-route, de HTML-parser,
      de fixtures en de bronlink-heuristiek weghaalt.

---

## 4. Wat er per bestand verandert

### Nieuw

- [x] `src/lib/subsidies/energiesubsidiewijzerApi.ts` — vertaalt een API-record naar onze
      `SubsidieRegeling`. Bron van waarheid, met een verbatim kopie in
      `supabase/functions/subsidiecheck/energiesubsidiewijzerApi.ts` (zelfde afspraak als bij de
      huidige parser: Deno kan niet uit de Vite-app importeren, dus kopie met `.ts`-imports en
      een waarschuwing in de kop).

De vertaling, veld voor veld:

| ons veld | komt uit | opmerking |
|---|---|---|
| `id` | laatste padsegment van `Url` | **bewust niet** `Id`. Zo houden we exact dezelfde id's als nu, en blijft `CURATED_BEDRAG["isde-subsidie-rijksoverheid"]` werken. |
| `titel` | `Title` | |
| `omschrijving` | `Intro` | identiek aan wat er nu op de kaart staat |
| `type` | `Type` | `loan` wordt lening, `subsidy` en `other` worden subsidie (net als nu) |
| `bedragIndicatie` | `AmountsText` | tags eruit, dan door de bestaande `beknoptBedrag()`. Levert dezelfde bedragen als nu. |
| `belangrijksteVoorwaarde` | `Conditions` | eerste `<li>` of `<p>`, zoals nu |
| `bronUrl` | `ProviderUrl` | vervangt de hele bronlink-heuristiek uit PR #53 |
| `aanbieder` | `ProviderName` | de echte naam in plaats van een generiek label, zie 5b |
| `maatregelen` | `Tags` | eindelijk echt per regeling, zie 5a |
| `doelgroepen` | `TargetGroup` | |
| `niveau` | afgeleid | zie 4b |

### 4b. Groepering: hoe we het niveau afleiden

De API geeft de overheidslaag niet terug, die zat alleen als CSS-klasse in hun HTML. We leiden
hem dus zelf af uit aanbieder plus werkgebied, in deze volgorde:

1. aanbieder begint met "Gemeente" → **Gemeente**
2. aanbieder is SNN of Samenwerkingsverband Noord-Nederland, of begint met "Provincie" → **Provincie**
3. werkgebied is heel Nederland (`0000-9999`) → **Rijksoverheid**
4. aanbieder is een rijksinstantie (RVO, Belastingdienst, Rijksoverheid) → **Rijksoverheid**
5. werkgebied is een lijst gemeenten of provincies → **Gemeente**
6. anders → **Leningen en overig**

Effect op het scherm dat de opdrachtgever stuurde (9742HJ, woningeigenaar). Zeven van de tien
regelingen blijven in dezelfde groep, drie verhuizen:

| regeling | nu | straks |
|---|---|---|
| Subsidie Verduurzaming en Verbetering Groningen (SNN) | Leningen en overig | **Provincie** |
| Subsidie Waardevermeerdering (SNN) | Rijksoverheid | **Provincie** |
| Extra geld voor energiebesparing met NHG | Leningen en overig | **Rijksoverheid** |

Koppen worden dan `RIJKSOVERHEID · 6`, `PROVINCIE · 2`, `GEMEENTE · 2` in plaats van
`RIJKSOVERHEID · 6`, `GEMEENTE · 2`, `LENINGEN EN OVERIG · 2`.

Dit lost een verwarring op die nu op de screenshot te zien is: onder de kop "Leningen en overig"
staat een subsidie van € 10.000. Twee SNN-regelingen die nu in twee verschillende groepen
belanden, komen bij elkaar te staan, en dat is precies het soort regeling waar wij in
Noord-Nederland op zitten. **Dit is de enige zichtbare wijziging van de basismigratie en hij
moet expliciet worden goedgekeurd.**

### Wijzigen

- [x] `supabase/functions/subsidiecheck/index.ts` — API-pad erbij, oude route als vangnet.
      Cachesleutel wordt `postcode|bewonertype` (de maatregelfilter gaat lokaal over `Tags`),
      dus de cache raakt veel vaker. Blijft `postalcode`, `type-of-resident` en `filter`
      accepteren, en blijft `{ postcode, regelingen, bron }` teruggeven.
- [x] `src/lib/subsidies/energiesubsidiewijzerProvider.ts` — het DEV-pad praat met de API-proxy
      in plaats van HTML te parsen. Het productiepad (edge function) blijft ongewijzigd.
- [x] `vite.config.ts` — proxy `/esw-api` naar `https://www.verbeterjehuis.nl/api/v1`, met de
      `apiKey`-header uit `.env`. De oude `/esw`-proxy blijft staan tot de opruim-PR.
- [x] `.env.example` — `ESW_API_KEY` met uitleg dat hij bewust geen `VITE_`-prefix heeft.
- [x] `supabase/config.toml` — commentaar bijwerken: de functie heeft nu wél een secret.
- [x] `src/lib/subsidies/types.ts` — `NIVEAU_KORT` en `Samenvatting.perNiveau` weghalen. Die
      worden nergens meer uitgelezen (restant uit een eerdere versie, bevestigd met een
      volledige zoekactie).

### Tests

- [x] `src/test/energiesubsidiewijzerApi.test.ts` — nieuwe testen tegen echte API-antwoorden als
      fixture (JSON, klein): de veldvertaling, de type-mapping, het afleiden van het niveau, het
      filteren op `Tags` en het id uit de `Url`.
- [x] Een regressietest die vastlegt dat de tien regelingen voor 9742HJ dezelfde id's houden.
- [x] De bestaande HTML-parsertests blijven staan zolang de oude route het vangnet is, en gaan
      er in de opruim-PR uit.

---

## 5. Wat de API mogelijk maakt, buiten deze migratie

Bewust apart houden, zodat de overstap zelf goed te verifiëren blijft. Los voorstellen na de
migratie.

**5a. De maatregelregel terug op de kaart.** In `SubsidieCard.tsx` staat een comment dat de
regel "Voor isolatie & glas, ventilatie" is weggehaald omdat de bron per regeling geen
maatregelen leverde. De API doet dat wél, via `Tags`. Die regel kan dus terug, nu wél kloppend
per kaart.

**5b. De echte aanbieder op de kaart.** Nu staat er onderaan "Rijksoverheid", "Gemeente" of
"Overige aanbieders", afgeleid uit de groep. Straks kan er "Gemeente Groningen", "SNN",
"Nationaal Warmtefonds" of "Rijksdienst voor Ondernemend Nederland (RVO)" staan. Concreter en
geloofwaardiger, en het maakt de groepskop niet overbodig.

**5c. Maatregelen niet meer hardcoden.** De guide zegt letterlijk dat filters niet hardcoded
mogen worden, omdat ze kunnen wijzigen. Onze acht id's staan nu vast in `types.ts`. Voorstel:
periodiek `getfilters` ophalen en vergelijken, met een melding als er iets verandert.

**5d. Meer maatregelen aanbieden.** De API kent er 19, wij bieden er 8. Interessant voor ons:
"Gasaansluiting verwijderen" (1591), "Kleine energiebesparende maatregelen" (1603) en
"Energie advies" (1605). Die eerste zit al in vijf van de regelingen die we nu tonen. Los
bespreken, want het raakt stap 2 van de tool.

**5e. Verlopen regelingen eruit.** De API geeft `DateEnd`. Nu tonen we alles wat de bron
teruggeeft.

---

## 6. Wat er niet verandert

- De frontend hoeft niets te weten van de overstap: het contract van de edge function blijft
  gelijk. Geen nieuwe Cloudflare-variabelen.
- De lead- en mailketen: `subsidiecheck-mail`, `leadFormulier.ts`, de kolommen `formulier`,
  `bron`, `subsidiecheck_interesses` en `subsidiecheck_type_bewoner`. Daar komen we niet aan.
- Geen schemawijziging in het CRM. Deze migratie raakt de database niet.
- De bronvermelding "in samenwerking met voorlichtingsorganisatie Milieu Centraal" op de
  resultaatpagina en in de mailfooter blijft staan (artikel 4a van de overeenkomst).
- De curated indicatie voor ISDE blijft nodig: ook de API geeft er geen bedrag bij, omdat het
  per maatregel verschilt.

---

## 7. Verificatie voor de PR dichtgaat

- [x] `bun run test`, `bun run lint`, `bun run build` groen
- [x] Lokaal via de API-proxy: 9742HJ toont dezelfde tien regelingen als productie
- [x] Vergelijkscript API tegen de huidige live functie over minimaal tien postcodes in
      Groningen, Drenthe en Friesland, plus één daarbuiten, over alle vier de bewonertypes
- [ ] Na stap 2 op productie: de vier bewonertypes voor 9742HJ geven 10/6/1/3
- [ ] Headless visuele check desktop en mobiel op de resultaatpagina
- [ ] Eén echte overzichtsmail, gecontroleerd op de groepskoppen en de bedragen

---

## Openstaand: goedkeuring nodig op

1. De groepering uit 4b (drie regelingen verhuizen van groep).
2. Of 5a en 5b meteen mee mogen in dezelfde PR, of dat ze los komen.

---

## Wat er is gebouwd en gemeten (2026-08-28)

Branch `feat/subsidiecheck-officiele-api`. Alleen de bronwissel, zoals afgesproken.

**Nieuw**

- `src/lib/subsidies/tekst.ts` — de tekst-helpers (`decodeEntities`, `schoon`, `beknoptBedrag`,
  `eersteRegel`) die zowel de API-route als de oude parser nodig heeft. De parser exporteert de
  twee getoetste functies nog door, zodat de bestaande tests niets merken.
- `src/lib/subsidies/energiesubsidiewijzerApi.ts` — de vertaling API naar `SubsidieRegeling`,
  plus het afleiden van de overheidslaag en het filteren op maatregelen.
- `src/test/energiesubsidiewijzerApi.test.ts` — 20 tests tegen een echt API-antwoord
  (`src/test/fixtures/esw-api-9742hj-woningeigenaar.json`, ontdaan van `Details` en `Share`).
- Deno-kopieën van beide modules in `supabase/functions/subsidiecheck/`, gegenereerd uit de
  bron zodat ze regel voor regel gelijk zijn (alleen `.ts` achter de importpaden).

**Meetresultaat: 48 combinaties (12 postcodes x 4 bewonertypes), nieuwe route naast de huidige
live functie**

| wat | uitkomst |
|---|---|
| welke regelingen eruit komen | **48 van de 48 identiek**, geen enkele regeling erbij of eraf |
| `type` (subsidie of lening) | 0 verschillen |
| `bedragIndicatie` | 0 verschillen |
| `bronUrl` | 13 verschillen, **alle 13 een verbetering** |
| groepsindeling | 174 van de 223 gelijk (78%), 7 unieke regelingen verhuizen |

De dertien bronlinks die veranderen waren stuk voor stuk fout of rommelig, en dat kwam doordat we
ze uit de HTML moesten raden. Nu komen ze uit `ProviderUrl`:

- ISDE wees naar de rekentool, wijst nu naar de regelingpagina zelf.
- De SNN-regeling voor Borger-Odoorn had een Google Analytics-sessiecode in de link
  (`?_gl=1*bx9wk5*_up*...`). Die sleepten we mee in de mail en op de kaart. Nu een schone URL.
- Het Utrechts Restauratiefonds wees naar een oude `http://`-pagina van de gemeente Utrecht,
  wijst nu naar het fonds zelf.
- Amsterdamse hybride warmtepompen wezen naar een RVO-meldcodelijst met een kapotte `&amp;` in
  de URL, wijzen nu naar de subsidiepagina van de gemeente.

**De zeven regelingen die van groep wisselen**

| aantal keer gezien | van | naar | aanbieder | regeling |
|---|---|---|---|---|
| 14 | Rijksoverheid | Provincie | Samenwerkingsverband Noord-Nederland | Waardevermeerdering Drenthe en Groningen |
| 11 | Leningen en overig | Rijksoverheid | Nationale Hypotheek Garantie | Extra geld in hypotheek met NHG |
| 11 | Leningen en overig | Rijksoverheid | SVn | Toekomstbestendig onderhoudsfonds VvE's |
| 5 | Leningen en overig | Provincie | SNN | Verduurzaming en Verbetering Groningen |
| 2 | Leningen en overig | Provincie | SNN | Verduurzaming volkshuisvesting Drenthe |
| 1 | Leningen en overig | Gemeente | Restauratiefonds | Utrechts Restauratiefonds |

**Groen**: 51 testbestanden, 392 tests. `bun run build` slaagt. `bunx tsc` geeft dezelfde drie
fouten als `main`, geen ervan in een gewijzigd bestand. `bunx eslint` geeft dezelfde negen fouten
als `main`, geen ervan in een gewijzigd bestand.

**Key-controle**: `Vm9v…` komt niet voor in `dist/`, niet in versiebeheer en nergens in de
werkmap buiten `.env`. De naam `ESW_API_KEY` staat ook niet in de bundle. De dev-proxy is
end-to-end getest: `http://localhost:8080/mc-api/regulation/search?cityId=9742HJ&targetGroup=Woningeigenaar`
geeft 12 regelingen, met de key alleen aan de Node-kant.

## Echte aanbiedersnaam op de kaart (punt 5b, naar voren gehaald)

Door de nieuwe indeling kwamen NHG en SVn onder de kop "Rijksoverheid", en de kaart toonde het
aanbiederlabel dat uit de groep volgde. Er zou dus "Rijksoverheid" onder een NHG-regeling zijn
komen te staan, en NHG is een private stichting. Op verzoek van de opdrachtgever is 5b daarom
alsnog in deze PR meegenomen, alleen voor het aanbiederlabel.

`aanbieder` komt nu uit `ProviderName`. De groepskop blijft de overheidslaag, de kaart noemt de
echte instantie: "RVO", "Gemeente Groningen", "SNN", "Nationaal Warmtefonds", "Belastingdienst",
"Nationale Hypotheek Garantie".

**Twee dingen moesten daarvoor wijken.** Gemeten over 72 postcode/bewonertype-combinaties komen er
43 unieke aanbiedersnamen voorbij, waarvan zes langer dan 40 tekens.

1. De bron zet achter een naam soms een afkorting ("Rijksdienst voor Ondernemend Nederland
   (RVO)") en soms een toelichting ("Nationale Hypotheek Garantie (verkrijgbaar via
   hypotheekverstrekkers)", 69 tekens). Bij een afkorting nemen we die afkorting: de bron gebruikt
   voor dezelfde instantie afwisselend "RVO" en de volledige naam, dus zo heet hij op elke kaart
   hetzelfde. Een toelichting gaat er gewoon af. Staan er twee organisaties voor de haakjes
   ("Gemeente Den Haag en Stimuleringsfonds Volkshuisvesting (SVn)"), dan korten we niet in: dan
   zou de gemeente verdwijnen en juist die herkent een bewoner.
2. `SubsidieCard` kapte de aanbieder af met `truncate`. Dat werkte prima toen er "Rijksoverheid"
   stond, maar leverde op mobiel "Rijksdienst voor Onder…" op: middenin een woord afgebroken.
   Headless geverifieerd op 390px. De naam breekt nu af op een spatie en mag een tweede regel
   gebruiken; op 1440px past alles op één regel, op 390px gebruiken drie van de tien kaarten er
   twee.

## Nog te doen
- [ ] Deploy stap 1 (function zonder secret) — moet de opdrachtgever goedkeuren, het is productie.
- [ ] Secret zetten: `bunx supabase secrets set ESW_API_KEY=… --project-ref lfelnfukbrxznkevnevr`
- [ ] Productieverificatie: 9742HJ over vier bewonertypes, `via: "api"` in het antwoord
- [ ] Headless visuele check en één echte overzichtsmail

---

# Vervolg: verrijking met wat de API al meestuurt (2026-08-28)

Branch `feat/subsidiecheck-api-verrijking`, bovenop de API-overstap. Zes punten, allemaal
afgestemd met de opdrachtgever.

## 1. De "Let op" van de bron op de kaart en in de mail

De API heeft een extra alinea (`AdditionalIntro`) die bij dertig van de tweeënveertig
noordelijke regelingen gevuld is. Bijna altijd is dat gewone uitleg, maar **één op de dertig**
begint met "Let op", en dat is precies de belangrijkste: bij ISDE staat er dat je in Groningen
en Noord-Drenthe beter de Isolatieaanpak kunt nemen en de ISDE dan niet hoeft aan te vragen.
Op een Groninger resultatenpagina stonden die twee tot nu toe zonder één woord uitleg naast
elkaar.

Daarom tonen we alleen de "Let op"-variant, en niet de andere negenentwintig: zeldzaam betekent
dat hij opvalt, en gewone uitleg zou de kaarten volschrijven. Zandkleurig vlak uit de huisstijl,
geen rood: het is een aanwijzing, geen fout. Staat ook in de overzichtsmail.

## 2. Einddatum, generiek uit `DateEnd`

Geen losse notitie per regeling, zoals afgesproken. `DateEnd` staat op elke regeling, maar de
bron zet 2050 neer als iets voorlopig doorloopt: vijfentwintig van de tweeënveertig staan zo.
We tonen de datum alleen als hij **binnen drie maanden** valt. Dat zijn er nu twee: Subsidie
Waardevermeerdering (1 september) en Subsidie lokale aanpak isolatie Emmen (1 november).

"Aanvragen kan tot 1 september 2026", met een okerkleurig kalendericoon. Verlopen regelingen
haalt Milieu Centraal zelf weg, dus daar hoeven we niets voor te bouwen.

## 3. Het verzonnen ISDE-percentage eruit

`CURATED_BEDRAG` is weg. Dat was onze eigen schatting "tot ± 30% van de kosten", zonder bron en
zonder dat hij meeliep met wijzigingen. De API zegt zelf waarom er geen bedrag staat, dus:

- Het bedrag-slot toont "verschilt per maatregel" wanneer de bróntekst dat zegt (regex op "hangt
  af van", "verschilt per", "afhankelijk van … maatregel"). Raakt in Noord-Nederland precies
  twee regelingen: ISDE en de Amsterdamse gebouwensubsidie.
- De uitklap krijgt een regel "Bedrag" met de zin van de bron zelf. Dat helpt ook de dertien
  regelingen die helemaal geen getal hebben; die zeiden voorheen nergens iets over het bedrag.
- Zegt de bron niets bruikbaars, dan blijft het slot leeg. Liever niets dan iets verzinnen.

## 4. Negen maatregelen, met de namen van Milieu Centraal

Asbest verwijderen (1613) is de negende. Niet omdat Voortraject asbest saneert, maar omdat een
asbestdak eraf en isolatie erop in Groningen en Drenthe hetzelfde traject is. Levert in
Noord-Nederland twee regelingen op die we misliepen: de Maatwerklening en de Lening verwijderen
asbestdaken Drenthe.

Gasaansluiting verwijderen is bewust **niet** toegevoegd: gemeten levert die nul extra
regelingen op in Noord-Nederland, dus hij zou de chiplijst alleen langer maken.

De labels zijn nu die van Milieu Centraal zelf: "Isolatie en glas" (was "Isolatie & glas") en
"Koken op elektriciteit" (was "Elektrisch koken"). Dezelfde woorden aan beide kanten van de
koppeling, en de tag-labels uit de bron kunnen daardoor rechtstreeks op de kaart.

**Let op voor het CRM-team:** deze labels gaan als platte tekst naar
`leads_bewoners.subsidiecheck_interesses`. Nieuwe rijen krijgen dus de nieuwe schrijfwijze en er
kan "Asbest verwijderen" in staan. Oude rijen blijven zoals ze zijn. Geen kapotte insert (vrije
tekst), maar n8n zet dit veld wel in de communicatiekaart. De edge function `subsidiecheck-mail`
heeft een eigen kopie van de labellijst en moet dus mee gedeployed.

## 5. De maatregelregel terug, maar alleen als beperking

Op de dichte kaart, niet in de uitklap: als iemand een warmtepomp zoekt en er staat een
isolatiesubsidie tussen, moet dat zichtbaar zijn zonder te klikken.

Alleen wanneer een regeling hooguit twee maatregelen dekt. Gemeten: vijftien van de
vijfendertig noordelijke regelingen, bijna allemaal "Alleen voor isolatie en glas".

Geteld op de **volledige** taglijst van de bron, niet op onze negen. De Isolatieaanpak dekt vier
maatregelen waarvan wij er twee aanbieden; "Alleen voor isolatie en glas, ventilatie" zou dan
onwaar zijn, want de regeling dekt ook energieadvies en procesondersteuning. Die krijgt dus geen
regel. Liever geen regel dan een onware.

## 6. Bewaking van de filterlijst

De API Guide zegt expliciet dat filters kunnen wijzigen en niet hardcoded moeten worden. Onze
negen id's staan wél vast, dus we bewaken ze.

- `src/lib/subsidies/esw-filters.snapshot.json` — de momentopname in de repo, zodat zwart op wit
  staat waar we van uitgingen. Alleen maatregelen, bewonertypes en soorten; de 342 gemeenten
  laten we weg, die wijzigen bij elke herindeling en zeggen niets over onze koppeling.
- `scripts/controleer-esw-filters.mjs` — haalt de lijst op en vergelijkt. Drie uitkomsten:
  niets veranderd (exit 0, geen ruis), lijst gewijzigd (exit 1 plus bijgewerkte momentopname),
  een van **onze** id's verdwenen (exit 2, want dan vindt de tool stilletjes niets meer).
- `.github/workflows/esw-filters.yml` — maandagochtend. Bij een wijziging opent de workflow een
  pull request met de nieuwe momentopname, zodat het als leesbare diff langskomt en mergen je
  bevestiging is. Bij een verdwenen id faalt de run in plaats daarvan.

Twee keuzes daarin die afwijken van het eerste voorstel:

- De lijst wordt opgehaald via **onze eigen edge function** (`?meta=filters`, nieuw), niet
  rechtstreeks bij Milieu Centraal. Zo blijft de API-key op één plek staan in plaats van ook nog
  als GitHub-secret te bestaan, en controleert dezelfde run meteen of onze function het nog doet.
- De workflow heeft **geen enkel secret** nodig. De anon-key is publiek en staat al in de repo,
  dus het script leest hem daar uit.

Alle drie de paden zijn end-to-end getest tegen een lokale nepbron: ongewijzigd, hernoemd label
plus nieuwe maatregel, en een verdwenen eigen id.

## Verificatie

412 tests groen (37 nieuw). `bun run build` slaagt. `tsc` en `eslint` geven exact dezelfde
meldingen als `main`. `deno check` op `subsidiecheck` is schoon; `subsidiecheck-mail` heeft
dezelfde vier supabase-js-typefouten als op `main`. Headless gecontroleerd op 1440px en 390px:
de "Let op" leest goed, de einddatum valt op, "Alleen voor isolatie en glas" staat er alleen
waar het klopt, en geen enkele aanbiedersnaam wordt nog afgekapt.

## Nog niet gedaan

- De indeling zelf (koppen in bewonerstaal, "Leningen en overig" hernoemen, één zin die uitlegt
  waarom er groepen zijn). Wacht op akkoord.
- De andere negenentwintig `AdditionalIntro`-teksten in de uitklap. Buiten scope gehouden.
