-- Quotes Table
create table quotes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  client_name text not null,
  client_phone text,
  status text default 'draft', -- draft, sent, approved, rejected
  total numeric default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Quote Items Table
create table quote_items (
  id uuid default gen_random_uuid() primary key,
  quote_id uuid references quotes on delete cascade not null,
  description text not null,
  quantity numeric default 1,
  unit_price numeric default 0,
  total_price numeric generated always as (quantity * unit_price) stored
);

-- RLS for Quotes
alter table quotes enable row level security;

create policy "Users can view own quotes." on quotes
  for select using (auth.uid() = user_id);

create policy "Users can insert own quotes." on quotes
  for insert with check (auth.uid() = user_id);

create policy "Users can update own quotes." on quotes
  for update using (auth.uid() = user_id);

-- RLS for Quote Items
alter table quote_items enable row level security;

create policy "Users can view items of own quotes." on quote_items
  for select using (
    exists ( select 1 from quotes where id = quote_items.quote_id and user_id = auth.uid() )
  );

create policy "Users can insert items to own quotes." on quote_items
  for insert with check (
    exists ( select 1 from quotes where id = quote_items.quote_id and user_id = auth.uid() )
  );
