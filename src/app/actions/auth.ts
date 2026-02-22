'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: 'Credenciais inválidas.' }
    }

    revalidatePath('/', 'layout')
    return { success: true, redirect: '/' }
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    // 1. Verificar proativamente se o e-mail já existe contornando a prevenção de enumeração
    const { data: emailExists, error: rpcError } = await supabase.rpc('check_email_exists', {
        email_to_check: email
    })

    if (rpcError) {
        console.error('Erro na verificação de email:', rpcError)
        return { error: 'Ocorreu um erro ao validar seus dados.' }
    }

    if (emailExists) {
        return { error: 'Este e-mail já está cadastrado em nossa base.' }
    }

    // 2. Cria conta caso o email não exista.
    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        },
    })

    if (error) {
        return { error: error.message }
    }

    return { success: true }
}

export async function signout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
}

export async function requestPasswordReset(formData: FormData) {
    const supabase = await createClient()
    const email = formData.get('email') as string

    if (!email) return { error: 'O email é obrigatório.' }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/update-password`,
    })

    if (error) {
        return { error: error.message }
    }

    return { success: true }
}

export async function updatePassword(formData: FormData) {
    const supabase = await createClient()
    const password = formData.get('password') as string

    if (!password || password.length < 6) return { error: 'A nova senha deve ter no mínimo 6 caracteres.' }

    const { error } = await supabase.auth.updateUser({
        password: password
    })

    if (error) {
        return { error: error.message }
    }

    return { success: true }
}
