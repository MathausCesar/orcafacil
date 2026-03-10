'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getAuthContext } from '@/lib/get-auth-context'

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
    const themeColor = formData.get('themeColor') as string
    const layoutStyle = formData.get('layoutStyle') as string
    const quoteSettingsStr = formData.get('quoteSettings') as string

    const updateData: any = {
        business_name: businessName,
        phone: phone,
        email: email,
        cnpj: cnpj,
        address: address,
        updated_at: new Date().toISOString(),
    }

    if (themeColor) updateData.theme_color = themeColor
    if (layoutStyle) updateData.layout_style = layoutStyle

    if (quoteSettingsStr) {
        try {
            const parsedSettings = JSON.parse(quoteSettingsStr)
            updateData.quote_settings = parsedSettings

            // Explicitly set the new columns if they exist in the settings
            if (parsedSettings.quote_font_family !== undefined) {
                updateData.quote_font_family = parsedSettings.quote_font_family
            }
            if (parsedSettings.quote_has_cover !== undefined) {
                updateData.quote_has_cover = parsedSettings.quote_has_cover
            }
            if (parsedSettings.quote_cover_image_url !== undefined) {
                updateData.quote_cover_image_url = parsedSettings.quote_cover_image_url
            }
            if (parsedSettings.quote_presentation_text !== undefined) {
                updateData.quote_presentation_text = parsedSettings.quote_presentation_text
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
        return { error: error.message || 'Failed to update profile' }
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
