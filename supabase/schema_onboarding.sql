-- Create template_categories table
CREATE TABLE IF NOT EXISTS public.template_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT NOT NULL, -- Lucide icon name
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create template_services table
CREATE TABLE IF NOT EXISTS public.template_services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id TEXT REFERENCES public.template_categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    default_price DECIMAL(10, 2) NOT NULL,
    unit TEXT NOT NULL DEFAULT 'unidade', -- unidade, hora, m2, dia
    specialty_tags TEXT[] DEFAULT '{}', -- e.g., ['eletrica', 'suspensao']
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create template_products table
CREATE TABLE IF NOT EXISTS public.template_products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category_id TEXT REFERENCES public.template_categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    default_price DECIMAL(10, 2) NOT NULL,
    unit TEXT NOT NULL DEFAULT 'unidade', -- unidade, litro, kit, m
    specialty_tags TEXT[] DEFAULT '{}',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS (Read-only for public/authenticated, write only by service role/admin if needed)
ALTER TABLE public.template_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to template_categories" ON public.template_categories;
DROP POLICY IF EXISTS "Allow public read access to template_services" ON public.template_services;
DROP POLICY IF EXISTS "Allow public read access to template_products" ON public.template_products;

CREATE POLICY "Allow public read access to template_categories" ON public.template_categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access to template_services" ON public.template_services FOR SELECT USING (true);
CREATE POLICY "Allow public read access to template_products" ON public.template_products FOR SELECT USING (true);


-- SEED DATA --

-- 1. Categories
INSERT INTO public.template_categories (id, name, icon, slug) VALUES
('auto', 'Automotivo', 'car', 'auto'),
('construction', 'Construção & Reformas', 'hammer', 'construction'),
('tech', 'Tecnologia & Elétrica', 'zap', 'tech'),
('beauty', 'Beleza & Estética', 'scissors', 'beauty'),
('education', 'Aulas & Consultoria', 'graduation-cap', 'education')
ON CONFLICT (id) DO UPDATE 
SET slug = EXCLUDED.slug;

-- 2. Services (Curated & Non-Duplicate)

-- Automotivo
INSERT INTO public.template_services (category_id, name, default_price, unit, specialty_tags, description) VALUES
('auto', 'Troca de Óleo e Filtro', 80.00, 'unidade', ARRAY['mecanica_geral'], 'Substituição completa do óleo do motor e filtro de óleo, utilizando componentes originais ou de alta performance. Custo do óleo cobrado à parte.'),
('auto', 'Alinhamento e Balanceamento', 120.00, 'unidade', ARRAY['pneus'], 'Ajuste computadorizado da geometria de direção para garantir desgaste uniforme dos pneus e melhor controle direcional.'),
('auto', 'Troca de Pastilhas de Freio', 150.00, 'unidade', ARRAY['freios'], 'Substituição do conjunto de pastilhas de freio dianteiras. Inclui sangria e verificação do nível de fluido de freio DOT4.'),
('auto', 'Diagnóstico Eletrônico', 100.00, 'unidade', ARRAY['eletrica'], 'Leitura e rastreamento de falhas eletrônicas na central do veículo utilizando scanner automotivo profissional (OBD2).'),
('auto', 'Limpeza de Bicos Injetores', 180.00, 'unidade', ARRAY['injecao'], 'Desobstrução e equalização dos bicos injetores utilizando máquina ultrassônica, melhorando consumo e desempenho.'),
('auto', 'Troca de Embreagem Completa', 450.00, 'unidade', ARRAY['mecanica_geral'], 'Serviço de mão de obra para descida do câmbio e substituição completa do kit de embreagem (platô, disco e rolamento).'),
('auto', 'Carga de Gás do Ar Condicionado', 250.00, 'unidade', ARRAY['ar_condicionado'], 'Recarga e verificação de estanqueidade do gás refrigerante no sistema de ar condicionado veicular.'),
('auto', 'Instalação de Som Automotivo', 200.00, 'unidade', ARRAY['som'], 'Adaptação e cabeamento profissional para instalação de centrais multimídia, módulos amplificadores ou alto-falantes.'),
('auto', 'Polimento Automotivo', 300.00, 'unidade', ARRAY['estetica'], 'Polimento técnico da carroceria para correção de micro-riscos, nivelamento do verniz e recuperação de brilho profundo.'),
('auto', 'Lavagem Completa + Enceramento', 80.00, 'unidade', ARRAY['estetica'], 'Limpeza detalhada interior e exterior, englobando aspiração pesada, pretinho, lavagem de caixa de rodas e aplicação de cera protetora.')
ON CONFLICT DO NOTHING;

-- Construção & Reformas
INSERT INTO public.template_services (category_id, name, default_price, unit, specialty_tags, description) VALUES
('construction', 'Assentamento de Piso Cerâmico', 50.00, 'm2', ARRAY['acabamento'], 'Preparo e aplicação de piso cerâmico ou porcelanato sobre contrapiso utilizando argamassa específica. Valor cobrado por metro quadrado.'),
('construction', 'Reboco de Parede', 45.00, 'm2', ARRAY['pedreiro'], 'Aplicação de argamassa e nivelamento a prumo para acabamento liso em blocos cerâmicos ou de concreto.'),
('construction', 'Pintura Látex (Parede)', 35.00, 'm2', ARRAY['pintor'], 'Aplicação profissional de tinta látex rolinhado em até 3 demãos. Não inclui o lixamento e aplicação de massa corrida.'),
('construction', 'Instalação de Porta', 180.00, 'unidade', ARRAY['acabamento'], 'Colocação e alinhamento de portal, batente, porta e fechadura. Inclui preenchimento de frestas com espuma expansiva.'),
('construction', 'Ponto Elétrico Adicional', 60.00, 'ponto', ARRAY['eletricista'], 'Corte na parede, passagem de conduíte e cabeamento elétrico novo derivado da rede para instalação de nova tomada.'),
('construction', 'Ponto Hidráulico Adicional', 70.00, 'ponto', ARRAY['encanador'], 'Derivação de tubulação PVC ou CPVC para criação de nova saída de água (torneira) ou expansão de esgoto.'),
('construction', 'Diária de Pedreiro', 350.00, 'dia', ARRAY['pedreiro'], 'Diária padrão de até 8 horas in loco para serviços variados de alvenaria e acabamento civil. EPIs próprios inclusos.'),
('construction', 'Diária de Ajudante', 150.00, 'dia', ARRAY['pedreiro'], 'Diária de servente para suporte operacional e carga/descarga de argamassas e materiais pesados no canteiro de obras.'),
('construction', 'Instalação de Janela', 200.00, 'unidade', ARRAY['acabamento'], 'Instalação no esquadro, fixação metálica e enchimento do quadro. Serviço cobrado por peça unificada instalada.'),
('construction', 'Impermeabilização de Laje', 80.00, 'm2', ARRAY['pedreiro'], 'Limpeza rigorosa e aplicação de manta líquida ou asfáltica para bloquear totalmente a infiltração por intempéries.')
ON CONFLICT DO NOTHING;

-- Tecnologia & Climatização
INSERT INTO public.template_services (category_id, name, default_price, unit, specialty_tags, description) VALUES
('tech', 'Instalação de Ar Condicionado Split', 600.00, 'unidade', ARRAY['ar_condicionado'], 'Furação da parede, travamento de suporte condensador/evaporador, clipagem de cobre (até 3 metros) e procedimento de carga com vácuo.'),
('tech', 'Higienização de Ar Condicionado', 220.00, 'unidade', ARRAY['ar_condicionado'], 'Lavagem pressurizada dos coletores evaporadores (bolsa coletora in-loco) e aplicação de bactericida para eliminação de fungos.'),
('tech', 'Formatação de Computador', 150.00, 'unidade', ARRAY['ti'], 'Backup preventivo (Até 50gb), Instalação limpa de Sistema Operacional de preferência e pacote Officer básico.'),
('tech', 'Visita Técnica', 120.00, 'visita', ARRAY['ti'], 'Deslocamento até o local e tempo analítico inical de até 1 hora destinado a descoberta de falhas ou dimensionamentos.'),
('tech', 'Troca de Tela de Notebook', 250.00, 'unidade', ARRAY['ti'], 'Abertura cuidadosa de chassi sem perder presilhas plásticas, desconexão de flat-cable, parafusamento e testagem. Apenas mão de obra.'),
('tech', 'Configuração de Rede Wi-Fi', 120.00, 'unidade', ARRAY['ti'], 'Parametrização do endereço lógico no modem (SSID, Senha OTP). Pode englobar criação de Vlans de visitantes ou ajuste de canais radiofrequencia.'),
('tech', 'Instalação de Tomada', 40.00, 'unidade', ARRAY['eletricista'], 'Fechamento de cabos normatizados e parafusamento de bastidores elétricos de acordo à norma NBR. Peça exclusiva de mão-de-obra.'),
('tech', 'Instalação de Chuveiro Elétrico', 90.00, 'unidade', ARRAY['eletricista'], 'Colocação com veda-rosca, fixação elétrica usando conectores de porcelana seguros e verificação de disjuntor de curva.'),
('tech', 'Troca de Disjuntor', 60.00, 'unidade', ARRAY['eletricista'], 'Identificação de curva e isolamento no quadro de distribuição, com remoção do defeituoso e ancoragem exata da fiação na nova proteção.'),
('tech', 'Instalação de Ventilador de Teto', 80.00, 'unidade', ARRAY['eletricista'], 'Fixação do motorização chumbada no forro, travamento de correntes, passagem do interruptor pela parede e fechamento capacitor.')
ON CONFLICT DO NOTHING;

-- Beleza & Estética
INSERT INTO public.template_services (category_id, name, default_price, unit, specialty_tags, description) VALUES
('beauty', 'Corte de Cabelo Feminino', 60.00, 'unidade', ARRAY['cabelo'], 'Lavagem relaxante pré e pós, modelagem técnica e corte assimétrico. Secagem de finalização está incluída no protocolo.'),
('beauty', 'Corte Masculino', 40.00, 'unidade', ARRAY['barbearia'], 'Máquina ou tesoura ajustado ao visagismo do cliente, mais finalização com pomada e assepsia fina no lavatório.'),
('beauty', 'Barba Completa', 35.00, 'unidade', ARRAY['barbearia'], 'Uso de Toalha Quente com ozonioterapia para abertura de folículos. Finalização na navalha com loção pós-shave perfumada.'),
('beauty', 'Escova Progressiva', 250.00, 'unidade', ARRAY['cabelo'], 'Banho completo quimicamente validado (ácidos e blend de vitaminas) finalizado com alisamento em chapinha e reposição hídrica.'),
('beauty', 'Manicure', 35.00, 'unidade', ARRAY['unhas'], 'Higienização, amaciante para cutículas esterilizadas. Lixamento nivelador, pintura com esmaltação comum e extra de brilho.'),
('beauty', 'Pedicure', 40.00, 'unidade', ARRAY['unhas'], 'Spa morno, remoção espessa e refinamento cuticular dos artelhos com segurança. Inclui massagem simples e pintura.'),
('beauty', 'Design de Sobrancelhas', 45.00, 'unidade', ARRAY['estetica'], 'Mapeamento facial técnico, depilação unificada na pinça/linha, respeitando volume e proporção. Opcional aplicação de henna pigmentada.'),
('beauty', 'Maquiagem para Eventos', 180.00, 'unidade', ARRAY['estetica'], 'Preparação blindada contra o suor. Olhos marcantes ou suaves fixados por setting-sprays focados na longevidade fotográfica da luz.'),
('beauty', 'Coloração de Cabelo', 150.00, 'unidade', ARRAY['cabelo'], 'Serviço global de cor usando tinturas ricas sem amônia se cabível, desde a raiz esticada às pontas sensíveis.'),
('beauty', 'Hidratação Capilar', 80.00, 'unidade', ARRAY['cabelo'], 'Protocolo vitamínico aplicado à cadeira com uso de vapores quentes com massageamento nutritivo no folículo capilar ressecado.')
ON CONFLICT DO NOTHING;

-- Produtos --

-- Automotivo
INSERT INTO public.template_products (category_id, name, default_price, unit, specialty_tags, description) VALUES
('auto', 'Óleo Motor 5W30', 60.00, 'litro', ARRAY['mecanica_geral'], 'Óleo Lubrificante 100% sintético classe SN (ex: Motul ou Mobil) para preservação agressiva da engrenagem do motor em alta quilometragem.'),
('auto', 'Filtro de Óleo', 40.00, 'unidade', ARRAY['mecanica_geral'], 'Filtro descartável blindado (Fram, Tecfil ou Original) feito para filtrar carbonizações finas até a próxima troca periódica.'),
('auto', 'Filtro de Ar', 45.00, 'unidade', ARRAY['mecanica_geral'], 'Papel celulose plissado responsável pela captação limpa de ar para a admissão. Melhora combustão e previne pó no motor.'),
('auto', 'Jogo de Pastilhas de Freio', 140.00, 'jogo', ARRAY['freios'], 'Composto organo-metálico de atrito. Jogo frontal completo (4 blocos) focado no desgaste macio sem emitir assobios estridentes.'),
('auto', 'Fluido de Freio DOT4', 35.00, 'frasco', ARRAY['freios'], 'Frasco 500ml sintético de alta ebulição. Responsável por tracionar hidráulicamente o sistema de tambores e ABS dos carros modernos.'),
('auto', 'Aditivo de Radiador', 40.00, 'litro', ARRAY['mecanica_geral'], 'Fluido de arrefecimento anticongelante e superaquecido enriquecido em inibidores orgânicos para zerar ferrugem.'),
('auto', 'Gás R134 (Ar Condicionado)', 120.00, 'lata', ARRAY['ar_condicionado'], 'Carga liquefeita homologada fluorcarbono que efetua a inversão climática severa dentro das serpentinas da cabine interna.')
ON CONFLICT DO NOTHING;

-- Construção
INSERT INTO public.template_products (category_id, name, default_price, unit, specialty_tags, description) VALUES
('construction', 'Cimento 50kg', 35.00, 'saco', ARRAY['pedreiro'], 'Aglutinante principal CP-II robusto para lajes, fundações ou chapisco geral em tijolos com secagem controlada.'),
('construction', 'Argamassa Cola 20kg', 32.00, 'saco', ARRAY['acabamento'], 'Massa ensacada tipo AC2 ou AC3 (interior e exterior) pronta pra piso sobre piso ou áreas grandes em uso residencial.'),
('construction', 'Tinta Látex 18L', 320.00, 'lata', ARRAY['pintor'], 'Balde 18 litros premium, ultra-resistente, lavável em até 2x, excelente rendimento de camada e não-queimadura uv ao sol.'),
('construction', 'Tomada Completa', 22.00, 'unidade', ARRAY['eletricista'], 'Peça tripla cega e espelho de encaixe com certificação INMETRO resistente a superaquecimento elétrico em amperagens usuais.'),
('construction', 'Fio 2.5mm', 4.00, 'metro', ARRAY['eletricista'], 'Condutor encordoado anti-chamas livre de metais pesados ideal para transpor circuitos fechados não-hibridos em painel Padrão.'),
('construction', 'Cano PVC 25mm', 8.00, 'metro', ARRAY['encanador'], 'Mangeira estanque e escoa sanitária para rede pluvial ou água limpa testada na injeção rígida.')
ON CONFLICT DO NOTHING;

