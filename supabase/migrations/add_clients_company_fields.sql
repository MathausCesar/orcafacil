-- Migration: Add company and person type fields to clients table
-- This enables better profile detection for corporate vs personal clients

-- Add new columns to clients table
alter table clients
  add column if not exists company_name text,
  add column if not exists person_type text default 'pf' check (person_type in ('pf', 'pj'));

-- Add comments for documentation
comment on column clients.company_name is 'Razão social do cliente (para PJ)';
comment on column clients.person_type is 'Tipo de pessoa: pf (física) ou pj (jurídica)';

-- Create index for better query performance
create index if not exists idx_clients_person_type on clients(person_type);
create index if not exists idx_clients_company_name on clients(company_name) where company_name is not null;
