'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getAuthContext } from '@/lib/get-auth-context'
import { FREE_PROPOSAL_MODEL, getEntitledPlan, isFreePlan } from '@/lib/proposal-style'
import type { Json } from '@/types/database.types'

type ProfileUpdateData = {
    updated_at: string
    business_name?: string
    phone?: string
    email?: string
    cnpj?: string
    pix_key?: string
    pix_key_type?: string | null
    pix_recipient_name?: string
    pix_recipient_city?: string
    target_margin_percent?: number
    cep?: string
    address?: string
    address_number?: string
    complement?: string
    neighborhood?: string
    city?: string
    state?: string
    theme_color?: string
    layout_style?: string
    quote_settings?: Json
}

type JsonObject = { [key: string]: Json | undefined }

const FREE_QUOTE_SETTINGS: JsonObject = {
    visualTone: 'balanced',
    footerText: '',
    quote_font_family: 'Inter',
    whatsappMessageTemplate: '',
}

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

    const themeColor = formData.get('themeColor') as string
    const layoutStyle = formData.get('layoutStyle') as string
    const quoteSettingsStr = formData.get('quoteSettings') as string
    const hasProposalFields = formData.has('themeColor') || formData.has('layoutStyle') || formData.has('quoteSettings')

    const updateData: ProfileUpdateData = {
        updated_at: new Date().toISOString(),
    }

    if (formData.has('businessName')) updateData.business_name = String(formData.get('businessName') || '')
    if (formData.has('phone')) updateData.phone = String(formData.get('phone') || '')
    if (formData.has('email')) updateData.email = String(formData.get('email') || '')
    if (formData.has('cnpj')) updateData.cnpj = String(formData.get('cnpj') || '')
    if (formData.has('pix_key')) updateData.pix_key = String(formData.get('pix_key') || '').trim()
    if (formData.has('pix_key_type')) updateData.pix_key_type = String(formData.get('pix_key_type') || '').trim() || null
    if (formData.has('pix_recipient_name')) updateData.pix_recipient_name = String(formData.get('pix_recipient_name') || '').trim()
    if (formData.has('pix_recipient_city')) updateData.pix_recipient_city = String(formData.get('pix_recipient_city') || '').trim()
    if (formData.has('target_margin_percent')) {
        const parsedTargetMargin = Number(String(formData.get('target_margin_percent') || '').replace(',', '.'))
        if (!Number.isFinite(parsedTargetMargin) || parsedTargetMargin < 0 || parsedTargetMargin > 95) {
            return { error: 'A meta de margem deve ficar entre 0% e 95%.' }
        }
        updateData.target_margin_percent = parsedTargetMargin
    }
    if (formData.has('cep')) updateData.cep = String(formData.get('cep') || '')
    if (formData.has('address')) updateData.address = String(formData.get('address') || '')
    if (formData.has('address_number')) updateData.address_number = String(formData.get('address_number') || '')
    if (formData.has('complement')) updateData.complement = String(formData.get('complement') || '')
    if (formData.has('neighborhood')) updateData.neighborhood = String(formData.get('neighborhood') || '')
    if (formData.has('city')) updateData.city = String(formData.get('city') || '')
    if (formData.has('state')) updateData.state = String(formData.get('state') || '')

    if (formData.has('target_margin_percent')) {
        const { data: marginProfile } = await supabase
            .from('profiles')
            .select('plan, subscription_status, pro_trial_ends_at')
            .eq('id', user.id)
            .maybeSingle()

        if (isFreePlan(getEntitledPlan(marginProfile?.plan, marginProfile?.subscription_status, marginProfile?.pro_trial_ends_at))) {
            delete updateData.target_margin_percent
        }
    }

    if (hasProposalFields) {
        const { data: currentProfile } = await supabase
            .from('profiles')
            .select('plan, subscription_status, pro_trial_ends_at, quote_settings')
            .eq('id', user.id)
            .maybeSingle()

        if (isFreePlan(getEntitledPlan(currentProfile?.plan, currentProfile?.subscription_status, currentProfile?.pro_trial_ends_at))) {
            updateData.layout_style = FREE_PROPOSAL_MODEL
            updateData.quote_settings = {
                ...parseJsonObject(currentProfile?.quote_settings),
                ...FREE_QUOTE_SETTINGS,
            }
        } else {
            if (themeColor) updateData.theme_color = themeColor
            if (layoutStyle) updateData.layout_style = layoutStyle

            if (quoteSettingsStr) {
                try {
                    const parsedSettings = parseJsonObject(quoteSettingsStr)

                    updateData.quote_settings = {
                        ...parseJsonObject(currentProfile?.quote_settings),
                        ...parsedSettings,
                    }
                } catch (e) {
                    console.error('Failed to parse quoteSettings', e)
                }
            }
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

    const { data: profile } = await supabase
        .from('profiles')
        .select('plan, subscription_status, pro_trial_ends_at')
        .eq('id', user.id)
        .maybeSingle()

    if (isFreePlan(getEntitledPlan(profile?.plan, profile?.subscription_status, profile?.pro_trial_ends_at))) {
        return { success: true, locked: true }
    }

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
