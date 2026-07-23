-- Persistente server-side cache voor het 3D-massamodel (3D BAG) van de
-- subsidiecheck. De edge function `woninginfo` haalt het model bij api.3dbag.nl
-- (traag: 1,5 tot 3,5s per item, af en toe een 502), decodeert het en bewaart het
-- hier. Een herhaalde opvraging (ook door een andere bezoeker of via een gedeelde
-- link) komt dan direct uit deze tabel i.p.v. opnieuw langs het trage 3dbag, en
-- 3dbag-storingen worden opgevangen zolang een adres al eens is opgehaald.
--
-- LET OP: deze tabel leeft in het CRM-Supabaseproject (lfelnfukbrxznkevnevr).
-- Puur een cache: geen persoonsgegevens, geen relatie met de CRM-tabellen. Alleen
-- de edge function (service_role) leest/schrijft; clients raken 'm nooit aan.
-- RLS staat daarom AAN zonder policies voor anon/authenticated -> die hebben geen
-- toegang; service_role omzeilt RLS.

create table if not exists public.pand_3d_cache (
  cache_key   text primary key,          -- versie + pand-id (+ evt. RD-middelpunt)
  model       jsonb not null,            -- gedecodeerd Model3d (alleen niet-lege modellen)
  updated_at  timestamptz not null default now()
);

comment on table public.pand_3d_cache is
  'Server-side cache van 3D BAG-massamodellen voor de woninginfo edge function. Alleen service_role, geen persoonsgegevens.';

alter table public.pand_3d_cache enable row level security;
-- Bewust geen policies voor anon/authenticated: enkel service_role (die RLS
-- omzeilt) mag hierbij. De frontend praat met de edge function, nooit met deze tabel.

-- In dit CRM-project staan de default-grants op public niet standaard aan; geef
-- service_role expliciet toegang zodat de edge function kan lezen/schrijven.
grant all on public.pand_3d_cache to service_role;
