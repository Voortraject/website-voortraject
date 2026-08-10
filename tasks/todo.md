# Todo — securityopdracht CRM-audit (2026-08-10)

Bevindingen en onderbouwing: `tasks/security-crm-audit-2026-08-10.md`.

## PR's en merge-volgorde

Drie PR's raken hetzelfde bestand en zijn daarom gestapeld. Merge in deze volgorde en
**zonder `--delete-branch`** (zie `tasks/lessons.md`, 2026-08-07): retarget de volgende PR
eerst naar `main` (`gh pr edit <n> --base main`), ruim de branches pas aan het eind op.

```
main ─┬─ #142 status-eruit ── #143 adresvalidatie ─┬─ #144 PT429-melding
      │                                            └─ #145 subsidiecheck-mail rem + hardening
      ├─ #146 woninginfo-rem     (los)
      └─ #147 docs schemawijzigingen  (los)
```

- [x] **#142** `fix/lead-insert-status-eruit` — `status` uit de vier inserts. Geverifieerd dat
      de kolom DEFAULT 'nieuw' heeft, dus gedragsneutraal.
- [x] **#143** `fix/adresvelden-validatie` — grenzen op straat/plaats/huisnummer/toevoeging,
      client én serverside. Dicht het `?str=`/`?pl=`-gat in de deel-link.
- [x] **#144** `feat/rate-limit-melding` — PT429 herkennen en eerlijk melden, met telefoonnummer.
- [x] **#145** `feat/subsidiecheck-mail-rem` — duurzame rem via `rem_publieke_route`,
      `notities`-UPDATE begrensd, `TYPE_LABELS`-nit.
- [x] **#146** `feat/woninginfo-rem` — rooster + RD-grenzen + schrijfbudget op `pand_3d_cache`.
- [x] **#147** `docs/schemawijzigingen-via-crm` — schema alleen nog vanuit het CRM.

## Ligt bij het CRM

- [ ] `public.rem_publieke_route(p_ip text, p_doel text)` leveren. Voorgestelde SQL staat in
      #145; sleutel = **IP** (e-mail is gratis te variëren en dus geen rem). Zolang de functie
      niet bestaat valt `subsidiecheck-mail` terug op de geheugen-rem en logt dat, dus #145 kan
      er zonder problemen vóór live.
- [ ] Opruimtaak op `pand_3d_cache.updated_at` (pg_cron), zoals afgesproken. Ruimt meteen de
      rijen op met de oude, fijnmazige sleutel.
- [ ] Controleren of twee verschillende bezoekers ook twee verschillende `ip_hash` opleveren in
      `publieke_inzendingen`. Nu staan er 6 rijen met 1 unieke hash; dat ziet eruit als één
      tester, maar het is geen bewijs. Zo niet, dan delen álle bezoekers één emmer van 5 per uur.

## Review

Wat er is gebouwd staat per PR in de beschrijving. Twee dingen die onderweg afweken van het
oorspronkelijke plan, beide bewust:

1. **Geen terugval op de directe insert bij een 429** (#144). Dat stond wel in het
   bevindingenrapport, maar die insert is juist de route die de rem moet tegenhouden;
   erop terugvallen zou de rem om zeep helpen.
2. **Het `pand_3d_cache`-gat was scherper dan gerapporteerd** (#146). Niet "postcodes maal
   modellen", maar een cachesleutel met de rauwe `x`/`y` uit de query erin: één pand-id plus
   een coördinaat die per verzoek een meter opschuift gaf onbeperkt véle rijen. Daarom een
   rooster in de sleutel en niet alleen een volumerem.

Verificatie: `bun run test` groen op elke branch (320 → 332 tests, 12 nieuwe), `bun run build`
ok, `deno check` op beide edge functions zonder nieuwe fouten. De databasefeiten (kolomdefaults,
triggerdefinities, SQLSTATE, inhoud van `publieke_inzendingen`) zijn tegen de live database
gecontroleerd, niet aangenomen.
