-- Cria a função para verificar se um email já está registrado na tabela de usuários do Supabase.
-- Por segurança, ela roda com privilégios de definidor (SECURITY DEFINER) para poder ler a tabela auth.users.
-- Retorna true se o email existir, false caso contrário.

create or replace function public.check_email_exists(email_to_check text)
returns boolean
language plpgsql
security definer set search_path = public, auth
as $$
declare
  email_exists boolean;
begin
  select exists (
    select 1
    from auth.users
    where email = email_to_check
  ) into email_exists;

  return email_exists;
end;
$$;

-- Revoga a execução pública por padrão para segurança, e concede apenas a chamadas autenticadas ou anônimas (via client/server action)
revoke execute on function public.check_email_exists(text) from public;
grant execute on function public.check_email_exists(text) to authenticated, anon;
