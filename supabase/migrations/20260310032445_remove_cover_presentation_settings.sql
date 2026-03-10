-- Remove the quote cover and presentation features added in 20260309232300_add_quote_appearance_settings.sql

ALTER TABLE profiles
DROP COLUMN IF EXISTS quote_has_cover,
DROP COLUMN IF EXISTS quote_cover_image_url,
DROP COLUMN IF EXISTS quote_presentation_text;
