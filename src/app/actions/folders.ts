'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getActiveOrganizationId } from '@/lib/get-active-organization'

export interface ItemFolder {
    id: string
    user_id: string
    name: string
    color: string | null
    created_at: string
}

export async function getFolders() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Usuário não autenticado' }
    }

    const orgId = await getActiveOrganizationId()

    if (!orgId) {
        return { error: 'No active organization found' }
    }

    const { data, error } = await supabase
        .from('item_folders')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false })

    if (error) {
        return { error: error.message }
    }

    return { folders: data as ItemFolder[] }
}

export async function createFolder(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Usuário não autenticado' }
    }

    const name = formData.get('name') as string
    const color = formData.get('color') as string | null

    if (!name) {
        return { error: 'Nome da pasta é obrigatório' }
    }

    const orgId = await getActiveOrganizationId()

    if (!orgId) {
        return { error: 'No active organization found' }
    }

    const { data, error } = await supabase
        .from('item_folders')
        .insert({
            user_id: user.id, // Keeping user_id for original creator reference
            organization_id: orgId,
            name,
            color
        })
        .select()
        .single()

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/services')
    return { success: true, folder: data }
}

export async function updateFolder(id: string, formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Usuário não autenticado' }
    }

    const name = formData.get('name') as string
    const color = formData.get('color') as string | null

    if (!name) {
        return { error: 'Nome da pasta é obrigatório' }
    }

    const orgId = await getActiveOrganizationId()

    if (!orgId) {
        return { error: 'No active organization found' }
    }

    const { data, error } = await supabase
        .from('item_folders')
        .update({
            name,
            color
        })
        .eq('id', id)
        .eq('organization_id', orgId)
        .select()
        .single()

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/services')
    return { success: true, folder: data }
}

export async function deleteFolder(id: string) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: 'Usuário não autenticado' }
    }

    const orgId = await getActiveOrganizationId()

    if (!orgId) {
        return { error: 'No active organization found' }
    }

    const { error } = await supabase
        .from('item_folders')
        .delete()
        .eq('id', id)
        .eq('organization_id', orgId)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/services')
    return { success: true }
}
