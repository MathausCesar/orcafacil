'use server'

import { revalidatePath } from 'next/cache'
import { getAuthContext } from '@/lib/get-auth-context'

export interface ItemFolder {
    id: string
    user_id: string
    name: string
    color: string | null
    created_at: string
}

export async function getFolders() {
    const { supabase, user, orgId } = await getAuthContext()

    if (!user) {
        return { error: 'Usuário não autenticado' }
    }

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
    const { supabase, user, orgId } = await getAuthContext()

    if (!user) {
        return { error: 'Usuário não autenticado' }
    }

    const name = formData.get('name') as string
    const color = formData.get('color') as string | null

    if (!name) {
        return { error: 'Nome da pasta é obrigatório' }
    }

    if (!orgId) {
        return { error: 'No active organization found' }
    }

    const { data, error } = await supabase
        .from('item_folders')
        .insert({
            user_id: user.id,
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
    const { supabase, user, orgId } = await getAuthContext()

    if (!user) {
        return { error: 'Usuário não autenticado' }
    }

    const name = formData.get('name') as string
    const color = formData.get('color') as string | null

    if (!name) {
        return { error: 'Nome da pasta é obrigatório' }
    }

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
    const { supabase, user, orgId } = await getAuthContext()

    if (!user) {
        return { error: 'Usuário não autenticado' }
    }

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
