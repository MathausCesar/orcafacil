BEGIN;

-- Restrict profile visibility to the profile owner or users that share an organization.
CREATE OR REPLACE FUNCTION public.user_shares_profile_org(profile_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT profile_id = auth.uid()
    OR EXISTS (
      SELECT 1
      FROM public.organization_members mine
      JOIN public.organization_members theirs
        ON theirs.organization_id = mine.organization_id
      WHERE mine.user_id = auth.uid()
        AND theirs.user_id = profile_id
    );
$$;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles in their organizations." ON public.profiles;
CREATE POLICY "Users can view profiles in their organizations."
ON public.profiles
FOR SELECT
USING (public.user_shares_profile_org(id));

DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
CREATE POLICY "Users can update own profile."
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile."
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Sensitive billing/admin columns must only be written by service role code.
REVOKE INSERT, UPDATE ON TABLE public.profiles FROM anon, authenticated, public;

DO $$
DECLARE
  safe_columns TEXT;
BEGIN
  SELECT string_agg(quote_ident(column_name), ', ' ORDER BY ordinal_position)
    INTO safe_columns
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = ANY (ARRAY[
      'id',
      'updated_at',
      'business_name',
      'phone',
      'primary_color',
      'theme_color',
      'logo_url',
      'cnpj',
      'email',
      'onboarded_at',
      'quote_settings',
      'layout_style',
      'quote_font_family',
      'payment_info',
      'delivery_days',
      'pix_discount_percent',
      'cep',
      'address',
      'address_number',
      'complement',
      'neighborhood',
      'city',
      'state'
    ]);

  IF safe_columns IS NOT NULL THEN
    EXECUTE format('GRANT INSERT (%s) ON TABLE public.profiles TO authenticated', safe_columns);
    EXECUTE format('GRANT UPDATE (%s) ON TABLE public.profiles TO authenticated', safe_columns);
  END IF;
END $$;

-- Organization membership can no longer be self-created by knowing an organization id.
DROP POLICY IF EXISTS "Owners and admins can manage members" ON public.organization_members;
DROP POLICY IF EXISTS "Users can insert members" ON public.organization_members;
DROP POLICY IF EXISTS "Users can delete members" ON public.organization_members;
DROP POLICY IF EXISTS "Org admins can insert members" ON public.organization_members;
DROP POLICY IF EXISTS "Org admins can update members" ON public.organization_members;
DROP POLICY IF EXISTS "Org admins can delete members" ON public.organization_members;

CREATE POLICY "Org admins can insert members"
ON public.organization_members
FOR INSERT
WITH CHECK (public.user_is_org_admin(organization_id));

CREATE POLICY "Org admins can update members"
ON public.organization_members
FOR UPDATE
USING (public.user_is_org_admin(organization_id))
WITH CHECK (public.user_is_org_admin(organization_id));

CREATE POLICY "Org admins can delete members"
ON public.organization_members
FOR DELETE
USING (public.user_is_org_admin(organization_id));

-- Align quote status values with the UI pipeline.
ALTER TABLE public.quotes
DROP CONSTRAINT IF EXISTS quotes_status_check;

ALTER TABLE public.quotes
ADD COLUMN IF NOT EXISTS public_token UUID DEFAULT gen_random_uuid();

UPDATE public.quotes
SET public_token = gen_random_uuid()
WHERE public_token IS NULL;

ALTER TABLE public.quotes
ALTER COLUMN public_token SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS quotes_public_token_idx
ON public.quotes (public_token);

ALTER TABLE public.quotes
ADD CONSTRAINT quotes_status_check
CHECK (status IN ('draft', 'pending', 'sent', 'approved', 'rejected', 'in_progress', 'completed'));

CREATE OR REPLACE FUNCTION public.update_quote_status(quote_id UUID, new_status TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  quote_org_id UUID;
BEGIN
  IF new_status NOT IN ('draft', 'pending', 'sent', 'approved', 'rejected', 'in_progress', 'completed') THEN
    RAISE EXCEPTION 'Status invalido.';
  END IF;

  SELECT organization_id
    INTO quote_org_id
  FROM public.quotes
  WHERE id = quote_id;

  IF quote_org_id IS NULL THEN
    RAISE EXCEPTION 'Orcamento nao encontrado.';
  END IF;

  IF NOT public.user_in_organization(quote_org_id) THEN
    RAISE EXCEPTION 'Sem permissao para alterar este orcamento.';
  END IF;

  UPDATE public.quotes
  SET status = new_status,
      updated_at = now()
  WHERE id = quote_id;
END;
$$;

REVOKE ALL ON FUNCTION public.update_quote_status(UUID, TEXT) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.update_quote_status(UUID, TEXT) TO authenticated;

-- Disable unauthenticated approval-by-UUID until public quote links use signed tokens.
CREATE OR REPLACE FUNCTION public.approve_quote_public(quote_id UUID, new_status TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF new_status NOT IN ('approved', 'rejected') THEN
    RAISE EXCEPTION 'Status invalido.';
  END IF;

  PERFORM public.update_quote_status(quote_id, new_status);
END;
$$;

REVOKE ALL ON FUNCTION public.approve_quote_public(UUID, TEXT) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.approve_quote_public(UUID, TEXT) TO authenticated;

-- Keep suggestion vote totals consistent without client-callable counter RPCs.
CREATE OR REPLACE FUNCTION public.sync_suggestion_vote_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.feature_suggestions
    SET votes_count = votes_count + 1
    WHERE id = NEW.suggestion_id;
    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    UPDATE public.feature_suggestions
    SET votes_count = GREATEST(votes_count - 1, 0)
    WHERE id = OLD.suggestion_id;
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS sync_suggestion_vote_count_insert ON public.suggestion_votes;
DROP TRIGGER IF EXISTS sync_suggestion_vote_count_delete ON public.suggestion_votes;

CREATE TRIGGER sync_suggestion_vote_count_insert
AFTER INSERT ON public.suggestion_votes
FOR EACH ROW
EXECUTE FUNCTION public.sync_suggestion_vote_count();

CREATE TRIGGER sync_suggestion_vote_count_delete
AFTER DELETE ON public.suggestion_votes
FOR EACH ROW
EXECUTE FUNCTION public.sync_suggestion_vote_count();

DROP FUNCTION IF EXISTS public.increment_votes(UUID);
DROP FUNCTION IF EXISTS public.decrement_votes(UUID);

-- Stop exposing auth.users email enumeration.
REVOKE ALL ON FUNCTION public.check_email_exists(TEXT) FROM public, anon, authenticated;

-- Logo uploads are public for reading, but writes must stay inside the user's folder and avoid SVG.
DROP POLICY IF EXISTS "Authenticated users can upload avatar." ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload an avatar." ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own logo." ON storage.objects;
DROP POLICY IF EXISTS "Users can update own logo." ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own logo." ON storage.objects;

CREATE POLICY "Users can upload own logo."
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'logos'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND lower(storage.extension(name)) = ANY (ARRAY['png', 'jpg', 'jpeg', 'webp'])
);

CREATE POLICY "Users can update own logo."
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'logos'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'logos'
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND lower(storage.extension(name)) = ANY (ARRAY['png', 'jpg', 'jpeg', 'webp'])
);

CREATE POLICY "Users can delete own logo."
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'logos'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

COMMIT;
