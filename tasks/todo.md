# Todo

Planning & progress tracking for the Voortraject website. One section per task/change.

## Subsidiecheck — gegevens vooraf verzamelen (tussenoplossing) (2026-07-24)

Branch: `feat/subsidiecheck-gegevens-poort` (vanaf `main`). PR ready-for-review, niet zelf mergen.

Aanleiding: de echte subsidiecheck (afscherming, PR #66) gaat pas over een paar weken live. In
de tussentijd wil de opdrachtgever nu al leads verzamelen: na de stap "Jouw woning" komt een
extra stap "Je gegevens" (voornaam, tussenvoegsel, achternaam, e-mail, telefoon) die als
toegangspoort naar het resultaat fungeert.

Afgestemd (2026-07-24):
- Aparte tussenstap i.p.v. alles op één scherm (drempel/schermruimte/hergebruik van het
  bestaande contactformulier in `MailOverzicht`).
- Gegevens = toegangspoort: ná het invullen ziet de bezoeker het resultaat.
- Situatie + interesse blijven op stap 1 (kwalificatie + korte gegevensstap).
- Poort via client-state (niet via de URL): een gedeelde of ververste link vraagt opnieuw om
  gegevens (meer leads). `sessionStorage` verzacht: binnen dezelfde sessie niet dubbel vragen.
- Het "mail mij dit overzicht"-blok onderaan het resultaat vervalt (gegevens zijn al binnen).

LET OP / te bevestigen: toont het resultaat op productie nu echte regelingen of nog
voorbeelddata? De live provider (`energiesubsidiewijzerProvider`) valt terug op mock
("Voorbeeldgegevens") als `VITE_SUBSIDIECHECK_URL` niet staat of de `subsidiecheck` edge
function niet gedeployed is. Gegevens vóór het resultaat zetten heeft alleen zin als de
bezoeker daarna echte data ziet, niet voorbeelddata.

### Flow (3 stappen)
Voortgangsbalk: Jouw woning → Je gegevens → Resultaat.
1. **Jouw woning** (StapAdres, ongewijzigd behalve knoplabel "Verder" i.p.v. "Bekijk mijn
   subsidies" zolang de poort aan staat).
2. **Je gegevens** (nieuw, StapGegevens): naam/e-mail/telefoon → lead naar `leads_bewoners`
   (bron "Subsidiecheck", zonder regelingen in de notities). Bij succes: ontgrendel → resultaat.
3. **Resultaat** (StapResultaat, MailOverzicht-blok eruit; "plan een gratis gesprek"-CTA blijft).

### Plan
- [x] Feature-flag `SUBSIDIECHECK_GEGEVENS_POORT = true` in `src/config/features.ts` (makkelijk
      terug te draaien bij de echte launch: flag uit = resultaat weer direct na stap 1).
- [x] `src/components/subsidiecheck/leadFormulier.ts` (nieuw, gepland als `contactValidatie.ts`):
      gedeelde validators (`EMAIL_RE`, `NAME_RE`, `validatePhoneNL`, `escapeHtml`) +
      `valideerContact()` + `schrijfSubsidiecheckLead()` die de directe `leads_bewoners`-insert
      centraliseert (exact dezelfde kolommen; data-integriteit, CLAUDE.md-regel 2). `MailOverzicht`
      gerefactord naar dezelfde helper (geen kolomdrift).
- [x] `src/components/subsidiecheck/StapGegevens.tsx` (nieuw): het poortformulier. Zelfde
      velden/validatie/honeypot/timing als `MailOverzicht`, maar directe lead-insert (geen mail:
      geen regelingen op dit punt). GTM `subsidiecheck_lead` (alleen bewonertype, geen PII). Bij
      succes `onOntgrendeld()`.
- [x] `Subsidiecheck.tsx`: `stap` 1|2|3, client-state `ontgrendeld` (+ `sessionStorage` zodat een
      refresh binnen de sessie niet opnieuw vraagt), StapGegevens tussen adres en resultaat, kop +
      prefetch ongemoeid. Flag uit = huidige 2-stappenflow.
- [x] `Voortgang.tsx`: generiek gemaakt (prop `stappen` + `huidige`), 2 of 3 stappen, terug-naar-
      stap-1 klikbaar.
- [x] `StapAdres.tsx`: knoplabel via prop `knopLabel` ("Verder" bij de poort, default "Bekijk mijn
      subsidies").
- [x] `StapResultaat.tsx` (prop `verbergMail`) + `Samenvatting.tsx` (prop `toonMailKnop`): het
      "Ontvang dit overzicht in je mail"-blok én de "mail mij dit overzicht"-knop verborgen bij de
      poort; "plan een gratis gesprek"-CTA + warm slot blijven.
- [x] Test `src/test/leadFormulier.test.ts` (vitest): `valideerContact` (alle veldregels) +
      `validatePhoneNL`. Pure-functietest, past bij de bestaande lib-tests.
- [x] Verificatie: `tsc` schoon · eslint baseline ongewijzigd (11 err/8 warn, allemaal in niet-
      geraakte bestanden) · 60/60 vitest (49 + 11 nieuw) · `bun run build` groen · headless Chrome
      desktop + mobiel: stap 1 (3-staps-balk + knop "Verder") en de poort (kop/adres-pill/velden/
      knop) renderen correct.
- [x] Commit + PR (ready-for-review), niet zelf mergen.

### Review
- Flow werkt zoals afgesproken: Jouw woning → Je gegevens (poort, schrijft de lead) → Resultaat.
  De poort staat achter `SUBSIDIECHECK_GEGEVENS_POORT`; flag op `false` = exact de oude
  2-stappenflow (Voortgang, koppen, breedte en render vallen dan terug).
- Poort via client-state + `sessionStorage` (`sc_poort_ontgrendeld`), bewust niet in de URL: een
  gedeelde of ververste link (andere browser/incognito) vraagt opnieuw om gegevens. Wie op het
  resultaat het adres/situatie aanpast (`edit`/`sit`) blijft ontgrendeld (geen dubbele poort).
- Bewust NIET: geen automatische overzicht-mail vanuit de poort (regelingen zijn daar nog niet
  bekend; de lead is leidend). Deelknoppen op het resultaat blijven staan.
- Niet headless getest (zou een echte CRM-lead schrijven): de daadwerkelijke submit + stap 3 na
  ontgrendelen. De submit gebruikt wel de los geteste `valideerContact` + de ongewijzigde
  `leads_bewoners`-insert. Eventueel end-to-end te checken op de PR-preview (schrijft dan 1 lead).

### Open / beslispunten
- Echte data vs voorbeelddata achter de poort (zie LET OP hierboven).
- Deelknoppen op het resultaat ("kopieer link naar dit overzicht") worden met een harde poort
  minder logisch; voor nu laten staan, tenzij anders gewenst.
- `sessionStorage`-ontgrendeling geldt sessiebreed (één keer lead = niet opnieuw vragen, ook
  voor een tweede adres). Akkoord tenzij anders gewenst.

## 3D BAG persistente cache (optie E) (2026-07-23)

Branch: `feat/3dbag-persistente-cache` (vanaf `main`, ná merge van PR #73). PR ready-for-review,
NIET zelf mergen: raakt de CRM-database (migratie), dus mens beslist + past de migratie toe.

Aanleiding: vervolg op PR #73. De bottleneck blijft api.3dbag.nl (1,5 tot 3,5s per item, soms
502). De in-memory cache in de edge function is per-instance en vluchtig (Supabase spint
functions af). Optie E maakt de cache persistent en gedeeld: een adres dat één keer is
opgehaald laadt daarna direct, ook voor andere bezoekers en gedeelde links, en is immuun voor
3dbag-storingen. Met opdrachtgever afgestemd ("Doe dat voor mij").

### Plan
- [x] **Migratie** `supabase/migrations/20260723120000_pand_3d_cache.sql`: tabel `pand_3d_cache`
      (`cache_key text pk`, `model jsonb not null`, `updated_at timestamptz`). RLS AAN, géén
      policies voor anon/authenticated (clients raken 'm nooit aan), `grant all ... to service_role`.
      Puur een cache, geen persoonsgegevens, geen relatie met CRM-tabellen.
- [x] **Edge function** `woninginfo`: supabase-client (service_role, auto-geïnjecteerde
      `SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`, zelfde patroon als subsidiecheck-mail).
      Leeslaag `leesModelCache` + schrijflaag `schrijfModelCache`, met `MODEL_VERSION`-prefix in
      de sleutel (bump = oude rijen negeren) en 90-dagen TTL. Handler: in-memory → persistente
      cache → 3dbag; alleen niet-lege modellen worden persistent bewaard.
- [x] **Graceful fallback**: ontbreekt de tabel of de env, of faalt een DB-call, dan valt alles
      stil terug op in-memory + 3dbag (try/catch, `null`). De function kan dus vóór de migratie
      al gedeployed worden zonder iets te breken.

### Verificatie
- esbuild-syntaxcheck + eslint schoon; 49/49 vitest groen. (`deno check` bij deploy.)
- Frontend ongewijzigd: de persistente cache is volledig server-side.

### Nog te doen (opdrachtgever, Supabase-toegang, CRM-project lfelnfukbrxznkevnevr)
1. Migratie toepassen (`supabase db push`, of het SQL uit de migratie draaien in de dashboard).
2. `supabase functions deploy woninginfo --project-ref lfelnfukbrxznkevnevr`.
3. (Optioneel) Supabase-types regenereren; de edge function gebruikt geen gegenereerde types,
   dus niet strikt nodig.
4. Testen: zelfde adres 2x opvragen → 2e keer direct (rij in `pand_3d_cache`, geen 3dbag-call).

## 3D BAG sneller laden op de subsidiecheck (2026-07-23)

Branch: `perf/subsidiecheck-3dbag-laden` (vanaf `main`). PR ready-for-review, niet mergen.

Aanleiding: het 3D-model op de resultaatpagina laadt traag. Gemeten waar de tijd zit
(curl tegen de echte upstreams):
- PDOK BAG WFS (contour/pand-id én buur-selectie): ~0,08 tot 0,10s. Niet de bottleneck.
- **api.3dbag.nl, één item: 1,5 tot 3,5s, af en toe een 502.** Hier zit alle tijd.
- api.3dbag.nl bbox-endpoint (alles in één call): 15 tot 20s. Terecht al vermeden in de code.

Al goed: progressief laden (subject eerst zonder buren, daarna de volledige versie met
buren), serverside decoding, lichte SVG-render (geen 3D-lib). Scope met opdrachtgever
afgestemd: A+B+C (geen DB-wijziging). Alles in de edge function `woninginfo` (CRM-project
`lfelnfukbrxznkevnevr`), die de opdrachtgever nog moet deployen.

### Plan
- [x] **A. `Cache-Control` op het model-antwoord.** Gevuld model lang cachen
      (`max-age=86400, stale-while-revalidate=2592000`; gebouwen zijn statisch), leeg model
      kort (`max-age=60`) zodat een volgende poging snel weer echt ophaalt. Browser /
      terug-navigatie / gedeelde link hoeft dan niet opnieuw naar het trage 3dbag.
      Helper `model3dResponse()`, `json()` kreeg een `extraHeaders`-parameter.
- [x] **B. Buren parallel aan de subject ophalen.** `haal3dBag` startte de buur-items pas
      ná de trage subject-fetch, terwijl de buur-id's al na ~0,1s uit de WFS komen. Nu lopen
      subject (met retry) en buren (pool 2, na de snelle WFS) parallel. Piek-concurrency op
      3dbag blijft 3 (1 subject + 2 buren), binnen de betrouwbare grens.
- [x] **C. Subject-item retry bij 502/timeout.** Nieuwe `fetchItemMetRetry` (2 pogingen) voor
      alleen de subject (kritiek: zonder subject geen model). Voorkomt dat een transiente 502
      de héle client-call (incl. WFS + buren) laat herhalen. Buren mogen wegvallen (context).
- [x] **D. Dubbele PDOK-lookup weg (frontend).** `StapAdres` valideerde het adres met een losse
      `zoekAdres` (buiten react-query), waarna de pagina hem via `usePdokAdres` opnieuw ophaalde.
      Nu seedt `StapAdres` na een geslaagde lookup de react-query-cache met exact dezelfde sleutel
      (`["pdok-adres", normalizePostcode(pc), hn, tv]`), zodat de pagina-lookup een directe cache-hit
      is en de 3D-prefetch ~0,1s eerder start (plus geen "Adres controleren…"-flits meer).

### Verificatie
- esbuild-syntaxcheck van `index.ts` groen (Deno niet lokaal geïnstalleerd; `deno check` bij deploy).
- eslint op `index.ts` schoon; 49/49 vitest groen (pure decoder-tests ongemoeid, alleen `index.ts` geraakt).
- Live tegen de echte API getest: subject + 2 buren tegelijk (piek 3) → 3× 200, geen overload-502,
  volledige set in ~2s wall-clock (vs. ~4 tot 6s bij subject-dan-buren sequentieel).

### Nog te doen (opdrachtgever, Supabase-toegang)
- `supabase functions deploy woninginfo --project-ref lfelnfukbrxznkevnevr`.
- Na deploy in de network-tab checken dat de `?pandid=...`-respons de `Cache-Control`-header
  draagt en dat een tweede load van hetzelfde adres direct uit de cache komt.

## Subsidiecheck achter "binnenkort"-schakelaar (2026-07-22)

Branch: `feat/subsidiecheck-binnenkort` (vanaf `main`). PR ready-for-review, niet mergen.

Aanleiding: de subsidiecheck mag nog niet gebruikt kunnen worden (postcodecheck), hij
gaat later pas echt live. Met opdrachtgever afgestemd (3 keuzes): (1) de /subsidiecheck-
pagina blíjft bestaan maar toont een "binnenkort"-melding, (2) instappunten laten staan →
ze leiden naar die melding, (3) géén e-mailverzameling, alleen een nette melding + CTA.

### Plan
- [x] Feature-flag `src/config/features.ts` → `SUBSIDIECHECK_LIVE = false` (puur een
      constante, geen React-import, zodat het sitemap-script hem ook kan importeren).
- [x] `Seo.tsx`: optionele `noindex`-prop → `<meta name="robots" content="noindex, follow">`.
- [x] `src/components/subsidiecheck/Binnenkort.tsx`: kalme melding in huisstijl (Header +
      Footer, oker klok-icoon, kop "De subsidiecheck komt eraan", uitleg, `CtaButton` naar
      /contact + telefoonlink). Geen denkstreepjes. Seo met noindex.
- [x] `Subsidiecheck.tsx`: bestaande component → `SubsidiecheckLive` (ongewijzigd); dunne
      wrapper `Subsidiecheck` toont bij `!SUBSIDIECHECK_LIVE` de melding. Postcodecheck wordt
      dan niet eens gerenderd (ook niet via directe link/oude Google-hit). Wrapper roept geen
      hooks aan → hook-volgorde in Live blijft heel.
- [x] `scripts/generate-sitemap.ts`: `/subsidiecheck` alleen in de sitemap als de flag `true` is.

### Launch — één handeling
- [x] Zet `SUBSIDIECHECK_LIVE = true` in `src/config/features.ts` → check + sitemap-entry +
      indexering komen in één keer terug. Verder geen wijziging nodig. **Gedaan 2026-07-22**
      (opdrachtgever: "weer helemaal op actief"), branch `chore/subsidiecheck-weer-actief`.
      De schakelaar-code blijft staan (slapend) voor eventueel later opnieuw afschermen.
      Geverifieerd: sitemap 14 → 15 (`/subsidiecheck` terug), tsc/build groen, visueel de
      echte stap-1-check weer op /subsidiecheck.

### Review
- Verificatie: `tsc` schoon · eslint op de 4 geraakte bestanden schoon · 49/49 vitest ·
  `bun run build` groen · sitemap 15 → 14 entries (`/subsidiecheck` eruit, geverifieerd 0 hits).
- Visueel (headless Chrome tegen `vite preview`): desktop 1440px + mobiel 480px tonen de
  melding correct (kop op één regel, tekst breekt netjes, gouden CTA + telefoonlink,
  Header/Footer/WhatsApp intact). De 390px-headless-shot sneed rechts af = bekend
  headless-artefact (clamp ~500px, zie lessons.md), geen echte overflow.
- Bewust NIET gedaan (conform keuzes opdrachtgever): instappunten (homepage-formulier,
  hero-knop, header-tool) blijven staan en leiden naar de melding; geen e-mailverzameling.

## Naamvelden splitsen: voornaam / tussenvoegsel / achternaam (2026-07-16)

Branch: `feat/naamvelden-gesplitst`. CRM-database heeft de kolommen al; een BEFORE
INSERT-trigger stelt `naam`/`contactpersoon` zelf samen. Website stuurt alleen nog de
drie losse delen (getrimd, leeg = null; achternaam verplicht).

### Plan
- [x] `/contact` bewoner: "Volledige naam *" → Voornaam (opt) + Tussenvoegsel (opt, smal) + Achternaam (verplicht); payload `voornaam`/`tussenvoegsel`/`achternaam`, kolom `naam` weglaten
- [x] `/contact` uitvoerder: "Naam contactpersoon *" → drie velden; payload `contactpersoon_voornaam`/`_tussenvoegsel`/`_achternaam`, kolom `contactpersoon` weglaten
- [x] `/subsidiecheck` MailOverzicht: "Je naam" → Je voornaam / Tussenvoegsel / Je achternaam (2 regels, mobiel stapelend); client-insert én function-payload op de drie velden
- [x] Edge function `subsidiecheck-mail`: drie velden accepteren + wegschrijven (zonder `naam`), aanhef samenstellen, legacy-terugval voor oude bundles die nog `naam` sturen
- [x] Lokale dev-server voor visuele controle gebruiker (http://localhost:8081)
- [x] Verificatie: tsc schoon · eslint alleen de 4 baseline-fouten die ook op main staan · 49/49 vitest · build groen · 3 testinzendingen via de echte formulieren (headless CDP) + DB-controle via `supabase db query --linked`
- [x] Edge function gedeployed naar CRM-project (neemt ook de nog niet gedeployde telefoon-wijziging van PR #65 en de mail-wijzigingen van PR #60 mee); productiepad + legacy-pad daarna live getest via curl
- [x] PR openen; testrijen rapporteren aan CRM-team (niet zelf verwijderen)

### Review
- DB-verificatie (leads_bewoners): "Jan / van der / Testcontact" → `naam` door trigger
  "Jan van der Testcontact", bron Website; "Jan / van der / Testsubsidie" → bron
  Subsidiecheck mét postcode/straat/notities intact. (leads_uitvoerders): "Piet / de /
  Testuitvoerder" → `contactpersoon` "Piet de Testuitvoerder".
- Functie-test na deploy: nieuw pad ("Testfunctie") én legacy pad (alleen `naam`
  "Jan Legacytest") geven ok+mailed; de CRM-trigger blijkt een legacy `naam` zelfs zelf
  te splitsen in voornaam/achternaam. Legacy-terugval in de functie kan weg zodra `naam`
  een generated column wordt.
- Testrijen (door CRM-team te verwijderen): leads_bewoners achternaam Testcontact,
  Testsubsidie, Testfunctie + naam "Jan Legacytest"; leads_uitvoerders achternaam
  Testuitvoerder.
- Tussenvoegsel bewust zonder autoComplete (geen standaard token); voornaam/achternaam
  kregen given-name/family-name. Optionele naamdelen: ongeldige tekens → veldfout client-
  side; serverside mild (ongeldig deel weglaten) zodat een lead nooit verloren gaat.
- Vervolg 2 (zelfde dag, afgestemd): voornaam overal verplicht (contact bewoner +
  uitvoerder + subsidiecheck); naamvelden op lg+ op één rij, daaronder voornaam boven en
  tussenvoegsel + achternaam samen. Uitvoerder-variant naar het Adres-groepspatroon
  (groepslabel "Contactpersoon (tussenvoegsel optioneel)" + placeholders) omdat de losse
  labels over twee regels braken. Tussenvoegsel blijft optioneel (geen *). Geverifieerd:
  tsc/49 tests/baseline-eslint + headless (één rij desktop, stapeling tablet/mobiel,
  "Vul je voornaam in."-fout op beide formulieren zonder insert).
- Vervolg (zelfde dag, afgestemd): mail-aanhef persoonlijker. Met voornaam "Hallo Jan,";
  zonder voornaam "Beste heer/mevrouw Van der Berg," (geslacht wordt niet uitgevraagd →
  gecombineerde vorm; tussenvoegsel/naam met hoofdletter in weergave, DB blijft zoals
  getypt); legacy-pad blijft "Hallo {naam},". Opnieuw gedeployed + live getest (2 extra
  testrijen leads_bewoners, achternaam Testaanhef; mails ter controle op info@).

## Visuele aanpassingen Over ons + Partners (2026-07-16)

Branch: `tweak/team-partners-visuals` (nieuw, vanaf `main`). PR ready-for-review, niet mergen.

### Plan
- [x] Nieuwe branch vanaf `main` (huidige `feat/subsidiecheck-afscherming` blijft onaangeroerd, PR #66 open)
- [x] **Over ons:** persoonlijke quotes per teamlid verwijderen (`quote`-veld + weergaveblok met scheidingslijn); naam + functie blijven
- [x] **Partners:** hele pakkettensectie ("Kies wat past bij jullie", pakket 01/02/03) verwijderen, incl. `PackageCard`, `packages`-data, types en dan ongebruikte imports (`useState`, `ChevronDown`, `FileCheck`, `ShieldCheck`, `AnimatedGradientBorder`, `LucideIcon`)
- [x] **Partners hero:** titel donkerblauw (`hsl(var(--primary))` = #152C4E), het woord "voortraject" blijft oker (accent)
- [x] **Partners fontcontrole:** hele pagina langsgelopen. Bevinding: alles volgt de huisstijl (Manrope + Inter Tight via `h2-section`), behalve de hero-h1: weight 600 / -0.02em waar alle andere paginahero's Manrope 700 / -0.03em gebruiken → gelijkgetrokken. (De pakkettensectie met afwijkende inline JetBrains Mono/Inter Tight is sowieso weg.)
- [x] **Partners CTA's:** de "Plan een kennismaking"-knoppen (hero, voor/na-sectie, footer-CTA) vervangen door de bestaande `CtaButton`-component = exact de headerknop-stijl (gouden pill, rounded-full, sheen-glans). Label blijft "Plan een kennismaking". Ongebruikte `ctaButton`-const opgeruimd.
- [x] Over ons footer-CTA ook naar `CtaButton` (afgestemd: "ook Over ons")
- [x] Verificatie: `tsc` schoon · eslint op beide bestanden schoon (baseline 11 err/8 warn ongewijzigd, in niet-aangeraakte bestanden) · 49/49 vitest · `bun run build` groen · visueel geverifieerd via dev-server + headless Chrome (desktop + mobiel, beide pagina's)
- [x] Commit + PR (ready-for-review)

### Review
- Teamkaarten Over ons tonen nu alleen naam + functie; scheidingslijn onder de functie is mee verwijderd (hing anders los onderaan de kaart).
- Partners: sectie-anchor `#pakketten` bestond nergens als link, dus veilig verwijderd; sectiecomment "INLEIDING PAKKETTEN (Vastlopen)" hernoemd naar "VASTLOPEN".
- Mobiele headless-screenshot (390px) toont rechts afgesneden content, maar productie doet in dezelfde headless-opstelling exact hetzelfde → pre-existing artefact van headless Chrome + `overflow-x: clip`, geen regressie.
- Bewust niet aangepast: "Zonder/Met Voortraject"-h3's en footer-CTA-koppen gebruiken sitebreed `font-display` (Manrope); dat is de bestaande conventie, geen afwijking van de Partners-pagina.

## Subsidiecheck — stap 1 desktop-polish (2026-07-15)

Branch: `tweak/subsidiecheck-stap1-desktop`. Kleine vervolg-tweaks op de 2-stappen-flow
(PR #56), alleen in `src/pages/Subsidiecheck.tsx`.

### Keuzes (met opdrachtgever afgestemd)
- Interesses-uitklap **ingeklapt houden** op desktop én mobiel (rustig, "alle maatregelen"
  als default) — géén wijziging.
- Stap-1-breedte van **760 → 640px** (interesses staan standaard ingeklapt, dus de
  "Ik ben…"-2×2 mag compacter). Stap 2 blijft 1040.

### Gedaan
- [x] `maxWidth` stap 1: 760 → 640 (comment bijgewerkt).
- [x] Adres-zoeksubregel ("We zoeken alle regelingen…") op mobiel verborgen via
      `hidden sm:block` (nieuw veldje `subVerbergMobiel` op de kop-config); de
      "Nog één stap"-subregel (bekend adres) blijft op alle schermen staan.
- [x] Verificatie: `tsc` schoon · `eslint` op het bestand schoon (baseline 11 err/8 warn
      ongewijzigd, in níet-aangeraakte bestanden) · 49/49 vitest · `bun run build` groen.

### Bewust NIET gedaan
- Interesse-chips op echte mobiel vallen (gerekend, 360px) in ~4 regels i.p.v. ≤3;
  "Warmtenet-aansluiting"/"Isolatie & glas" zijn de brede labels. Omdat de chips op mobiel
  achter de opt-in-uitklap zitten, acceptabel gelaten. Kortere mobiele labels zouden de
  gedeelde `MAATREGEL_LABELS` raken → alleen op verzoek.

## Social preview / deel-kaart subsidiecheck (2026-07-15)

Branch: `feat/subsidiecheck-social-preview`. Aanleiding: de "Deel de tool"-knop op
het resultaat toonde in WhatsApp alleen kale tekst + link, geen preview-kaart.

### Diagnose (op productie geverifieerd met curl + WhatsApp-UA)
- `voortraject.nl/subsidiecheck` gaf 200 mét OG-tags, en de `og:image` was bereikbaar
  — technisch dus "geldig". Tóch geen kaart, omdat:
  1. De afbeelding was een **Lovable-restje: 568 KB op een extern `…r2.dev`-domein**.
     WhatsApp toont previews boven ~300 KB en/of cross-domain vaak niet.
  2. `og:url` en `og:image:width/height` ontbraken.
- Extra: WhatsApp **cachet per URL** lang → na de fix testen met een verse URL (`?v=2`).

### Gedaan
- [x] Eigen gebrande deel-kaart `public/og/voortraject-subsidiecheck.jpg` (1200×630, **96 KB**):
      hero-adviesgesprek-foto + navy-scrim + wit woordmerk + oker accent +
      "Gratis subsidiecheck". Gerenderd via headless Chrome (2×) + ImageMagick.
- [x] `index.html`: Lovable-URL vervangen door de eigen afbeelding; volledige tags
      toegevoegd (`og:url`, `og:site_name`, `og:locale`, `og:image:width/height/alt/type`).
- [x] `Seo.tsx`: `og:image`/`twitter:image`/`twitter:card`/`og:site_name` toegevoegd,
      met optionele `image`-prop (voor latere per-pagina kaarten = Tier 2).
- [x] `StapResultaat.tsx`: deeltekst ingekort/betrouwbaarder gemaakt (emoji weg).

### Bewust (nog) NIET gedaan
- **Tier 2 (per-pagina kaart via Cloudflare Pages Function).** Nu 1 sitebrede kaart:
  elke gedeelde link toont de subsidiecheck-kaart. Prima voor de deel-knop; homepage
  toont dan óók die kaart. Optioneel later opsplitsen.

### Na deploy (productie) — testen
1. Cloudflare-deploy afwachten. 2. Facebook Sharing Debugger de URL laten her-scrapen.
3. In WhatsApp `voortraject.nl/subsidiecheck?v=2` delen (cache-bust) → kaart moet verschijnen.

## Subsidiechecker — conversietool (2026-07-12)

Branch: `feat/subsidiecheck` (langlopende feature-branch, meerdere dagen; regelmatig
`main` erin mergen tegen drift). **Nog niet gebouwd — dit is het plan.**

### Doel
Een postcode-gedreven subsidiechecker die bezoekers naar de site trekt en omzet in leads.
Bezoeker vult postcode (+ huisnummer) in → ziet in één rustig overzicht álle relevante
verduurzamingssubsidies (landelijk + provinciaal + gemeentelijk) voor heel Noord-Nederland.

**Leidend principe: value-first, conversie-tweede.** De tool verdient vertrouwen door écht
nuttig te zijn; de CTA is "wij nemen het uitzoek- en aanvraagwerk van je over", nooit
"koop nu". Kalme, betrouwbare huisstijl (institutional B2B) — geen hype, geen "GRATIS GELD".

### Databron-strategie (belangrijk)
- Data komt van een **externe, onderhouden bron** (voorkeur: Milieu Centraal /
  Energiesubsidiewijzer API — gratis, CC-0, gezaghebbend; mail is verstuurd, wachten op
  whitelist + docs). Bevestigd dat die bron voor een Emmen-adres rijk + provincie + gemeente
  teruggeeft.
- **We bouwen achter een adapter zodat de bron verwisselbaar is** en we NIET op de mail
  hoeven te wachten. Alleen de laatste bekabeling (endpoint/auth/veldnamen) wacht.
- Fallback-bronnen indien Milieu Centraal afwijst: Altum AI Subsidies API (betaald) of eigen
  gecureerde DB (ruggengraat: landelijk + Nij Begun/SNN + provinciaal). Zie geheugen
  `business-scope-noord-nederland` en `supabase-crm-only-active`.

### Architectuur — adapterlaag (`src/lib/subsidies/`)
- `types.ts` — `SubsidieNiveau = 'rijk' | 'provincie' | 'gemeente' | 'overig'`;
  `SubsidieResultaat { id, titel, niveau, omschrijving, bedragIndicatie?, bronUrl, aanbieder }`;
  `SubsidieCheckInput { postcode, huisnummer, bewonertype, maatregelen[] }`;
  `Bewonertype = 'woningeigenaar' | 'huurder' | 'vve' | 'verhuurder'`.
- `provider.ts` — interface `SubsidieProvider { check(input): Promise<SubsidieResultaat[]> }`.
- `mockProvider.ts` — realistische mockdata in het Verbeterjehuis-formaat, met
  postcode-afhankelijke variatie (Groningen→Nij Begun/SNN, Drenthe→provinciale/gemeentelijke,
  landelijk altijd ISDE/Warmtefonds). Zodat de hele flow nu al echt werkt.
- `milieuCentraalProvider.ts` — stub, in te vullen zodra docs binnen zijn.
- `index.ts` — exporteert de actieve provider (één plek om te wisselen: mock → echt).
- `useSubsidieCheck` hook (react-query) om provider te wrappen: caching, loading, error.

### Herbruikbare bouwstenen (bestaan al)
- **PDOK adres-lookup** staat al in `Contact.tsx` (`lookupAdres`, `POSTCODE_RE`,
  `normalizePostcode`). → **Refactor naar `src/lib/pdok.ts` + `usePdokAdres` hook** en laat
  zowel Contact als Subsidiecheck die delen (DRY, één implementatie).
- **Lead-insert** gaat al naar `supabaseExternal.from("leads_bewoners").insert({...})` met
  velden tenant_id, naam, email, telefoon, postcode, huisnummer, toevoeging, straat, stad,
  notities, bron, status. → Hergebruiken met `bron: "Subsidiecheck"`; geselecteerde
  maatregelen + gevonden subsidies in `notities`. **Exact dezelfde tabel/kolommen — niet
  hernoemen** (data-integriteit, CLAUDE.md-regel 2).
- `CtaButton`, `Seo`, sectiepatronen, design-tokens (`text-accent`, `text-primary`,
  `bg-secondary`, `bg-card-soft`).

### UX-flow (elk detail)
**1. Homepage-instappunt — sectie direct ónder `LogoCarousel`** (nieuw
`src/components/sections/SubsidiecheckCta.tsx`, ingevoegd in `Index.tsx` tussen
`<LogoCarousel/>` en `<Herkenning/>`):
- Rustige sectie (bijv. `bg-secondary` sand of `bg-card-soft` cream, contrast met witte strip).
- Kop: "Ontdek welke subsidies er voor jouw woning zijn". Subregel: "Vul je postcode in en
  zie in één overzicht alle regelingen — landelijk, provinciaal én van jouw gemeente."
- **Inline postcode + huisnummer-veld direct in de sectie** + knop "Bekijk mijn subsidies →".
  Start de flow al op de home; navigeert naar `/subsidiecheck?pc=…&hn=…` (voorinvullen).
- Subtiele trust-cue: "Gratis · geen account nodig · klaar in 1 minuut". Klein, niet schreeuwerig.

**2. Hero secundaire CTA** — op de plek van "Of bel direct: 050 211 2689" in `Hero.tsx` komt
"Check jouw subsidies" (zelfde outline/secundaire stijl, concurreert niet met de gouden
"Plan een gratis gesprek"). Telefoon blijft bereikbaar via de header-pill + WhatsApp-knop.
→ *Beslispunt bevestigd met opdrachtgever: telefoon-CTA hier vervangen is akkoord.*

**3. De tool — `/subsidiecheck` (nieuw `src/pages/Subsidiecheck.tsx`)**, lichte stapper met
voortgangsindicator (afrondingspsychologie), mobile-first, tapdoelen ≥44px:
- **Stap 1 — Adres:** postcode + huisnummer (voorgevuld vanaf home). PDOK bevestigt zichtbaar
  ("Kerkstraat 12, Groningen ✓") → vertrouwen + minder fouten. Duidelijke, vriendelijke
  foutmeldingen bij geen match.
- **Stap 2 — Situatie (kort houden = hogere completion):**
  - Type bewoner (woningeigenaar/huurder/VvE/verhuurder) als grote tapbare kaarten, geen dropdown.
  - Maatregelen van interesse (isolatie, warmtepomp, zonnepanelen, ventilatie, …) als
    multi-select chips. **Default "toon alles"** zodat een luie gebruiker tóch resultaat krijgt.
  - Niet méér vragen dan de bron nodig heeft (Verbeterjehuis gebruikt enkel postcode +
    bewonertype + maatregelfilters — geen bouwjaar/woningtype forceren).
- **Stap 3 — Resultaat (de payoff):**
  - Kopregel: "We vonden X regelingen voor jouw adres."
  - Scanbare lijst, **gegroepeerd per niveau** (Rijksoverheid / Provincie / Gemeente / Overig)
    met gekleurde labels zoals Verbeterjehuis. `SubsidieCard`: titel + niveau-tag + 1 regel
    uitleg + indicatief bedrag (indien beschikbaar) + "Meer info" → officiële bron.
  - Skeleton-loading tijdens ophalen; nette empty- en error-state.
- **Conversie aan het eind (kalm, contextueel):**
  - Primair: "Subsidies stapelen is ingewikkeld — wij regelen de aanvraag gratis voor je.
    → Plan een gratis gesprek" (`CtaButton` naar `/contact`).
  - Zacht (minst commercieel, hoogste opbrengst): **"Mail mij dit overzicht"** — vangt e-mail
    + adres → `leads_bewoners` (`bron: "Subsidiecheck"`). Lage drempel, hoge waarde, voedt CRM.

### Conversie zonder commercieel te ogen
- Waarde vóórop (het overzicht), CTA als hulp geframed, niet als verkoop.
- Twee conversieroutes: gesprek (warm) + e-mail-overzicht (zacht) — beide naar CRM met
  onderscheidende `bron`.
- Snelle resultaten, voortgangsbalk, grote tapdoelen, één kolom op mobiel.

### Taken per fase
**Fase 0 — Scaffolding**
- [x] Adapterlaag `src/lib/subsidies/` (types, provider-interface, mockProvider, index)
- [x] `useSubsidieCheck` hook (react-query)
- [x] Refactor PDOK naar `src/lib/pdok.ts` + `usePdokAdres`; Contact.tsx laten hergebruiken
- [x] Route `/subsidiecheck` in `App.tsx` + pagina (Header/Seo/Footer)

**Fase 1 — De flow (mockdata, volledig gestyled)**
- [x] Stapper + voortgangsindicator, focus-management tussen stappen
- [x] Stap 1 Adres (PDOK-bevestiging), Stap 2 Situatie (kaarten + chips), Stap 3 Resultaat
- [x] `SubsidieCard` + groepering per niveau + laadsequentie/empty/error-states
- [x] Extra's na review opdrachtgever: pill-verfijning home (velden #F5F3ED, streepje weg),
      postcode auto-hoofdletters + autosprong, "situatie aanpassen" op resultaat,
      maatregel-tags op kaarten, kopieer-link naar overzicht
- [x] Feedbackronde 2 (2026-07-12): toevoeging-veld ook in de homepage-pill (loopt mee als
      `tv` in de deeplink); sitewide `ScrollToTop` in App.tsx — SPA behield scrollpositie
      bij navigatie, dus wie vanaf de home-CTA (onder de vouw) doorklikte landde onderaan
      /subsidiecheck. Push/replace → naar boven, back-knop (POP) blijft hersteld. Headless
      geverifieerd: na submit scrollY 0 + `tv` in URL, na back scrollY 974 hersteld,
      mobiel 390px geen overflow.

**Fase 2 — Instappunten**
- [x] Homepage-sectie `SubsidiecheckCta` onder `LogoCarousel` (inline postcode → deeplink)
- [x] Hero secundaire CTA "Check jouw subsidies" i.p.v. "Of bel direct"
- [x] Nav: uitgelicht item in `Subsidies`-dropdown (icoon + "Tool"-label + divider) — desktop
      én mobiel menu in `Header.tsx`

**Fase 3 — Lead capture**
- [x] "Mail mij dit overzicht" → `leads_bewoners` (bron "Subsidiecheck", maatregelen+aantal in
      notities), zelfde validatie/honeypot-patroon als Contact.tsx
- [x] Consent-aware GTM-events in code (`src/lib/gtm.ts`): `subsidiecheck_start` (adres
      bevestigd), `subsidiecheck_voltooid` (resultaat, incl. aantal/bewonertype/gemeente/
      provincie), `subsidiecheck_lead` (mail-overzicht) — géén persoonsgegevens in de events
- [ ] **GTM-container inrichten (klikwerk op tagmanager.google.com, container GTM-P6W5MNN4;
      kan los van de site-deploy, ~10 min):**
      1. *Triggers* (type "Aangepaste gebeurtenis"): `subsidiecheck_start`,
         `subsidiecheck_voltooid`, `subsidiecheck_lead`
      2. *Gegevenslaagvariabelen*: `aantal_regelingen`, `bewonertype`, `gemeente`, `provincie`
      3. *GA4-gebeurtenistags* (3×): zelfde eventnamen, parameters uit stap 2 meesturen,
         gekoppeld aan de triggers uit stap 1 — vereist bestaande GA4-basistag (meet-ID
         `G-…`); zo niet, eerst GA4-property + Google-tag aanmaken
      Daarna testen via Voorbeeld-modus (werkt ook op localhost, eerst Axeptio accepteren)
      en publiceren.

**Fase 4 — Polish & verificatie**
- [x] A11y: semantische stappen, `aria-live` op resultaat, focus naar kop bij stapwissel, labels
- [x] SEO: `/subsidiecheck` meta + opgenomen in `scripts/generate-sitemap.ts`
- [x] Tests (vitest, 12): adapter groepeert/filtert correct; postcodevalidatie
- [x] `prefers-reduced-motion`, headless visuele verificatie desktop + mobiel (zie geheugen)
- [x] Typecheck + `bun run build` groen; lint 0 nieuwe issues (20 pre-existing)

**Fase 5 — Echte bron inpluggen (wacht op Milieu Centraal)**
- [ ] `milieuCentraalProvider` invullen (endpoint/auth/veldnamen), provider omwisselen in `index.ts`
- [ ] Verifiëren tegen echte responses (postcodeniveau vs adresniveau bevestigen)
- [ ] E-mailverzending voor "Mail mij dit overzicht" (edge function of handmatig vanuit CRM
      binnen 24u — zolang dat niet geregeld is belooft de UI iets dat het team moet waarmaken)

### Resultaatpagina-herontwerp na CRO/psychologie-analyse (2026-07-12)
Kritische analyse (eigen frisse blik + onderzoek naar bezoekerspsychologie: NN/g,
Baymard, peer-reviewed labor-illusion/peak-end/goal-gradient, live vergelijk met
Verbeterjehuis/Independer/Gaslicht). Doel: de meest gebruiksvriendelijke, duidelijke en
overzichtelijke subsidiewijzer van Noord-Nederland. Alles op mockdata; verdwijnt/wisselt
mee zodra de echte provider is aangesloten. **Doorgevoerd:**
- **Datamodel** (`types.ts`): `SubsidieType = 'subsidie' | 'lening'` + `type` op elke
  regeling; optionele `voorWie` + `belangrijksteVoorwaarde` (uitklap-verdieping);
  `maakSamenvatting()` (aantal, subsidie/lening-split, per-niveau — **bewust géén verzonnen
  totaalbedrag**, niet verdedigbaar op mock/niet-stapelbaar); `NIVEAU_KORT` + `TYPE_LABELS`;
  `NIVEAU_LABELS.overig` → "Leningen en overig".
- **Samenvattingskaart** (nieuw `Samenvatting.tsx`) bovenaan het resultaat = de piek
  (inverted pyramid + peak-end): groot aantal (cijfers stoppen het oog), situatie
  teruggekoppeld ("voor jouw koopwoning in Groningen", endowment), subsidie/lening-split,
  niveaulegenda die dubbelt als kleurcode voor de kaarten, de keuzestress-wegnemende zin
  ("je hoeft niets te kiezen, veel is te combineren, wij zoeken het uit"), en een
  "Mail mij dit overzicht"-quicklink die naar het formulier scrollt + het e-mailveld focust.
- **SubsidieCard herontworpen**: type-kicker (SUBSIDIE muted / **LENING** terracotta —
  lost de "€ 71.000 lening leest als subsidie"-val op), bedrag op vaste plek rechtsboven
  (verticaal scanbaar), body 14→15px (45+-leesbaarheid), maatregelen als rustige leesregel
  i.p.v. chips (leken op de klikbare filterchips), en een **uitklap** (drielagenmodel
  Independer: beslissen → begrijpen → verifiëren) met Voor wie / Belangrijkste voorwaarde /
  combineerbaarheid / officiële bronlink. Kaartactie links uitgelijnd op mobiel (uit de
  WhatsApp-hoek).
- **StapResultaat herstructureerd**: groepen nu gestápeld (landelijk → lokaal, layer-cake)
  met kaarten 2-koloms binnen een groep i.p.v. groepen naast elkaar; conversieblok met
  endowed-progress ("Stap 1 is klaar"), mail-CTA met meerwaarde (incl. aanvraaglinks),
  gesprek-CTA met geruststellende microcopy (Vrijblijvend · Reactie binnen 24 uur · Lokaal
  adviesteam); **disclaimer weg van de allerlaatste plek** (nu naast de kopieer-link), pagina
  eindigt **warm** ("Veel regelingen blijven onbenut. Jij bent nu een stap verder…").
- **Sitewide `ScrollToTop`** (eerder deze sessie) + pagina bottom-padding `pb-28` op mobiel
  voor WhatsApp-FAB-clearance.
- **Bewust NIET gedaan (met reden):** geen resultaten achter e-mail gaten (vertrouwen +
  positionering); geen hype-totaalanker; **sticky mobiele mail-balk overgeslagen** omdat die
  botst met de vaste WhatsApp-knop (twee zwevende dingen rechtsonder = rommelig voor een
  "kalme" merk) — de mail-quicklink in de samenvatting dekt de vroege toegang af; button-copy
  "Plan een gratis gesprek" blijft (sitewide één-CTA-regel > eerste-persoon-winst hier);
  numerieke sortering binnen groepen uitgesteld tot echte data (relevantie-metadata); geen
  verzonnen review-sterren (feitelijke trust-microcopy i.p.v.).
- **Geverifieerd:** `tsc` schoon; 12/12 vitest groen; lint 0 nieuwe meldingen (nieuwe
  bestanden 0, totaal blijft 20 pre-existing); `bun run build` groen; headless CDP desktop +
  mobiel (samenvatting/kaarten/conversie/warm slot correct, LENING-badge terracotta, geen
  390px-overflow) + interactietest (mail-knop scrollt naar & focust e-mailveld; uitklap toont
  voorwaarde + officiële link met aria-expanded).

### ▶ STATUS 2026-07-13 — live-brug gebouwd, hier verdergaan
De bouw tegen de echte bron werkt lokaal. **Af (op `feat/subsidiecheck`, gepusht):**
- Parser `src/lib/subsidies/energiesubsidiewijzer.ts` (25/25 tests, fixtures in `src/test/fixtures/`).
- Provider `energiesubsidiewijzerProvider.ts` actief in `index.ts`; DEV via Vite-proxy `/esw`
  (`vite.config.ts`) + client-side detail-verrijking; terugval op mock. Lokaal geverifieerd:
  18 echte regelingen voor 9742HJ mét bedragen.

**Resterende stappen om live te gaan (akkoord "helemaal afmaken"):**
1. [x] **Edge function** (CRM-project `lfelnfukbrxznkevnevr`) — GEBOUWD 2026-07-13, nog te deployen.
2. [x] **E-mail**: keuze = **automatisch via Resend** — GEBOUWD 2026-07-13, nog te deployen + DNS.
3. [ ] **GTM-container**: 3 triggers / 4 variabelen / 3 tags (zie Fase 3-blok). Klikwerk.
4. [ ] **`main` mergen** in de branch → PR → review → merge (productie via Cloudflare).

#### ▶ STATUS 2026-07-13 (2e sessie) — edge functions + Resend gebouwd, klaar om te deployen
Twee Deno-edge-functions in `supabase/functions/` (gaan naar het **CRM**-project; `config.toml`
`project_id` → `lfelnfukbrxznkevnevr` gezet):
- **`subsidiecheck`** — databrug: haalt serverside de Energiesubsidiewijzer op, parset + verrijkt
  (bedrag/voorwaarde/officiële bron, concurrency-limiet 6) + **in-memory cache** (lijst 12u,
  detail 24u) + open CORS, levert JSON. Parser is een **zelfstandige kopie** van
  `src/lib/subsidies/energiesubsidiewijzer.ts` + `types.ts` mét `.ts`-imports (Deno eist extensies);
  kopie is regel-identiek aan de bron (bij parserwijziging: sync!). Geen secrets, geen DB.
- **`subsidiecheck-mail`** — schrijft de lead (service_role, exact `leads_bewoners`-kolommen) én
  stuurt de bezoeker het overzicht via **Resend** (nette HTML-mail in huisstijl, gegroepeerd per
  niveau, CTA → /contact, teamkopie via `MAIL_BCC`). Lead is leidend: mail-hapering verliest nooit
  een lead (`ok:true` zolang de lead staat). Secrets: `RESEND_API_KEY`, `MAIL_FROM`, `MAIL_BCC?`,
  `MAIL_REPLY_TO?`, `SITE_URL?`.

Frontend-bekabeling (met stille terugval, zoals google-reviews):
- Provider: `VITE_SUBSIDIECHECK_URL` gezet → JSON via function; anders DEV-proxy `/esw` +
  client-verrijking; faalt de bron → mock. Aanroep stuurt CRM-anon-key als `apikey`-header mee
  (gateway-eis, ook bij verify_jwt=false).
- `MailOverzicht`: `VITE_SUBSIDIECHECK_MAIL_URL` gezet → function (mail+lead); anders directe
  client-insert (lead zonder mail). Zo breekt niets vóór deploy.
- `.env.example` bijgewerkt met beide publieke function-URLs. Anon-key + URL geëxporteerd uit
  `external-client.ts`.
- Geverifieerd: 25/25 tests, tsc/lint/build groen, 4 Deno-bestanden syntax-valide (esbuild),
  DEV-proxy levert 18 kaarten. Deno `deno check` NIET lokaal gedraaid (Deno niet geïnstalleerd) —
  gebeurt bij deploy.

**DEPLOY-STAPPEN (mens, met Supabase-toegang) — zie de sessie-samenvatting / hieronder:**
A. Resend: account → domein voortraject.nl verifiëren (DKIM/SPF DNS) → API-key.
B. Supabase-secrets (CRM-project) zetten: RESEND_API_KEY, MAIL_FROM="Voortraject <noreply@voortraject.nl>",
   MAIL_BCC=info@voortraject.nl, MAIL_REPLY_TO=info@voortraject.nl, SITE_URL=https://www.voortraject.nl.
C. `supabase functions deploy subsidiecheck --project-ref lfelnfukbrxznkevnevr` (idem `subsidiecheck-mail`).
D. Env-vars in Cloudflare Pages (+ lokale .env): VITE_SUBSIDIECHECK_URL + VITE_SUBSIDIECHECK_MAIL_URL
   = `https://lfelnfukbrxznkevnevr.supabase.co/functions/v1/<naam>`. Redeploy site.
E. Test: `curl ".../functions/v1/subsidiecheck?postalcode=9742HJ"` → JSON; formulier op de site →
   mail ontvangen + lead in CRM.

### ▶ DRAAIBOEK: oppakken zodra de Milieu Centraal-API binnen is (status 2026-07-12)
**Waar alles staat.** Branch `feat/subsidiecheck` (gepusht naar origin, 25 commits, GEEN
PR — bewust: pas live mét echte data). Bouw is af t/m polish; mock levert voorbeelddata
met zichtbare gele melding op de resultaatpagina (verdwijnt automatisch bij echte provider).

**Brononderzoek 2026-07-12 (belangrijk — plan bijgesteld):**
- De XML-webservice uit de data.overheid.nl-catalogus (`energiesubsidiewijzer.nl/
  Energiesubsidiewijzer.svc`) is **opgeheven**: 301-redirect naar verbeterjehuis.nl. De
  catalogus-entry is verouderd. Er is dus géén losse XML/SOAP-API meer.
- Wél werkt **nu, publiek, zonder key, CC-0**: `GET https://www.verbeterjehuis.nl/
  energiesubsidiewijzer?postalcode=<PC6>` geeft een server-rendered resultaatpagina
  (voor 9742HJ: 18 kaarten). Schone, parsebare HTML per kaart:
  - titel: `h2.register-card__title`
  - niveau: `span.register-card__label--{national-government|municipality|other}`
    (→ Rijksoverheid/Gemeente/Overige aanbieders; **let op:** hun taxonomie kent geen
    losse "provincie" — SNN/Nij Begun valt bij hen onder Rijksoverheid. Mapping-keuze
    maken; onze `provincie`-groep blijft mogelijk leeg of we reclassificeren op aanbieder.)
  - type: kaart in `#register-subsidies` = subsidie, in `#register-loans` = lening
  - omschrijving: `span.register-card__body`; detail-link = de `href` van de kaart
  - **bedrag + voorWie + belangrijksteVoorwaarde + officiële externe bronlink staan NIET
    op de lijst** — die zitten op de detailpagina per regeling (N+1 fetches nodig).
- **Aanpak:** edge function in het CRM-Supabaseproject die serverside de HTML ophaalt +
  parset naar `SubsidieRegeling[]` (voorkomt CORS + houdt scraping van de client). De
  frontend-`milieuCentraalProvider` roept die function aan. Cachen (dag) tegen fragiliteit.
- **Afweging:** HTML-parsen is fragiel (markup kan wijzigen) en is technisch de "achterdeur"
  die dit draaiboek eerder wilde vermijden — maar de data is officieel open (CC-0), dus
  juridisch prima. Beste plan: **bouw nu tegen de HTML als brug** (dan zijn we niet meer
  geblokkeerd), en houd de nette REST/JSON-koppeling (mail naar Milieu Centraal) als
  robuustere einddoel. De provider-interface maakt later omwisselen triviaal.

**Stap 1 — API aansluiten (~dagdeel):**
1. Maak `src/lib/subsidies/milieuCentraalProvider.ts` conform interface in `provider.ts`
   (naam ≠ "Voorbeeldgegevens", anders blijft de voorbeelddata-melding staan).
2. Map hun categorieën → onze `Maatregel`-types (types.ts) en niveaus → `SubsidieNiveau`.
   **Ook verplicht per regeling:** `type` (`'subsidie' | 'lening'` — bepaalt het kaartlabel
   én de subsidie/lening-split in de samenvatting; leningen ≠ subsidies). Optioneel maar
   aanbevolen: `voorWie` + `belangrijksteVoorwaarde` (vullen de kaart-uitklap; zonder deze
   toont de uitklap alleen de combineerbaarheid + bronlink).
   Check: postcode-only bevestigd; monument-parameter meenemen als de API die kent.
3. Wissel om in `src/lib/subsidies/index.ts` (één regel). API-key? Dan NIET client-side
   als die geheim moet blijven → edge function als proxy in het CRM-Supabaseproject.
4. Verifieer met echte adressen: Groningen-stad, Emmen, Leeuwarden, Randstad-adres
   (buiten werkgebied), huurder, VvE. Vergelijk met verbeterjehuis.nl/energiesubsidiewijzer.
5. `bun run test` (pas mock-tests aan indien nodig), lint/tsc/build, headless visueel
   (zie geheugen: Chrome clampt width op ~500px).

**Stap 2 — Go-live-checklist:**
- [ ] E-mailverzending geregeld (edge function + Resend + SPF/DKIM, óf werkafspraak
      handmatig <24u vanuit CRM) — de mail is de primaire CTA-belofte
- [ ] GTM-container ingericht (zie Fase 3-blok hierboven: 3 triggers, 4 variabelen, 3 tags)
- [ ] `main` in de branch mergen (branch is van 2026-07-12; drift wegwerken)
- [ ] PR openen → review → merge (main = productie via Cloudflare Pages)
- [ ] Na livegang: GTM realtime checken + een echte testlead door CRM zien lopen

**Fallback als Milieu Centraal afwijst:** Altum AI Subsidies API (betaald, zelfde
provider-interface) of eigen gecureerde DB in het CRM-Supabaseproject (zie geheugen
`supabase-crm-only-active`). Mail verstuurd 2026-07-12; reminder rond 20 juli als stil.

### Suggesties uit vergelijk met Verbeterjehuis (2026-07-12)
- **Energiesubsidiewijzer werkt op postcode-only (PC6), bevestigd** door hun aanvraagform.
  Ons huisnummer blijft voor het vertrouwensmoment (adresbevestiging) + leadkwaliteit,
  niet voor het resultaat.
- [ ] **Monument-vinkje** ("Mijn woning is een monument") — zij vragen het; afwijkende
      regels/regelingen. Meenemen in **Fase 5** als de API de parameter ondersteunt; tot
      die tijd adviseur-territorium.
- [x] Optioneel toevoeging-veld in stap 1 — gebouwd (2026-07-12): verfijnt de PDOK-match,
      loopt mee in URL (`tv`), adres-pill, resultaatkop en de lead (`toevoeging`-kolom).
- **Chips-lijst bevestigd (8)** na vergelijk met hun 18 filteropties: bewust weggelaten:
  kleine maatregelen, gasaansluiting verwijderen, energieadvies (concurreert met eigen
  gratis advies!), zonwering, vergroenen-tak, proces ondersteuning. Asbest verwijderen =
  "misschien later" (agrarisch Noord-NL, combi met dakisolatie). Airco heeft geen eigen
  chip nodig: ISDE schaart warmtepomp-airco's onder warmtepomp.
- Verbetercheck ≠ Energiesubsidiewijzer: hun 15+-vragen-wizard rekent subsidiebedragen per
  maatregel uit; bewust NIET nabouwen (botst met "klaar in 1 minuut" — onze CTA/adviseur ís
  de verdieping). Hun "prefill + pas aan"-patroon doen wij al via PDOK (gemeente/provincie
  zonder vraag). Sticky samenvattings-zijbalk: bewaren voor eventuele rekenlaag later.

### Open beslissingen / risico's
- Granulariteit bron: Verbeterjehuis-URL gebruikt alleen `postalcode` (geen huisnummer) →
  waarschijnlijk PC6-niveau. Huisnummer dan vooral voor adresbevestiging + lead. Bevestigen bij docs.
- Geen ongesanctioneerde website-URL van Milieu Centraal als "achterdeur-API" in productie.
- Data-integriteit: `leads_bewoners`-schema is een gedeelde CRM-tabel — kolommen exact
  overnemen zoals in Contact.tsx (geverifieerd), geen nieuwe velden zonder bevestiging.

### Review (2026-07-12 — Fase 0 t/m 4 af, flow werkt end-to-end op mock)
- **Gebouwd:** adapterlaag (`src/lib/subsidies/`: types, provider-interface, mockProvider
  met regiofiltering op PDOK-gemeente/-provincie), hooks `usePdokAdres` +
  `useSubsidieCheck` (react-query), PDOK gedeeld via `src/lib/pdok.ts` (Contact.tsx
  gerefactord, gedrag identiek), pagina `/subsidiecheck` met stapper (state volledig in
  URL → back-button, herladen en delen werken), homepage-sectie `SubsidiecheckCta`,
  hero-CTA "Check jouw subsidies" (i.p.v. "Of bel direct"), uitgelicht Tool-item in de
  Subsidies-dropdown (desktop + mobiel), "Mail mij dit overzicht" → `leads_bewoners`
  (bron "Subsidiecheck"), sitemap-entry.
- **Geverifieerd:** 12/12 vitest groen (filtering, groepering, postcodevalidatie);
  tsc schoon; build groen (sitemap 15 entries); lint 0 níeuwe issues (20 pre-existing,
  identiek met/zonder deze diff); headless visueel: stap 1→2→3 op desktop én mobiel,
  met échte PDOK-lookup (Emmen: rijk + provincie + 2× gemeente + Warmtefonds correct
  gegroepeerd). Gotcha vastgelegd: Chrome headless clampt window-width op ~500px.
- **Bewust buiten scope gelaten:** de 20 pre-existing lint-issues; verwijderde
  `christian-bellen.webp` in de working tree (was al zo, niet van deze taak; niet
  gecommit).
- **Open voor merge:** consent-aware GTM-event (Fase 3-restje), e-mailverzending
  overzicht, echte Milieu Centraal-provider (Fase 5). Mock is als bron zichtbaar
  ("Voorbeeldgegevens") dus niet stiekem.

## Google Reviews auto-sync op de home (2026-07-09)

Branch: `feat/google-reviews-sync`. Vervangt de handmatige review-array door een
automatische sync met onze Google-reviews. Huisstijl blijft 100% identiek.

### Aanpak (na sparren met de opdrachtgever)
- **Bron:** Google **Places API (New)** — Place Details (max 5 reviews, Google-gekozen).
  Business Profile API (OAuth + Google-goedkeuring) is **niet** nodig: het ontwerp is
  "toon 5 mooie + doorklikken naar Google", dus de 5-limiet is geen probleem, ook niet
  bij 100+ reviews later.
- **Fetch loskoppelen van render:** een **Supabase Edge Function** haalt op (API-key blijft
  server-side), **filtert >= 4 sterren**, sorteert nieuwste, schrijft naar Supabase. De
  frontend leest uit Supabase → geen third-party script client-side (consent/perf/SEO/AVG
  blijven schoon).
- **Dagelijkse cron** (~30 calls/mnd → ruim binnen gratis tier; quota-cap als harde garantie).
- **Fallback:** zolang de backend niet geactiveerd is (of bij fout / < 2 reviews) toont het
  component de huidige hardcoded reviews. De site kan dus niet breken.
- **"Alle reviews op Google"-knop** → doorklikken naar de volledige reviewpagina.

### Taken
- [x] SQL-migratie: `google_reviews` + `google_place_stats` (RLS: alleen publiek lezen)
- [x] Edge Function `sync-google-reviews` (Places API New, filter >=4, upsert + prune)
- [x] `config.toml` functie-entry (`verify_jwt = false`) + `.env.example` publieke URL
- [x] Hook `useGoogleReviews` (leest Supabase, stil terugvallen bij fout)
- [x] `Reviews.tsx` data-driven maken met fallback + Google-knop
- [x] Typecheck + lint + build groen
- [ ] Commit, push, PR met activatie-checklist

### Activatie (handmatige stappen voor Voortraject — NA merge, buiten deze PR)
1. Google Cloud Console: **quota-cap** op de Places API (bv. 100/dag) + **budget-alert (EUR 1)**.
2. Supabase secrets: `GOOGLE_MAPS_API_KEY` + `GOOGLE_PLACE_ID` zetten.
3. Migratie toepassen + Edge Function deployen; daarna **Supabase types regenereren**
   (dan kunnen de `any`-casts in de hook weg).
4. Dagelijkse cron op de functie inschakelen.
5. `VITE_GOOGLE_REVIEWS_URL` in de omgeving zetten (publieke Google-reviewpagina).

### Review (2026-07-09)
- **Projectkeuze (belangrijk):** de reviews leven in het **CRM-project**
  (`lfelnfukbrxznkevnevr`) via `supabaseExternal`, NIET in het oude Lovable-website-
  project (`zvsmazjcfzjyvnjrlnma`) dat de opdrachtgever niet meer gebruikt. Expliciet
  akkoord gegeven op 2026-07-09 om (alleen-lezen) reviewtabellen in CRM te zetten.
  De hook is daarom omgezet van `supabase` → `supabaseExternal`; casts vervielen
  (die client is ongetypeerd).
- **Veiligheidsprincipe geborgd:** de frontend valt stil terug op de hardcoded
  reviews zodra de query faalt (tabel bestaat nog niet, netwerk, < 2 reviews). Tot
  activatie toont de site dus exact de huidige 3 reviews — merge kan niets breken.
- **Nieuwe/gewijzigde bestanden:**
  - `supabase/migrations/20260709120000_google_reviews.sql` — 2 tabellen, RLS
    alleen-lezen voor anon (schrijven = service_role via de functie).
  - `supabase/functions/sync-google-reviews/index.ts` — Places API (New), FieldMask
    (kosten laag), filter >= 4, upsert op `google_review_id`, prune via `synced_at`.
  - `supabase/config.toml` — functie-entry `verify_jwt = false`.
  - `.env.example` — publieke `VITE_GOOGLE_REVIEWS_URL` (knop; geen secret).
  - `src/hooks/useGoogleReviews.ts` — leest Supabase, stil falen.
  - `src/components/sections/Reviews.tsx` — data-driven; huisstijl identiek.
- **Bewuste keuzes:**
  - Sterren tonen nu het **echte** aantal (4 of 5), niet altijd 5 — eerlijk.
  - Avatar heeft een **onError-vangnet**: breekt een Google-foto-URL, dan letter-avatar.
  - "Lees meer" is generiek per kaart (line-clamp-5) i.p.v. de oude vaste
    quote/vervolg-splitsing, omdat live reviewtekst variabele lengte heeft.
  - `any`-casts in de hook (tabellen staan nog niet in `types.ts`) — met
    `eslint-disable` per regel; verdwijnen zodra types na de migratie geregenereerd zijn.
- **Geverifieerd:** `tsc --noEmit` clean · `eslint` op gewijzigde files clean ·
  `bun run build` ok · `bun run test` groen. Live-pad (echte Google-data) pas te
  verifiëren na activatie (secrets + deploy); daarvoor is de activatie-checklist.

## Homepage-herbouw volgens sectieplan (2026-07-03)

Branch: `feat/homepage-herbouw`. Bron: gedetailleerd sectieplan van de opdrachtgever
(11 secties, vaste ritmiek). Systeemregels: sectiepadding exact 96px desktop / 64px mobiel
(= bestaande `.section-pad`), contentbreedte max 1200px (nieuwe `.container-home`),
achtergrondritme hero → wit → licht → wit → licht → wit → navy → wit → licht → wit → navy,
één CTA-stijl (goud, "Plan een gratis gesprek"), iconen in gouden cirkel, nergens de
formulering "geen commissie".

Foto-mapping: FOTO-HERO=`hero-adviesgesprek.webp` · FOTO-KEUKEN=`bewoners-keukentafel.webp`
· FOTO-HANDDRUK=`waarom-vertrouwen.webp` · FOTO-POLOS=`subsidies-uitzoeken.webp` ·
FOTO-SERRE=`hero-keukentafel.webp` en FOTO-TUIN=`herkenning-voortuin.webp` vervallen op home.

Linkbeslissingen (geen bestaande overzichtspagina's): tegel "Duurzame installaties" → geen
tegel-link maar 5 tekstlinks (spec-fallback); "Subsidies"-tegel en "Bekijk alle regelingen"
→ `/subsidies/stapelen`.

- [x] 0. `index.css`: `.container-home` (max 1200px) toevoegen
- [x] 1. Hero — ongewijzigd behouden (check: geen reviewclaim)
- [x] 2. Trustbar — `LogoCarousel` compact (±48px padding, één regel kleine tekst
      "Wij werken met alle officiële regelingen", grijstinten → kleur op hover)
- [x] 3. Probleemherkenning — `Herkenning.tsx` herschrijven: 3 kaarten, geen foto,
      kop "Verduurzamen zou niet zo ingewikkeld moeten zijn"
- [x] 4. Zo werkt het — `HelderPlan.tsx` herschrijven: FOTO-KEUKEN links, tijdlijn
      01/02/03 in goud, afsluitregel + CTA
- [x] 5. Waar we bij helpen — nieuw `WaarWeBijHelpen.tsx`: 3 tegels (Isolatie /
      Duurzame installaties / Subsidies), Onderhoud bewust niet
- [x] 6. Waarom Voortraject — `WaaromKiezen.tsx` herschrijven: 4 punten + FOTO-HANDDRUK,
      verdienmodel transparant (uitvoerder betaalt), "geen commissie"-claim eruit
- [x] 7. Reviews — nieuw `Reviews.tsx`: navy, 3 witte kaarten, Julian afgekapt met
      in-place "Lees meer", gelijke ingeklapte hoogte
- [x] 8. Subsidies stapelen — `Subsidies.tsx` herschrijven: kader met gouden accentrand,
      3 vinkjes, tekstlink + CTA
- [x] 9. Ons team — nieuw `Team.tsx`: FOTO-POLOS links, 3 zinnen, geen CTA
- [x] 10. FAQ — `Faq.tsx`: volgorde aanpassen, antwoord vraag 2 herformuleren
      (verdienmodel zonder "geen commissie"), vraag 4 check Groningen/Drenthe/Friesland
- [x] 11. Slot-CTA — ongewijzigd behouden
- [x] `Index.tsx`: nieuwe sectievolgorde
- [x] Eindcheck (headless Chrome tegen dev-server, 1440px + 375px): padding exact
      96/64/48, achtergrondritme conform spec, kaarthoogtes gelijk per rij
      (247/297/250), Julian-kaart 250→355 zonder vervorming van de andere twee,
      CTA-computed-styles identiek, FAQ-volgorde + nieuw antwoord gerenderd, geen
      horizontale overflow op 375px, alle interne links naar bestaande routes;
      vitest + vite build groen; lint alleen bestaande fouten in niet-aangeraakte
      bestanden
- [x] PR openen

### Review (2026-07-03)
- Alle 11 secties conform sectieplan; hero en slot-CTA onaangeraakt.
- "geen commissie" komt sitewide niet meer voor (was alleen homepage).
- FOTO-SERRE (`hero-keukentafel.webp`) en FOTO-TUIN (`herkenning-voortuin.webp`)
  nu ongebruikt op home, bewust in assets gelaten voor subpagina's.
- Linkkeuze: subsidie-overzicht bestaat niet als pagina → tegel + "Bekijk alle
  regelingen" wijzen naar `/subsidies/stapelen`. Verduurzamen-overzicht bestaat
  niet → tegel 2 niet klikbaar, 5 tekstlinks (spec-fallback).

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
  - [x] **Homepage achtergrond-alternatie:** dark hero → off-white → wit → off-white → wit → …
        Max 2 kleuren: off-white `#F5F3ED` + wit `#FFFFFF`. Start met off-white ná de donkere
        hero (minder contrast). Secties: Herkenning=off-white, HelderPlan=wit, Subsidies=
        off-white, LogoCarousel=wit, WaaromKiezen=off-white, Faq=wit. (was 4+ bg's; eerste
        crème `#F4EEE0` was te beige/"smerig" → schoner `#F5F3ED`.)
  - [x] Herkenning-sectietitel: "Waar moet je beginnen?" → **"Herken je dit?"**
  - [x] **Contact:** "Liever direct contact?"-kaart weg (+ ongebruikte consts/icon-imports
        opgeruimd). Sidebar: foto vult de kolom (`md:flex-1`), "Wat kun je verwachten?" lijnt
        onderaan uit met het formulier (grid `items-stretch`).
  - [x] **Onderhoud-hero:** van 4:5 terug naar 4:3 (kleiner), `object-position center top`
        zodat de leidingen/buizen goed zichtbaar blijven.
- [x] **Feedbackronde: /bewoners weg + homepage-links + subsidie-randjes**
      (`feat/bewoners-verwijderen-homepage-links`, vanaf `main`) — KLAAR, PR open
  - [x] **/bewoners-pagina verwijderd:** `src/pages/Bewoners.tsx` gedeletet; de route is nu een
        client-redirect `<Navigate to="/" replace />` (zelfde patroon als /uitvoerders →
        /partners; beter voor SEO dan een 404 op een eerder-gesitemapte URL). Nav-item weg uit
        Header **én** Footer; sitemap-entry weg (script + `public/sitemap.xml` geregen → 14
        entries). Asset `bewoners-keukentafel.webp` behouden (nog in gebruik door HelderPlan).
        Dode `Audiences.tsx` (nergens geïmporteerd) bewust ongemoeid (buiten scope).
  - [x] **WaarWeBijHelpen:** alle 3 tegels nu hetzelfde tekstlink-patroon als de installatie-
        tegel (geen hele-tegel-link/pijl meer — kan niet met geneste `<a>`). Isolatie-tegel
        kreeg link "Isolatie & ventilatie"; subsidie-tegel de 4 subsidiepagina's (Nij Begun,
        Landelijke/Regionale subsidies, Subsidies stapelen). Gedeelde `TegelLinks`-helper.
  - [x] **Oker randje op kaarten (Subsidies-stapelen + Herkenning):** oker randje via token
        `borderColor: hsl(var(--accent) / 0.8)` (i.p.v. `border-border`). NB: de class-opacity-
        modifier `/50` werkt hier niet (tokens missen de `<alpha-value>`-placeholder) → inline
        via de CSS-var, zoals `index.css` het accent al met alpha gebruikt. (In rondes opgevoerd
        0.5 → 0.65 → 0.8; daarna hetzelfde randje ook op de Herkenning-kaarten toegepast.)
  - [x] **Header-dropdowns (Verduurzamen + Subsidies):** frosted-glass in lijn met de header-
        pills — eigen `glassPanel` (`bg-white/90 backdrop-blur-xl`) + `pillShadow` +
        `overflow-hidden`. Bewust hogere witdekking dan de pills (`/70`): de dropdown hangt over
        een donkerder deel van de hero én zit genest in de nav-`backdrop-filter` (blurt zwakker),
        dus `/70` oogde daar te transparant; bij `/90` leest 'ie net zo mat als de pills.
  - Geverifieerd: `bun run lint` (geen nieuwe errors — alle bestaande), `tsc --noEmit` (clean),
        `bun run build` (ok), + headless CDP-screenshots (nav zonder Bewoners; 10 helpen-links;
        3 kaarten met `borderColor rgba(230,182,71,.5)`).
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

### Review (2026-07-14) — fix bronlinks subsidiecheck (PR #53)
- Bug: "Naar de officiële regeling" (site) en "Meer info" (mail) wezen voor veel
  regelingen naar de generieke ministerie-footerlink van Verbeterjehuis
  (rijksoverheid.nl/ministeries/…). Oorzaak: `officieleBron()` scande de hele
  pagina en viel terug op de eerste rijksoverheid.nl-link; de uitvoerder-whitelist
  was te smal (belastingdienst/svn/nhg/nijbegun/gemeente.groningen vielen erbuiten).
- Fix: alleen content vóór `<footer` scannen; fallback = eerste echte externe
  contentlink; ministerie-/campagnelinks uitgesloten. Beide parser-kopieën
  (frontend + edge function) + 2 echte fixtures + 3 regressietests (32 tests groen).
- Edge function gedeployed naar CRM-project en live geverifieerd (9742HJ,
  Woningeigenaar): alle 12 regelingen hebben nu een eigen echte bron.
- Observatie (buiten scope, evt. later): "Subsidie Verduurzaming en Verbetering
  Groningen" linkt naar een snn.nl-PDF (postcodelijst) omdat dat de eerste
  snn.nl-link op de detailpagina is; een pagina-link zou netter zijn.
- Verfijning (zelfde PR, 2e commit): PDF-links (postcodelijsten/voorwaarden) krijgen
  lagere rang dan echte pagina's (uitvoerder-pagina > uitvoerder-PDF > andere pagina >
  andere PDF). VVG Groningen en Onderhoudsfonds VvE's linken nu naar de regelingpagina
  (snn.nl / svn.nl). Breed herverifieerd: 52 regelingen, 14 postcodes, 0 PDF's,
  0 ministerie-links. "Energiebespaarlening Fryslân" → warmtefonds.nl/vve is conform
  de bron (enige externe link op die pagina).
