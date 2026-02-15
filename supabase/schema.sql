-- Create a table for public profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  business_name text,
  phone text,
  primary_color text default '#2563eb',
  logo_url text,

  constraint business_name_length check (char_length(business_name) >= 3)
);

-- Set up Row Level Security (RLS)
-- See https://supabase.com/docs/guides/auth/row-level-security for more details.
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check ((select auth.uid()) = id);

create policy "Users can update own profile." on profiles
  for update using ((select auth.uid()) = id);

-- Set up Storage!
insert into storage.buckets (id, name)
values ('logos', 'logos');

create policy "Logo images are publicly accessible." on storage.objects
  for select using (bucket_id = 'logos');

create policy "Anyone can upload an avatar." on storage.objects
  for insert with check (bucket_id = 'logos');
