-- Migration: Add customizable timeline and payment fields to quotes
-- These fields allow users to customize what appears in each quote

-- Add timeline and payment customization fields
alter table quotes
  add column if not exists estimated_days integer,
  add column if not exists payment_methods text[], -- Array of payment methods: pix, cash, card, installment
  add column if not exists cash_discount_percent integer default 0,
  add column if not exists show_timeline boolean default false,
  add column if not exists show_payment_options boolean default false;

-- Add comments for documentation
comment on column quotes.estimated_days is 'Dias estimados para execução do serviço (opcional)';
comment on column quotes.payment_methods is 'Formas de pagamento aceitas (pix, cash, card, installment)';
comment on column quotes.cash_discount_percent is 'Percentual de desconto para pagamento à vista (0-100)';
comment on column quotes.show_timeline is 'Exibir cronograma de execução no orçamento';
comment on column quotes.show_payment_options is 'Exibir formas de pagamento no orçamento';

-- Create index for better query performance
create index if not exists idx_quotes_show_timeline on quotes(show_timeline) where show_timeline = true;
create index if not exists idx_quotes_show_payment on quotes(show_payment_options) where show_payment_options = true;
