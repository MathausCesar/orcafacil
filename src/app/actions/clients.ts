'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createClientAction(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const name = formData.get('name') as string
    const phone = formData.get('phone') as string
    const email = formData.get('email') as string
    const address = formData.get('address') as string
    const notes = formData.get('notes') as string

    const { error } = await supabase
        .from('clients')
        .insert({
            user_id: user.id,
            name,
            phone,
            email,
            address,
            notes
        })

    if (error) {
        console.error('Error creating client:', error)
        return { error: 'Failed to create client' }
    }

    revalidatePath('/clients')
    revalidatePath('/new') // Revalidate quote form
    return { success: true }
}

export async function getClients(query?: string) {
    const supabase = await createClient()

    let dbQuery = supabase
        .from('clients')
        .select('*')
        .order('name')

    if (query) {
        dbQuery = dbQuery.ilike('name', `%${query}%`)
    }

    const { data, error } = await dbQuery

    if (error) {
        console.error('Error fetching clients:', error)
        return []
    }

    return data
}

export async function updateClient(id: string, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Verify ownership
    const { data: existingClient } = await supabase
        .from('clients')
        .select('user_id')
        .eq('id', id)
        .single()

    if (!existingClient || existingClient.user_id !== user.id) {
        return { error: 'Unauthorized' }
    }

    const name = formData.get('name') as string
    const phone = formData.get('phone') as string
    const email = formData.get('email') as string
    const address = formData.get('address') as string
    const notes = formData.get('notes') as string

    const { error } = await supabase
        .from('clients')
        .update({
            name,
            phone,
            email,
            address,
            notes
        })
        .eq('id', id)

    if (error) {
        console.error('Error updating client:', error)
        return { error: 'Failed to update client' }
    }

    revalidatePath('/clients')
    revalidatePath('/new')
    return { success: true }
}

export async function deleteClient(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Verify ownership
    const { data: existingClient } = await supabase
        .from('clients')
        .select('user_id')
        .eq('id', id)
        .single()

    if (!existingClient || existingClient.user_id !== user.id) {
        return { error: 'Unauthorized' }
    }

    const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('Error deleting client:', error)
        return { error: 'Failed to delete client' }
    }

    revalidatePath('/clients')
    revalidatePath('/new')
    return { success: true }
}
