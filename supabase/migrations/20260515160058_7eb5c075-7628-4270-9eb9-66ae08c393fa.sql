ALTER TABLE public.leads_bewoners ADD COLUMN IF NOT EXISTS tenant_id uuid;
ALTER TABLE public.leads_uitvoerders ADD COLUMN IF NOT EXISTS tenant_id uuid;