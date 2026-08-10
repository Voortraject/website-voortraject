# Migraties: geschiedenis, geen werkmap

**Voeg hier geen nieuwe migraties toe.**

De database die deze website gebruikt (`lfelnfukbrxznkevnevr`) is dezelfde database als die
van de **Voortraject CRM**-app. Twee repo's die dezelfde database migreren is vragen om
problemen: dezelfde tabel kan vanuit twee kanten wijzigen, de volgorde van toepassen ligt niet
vast, en wie hier `supabase db push` draait kan iets omzetten dat de CRM-app nodig heeft.

Afgesproken met de CRM-kant op 2026-08-10, naar aanleiding van de securityronde:

> Schemawijzigingen gaan **alleen vanuit het CRM**.

Dat geldt voor alles wat het schema raakt: tabellen, kolommen, RLS-policies, functies,
triggers en grants.

## Wat deze map dan nog is

Een archief. De bestanden hier laten zien wat er ooit vanuit deze repo is toegepast:

- `20260515*.sql` horen bij het **verlaten Lovable-project** (`zvsmazjcfzjyvnjrlnma`). Die
  backend is niet meer in gebruik; de website praat met het CRM-project.
- `20260709_google_reviews.sql`, `20260723_pand_3d_cache.sql` en
  `20260810_leads_bewoners_toestemming.sql` zijn wél op de CRM-database toegepast, vanuit
  deze repo, vóór bovenstaande afspraak.

Ze blijven staan omdat ze vastleggen hoe de tabellen zijn ontstaan waar deze code op leunt.

## Wat je in plaats daarvan doet

Heb je een schemawijziging nodig?

1. Schrijf op wát je nodig hebt en waaróm, en vraag de CRM-kant om het te leveren.
2. Documenteer de verwachte handtekening naast de code die hem aanroept. Voorbeeld:
   `supabase/functions/subsidiecheck-mail/index.ts` beschrijft bovenaan de databasefunctie
   `public.rem_publieke_route(p_ip, p_doel)` die hij verwacht.
3. Zorg dat de code veilig werkt zolang dat ding nog niet bestaat: fail open, loggen, en
   terugvallen op het oude gedrag. Dan kunnen beide repo's onafhankelijk uitrollen en is er
   geen moment waarop de site stuk is omdat de migratie nog niet gedraaid is.

Lezen van het schema mag natuurlijk gewoon:

```sh
bunx supabase db query --linked "select ..."
```

Edge functions (`supabase/functions/`) horen wél bij deze repo en worden hiervandaan
uitgerold. Alleen het **schema** is van het CRM.
