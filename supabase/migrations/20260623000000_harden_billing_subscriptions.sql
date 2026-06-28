-- Harden Stripe subscription state and cancellation feedback.

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT,
ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT FALSE;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_stripe_subscription_id_idx
ON public.profiles (stripe_subscription_id)
WHERE stripe_subscription_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS profiles_stripe_customer_id_idx
ON public.profiles (stripe_customer_id)
WHERE stripe_customer_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.cancellation_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  additional_comments TEXT,
  plan TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.cancellation_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own cancellation feedback" ON public.cancellation_feedback;
CREATE POLICY "Users can insert own cancellation feedback"
ON public.cancellation_feedback
FOR INSERT
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can view own cancellation feedback" ON public.cancellation_feedback;
CREATE POLICY "Users can view own cancellation feedback"
ON public.cancellation_feedback
FOR SELECT
USING (user_id = auth.uid());

COMMENT ON COLUMN public.profiles.stripe_subscription_id IS 'Stripe subscription id for the active or canceling subscription.';
COMMENT ON COLUMN public.profiles.stripe_price_id IS 'Stripe price id for the current subscription item.';
COMMENT ON COLUMN public.profiles.current_period_end IS 'End of the paid billing period reported by Stripe.';
COMMENT ON COLUMN public.profiles.cancel_at_period_end IS 'Whether Stripe will cancel the subscription at period end.';
