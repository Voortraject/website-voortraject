# Lessons

Project-specific lessons learned for the Voortraject website. Add a dated entry whenever
the user corrects course or a non-obvious gotcha surfaces. Review at session start.

<!-- Template:
## YYYY-MM-DD — short title
**Context:** what happened
**Lesson:** the rule to follow next time
-->

## 2026-07-06 — Mobiele safe-area witte stroken: fixed i.p.v. absolute, en body-navy
**Context:** Twee eerdere pogingen om de witte stroken boven de header / onder de footer op
iOS Safari navy te maken faalden. Aanpak: `theme-color`, `html`-navy, en een *absolute* navy
strook (`inset-x-0 top-0`, hoogte `env(safe-area-inset-top)`) bovenaan het document. In
headless Chrome (Blink) rendert die strook aantoonbaar correct (geverifieerd via CDP-screenshot:
nette navy balk op {0,0,390,47}), maar op de iPhone bleef de zone wit.
**Lesson:**
- **Vertrouw niet op een `position: absolute`-element dat aan de initial containing block hangt
  binnen een root met `overflow-x: clip`.** WebKit/iOS clipt zulke elementen weg (Blink niet) —
  dé valkuil die "in de code klopt maar op de iPhone faalt".
- **iOS 26 (Safari "Liquid Glass") kan géén ruwe content dóór de statusbalk laten scrollen, en is
  allergisch voor `position: fixed`.** Vanaf iOS 26 tekent Safari de status-/toolbar altijd als een
  *getinte* balk en bepaalt de kleur door te samplen: eerst `position: fixed`/`sticky` elementen bij
  de schermrand (background-color + backdrop-filter), anders de `html`/`body` achtergrondkleur.
  **`theme-color` wordt genegeerd.** Gevolgen die we live hebben gezien:
  - "Content zichtbaar door de statusbalk scrollen" (zoals gevraagd, bol/coca-cola-stijl) kan niet
    meer — bol/coca-cola hebben op iOS 26 óók een vaste getinte balk. De statische navy bovenbalk
    is dus onvermijdelijk; accepteer dat.
  - **Een `fixed` navy strook bovenaan brak de ÓNDERrand:** met een fixed element gaat iOS 26 dat
    element gebruiken om zowel forehead (boven) als chin (onder) te tinten en pakt onder de
    verkeerde/witte kleur → wit vlak onder de footer. Wég ermee.
  - **Werkende aanpak: GEEN fixed element** — navy top = een **in-flow** strook als eerste
    element in `Header.tsx` (hoogte `env(safe-area-inset-top)`) + `body` navy.
  - **Óók een `sticky` element bij de bovenrand triggert de statische tint.** Bewijs uit onze
    eigen site: de ONDERkant (geen sticky/fixed element) scrollt netjes mee (content door de
    home-indicator), de BOVENkant met een sticky header bleef statisch — zelfde `body`-navy,
    zelfde `viewport-fit=cover`. Fix: header op **mobiel niet-sticky** (`relative lg:sticky
    lg:top-0`). Zonder sticky/fixed trigger scrollt de content gewoon door achter de statusbalk
    (net als de onderkant). Nadeel: mobiel menu scrollt mee weg. Desktop blijft sticky.
  - **Alternatief zónder sticky op te geven: laat `viewport-fit=cover` weg** (zoals destadskerk.nl,
    een WordPress-site die dit "content door de statusbalk"-effect gewoon heeft). Zonder cover
    sampelt iOS de bovenste content-kleur voor de statusbalk en updatet dat bij scrollen. Nadeel:
    verandert óók het onderrand-gedrag (env() wordt 0). Bronnen:
    benfrain.com/ios26-safari-theme-color…, 1ar.io/updates/safari-26-liquid-glass-web.
- **Overscroll/rubber-band-kleur op iOS komt van de `body`-achtergrond, niet altijd van `html`.**
  Zet `body { @apply bg-primary }` (naast `html`) navy. Veilig omdat elke pagina een eigen
  dekkende wrapper (`min-h-screen bg-background`/sand/etc.) heeft; body-navy is alleen zichtbaar
  in de safe-area/overscroll-randen — én het is de fallback-kleur die iOS 26 voor de balk sampelt.
- **`overflow-x: clip` op html/body maakt `body` de scroll-container** (overflow-y wordt `auto`).
  Dat maakt `window.scrollTo`/`scrollTop` in tests onbetrouwbaar; gebruik CDP
  `Input.synthesizeScrollGesture`. Headless-`captureScreenshot` desynct ná compositor-scroll
  (toont dan de body-kleur) — verifieer scroll-gedrag daarom via `elementFromPoint`, niet de
  screenshot.
- **EINDKEUZE (door gebruiker):** menu MOET altijd zichtbaar blijven → dus **sticky header +
  vaste navy statusbalk** (bol.com-stijl). "Content door de statusbalk laten scrollen" én een
  vast menu kan niet samen op iOS 26 — het is het één of het ander. Definitieve staat: sticky
  header (`sticky top-[env(safe-area-inset-top)]`) + in-flow navy strook + `body` navy + footer
  `padding-bottom: env(safe-area-inset-bottom)` + `viewport-fit=cover`. Onderrand scrollt netjes
  mee (geen sticky element daar); bovenrand is een vaste navy balk (sticky header triggert de tint).
- **Windows/geen iPhone = geen echte iOS-Safari-verificatie mogelijk.** Bevestig safe-area-fixes
  altijd nog op een fysiek toestel; wees daar eerlijk over richting de gebruiker.

## 2026-06-24 — Footer oker glow: match the reference, treat sections as one whole, apply site-wide
**Context:** Asked to add a De Duurzame Jongens–style warm oker glow behind the footer. Took
several iterations: (1) a subtle drifting gradient was "too vague"; (2) two stacked sections
(closing CTA + Footer) each with their own glow showed a visible seam; (3) switching to many
small pulsing "lamp" blobs was wrong — the reference is one large, smooth gradient that slowly
drifts; (4) the "one whole" fix was only applied to the homepage, not every page.
**Lesson:**
- When a visual reference is given, match its *character* exactly (here: one big soft warm wash
  that orbits, NOT many small blobs). Study all the example images before choosing a technique.
- "Two sections as one whole" means a single shared dark container + one glow layer spanning
  both — not two adjacent boxes each styled the same. Separate `overflow-hidden` boxes always
  seam.
- Closing CTA + Footer pattern repeats on nearly every page (homepage `ClosingCta`, inline dark
  CTAs on Bewoners/Uitvoerders/OverOns/Subsidies*, and the shared `MaatregelPagina` template).
  A footer change like this must be rolled out everywhere, not just the page being previewed.
- Implementation that worked: `Footer` takes a `cta?: ReactNode`, renders it inside its own
  `bg-primary` + `.ambient-glow` container; each page moves its closing CTA `<section>` into the
  `cta` prop and drops the section's own dark background.

## 2026-07-16 — Stille terugval op voorbeelddata = onzichtbare fouten; faal eerlijk
**Context:** De subsidiecheck viel bij een bronfout stil terug op de mock ("basisset"). Met de
nieuwe afscherming werd dat pijnlijk zichtbaar: één transiënte fout van Verbeterjehuis en de
bezoeker zag 5 verzonnen regelingen (mock-Tynaarlo) met álles afgeschermd ("0 direct zichtbaar"),
terwijl productie er 11 toonde. Extra verraderlijk: doordat de provider de fout inslikte, deed
react-query's `retry: 1` nooit iets en bleef het foute resultaat 5 minuten in de query-cache; en
de Vite-proxy logt upstream-fouten niet, dus de dev-log bleef leeg.
**Lesson:**
- **Geen stille terugval op nepdata in een tool die echte beslissingen en leads stuurt.** Laat de
  fout door naar react-query (retry) en toon daarna de eerlijke foutstaat met "Opnieuw proberen".
  Mock-data zou anders ook nog per mail verstuurd worden.
- **Een provider die intern catcht, schakelt de retry-laag erboven uit.** Foutafhandeling hoort op
  één laag te leven; hier is dat react-query.
- **Herken de mock aan de details:** "lening tot € 1.000" (eerste bedrag uit de mock-range
  "€ 1.000 – € 71.000") en id's zonder bron-slugformaat. Mock-id's spiegelen nu de echte slugs,
  zodat voorbeelddata zich hetzelfde gedraagt als live data.
- **Draai de subsidiecheck ook lokaal via de edge function** (`VITE_SUBSIDIECHECK_URL` in `.env`,
  zie `.env.example`): rechtstreeks scrapen via de `/esw`-proxy vuurt per check ~12 parallelle
  browser-requests zonder cache af en hapert geregeld op de bron; de function heeft een 12u-cache
  en nette limieten (zelfde pad als productie). De proxy is alleen nog voor bron/parser-debugging.
- **De chip op verbeterjehuis.nl ("Rijksoverheid"/"Gemeente"/…) codeert de financier, niet het
  toepassingsgebied.** Hun eigen pagina is één platte lijst met die chips; een as
  "landelijk vs regionaal" bestaat bij de bron niet. Vandaar de id-allowlist.

## 2026-07-16 — Verbeterjehuis niveau-labels zijn onbetrouwbaar; scherm af op regeling-id
**Context:** Bij het afschermen van niet-landelijke regelingen in de subsidiecheck (Rijksoverheid
gratis, rest wazig achter het mailformulier) bleek het bron-niveau (`national-government` /
`province` / `municipality` / `other`) geen betrouwbare grens. Live-verificatie op meerdere
postcodes toonde: (1) regionale regelingen (Isolatieaanpak Groningen/Noord-Drenthe, Subsidie
Waardevermeerdering Drenthe en Groningen) staan bij de bron ónder "national-government"; (2) de
indeling voor hetzelfde adres wisselt per pull (de ene keer een "Provincie"-groep, de andere keer
niet); (3) een pure `niveau === "rijk"`-grens gaf juist de waardevolle regionale Groningse
regelingen gratis weg.
**Lesson:**
- **Scherm af (of cureer) op de stabiele regeling-id (laatste padsegment van de bron-URL), niet op
  het bron-niveau.** De id's van échte landelijke regelingen (`isde-subsidie-rijksoverheid`,
  `energiebespaarlening-warmtefonds`, `laag-btw-tarief-voor-isolatiewerkzaamheden`, …) zijn
  identiek over Groningse én Drentse postcodes; de niveaus niet. Zie
  `GRATIS_ZICHTBARE_IDS` in `src/lib/subsidies/types.ts` (zelfde patroon als het bestaande
  `CURATED_BEDRAG` in `energiesubsidiewijzerProvider.ts`).
- **Allowlist, niet denylist:** niet-herkende/nieuwe regelingen vallen dan veilig in "afgeschermd"
  i.p.v. per ongeluk gratis zichtbaar. Nadeel: valt de live-bron weg en draait de mock-terugval,
  dan matcht geen enkele id → alles afgeschermd (veilige, maar lege, staat).
- **Verifieer zulke bron-afhankelijke aannames altijd tegen de échte bron op meerdere adressen**
  (hier via de dev-proxy `/esw`), niet tegen één screenshot of de mockdata — de mock-id's (`isde`,
  `nij-begun-isolatie`, …) verschillen van de live-id's.

## 2026-07-12 — Geen gedachtestreepjes in zichtbare copy
**Context:** Bij de subsidiecheck-teksten corrigeerde de opdrachtgever twee keer op
gedachtestreepjes (—), uiteindelijk met "verwijder op alle plekken de denkstreepjes".
**Lesson:** Schrijf bezoeker-zichtbare NL-copy voor deze site zonder gedachtestreepjes;
gebruik punt, komma of dubbele punt. Code-comments mogen wel. Oudere pagina's (FAQ,
Contact) bevatten nog streepjes: alleen aanpassen op verzoek of bij herbouw.
