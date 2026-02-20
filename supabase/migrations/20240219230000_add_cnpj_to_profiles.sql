-- Migration to add CNPJ column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cnpj TEXT;
