-- Adiciona campo JSONB para configurações avançadas de orçamento
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS quote_settings JSONB DEFAULT '{}'::jsonb;
