ALTER TABLE public.quotes
ADD COLUMN IF NOT EXISTS professional_context TEXT NOT NULL DEFAULT 'general',
ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'unpaid',
ADD COLUMN IF NOT EXISTS amount_paid NUMERIC(12, 2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS payment_updated_at TIMESTAMPTZ;

ALTER TABLE public.quotes
DROP CONSTRAINT IF EXISTS quotes_professional_context_check;

ALTER TABLE public.quotes
ADD CONSTRAINT quotes_professional_context_check
CHECK (
  professional_context IN (
    'general',
    'mechanic',
    'woodworker',
    'electrician',
    'painter',
    'construction',
    'hvac',
    'tech',
    'design',
    'food',
    'beauty'
  )
);

ALTER TABLE public.quotes
DROP CONSTRAINT IF EXISTS quotes_payment_status_check;

ALTER TABLE public.quotes
ADD CONSTRAINT quotes_payment_status_check
CHECK (payment_status IN ('unpaid', 'partial', 'paid'));

ALTER TABLE public.quotes
DROP CONSTRAINT IF EXISTS quotes_amount_paid_non_negative_check;

ALTER TABLE public.quotes
ADD CONSTRAINT quotes_amount_paid_non_negative_check
CHECK (amount_paid >= 0);

CREATE INDEX IF NOT EXISTS idx_quotes_payment_status
ON public.quotes (organization_id, payment_status);

CREATE INDEX IF NOT EXISTS idx_quotes_professional_context
ON public.quotes (organization_id, professional_context);
