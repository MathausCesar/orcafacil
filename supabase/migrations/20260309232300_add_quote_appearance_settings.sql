-- Adiciona campos para o novo motor de layout de propostas e paywall

ALTER TABLE profiles
ADD COLUMN quote_font_family text,
ADD COLUMN quote_has_cover boolean DEFAULT false,
ADD COLUMN quote_cover_image_url text,
ADD COLUMN quote_presentation_text text;
