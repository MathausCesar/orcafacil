'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getAuthContext } from '@/lib/get-auth-context'
import type { Json } from '@/types/database.types'

type ProfileUpdateData = {
    business_name: string
    phone: string
    email: string
    cnpj: string
    cep: string
    address: string
    address_number: string
    complement: string
    neighborhood: string
    city: string
    state: string
    updated_at: string
    theme_color?: string
    layout_style?: string
    quote_settings?: Json
}

type JsonObject = { [key: string]: Json | undefined }

function parseJsonObject(value: unknown): JsonObject {
    if (!value) return {}

    try {
        if (typeof value === 'string') {
            const parsed = JSON.parse(value)
            return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
                ? parsed as JsonObject
                : {}
        }

        return typeof value === 'object' && !Array.isArray(value)
            ? value as JsonObject
            : {}
    } catch {
        return {}
    }
}

export async function updateProfile(formData: FormData) {
    const { supabase, user } = await getAuthContext()

    if (!user) {
        redirect('/login')
    }

    const businessName = formData.get('businessName') as string
    const phone = formData.get('phone') as string
    const email = formData.get('email') as string
    const cnpj = formData.get('cnpj') as string
    const address = formData.get('address') as string
    const cep = formData.get('cep') as string
    const addressNumber = formData.get('address_number') as string
    const complement = formData.get('complement') as string
    const neighborhood = formData.get('neighborhood') as string
    const city = formData.get('city') as string
    const state = formData.get('state') as string
    const themeColor = formData.get('themeColor') as string
    const layoutStyle = formData.get('layoutStyle') as string
    const quoteSettingsStr = formData.get('quoteSettings') as string

    const updateData: ProfileUpdateData = {
        business_name: businessName,
        phone: phone,
        email: email,
        cnpj: cnpj,
        cep: cep,
        address: address,
        address_number: addressNumber,
        complement: complement,
        neighborhood: neighborhood,
        city: city,
        state: state,
        updated_at: new Date().toISOString(),
    }

    if (themeColor) updateData.theme_color = themeColor
    if (layoutStyle) updateData.layout_style = layoutStyle

    if (quoteSettingsStr) {
        try {
            const parsedSettings = parseJsonObject(quoteSettingsStr)
            const { data: currentProfile } = await supabase
                .from('profiles')
                .select('quote_settings')
                .eq('id', user.id)
                .maybeSingle()

            updateData.quote_settings = {
                ...parseJsonObject(currentProfile?.quote_settings),
                ...parsedSettings,
            }
        } catch (e) {
            console.error('Failed to parse quoteSettings', e)
        }
    }

    const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)

    if (error) {
        console.error('Error updating profile:', error)
        return { error: `DB Error: ${error.message} (Code: ${error.code})` || 'Failed to update profile' }
    }

    revalidatePath('/profile')
    revalidatePath('/')
    return { success: true }
}

export async function updateThemeColor(color: string) {
    const { supabase, user } = await getAuthContext()
    if (!user) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('profiles')
        .update({ theme_color: color, updated_at: new Date().toISOString() })
        .eq('id', user.id)

    if (error) {
        console.error('Error saving theme color:', error)
        return { error: 'Failed to save color' }
    }

    revalidatePath('/profile')
    return { success: true }
}

export async function checkOnboardingStatus() {
    const { supabase, user } = await getAuthContext()

    if (!user) return false

    const { data: profile } = await supabase
        .from('profiles')
        .select('onboarded_at')
        .eq('id', user.id)
        .single()

    return !!profile?.onboarded_at
}
