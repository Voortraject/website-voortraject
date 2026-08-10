# Securityopdracht CRM-audit (2026-08-10) — afgerond

Bevindingen en onderbouwing: `tasks/security-crm-audit-2026-08-10.md`.
Lessen: `tasks/lessons.md` (twee entries van 2026-08-10).

**Status: klaar en live.** Zeven PR's gemerged, beide edge functions uitgerold, de volumerem in
productie geverifieerd. Niets meer open aan beide kanten.

## Wat er is gebouwd

| PR | Wat |
| --- | --- |
| #142 | `status` uit de vier lead-inserts (kolom heeft DEFAULT `'nieuw'`, dus gedragsneutraal) |
| #143 | Grenzen op straat/plaats/huisnummer/toevoeging, client én serverside. Dicht het `?str=`/`?pl=`-gat in de deel-link |
| #144 | PT429 herkennen en eerlijk melden, met telefoonnummer, op alle vier de formulierpaden |
| #145 | Duurzame rem via `rem_publieke_route`, `notities`-UPDATE begrensd, `TYPE_LABELS`-nit |
| #146 | Rooster + RD-grenzen + schrijfbudget op `pand_3d_cache` |
| #147 | Schemawijzigingen alleen nog vanuit het CRM |
| #148 | Datumkopje boven een vraag van de bezoeker in `notities` |

Edge functions live: `subsidiecheck-mail` v41, `woninginfo` v17.

## Verificatie in productie

Alles hieronder is gemeten, niet aangenomen.

- **De rem werkt end-to-end.** Negen aanroepen op een rij: acht door, de negende een HTTP 429 met
  de nette melding. Uitgevoerd met `actie: "bericht"` en een lege vraag, want de remcontrole zit
  vóór de berichtvalidatie: zo'n verzoek verbruikt een plek in de emmer en stopt daarna, dus
  **nul testleads en nul mails**.
- **De 429 kwam aantoonbaar uit de database, niet uit de terugval.** De geheugen-rem staat op 6
  per 10 minuten; was de RPC nog onbereikbaar geweest, dan was de zevende geweigerd. Het waren er
  acht, exact `c_max_per_ip = 8`.
- **`cf-connecting-ip` komt door.** De opgeslagen `ip_hash` bleek gelijk aan
  `md5(<ons echte publieke IP> || salt)`, niet aan de `'onbekend'`-hash. Het CRM heeft daarna
  hetzelfde aangetoond voor het trigger-pad (contactformulieren), met een tijdelijke RPC die
  `current_setting('request.headers')` echode.
- **De rastersleutel is live.** Aanroep met `x=231528&y=583469` levert
  `v1:…@231530,583470` op. Aanroep zonder coördinaten levert de kale pand-id op in plaats van het
  oude `@0,0`.
- **Mailafbeeldingen:** logo en de drie iconen geven alle vier HTTP 200.

## Twee dingen die afweken van het oorspronkelijke plan

1. **Geen terugval op de directe insert bij een 429.** Dat stond wel in het bevindingenrapport,
   maar die insert is juist de route die de rem moet tegenhouden.
2. **Het `pand_3d_cache`-gat was scherper dan gerapporteerd.** Niet "postcodes maal modellen",
   maar een cachesleutel met de rauwe `x`/`y` uit de query erin. Zie de les in `lessons.md`.

## Twee aannames die onjuist bleken

- De audit ging ervan uit dat de website alleen in de twee leadtabellen schrijft. Er waren drie
  extra paden, waaronder een UPSERT in `pand_3d_cache` met service_role.
- De opdrachtbrief noemde `email-check` als derde bron van mailsjablonen. Die function bestaat,
  maar in de CRM-repo, en het is adresverificatie zonder één regel HTML. Er zijn twee
  sjabloonbronnen, niet drie.
