'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAppBaseUrl } from '@/lib/app-url'

export async function login(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: 'Credenciais invalidas.' }
    }

    revalidatePath('/', 'layout')
    return { success: true, redirect: '/' }
}

export async function signInWithGoogle() {
    const supabase = await createClient()
    const appBaseUrl = getAppBaseUrl()
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${appBaseUrl}/app/auth/callback`,
        },
    })

    if (error) {
        return { error: error.message }
    }

    if (data.url) {
        redirect(data.url)
    }
}

export async function signup(formData: FormData) {
    const supabase = await createClient()
    const appBaseUrl = getAppBaseUrl()

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${appBaseUrl}/app/auth/callback`,
        },
    })

    if (error) {
        console.error('Signup failed:', error)
        return { error: 'Nao foi possivel concluir o cadastro. Confira os dados e tente novamente.' }
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
    const appBaseUrl = getAppBaseUrl()
    const email = formData.get('email') as string

    if (!email) return { error: 'O email e obrigatorio.' }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${appBaseUrl}/app/auth/callback?next=/update-password`,
    })

    if (error) {
        return { error: error.message }
    }

    return { success: true }
}

export async function updatePassword(formData: FormData) {
    const supabase = await createClient()
    const password = formData.get('password') as string

    if (!password || password.length < 6) return { error: 'A nova senha deve ter no minimo 6 caracteres.' }

    const { error } = await supabase.auth.updateUser({
        password: password,
    })

    if (error) {
        return { error: error.message }
    }

    return { success: true }
}
