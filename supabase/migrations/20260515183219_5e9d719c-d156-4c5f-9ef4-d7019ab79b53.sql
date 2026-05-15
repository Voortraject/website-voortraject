ALTER TABLE public.leads_bewoners
  ADD COLUMN IF NOT EXISTS telefoon text,
  ADD COLUMN IF NOT EXISTS straat text,
  ADD COLUMN IF NOT EXISTS stad text,
  ADD COLUMN IF NOT EXISTS notities text;