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
INSERT INTO public.template_services (category_id, name, default_price, unit, specialty_tags) VALUES
('auto', 'Troca de Óleo e Filtro', 80.00, 'unidade', ARRAY['mecanica_geral']),
('auto', 'Alinhamento e Balanceamento', 120.00, 'unidade', ARRAY['pneus']),
('auto', 'Troca de Pastilhas de Freio', 150.00, 'unidade', ARRAY['freios']),
('auto', 'Diagnóstico Eletrônico', 100.00, 'unidade', ARRAY['eletrica']),
('auto', 'Limpeza de Bicos Injetores', 180.00, 'unidade', ARRAY['injecao']),
('auto', 'Troca de Embreagem Completa', 450.00, 'unidade', ARRAY['mecanica_geral']),
('auto', 'Carga de Gás do Ar Condicionado', 250.00, 'unidade', ARRAY['ar_condicionado']),
('auto', 'Instalação de Som Automotivo', 200.00, 'unidade', ARRAY['som']),
('auto', 'Polimento Automotivo', 300.00, 'unidade', ARRAY['estetica']),
('auto', 'Lavagem Completa + Enceramento', 80.00, 'unidade', ARRAY['estetica'])
ON CONFLICT DO NOTHING;

-- Construção & Reformas
INSERT INTO public.template_services (category_id, name, default_price, unit, specialty_tags) VALUES
('construction', 'Assentamento de Piso Cerâmico', 50.00, 'm2', ARRAY['acabamento']),
('construction', 'Reboco de Parede', 45.00, 'm2', ARRAY['pedreiro']),
('construction', 'Pintura Látex (Parede)', 35.00, 'm2', ARRAY['pintor']),
('construction', 'Instalação de Porta', 180.00, 'unidade', ARRAY['acabamento']),
('construction', 'Ponto Elétrico Adicional', 60.00, 'ponto', ARRAY['eletricista']),
('construction', 'Ponto Hidráulico Adicional', 70.00, 'ponto', ARRAY['encanador']),
('construction', 'Diária de Pedreiro', 350.00, 'dia', ARRAY['pedreiro']),
('construction', 'Diária de Ajudante', 150.00, 'dia', ARRAY['pedreiro']),
('construction', 'Instalação de Janela', 200.00, 'unidade', ARRAY['acabamento']),
('construction', 'Impermeabilização de Laje', 80.00, 'm2', ARRAY['pedreiro'])
ON CONFLICT DO NOTHING;

-- Tecnologia & Climatização
INSERT INTO public.template_services (category_id, name, default_price, unit, specialty_tags) VALUES
('tech', 'Instalação de Ar Condicionado Split', 600.00, 'unidade', ARRAY['ar_condicionado']),
('tech', 'Higienização de Ar Condicionado', 220.00, 'unidade', ARRAY['ar_condicionado']),
('tech', 'Formatação de Computador', 150.00, 'unidade', ARRAY['ti']),
('tech', 'Visita Técnica', 120.00, 'visita', ARRAY['ti']),
('tech', 'Troca de Tela de Notebook', 250.00, 'unidade', ARRAY['ti']),
('tech', 'Configuração de Rede Wi-Fi', 120.00, 'unidade', ARRAY['ti']),
('tech', 'Instalação de Tomada', 40.00, 'unidade', ARRAY['eletricista']),
('tech', 'Instalação de Chuveiro Elétrico', 90.00, 'unidade', ARRAY['eletricista']),
('tech', 'Troca de Disjuntor', 60.00, 'unidade', ARRAY['eletricista']),
('tech', 'Instalação de Ventilador de Teto', 80.00, 'unidade', ARRAY['eletricista'])
ON CONFLICT DO NOTHING;

-- Beleza & Estética
INSERT INTO public.template_services (category_id, name, default_price, unit, specialty_tags) VALUES
('beauty', 'Corte de Cabelo Feminino', 60.00, 'unidade', ARRAY['cabelo']),
('beauty', 'Corte Masculino', 40.00, 'unidade', ARRAY['barbearia']),
('beauty', 'Barba Completa', 35.00, 'unidade', ARRAY['barbearia']),
('beauty', 'Escova Progressiva', 250.00, 'unidade', ARRAY['cabelo']),
('beauty', 'Manicure', 35.00, 'unidade', ARRAY['unhas']),
('beauty', 'Pedicure', 40.00, 'unidade', ARRAY['unhas']),
('beauty', 'Design de Sobrancelhas', 45.00, 'unidade', ARRAY['estetica']),
('beauty', 'Maquiagem para Eventos', 180.00, 'unidade', ARRAY['estetica']),
('beauty', 'Coloração de Cabelo', 150.00, 'unidade', ARRAY['cabelo']),
('beauty', 'Hidratação Capilar', 80.00, 'unidade', ARRAY['cabelo'])
ON CONFLICT DO NOTHING;

-- Produtos --

-- Automotivo
INSERT INTO public.template_products (category_id, name, default_price, unit, specialty_tags) VALUES
('auto', 'Óleo Motor 5W30', 60.00, 'litro', ARRAY['mecanica_geral']),
('auto', 'Filtro de Óleo', 40.00, 'unidade', ARRAY['mecanica_geral']),
('auto', 'Filtro de Ar', 45.00, 'unidade', ARRAY['mecanica_geral']),
('auto', 'Jogo de Pastilhas de Freio', 140.00, 'jogo', ARRAY['freios']),
('auto', 'Fluido de Freio DOT4', 35.00, 'frasco', ARRAY['freios']),
('auto', 'Aditivo de Radiador', 40.00, 'litro', ARRAY['mecanica_geral']),
('auto', 'Gás R134 (Ar Condicionado)', 120.00, 'lata', ARRAY['ar_condicionado'])
ON CONFLICT DO NOTHING;

-- Construção
INSERT INTO public.template_products (category_id, name, default_price, unit, specialty_tags) VALUES
('construction', 'Cimento 50kg', 35.00, 'saco', ARRAY['pedreiro']),
('construction', 'Argamassa Cola 20kg', 32.00, 'saco', ARRAY['acabamento']),
('construction', 'Tinta Látex 18L', 320.00, 'lata', ARRAY['pintor']),
('construction', 'Tomada Completa', 22.00, 'unidade', ARRAY['eletricista']),
('construction', 'Fio 2.5mm', 4.00, 'metro', ARRAY['eletricista']),
('construction', 'Cano PVC 25mm', 8.00, 'metro', ARRAY['encanador'])
ON CONFLICT DO NOTHING;

