-- Add professional fields to quotes table
alter table quotes 
add column if not exists expiration_date date,
add column if not exists payment_terms text,
add column if not exists notes text,
add column if not exists discount numeric default 0;

-- Optional: Add status constraints if not present
-- alter table quotes add constraint valid_status check (status in ('draft', 'sent', 'accepted', 'rejected', 'expired'));
