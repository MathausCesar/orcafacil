BEGIN;

ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS unit TEXT NOT NULL DEFAULT 'un',
  ADD COLUMN IF NOT EXISTS cost_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS stock_quantity NUMERIC(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS min_stock NUMERIC(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS track_stock BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS stock_updated_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.quote_items
  ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS item_type TEXT NOT NULL DEFAULT 'service',
  ADD COLUMN IF NOT EXISTS unit_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS stock_deducted_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.quote_items
  DROP CONSTRAINT IF EXISTS quote_items_item_type_check;

ALTER TABLE public.quote_items
  ADD CONSTRAINT quote_items_item_type_check
  CHECK (item_type IN ('service', 'product'));

CREATE INDEX IF NOT EXISTS idx_quote_items_service_id
ON public.quote_items(service_id);

CREATE INDEX IF NOT EXISTS idx_quote_items_stock_pending
ON public.quote_items(quote_id, service_id)
WHERE service_id IS NOT NULL AND stock_deducted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.stock_movements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  quote_id UUID REFERENCES public.quotes(id) ON DELETE SET NULL,
  quote_item_id UUID REFERENCES public.quote_items(id) ON DELETE SET NULL,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('entry', 'exit', 'adjustment')),
  quantity_delta NUMERIC(12, 2) NOT NULL CHECK (quantity_delta <> 0),
  previous_quantity NUMERIC(12, 2),
  new_quantity NUMERIC(12, 2),
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::TEXT, now()) NOT NULL
);

ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own stock movements" ON public.stock_movements;
CREATE POLICY "Users can view own stock movements"
ON public.stock_movements
FOR SELECT
USING (public.user_in_organization(organization_id));

DROP POLICY IF EXISTS "Users can insert own stock movements" ON public.stock_movements;

REVOKE INSERT, UPDATE, DELETE ON public.stock_movements FROM public, anon, authenticated;

CREATE INDEX IF NOT EXISTS idx_stock_movements_org_created
ON public.stock_movements(organization_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_stock_movements_service_created
ON public.stock_movements(service_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.record_stock_movement(
  p_service_id UUID,
  p_quantity_delta NUMERIC,
  p_movement_type TEXT DEFAULT 'adjustment',
  p_note TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  item_record RECORD;
  previous_quantity NUMERIC;
  new_quantity NUMERIC;
BEGIN
  IF p_quantity_delta IS NULL OR p_quantity_delta = 0 THEN
    RAISE EXCEPTION 'Informe uma quantidade diferente de zero.';
  END IF;

  IF p_movement_type NOT IN ('entry', 'exit', 'adjustment') THEN
    RAISE EXCEPTION 'Tipo de movimentacao invalido.';
  END IF;

  SELECT id, organization_id, type, stock_quantity
    INTO item_record
  FROM public.services
  WHERE id = p_service_id
  FOR UPDATE;

  IF item_record.id IS NULL THEN
    RAISE EXCEPTION 'Item nao encontrado.';
  END IF;

  IF item_record.type <> 'product' THEN
    RAISE EXCEPTION 'Apenas produtos controlam estoque.';
  END IF;

  IF NOT public.user_in_organization(item_record.organization_id) THEN
    RAISE EXCEPTION 'Sem permissao para alterar este estoque.';
  END IF;

  previous_quantity := COALESCE(item_record.stock_quantity, 0);
  new_quantity := previous_quantity + p_quantity_delta;

  IF new_quantity < 0 THEN
    RAISE EXCEPTION 'Estoque insuficiente para esta saida.';
  END IF;

  UPDATE public.services
  SET stock_quantity = new_quantity,
      track_stock = true,
      stock_updated_at = now()
  WHERE id = p_service_id;

  INSERT INTO public.stock_movements (
    user_id,
    organization_id,
    service_id,
    movement_type,
    quantity_delta,
    previous_quantity,
    new_quantity,
    note
  )
  VALUES (
    auth.uid(),
    item_record.organization_id,
    p_service_id,
    p_movement_type,
    p_quantity_delta,
    previous_quantity,
    new_quantity,
    NULLIF(trim(COALESCE(p_note, '')), '')
  );

  RETURN jsonb_build_object(
    'previous_quantity', previous_quantity,
    'new_quantity', new_quantity
  );
END;
$$;

REVOKE ALL ON FUNCTION public.record_stock_movement(UUID, NUMERIC, TEXT, TEXT) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.record_stock_movement(UUID, NUMERIC, TEXT, TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION public.consume_quote_stock(p_quote_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  quote_record RECORD;
  item_record RECORD;
  previous_quantity NUMERIC;
  new_quantity NUMERIC;
  quantity_to_deduct NUMERIC;
  deducted_count INTEGER := 0;
BEGIN
  SELECT id, organization_id, status
    INTO quote_record
  FROM public.quotes
  WHERE id = p_quote_id;

  IF quote_record.id IS NULL THEN
    RAISE EXCEPTION 'Orcamento nao encontrado.';
  END IF;

  IF NOT public.user_in_organization(quote_record.organization_id) THEN
    RAISE EXCEPTION 'Sem permissao para baixar materiais deste orcamento.';
  END IF;

  IF quote_record.status NOT IN ('approved', 'in_progress') THEN
    RAISE EXCEPTION 'Baixa de estoque disponivel somente apos aprovacao do cliente.';
  END IF;

  FOR item_record IN
    SELECT
      qi.id AS quote_item_id,
      qi.quantity,
      qi.service_id,
      qi.description,
      s.organization_id,
      s.track_stock,
      s.type
    FROM public.quote_items qi
    JOIN public.services s ON s.id = qi.service_id
    WHERE qi.quote_id = p_quote_id
      AND qi.stock_deducted_at IS NULL
      AND s.organization_id = quote_record.organization_id
      AND s.type = 'product'
      AND s.track_stock = true
  LOOP
    quantity_to_deduct := COALESCE(item_record.quantity, 0);

    IF quantity_to_deduct <= 0 THEN
      CONTINUE;
    END IF;

    SELECT COALESCE(stock_quantity, 0)
      INTO previous_quantity
    FROM public.services
    WHERE id = item_record.service_id
    FOR UPDATE;

    new_quantity := previous_quantity - quantity_to_deduct;

    IF new_quantity < 0 THEN
      RAISE EXCEPTION 'Estoque insuficiente para %.', COALESCE(item_record.description, 'produto');
    END IF;

    UPDATE public.services
    SET stock_quantity = new_quantity,
        stock_updated_at = now()
    WHERE id = item_record.service_id;

    INSERT INTO public.stock_movements (
      user_id,
      organization_id,
      service_id,
      quote_id,
      quote_item_id,
      movement_type,
      quantity_delta,
      previous_quantity,
      new_quantity,
      note
    )
    VALUES (
      auth.uid(),
      quote_record.organization_id,
      item_record.service_id,
      p_quote_id,
      item_record.quote_item_id,
      'exit',
      -quantity_to_deduct,
      previous_quantity,
      new_quantity,
      'Baixa do orcamento #' || upper(substr(p_quote_id::text, 1, 8))
    );

    UPDATE public.quote_items
    SET stock_deducted_at = now()
    WHERE id = item_record.quote_item_id;

    deducted_count := deducted_count + 1;
  END LOOP;

  RETURN jsonb_build_object('deducted_items', deducted_count);
END;
$$;

REVOKE ALL ON FUNCTION public.consume_quote_stock(UUID) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.consume_quote_stock(UUID) TO authenticated;

COMMIT;
