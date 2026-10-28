# Tracking: contract tussen de site en GTM

Deze pagina beschrijft welke events de site naar de `dataLayer` pusht en welke parameters
daarbij horen. GTM en GA4 leunen hierop: een event hernoemen of een parameter weghalen breekt
stilzwijgend een tag in de container. Werk dit bestand dus bij in dezelfde PR als de codewijziging.

- **Container:** `GTM-P6W5MNN4` (Voortraject.nl)
- **GA4-property:** `G-VQL43876VN`
- **Meta-pixel:** dataset *Voortraject website*, ID in de GTM-variabele `Meta - Pixel ID` (zie hieronder)
- **Helper:** [`src/lib/gtm.ts`](../src/lib/gtm.ts), functie `pushGtmEvent(event, data)`

## Regels

1. **Nooit persoonsgegevens in de dataLayer.** Geen naam, e-mail, telefoonnummer of volledig
   adres. Wel toegestaan: grove context (gemeente, provincie) en aantallen. Deze regel staat ook
   bovenaan `gtm.ts`. `virtual_page_view` stuurt daarom alleen het pad mee; het adres van de
   subsidiecheck staat sinds oktober 2026 ook niet meer in de URL (zie hieronder).
2. **Alleen tekst en getallen.** `pushGtmEvent` accepteert `string | number`. Voor ja/nee gebruiken
   we `1` en `0`, niet `true`/`false`.
3. **Pushen is niet meten.** De site pusht altijd; of er een tag vuurt beslist GTM op basis van de
   Axeptio-consentstatus via Google Consent Mode. Voeg dus nooit een tracker toe die vóór de
   toestemming laadt.

## Events

### Sitebreed

| Event | Wanneer | Parameters | Bron |
|---|---|---|---|
| `virtual_page_view` | Bij client-side navigatie, niet bij de eerste lading | `page_path`, `page_title` | [`RouteTracker.tsx`](../src/components/RouteTracker.tsx) |
| `whatsapp_klik` | Klik op de zwevende WhatsApp-knop | `plek` (`zwevend`) | [`WhatsAppButton.tsx`](../src/components/WhatsAppButton.tsx) |

### Formulieren

| Event | Wanneer | Parameters | Bron |
|---|---|---|---|
| `bewoner_lead` | Geslaagde inzending contactformulier | `heeft_adres` (1/0), `heeft_vraag` (1/0), `event_id` (uuid, ook op de lead als `meta_event_id`) | [`Contact.tsx`](../src/pages/Contact.tsx) |
| `zakelijk_lead` | Geslaagde inzending zakelijk formulier | geen | [`ZakelijkContactFormulier.tsx`](../src/components/ZakelijkContactFormulier.tsx) |

### Subsidiecheck

| Event | Wanneer | Parameters | Bron |
|---|---|---|---|
| `subsidiecheck_stap` | Elke stap die de bezoeker te zien krijgt, ook stap 1 en ook bij binnenkomst halverwege | `stap` (1-3), `stap_naam` | [`Subsidiecheck.tsx`](../src/pages/Subsidiecheck.tsx) |
| `subsidiecheck_start` | Adres bevestigd, stap 1 afgerond | `gemeente`, `provincie`, `event_id` (uuid, voor Meta) | [`StapAdres.tsx`](../src/components/subsidiecheck/StapAdres.tsx) |
| `subsidiecheck_lead` | Gegevens ingevuld bij de poort | `bewonertype`, `aantal_regelingen`, `hulpvraag` (gekozen ids met komma's: `aanvraag`, `uitvoerder`, `plan`; sinds 28-10-2026 leeg als niets gekozen, en `subsidies` komt niet meer voor), `bron_fout` (1/0, alleen bij een bronstoring), `event_id` (uuid, ook op de lead als `meta_event_id`) | [`StapGegevens.tsx`](../src/components/subsidiecheck/StapGegevens.tsx) |
| `subsidiecheck_voltooid` | Resultaat succesvol geladen | `aantal_regelingen`, `bewonertype`, `gemeente`, `provincie` | [`StapResultaat.tsx`](../src/components/subsidiecheck/StapResultaat.tsx) |
| `subsidiecheck_vraag_cta` | Klik op een knop op het resultaat die een verzoek indient of naar het vraagblok springt | `bewonertype`, `plek` (`uitzoeken` = de oker knop "Laat gratis uitzoeken wat ik krijg", in de hoofdtegel of de mobiele actiebalk; `isolatieplan` = "Ik wil een isolatieplan aanvragen", alleen in het Nij Begun-gebied; `energielabel` = "Label aanvragen"). `woningpaneel` en `eerste_stap` komen sinds oktober 2026 niet meer voor. | [`StapResultaat.tsx`](../src/components/subsidiecheck/StapResultaat.tsx), [`useUitzoek.ts`](../src/components/subsidiecheck/useUitzoek.ts) |
| `subsidiecheck_vraag` | Vraag daadwerkelijk verstuurd | `bewonertype`, `bekend_contact` (1/0) | [`DirectContact.tsx`](../src/components/subsidiecheck/DirectContact.tsx) |
| `subsidiecheck_whatsapp` | Klik op WhatsApp binnen de check | `bewonertype`, `plek` (`actiebalk`) | [`DirectContact.tsx`](../src/components/subsidiecheck/DirectContact.tsx), [`MobieleActiebalk.tsx`](../src/components/subsidiecheck/MobieleActiebalk.tsx) |
| `subsidiecheck_deel` | Bezoeker kopieert de link naar de check | `bewonertype` | [`DeelDeCheck.tsx`](../src/components/subsidiecheck/DeelDeCheck.tsx) |

**Delen meet je aan twee kanten.** `subsidiecheck_deel` telt de verzendkant: hoeveel bezoekers de
check doorgeven. De ontvangkant komt niet uit dit event maar uit de utm-tags in de gedeelde link
(`utm_source=deel`, met `utm_medium=link` vanaf het resultaat en `mail` vanuit de overzichtsmail).
Een link die iemand in WhatsApp plakt komt zonder referrer binnen, dus zonder die tags zou elke
doorgestuurde bezoeker als direct verkeer binnenkomen en was het effect van delen onzichtbaar. In
GA4 staan ze gewoon onder Bron/Medium.

Let op het verschil tussen `subsidiecheck_stap` en `subsidiecheck_start`. Het eerste meet dat een
stap getóónd is (de noemer), het tweede dat stap 1 is afgerond (de teller). Zonder allebei valt
uitval niet te berekenen.

`subsidiecheck_lead` kwam eerder uit twee plekken: de gegevens-poort en een los "mail mij dit
overzicht"-blok ná het resultaat. Dat tweede blok is weg, samen met de schakelaar waarmee de poort
uit kon. Elke lead uit de check komt nu dus uit de poort, en het `poort`-veld op
`subsidiecheck_stap` is daarmee vervallen (het stond in élke rij op 1).

### Reikwijdte van `virtual_page_view`

Bijna alle links op de site zijn gewone `<a href>` en doen dus een volledige herlading; die
paginaweergaves telt de GA4-configuratietag al. `virtual_page_view` dekt alleen de client-side
navigatie: de subsidiecheck-CTA op de homepage (`SubsidiecheckCta` doet `navigate()`) en de vijf
`<Navigate>`-redirects in `App.tsx`. Klein in aantal, maar de eerste is wel het belangrijkste
instappunt van de tool.

Stapwissels binnen de subsidiecheck veranderen alleen de querystring (en de history-state) en
tellen bewust niet als paginaweergave; daarvoor is `subsidiecheck_stap`.

## Het adres van de subsidiecheck staat nooit in de URL

Tot oktober 2026 stond de hele check in de querystring (`?pc=…&hn=…&tv=…`, plus `str`/`pl` bij een
handmatig adres). De Meta-pixel stuurt bij elk event de volledige URL mee, en dat is in GTM niet te
schonen. Daarom staat het adres nu in de state van de history-entry (`history.state`), niet in de
URL. Terug, vooruit en herladen werken gewoon: de browser bewaart die state per entry.

- **Links mét adres blijven werken** (de "bekijk online"-link in de overzichtsmail, oude
  bladwijzers). Het inline script `sc-adres-uit-url`, het eerste script in `<head>` van
  [`index.html`](../index.html), haalt `pc`, `hn`, `tv`, `str` en `pl` uit de URL vóórdat GTM en
  Axeptio laden (`history.replaceState`), alleen op `/subsidiecheck`, en zet ze klaar in
  `window.__scAdresUitUrl`. Al het andere (utm-tags, `fbclid`, `type`, `m`, `test`) blijft staan.
- [`AdresUitUrl.tsx`](../src/components/subsidiecheck/AdresUitUrl.tsx) (in `App.tsx`, vóór
  `RouteTracker`) zet dat adres in de history-state. Komt er via een navigatie binnen de app tóch een
  adres in de URL, dan haalt hij het er meteen uit (`replace`), vóór `virtual_page_view` en de
  meetmomenten van de check: zijn effect draait vóór dat van RouteTracker en van de check.
- **Binnen de site geeft elke link naar de check het adres mee als state** (`metAdres` in
  [`checkStaat.ts`](../src/components/subsidiecheck/checkStaat.ts)), nooit in de URL. Alleen
  `bouwOverzichtUrl` zet het adres in een URL, en die gaat alleen per mail naar de bezoeker en het
  team. `src/test/adresUitUrl.test.tsx` bewaakt dit.
- De GA4-tags sturen `page_location` nog steeds via de opschoon-variabele
  `{{js - page_location zonder adres}}`. Dat is nu een tweede slot op de deur.

## Herkomst en `event_id` bij een lead

**Herkomst.** [`src/lib/herkomst.ts`](../src/lib/herkomst.ts) bewaart bij binnenkomst, op elke
pagina, `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content` en `fbclid` in
`sessionStorage` (`sc_herkomst`). Eerste aanraking: een tweede campagne in hetzelfde tabblad
overschrijft niets. Alleen waarden van de tekens `A-Z a-z 0-9 _ . - { } : |` komen erdoor, utm-tags
tot 150 tekens en `fbclid` tot 500; de rest valt weg. Een naam met een spatie valt dus helemaal weg,
vandaar de afspraak over namen zonder spaties in `tasks/meta-advertenties-structuur.md` (CRM-repo).
De utm-tags en `fbclid` blijven tijdens de check in de URL staan, zodat de pixel de `fbclid` nog
vindt als de bezoeker pas halverwege toestemming geeft.

De lead neemt de herkomst mee naar de edge function `subsidiecheck-mail` (veld `herkomst`). Die
controleert alles opnieuw met dezelfde regels (`schoonHerkomst` in `beveiliging.ts`; dat is de laag
die telt) en schrijft het naar de gelijknamige kolommen op `leads_bewoners` in het CRM. **Nooit in
een mail**, ook niet in de teammail. Bestaan de kolommen nog niet (PostgREST `PGRST204`, Postgres
`42703`), dan schrijft de function de lead zonder herkomst en logt hij een waarschuwing
(`leadInsert.ts`).

**`event_id`.** `subsidiecheck_start` en `subsidiecheck_lead` pushen elk een `event_id` (een uuid,
`maakEventId`). Container v9 geeft die als `eventID` door aan Meta (variabele
`Meta - dlv - event_id`). Het `event_id` van de lead gaat ook mee naar de function (veld `eventId`;
alleen een uuid komt erdoor) en landt in `leads_bewoners.meta_event_id`, zodat een Lead uit de
browser later te ontdubbelen is tegen dezelfde Lead via de Conversions API.

**Contactformulier.** Sinds oktober 2026 schrijft ook `/contact` de herkomst weg: dezelfde kolommen
(`utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `fbclid`) plus
`meta_event_id`, rechtstreeks in de anonieme insert. De herkomst komt uit sessionStorage (first
touch), met als terugval de querystring van `/contact`. Die querystring vult de knop
"Bel mij" naast "Zoek mijn subsidies" op stap 1 van de check (`LieverBellen.tsx`); het adres
dat daar al getypt was gaat mee in de history-state, nooit in de URL, net als `bellen: true` (het
korte formulier). `bewoner_lead` pusht hetzelfde `event_id` als `meta_event_id`; via die knop is
`heeft_vraag` vaak 0, omdat het bericht daar optioneel is.

**Meta vuurt alleen na toestemming.** De site pusht `event_id` altijd mee, net als de rest van de
dataLayer; of er iets naar Meta gaat beslist GTM, en elke Meta-trigger vraagt eerst
Axeptio-toestemming voor de Meta-service. De cookies `_fbp` en `_fbc` (90 dagen) staan in de
[cookieverklaring](../src/pages/Cookie.tsx).

## Wat bewust in GTM zit en niet in de code

Klikken op `tel:` en `mailto:` links worden in de container afgevangen met een trigger op Click URL.
Die links staan verspreid over Footer, Contact, OfBelOnsCta en Binnenkort; een trigger op één plek
is minder onderhoud dan vijf losse `onClick`-handlers, en er is geen extra context nodig die de
code wel kent en GTM niet.

De zwevende WhatsApp-knop doet dat juist wél in code, omdat een generieke klik-trigger op `wa.me`
ook de knoppen ín de subsidiecheck zou vangen. Die pushen al hun eigen event, en dan tel je dubbel.

### Voorwaarde: klikken moeten `document` bereiken

Een klik-trigger in GTM luistert op `document`. Roep dus nooit `stopPropagation()` aan in een
klikhandler die boven een link zit, want dan meet je die link nergens meer. Let op de valkuil met
React: die koppelt zijn listeners op de root-container, dus een `stopPropagation()` in een
React-handler houdt óók het native event tegen.

Dit is één keer misgegaan in het mobiele menu, waar het paneel een `stopPropagation()` had om te
voorkomen dat de achtergrond-klik het menu sloot. Gevolg: geen enkele klik in het mobiele menu
werd gemeten. Gebruik in plaats daarvan `e.target === e.currentTarget` op de achtergrond, zoals nu
in `Header.tsx`. `src/test/mobielMenuKlik.test.tsx` bewaakt dit.

## Consent

De veilige startwaarde (`gtag('consent', 'default', …)` met alles op `denied`) staat inline
bovenaan `<head>` in [`index.html`](../index.html), vóór het GTM-snippet. Dat moet daar staan:
Axeptio laadt async, en een consent-signaal dat nog niet gezet is behandelt Google als `granted`.
Axeptio stuurt daarna alleen nog de update na de keuze van de bezoeker.

## Meta-pixel

Sinds container v9 draait naast GA4 ook de Meta-pixel, volledig in GTM: de site pusht er niets
extra's voor. Eén pixel voor de hele site, en per funnel dezelfde drie standaardevents met een eigen
`content_name` (afspraak: `tasks/meta-advertenties-structuur.md` in het CRM-repo).

| Meta-event | Op welk dataLayer-event | content_name |
|---|---|---|
| `PageView` | de Axeptio-toestemming (eerste weergave) en `virtual_page_view` | — |
| `ViewContent` | `subsidiecheck_start` | `subsidiecheck` |
| `Lead` | `subsidiecheck_lead` | `subsidiecheck` |
| `Lead` | `bewoner_lead` (contactformulier, sinds v10) | `contact` |

- **Toestemming:** niets van Meta vuurt zonder Axeptio-toestemming voor de Meta-service
  (`facebook_pixel`, GTM-variabele `Meta - Axeptio service`). Meta kent Google Consent Mode niet;
  de voorwaarde zit daarom op elke Meta-trigger via `{{Meta - Toestemming}}`.
- **`event_id`:** stuurt een push een `event_id` mee, dan gaat die als `eventID` naar Meta, voor
  latere deduplicatie met de Conversions API. `subsidiecheck_start`, `subsidiecheck_lead` en `bewoner_lead` doen dat
  (zie *Herkomst en `event_id` bij een lead* hierboven); een push zonder `event_id` gaat zonder.
- **Adres in de URL:** de pixel stuurt de volledige URL mee. Postcode en huisnummer staan daarom
  nooit in de URL van `/subsidiecheck`: het script bovenaan `index.html` en `AdresUitUrl` halen ze
  eruit voordat GTM iets meet (#212). Zet nooit meer persoonsgegevens in een querystring.
- **Nieuwe funnel:** laat de code een `<funnel>_start` en `<funnel>_lead` pushen (met `pushGtmEvent`,
  zodat `gtmContainer.test.ts` ze ziet) en voeg in GTM twee triggers en twee rijen in de opzoektabel
  `Meta - content_name` toe. Stappenplan, importeren (Samenvoegen, nooit Overschrijven) en het
  invullen van het pixel-ID: [`gtm/README.md`](gtm/README.md#meta-pixel).
