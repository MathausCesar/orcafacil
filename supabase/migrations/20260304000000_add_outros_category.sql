-- Add 'Outros' category to template_categories
INSERT INTO template_categories (id, name, slug, icon) 
VALUES ('outros', 'Outros', 'outros', 'briefcase')
ON CONFLICT (id) DO NOTHING;
