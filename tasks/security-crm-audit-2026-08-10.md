# Securityopdracht CRM-audit — bevindingen website-repo

**Datum:** 2026-08-10 · **Bron:** `website-security-opdracht-2026-08-10.md` (CRM-repo)
**Status:** onderzoek afgerond én uitgevoerd. Zes PR's: #142 t/m #147, zie `tasks/todo.md`
voor de merge-volgorde. Twee dingen weken onderweg af van dit rapport, beide bewust en
toegelicht in de review-sectie van `tasks/todo.md`: er komt géén terugval op de directe insert
bij een 429, en het `pand_3d_cache`-gat bleek scherper dan hieronder beschreven (de cachesleutel
bevatte de rauwe `x`/`y` uit de query, dus de groei was niet begrensd door het aantal panden).
**Code onderzocht op:** `main` @ `e326ab5` (lokale main liep 119 commits achter en is eerst
bijgewerkt; de conclusies hieronder gelden voor de code die nu live staat).

---

## Antwoord op de drie gevraagde punten

### 1. Mailsjablonen — welke, en waren ze geëscaped?

**Er is precies één bestand in deze repo dat mail-HTML opbouwt:**
`supabase/functions/subsidiecheck-mail/index.ts`. Daarin zitten twee sjablonen.

| Sjabloon | Functie | Ontvanger | Escaped? |
| --- | --- | --- | --- |
| Subsidieoverzicht | `bouwEmailHtml` (+ `regelingRij`, `groepBlok`, `bouwSamenvattingBlok`) | de bezoeker | **Ja, volledig** |
| Vraag-melding | `bouwTeamMailHtml` | het team | **Ja, volledig** |

Een `email-check`-function **bestaat niet in deze repo** (gezocht op bestandsnaam en op
inhoud, ook in `functions/` en `scripts/`). `supabase/functions/` bevat verder alleen
`subsidiecheck`, `sync-google-reviews` en `woninginfo`; geen daarvan produceert HTML.
`functions/subsidiecheck.js` is een Cloudflare Pages Function die alleen OG-metatags
herschrijft met vaste constanten.

Per interpolatie nagelopen. Alle bezoekerswaarden gaan door `escapeHtml`
(`index.ts:237`, dezelfde vijf tekens als de n8n-helper: `& < > " '`):

- `aanhef`, `adresregel`, `bouwjaarZin` → geëscaped
- `r.titel`, `r.bedragIndicatie`, `r.omschrijving` → geëscaped
- `naam`, `email`, `telefoon`, `bericht`, `interesses` → geëscaped

**Attributen zijn óók afgedekt** (het punt uit de opdracht waar escaping alleen niet
genoeg is): elke `href` met een bezoekerswaarde wordt eerst op schema gecontroleerd.
`r.bronUrl` en `overzichtUrl` moeten aan `/^https?:\/\//i` voldoen (`index.ts:266` en
`:807`), de WhatsApp-link wordt opgebouwd met `encodeURIComponent` op een vaste basis-URL,
`mailto:` gebruikt een e-mailadres dat door `EMAIL_RE` is gekomen en `tel:` een nummer dat
`validatePhoneNL` heeft doorstaan. `javascript:` is dus op geen enkel pad mogelijk.

Waarom deze kant al goed stond: op 2026-07-30 is precies deze fout andersom gemaakt
(escapen bij het opslaan in plaats van bij het renderen). Bij het terugdraaien daarvan is
`escapeHtml` bewust in de mail-HTML blijven staan; zie `tasks/lessons.md`.

**Eén nit, geen lek** (`index.ts:257`):

```js
const typeLabel = TYPE_LABELS[r.type ?? "subsidie"] ?? "Subsidie";
```

`r.type` komt uit de payload en `TYPE_LABELS` is een gewoon object-literal, dus
`type: "toString"` levert een geërfde prototype-functie op in plaats van `undefined`; de
`??`-terugval slaat dan niet aan en de functiebron belandt ongeëscaped in de mail. Er is
geen manier om daar `<` in te krijgen, dus het is rommel en geen injectie. Netjes maken met
`Object.hasOwn` kost één regel.

### 2. Werden `status`, `prioriteit` of `toegewezen_aan` meegestuurd?

- **`status`: ja, op alle vier de schrijfpaden**, steeds als `status: "nieuw"`.
  - [Contact.tsx:272](src/pages/Contact.tsx#L272) (contactformulier)
  - [ZakelijkContactFormulier.tsx:188](src/components/ZakelijkContactFormulier.tsx#L188)
  - [leadFormulier.ts:190](src/components/subsidiecheck/leadFormulier.ts#L190) (terugval-insert)
  - `subsidiecheck-mail/index.ts:801` (edge function, `leadVelden`)
- **`prioriteit`: nee.** Nergens in de repo.
- **`toegewezen_aan`: nee.** Nergens in de repo.

**Leunt de code erop? Nee.** Geen enkele plek in de website leest een lead terug of doet
iets met `status`; het is een schrijf-en-vergeet-veld. De trigger kan de waarde dus rustig
overschrijven zonder dat er iets breekt.

Geverifieerd tegen de live database — `publieke_lead_velden_vastzetten` doet:

```sql
if coalesce(auth.role(), '') <> 'anon' then return new; end if;
new.status := 'nieuw'; new.prioriteit := 'normaal'; new.toegewezen_aan := null;
```

Dus de waarde die de website stuurt (`'nieuw'`) is **identiek** aan wat de trigger forceert.
Er verandert feitelijk niets aan het gedrag. Het veld hoort er alsnog uit: het suggereert
een controle die de website niet heeft.

**Belangrijk detail voor jullie kant:** de trigger grijpt alleen in bij `auth.role() = 'anon'`.
De edge function `subsidiecheck-mail` schrijft met **`service_role`** en valt dus buiten
zowel deze trigger als de rate limit (zie hieronder). Dat is de route waar in productie de
meeste leads doorheen gaan.

### 3. Schrijft de website nog ergens anders in de CRM-database? **Ja — drie extra paden.**

De aanname van de audit (alleen `leads_bewoners` en `leads_uitvoerders`, alleen met de
anon-key) klopt niet. Volledig overzicht van wat deze repo aan de CRM-database
(`lfelnfukbrxznkevnevr`) doet:

| # | Pad | Tabel | Sleutel | Trigger |
| --- | --- | --- | --- | --- |
| 1 | `Contact.tsx` (browser) | `leads_bewoners` INSERT | anon | bezoeker |
| 2 | `ZakelijkContactFormulier.tsx` (browser) | `leads_uitvoerders` INSERT | anon | bezoeker |
| 3 | `leadFormulier.ts` (browser, terugvalpad) | `leads_bewoners` INSERT | anon | bezoeker |
| 4 | **`subsidiecheck-mail` edge function** | `leads_bewoners` **INSERT + UPDATE** | **service_role** | bezoeker (anoniem, `verify_jwt = false`) |
| 5 | **`woninginfo` edge function** | **`pand_3d_cache` UPSERT** | **service_role** | bezoeker (anoniem, `verify_jwt = false`) |
| 6 | `sync-google-reviews` edge function | `google_reviews` UPSERT + DELETE, `google_place_stats` UPSERT | service_role | cron, niet door bezoekers |
| 7 | `useGoogleReviews.ts` (browser) | `google_reviews`, `google_place_stats` SELECT | anon | leesroute |

Wat daarvan nieuw is ten opzichte van de audit:

**(a) `subsidiecheck-mail` doet ook een UPDATE, niet alleen een INSERT.**
`index.ts:841-844` werkt `leads_bewoners.notities` bij op een bestaande lead. De afscherming
is dat `leadId` (uuid), `tenant_id` én `email` alle drie moeten matchen (`:829-835`) en dat de
bestaande notitie wordt aangevuld, nooit overschreven. Dat is een redelijke afscherming — een
uuid raden is onbegonnen werk en je moet er ook nog het bijbehorende e-mailadres bij weten.
Maar het is wél een door bezoekers aan te roepen UPDATE-pad met `service_role`, en dat stond
niet op jullie lijst.

**(b) `woninginfo` schrijft met `service_role` in een derde tabel: `pand_3d_cache`.**
Publiek aanroepbaar (`config.toml`, `verify_jwt = false`), zonder honeypot, zonder rate
limit, zonder authenticatie. Elke aanroep met een nieuw postcode/huisnummer-paar kan een rij
toevoegen (`index.ts:119-129`). De inhoud is machinegegenereerd (3D-geometrie uit de BAG,
geen bezoekersinvoer), dus het is geen injectiepad. Het is wél ongelimiteerde rijgroei in
jullie database, aangestuurd door anonieme bezoekers. Dit is het aanvalsoppervlak dat jullie
nog niet bekeken hebben.

**(c) Deze repo bevat migraties die op jullie database draaien.**
`supabase/config.toml` staat op `project_id = "lfelnfukbrxznkevnevr"` en
`supabase/migrations/20260810000000_leads_bewoners_toestemming.sql` voegt twee kolommen toe
aan `leads_bewoners`. Twee repo's met migraties op dezelfde database is geen securitylek,
maar wel iets om van elkaar te weten.

---

## Punt 3 uit de opdracht — de rate limit (PT429)

Live nagekeken; `rem_publieke_lead_inserts` doet 5/uur per IP-hash en 30/uur totaal, en
`RAISE EXCEPTION ... USING ERRCODE = 'PT429'` → PostgREST antwoordt met HTTP 429 en
supabase-js geeft `error.code === "PT429"`.

**Wat het formulier nu doet:** precies wat jullie vermoedden. Alle drie de client-paden
vangen elke fout in één `catch` en tonen "Er ging iets mis bij het versturen. Probeer het
later nog eens of mail ons direct op info@voortraject.nl."
([Contact.tsx:287-291](src/pages/Contact.tsx#L287-L291),
[ZakelijkContactFormulier.tsx:198-202](src/components/ZakelijkContactFormulier.tsx#L198-L202),
[StapGegevens.tsx:289-291](src/components/subsidiecheck/StapGegevens.tsx#L289-L291),
`DirectContact.tsx:129`). Geen telefoonnummer, geen onderscheid met een echte storing.
Stil falen is het niet — de bezoeker ziet altijd een melding en het bedankscherm blijft weg.

**Twee dingen die jullie kant nog niet weet:**

1. **De subsidiecheck valt buiten de rate limit.** Die route loopt in productie via
   `subsidiecheck-mail` (service_role), en `rem_publieke_lead_inserts` slaat `service_role`
   expliciet over. De limiet raakt in de praktijk dus alleen het contactformulier en het
   zakelijke formulier. De function heeft wel een eigen rem (6 per 10 minuten per IP), maar
   die zit in het geheugen van de edge-isolate: hij overleeft geen herstart en geldt per
   isolate, dus als serieuze rem telt hij niet.
2. **Bij een 429 uit de function gaat de lead verloren.** `verstuurSubsidiecheckLead` gooit
   bij elke niet-ok status (`leadFormulier.ts:295`) zonder terug te vallen op de directe
   insert. Bij de contactformulieren blijft de ingevulde tekst wel in het formulier staan.
3. **Meetpunt, geen conclusie:** `publieke_inzendingen` bevat 6 rijen (8-9 aug) met **één**
   unieke `ip_hash`, en dat is niet de `'onbekend'`-hash — er komt dus een echt adres binnen.
   In dat venster staan geen leads meer in `leads_bewoners`, dus dit ziet eruit als één
   tester die zijn testleads heeft opgeruimd. Geen bewijs van IP-collapse, maar met een
   steekproef van één persoon ook geen bewijs van het tegendeel. Het is de moeite waard om
   bij de eerste echte productieleads te controleren of twee verschillende bezoekers ook
   twee verschillende hashes opleveren; zo niet, dan delen alle bezoekers samen één emmer
   van 5 per uur.

---

## Punt 4 — reflecteert de website invoer terug op de pagina?

**Nee, geen enkel risico gevonden.** `dangerouslySetInnerHTML` komt één keer voor, in
`src/components/ui/chart.tsx:70` (ongewijzigde shadcn-boilerplate, injecteert CSS-variabelen
uit de chart-config). Dat component wordt nergens in de site geïmporteerd — dood gewicht.
`innerHTML` en `v-html` komen niet voor.

Alles wat wordt teruggetoond gaat door JSX en wordt dus door React als tekst gerenderd.
Concreet gecontroleerd: het adresblok op de contactpagina (`Contact.tsx:635-636`), het
bedankscherm, de foutmeldingen en het subsidiecheck-resultaat.

---

## Punt 5 — de bekende mailvalkuilen

- **Logo-URL:** `subsidiecheck-mail/index.ts:106` wijst naar
  `logos/Voortraject/voortraject-logo-wit--lageKB.png`. Live gecontroleerd: **HTTP 200**.
  Ook de drie iconen (`voortraject.nl/mail/wa.png`, `tel.png`, `google.png`) geven 200 en
  staan in `public/mail/`. Dit was al gerepareerd in PR #97.
- **Dark mode:** het bezoekerssjabloon heeft beide `color-scheme`-meta's en de
  gradient-truc op het navy headervlak (`:406` en `:415`). In orde. Het teamsjabloon
  (`bouwTeamMailHtml`) heeft ze niet, maar heeft ook geen merkkleurvlak: witte achtergrond,
  zwarte tekst. Herkleuring kan daar geen kwaad. Meenemen zodra dat sjabloon opmaak krijgt.

---

## Wat er aan deze kant wél te repareren valt

Punt 1 is dus al in orde en punt 4 en 5 leveren niets op. Dit blijft over.

### A. Validatie aan de bron (opdrachtpunt 2)

De reële gaten, in volgorde van belang:

1. **`str` en `pl` uit de URL gaan ongecontroleerd de database in.**
   `Subsidiecheck.tsx:85-91` leest de queryparameters `str` en `pl` (de handmatige
   straat/plaats voor adressen die PDOK niet kent) en zet ze rechtstreeks in `adres`, dat
   daarna als `straat` en `stad` in `leads_bewoners` belandt en in de mail wordt opgenomen.
   Geen lengte- en geen tekencontrole, op de client noch in de edge function. Eén
   geprepareerde deel-link zet dus een megabyte tekst in die kolommen en in de CSV-export.
   In de mail is het onschadelijk (escaped), maar het is precies het "geen bovengrens"-punt
   uit jullie opdracht.
2. **`huisnummer` en `toevoeging` in de subsidiecheck.** `Subsidiecheck.tsx:72` controleert
   alleen dat `hn` met een cijfer begint, zonder maximumlengte; `tv` wordt helemaal niet
   gecontroleerd. Het contactformulier doet dit wel goed (max 5 tekens, `Contact.tsx:181`).
3. **`straatnaam` / `plaatsnaam` op het contactformulier** hebben alleen een `maxLength` op
   het invoerveld (150/100, `Contact.tsx:659` en `:670`) en geen regel in `validate()`. Een
   browserattribuut is een suggestie; de insert gaat rechtstreeks naar Supabase.
4. **De edge function controleert `straat`, `stad`, `huisnummer` en `toevoeging` niet.**
   `subsidiecheck-mail/index.ts:719-722` trimt ze en schrijft ze weg. Dit is de serverside
   laag waar jullie punt om vraagt: de client is te omzeilen, de function niet.

Wat er wél al goed staat, zodat we dat niet dubbel doen: `email` (formaat + max 255),
`telefoon` (`validatePhoneNL`), `postcode` (`POSTCODE_RE`, ook serverside), namen (max 100 /
25, `NAME_RE` staat `<` en `>` niet toe) en vrije tekst (`MAX_BERICHT`/`MAX_NOTES` = 1000)
zijn op alle paden gevalideerd, client én edge function. De inserts sturen ook geen spread
van een state-object maar een expliciete veldenlijst — dat punt uit de opdracht is al in orde.

### B. `status` uit de vier inserts halen

Zie punt 2 hierboven. Gedragsneutraal, maar de aanname hoort uit de code.

### C. PT429 netjes afvangen (opdrachtpunt 3)

Een gedeelde helper die `error.code === "PT429"` (client) en HTTP 429 (edge function)
herkent, met de melding die jullie voorstellen, inclusief telefoonnummer:

> We ontvangen op dit moment veel aanvragen. Probeer het over een uur nog eens, of bel ons
> op 050 211 26 89.

Het nummer staat al als constante in de codebase (`src/lib/telefoon.ts` / `whatsapp.ts`).

### D. Hardening-nit in de mail

`Object.hasOwn` bij de `TYPE_LABELS`-lookup.

---

## Voorgestelde PR-indeling

Per logische wijziging een eigen branch, niets zelf mergen.

- [ ] **PR 1** — `fix/lead-insert-status-eruit`: `status` uit de vier inserts (B).
- [ ] **PR 2** — `fix/adresvelden-validatie`: lengte- en tekencontrole op `str`/`pl`/`hn`/`tv`
      in de subsidiecheck, op `straatnaam`/`plaatsnaam` in `validate()` van het
      contactformulier, en dezelfde grenzen serverside in `subsidiecheck-mail` (A).
- [ ] **PR 3** — `feat/rate-limit-melding`: PT429-herkenning en de eigen melding op alle vier
      de formulierpaden, plus terugval van de subsidiecheck op de directe insert bij een 429
      uit de function (C).
- [ ] **PR 4** — `tweak/mail-typelabel-hasown`: de nit uit D. Eventueel meeliften met PR 2.

---

## Openstaand voor de CRM-kant

1. `pand_3d_cache` (pad 5) is ongelimiteerde, anoniem aangestuurde rijgroei in jullie
   database. Willen jullie daar een rem op, of een opruimtaak? Aan deze kant kan een
   TTL/limiet in de function, maar de tabel is van jullie.
2. De hele subsidiecheck-route loopt via `service_role` en is daarmee vrijgesteld van de
   rate limit én van `publieke_lead_velden_vastzetten`. Is dat bewust?
3. Wil je dat de UPDATE op `notities` (pad 4a) strakker wordt afgeschermd dan
   id + tenant + e-mail?
