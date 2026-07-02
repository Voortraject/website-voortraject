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

- [ ] **Fase 1 — Homepage bewonersgericht** (`feat/home-bewoners`)
  - [ ] Hero: nieuwe H1 + subtitel (V3-getoetst), primaire CTA "Plan een gratis gesprek",
        secundair belnummer, microtekst ("Vrijblijvend · Binnen 24 uur reactie · Niets voorbereiden")
  - [ ] Trust-bar onder hero (onafhankelijk/geen commissie · lokaal · subsidiekennis · snel gesprek)
  - [ ] Sectie probleemherkenning (4 kaarten "Herkenbaar?")
  - [ ] Sectie "Van twijfel naar een helder plan" (vervangt `ForWhom`; uitvoerders van home af)
  - [ ] Subsidie-blok — feitelijk/behulpzaam geformuleerd (stapelen uitleggen, geen geld-FOMO)
  - [ ] "Zo simpel werkt het" (3 stappen, herschreven `HowWeWork`)
  - [ ] "Waarom bewoners voor ons kiezen" (6 blokken, incl. onafhankelijkheidsbelofte uit FAQ naar voren)
  - [ ] Team-sectie + instantielogo's + FAQ herschrijven (je-vorm, nieuwe copy)
  - [ ] Eind-CTA + kleine partnerverwijzing onderaan
  - [ ] SEO: title/description homepage bijwerken
- [ ] **Fase 2 — Uitvoerders → Partners** (`feat/partners-rename`)
  - [ ] Route `/partners` + redirect `/uitvoerders` → `/partners` (ook Cloudflare `_redirects` voor echte 301)
  - [ ] Header/footer/nav: label + volgorde (Bewoners · Verduurzamen · Subsidies · Over ons · Partners)
  - [ ] Pagina-copy: nieuwe H1/subtitel, B2B-toon behouden; interne links + sitemap-script bijwerken
- [ ] **Fase 3 — Bewoners-pagina verscherpen** (`feat/bewoners-copy`)
  - [ ] Nieuwe H1/subtitel; secties behouden; eind-CTA met risicoreductie
- [ ] **Fase 4 — Uniforme CTA-blokken** (`feat/uniform-cta`)
  - [ ] Maatregelpagina's: standaard CTA-blok "Benieuwd of dit slim is voor jóuw woning?"
  - [ ] Subsidiepagina's: verzamel-CTA "Ontdek welke subsidies voor jóuw woning gelden"
- [ ] **Fase 5 — Contact-kop** (`feat/contact-kop` of meenemen in lopende contact-branch)
  - [ ] H1 "Ontdek gratis wat mogelijk is voor jouw woning" + subtitel; formulier staat al op bewoner
- [ ] **Later / geblokkeerd**
  - [ ] Reviews-sectie (wacht op echte reviews met naam/plaats/resultaat)
  - [ ] Over ons: eigen teamfoto's + eind-CTA (wacht op fotoshoot)

Implementatienotities:
- Alle nieuwe copy langs de V3-toets: geen "claim/direct profiteren/laatste kans"; bij
  uitvoerder-koppeling vrije keuze expliciet houden ("jij kiest zelf").
- Nieuwe componenten met design tokens (geen hardcoded hex — bestaande secties overtreden
  dit her en der; bij herschrijven meteen netjes doen, niet buiten scope refactoren).
- Footer-glow-patroon respecteren: closing CTA's gaan via de `Footer cta={...}` prop
  (zie lessons 2026-06-24).

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
