-- The historical appearance migration is marked as applied on the remote
-- project, but this column is absent there. Keep the PDF and public proposal
-- contract aligned with the live schema.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS quote_font_family TEXT;

GRANT UPDATE (quote_font_family) ON TABLE public.profiles TO authenticated;
