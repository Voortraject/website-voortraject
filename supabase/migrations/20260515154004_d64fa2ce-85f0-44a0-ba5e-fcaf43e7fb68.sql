ALTER TABLE public.leads_bewoners ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'nieuw';
ALTER TABLE public.leads_uitvoerders ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'nieuw';
ALTER TABLE public.leads_uitvoerders ADD COLUMN IF NOT EXISTS bron text DEFAULT 'website';