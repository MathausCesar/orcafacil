-- Keep this helper aligned with migrations that create auth user bootstrap data.
-- New accounts need both a profile and an initial owner workspace.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_org_id UUID;
  workspace_name TEXT;
BEGIN
  workspace_name := COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), 'Meu Workspace');

  INSERT INTO public.profiles (id, email, updated_at)
  VALUES (NEW.id, NEW.email, NOW())
  ON CONFLICT (id) DO UPDATE
  SET
    email = COALESCE(public.profiles.email, EXCLUDED.email),
    updated_at = COALESCE(public.profiles.updated_at, EXCLUDED.updated_at);

  IF NOT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE user_id = NEW.id
  ) THEN
    INSERT INTO public.organizations (name)
    VALUES (workspace_name)
    RETURNING id INTO new_org_id;

    INSERT INTO public.organization_members (user_id, organization_id, role)
    VALUES (NEW.id, new_org_id, 'owner')
    ON CONFLICT (organization_id, user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();
