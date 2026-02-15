-- Clients Table
create table clients (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  phone text,
  email text,
  address text,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- RLS for Clients
alter table clients enable row level security;

create policy "Users can view own clients." on clients
  for select using (auth.uid() = user_id);

create policy "Users can insert own clients." on clients
  for insert with check (auth.uid() = user_id);

create policy "Users can update own clients." on clients
  for update using (auth.uid() = user_id);

create policy "Users can delete own clients." on clients
  for delete using (auth.uid() = user_id);

-- Add indexes
create index clients_user_id_idx on clients(user_id);
create index clients_name_idx on clients(name);
