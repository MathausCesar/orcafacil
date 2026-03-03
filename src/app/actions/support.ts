'use server'

import { createClient } from '@/lib/supabase/server'
import { getActiveOrganizationId } from '@/lib/get-active-organization'
import { revalidatePath } from 'next/cache'

// ──────────────────────────────────────────────────────────────────────────────
// Support Tickets
// ──────────────────────────────────────────────────────────────────────────────

export async function createSupportTicket(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado.')

    const type = formData.get('type') as string
    const subject = formData.get('subject') as string
    const message = formData.get('message') as string

    if (!type || !subject || !message) {
        throw new Error('Preencha todos os campos obrigatórios.')
    }

    const validTypes = ['doubt', 'bug', 'suggestion', 'praise']
    if (!validTypes.includes(type)) throw new Error('Tipo inválido.')

    const orgId = await getActiveOrganizationId()

    const { error } = await supabase.from('support_tickets').insert({
        user_id: user.id,
        organization_id: orgId,
        type,
        subject,
        message,
        status: 'open',
    })

    if (error) throw new Error(error.message)
    return { success: true }
}

export async function getMyTickets() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data } = await supabase
        .from('support_tickets')
        .select('id, type, subject, status, admin_reply, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

    return data ?? []
}

// ──────────────────────────────────────────────────────────────────────────────
// Feature Suggestions & Votes
// ──────────────────────────────────────────────────────────────────────────────

export async function getSuggestions() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: suggestions } = await supabase
        .from('feature_suggestions')
        .select('id, title, description, status, votes_count, created_at')
        .order('votes_count', { ascending: false })
        .limit(20)

    if (!suggestions) return []
    if (!user) return suggestions.map(s => ({ ...s, user_voted: false }))

    // Busca votos do usuário atual de uma vez só
    const { data: myVotes } = await supabase
        .from('suggestion_votes')
        .select('suggestion_id')
        .eq('user_id', user.id)
        .in('suggestion_id', suggestions.map(s => s.id))

    const votedSet = new Set((myVotes ?? []).map(v => v.suggestion_id))

    return suggestions.map(s => ({
        ...s,
        user_voted: votedSet.has(s.id),
    }))
}

export async function createSuggestion(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado.')

    const title = (formData.get('title') as string)?.trim()
    const description = (formData.get('description') as string)?.trim()

    if (!title) throw new Error('O título é obrigatório.')

    const orgId = await getActiveOrganizationId()

    const { error } = await supabase.from('feature_suggestions').insert({
        user_id: user.id,
        organization_id: orgId,
        title,
        description: description || null,
    })

    if (error) throw new Error(error.message)
    revalidatePath('/app')
    return { success: true }
}

export async function toggleVote(suggestionId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Usuário não autenticado.')

    // Verifica voto existente
    const { data: existing } = await supabase
        .from('suggestion_votes')
        .select('id')
        .eq('suggestion_id', suggestionId)
        .eq('user_id', user.id)
        .maybeSingle()

    if (existing) {
        // Remove voto
        await supabase.from('suggestion_votes').delete().eq('id', existing.id)
        await supabase.rpc('decrement_votes', { suggestion_id: suggestionId })
        return { voted: false }
    } else {
        // Adiciona voto
        await supabase.from('suggestion_votes').insert({
            suggestion_id: suggestionId,
            user_id: user.id,
        })
        await supabase.rpc('increment_votes', { suggestion_id: suggestionId })
        return { voted: true }
    }
}
