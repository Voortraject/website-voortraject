# Formulieren beveiligen tegen misbruik (oktober 2026)

## Aanleiding
Van 9 tot en met 12 oktober 2026 stond voortraject.nl op de Spamhaus DBL. Ziggo (home.nl,
ziggo.nl enz.) weigerde daardoor al onze mail. Verwijderd op 12-10 (zaak ST7256184), met de
waarschuwing dat een nieuwe listing volgt bij nieuw misbruik. Hoofdverdachte: de subsidietool,
die een overzicht mailt naar elk adres dat iemand intypt.

## Wat we vonden (onderzoek 12-10)
**Formulieren die mail laten versturen**

| Formulier | Route | Mail naar het ingetypte adres |
|---|---|---|
| Subsidietool, gegevensstap | edge function `subsidiecheck-mail` → Resend | ja, "Je subsidieoverzicht" (+ bcc info@) |
| Subsidietool, vraag op het resultaat | zelfde function, `actie: "bericht"` | nee, alleen naar info@ |
| Contactformulier | anon-insert `leads_bewoners` → n8n | ja, bevestiging "We hebben je aanvraag ontvangen" |
| Zakelijk contactformulier | anon-insert `leads_uitvoerders` → n8n | onbekend (n8n, ligt bij het CRM) |
| "Bel me terug" (`/adviesgesprek/{token}`) | Pages Function → RPC | nee, en alleen met een geldig token |

**Het echte gat.** `subsidiecheck-mail` zette de lijst `regelingen` (titels, teksten, links) en
`overzichtUrl` uit de request ongecontroleerd in de mail. Met de publieke anon-key kon iedereen
vanaf ons domein een mail met eigen tekst en eigen links naar elk adres sturen. Honeypot en
tijdscontrole zaten alleen in de browser; aan de serverkant was er alleen de rem per IP
(`rem_publieke_route`: 8 per uur per IP, 30 per uur totaal). Geen limiet per adres.

**Geen aanwijzing dat het gat is misbruikt**, voor zover nog te zien:
- Resend (13-09 tot 12-10, ouder bewaart Resend niet): 86 overzichtsmails, ongeveer 3 per dag en
  nooit meer dan 9 op een dag. Alle 86 afgeleverd, geen wegwerp- of rolaccounts, geen buitenlandse
  domeinen. Veel ontvangers werden klant. Steekproef van de inhoud: alleen links naar overheid,
  regelingen en voortraject.nl.
- `leads_bewoners` (tenant Voortraject): 1 tot 9 subsidietool-leads per dag sinds half augustus,
  geen dubbele adressen op een dag, geen rolaccounts.
- Bounces naar home.nl begonnen 09-10 10:10 UTC en raakten alleen CRM-mails.
- De website zelf: geen open redirects, geen vreemde bestanden in `public/` of `/mail/`.
- Live `subsidiecheck-mail` (v51, 30-09) was identiek aan de repo.

De oorzaak van de listing is daarmee niet gevonden. Nog na te gaan: de DMARC-rapporten (rua),
want die laten zien wie er nog meer namens voortraject.nl mailt.

## Wat er is gebouwd (PR: fix/subsidietool-mail-beveiliging)
In `subsidiecheck-mail` (logica in `beveiliging.ts`, getest in
`src/test/subsidiecheckMailBeveiliging.test.ts`):
1. **In de mail aan de bezoeker komt geen tekst uit de request.** De opbouw staat in
   `overzichtMail.ts`; `maakOverzichtMail` krijgt de rauwe request en leest daar alleen
   postcode, huisnummer, toevoeging, bewonertype, maatregelen en de link uit.
   - Regelingen: zelf opgehaald via de function `subsidiecheck`, met dezelfde aanvraag als de
     browser. Geen geldig bewonertype of geen antwoord van de bron: een mail zónder lijst, met
     een knop naar het overzicht online. (Een eerste versie viel terug op de lijst uit de
     browser; een bot kon die terugval afdwingen door het bewonertype weg te laten.)
   - Adresregel: straat en plaats uit de BAG (PDOK Locatieserver, dezelfde bron als de
     adreszoeker op de site), anders "postcode …, huisnummer …". Huisnummer en toevoeging moeten
     er streng uitzien. De lead en de teammail houden het adres uit de request.
   - Link: alleen naar `https://voortraject.nl/subsidiecheck`, anders de check zelf.
   - Aanhef: uit naamvelden met alleen letters, spatie, apostrof en streepje.
2. **Honeypot en tijdscontrole aan de serverkant.** Onder de 3 seconden of met een ingevulde
   honeypot: 200, niets opgeslagen, niets gemaild. Ontbreekt de duur (oude bundle), dan door.
3. **Maximaal één overzicht per adres per 24 uur**, opgezocht in `leads_bewoners` (tenant,
   `formulier = 'subsidietool'`, adres hoofdletterongevoelig, `aangemaakt_op`). Tweede keer: 200,
   geen lead, geen mail, wel het bestaande lead-id. Geen schemawijziging nodig.
4. **Mailadres:** strengere syntax (een `+` mag), systeemadressen geweigerd (abuse@,
   postmaster@, noreply@, no-reply@, mailer-daemon@; bewust niet info@), en een MX-controle op het
   domein (geen MX en geen A/AAAA → 400; DNS-storing → door).
5. **Turnstile** (onzichtbaar) op de gegevensstap. Het token wordt gecontroleerd in de function.
   Geweigerd → lead wel opgeslagen, geen mail. Zonder secret `TURNSTILE_SECRET_KEY` staat de
   controle uit en logt de function dat. Site key: `VITE_TURNSTILE_SITE_KEY` in Cloudflare Pages.

In de browser: de tijdscontrole is overal 3 seconden (`src/lib/invultijd.ts`); op de gegevensstap
telt hij vanaf het moment dat het formulier verschijnt, niet vanaf de zoekanimatie.

## Afspraken met het CRM
- Het CRM legt een limiet per adres op de bevestigingsmail van het contactformulier (n8n).
- Het CRM zoekt uit of het zakelijke formulier een mail naar de bezoeker stuurt.
- Double opt-in: nu niet (besloten 12-10). Opnieuw bekijken bij een nieuwe listing.

## Nog te doen na de merge
- Function `subsidiecheck-mail` deployen uit een schone worktree op de actuele main, en de live
  code teruglezen.
- Testen met `info+subsidietest…@voortraject.nl` en de naam "TEST subsidietool": normaal (wel
  mail), honeypot (niets), te snel (niets), tweede keer binnen 24 uur (niets). De aangemaakte
  lead-id's melden zodat ze opgeruimd kunnen worden.
- Turnstile-sleutels aanmaken en zetten; daarna nog een keer testen.

## Na de livegang (12-10)
- `subsidiecheck-mail` v52 gedeployed en teruggelezen. De tests normaal, honeypot, te snel en
  tweede keer binnen 24 uur slaagden. De browsertest met een echt token ook (mail met 12
  regelingen en een BAG-adres).
- **Maar:** Turnstile werd live nooit echt gecontroleerd. Elke aanroep van siteverify vanuit de
  edge function eindigde in "niet bereikbaar", en de function liet dan bewust door. Een
  request met een nep-token kreeg dus ook een mail. De oorzaak was niet te zien, omdat de fout
  niet werd gelogd. Vanaf een gewone machine werkt dezelfde aanroep wel.
- Fix (PR fix/turnstile-siteverify): status, antwoord en foutmelding komen nu in de log; fetch
  wordt expliciet op globalThis aangeroepen met expliciete headers en een tekstbody; witruimte
  rond de secret wordt weggehaald. Een secret die Cloudflare niet accepteert, telt als storing
  (doorlaten en luid loggen), niet als bot.
- Controle na de deploy: een request met een nep-token moet "Turnstile weigert het token"
  opleveren, plus een lead maar geen mail. Komt er weer "niet bereikbaar", dan staat de echte
  oorzaak nu in de log.
