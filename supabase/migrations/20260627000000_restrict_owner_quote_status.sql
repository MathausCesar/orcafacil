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
      updated_at = now()
  WHERE id = quote_id;
END;
$$;

REVOKE ALL ON FUNCTION public.update_quote_status(UUID, TEXT) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.update_quote_status(UUID, TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION public.prevent_internal_quote_decision()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status
     AND NEW.status IN ('approved', 'rejected')
     AND COALESCE(auth.role(), '') <> 'service_role' THEN
    RAISE EXCEPTION 'Aprovacao ou recusa deve vir do link publico do cliente.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS prevent_internal_quote_decision ON public.quotes;

CREATE TRIGGER prevent_internal_quote_decision
BEFORE UPDATE OF status ON public.quotes
FOR EACH ROW
EXECUTE FUNCTION public.prevent_internal_quote_decision();
