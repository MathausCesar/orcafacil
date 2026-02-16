-- Add 'Alimentos & Buffet' Category
INSERT INTO public.template_categories (id, name, icon, slug) VALUES
('food', 'Alimentos & Buffet', 'utensils', 'food')
ON CONFLICT (id) DO NOTHING;

-- Services for Food/Catering
INSERT INTO public.template_services (category_id, name, default_price, unit, specialty_tags) VALUES
('food', 'Cento de Salgados (Frito)', 120.00, 'cento', ARRAY['salgados']),
('food', 'Cento de Salgados (Congelado)', 90.00, 'cento', ARRAY['salgados']),
('food', 'Cento de Docinhos Tradicionais', 140.00, 'cento', ARRAY['confeitaria']),
('food', 'Cento de Doces Finos', 220.00, 'cento', ARRAY['confeitaria']),
('food', 'Bolo de Pote', 15.00, 'unidade', ARRAY['confeitaria']),
('food', 'Bolo Decorado (Personalizado)', 85.00, 'kg', ARRAY['confeitaria']),
('food', 'Buffet Completo (Churrasco)', 80.00, 'pessoa', ARRAY['buffet']),
('food', 'Buffet Coquetel', 60.00, 'pessoa', ARRAY['buffet']),
('food', 'Garçom (Diária 4h)', 150.00, 'diaria', ARRAY['servicos']),
('food', 'Copeira (Diária 4h)', 120.00, 'diaria', ARRAY['servicos']),
('food', 'Taxa de Entrega', 20.00, 'bairro', ARRAY['servicos']),
('food', 'Decoração de Mesa Principal', 350.00, 'unidade', ARRAY['decoracao'])
ON CONFLICT DO NOTHING;

-- Products for Food/Catering
INSERT INTO public.template_products (category_id, name, default_price, unit, specialty_tags) VALUES
('food', 'Refrigerante 2L', 12.00, 'unidade', ARRAY['bebidas']),
('food', 'Água Mineral 500ml', 4.00, 'unidade', ARRAY['bebidas']),
('food', 'Suco Natural 1L', 25.00, 'litro', ARRAY['bebidas']),
('food', 'Kit Descartáveis (Prato/Garfo/Copo)', 2.50, 'kit_pessoa', ARRAY['descartaveis']),
('food', 'Gelo (Saco 5kg)', 15.00, 'saco', ARRAY['bebidas'])
ON CONFLICT DO NOTHING;
