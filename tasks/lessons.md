# Lessons

Project-specific lessons learned for the Voortraject website. Add a dated entry whenever
the user corrects course or a non-obvious gotcha surfaces. Review at session start.

<!-- Template:
## YYYY-MM-DD — short title
**Context:** what happened
**Lesson:** the rule to follow next time
-->

## 2026-07-26 — Formulieren verifiëren zonder de productie-CRM te vervuilen (+ vitest .tsx-valkuil)
**Context:** Bij het afmaken van de honeypot (veldnaam `vt_check`) moesten alle formulieren
end-to-end getest worden. Er is geen test-Supabase: elke echte inzending zou een lead in de
productie-CRM schrijven.
**Lesson:**
- **CDP `Fetch.enable` + `Fetch.fulfillRequest` is dé manier om lead-formulieren echt te testen.**
  Onderschep `*.supabase.co/(rest|functions)/*`, registreer de payload, antwoord zelf met 201.
  Zo bewijs je én dat het happy path een insert doet én wat er precies in de payload zit, zonder
  één echte lead. Vang OPTIONS apart af (preflight, 204 + CORS-headers) anders faalt de POST.
- **Filter netwerkchecks op de échte API-host, niet op het woord "supabase".** De dev-server
  serveert `src/integrations/supabase/external-client.ts` als gewoon bronbestand; die URL matcht
  anders je "is er een lead verstuurd"-check en geeft een vals alarm.
- **Een negatieve check (0 requests) is pas bewijs met een positieve tegenhanger.** Test altijd óók
  dat een gewone inzending wél precies één call oplevert, anders test je alleen je eigen filter.
- **Wacht op een DOM-conditie, niet op een vaste sleep.** De dev-server compileert on demand; 2,5 s
  was te kort voor `/contact` (leeg formulier → misleidende FAIL), pollen op `document.querySelector`
  is stabiel.
- **Vitest-valkuil in `.tsx`-tests: `React.ReactElement` gebruiken zonder React te importeren** geeft
  de nietszeggende fout `Vitest failed to find the runner` op een willekeurige `beforeEach`-regel.
  Importeer `import type { ReactElement } from "react"`.
- **`vi.restoreAllMocks()` in `afterEach` wist ook de implementatie van `vi.fn()`-mocks** uit een
  `vi.mock`-factory. Zet zulke implementaties opnieuw in `beforeEach`, anders faalt de tweede test
  in een bestand met een onverklaarbare "er ging iets mis".

## 2026-07-17 — Stage opnieuw na élke edit vóór commit (git commit gebruikt de index, niet de working tree)
**Context:** Bij de mobiele naamvelden-fix deed ik `git add MailOverzicht.tsx` en daarna nog twee
edits (kolommen 2fr/3fr + placeholder "Tussenv."). `git commit` legde alleen de gestagede
tussenversie vast; de laatste polish bleef ongecommit. PR #69 mergede daardoor de verkeerde versie
en er was een reparatie-PR #70 nodig.
**Lesson:** `git add` bevriest een snapshot in de index. Elke edit ná `git add` valt buiten de commit
tenzij je opnieuw staget. Doe direct vóór `git commit`: `git status`/`git diff` bekijken, of gewoon
`git add -A` (of het specifieke bestand) opnieuw — zeker na een reeks visuele iteraties. Verifieer na
commit dat het diff-aantal klopt met wat je verwacht (5 regels ≠ de volledige wijziging).

## 2026-07-16 — Eerst fetchen: Lovable/andere sessies pushen ook naar main
**Context:** Bij de naamvelden-splitsing beschreef de opdracht een telefoonveld op de
subsidiecheck dat lokaal niet bestond. Ik hield het voor een vergissing van de opdrachtgever;
lokale main bleek 12 commits achter te lopen (o.a. PR #65 dat precies dat veld toevoegde).
**Lesson:** Dit repo wordt door meerdere kanalen bijgewerkt (Lovable, andere sessies).
Draai bij sessiestart en vóór elke analyse van "huidige" code eerst `git fetch` en controleer
of lokale main achterloopt. Als de opdrachtgever de site anders beschrijft dan de code: eerst
aannemen dat de code veroudert is, niet de opdrachtgever.

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

## 2026-07-12 — Geen gedachtestreepjes in zichtbare copy
**Context:** Bij de subsidiecheck-teksten corrigeerde de opdrachtgever twee keer op
gedachtestreepjes (—), uiteindelijk met "verwijder op alle plekken de denkstreepjes".
**Lesson:** Schrijf bezoeker-zichtbare NL-copy voor deze site zonder gedachtestreepjes;
gebruik punt, komma of dubbele punt. Code-comments mogen wel. Oudere pagina's (FAQ,
Contact) bevatten nog streepjes: alleen aanpassen op verzoek of bij herbouw.

## 2026-07-30 — Escapen hoort bij het renderen, niet bij het opslaan
**Context:** In het CRM verschenen contactformulier-berichten met letterlijk `&#39;` op het
scherm. Oorzaak: een `escapeHtml`-helper in `src/pages/Contact.tsx` die de invoer omzette
*vóór* de insert in `leads_bewoners`. Dezelfde helper stond ook in
`src/components/subsidiecheck/leadFormulier.ts` en in de edge function
`subsidiecheck-mail` (bij de insert).
**Lesson:**
- Een database-kolom bewaart wat de bezoeker typte, byte voor byte. Escapen is een
  *output*-stap: doe het op het moment van renderen, in de context die het nodig heeft
  (HTML-mail, `innerHTML`). Escapen bij opslag beschermt niets en bederft elke consument die
  de kolom terecht als platte tekst toont.
- React (JSX) escapet zelf al bij het renderen; er is dus geen reden om invoer "veilig" te
  maken voordat die de database in gaat. `escapeHtml` in de edge function blijft wél staan
  voor de mail-HTML — dat is de juiste plek.
- Zoek bij zulke bugs op alle schrijfpaden naar dezelfde tabel (hier drie: contactformulier,
  subsidiecheck-terugval, edge function), niet alleen op het pad uit de melding.
- Verificatie loopt via een echte inzending: dev server + CDP, daarna de rij teruglezen met
  `bunx supabase db query --linked` en vergelijken met een SQL-literal (`notities = E'...'`).
  Let op: de JSON-uitvoer van de CLI schrijft ampersand en kleiner-dan als unicode-escapes
  (backslash-u-0026 / backslash-u-003c). Dat is de JSON-encoder, niet de data: laat de
  vergelijking daarom door SQL zelf doen en lees een boolean terug.
