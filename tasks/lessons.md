# Lessons

Project-specific lessons learned for the Voortraject website. Add a dated entry whenever
the user corrects course or a non-obvious gotcha surfaces. Review at session start.

<!-- Template:
## YYYY-MM-DD — short title
**Context:** what happened
**Lesson:** the rule to follow next time
-->

## 2026-08-09 — Een veldbeschrijving in een swagger is geen contract over de waarden
**Context:** EP-Online v5 beschrijft `Gebouwsubtype` als "het woningsubtype: de ligging van het
appartement in het woongebouw". Bij een eengezinshuis staat er in werkelijkheid `"Twee-onder-een-kap"`.
En `Gebouwtype` bleek geen enkelvoudig type maar een samengesteld label: `"Twee-onder-een-kap /
rijwoning hoek"`, met een schuine streep, als één waarde. Geen van beide velden heeft een enum in de
swagger.
**Lesson:**
- **Map zulke velden ruw door en interpreteer pas als je echte waarden hebt gezien.** Dat is precies
  wat hier goed ging: de normalizer trimt en geeft door, dus de verrassing kwam als zichtbare data
  in plaats van als een stille "onbekend".
- **Match nooit op losse woorden in een veld waarvan je de waardenlijst niet kent.**
  `type === "Rijwoning"` had hier niets herkend en `includes("rijwoning")` had een
  twee-onder-een-kap als rijwoning geclassificeerd. Verzamel eerst de waarden van een reeks adressen
  (inclusief randgevallen: appartement, utiliteitsgebouw) en bouw daarna pas logica.
- Zelfde patroon als de Verbeterjehuis-niveaus (2026-07-30): een bronveld doet vaak nét iets anders
  dan het label suggereert.

## 2026-08-09 — Twee bestanden die alleen in hoofdletters verschillen: op Windows importeert het component zichzelf
**Context:** Voor de eerste stap op het resultaat kwamen er twee bestanden in dezelfde map:
`EersteStap.tsx` (het component) en `eersteStap.ts` (de pure tekstlogica). Dat volgt de conventie
in deze map, waar componenten PascalCase zijn en modules camelCase. Alleen: Windows heeft een
hoofdletterongevoelig bestandssysteem, dus `import { eersteStapTekst } from "./eersteStap"` in
`EersteStap.tsx` resolvet naar **het component zelf**. Resultaat: het component importeert zichzelf,
`EersteStap` is `undefined` bij het renderen, en de enige melding is
`Element type is invalid ... but got: undefined` op een bestaande test die verder niets met de
wijziging te maken had. `tsc` klaagt niet, de dev-server klaagt niet, en de pagina wordt gewoon wit.
**Lesson:**
- **Laat twee bestanden in dezelfde map nooit alleen in hoofdlettergebruik verschillen.** Noem de
  logicamodule anders (hier: `eersteStapTekst.ts`), niet dezelfde naam in een ander casing-patroon.
  Dit is op Linux (CI, Cloudflare-build) wél in orde, dus het is precies het soort verschil dat
  lokaal en in productie anders uitpakt.
- **Herken de melding.** `Element type is invalid … got: undefined` in een component dat je net hebt
  toegevoegd betekent bijna altijd een importprobleem, niet een exportfout. Controleer eerst of het
  pad naar iets anders wijst dan je denkt.
- **Vite komt hier niet vanzelf van bij.** Na de hernoeming bleef de dev-server een wit scherm
  serveren zonder enige console-fout, terwijl de losse modules met een 200 werden geserveerd. Een
  verse dev-server (en `rm -rf node_modules/.vite`) loste het op. Draai bij onverklaarbaar
  renderloos gedrag na een hernoeming eerst de server opnieuw voordat je de code gaat zoeken.

## 2026-08-08 — Nooit `git stash` in een werkmap die je met iemand anders deelt
**Context:** Er werkte een tweede terminal in dezelfde map aan een andere branch. Om te
controleren of mijn wijzigingen nieuwe lint-fouten opleverden, deed ik `git stash -u`, draaide de
lint, en `git stash pop`. Die stash pakte niet alleen mijn bestanden maar ook hun onafgeronde werk
aan `Header.tsx`. Erger nog: ze wisselden ondertussen van branch, dus mijn wijzigingen stonden
ineens op hún branch, klaar om per ongeluk in hún commit te belanden. Er ging niets verloren, maar
dat was geluk.
**Lesson:**
- `git stash`, `git checkout -b` en branchwissels zijn **repo-brede** handelingen. Ze raken iedereen
  die in diezelfde map werkt, niet alleen jouw bestanden.
- Werk je naast een andere sessie, maak dan meteen een **eigen worktree**:
  `git worktree add <pad> <branch>`, plus een junction naar `node_modules`
  (`cmd //c mklink //J node_modules "C:\\dev\\website-voortraject\\node_modules"`) zodat
  `bun run test` en `tsc` daar gewoon draaien. De dev-server pakt vanzelf een vrije poort.
- Een lint-vergelijking met `main` hoef je niet via stash te doen: draai de lint in de worktree en
  vergelijk het aantal met dat van de hoofdmap.
- Ging het toch mis: leg je werk eerst veilig als patch (`git diff -- <bestanden> > patch`) vóór je
  ook maar iets aan git-state verandert, en herstel dan pas.
- Controleer `git status`, `git branch --show-current` én `git stash list` opnieuw ná elke
  onderbreking. De andere sessie verandert de wereld onder je handen.

## 2026-08-08 — De testomgeving moet animaties uitzetten, niet uitzitten
**Context:** De zoeksequentie van de subsidiecheck (~3,4s) verhuisde naar de gegevens-poort.
Daarna vielen zeven bestaande tests om: ze renderden de poort en zochten meteen het formulier, dat
er pas na de sequentie is. De verleiding is dan om overal `waitFor` met ruime timeouts te zetten.
**Lesson:**
- Zet `prefers-reduced-motion` **aan** in `src/test/setup.ts` (`matches: query.includes(...)`).
  Dat is precies de schakelaar die de code zelf al respecteert, dus tests wachten niet op timers en
  je test bovendien het pad dat echte gebruikers met bewegingsreductie zien.
- Let op: `retry` dat in de hook zelf staat (`useSubsidieCheck` heeft `retry: 1`) overrulet de
  `defaultOptions` van een test-QueryClient. Bij een bewust falende bron duurt het dus altijd nog
  een retry-cyclus; daar hoort een ruimere `findBy`-timeout, geen mock-truc.

## 2026-08-08 — Deze "SPA" navigeert bijna overal met een volledige herlading
**Context:** Bij het opzetten van de paginameting nam ik aan wat je bij React Router mag
aannemen: navigatie is client-side, dus GA4 telt alleen de landingspagina. Dat klopte hier niet.
Er staat **geen enkele `<Link>` van react-router in de codebase** (de ene `<Link` die grep vindt is
het lucide-icoon `Link2`). Header, footer en alle CTA's gebruiken gewone `<a href>`, dus normale
navigatie is een echte paginalading die GA4 gewoon telt. Client-side navigeert alleen
`SubsidiecheckCta` (via `useNavigate`) en de vijf `<Navigate>`-redirects in `App.tsx`.
**Lesson:**
- **Controleer bij alles wat met routing of meting te maken heeft eerst hóé er genavigeerd wordt**,
  in plaats van het uit "het is een SPA" af te leiden. Eén grep: `grep -rn "<Link\|useNavigate" src`.
- Dat verandert de conclusie wezenlijk. Het gat zat niet in "de hele sessie is onzichtbaar" maar op
  één specifiek punt: de subsidiecheck-CTA op de homepage, het belangrijkste instappunt van de
  tool, waar GA4 `/` zag en daarna niets.
- Zelfde reflex geldt voor GTM-klik-triggers: bij `<a href>` verlaat de pagina, dus een trigger
  zonder "wacht op tags" kan het event verliezen.

## 2026-08-08 — Een GTM-tag die niet vuurt geeft geen foutmelding
**Context:** De container zocht nog op navigatielabels van vóór de ombouw ("voor uitvoerders",
"maatregelen"); van de 17 nav-items werden er nog 6 gemeten. Vijf events die de code al pushte
hadden nooit een trigger gekregen, en alle event-parameters gingen verloren omdat er geen enkele
dataLayer-variabele in de container zat. Niemand had het gemerkt, want er is geen enkel signaal:
je ziet alleen een leeg of te laag rapport, en dat lees je als "weinig verkeer".
**Lesson:**
- **Meting heeft een test nodig, net als code.** `src/test/gtmContainer.test.ts` controleert de
  container (`docs/gtm/`) tegen de `pushGtmEvent`-aanroepen in `src/`. Voeg je een event toe, werk
  dan container én `docs/tracking.md` bij, anders faalt de suite.
- **Bouw klik-triggers op de link of een `data-`attribuut, nooit op de zichtbare tekst.** Tekst is
  copy en verandert; een URL is structuur. Dit is exact hoe de container was weggedreven.
- **Controleer de querystring vóór je hem naar analytics stuurt.** Op `/subsidiecheck` staat het
  adres van de bezoeker in de URL (`?pc=…&hn=…`), en dat ging ongefilterd mee als `page_location`.

## 2026-08-07 — Gestapelde PR's: verwijder de basisbranch pas als álles gemerged is
**Context:** Vier PR's stonden op elkaar gestapeld (#89 → #91 → #93 → #94, elk met de vorige als
base). Bij het mergen van #89 met `gh pr merge --delete-branch` sloot GitHub #91 automatisch: een
PR waarvan de basisbranch verdwijnt gaat dicht, niet naar `main`. Retargeten kan daarna niet meer
("Cannot change the base branch of a closed pull request"), en de kop van #91 was toen ineens
CONFLICTING.
**Lesson:**
- Merge een stapel PR's **zonder `--delete-branch`**. Retarget eerst de volgende PR naar `main`
  (`gh pr edit <n> --base main`), merge die, en ruim pas aan het eind alle branches op met
  `git push origin --delete <branches>`.
- Ging het toch mis: push de verwijderde basisbranch terug (`git push origin origin/main:refs/heads/<branch>`),
  dan kan de PR heropend worden (`gh pr reopen`) en alsnog naar `main` worden gericht.
- Controleer na elke merge met `gh pr view <n> --json state,baseRefName,mergeable` of de volgende
  PR nog openstaat en op `main` wijst; wacht een paar seconden, GitHub is niet direct bij.

## 2026-07-30 — Stille terugval op voorbeelddata = onzichtbare fouten; faal eerlijk
**Context:** De subsidiecheck viel bij een bronfout stil terug op de mock ("basisset"): één
transiënte fout van Verbeterjehuis en de bezoeker zag 5 verzonnen regelingen in plaats van de
echte lijst, mét een verkeerd totaal, en kreeg die ook nog per mail. Extra verraderlijk: doordat
de provider de fout inslikte deed react-query's `retry: 1` nooit iets en bleef het foute resultaat
5 minuten in de query-cache; de Vite-proxy logt upstream-fouten niet, dus de dev-log bleef leeg.
De foutstaat met "Opnieuw proberen" stond al in `StapResultaat`, maar werd nooit bereikt.
**Lesson:**
- **Geen stille terugval op nepdata in een tool die echte beslissingen en leads stuurt.** Laat de
  fout door naar react-query (retry) en toon daarna de eerlijke foutstaat.
- **Een provider die intern catcht, schakelt de retry-laag erboven uit.** Foutafhandeling hoort op
  één laag te leven; hier is dat react-query.
- **Faal eerlijk mag nooit ten koste van de lead gaan.** In de gegevens-poort (`StapGegevens`)
  zaten "regelingen ophalen" en "lead wegschrijven" in dezelfde `try`: zodra de bron ging gooien,
  verloor je de lead van een bezoeker die zijn gegevens al had ingevuld. Nu apart: bron faalt →
  lead direct wegschrijven (zonder mail, want een overzicht met 0 regelingen mailen is erger dan
  niets) en doorlaten naar de foutstaat. Let bij zulke fixes altijd op de *andere* consumenten van
  de call die je laat gooien.
- **Herken de mock aan de details:** "lening tot € 1.000" (eerste bedrag uit de mock-range
  "€ 1.000 – € 71.000") en id's zonder bron-slugformaat.
- **Draai de subsidiecheck ook lokaal via de edge function** (`VITE_SUBSIDIECHECK_URL` in `.env`,
  zie `.env.example`): rechtstreeks scrapen via de `/esw`-proxy vuurt per check ~12 parallelle
  browser-requests zonder cache af en hapert geregeld op de bron; de function heeft een 12u-cache
  en nette limieten (zelfde pad als productie). De proxy is alleen nog voor bron/parser-debugging.

## 2026-07-30 — Verbeterjehuis-niveaus zijn onbetrouwbaar: de chip codeert de financier
**Context:** Bij een poging om niet-landelijke regelingen apart te behandelen bleek het
bron-niveau (`national-government` / `province` / `municipality` / `other`) geen bruikbare grens.
Live-verificatie op meerdere postcodes toonde: regionale regelingen (Isolatieaanpak Groningen,
Subsidie Waardevermeerdering) staan bij de bron ónder "national-government", en de indeling voor
hetzelfde adres wisselt per pull.
**Lesson:** de chip op verbeterjehuis.nl codeert **wie betaalt**, niet het toepassingsgebied; een
as "landelijk vs regionaal" bestaat bij de bron niet. Wil je regelingen cureren of apart
behandelen, doe dat op de stabiele **regeling-id** (laatste padsegment van de bron-URL, bijv.
`isde-subsidie-rijksoverheid`) — die is identiek over Groningse en Drentse postcodes. Zelfde
patroon als `CURATED_BEDRAG` in `energiesubsidiewijzerProvider.ts`. Verifieer zulke
bron-aannames altijd tegen de échte bron op meerdere adressen, niet tegen één screenshot of de
mockdata (mock-id's wijken af van de live id's).

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

## 2026-08-07 — cn() gooit `leading-[..]` weg zodra er een `text-[size]` achteraan komt
**Context:** Bij het toevoegen van een `compact`-variant aan `ReviewKaart`
(`src/components/sections/Reviews.tsx`) werd de vaste klassenreeks
`"mt-3 text-[15px] leading-[1.65] text-foreground"` omgezet naar
`cn("mt-3 leading-[1.65] text-foreground", compact ? "text-[14px]" : "text-[15px]")`.
Functioneel leek dat identiek, maar tailwind-merge kent de
`text-[size]/[leading]`-syntax en beschouwt `text-[15px]` daarom als *ook* een
line-height-setter: de eerdere `leading-[1.65]` werd stilletjes verwijderd. De
regelafstand viel terug op de standaard, en omdat de tekst een `min-h` én een
`line-clamp` heeft, paste er ineens een halve vijfde regel onder de clamp. Op de
homepagina liep de tekst daardoor tegen de "Lees meer"-knop aan.
**Lesson:**
- `cn()` is niet "klassen aan elkaar plakken" maar tailwind-merge: latere klassen
  verwijderen eerdere uit *dezelfde groep*, en die groepen zijn ruimer dan ze
  lijken (`text-[..]` raakt zowel font-size als line-height, `text-*` ook kleur).
- Voeg een variant toe door de volledige klassenreeks per variant uit te schrijven,
  niet door één klasse via `cn()` achteraan te plakken. Dan blijft de bestaande
  variant byte-voor-byte gelijk aan wat er al live stond.
- Verifieer bij twijfel de daadwerkelijke uitvoer: een klein scriptje dat `cn(...)`
  logt laat direct zien welke klasse is gesneuveld.
- Refactor van een gedeeld component (hier: hergebruik op de contactpagina) raakt
  ook de pagina's die je niet aan het bekijken bent. Controleer die pagina's expliciet.

## 2026-08-09 — een feature-flag omzetten om te kunnen screenshotten, terwijl de opdrachtgever meekijkt op dezelfde dev-server
**Context:** Om de resultaatpagina te kunnen fotograferen zonder telkens de gegevens-poort te
doorlopen, is `SUBSIDIECHECK_GEGEVENS_POORT` in `src/config/features.ts` tijdelijk op `false`
gezet, met een dev-server op `localhost:8080`. De opdrachtgever testte in dat tijdvak zelf in
een incognitovenster op diezelfde server, kwam zonder gegevens bij het resultaat, en dacht
dat de poort lek was. Twee dingen maakten het erger: de dev-server bleef als weesproces
draaien nadat de achtergrondtaak was gestopt (vite overleeft het stoppen van de wrapper), en
"even omzetten en terugzetten" is onzichtbaar voor iemand anders die op dezelfde poort kijkt.
**Lesson:**
- Zet nooit een feature-flag om om je eigen werk te kunnen bekijken. Gebruik de weg die de
  applicatie zelf al biedt: hier `sessionStorage.setItem("sc_poort_ontgrendeld", "1")` in de
  console, of gewoon de flow doorlopen. Dat raakt de code niet en dus ook niemand anders.
- Kan het echt niet anders, meld het dan vooraf en herstel het vóór je iets anders doet, niet
  na de volgende screenshot.
- Controleer na een achtergrond-`bun run dev` of de poort echt vrij is
  (`Get-NetTCPConnection -LocalPort 8080`); het stoppen van de taak laat het node-proces vaak
  staan. Een weesserver serveert je halve werkkopie aan wie er toevallig langskomt.
- Bij een melding "de poort laat me door": kijk eerst welke *bron* de gebruiker zag
  (localhost of productie) en welke waarde die bron op dat moment serveerde
  (`curl localhost:8080/src/config/features.ts`), vóór je in de logica gaat zoeken.
