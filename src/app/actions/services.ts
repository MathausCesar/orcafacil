'use server'

import { revalidatePath } from 'next/cache'
import { getAuthContext } from '@/lib/get-auth-context'

export async function createService(formData: FormData) {
    const { supabase, user, orgId } = await getAuthContext()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    if (!orgId) {
        return { error: 'No active organization found' }
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
            organization_id: orgId,
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
    const { supabase, user, orgId } = await getAuthContext()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    if (!orgId) {
        return { error: 'No active organization found' }
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
        .eq('organization_id', orgId)

    if (error) {
        console.error('Error updating service:', error)
        return { error: 'Failed to update service' }
    }

    revalidatePath('/profile')
    return { success: true }
}

export async function deleteService(id: string) {
    const { supabase, user, orgId } = await getAuthContext()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    if (!orgId) {
        return { error: 'No active organization found' }
    }

    const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id)
        .eq('organization_id', orgId)

    if (error) {
        console.error('Error deleting service:', error)
        return { error: 'Failed to delete service' }
    }

    revalidatePath('/profile')
    return { success: true }
}
