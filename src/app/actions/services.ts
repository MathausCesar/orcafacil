'use server'

import { revalidatePath } from 'next/cache'
import { getAuthContext } from '@/lib/get-auth-context'

function parseNumber(value: FormDataEntryValue | null, fallback = 0) {
    if (typeof value !== 'string') return fallback

    const cleanValue = value.trim().replace(/\s/g, '')
    const normalized = cleanValue.includes(',')
        ? cleanValue.replace(/\./g, '').replace(',', '.')
        : cleanValue
    const parsed = Number(normalized)
    return Number.isFinite(parsed) ? parsed : fallback
}

function revalidateCatalogPaths() {
    revalidatePath('/profile')
    revalidatePath('/catalog')
    revalidatePath('/new')
}

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
    const price = parseNumber(priceRaw)
    const type = (formData.get('type') as string) || 'service'
    const details = (formData.get('details') as string) || null
    const folderIdRaw = formData.get('folder_id') as string
    const folder_id = folderIdRaw && folderIdRaw !== 'none' ? folderIdRaw : null
    const unit = ((formData.get('unit') as string) || 'un').trim() || 'un'
    const costPrice = parseNumber(formData.get('cost_price'))
    const stockQuantity = parseNumber(formData.get('stock_quantity'))
    const minStock = parseNumber(formData.get('min_stock'))
    const trackStock = type === 'product' && formData.get('track_stock') === 'true'

    if (!description || !Number.isFinite(price) || price < 0) {
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
            folder_id,
            unit,
            cost_price: costPrice,
            stock_quantity: type === 'product' ? stockQuantity : 0,
            min_stock: type === 'product' ? minStock : 0,
            track_stock: trackStock,
            stock_updated_at: type === 'product' ? new Date().toISOString() : null
        })

    if (error) {
        console.error('Error creating service:', error)
        return { error: 'Failed to create service' }
    }

    revalidateCatalogPaths()
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
    const price = parseNumber(priceRaw)
    const type = (formData.get('type') as string) || 'service'
    const details = (formData.get('details') as string) || null
    const folderIdRaw = formData.get('folder_id') as string
    const folder_id = folderIdRaw && folderIdRaw !== 'none' ? folderIdRaw : null
    const unit = ((formData.get('unit') as string) || 'un').trim() || 'un'
    const costPrice = parseNumber(formData.get('cost_price'))
    const stockQuantity = parseNumber(formData.get('stock_quantity'))
    const minStock = parseNumber(formData.get('min_stock'))
    const trackStock = type === 'product' && formData.get('track_stock') === 'true'

    if (!description || !Number.isFinite(price) || price < 0) {
        return { error: 'Invalid data' }
    }

    const updatePayload: Record<string, string | number | boolean | null> = {
        description: description.trim(),
        default_price: price,
        type,
        details: details?.trim() || null,
        folder_id,
        unit,
        cost_price: costPrice,
        min_stock: type === 'product' ? minStock : 0,
        track_stock: trackStock
    }

    if (type !== 'product') {
        updatePayload.stock_quantity = 0
        updatePayload.stock_updated_at = null
    } else if (formData.has('stock_quantity')) {
        updatePayload.stock_quantity = stockQuantity
        updatePayload.stock_updated_at = new Date().toISOString()
    }

    const { error } = await supabase
        .from('services')
        .update(updatePayload)
        .eq('id', id)
        .eq('organization_id', orgId)

    if (error) {
        console.error('Error updating service:', error)
        return { error: 'Failed to update service' }
    }

    revalidateCatalogPaths()
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

    revalidateCatalogPaths()
    return { success: true }
}

export async function adjustServiceStock(id: string, formData: FormData) {
    const { supabase, user, orgId } = await getAuthContext()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    if (!orgId) {
        return { error: 'No active organization found' }
    }

    const quantity = parseNumber(formData.get('quantity'))
    const direction = (formData.get('direction') as string) || 'entry'
    const note = (formData.get('note') as string) || null

    if (!Number.isFinite(quantity) || quantity <= 0) {
        return { error: 'Informe uma quantidade maior que zero.' }
    }

    const quantityDelta = direction === 'remove' ? -quantity : quantity
    const movementType = direction === 'remove' ? 'exit' : 'entry'

    const { error } = await supabase.rpc('record_stock_movement', {
        p_service_id: id,
        p_quantity_delta: quantityDelta,
        p_movement_type: movementType,
        p_note: note
    })

    if (error) {
        console.error('Error adjusting stock:', error)
        return { error: 'Não foi possível ajustar o estoque.' }
    }

    revalidateCatalogPaths()
    return { success: true }
}
