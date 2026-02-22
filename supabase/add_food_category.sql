-- Add 'Alimentos & Buffet' Category
INSERT INTO public.template_categories (id, name, icon, slug) VALUES
('food', 'Alimentos & Buffet', 'utensils', 'food')
ON CONFLICT (id) DO NOTHING;

-- Services for Food/Catering
INSERT INTO public.template_services (category_id, name, default_price, unit, specialty_tags, description) VALUES
('food', 'Cento de Salgados (Frito)', 120.00, 'cento', ARRAY['salgados'], 'Salgados fritos na hora (coxinhas, rissoles, bolinhas de queijo, etc.).'),
('food', 'Cento de Salgados (Congelado)', 90.00, 'cento', ARRAY['salgados'], 'Salgados prontos para fritar ou assar, armazenados em refrigeração adequada.'),
('food', 'Cento de Docinhos Tradicionais', 140.00, 'cento', ARRAY['confeitaria'], 'Docinhos clássicos de festa como brigadeiro e beijinho, entregues na forminha.'),
('food', 'Cento de Doces Finos', 220.00, 'cento', ARRAY['confeitaria'], 'Doces artesanais elaborados com acabamento premium para casamentos e grandes eventos.'),
('food', 'Bolo de Pote', 15.00, 'unidade', ARRAY['confeitaria'], 'Porção individual de bolo com recheios cremosos servido em pote prático.'),
('food', 'Bolo Decorado (Personalizado)', 85.00, 'kg', ARRAY['confeitaria'], 'Bolo de festa com massa, recheio e blindagem temática personalizada pelo cliente.'),
('food', 'Buffet Completo (Churrasco)', 80.00, 'pessoa', ARRAY['buffet'], 'Serviço completo de churrasco profissional englobando as carnes bovinas/suínas, além de guarnições como farofa e vinagrete.'),
('food', 'Buffet Coquetel', 60.00, 'pessoa', ARRAY['buffet'], 'Cardápio volante focado em petiscos finger foods, empratadinhos e bebidas geladas.'),
('food', 'Garçom (Diária 4h)', 150.00, 'diaria', ARRAY['servicos'], 'Atendente uniformizado destinado a circular no salão para servir bebidas e saladas/entradas.'),
('food', 'Copeira (Diária 4h)', 120.00, 'diaria', ARRAY['servicos'], 'Profissional dedicada para esquentar comidas, lavar e repor as taças, louças e preparar o café da finalização.'),
('food', 'Taxa de Entrega', 20.00, 'bairro', ARRAY['servicos'], 'Custo fixo logístico para entrega pontual na temperatura correta direto no local do evento.'),
('food', 'Decoração de Mesa Principal', 350.00, 'unidade', ARRAY['decoracao'], 'Arranjo com bolo fake, balões modulares e painel decorativo montado com forração própria.')
ON CONFLICT DO NOTHING;

-- Products for Food/Catering
INSERT INTO public.template_products (category_id, name, default_price, unit, specialty_tags, description) VALUES
('food', 'Refrigerante 2L', 12.00, 'unidade', ARRAY['bebidas'], 'Garrafa pet de 2 Litros das marcas líderes (Coca-Cola, Guaraná Antarctica), entregues gelados.'),
('food', 'Água Mineral 500ml', 4.00, 'unidade', ARRAY['bebidas'], 'Garrafinha tipo copinho ou pet de 500ml de água mineral, podendo optar com ou sem gás.'),
('food', 'Suco Natural 1L', 25.00, 'litro', ARRAY['bebidas'], 'Jarra de Suco 100% fruta concentrado, sem corantes e livre de conservadores pesados.'),
('food', 'Kit Descartáveis (Prato/Garfo/Copo)', 2.50, 'kit_pessoa', ARRAY['descartaveis'], 'Prato de refeição plástico resistente, talheres e copos acrílicos descartáveis, orçados por convidado.'),
('food', 'Gelo (Saco 5kg)', 15.00, 'saco', ARRAY['bebidas'], 'Pacote em cubos de gelo puro tratado, perfeito para encher coolers ou utilizar nos coquetéis.')
ON CONFLICT DO NOTHING;
