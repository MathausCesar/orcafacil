-- Keep the proposal flow lightweight while adding the recurring commercial
-- context that makes Zacly useful after the first approval.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS target_margin_percent NUMERIC(5, 2) NOT NULL DEFAULT 30;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_target_margin_percent_range_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_target_margin_percent_range_check
  CHECK (target_margin_percent >= 0 AND target_margin_percent <= 95);

GRANT UPDATE (target_margin_percent) ON TABLE public.profiles TO authenticated;

ALTER TABLE public.quotes
  ADD COLUMN IF NOT EXISTS client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS cost_total NUMERIC(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS profit_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS profit_margin_percent NUMERIC(7, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS target_margin_percent NUMERIC(5, 2) NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS costs_complete BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.quote_items
  ADD COLUMN IF NOT EXISTS cost_is_known BOOLEAN NOT NULL DEFAULT false;

-- Existing costs above zero are safe to treat as known. Zero remains unknown
-- until the professional confirms it, avoiding an artificial 100% margin.
UPDATE public.quote_items
SET cost_is_known = true
WHERE unit_cost > 0
  AND cost_is_known = false;

UPDATE public.quotes q
SET costs_complete = NOT EXISTS (
  SELECT 1
  FROM public.quote_items qi
  WHERE qi.quote_id = q.id
    AND qi.cost_is_known = false
)
WHERE q.costs_complete = false;

ALTER TABLE public.quotes
  DROP CONSTRAINT IF EXISTS quotes_cost_total_non_negative_check;

ALTER TABLE public.quotes
  ADD CONSTRAINT quotes_cost_total_non_negative_check
  CHECK (cost_total >= 0);

ALTER TABLE public.quotes
  DROP CONSTRAINT IF EXISTS quotes_target_margin_percent_range_check;

ALTER TABLE public.quotes
  ADD CONSTRAINT quotes_target_margin_percent_range_check
  CHECK (target_margin_percent >= 0 AND target_margin_percent <= 95);

CREATE INDEX IF NOT EXISTS quotes_client_id_idx
  ON public.quotes (client_id, created_at DESC)
  WHERE client_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS quotes_commercial_summary_idx
  ON public.quotes (organization_id, status, payment_status, created_at DESC);

-- Link legacy proposals when there is exactly one client with the same name
-- inside the organization. Ambiguous records remain unlinked on purpose.
WITH exact_client_matches AS (
  SELECT
    q.id AS quote_id,
    MIN(c.id::text)::uuid AS client_id
  FROM public.quotes q
  JOIN public.clients c
    ON c.organization_id = q.organization_id
   AND lower(trim(c.name)) = lower(trim(q.client_name))
  WHERE q.client_id IS NULL
  GROUP BY q.id
  HAVING COUNT(*) = 1
)
UPDATE public.quotes q
SET client_id = m.client_id
FROM exact_client_matches m
WHERE q.id = m.quote_id
  AND q.client_id IS NULL;

CREATE OR REPLACE FUNCTION public.validate_quote_client_membership()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  client_org_id UUID;
BEGIN
  IF NEW.client_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT organization_id
    INTO client_org_id
  FROM public.clients
  WHERE id = NEW.client_id;

  IF client_org_id IS NULL OR client_org_id <> NEW.organization_id THEN
    RAISE EXCEPTION 'O cliente precisa pertencer a mesma organizacao da proposta.' USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS validate_quote_client_membership ON public.quotes;

CREATE TRIGGER validate_quote_client_membership
BEFORE INSERT OR UPDATE OF client_id, organization_id ON public.quotes
FOR EACH ROW
EXECUTE FUNCTION public.validate_quote_client_membership();

-- RLS grants organization members row access, but operational completion is a
-- trust boundary. Only the transition RPC (or service role for public
-- approval) can move a proposal into execution or completion. Owners may
-- still confirm a manual send and reset a proposal to draft for revision.
CREATE OR REPLACE FUNCTION public.prevent_internal_quote_decision()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status
     AND COALESCE(auth.role(), '') <> 'service_role' THEN
    IF NEW.status IN ('approved', 'rejected', 'changes_requested') THEN
      RAISE EXCEPTION 'A decisao do cliente deve vir do link publico.';
    END IF;

    IF NEW.status IN ('in_progress', 'completed')
       AND COALESCE(current_setting('app.zacly_quote_status_transition', true), '') <> 'allowed' THEN
      RAISE EXCEPTION 'Use o fluxo seguro da proposta para atualizar este status.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

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

  PERFORM set_config('app.zacly_quote_status_transition', 'allowed', true);

  UPDATE public.quotes
  SET status = new_status,
      sent_at = CASE WHEN new_status = 'sent' AND sent_at IS NULL THEN now() ELSE sent_at END,
      updated_at = now()
  WHERE id = quote_id;
END;
$$;

REVOKE ALL ON FUNCTION public.update_quote_status(UUID, TEXT) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.update_quote_status(UUID, TEXT) TO authenticated;

CREATE TABLE IF NOT EXISTS public.client_return_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  due_date DATE NOT NULL,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  sent_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT client_return_reminders_status_check
    CHECK (status IN ('scheduled', 'sent', 'dismissed')),
  CONSTRAINT client_return_reminders_note_length_check
    CHECK (note IS NULL OR char_length(note) <= 500)
);

CREATE INDEX IF NOT EXISTS client_return_reminders_due_idx
  ON public.client_return_reminders (organization_id, status, due_date);

CREATE UNIQUE INDEX IF NOT EXISTS client_return_reminders_active_quote_idx
  ON public.client_return_reminders (quote_id)
  WHERE status = 'scheduled';

ALTER TABLE public.client_return_reminders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Organization members can view client return reminders" ON public.client_return_reminders;
DROP POLICY IF EXISTS "Owners can create client return reminders" ON public.client_return_reminders;
DROP POLICY IF EXISTS "Owners can update client return reminders" ON public.client_return_reminders;
DROP POLICY IF EXISTS "Owners can delete client return reminders" ON public.client_return_reminders;

CREATE POLICY "Organization members can view client return reminders"
  ON public.client_return_reminders FOR SELECT
  USING (public.user_in_organization(organization_id));

CREATE POLICY "Owners can create client return reminders"
  ON public.client_return_reminders FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND public.user_in_organization(organization_id)
    AND EXISTS (
      SELECT 1
      FROM public.quotes q
      WHERE q.id = quote_id
        AND q.organization_id = organization_id
        AND q.user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can update client return reminders"
  ON public.client_return_reminders FOR UPDATE
  USING (
    auth.uid() = user_id
    AND public.user_in_organization(organization_id)
  )
  WITH CHECK (
    auth.uid() = user_id
    AND public.user_in_organization(organization_id)
  );

CREATE POLICY "Owners can delete client return reminders"
  ON public.client_return_reminders FOR DELETE
  USING (
    auth.uid() = user_id
    AND public.user_in_organization(organization_id)
  );

CREATE OR REPLACE FUNCTION public.set_client_return_reminder_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_client_return_reminder_updated_at ON public.client_return_reminders;

CREATE TRIGGER set_client_return_reminder_updated_at
BEFORE UPDATE ON public.client_return_reminders
FOR EACH ROW
EXECUTE FUNCTION public.set_client_return_reminder_updated_at();
