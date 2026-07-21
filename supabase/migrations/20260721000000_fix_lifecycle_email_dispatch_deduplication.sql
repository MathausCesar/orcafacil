ALTER TABLE public.lifecycle_email_dispatches
  ADD COLUMN IF NOT EXISTS dedupe_key TEXT;

UPDATE public.lifecycle_email_dispatches
SET dedupe_key = CONCAT('legacy:', id::text)
WHERE dedupe_key IS NULL;

ALTER TABLE public.lifecycle_email_dispatches
  ALTER COLUMN dedupe_key SET NOT NULL;

DROP INDEX IF EXISTS public.lifecycle_email_dispatches_unique_stage;

CREATE UNIQUE INDEX IF NOT EXISTS lifecycle_email_dispatches_unique_dedupe_key
  ON public.lifecycle_email_dispatches (dedupe_key);
