'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAuthCallbackUrl } from '@/lib/app-url'
import { parseActivationIntent } from '@/lib/activation-intent'

function normalizeNext(value: FormDataEntryValue | string | null | undefined) {
    if (typeof value !== 'string') return undefined
    if (!value.startsWith('/') || value.startsWith('//')) return undefined
    return value
}

export async function login(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const next = normalizeNext(formData.get('next')) || '/'

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: 'Credenciais inválidas.' }
    }

    revalidatePath('/', 'layout')
    return { success: true, redirect: next }
}

export async function signInWithGoogle(next?: string) {
    const supabase = await createClient()
    const redirectNext = normalizeNext(next) || '/'

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: getAuthCallbackUrl(redirectNext),
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

    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const next = normalizeNext(formData.get('next')) || '/onboarding'
    const signupIntent = parseActivationIntent(formData.get('activation_intent'))

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: getAuthCallbackUrl(next),
            data: {
                signup_intent: signupIntent,
            },
        },
    })

    if (error) {
        console.error('Signup failed:', error)
        return { error: 'Não foi possível concluir o cadastro. Confira os dados e tente novamente.' }
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
        redirectTo: getAuthCallbackUrl('/update-password'),
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
        password,
    })

    if (error) {
        return { error: error.message }
    }

    return { success: true }
}
