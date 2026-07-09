-- Google reviews, gesynchroniseerd vanuit de Places API (New) door de
-- edge function `sync-google-reviews`. Alleen die functie (service_role)
-- schrijft; de publieke site mag uitsluitend lezen.
--
-- LET OP: deze tabellen leven in het CRM-Supabaseproject (lfelnfukbrxznkevnevr),
-- niet in het oude website-project. De frontend leest ze via `supabaseExternal`.
-- (Bewuste keuze: dat CRM-project is het enige actieve Supabaseproject.)

create table public.google_reviews (
  id                 uuid primary key default gen_random_uuid(),
  google_review_id   text not null unique,          -- stabiele resource-id van Google (dedupe)
  author_name        text not null,
  profile_photo_url  text,
  rating             smallint not null,
  text               text,
  relative_time      text,                           -- bv. "2 weken geleden"
  publish_time       timestamptz,
  language           text,
  synced_at          timestamptz not null default now()
);

comment on table public.google_reviews is
  'Google reviews (rating >= 4) die dagelijks door de edge function sync-google-reviews worden gesynct. Alleen-lezen voor de publieke site.';

alter table public.google_reviews enable row level security;

-- Publiek mag lezen (marketingcontent). Schrijven kan alleen via service_role,
-- die RLS omzeilt — dus bewust geen insert/update/delete-policy voor anon.
create policy "Public can read google reviews"
  on public.google_reviews for select
  to anon, authenticated
  using (true);

-- RLS bepaalt WELKE rijen zichtbaar zijn; een table-level GRANT is óók nodig
-- zodat de anon-rol de tabel überhaupt mag lezen. (In dit CRM-project staan de
-- default-grants op public niet aan, dus expliciet.)
grant select on public.google_reviews to anon, authenticated;

-- Aggregatie voor de kop ("5,0 op Google" + aantal). Eén rij (id = 1).
create table public.google_place_stats (
  id                 smallint primary key default 1,
  rating             numeric(2, 1),
  user_rating_count  integer,
  synced_at          timestamptz not null default now(),
  constraint single_row check (id = 1)
);

alter table public.google_place_stats enable row level security;

create policy "Public can read google place stats"
  on public.google_place_stats for select
  to anon, authenticated
  using (true);

grant select on public.google_place_stats to anon, authenticated;
