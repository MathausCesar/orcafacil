alter table public.quotes
add column if not exists experience_mode text not null default 'free_simple';

alter table public.quotes
drop constraint if exists quotes_experience_mode_check;

alter table public.quotes
add constraint quotes_experience_mode_check
check (experience_mode in ('free_simple', 'pro_sample', 'pro'));

create index if not exists idx_quotes_organization_experience_mode
on public.quotes (organization_id, experience_mode, created_at);
