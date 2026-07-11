-- Operational fields for the Zacly feedback inbox.

ALTER TABLE public.support_tickets
  ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'normal'
    CHECK (priority = ANY (ARRAY['low', 'normal', 'high', 'urgent'])),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ADD COLUMN IF NOT EXISTS first_response_at TIMESTAMPTZ;

ALTER TABLE public.feature_suggestions
  ADD COLUMN IF NOT EXISTS admin_note TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS support_tickets_status_created_at_idx
  ON public.support_tickets (status, created_at DESC);

CREATE INDEX IF NOT EXISTS feature_suggestions_status_votes_idx
  ON public.feature_suggestions (status, votes_count DESC);

-- Support tickets are private to their author. Zacly administrators use the service role.
DROP POLICY IF EXISTS "Users can view own support tickets." ON public.support_tickets;
DROP POLICY IF EXISTS "Users can insert their own support tickets." ON public.support_tickets;
DROP POLICY IF EXISTS "Users can update support tickets." ON public.support_tickets;
DROP POLICY IF EXISTS "Users can delete support tickets." ON public.support_tickets;
DROP POLICY IF EXISTS "Usuário lê seus tickets" ON public.support_tickets;

CREATE POLICY "Users can view own support tickets"
  ON public.support_tickets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own support tickets"
  ON public.support_tickets FOR INSERT
  WITH CHECK (auth.uid() = user_id AND public.user_in_organization(organization_id));
