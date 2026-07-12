-- Activation, conversion and trust hardening for the first paid Zacly journey.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS intended_plan TEXT
    CHECK (intended_plan IS NULL OR intended_plan IN ('monthly', 'yearly')),
  ADD COLUMN IF NOT EXISTS first_attribution JSONB,
  ADD COLUMN IF NOT EXISTS last_attribution JSONB;

ALTER TABLE public.quotes
  ADD COLUMN IF NOT EXISTS client_email TEXT,
  ADD COLUMN IF NOT EXISTS approval_token UUID DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS approval_recipient_phone TEXT,
  ADD COLUMN IF NOT EXISTS approval_recipient_name TEXT,
  ADD COLUMN IF NOT EXISTS approval_link_issued_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS approval_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS approval_verification_method TEXT,
  ADD COLUMN IF NOT EXISTS sent_confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS sent_via TEXT;

UPDATE public.quotes
SET approval_token = gen_random_uuid()
WHERE approval_token IS NULL;

ALTER TABLE public.quotes
  ALTER COLUMN approval_token SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS quotes_approval_token_idx
  ON public.quotes (approval_token);

CREATE INDEX IF NOT EXISTS quotes_first_public_opened_idx
  ON public.quotes (organization_id, first_public_opened_at)
  WHERE first_public_opened_at IS NOT NULL;

-- A reservation is created before a free quote. This closes the race between
-- checking the allowance and inserting a quote from multiple browser tabs.
CREATE TABLE IF NOT EXISTS public.quote_quota_usages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  experience_mode TEXT NOT NULL CHECK (experience_mode IN ('free_simple', 'pro_sample')),
  period_start TIMESTAMPTZ,
  quote_id UUID UNIQUE REFERENCES public.quotes(id) ON DELETE CASCADE,
  reserved_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS quote_quota_usages_lookup_idx
  ON public.quote_quota_usages (organization_id, experience_mode, period_start, reserved_at);

-- Backfill existing free quotes so the new table remains the single source of
-- truth for quota consumption after this migration.
INSERT INTO public.quote_quota_usages (
  organization_id,
  user_id,
  experience_mode,
  period_start,
  quote_id,
  reserved_at
)
SELECT
  q.organization_id,
  q.user_id,
  q.experience_mode,
  CASE
    WHEN q.experience_mode = 'free_simple'
      AND p.onboarded_at IS NOT NULL
      AND q.created_at >= p.onboarded_at
      AND q.created_at < p.onboarded_at + INTERVAL '14 days'
      THEN p.onboarded_at
    WHEN q.experience_mode = 'free_simple'
      THEN date_trunc('month', q.created_at)
    ELSE NULL
  END,
  q.id,
  q.created_at
FROM public.quotes q
LEFT JOIN public.profiles p ON p.id = q.user_id
WHERE q.experience_mode IN ('free_simple', 'pro_sample')
ON CONFLICT (quote_id) DO NOTHING;

ALTER TABLE public.quote_quota_usages ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.reserve_free_quote_quota(
  p_organization_id UUID,
  p_user_id UUID,
  p_experience_mode TEXT,
  p_period_start TIMESTAMPTZ,
  p_limit INTEGER
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  usage_count INTEGER;
  usage_id UUID;
BEGIN
  IF auth.uid() IS NULL OR auth.uid() <> p_user_id THEN
    RAISE EXCEPTION 'Sem permissao para reservar esta proposta.' USING ERRCODE = '42501';
  END IF;

  IF NOT public.user_in_organization(p_organization_id) THEN
    RAISE EXCEPTION 'Sem permissao para esta organizacao.' USING ERRCODE = '42501';
  END IF;

  IF p_experience_mode NOT IN ('free_simple', 'pro_sample') OR p_limit < 1 THEN
    RAISE EXCEPTION 'Reserva de cota invalida.' USING ERRCODE = '22023';
  END IF;

  IF p_experience_mode = 'free_simple' AND p_period_start IS NULL THEN
    RAISE EXCEPTION 'Periodo da proposta gratis nao informado.' USING ERRCODE = '22023';
  END IF;

  PERFORM pg_advisory_xact_lock(
    hashtext(
      p_organization_id::text || ':' || p_experience_mode || ':' || COALESCE(p_period_start::text, 'all')
    )
  );

  DELETE FROM public.quote_quota_usages
  WHERE quote_id IS NULL
    AND reserved_at < now() - INTERVAL '15 minutes';

  SELECT COUNT(*)
    INTO usage_count
  FROM public.quote_quota_usages
  WHERE organization_id = p_organization_id
    AND experience_mode = p_experience_mode
    AND (
      p_experience_mode = 'pro_sample'
      OR period_start IS NOT DISTINCT FROM p_period_start
    );

  IF usage_count >= p_limit THEN
    RAISE EXCEPTION 'FREE_QUOTE_LIMIT_REACHED' USING ERRCODE = 'P0001';
  END IF;

  INSERT INTO public.quote_quota_usages (
    organization_id,
    user_id,
    experience_mode,
    period_start
  ) VALUES (
    p_organization_id,
    p_user_id,
    p_experience_mode,
    CASE WHEN p_experience_mode = 'free_simple' THEN p_period_start ELSE NULL END
  )
  RETURNING id INTO usage_id;

  RETURN usage_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.claim_free_quote_quota(
  p_usage_id UUID,
  p_quote_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.quote_quota_usages usage
  SET quote_id = p_quote_id
  WHERE usage.id = p_usage_id
    AND usage.user_id = auth.uid()
    AND usage.quote_id IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Reserva de proposta nao encontrada.' USING ERRCODE = 'P0002';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.release_free_quote_quota(p_usage_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.quote_quota_usages
  WHERE id = p_usage_id
    AND user_id = auth.uid()
    AND quote_id IS NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.reserve_free_quote_quota(UUID, UUID, TEXT, TIMESTAMPTZ, INTEGER) FROM public, anon;
REVOKE ALL ON FUNCTION public.claim_free_quote_quota(UUID, UUID) FROM public, anon;
REVOKE ALL ON FUNCTION public.release_free_quote_quota(UUID) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.reserve_free_quote_quota(UUID, UUID, TEXT, TIMESTAMPTZ, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_free_quote_quota(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.release_free_quote_quota(UUID) TO authenticated;
