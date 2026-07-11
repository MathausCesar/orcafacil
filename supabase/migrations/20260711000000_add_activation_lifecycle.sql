ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ;

UPDATE public.profiles
SET created_at = COALESCE(created_at, onboarded_at, updated_at, now())
WHERE created_at IS NULL;

ALTER TABLE public.profiles
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN created_at SET NOT NULL;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS lifecycle_emails_enabled BOOLEAN;

UPDATE public.profiles
SET lifecycle_emails_enabled = false
WHERE lifecycle_emails_enabled IS NULL;

ALTER TABLE public.profiles
  ALTER COLUMN lifecycle_emails_enabled SET DEFAULT true,
  ALTER COLUMN lifecycle_emails_enabled SET NOT NULL;

ALTER TABLE public.quotes
  ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS first_public_opened_at TIMESTAMPTZ;

UPDATE public.quotes
SET sent_at = COALESCE(sent_at, updated_at, created_at)
WHERE status = 'sent' AND sent_at IS NULL;

CREATE TABLE IF NOT EXISTS public.lifecycle_email_dispatches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  quote_id UUID REFERENCES public.quotes(id) ON DELETE CASCADE,
  stage TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  provider_message_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  sent_at TIMESTAMPTZ,
  error_message TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS lifecycle_email_dispatches_unique_stage
  ON public.lifecycle_email_dispatches (user_id, stage, COALESCE(quote_id, '00000000-0000-0000-0000-000000000000'::uuid));

CREATE INDEX IF NOT EXISTS lifecycle_email_dispatches_recent_user_idx
  ON public.lifecycle_email_dispatches (user_id, created_at DESC);

ALTER TABLE public.lifecycle_email_dispatches ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.update_quote_status(quote_id UUID, new_status TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  quote_org_id UUID;
  current_status TEXT;
BEGIN
  IF new_status NOT IN ('sent', 'in_progress', 'completed') THEN
    RAISE EXCEPTION 'Este status so pode ser alterado pelo cliente usando o link publico.';
  END IF;

  SELECT organization_id, status
    INTO quote_org_id, current_status
  FROM public.quotes
  WHERE id = quote_id;

  IF quote_org_id IS NULL THEN
    RAISE EXCEPTION 'Orcamento nao encontrado.';
  END IF;

  IF NOT public.user_in_organization(quote_org_id) THEN
    RAISE EXCEPTION 'Sem permissao para alterar este orcamento.';
  END IF;

  IF new_status = 'sent' AND current_status NOT IN ('draft', 'pending', 'sent') THEN
    RAISE EXCEPTION 'Somente rascunhos podem ser marcados como enviados.';
  END IF;

  IF new_status = 'in_progress' AND current_status <> 'approved' THEN
    RAISE EXCEPTION 'Somente propostas aprovadas pelo cliente podem iniciar execucao.';
  END IF;

  IF new_status = 'completed' AND current_status <> 'in_progress' THEN
    RAISE EXCEPTION 'Somente propostas em execucao podem ser concluidas.';
  END IF;

  UPDATE public.quotes
  SET status = new_status,
      sent_at = CASE WHEN new_status = 'sent' AND sent_at IS NULL THEN now() ELSE sent_at END,
      updated_at = now()
  WHERE id = quote_id;
END;
$$;
