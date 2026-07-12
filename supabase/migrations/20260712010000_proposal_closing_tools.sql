-- Practical closing tools: tracked follow-ups, a manual Pix deposit request,
-- a short Pro trial after the first confirmed send, and private proposal images.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS pro_trial_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS pro_trial_ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS pro_trial_source TEXT,
  ADD COLUMN IF NOT EXISTS pix_key TEXT,
  ADD COLUMN IF NOT EXISTS pix_key_type TEXT,
  ADD COLUMN IF NOT EXISTS pix_recipient_name TEXT,
  ADD COLUMN IF NOT EXISTS pix_recipient_city TEXT;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_pix_key_type_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_pix_key_type_check
  CHECK (
    pix_key_type IS NULL
    OR pix_key_type IN ('cpf', 'cnpj', 'email', 'phone', 'random')
  );

-- Pix account details are business profile data. Trial dates remain writable
-- only by server-side code; they are deliberately excluded from this grant.
GRANT UPDATE (pix_key, pix_key_type, pix_recipient_name, pix_recipient_city)
  ON TABLE public.profiles TO authenticated;

ALTER TABLE public.quotes
  ADD COLUMN IF NOT EXISTS follow_up_sent_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS follow_up_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_follow_up_message TEXT,
  ADD COLUMN IF NOT EXISTS deposit_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS deposit_status TEXT NOT NULL DEFAULT 'not_requested',
  ADD COLUMN IF NOT EXISTS deposit_requested_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deposit_marked_paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS pix_key_snapshot TEXT,
  ADD COLUMN IF NOT EXISTS pix_key_type_snapshot TEXT,
  ADD COLUMN IF NOT EXISTS pix_recipient_name_snapshot TEXT,
  ADD COLUMN IF NOT EXISTS pix_recipient_city_snapshot TEXT,
  ADD COLUMN IF NOT EXISTS source_quote_id UUID REFERENCES public.quotes(id) ON DELETE SET NULL;

ALTER TABLE public.quotes
  DROP CONSTRAINT IF EXISTS quotes_follow_up_count_non_negative_check;

ALTER TABLE public.quotes
  ADD CONSTRAINT quotes_follow_up_count_non_negative_check
  CHECK (follow_up_count >= 0);

ALTER TABLE public.quotes
  DROP CONSTRAINT IF EXISTS quotes_deposit_amount_non_negative_check;

ALTER TABLE public.quotes
  ADD CONSTRAINT quotes_deposit_amount_non_negative_check
  CHECK (deposit_amount >= 0);

ALTER TABLE public.quotes
  DROP CONSTRAINT IF EXISTS quotes_deposit_status_check;

ALTER TABLE public.quotes
  ADD CONSTRAINT quotes_deposit_status_check
  CHECK (deposit_status IN ('not_requested', 'requested', 'marked_paid'));

CREATE INDEX IF NOT EXISTS quotes_follow_up_idx
  ON public.quotes (organization_id, status, follow_up_sent_at)
  WHERE status IN ('pending', 'sent');

CREATE INDEX IF NOT EXISTS quotes_opened_follow_up_idx
  ON public.quotes (organization_id, first_public_opened_at)
  WHERE first_public_opened_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS quotes_source_quote_idx
  ON public.quotes (source_quote_id)
  WHERE source_quote_id IS NOT NULL;

-- A historical grant is kept even after the local trial expires. It makes the
-- "first real send" offer idempotent without pretending to be a Stripe trial.
CREATE TABLE IF NOT EXISTS public.pro_trial_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  quote_id UUID NOT NULL UNIQUE REFERENCES public.quotes(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ends_at TIMESTAMPTZ NOT NULL,
  source TEXT NOT NULL DEFAULT 'first_quote_sent'
);

ALTER TABLE public.pro_trial_grants ENABLE ROW LEVEL SECURITY;

-- This RPC is the source of truth for a confirmed manual WhatsApp follow-up.
-- It avoids lost updates when the same proposal is open on more than one device.
CREATE OR REPLACE FUNCTION public.register_quote_follow_up(p_quote_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  quote_org_id UUID;
  quote_status TEXT;
  next_count INTEGER;
BEGIN
  SELECT organization_id, status
    INTO quote_org_id, quote_status
  FROM public.quotes
  WHERE id = p_quote_id;

  IF quote_org_id IS NULL THEN
    RAISE EXCEPTION 'Proposta nao encontrada.' USING ERRCODE = 'P0002';
  END IF;

  IF NOT public.user_in_organization(quote_org_id) THEN
    RAISE EXCEPTION 'Sem permissao para atualizar esta proposta.' USING ERRCODE = '42501';
  END IF;

  IF quote_status NOT IN ('pending', 'sent') THEN
    RAISE EXCEPTION 'Lembretes so podem ser registrados em propostas aguardando resposta.' USING ERRCODE = '22023';
  END IF;

  UPDATE public.quotes
  SET follow_up_count = COALESCE(follow_up_count, 0) + 1,
      follow_up_sent_at = now(),
      updated_at = now()
  WHERE id = p_quote_id
  RETURNING follow_up_count INTO next_count;

  RETURN next_count;
END;
$$;

REVOKE ALL ON FUNCTION public.register_quote_follow_up(UUID) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.register_quote_follow_up(UUID) TO authenticated;

-- Confirming a send remains an explicit owner decision in the UI. This RPC
-- atomically records that decision, freezes the Pix receiver when applicable,
-- and grants the one local Pro trial only once. It does not create a Stripe
-- subscription or change billing status.
CREATE OR REPLACE FUNCTION public.confirm_quote_sent_and_start_trial(
  p_quote_id UUID,
  p_channel TEXT
)
RETURNS TABLE (
  confirmed_at TIMESTAMPTZ,
  trial_started BOOLEAN,
  trial_ends_at TIMESTAMPTZ,
  quote_status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  quote_row public.quotes%ROWTYPE;
  profile_row public.profiles%ROWTYPE;
  next_trial_end TIMESTAMPTZ;
  should_grant_trial BOOLEAN := false;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Sem permissao para confirmar o envio.' USING ERRCODE = '42501';
  END IF;

  IF p_channel NOT IN ('whatsapp', 'email') THEN
    RAISE EXCEPTION 'Canal de envio invalido.' USING ERRCODE = '22023';
  END IF;

  SELECT *
    INTO quote_row
  FROM public.quotes
  WHERE id = p_quote_id
  FOR UPDATE;

  IF quote_row.id IS NULL THEN
    RAISE EXCEPTION 'Proposta nao encontrada.' USING ERRCODE = 'P0002';
  END IF;

  IF quote_row.user_id <> auth.uid() OR NOT public.user_in_organization(quote_row.organization_id) THEN
    RAISE EXCEPTION 'Sem permissao para confirmar esta proposta.' USING ERRCODE = '42501';
  END IF;

  IF p_channel = 'whatsapp' AND length(regexp_replace(COALESCE(quote_row.client_phone, ''), '[^0-9]', '', 'g')) < 10 THEN
    RAISE EXCEPTION 'Informe o WhatsApp do cliente antes de confirmar o envio.' USING ERRCODE = '22023';
  END IF;

  IF p_channel = 'email' AND COALESCE(quote_row.client_email, '') !~ '^[^[:space:]@]+@[^[:space:]@]+[.][^[:space:]@]+$' THEN
    RAISE EXCEPTION 'Informe um email valido do cliente antes de confirmar o envio.' USING ERRCODE = '22023';
  END IF;

  SELECT *
    INTO profile_row
  FROM public.profiles
  WHERE id = auth.uid()
  FOR UPDATE;

  IF quote_row.deposit_amount > 0 AND COALESCE(trim(profile_row.pix_key), '') = '' THEN
    RAISE EXCEPTION 'Cadastre sua chave Pix no perfil antes de solicitar sinal.' USING ERRCODE = '22023';
  END IF;

  confirmed_at := COALESCE(quote_row.sent_confirmed_at, now());
  trial_started := false;

  UPDATE public.quotes
  SET status = CASE WHEN status IN ('draft', 'pending') THEN 'sent' ELSE status END,
      sent_at = COALESCE(sent_at, confirmed_at),
      sent_confirmed_at = confirmed_at,
      sent_via = p_channel,
      approval_recipient_phone = COALESCE(quote_row.approval_recipient_phone, quote_row.client_phone),
      approval_recipient_name = COALESCE(quote_row.approval_recipient_name, quote_row.client_name),
      approval_link_issued_at = COALESCE(quote_row.approval_link_issued_at, confirmed_at),
      deposit_status = CASE
        WHEN quote_row.deposit_amount > 0 THEN 'requested'
        ELSE quote_row.deposit_status
      END,
      deposit_requested_at = CASE
        WHEN quote_row.deposit_amount > 0 THEN COALESCE(quote_row.deposit_requested_at, confirmed_at)
        ELSE quote_row.deposit_requested_at
      END,
      pix_key_snapshot = CASE WHEN quote_row.deposit_amount > 0 THEN profile_row.pix_key ELSE quote_row.pix_key_snapshot END,
      pix_key_type_snapshot = CASE WHEN quote_row.deposit_amount > 0 THEN profile_row.pix_key_type ELSE quote_row.pix_key_type_snapshot END,
      pix_recipient_name_snapshot = CASE WHEN quote_row.deposit_amount > 0 THEN profile_row.pix_recipient_name ELSE quote_row.pix_recipient_name_snapshot END,
      pix_recipient_city_snapshot = CASE WHEN quote_row.deposit_amount > 0 THEN profile_row.pix_recipient_city ELSE quote_row.pix_recipient_city_snapshot END,
      updated_at = now()
  WHERE id = p_quote_id
  RETURNING status INTO quote_status;

  SELECT NOT EXISTS (
      SELECT 1 FROM public.pro_trial_grants WHERE profile_id = auth.uid()
    )
    AND profile_row.onboarded_at IS NOT NULL
    AND COALESCE(profile_row.is_superadmin, false) = false
    AND COALESCE(profile_row.plan, 'free') = 'free'
    AND COALESCE(profile_row.subscription_status, '') NOT IN ('active', 'trialing', 'past_due', 'unpaid')
    AND profile_row.pro_trial_started_at IS NULL
    AND quote_row.sent_confirmed_at IS NULL
    INTO should_grant_trial;

  IF should_grant_trial THEN
    next_trial_end := now() + INTERVAL '7 days';

    UPDATE public.profiles
    SET pro_trial_started_at = now(),
        pro_trial_ends_at = next_trial_end,
        pro_trial_source = 'first_quote_sent',
        updated_at = now()
    WHERE id = auth.uid()
      AND pro_trial_started_at IS NULL;

    IF FOUND THEN
      INSERT INTO public.pro_trial_grants (
        profile_id,
        organization_id,
        quote_id,
        started_at,
        ends_at,
        source
      ) VALUES (
        auth.uid(),
        quote_row.organization_id,
        p_quote_id,
        now(),
        next_trial_end,
        'first_quote_sent'
      ) ON CONFLICT (profile_id) DO NOTHING;

      trial_started := true;
      trial_ends_at := next_trial_end;
    END IF;
  END IF;

  RETURN NEXT;
END;
$$;

REVOKE ALL ON FUNCTION public.confirm_quote_sent_and_start_trial(UUID, TEXT) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.confirm_quote_sent_and_start_trial(UUID, TEXT) TO authenticated;

CREATE TABLE IF NOT EXISTS public.quote_evidences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL UNIQUE,
  file_name TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('image/jpeg', 'image/png', 'image/webp')),
  file_size INTEGER NOT NULL CHECK (file_size > 0 AND file_size <= 6291456),
  caption TEXT,
  is_client_visible BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS quote_evidences_quote_idx
  ON public.quote_evidences (quote_id, created_at);

CREATE INDEX IF NOT EXISTS quote_evidences_visible_idx
  ON public.quote_evidences (quote_id, is_client_visible)
  WHERE is_client_visible;

ALTER TABLE public.quote_evidences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Organization members can view quote evidences" ON public.quote_evidences;
DROP POLICY IF EXISTS "Owners can add quote evidences" ON public.quote_evidences;
DROP POLICY IF EXISTS "Owners can update quote evidences" ON public.quote_evidences;
DROP POLICY IF EXISTS "Owners can delete quote evidences" ON public.quote_evidences;

CREATE POLICY "Organization members can view quote evidences"
  ON public.quote_evidences FOR SELECT
  USING (public.user_in_organization(organization_id));

CREATE POLICY "Owners can add quote evidences"
  ON public.quote_evidences FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND public.user_in_organization(organization_id)
    AND EXISTS (
      SELECT 1
      FROM public.quotes q
      WHERE q.id = quote_id
        AND q.organization_id = organization_id
    )
  );

CREATE POLICY "Owners can update quote evidences"
  ON public.quote_evidences FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND public.user_in_organization(organization_id)
    AND EXISTS (
      SELECT 1
      FROM public.quotes q
      WHERE q.id = quote_id
        AND q.organization_id = organization_id
    )
  );

CREATE POLICY "Owners can delete quote evidences"
  ON public.quote_evidences FOR DELETE
  USING (auth.uid() = user_id);

-- The bucket is private. Public proposal pages receive a short signed URL only
-- after their public quote token is validated on the server.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'quote-evidences',
  'quote-evidences',
  false,
  6291456,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE
SET public = false,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Owners can select own quote evidence objects" ON storage.objects;
DROP POLICY IF EXISTS "Owners can upload own quote evidence objects" ON storage.objects;
DROP POLICY IF EXISTS "Owners can update own quote evidence objects" ON storage.objects;
DROP POLICY IF EXISTS "Owners can delete own quote evidence objects" ON storage.objects;

CREATE POLICY "Owners can select own quote evidence objects"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'quote-evidences'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Owners can upload own quote evidence objects"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'quote-evidences'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND lower(storage.extension(name)) = ANY (ARRAY['jpg', 'jpeg', 'png', 'webp'])
  );

CREATE POLICY "Owners can update own quote evidence objects"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'quote-evidences'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'quote-evidences'
    AND (storage.foldername(name))[1] = auth.uid()::text
    AND lower(storage.extension(name)) = ANY (ARRAY['jpg', 'jpeg', 'png', 'webp'])
  );

CREATE POLICY "Owners can delete own quote evidence objects"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'quote-evidences'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
