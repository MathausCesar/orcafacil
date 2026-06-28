ALTER TABLE public.quotes
ADD COLUMN IF NOT EXISTS client_response_note TEXT,
ADD COLUMN IF NOT EXISTS client_responded_at TIMESTAMPTZ;

ALTER TABLE public.quotes
DROP CONSTRAINT IF EXISTS quotes_status_check;

ALTER TABLE public.quotes
ADD CONSTRAINT quotes_status_check
CHECK (status IN (
  'draft',
  'pending',
  'sent',
  'approved',
  'rejected',
  'changes_requested',
  'in_progress',
  'completed'
));

CREATE OR REPLACE FUNCTION public.prevent_internal_quote_decision()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status
     AND NEW.status IN ('approved', 'rejected', 'changes_requested')
     AND COALESCE(auth.role(), '') <> 'service_role' THEN
    RAISE EXCEPTION 'Aprovacao, recusa ou pedido de ajuste deve vir do link publico do cliente.';
  END IF;

  RETURN NEW;
END;
$$;
