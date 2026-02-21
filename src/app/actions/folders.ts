'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

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

    const { data, error } = await supabase
        .from('item_folders')
        .select('*')
        .eq('user_id', user.id)
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

    const { data, error } = await supabase
        .from('item_folders')
        .insert({
            user_id: user.id,
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

    const { data, error } = await supabase
        .from('item_folders')
        .update({
            name,
            color
        })
        .eq('id', id)
        .eq('user_id', user.id)
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

    const { error } = await supabase
        .from('item_folders')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/services')
    return { success: true }
}
