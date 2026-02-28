-- Adicionar campos de controle de assinatura na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free',
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive';

-- Comentários para documentação
COMMENT ON COLUMN public.profiles.plan IS 'Plano atual do usuário: free, pro_monthly, pro_yearly';
COMMENT ON COLUMN public.profiles.stripe_customer_id IS 'ID do cliente no gateway (Stripe)';
COMMENT ON COLUMN public.profiles.subscription_status IS 'Status da assinatura: active, past_due, canceled, inactive';
