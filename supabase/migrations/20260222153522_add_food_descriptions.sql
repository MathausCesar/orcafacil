-- Atualiza as descrições da tabela template_services para a categoria Alimentos & Buffet
UPDATE public.template_services SET description = 'Salgados fritos na hora (coxinhas, rissoles, bolinhas de queijo, etc.).' WHERE name = 'Cento de Salgados (Frito)' AND category_id = 'food';
UPDATE public.template_services SET description = 'Salgados prontos para fritar ou assar, armazenados em refrigeração adequada.' WHERE name = 'Cento de Salgados (Congelado)' AND category_id = 'food';
UPDATE public.template_services SET description = 'Docinhos clássicos de festa como brigadeiro e beijinho, entregues na forminha.' WHERE name = 'Cento de Docinhos Tradicionais' AND category_id = 'food';
UPDATE public.template_services SET description = 'Doces artesanais elaborados com acabamento premium para casamentos e grandes eventos.' WHERE name = 'Cento de Doces Finos' AND category_id = 'food';
UPDATE public.template_services SET description = 'Porção individual de bolo com recheios cremosos servido em pote prático.' WHERE name = 'Bolo de Pote' AND category_id = 'food';
UPDATE public.template_services SET description = 'Bolo de festa com massa, recheio e blindagem temática personalizada pelo cliente.' WHERE name = 'Bolo Decorado (Personalizado)' AND category_id = 'food';
UPDATE public.template_services SET description = 'Serviço completo de churrasco profissional englobando as carnes bovinas/suínas, além de guarnições como farofa e vinagrete.' WHERE name = 'Buffet Completo (Churrasco)' AND category_id = 'food';
UPDATE public.template_services SET description = 'Cardápio volante focado em petiscos finger foods, empratadinhos e bebidas geladas.' WHERE name = 'Buffet Coquetel' AND category_id = 'food';
UPDATE public.template_services SET description = 'Atendente uniformizado destinado a circular no salão para servir bebidas e saladas/entradas.' WHERE name = 'Garçom (Diária 4h)' AND category_id = 'food';
UPDATE public.template_services SET description = 'Profissional dedicada para esquentar comidas, lavar e repor as taças, louças e preparar o café da finalização.' WHERE name = 'Copeira (Diária 4h)' AND category_id = 'food';
UPDATE public.template_services SET description = 'Custo fixo logístico para entrega pontual na temperatura correta direto no local do evento.' WHERE name = 'Taxa de Entrega' AND category_id = 'food';
UPDATE public.template_services SET description = 'Arranjo com bolo fake, balões modulares e painel decorativo montado com forração própria.' WHERE name = 'Decoração de Mesa Principal' AND category_id = 'food';

-- Atualiza as descrições da tabela template_products para a categoria Alimentos & Buffet
UPDATE public.template_products SET description = 'Garrafa pet de 2 Litros das marcas líderes (Coca-Cola, Guaraná Antarctica), entregues gelados.' WHERE name = 'Refrigerante 2L' AND category_id = 'food';
UPDATE public.template_products SET description = 'Garrafinha tipo copinho ou pet de 500ml de água mineral, podendo optar com ou sem gás.' WHERE name = 'Água Mineral 500ml' AND category_id = 'food';
UPDATE public.template_products SET description = 'Jarra de Suco 100% fruta concentrado, sem corantes e livre de conservadores pesados.' WHERE name = 'Suco Natural 1L' AND category_id = 'food';
UPDATE public.template_products SET description = 'Prato de refeição plástico resistente, talheres e copos acrílicos descartáveis, orçados por convidado.' WHERE name = 'Kit Descartáveis (Prato/Garfo/Copo)' AND category_id = 'food';
UPDATE public.template_products SET description = 'Pacote em cubos de gelo puro tratado, perfeito para encher coolers ou utilizar nos coquetéis.' WHERE name = 'Gelo (Saco 5kg)' AND category_id = 'food';
