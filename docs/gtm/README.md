# GTM-container

`GTM-P6W5MNN4_v9.json` is de volledige containerconfiguratie voor **GTM-P6W5MNN4**
(Voortraject.nl), gekoppeld aan GA4-property **G-VQL43876VN** en, zodra het ID is ingevuld, aan de
Meta-pixel (dataset *Voortraject website*).

v9 is met de hand gebouwd uit `GTM-P6W5MNN4_v8.json` (de laatste export die rechtstreeks uit GTM
kwam) en voegt daar alleen de Meta-pixel aan toe. v8 blijft hier staan als referentie:
`src/test/gtmContainer.test.ts` controleert dat elke tag, trigger en variabele uit v8 ongewijzigd in
v9 zit, en faalt zodra de code een event pusht waar geen trigger voor is, of andersom. Zie
[`../tracking.md`](../tracking.md) voor de betekenis van de events zelf.

## Importeren (v9)

Doe dit **pas nadat de bijbehorende code live staat**, anders vuren de nieuwe triggers nog nergens op.
Voor v9 is dat al zo: de Meta-tags luisteren naar events die de site nu al pusht.

1. GTM → **Beheer** → **Container importeren**
2. Kies `GTM-P6W5MNN4_v9.json`
3. Werkruimte: **Nieuw**, bijvoorbeeld "v9 - Meta-pixel"
4. Importoptie: **Samenvoegen** → **Conflicterende tags, triggers en variabelen hernoemen**.
   **Nooit Overschrijven**: dan gooit GTM alles weg wat sinds v8 in de live container is
   veranderd. Met samenvoegen komen er alleen de twaalf `Meta - `-items bij; staat er in het
   voorbeeldscherm iets anders dan "toegevoegd" bij een bestaand item, stop dan en vergelijk eerst.
5. Vul het pixel-ID in (zie hieronder)
6. Controleer in het overzicht dat er **21 tags, 21 triggers en 20 variabelen** staan
   (v8: 18, 17 en 15)
7. **Preview** en loop de controlelijst hieronder af, plus die van de Meta-pixel
8. Publiceren

## Meta-pixel

| Item | Soort | Wat het doet |
|---|---|---|
| `Meta - Pixel ID` | Constante | Het pixel-ID: `1138129071891178` (dataset *Voortraject website*). Met de placeholder `PIXEL_ID_INVULLEN` laadt de pixel niet |
| `Meta - Axeptio service` | Constante | De technische naam van de Meta-service in Axeptio: `facebook_pixel` |
| `Meta - Toestemming` | Aangepast JavaScript | `true` als Axeptio toestemming heeft voor die service, anders `false` |
| `Meta - content_name` | Opzoektabel op `{{Event}}` | Welke funnel een event is: `subsidiecheck_start` en `subsidiecheck_lead` → `subsidiecheck` |
| `Meta - dlv - event_id` | Gegevenslaagvariabele | `event_id` uit de push, voor latere deduplicatie met de Conversions API |
| `Meta - Axeptio toestemming` | Trigger | Aangepast event dat matcht op `^axeptio_(activate_.+\|enable_.+\|update)$`, alleen als `{{Meta - Toestemming}}` = `true` |
| `Meta - Event \| virtual_page_view` | Trigger | `virtual_page_view`, alleen met toestemming |
| `Meta - Event \| subsidiecheck_start` | Trigger | `subsidiecheck_start`, alleen met toestemming |
| `Meta - Event \| subsidiecheck_lead` | Trigger | `subsidiecheck_lead`, alleen met toestemming |
| `Meta - Pixel basis` | Tag (HTML) | Laadt `fbevents.js`, `fbq('init', …)`, stuurt `PageView`. Vuurt op de twee eerste triggers |
| `Meta - ViewContent` | Tag (HTML) | `fbq('track', 'ViewContent', { content_name }, { eventID })` op `subsidiecheck_start` |
| `Meta - Lead` | Tag (HTML) | `fbq('track', 'Lead', { content_name }, { eventID })` op `subsidiecheck_lead` |

ViewContent en Lead hebben `Meta - Pixel basis` als **setup-tag** (tagvolgorde), zodat `fbq` altijd
geladen is voordat ze vuren. In die rol stuurt de basistag geen extra PageView: dat doet hij alleen
bij `virtual_page_view` of een Axeptio-event, en hooguit één keer per pad.

**Toestemming.** Niets van Meta vuurt zonder toestemming voor de Meta-service in Axeptio. Dat zit
niet in Google Consent Mode (de pixel kent die niet) maar in de voorwaarde op elke Meta-trigger.
`Meta - Toestemming` leest de laatste `axeptio_authorized_vendors`-push zelf uit `window.dataLayer`
in plaats van via een gewone gegevenslaagvariabele: GTM voegt arrays per index samen, dus na het
intrekken van toestemming zou de oude lijst op een latere index blijven staan. Komt de toestemming
pas ná een funnel-event, dan gaat dat ene event niet naar Meta; dat is bewust.

**SPA.** Net als bij GA4 telt de pixel de eerste weergave zelf (op het Axeptio-event, want eerder
mag hij niet laden) en daarna alleen `virtual_page_view`. De automatische pushState-telling van de
pixel staat uit (`fbq.disablePushState = true`), anders telt elke stapwissel in de check als
paginaweergave. Ook `autoConfig` staat uit: geen automatische knopklik-events.

### Pixel-ID invullen

Ingevuld op 24-10-2026: `1138129071891178`, de dataset *Voortraject website* (Events Manager → de
dataset → Instellingen). Niet de WhatsApp-dataset `4241724042749562`. Verandert het ID ooit, pas dan
GTM → **Variabelen** → `Meta - Pixel ID` aan én dit bestand, anders zet de volgende import het oude
ID terug.

De Axeptio-service staat op dezelfde manier in `Meta - Axeptio service`. Klopt `facebook_pixel` niet
met de technische naam in de Axeptio-admin, dan alleen die waarde aanpassen.

### Controleren in Preview

1. Zonder keuze in de banner: geen enkele `Meta - `-tag vuurt, ook niet op `subsidiecheck_start`
2. Meta weigeren: idem
3. Meta accepteren: `Meta - Pixel basis` vuurt op het Axeptio-event. Kijk in het tabblad
   *Gegevenslaag* hoe het event heet en hoe `axeptio_authorized_vendors` eruitziet (verwacht: een
   lijst met `facebook_pixel`); in het Network-tabblad gaat er één `tr?…ev=PageView` naar facebook.com
4. Pagina herladen: vuurt de basistag opnieuw op een Axeptio-event? Zo niet, dan pusht Axeptio bij
   een terugkerende bezoeker niets en moet er een trigger bij
5. Subsidiecheck: adres invullen → `Meta - ViewContent`; gegevens versturen → `Meta - Lead`, beide
   met `content_name: subsidiecheck`. Controleer met de Meta Pixel Helper
6. Toestemming intrekken via het Axeptio-icoon en verder klikken: geen Meta-events meer

### Een nieuwe funnel toevoegen

Zelfde drie events, eigen `content_name`, geen eigen pixel (zie de afspraken in het CRM-repo,
`tasks/meta-advertenties-structuur.md`). Stel de funnel pusht `zakelijk_start` en `zakelijk_lead`:

1. Trigger `Meta - Event | zakelijk_start` (aangepast event, plus de voorwaarde
   `{{Meta - Toestemming}}` is gelijk aan `true`) en net zo voor `zakelijk_lead`
2. Die triggers toevoegen aan `Meta - ViewContent` en `Meta - Lead`
3. Twee rijen in `Meta - content_name`: `zakelijk_start` → `zakelijk`, `zakelijk_lead` → `zakelijk`
4. Export bijwerken en `gtmContainer.test.ts` uitbreiden (de test controleert dat opzoektabel en
   triggers op elkaar aansluiten)

Wil een funnel ooit deduplicatie met de Conversions API, laat de code dan een `event_id` meesturen in
de push. De tags geven die automatisch als `eventID` door; zonder `event_id` laten ze hem weg.

## Na élke import: GA4 - Configuratie controleren

De tag **GA4 - Configuratie** hoort te vuren op **Initialization - All Pages**. *Consent
Initialization* is door Google gereserveerd voor tags die de consent-status zetten, zoals de
cookiebanner zelf; daar hoort de GA4-configuratie niet op.

Let op de twee ingebouwde trigger-IDs in de export. Ze lijken op elkaar en zijn precies één keer
verwisseld geraakt (in v6, waardoor v6 én v7 de tag op de verkeerde trigger zetten):

| ID in de export | Trigger in GTM |
|---|---|
| `2147479572` | Consent Initialization - All Pages — **niet gebruiken** voor gewone tags |
| `2147479573` | Initialization - All Pages — hier hoort `GA4 - Configuratie` op |

Controleer dit dus na élke import, en werk dit bestand bij zodra je iets in GTM handmatig
verandert. Anders draait de volgende import je correctie terug; dat is precies wat er tussen v6 en
v8 gebeurd is.

## Wat v9 verandert ten opzichte van v8

Alleen toevoegingen: de twaalf `Meta - `-items hierboven. Niets uit v8 is gewijzigd of weg.

## Wat v8 veranderde ten opzichte van v7

`GA4 - Configuratie` staat weer op **Initialization - All Pages** in plaats van op *Consent
Initialization*. Verder identiek aan v7. Deze export komt rechtstreeks uit GTM (versie 8), dus hij
is één op één wat er live draait. v8 werd met **Overschrijven** geïmporteerd omdat hij items
weghaalde (18 tags, 17 triggers, 15 variabelen); v9 voegt alleen toe en gaat met Samenvoegen.

## Wat v7 veranderde ten opzichte van v6

| Wat | Waarom |
|---|---|
| **Nieuw:** `Event - Subsidiecheck deel` + trigger `Event \| subsidiecheck_deel` | Meet dat een bezoeker de link naar de check kopieert om door te geven. Parameter: `bewonertype`. |
| **Weg:** variabele `dlv - poort` en de parameter `poort` op `Event - Subsidiecheck stap` | De gegevens-poort is niet meer uit te zetten, dus dat veld stond in élke rij op 1. |

De ontvangkant van delen zit niet in de container maar in utm-tags op de gedeelde link
(`utm_source=deel`, `utm_medium=link` of `mail`). Die komen in GA4 vanzelf onder Bron/Medium
terecht. Zie [`../tracking.md`](../tracking.md).

## Wat er verandert ten opzichte van v5

### Weg

| Wat | Waarom |
|---|---|
| `Event - Klik uitvoerder` + trigger | Het woord "uitvoerder" staat niet meer in de navigatie. Het is een "alle elementen"-klik-trigger, dus hij vuurde op lopende tekst (Privacy bevat het woord 9 keer). Meet ruis. |
| `Event - Klik bewoner` + trigger | Idem. Beide zijn gebouwd voor de oude `/uitvoerders` en `/bewoners` pagina's, die nu doorverwijzen. |

### Gewijzigd

| Wat | Van | Naar |
|---|---|---|
| `GA4 - Configuratie` trigger | Initialization - All Pages | *bedoeld* was hetzelfde te houden, maar v6 zette hem per ongeluk op Consent Initialization — hersteld in v8, zie hierboven |
| `GA4 - Configuratie` page_location | kale URL, inclusief het adres uit de subsidiecheck | `{{js - page_location zonder adres}}` |
| Nav-trigger | klik-tekst, met drie labels die niet meer bestaan | linkklik binnen `header a`, plus `nav_bestemming` als parameter |
| `Klik contactlink` | elk element met "contact" in de tekst | linkklik naar een URL met `/contact` |
| Subsidiecheck-tags | alleen de telling | inclusief gemeente, provincie, bewonertype, aantal_regelingen, hulpvraag en bron_fout |

De nav-trigger werkt nu op de link zelf in plaats van op de zichtbare tekst. Daardoor breekt hij
niet meer als iemand een menu-item hernoemt, wat precies is wat er tussen v3 en nu gebeurd is.
De selector `header a` dekt zowel de desktopnavigatie als het mobiele menu, want `MobileMenu`
wordt binnen het `<header>`-element gerenderd.

### Nieuw

Tags voor de events die de code al pushte maar die nergens aankwamen: `subsidiecheck_start`,
`subsidiecheck_vraag`, `subsidiecheck_vraag_cta`, `subsidiecheck_whatsapp` en `zakelijk_lead`.
Plus de nieuwe events `virtual_page_view`, `subsidiecheck_stap`, `bewoner_lead`, `whatsapp_klik`,
`telefoon_klik` en `mail_klik`.

## Nog te doen in GA4 zelf

Dit kan niet vanuit de container en is wél nodig, anders verzamel je de parameters wel maar zie je
ze nergens terug in de rapporten.

**Aangepaste dimensies** (Beheer → Aangepaste definities → Aangepaste dimensie maken), allemaal met
bereik *Gebeurtenis*:

`gemeente`, `provincie`, `bewonertype`, `hulpvraag`, `plek`, `stap_naam`, `nav_item`,
`nav_bestemming`, `bron_fout`, `wil_gebeld`, `bekend_contact`, `heeft_adres`, `heeft_vraag`,
`scroll_percentage`

(`poort` stond hier ook; die parameter bestaat niet meer. Een dimensie die je al aangemaakt hebt
kan gewoon blijven staan, hij vult zich alleen niet meer.)

Dat zijn alle parameters die de container meestuurt, op `page_location` en `page_title` na: die
kent GA4 al standaard.

**Aangepaste statistieken** (bereik *Gebeurtenis*, type *Standaard*): `aantal_regelingen`, `stap`

**Sleutelgebeurtenissen** (Beheer → Sleutelgebeurtenissen): `bewoner_lead`, `zakelijk_lead`,
`subsidiecheck_lead`. Dit zijn de drie echte conversies; de rest is gedrag.

GA4 kent een limiet van 50 aangepaste dimensies per property, dus daar zit ruimte genoeg.
Let op: dimensies werken niet met terugwerkende kracht, dus maak ze aan vóór of direct na het
publiceren van de container.

## Bekende beperkingen

**Meta krijgt de volledige URL.** De pixel stuurt bij elk event `window.location.href` mee, en die
is niet vanuit GTM te overschrijven zoals bij GA4 met `{{js - page_location zonder adres}}`. Opgelost
aan de kant van de site (#212): postcode en huisnummer staan niet meer in de URL van
`/subsidiecheck`; een deeplink met `?pc=…&hn=…` wordt bij binnenkomst geschoond voordat GTM laadt.
Publiceer v9 dus nooit op een versie van de site van vóór #212.

**Scrolldiepte na client-side navigatie.**

De scroll-trigger start op `WINDOW_LOAD`. Voor de paar plekken waar React Router client-side
navigeert (de subsidiecheck-CTA op de homepage en de redirects) telt de scrolldiepte van de
volgende pagina dus niet opnieuw. Voor de rest van de site zijn het gewone paginaladingen en klopt
het wel. Niet opgelost omdat de winst klein is en de oplossing (een eigen scroll-listener) meer
onderhoud kost dan hij oplevert.
