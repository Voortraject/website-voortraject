create table public.leads_bewoners (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  naam text not null,
  email text not null,
  telefoonnummer text not null,
  postcode text,
  huisnummer text,
  toevoeging text,
  straatnaam text,
  plaatsnaam text,
  bel_voorkeur text,
  vragen text,
  bron text default 'website'
);

create table public.leads_uitvoerders (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  bedrijfsnaam text not null,
  naam_contactpersoon text not null,
  email text not null,
  telefoonnummer text not null,
  vragen text
);

alter table public.leads_bewoners enable row level security;
alter table public.leads_uitvoerders enable row level security;

create policy "Anyone can submit bewoner lead"
  on public.leads_bewoners for insert
  to anon, authenticated
  with check (true);

create policy "Anyone can submit uitvoerder lead"
  on public.leads_uitvoerders for insert
  to anon, authenticated
  with check (true);
