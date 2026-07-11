# Todo

Planning & progress tracking for the Voortraject website. One section per task/change.

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

### Suggesties uit vergelijk met Verbeterjehuis (2026-07-12)
- **Energiesubsidiewijzer werkt op postcode-only (PC6), bevestigd** door hun aanvraagform.
  Ons huisnummer blijft voor het vertrouwensmoment (adresbevestiging) + leadkwaliteit,
  niet voor het resultaat.
- [ ] **Monument-vinkje** ("Mijn woning is een monument") — zij vragen het; afwijkende
      regels/regelingen. Meenemen in **Fase 5** als de API de parameter ondersteunt; tot
      die tijd adviseur-territorium.
- [ ] Optioneel toevoeging-veld in stap 1 — **laag prioriteit** (verandert het resultaat
      niet; alleen adresweergave + leaddata). Contactformulier heeft het veld al.
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
