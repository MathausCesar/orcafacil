'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getAuthContext } from '@/lib/get-auth-context'

export async function createClientAction(formData: FormData) {
    const { supabase, user, orgId } = await getAuthContext()

    if (!user) {
        return { error: 'Unauthorized', redirect: '/login' }
    }

    if (!orgId) {
        return { error: 'No active organization found' }
    }

    const name = formData.get('name') as string
    const phone = formData.get('phone') as string
    const email = formData.get('email') as string
    const address = formData.get('address') as string
    const cep = formData.get('cep') as string || null
    const notes = formData.get('notes') as string
    const personType = formData.get('person_type') as string || 'pf'
    const companyName = formData.get('company_name') as string || null

    if (email) {
        const { data: existingEmail } = await supabase
            .from('clients')
            .select('id')
            .eq('organization_id', orgId)
            .eq('email', email)
            .limit(1)
            .single()

        if (existingEmail) return { error: 'Já existe um cliente cadastrado com este e-mail.' }
    }

    const { data: existingName } = await supabase
        .from('clients')
        .select('id')
        .eq('organization_id', orgId)
        .ilike('name', name)
        .limit(1)
        .single()

    if (existingName) return { error: 'Já existe um cliente cadastrado com este nome.' }

    const { data, error } = await supabase
        .from('clients')
        .insert({
            user_id: user.id,
            organization_id: orgId,
            name,
            phone,
            email,
            address,
            cep,
            notes,
            person_type: personType,
            company_name: companyName
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating client:', error)
        return { error: 'Failed to create client' }
    }

    revalidatePath('/clients')
    revalidatePath('/new')
    return { success: true, client: data }
}

export async function getClients(query?: string) {
    const { supabase, orgId } = await getAuthContext()

    if (!orgId) return []

    let dbQuery = supabase
        .from('clients')
        .select('*')
        .eq('organization_id', orgId)
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
    const { supabase, user, orgId } = await getAuthContext()

    if (!user) {
        return { error: 'Unauthorized', redirect: '/login' }
    }

    // Verify ownership via organization
    const { data: existingClient } = await supabase
        .from('clients')
        .select('organization_id')
        .eq('id', id)
        .single()

    if (!existingClient || existingClient.organization_id !== orgId) {
        return { error: 'Unauthorized' }
    }

    const name = formData.get('name') as string
    const phone = formData.get('phone') as string
    const email = formData.get('email') as string
    const address = formData.get('address') as string
    const cep = formData.get('cep') as string || null
    const notes = formData.get('notes') as string
    const personType = formData.get('person_type') as string
    const companyName = formData.get('company_name') as string || null

    if (email) {
        const { data: existingEmail } = await supabase
            .from('clients')
            .select('id')
            .eq('organization_id', orgId)
            .eq('email', email)
            .neq('id', id)
            .limit(1)
            .single()

        if (existingEmail) return { error: 'Já existe um cliente cadastrado com este e-mail.' }
    }

    const { data: existingName } = await supabase
        .from('clients')
        .select('id')
        .eq('organization_id', orgId!)
        .ilike('name', name)
        .neq('id', id)
        .limit(1)
        .single()

    if (existingName) return { error: 'Já existe um cliente cadastrado com este nome.' }

    const { error } = await supabase
        .from('clients')
        .update({
            name,
            phone,
            email,
            address,
            cep,
            notes,
            person_type: personType,
            company_name: companyName
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
    const { supabase, user, orgId } = await getAuthContext()

    if (!user) {
        redirect('/login')
    }

    // Verify ownership via organization
    const { data: existingClient } = await supabase
        .from('clients')
        .select('organization_id')
        .eq('id', id)
        .single()

    if (!existingClient || existingClient.organization_id !== orgId) {
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
