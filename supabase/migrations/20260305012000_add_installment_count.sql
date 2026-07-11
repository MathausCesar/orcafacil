-- Migration: Add installment count field for installment payment option
-- Allows users to specify number of installments

-- Add installment count field
alter table quotes
  add column if not exists installment_count integer;

-- Add comment for documentation
comment on column quotes.installment_count is 'Número de parcelas (quando parcelamento estiver habilitado)';

-- Create index for queries filtering by installment
create index if not exists idx_quotes_installment_count on quotes(installment_count) where installment_count is not null;
