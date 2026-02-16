-- Script para deletar TODOS os usuários e seus dados
-- ⚠️ ATENÇÃO: Isso é IRREVERSÍVEL! Use com extremo cuidado!

-- IMPORTANTE: Este script precisa ser executado com privilégios de service_role
-- Para executar: cat supabase\reset_users.sql | npx supabase db execute

-- Opção 1: Deletar apenas dados públicos (mantém usuários do auth)
-- DELETE FROM public.quotes;
-- DELETE FROM public.services;
-- DELETE FROM public.clients;
-- DELETE FROM public.profiles;

-- Opção 2: Deletar usuários do auth (isso remove TUDO em cascata)
-- ATENÇÃO: Isso deleta os usuários e automaticamente remove profiles, clients, services, quotes
DELETE FROM auth.users;

-- Após executar, todos os usuários precisarão se cadastrar novamente
-- As tabelas template_categories, template_services, template_products permanecem intactas

