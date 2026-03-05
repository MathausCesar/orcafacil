-- Add cash_discount_type and cash_discount_fixed to quotes table
ALTER TABLE quotes 
ADD COLUMN cash_discount_type text DEFAULT 'percent',
ADD COLUMN cash_discount_fixed numeric DEFAULT 0;
