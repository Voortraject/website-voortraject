# GTM-container

`GTM-P6W5MNN4_v6.json` is de volledige containerconfiguratie voor **GTM-P6W5MNN4**
(Voortraject.nl), gekoppeld aan GA4-property **G-VQL43876VN**.

De container staat hier in versiebeheer zodat hij samen met de code te reviewen is en niet
opnieuw wegdrijft. `src/test/gtmContainer.test.ts` faalt zodra de code een event pusht waar geen
trigger voor is, of andersom. Zie [`../tracking.md`](../tracking.md) voor de betekenis van de
events zelf.

## Importeren

Doe dit **pas nadat de bijbehorende code live staat**, anders vuren de nieuwe triggers nog nergens op.

1. GTM → **Beheer** → **Container importeren**
2. Kies `GTM-P6W5MNN4_v6.json`
3. Werkruimte: **Nieuw** (noem hem bijvoorbeeld "v6 - opschoning en subsidietool")
4. Importoptie: **Overschrijven**

   Bewust overschrijven en niet samenvoegen: alleen zo verdwijnen de tags die eruit moeten.
   Samenvoegen laat ze staan. Je verliest niets, want v5 blijft als versie bestaan en is met
   één klik terug te zetten via **Versies** → v5 → **Publiceren**.
5. Controleer in het overzicht dat er 17 tags, 16 triggers en 16 variabelen staan
6. **Preview** en loop de controlelijst hieronder af
7. Publiceren

### Meteen na de import controleren

De tag **GA4 - Configuratie** hoort te vuren op **Initialization - All Pages**. In v5 stond die
op *Consent Initialization*, en die trigger is door Google gereserveerd voor de cookiebanner zelf.
Als het veld er na de import anders uitziet, zet het dan handmatig goed.

## Wat er verandert ten opzichte van v5

### Weg

| Wat | Waarom |
|---|---|
| `Event - Klik uitvoerder` + trigger | Het woord "uitvoerder" staat niet meer in de navigatie. Het is een "alle elementen"-klik-trigger, dus hij vuurde op lopende tekst (Privacy bevat het woord 9 keer). Meet ruis. |
| `Event - Klik bewoner` + trigger | Idem. Beide zijn gebouwd voor de oude `/uitvoerders` en `/bewoners` pagina's, die nu doorverwijzen. |

### Gewijzigd

| Wat | Van | Naar |
|---|---|---|
| `GA4 - Configuratie` trigger | Consent Initialization | Initialization - All Pages |
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
`nav_bestemming`, `bron_fout`, `poort`, `wil_gebeld`, `bekend_contact`, `heeft_adres`,
`heeft_vraag`, `scroll_percentage`

Dat zijn alle parameters die de container meestuurt, op `page_location` en `page_title` na: die
kent GA4 al standaard.

**Aangepaste statistieken** (bereik *Gebeurtenis*, type *Standaard*): `aantal_regelingen`, `stap`

**Sleutelgebeurtenissen** (Beheer → Sleutelgebeurtenissen): `bewoner_lead`, `zakelijk_lead`,
`subsidiecheck_lead`. Dit zijn de drie echte conversies; de rest is gedrag.

GA4 kent een limiet van 50 aangepaste dimensies per property, dus daar zit ruimte genoeg.
Let op: dimensies werken niet met terugwerkende kracht, dus maak ze aan vóór of direct na het
publiceren van de container.

## Bekende beperking

De scroll-trigger start op `WINDOW_LOAD`. Voor de paar plekken waar React Router client-side
navigeert (de subsidiecheck-CTA op de homepage en de redirects) telt de scrolldiepte van de
volgende pagina dus niet opnieuw. Voor de rest van de site zijn het gewone paginaladingen en klopt
het wel. Niet opgelost omdat de winst klein is en de oplossing (een eigen scroll-listener) meer
onderhoud kost dan hij oplevert.
