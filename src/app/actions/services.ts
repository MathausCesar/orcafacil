'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createService(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    const description = formData.get('description') as string
    const priceRaw = formData.get('price') as string
    const price = parseFloat(priceRaw.replace(',', '.'))
    const type = (formData.get('type') as string) || 'service'
    const details = (formData.get('details') as string) || null
    const folderIdRaw = formData.get('folder_id') as string
    const folder_id = folderIdRaw && folderIdRaw !== 'none' ? folderIdRaw : null

    if (!description || isNaN(price)) {
        return { error: 'Invalid data' }
    }

    const { error } = await supabase
        .from('services')
        .insert({
            user_id: user.id,
            description: description.trim(),
            default_price: price,
            type,
            details: details?.trim() || null,
            folder_id
        })

    if (error) {
        console.error('Error creating service:', error)
        return { error: 'Failed to create service' }
    }

    revalidatePath('/profile')
    return { success: true }
}

export async function updateService(id: string, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    const description = formData.get('description') as string
    const priceRaw = formData.get('price') as string
    const price = parseFloat(priceRaw.replace(',', '.'))
    const type = (formData.get('type') as string) || 'service'
    const details = (formData.get('details') as string) || null
    const folderIdRaw = formData.get('folder_id') as string
    const folder_id = folderIdRaw && folderIdRaw !== 'none' ? folderIdRaw : null

    if (!description || isNaN(price)) {
        return { error: 'Invalid data' }
    }

    const { error } = await supabase
        .from('services')
        .update({
            description: description.trim(),
            default_price: price,
            type,
            details: details?.trim() || null,
            folder_id
        })
        .eq('id', id)
        .eq('user_id', user.id) // Security check

    if (error) {
        console.error('Error updating service:', error)
        return { error: 'Failed to update service' }
    }

    revalidatePath('/profile')
    return { success: true }
}

export async function deleteService(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error deleting service:', error)
        return { error: 'Failed to delete service' }
    }

    revalidatePath('/profile')
    return { success: true }
}
