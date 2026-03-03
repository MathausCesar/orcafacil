-- Migration: Enhance support system (A+B+C)
-- Expands support_tickets, adds feature_suggestions and suggestion_votes

-- 1. Expandir support_tickets: novos tipos + colunas de resposta admin
ALTER TABLE support_tickets
  DROP CONSTRAINT IF EXISTS support_tickets_type_check;

ALTER TABLE support_tickets
  ADD CONSTRAINT support_tickets_type_check
    CHECK (type = ANY (ARRAY['doubt','bug','suggestion','praise']));

ALTER TABLE support_tickets
  ADD COLUMN IF NOT EXISTS admin_reply TEXT,
  ADD COLUMN IF NOT EXISTS replied_at TIMESTAMPTZ;

-- 2. Sugestões de funcionalidades
CREATE TABLE IF NOT EXISTS feature_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status = ANY (ARRAY['open','planned','done','rejected'])),
  votes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE feature_suggestions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos podem ver sugestões" ON feature_suggestions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Usuário cria sua sugestão" ON feature_suggestions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. Votos em sugestões
CREATE TABLE IF NOT EXISTS suggestion_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suggestion_id UUID NOT NULL REFERENCES feature_suggestions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(suggestion_id, user_id)
);

ALTER TABLE suggestion_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário lê seus votos" ON suggestion_votes FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Usuário insere voto" ON suggestion_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Usuário remove seu voto" ON suggestion_votes FOR DELETE USING (auth.uid() = user_id);

-- Política de leitura dos próprios tickets
CREATE POLICY "Usuário lê seus tickets" ON support_tickets FOR SELECT USING (auth.uid() = user_id);
