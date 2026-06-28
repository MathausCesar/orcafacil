BEGIN;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_org_id UUID;
  workspace_name TEXT;
BEGIN
  workspace_name := COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), 'Meu Workspace');

  INSERT INTO public.profiles (id, email, updated_at)
  VALUES (NEW.id, NEW.email, NOW())
  ON CONFLICT (id) DO UPDATE
  SET
    email = COALESCE(public.profiles.email, EXCLUDED.email),
    updated_at = COALESCE(public.profiles.updated_at, EXCLUDED.updated_at);

  IF NOT EXISTS (
    SELECT 1
    FROM public.organization_members
    WHERE user_id = NEW.id
  ) THEN
    INSERT INTO public.organizations (name)
    VALUES (workspace_name)
    RETURNING id INTO new_org_id;

    INSERT INTO public.organization_members (user_id, organization_id, role)
    VALUES (NEW.id, new_org_id, 'owner')
    ON CONFLICT (organization_id, user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

INSERT INTO public.profiles (id, email, updated_at)
SELECT u.id, u.email, NOW()
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

DO $$
DECLARE
  user_record RECORD;
  new_org_id UUID;
  workspace_name TEXT;
BEGIN
  FOR user_record IN
    SELECT u.id, u.raw_user_meta_data
    FROM auth.users u
    WHERE NOT EXISTS (
      SELECT 1
      FROM public.organization_members m
      WHERE m.user_id = u.id
    )
  LOOP
    workspace_name := COALESCE(NULLIF(user_record.raw_user_meta_data->>'full_name', ''), 'Meu Workspace');

    INSERT INTO public.organizations (name)
    VALUES (workspace_name)
    RETURNING id INTO new_org_id;

    INSERT INTO public.organization_members (organization_id, user_id, role)
    VALUES (new_org_id, user_record.id, 'owner')
    ON CONFLICT (organization_id, user_id) DO NOTHING;
  END LOOP;
END $$;

INSERT INTO public.template_categories (id, name, icon, slug)
VALUES ('outros', 'Outros', 'briefcase', 'outros')
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    icon = EXCLUDED.icon,
    slug = EXCLUDED.slug;

WITH new_services(category_id, name, default_price, unit, specialty_tags, description) AS (
  VALUES
    ('auto', 'Reparo de Funilaria', 450.00, 'servico', ARRAY['funilaria'], 'Reparo em amassados, alinhamento de peca e preparo para pintura conforme avaliacao.'),
    ('auto', 'Pintura de Peca Automotiva', 380.00, 'peca', ARRAY['funilaria'], 'Pintura e acabamento de peca automotiva com preparacao e polimento basico.'),
    ('auto', 'Retoque e Polimento Localizado', 220.00, 'servico', ARRAY['funilaria', 'estetica'], 'Correcao localizada de pequenos riscos, marcas ou imperfeicoes superficiais.'),
    ('construction', 'Forro de Gesso / Drywall', 85.00, 'm2', ARRAY['gesso'], 'Instalacao de forro de gesso ou drywall conforme area, estrutura e acabamento combinados.'),
    ('construction', 'Parede de Drywall', 110.00, 'm2', ARRAY['gesso'], 'Montagem de parede em drywall com estrutura metalica, fechamento e preparo para acabamento.'),
    ('construction', 'Reparo em Gesso', 180.00, 'servico', ARRAY['gesso'], 'Correcoes em trincas, placas, sancas ou pontos danificados em gesso.'),
    ('construction', 'Sanca ou Moldura de Gesso', 45.00, 'metro', ARRAY['gesso'], 'Instalacao de sancas, molduras ou detalhes decorativos conforme medida aprovada.'),
    ('construction', 'Instalacao de Suporte ou Prateleira', 120.00, 'servico', ARRAY['marido_aluguel'], 'Fixacao de suporte, prateleira, nicho ou item similar em parede adequada.'),
    ('construction', 'Pequenos Reparos Residenciais', 180.00, 'servico', ARRAY['marido_aluguel'], 'Pacote de reparos simples como ajustes, trocas e fixacoes de baixa complexidade.'),
    ('construction', 'Troca de Fechadura ou Dobradica', 140.00, 'servico', ARRAY['marido_aluguel'], 'Substituicao ou ajuste de fechadura, dobradica, puxador ou ferragem simples.'),
    ('construction', 'Reparo em Telhado', 350.00, 'servico', ARRAY['telhado'], 'Revisao e reparo pontual em telhado com troca de pecas danificadas quando necessario.'),
    ('construction', 'Troca de Telhas', 22.00, 'unidade', ARRAY['telhado'], 'Remocao e substituicao de telhas quebradas ou deslocadas.'),
    ('construction', 'Limpeza de Calhas', 180.00, 'servico', ARRAY['telhado'], 'Limpeza e desobstrucao de calhas, rufos e pontos de escoamento.'),
    ('construction', 'Impermeabilizacao de Telhado', 70.00, 'm2', ARRAY['telhado'], 'Aplicacao de solucao impermeabilizante em area de cobertura conforme avaliacao.'),
    ('education', 'Aula Particular', 90.00, 'hora', ARRAY['professor'], 'Aula individual conforme disciplina, objetivo e nivel do aluno.'),
    ('education', 'Pacote de Aulas', 320.00, 'pacote', ARRAY['professor'], 'Pacote de acompanhamento com encontros combinados e plano de estudo simples.'),
    ('education', 'Treino Personalizado', 120.00, 'sessao', ARRAY['personal'], 'Sessao de treino orientado conforme objetivo, condicionamento e disponibilidade do aluno.'),
    ('education', 'Plano de Acompanhamento Fisico', 280.00, 'mes', ARRAY['personal'], 'Planejamento mensal de treino com ajustes basicos de evolucao.'),
    ('education', 'Consultoria por Sessao', 250.00, 'sessao', ARRAY['consultoria'], 'Sessao de consultoria para diagnostico, orientacao e proximas acoes.'),
    ('education', 'Plano de Consultoria', 650.00, 'projeto', ARRAY['consultoria'], 'Pacote de consultoria com levantamento, recomendacoes e acompanhamento inicial.'),
    ('design', 'Projeto de Fachada', 650.00, 'projeto', ARRAY['fachadas'], 'Criacao de proposta visual para fachada com medidas, materiais e acabamento sugeridos.'),
    ('design', 'Producao de Adesivo', 85.00, 'm2', ARRAY['adesivos'], 'Impressao, recorte ou producao de adesivo conforme arte e medida aprovada.'),
    ('design', 'Placa em ACM', 320.00, 'm2', ARRAY['acm'], 'Producao de placa em ACM com acabamento conforme projeto aprovado.'),
    ('design', 'Letra Caixa ou Luminoso', 180.00, 'unidade', ARRAY['letreiros'], 'Producao ou instalacao de letra caixa, luminoso ou elemento de destaque.'),
    ('design', 'Banner Impresso', 95.00, 'm2', ARRAY['banners'], 'Impressao e acabamento de banner em lona conforme arte enviada ou aprovada.'),
    ('design', 'Criacao de Identidade Visual', 850.00, 'projeto', ARRAY['identidade_visual'], 'Desenvolvimento de marca, paleta e aplicacoes basicas para uso comercial.'),
    ('design', 'Arte para Redes Sociais', 80.00, 'arte', ARRAY['digital'], 'Criacao de arte digital para post, campanha ou divulgacao em redes sociais.'),
    ('design', 'Sinalizacao ou Totem', 520.00, 'servico', ARRAY['sinalizacao'], 'Producao ou instalacao de item de sinalizacao conforme medida e local.'),
    ('design', 'Envelopamento de Frota', 180.00, 'm2', ARRAY['frotas'], 'Aplicacao de adesivo em veiculo ou frota conforme arte e area combinada.'),
    ('design', 'Impressos Graficos', 180.00, 'lote', ARRAY['impressos'], 'Producao de impressos como cartoes, folders, panfletos ou materiais promocionais.'),
    ('tech', 'Instalacao de Camera de Seguranca', 160.00, 'ponto', ARRAY['seguranca'], 'Instalacao e direcionamento de camera com passagem basica de cabo e teste de imagem.'),
    ('tech', 'Configuracao de DVR/NVR', 220.00, 'servico', ARRAY['seguranca'], 'Configuracao de gravador, acesso remoto, usuarios e armazenamento.'),
    ('tech', 'Instalacao de Interfone', 180.00, 'servico', ARRAY['seguranca'], 'Instalacao ou substituicao de interfone residencial ou comercial.'),
    ('tech', 'Instalacao de Alarme', 350.00, 'servico', ARRAY['seguranca'], 'Instalacao e configuracao inicial de central de alarme e sensores.'),
    ('tech', 'Manutencao de Sistema de Seguranca', 180.00, 'servico', ARRAY['seguranca'], 'Revisao de cameras, cabos, fontes, conectores e gravadores existentes.'),
    ('outros', 'Visita Tecnica', 120.00, 'visita', ARRAY['geral', 'consultoria_especializada', 'atendimento', 'outras_especialidades'], 'Avaliacao inicial, levantamento de necessidade e orientacao para o cliente.'),
    ('outros', 'Hora Tecnica', 90.00, 'hora', ARRAY['geral', 'consultoria_especializada', 'atendimento', 'outras_especialidades'], 'Atendimento cobrado por hora para execucao, suporte ou acompanhamento.'),
    ('outros', 'Diaria de Servico', 320.00, 'dia', ARRAY['geral', 'outras_especialidades'], 'Diaria de mao de obra para servicos gerais ou personalizados.'),
    ('outros', 'Consultoria Especializada', 250.00, 'servico', ARRAY['consultoria_especializada'], 'Analise, recomendacao e plano de acao para uma necessidade especifica.'),
    ('outros', 'Atendimento ou Suporte', 150.00, 'servico', ARRAY['atendimento'], 'Atendimento pontual, suporte operacional ou assistencia ao cliente.'),
    ('outros', 'Servico Personalizado', 200.00, 'servico', ARRAY['geral', 'outras_especialidades'], 'Item generico para adaptar ao tipo de trabalho do profissional.')
)
INSERT INTO public.template_services (category_id, name, default_price, unit, specialty_tags, description)
SELECT category_id, name, default_price, unit, specialty_tags, description
FROM new_services ns
WHERE NOT EXISTS (
  SELECT 1
  FROM public.template_services existing
  WHERE existing.category_id = ns.category_id
    AND existing.name = ns.name
);

WITH new_products(category_id, name, default_price, unit, specialty_tags, description) AS (
  VALUES
    ('auto', 'Massa Plastica Automotiva', 38.00, 'unidade', ARRAY['funilaria'], 'Material para pequenos reparos e preparacao de superficie.'),
    ('auto', 'Lixa e Primer Automotivo', 55.00, 'kit', ARRAY['funilaria'], 'Kit basico para preparo de peca antes da pintura.'),
    ('construction', 'Placa de Drywall', 58.00, 'unidade', ARRAY['gesso'], 'Placa para fechamento de parede ou forro em drywall.'),
    ('construction', 'Perfil Metalico para Drywall', 18.00, 'metro', ARRAY['gesso'], 'Perfil metalico para estrutura de parede, forro ou acabamento.'),
    ('construction', 'Massa para Gesso/Drywall', 42.00, 'saco', ARRAY['gesso'], 'Massa para tratamento de juntas, reparos e acabamento.'),
    ('construction', 'Kit Buchas e Parafusos', 28.00, 'kit', ARRAY['marido_aluguel'], 'Insumos basicos para fixacoes simples em parede adequada.'),
    ('construction', 'Silicone ou Vedante', 32.00, 'unidade', ARRAY['marido_aluguel'], 'Vedante para pequenos reparos, acabamentos e ajustes residenciais.'),
    ('construction', 'Telha Ceramica', 7.00, 'unidade', ARRAY['telhado'], 'Telha para substituicao pontual em cobertura.'),
    ('construction', 'Manta Impermeabilizante', 95.00, 'rolo', ARRAY['telhado'], 'Material para impermeabilizacao e vedacao de pontos de infiltracao.'),
    ('education', 'Material Didatico', 45.00, 'unidade', ARRAY['professor'], 'Apostila, exercicios ou material complementar para acompanhamento.'),
    ('education', 'Avaliacao Inicial', 80.00, 'unidade', ARRAY['personal', 'consultoria'], 'Levantamento inicial para orientar plano, treino ou consultoria.'),
    ('education', 'Relatorio de Acompanhamento', 120.00, 'unidade', ARRAY['consultoria', 'professor', 'personal'], 'Resumo tecnico com orientacoes, progresso e proximas acoes.'),
    ('design', 'Vinil Adesivo', 70.00, 'm2', ARRAY['adesivos', 'frotas'], 'Material adesivo para aplicacao em superficies ou veiculos.'),
    ('design', 'Chapa ACM', 180.00, 'm2', ARRAY['acm', 'fachadas'], 'Chapa para placas, fachadas e comunicacao visual.'),
    ('design', 'Lona para Banner', 45.00, 'm2', ARRAY['banners'], 'Lona para impressao de banner com acabamento simples.'),
    ('design', 'Modulo LED', 18.00, 'unidade', ARRAY['letreiros'], 'Modulo de iluminacao para letras, fachadas ou luminosos.'),
    ('design', 'Papel Couche ou Offset', 55.00, 'cento', ARRAY['impressos'], 'Material grafico para cartoes, folders e impressos promocionais.'),
    ('design', 'Kit de Aplicacao Visual', 65.00, 'kit', ARRAY['identidade_visual', 'digital', 'sinalizacao'], 'Insumos ou arquivos complementares para entrega de identidade, arte ou sinalizacao.'),
    ('tech', 'Camera de Seguranca', 180.00, 'unidade', ARRAY['seguranca'], 'Camera para instalacao em sistema de monitoramento.'),
    ('tech', 'Cabo CFTV', 3.50, 'metro', ARRAY['seguranca'], 'Cabo para instalacao de cameras e sistemas de seguranca.'),
    ('tech', 'Fonte 12V', 45.00, 'unidade', ARRAY['seguranca'], 'Fonte de alimentacao para cameras, sensores ou acessorios.'),
    ('tech', 'Conector BNC/P4', 8.00, 'unidade', ARRAY['seguranca'], 'Conector para acabamento e ligacao de cameras.'),
    ('outros', 'Material Avulso', 50.00, 'unidade', ARRAY['geral', 'outras_especialidades'], 'Material ou insumo complementar usado no servico.'),
    ('outros', 'Peca de Reposicao', 80.00, 'unidade', ARRAY['geral', 'atendimento'], 'Peca simples de reposicao a ser detalhada no orcamento.'),
    ('outros', 'Kit de Insumos', 120.00, 'kit', ARRAY['geral', 'consultoria_especializada', 'outras_especialidades'], 'Conjunto de materiais basicos para execucao do servico.')
)
INSERT INTO public.template_products (category_id, name, default_price, unit, specialty_tags, description)
SELECT category_id, name, default_price, unit, specialty_tags, description
FROM new_products np
WHERE NOT EXISTS (
  SELECT 1
  FROM public.template_products existing
  WHERE existing.category_id = np.category_id
    AND existing.name = np.name
);

COMMIT;
