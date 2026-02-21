-- Criação da tabela de pastas para organizar os itens do catálogo
create table if not exists public.item_folders (
    id uuid default gen_random_uuid() primary key,
    user_id uuid not null references auth.users(id) on delete cascade,
    name text not null,
    color text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Configurando RLS para item_folders
alter table public.item_folders enable row level security;

create policy "Users can view their own folders"
    on public.item_folders for select
    using (auth.uid() = user_id);

create policy "Users can insert their own folders"
    on public.item_folders for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own folders"
    on public.item_folders for update
    using (auth.uid() = user_id);

create policy "Users can delete their own folders"
    on public.item_folders for delete
    using (auth.uid() = user_id);

-- Adicionando novos campos à tabela de serviços (catálogo)
alter table public.services
    add column if not exists type text default 'service' check (type in ('service', 'product')),
    add column if not exists details text,
    add column if not exists folder_id uuid references public.item_folders(id) on delete set null;

-- Índices para melhor performance
create index if not exists idx_item_folders_user_id on public.item_folders(user_id);
create index if not exists idx_services_folder_id on public.services(folder_id);
create index if not exists idx_services_type on public.services(type);

-- Atualizar metadados dos serviços para suportar RL melhor caso necessário no futuro
-- E garantir que serviços órfãos cujo folder foi apagado simplesmente fiquem "soltos" (on delete set null)
