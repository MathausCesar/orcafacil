-- Migration: Add company and person type fields to quotes table
-- This enables better profile detection for corporate vs personal clients

-- Add new columns to quotes table
alter table quotes
  add column if not exists client_company_name text,
  add column if not exists client_type text default 'pf' check (client_type in ('pf', 'pj'));

-- Add comments for documentation
comment on column quotes.client_company_name is 'Razão social do cliente (para PJ)';
comment on column quotes.client_type is 'Tipo de pessoa: pf (física) ou pj (jurídica)';

-- Create index for better query performance
create index if not exists idx_quotes_client_type on quotes(client_type);
create index if not exists idx_quotes_client_company_name on quotes(client_company_name) where client_company_name is not null;
