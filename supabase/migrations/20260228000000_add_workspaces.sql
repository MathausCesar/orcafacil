-- Migration: Add Organizations (Workspaces)
BEGIN;

-- 1. Create helper function for RLS to prevent recursion
CREATE OR REPLACE FUNCTION public.user_in_organization(org_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = org_id AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.user_is_org_admin(org_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = org_id AND user_id = auth.uid() AND role IN ('owner', 'admin')
  );
END;
$$ LANGUAGE plpgsql;

-- 2. Create organizations table
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  document_type TEXT CHECK (document_type IN ('cpf', 'cnpj')),
  document TEXT,
  stripe_customer_id TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create organization_members table
CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner', 'admin', 'member')) DEFAULT 'owner',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- 4. Add organization_id to existing tables
ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.support_tickets ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;
ALTER TABLE public.item_folders ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

-- 5. Execute data migration for existing users
DO $$
DECLARE
    user_record RECORD;
    new_org_id UUID;
    prof_name TEXT;
    prof_doc TEXT;
BEGIN
    FOR user_record IN SELECT id FROM auth.users LOOP
        -- Skip if user already has an owner role in some organization
        IF EXISTS (SELECT 1 FROM public.organization_members WHERE user_id = user_record.id AND role = 'owner') THEN
            CONTINUE;
        END IF;

        -- Get profile data if exists
        SELECT business_name, cnpj INTO prof_name, prof_doc FROM public.profiles WHERE id = user_record.id;
        
        -- Create a default organization for the user
        INSERT INTO public.organizations (name, document_type, document)
        VALUES (
            COALESCE(prof_name, 'Meu Workspace'), 
            CASE WHEN prof_doc IS NOT NULL THEN 'cnpj' ELSE 'cpf' END, 
            prof_doc
        )
        RETURNING id INTO new_org_id;
        
        -- Add user as owner
        INSERT INTO public.organization_members (organization_id, user_id, role)
        VALUES (new_org_id, user_record.id, 'owner');
        
        -- Update all entity tables to belong to this new organization
        UPDATE public.quotes SET organization_id = new_org_id WHERE user_id = user_record.id AND organization_id IS NULL;
        UPDATE public.clients SET organization_id = new_org_id WHERE user_id = user_record.id AND organization_id IS NULL;
        UPDATE public.services SET organization_id = new_org_id WHERE user_id = user_record.id AND organization_id IS NULL;
        UPDATE public.notifications SET organization_id = new_org_id WHERE user_id = user_record.id AND organization_id IS NULL;
        UPDATE public.support_tickets SET organization_id = new_org_id WHERE user_id = user_record.id AND organization_id IS NULL;
        UPDATE public.item_folders SET organization_id = new_org_id WHERE user_id = user_record.id AND organization_id IS NULL;
    END LOOP;
END $$;

-- 6. Clean up orphans and set NOT NULL
DELETE FROM public.quotes WHERE organization_id IS NULL;
DELETE FROM public.clients WHERE organization_id IS NULL;
DELETE FROM public.services WHERE organization_id IS NULL;
DELETE FROM public.notifications WHERE organization_id IS NULL;
DELETE FROM public.support_tickets WHERE organization_id IS NULL;
DELETE FROM public.item_folders WHERE organization_id IS NULL;

ALTER TABLE public.quotes ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE public.clients ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE public.services ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE public.notifications ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE public.support_tickets ALTER COLUMN organization_id SET NOT NULL;
ALTER TABLE public.item_folders ALTER COLUMN organization_id SET NOT NULL;

-- 7. Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;

-- 8. Policies for Organizations
DROP POLICY IF EXISTS "Users can view organizations they belong to" ON public.organizations;
CREATE POLICY "Users can view organizations they belong to" 
ON public.organizations FOR SELECT USING (public.user_in_organization(id));

DROP POLICY IF EXISTS "Owners and admins can update their organizations" ON public.organizations;
CREATE POLICY "Owners and admins can update their organizations" 
ON public.organizations FOR UPDATE USING (public.user_is_org_admin(id));

DROP POLICY IF EXISTS "Users can insert their own organization" ON public.organizations;
CREATE POLICY "Users can insert their own organization"
ON public.organizations FOR INSERT WITH CHECK (true);

-- 9. Policies for Organization Members
DROP POLICY IF EXISTS "Users can view members of their organizations" ON public.organization_members;
CREATE POLICY "Users can view members of their organizations" 
ON public.organization_members FOR SELECT USING (public.user_in_organization(organization_id));

DROP POLICY IF EXISTS "Owners and admins can manage members" ON public.organization_members;
CREATE POLICY "Owners and admins can manage members" 
ON public.organization_members FOR ALL USING (public.user_is_org_admin(organization_id));

DROP POLICY IF EXISTS "Users can insert members" ON public.organization_members;
CREATE POLICY "Users can insert members"
ON public.organization_members FOR INSERT WITH CHECK (user_id = auth.uid() OR public.user_is_org_admin(organization_id));

DROP POLICY IF EXISTS "Users can delete members" ON public.organization_members;
CREATE POLICY "Users can delete members"
ON public.organization_members FOR DELETE USING (user_id = auth.uid() OR public.user_is_org_admin(organization_id));

-- 10. Update Policies for entities to use organization_id
-- QUOTES
DROP POLICY IF EXISTS "Users can view own quotes." ON public.quotes;
CREATE POLICY "Users can view own quotes." ON public.quotes FOR SELECT USING (public.user_in_organization(organization_id));

DROP POLICY IF EXISTS "Users can insert own quotes." ON public.quotes;
CREATE POLICY "Users can insert own quotes." ON public.quotes FOR INSERT WITH CHECK (public.user_in_organization(organization_id));

DROP POLICY IF EXISTS "Users can update own quotes." ON public.quotes;
CREATE POLICY "Users can update own quotes." ON public.quotes FOR UPDATE USING (public.user_in_organization(organization_id));

DROP POLICY IF EXISTS "Users can delete own quotes." ON public.quotes;
CREATE POLICY "Users can delete own quotes." ON public.quotes FOR DELETE USING (public.user_in_organization(organization_id));

-- CLIENTS
DROP POLICY IF EXISTS "Users can view own clients." ON public.clients;
CREATE POLICY "Users can view own clients." ON public.clients FOR SELECT USING (public.user_in_organization(organization_id));

DROP POLICY IF EXISTS "Users can insert own clients." ON public.clients;
CREATE POLICY "Users can insert own clients." ON public.clients FOR INSERT WITH CHECK (public.user_in_organization(organization_id));

DROP POLICY IF EXISTS "Users can update own clients." ON public.clients;
CREATE POLICY "Users can update own clients." ON public.clients FOR UPDATE USING (public.user_in_organization(organization_id));

DROP POLICY IF EXISTS "Users can delete own clients." ON public.clients;
CREATE POLICY "Users can delete own clients." ON public.clients FOR DELETE USING (public.user_in_organization(organization_id));

-- SERVICES
DROP POLICY IF EXISTS "Users can view own services" ON public.services;
CREATE POLICY "Users can view own services" ON public.services FOR SELECT USING (public.user_in_organization(organization_id));

DROP POLICY IF EXISTS "Users can insert own services" ON public.services;
CREATE POLICY "Users can insert own services" ON public.services FOR INSERT WITH CHECK (public.user_in_organization(organization_id));

DROP POLICY IF EXISTS "Users can update own services" ON public.services;
CREATE POLICY "Users can update own services" ON public.services FOR UPDATE USING (public.user_in_organization(organization_id));

DROP POLICY IF EXISTS "Users can delete own services" ON public.services;
CREATE POLICY "Users can delete own services" ON public.services FOR DELETE USING (public.user_in_organization(organization_id));

-- NOTIFICATIONS
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT USING (public.user_in_organization(organization_id));

DROP POLICY IF EXISTS "Users can insert their own notifications" ON public.notifications;
CREATE POLICY "Users can insert their own notifications" ON public.notifications FOR INSERT WITH CHECK (public.user_in_organization(organization_id));

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE USING (public.user_in_organization(organization_id));

DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;
CREATE POLICY "Users can delete their own notifications" ON public.notifications FOR DELETE USING (public.user_in_organization(organization_id));

-- SUPPORT TICKETS
DROP POLICY IF EXISTS "Users can view own support tickets." ON public.support_tickets;
CREATE POLICY "Users can view own support tickets." ON public.support_tickets FOR SELECT USING (public.user_in_organization(organization_id));

DROP POLICY IF EXISTS "Users can insert their own support tickets." ON public.support_tickets;
CREATE POLICY "Users can insert their own support tickets." ON public.support_tickets FOR INSERT WITH CHECK (public.user_in_organization(organization_id));

DROP POLICY IF EXISTS "Users can update support tickets." ON public.support_tickets;
CREATE POLICY "Users can update support tickets." ON public.support_tickets FOR UPDATE USING (public.user_in_organization(organization_id));

DROP POLICY IF EXISTS "Users can delete support tickets." ON public.support_tickets;
CREATE POLICY "Users can delete support tickets." ON public.support_tickets FOR DELETE USING (public.user_in_organization(organization_id));


-- ITEM FOLDERS
DROP POLICY IF EXISTS "Users can view their own folders" ON public.item_folders;
CREATE POLICY "Users can view their own folders" ON public.item_folders FOR SELECT USING (public.user_in_organization(organization_id));

DROP POLICY IF EXISTS "Users can insert their own folders" ON public.item_folders;
CREATE POLICY "Users can insert their own folders" ON public.item_folders FOR INSERT WITH CHECK (public.user_in_organization(organization_id));

DROP POLICY IF EXISTS "Users can update their own folders" ON public.item_folders;
CREATE POLICY "Users can update their own folders" ON public.item_folders FOR UPDATE USING (public.user_in_organization(organization_id));

DROP POLICY IF EXISTS "Users can delete their own folders" ON public.item_folders;
CREATE POLICY "Users can delete their own folders" ON public.item_folders FOR DELETE USING (public.user_in_organization(organization_id));

COMMIT;
