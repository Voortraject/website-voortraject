# Tracking: contract tussen de site en GTM

Deze pagina beschrijft welke events de site naar de `dataLayer` pusht en welke parameters
daarbij horen. GTM en GA4 leunen hierop: een event hernoemen of een parameter weghalen breekt
stilzwijgend een tag in de container. Werk dit bestand dus bij in dezelfde PR als de codewijziging.

- **Container:** `GTM-P6W5MNN4` (Voortraject.nl)
- **GA4-property:** `G-VQL43876VN`
- **Helper:** [`src/lib/gtm.ts`](../src/lib/gtm.ts), functie `pushGtmEvent(event, data)`

## Regels

1. **Nooit persoonsgegevens in de dataLayer.** Geen naam, e-mail, telefoonnummer of volledig
   adres. Wel toegestaan: grove context (gemeente, provincie) en aantallen. Deze regel staat ook
   bovenaan `gtm.ts` en is de reden dat `virtual_page_view` alleen het pad meestuurt: op
   `/subsidiecheck` staat het adres van de bezoeker in de querystring.
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
| `bewoner_lead` | Geslaagde inzending contactformulier | `heeft_adres` (1/0), `heeft_vraag` (1/0) | [`Contact.tsx`](../src/pages/Contact.tsx) |
| `zakelijk_lead` | Geslaagde inzending zakelijk formulier | geen | [`ZakelijkContactFormulier.tsx`](../src/components/ZakelijkContactFormulier.tsx) |

### Subsidiecheck

| Event | Wanneer | Parameters | Bron |
|---|---|---|---|
| `subsidiecheck_stap` | Elke stap die de bezoeker te zien krijgt, ook stap 1 en ook bij binnenkomst halverwege | `stap` (1-3), `stap_naam`, `poort` (1/0) | [`Subsidiecheck.tsx`](../src/pages/Subsidiecheck.tsx) |
| `subsidiecheck_start` | Adres bevestigd, stap 1 afgerond | `gemeente`, `provincie` | [`StapAdres.tsx`](../src/components/subsidiecheck/StapAdres.tsx) |
| `subsidiecheck_lead` | Gegevens ingevuld bij de poort, of overzicht per mail aangevraagd | `bewonertype`, `aantal_regelingen`, `hulpvraag`, `bron_fout` (1/0, alleen bij een bronstoring) | [`StapGegevens.tsx`](../src/components/subsidiecheck/StapGegevens.tsx), [`MailOverzicht.tsx`](../src/components/subsidiecheck/MailOverzicht.tsx) |
| `subsidiecheck_voltooid` | Resultaat succesvol geladen | `aantal_regelingen`, `bewonertype`, `gemeente`, `provincie` | [`StapResultaat.tsx`](../src/components/subsidiecheck/StapResultaat.tsx) |
| `subsidiecheck_vraag_cta` | Klik op een knop die naar het vraagblok springt | `bewonertype`, `plek` (`woningpaneel` = "Ik heb een vraag", `energielabel` = "Label aanvragen", `eerste_stap` = de bouwjaarvraag onder de conclusie) | [`StapResultaat.tsx`](../src/components/subsidiecheck/StapResultaat.tsx) |
| `subsidiecheck_vraag` | Vraag daadwerkelijk verstuurd | `bewonertype`, `bekend_contact` (1/0) | [`DirectContact.tsx`](../src/components/subsidiecheck/DirectContact.tsx) |
| `subsidiecheck_whatsapp` | Klik op WhatsApp binnen de check | `bewonertype`, `plek` (`actiebalk`) | [`DirectContact.tsx`](../src/components/subsidiecheck/DirectContact.tsx), [`MobieleActiebalk.tsx`](../src/components/subsidiecheck/MobieleActiebalk.tsx) |
| `subsidiecheck_deel` | Bezoeker geeft de check door | `kanaal` (`whatsapp` / `link`), `bewonertype` | [`DeelDeCheck.tsx`](../src/components/subsidiecheck/DeelDeCheck.tsx) |

**Delen meet je aan twee kanten.** `subsidiecheck_deel` telt de verzendkant: hoeveel bezoekers de
check doorgeven. De ontvangkant komt niet uit dit event maar uit de utm-tags in de gedeelde link
(`utm_source=deel`, `utm_medium=whatsapp` of `link`, en `mail` vanuit de overzichtsmail). WhatsApp
stuurt geen referrer mee, dus zonder die tags zou elke doorgestuurde bezoeker als direct verkeer
binnenkomen en was het effect van delen onzichtbaar. In GA4 staan ze gewoon onder Bron/Medium.

Let op het verschil tussen `subsidiecheck_stap` en `subsidiecheck_start`. Het eerste meet dat een
stap getóónd is (de noemer), het tweede dat stap 1 is afgerond (de teller). Zonder allebei valt
uitval niet te berekenen.

`subsidiecheck_lead` komt uit twee plekken met een verschillende betekenis. Bij de gegevens-poort
(`StapGegevens`) is het de toegangspoort vóór het resultaat; bij `MailOverzicht` is het een
mailverzoek ná het resultaat. Alleen de eerste stuurt `bewonertype` en `hulpvraag` mee, dus daaraan
zijn ze in GA4 te onderscheiden.

### Reikwijdte van `virtual_page_view`

Bijna alle links op de site zijn gewone `<a href>` en doen dus een volledige herlading; die
paginaweergaves telt de GA4-configuratietag al. `virtual_page_view` dekt alleen de client-side
navigatie: de subsidiecheck-CTA op de homepage (`SubsidiecheckCta` doet `navigate()`) en de vijf
`<Navigate>`-redirects in `App.tsx`. Klein in aantal, maar de eerste is wel het belangrijkste
instappunt van de tool.

Stapwissels binnen de subsidiecheck veranderen alleen de querystring en tellen bewust niet als
paginaweergave; daarvoor is `subsidiecheck_stap`.

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
