# Todo

Planning & progress tracking for the Voortraject website. One section per task/change.

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
  - [x] **Homepage achtergrond-alternatie:** dark hero → crème → wit → crème → wit → …
        Max 2 kleuren: crème `#F4EEE0` + wit `#FFFFFF`. Start met crème ná de donkere hero
        (minder contrast). Secties: Herkenning=crème, HelderPlan=wit, Subsidies=crème,
        LogoCarousel=wit, WaaromKiezen=crème, Faq=wit. (was 4+ verschillende bg's.)
  - [x] **Contact:** "Liever direct contact?"-kaart weg (+ ongebruikte consts/icon-imports
        opgeruimd). Sidebar: foto vult de kolom (`md:flex-1`), "Wat kun je verwachten?" lijnt
        onderaan uit met het formulier (grid `items-stretch`).
  - [x] **Onderhoud-hero:** van 4:5 terug naar 4:3 (kleiner), `object-position center top`
        zodat de leidingen/buizen goed zichtbaar blijven.
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
