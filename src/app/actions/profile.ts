'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const businessName = formData.get('businessName') as string
    const phone = formData.get('phone') as string
    const email = formData.get('email') as string
    const themeColor = formData.get('themeColor') as string
    const layoutStyle = formData.get('layoutStyle') as string

    const updateData: any = {
        business_name: businessName,
        phone: phone,
        email: email,
        updated_at: new Date().toISOString(),
    }

    if (themeColor) updateData.theme_color = themeColor
    if (layoutStyle) updateData.layout_style = layoutStyle

    const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)

    if (error) {
        console.error('Error updating profile:', error)
        return { error: 'Failed to update profile' }
    }

    revalidatePath('/profile')
    revalidatePath('/') // Update header name
    return { success: true }
}

export async function checkOnboardingStatus() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return false

    console.log('Checking onboarding status for user:', user.id)
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('onboarded_at')
        .eq('id', user.id)
        .single()

    if (error) {
        console.error('Error checking profile:', error)
    }

    console.log('Profile onboarding status:', profile?.onboarded_at)
    return !!profile?.onboarded_at
}
