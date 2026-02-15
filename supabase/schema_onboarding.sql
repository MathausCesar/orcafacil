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

-- 2. Services (Based on Research)

-- Automotivo
-- Automotivo (Padrão de Mercado)
INSERT INTO public.template_services (category_id, name, default_price, unit, specialty_tags) VALUES
('auto', 'Troca de Óleo e Filtro (Mão de Obra)', 60.00, 'unidade', ARRAY['mecanica_geral']),
('auto', 'Alinhamento e Balanceamento', 120.00, 'unidade', ARRAY['mecanica_geral', 'pneus']),
('auto', 'Troca de Pastilhas de Freio (Dianteiro)', 100.00, 'unidade', ARRAY['mecanica_geral', 'freios']),
('auto', 'Diagnóstico com Scanner', 80.00, 'unidade', ARRAY['eletrica', 'injecao']),
('auto', 'Limpeza de Bicos Injetores', 150.00, 'unidade', ARRAY['mecanica_geral', 'injecao']),
('auto', 'Troca de Embreagem', 350.00, 'unidade', ARRAY['mecanica_geral']),
('auto', 'Revisão de Freios Completa', 180.00, 'unidade', ARRAY['freios']),
('auto', 'Carga de Gás Ar Condicionado', 200.00, 'unidade', ARRAY['ar_condicionado']),
('auto', 'Instalação de Som/Multimídia', 150.00, 'unidade', ARRAY['eletrica', 'som']),
('auto', 'Polimento Comercial', 250.00, 'unidade', ARRAY['estetica', 'funilaria']),
('auto', 'Lavagem Completa', 60.00, 'unidade', ARRAY['estetica']);

-- Construção & Reformas (Padrão de Mercado)
INSERT INTO public.template_services (category_id, name, default_price, unit, specialty_tags) VALUES
('construction', 'Assentamento de Piso Cerâmico', 50.00, 'm2', ARRAY['pedreiro', 'acabamento']),
('construction', 'Assentamento de Porcelanato', 80.00, 'm2', ARRAY['pedreiro', 'acabamento']),
('construction', 'Reboco de Parede', 45.00, 'm2', ARRAY['pedreiro']),
('construction', 'Contrapiso', 35.00, 'm2', ARRAY['pedreiro']),
('construction', 'Pintura Látex (Parede/Teto)', 35.00, 'm2', ARRAY['pintor']),
('construction', 'Instalação de Porta/Janela', 150.00, 'unidade', ARRAY['pedreiro', 'acabamento']),
('construction', 'Ponto Elétrico (Instalação)', 50.00, 'pontos', ARRAY['eletricista']),
('construction', 'Ponto Hidráulico (Instalação)', 60.00, 'pontos', ARRAY['encanador']),
('construction', 'Diária de Pedreiro Profissional', 350.00, 'dia', ARRAY['pedreiro']),
('construction', 'Diária de Ajudante', 150.00, 'dia', ARRAY['pedreiro']);

-- Tecnologia & Climatização (Padrão de Mercado)
INSERT INTO public.template_services (category_id, name, default_price, unit, specialty_tags) VALUES
('tech', 'Instalação Ar Split (9000/12000 BTUs)', 550.00, 'unidade', ARRAY['ar_condicionado']),
('tech', 'Limpeza/Higienização Ar Split', 200.00, 'unidade', ARRAY['ar_condicionado']),
('tech', 'Formatação de Computador/Notebook', 150.00, 'unidade', ARRAY['ti']),
('tech', 'Visita Técnica (Diagnóstico)', 120.00, 'visita', ARRAY['ti', 'eletricista', 'ar_condicionado']),
('tech', 'Troca de Tela Notebook (Mão de Obra)', 180.00, 'unidade', ARRAY['ti']),
('tech', 'Configuração de Roteador/Wi-Fi', 100.00, 'unidade', ARRAY['ti']),
('tech', 'Instalação de Tomada/Interruptor', 35.00, 'unidade', ARRAY['eletricista']),
('tech', 'Instalação de Chuveiro Elétrico', 80.00, 'unidade', ARRAY['eletricista']);

-- Beleza & Estética (Padrão de Mercado)
INSERT INTO public.template_services (category_id, name, default_price, unit, specialty_tags) VALUES
('beauty', 'Corte de Cabelo Feminino', 60.00, 'unidade', ARRAY['cabelo']),
('beauty', 'Corte Masculino', 40.00, 'unidade', ARRAY['barbearia']),
('beauty', 'Barba Simples', 35.00, 'unidade', ARRAY['barbearia']),
('beauty', 'Escova com Lavagem', 50.00, 'unidade', ARRAY['cabelo']),
('beauty', 'Escova Progressiva', 200.00, 'unidade', ARRAY['cabelo']),
('beauty', 'Manicure (Mão)', 35.00, 'unidade', ARRAY['unhas']),
('beauty', 'Pedicure (Pé)', 35.00, 'unidade', ARRAY['unhas']),
('beauty', 'Design de Sobrancelhas', 40.00, 'unidade', ARRAY['estetica']),
('beauty', 'Maquiagem Social', 150.00, 'unidade', ARRAY['estetica']);

-- Produtos --

-- Automotivo Peças e Fluidos
INSERT INTO public.template_products (category_id, name, default_price, unit, specialty_tags) VALUES
('auto', 'Óleo Motor 5W30 Sintético', 55.00, 'litro', ARRAY['mecanica_geral']),
('auto', 'Óleo Motor 15W40 Semissintético', 40.00, 'litro', ARRAY['mecanica_geral']),
('auto', 'Filtro de Óleo', 35.00, 'unidade', ARRAY['mecanica_geral']),
('auto', 'Filtro de Ar Motor', 40.00, 'unidade', ARRAY['mecanica_geral']),
('auto', 'Filtro de Cabine (Ar Condicionado)', 45.00, 'unidade', ARRAY['ar_condicionado']),
('auto', 'Jogo de Pastilhas de Freio', 120.00, 'jogo', ARRAY['freios']),
('auto', 'Fluido de Freio DOT4', 30.00, 'frasco', ARRAY['freios']),
('auto', 'Aditivo de Radiador', 35.00, 'litro', ARRAY['mecanica_geral']);

-- Construção Materiais Básicos
INSERT INTO public.template_products (category_id, name, default_price, unit, specialty_tags) VALUES
('construction', 'Saco de Cimento (50kg)', 35.00, 'saco', ARRAY['pedreiro']),
('construction', 'Argamassa Cola Piso (20kg)', 30.00, 'saco', ARRAY['acabamento']),
('construction', 'Lata de Tinta (18L) Standard', 300.00, 'lata', ARRAY['pintor']),
('construction', 'Kit Tomada Completo', 20.00, 'unidade', ARRAY['eletricista']),
('construction', 'Fio Flexível 2.5mm', 3.50, 'metro', ARRAY['eletricista']);

