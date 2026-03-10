ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_layout_style_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_layout_style_check CHECK (layout_style IN ('modern', 'professional', 'classic', 'minimalist', 'agency', 'impact'));

-- Just in case the quotes table has it too
ALTER TABLE quotes DROP CONSTRAINT IF EXISTS quotes_layout_style_check;
ALTER TABLE quotes ADD CONSTRAINT quotes_layout_style_check CHECK (layout_style IN ('modern', 'professional', 'classic', 'minimalist', 'agency', 'impact'));
