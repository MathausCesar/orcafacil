'use server'

import { revalidatePath } from 'next/cache'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

const CLIENT_DECISIONS = ['approved', 'rejected', 'changes_requested'] as const
type ClientDecision = typeof CLIENT_DECISIONS[number]

function isClientDecision(status: string): status is ClientDecision {
    return CLIENT_DECISIONS.includes(status as ClientDecision)
}

export async function approveQuotePublic(
    quoteId: string,
    publicToken: string,
    status: string,
    note?: string
) {
    if (!publicToken) {
        throw new Error('Link de aprovacao invalido.')
    }

    if (!isClientDecision(status)) {
        throw new Error('Decisao invalida para este link.')
    }

    const cleanNote = typeof note === 'string' ? note.trim().slice(0, 500) : ''

    if (['rejected', 'changes_requested'].includes(status) && cleanNote.length < 5) {
        throw new Error('Informe um motivo ou pedido de ajuste para o prestador.')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const admin = getSupabaseAdmin()
    const { data: quote, error: quoteError } = await admin
        .from('quotes')
        .select('id, status, client_name, user_id, organization_id')
        .eq('id', quoteId)
        .eq('public_token', publicToken)
        .single()

    if (quoteError || !quote) {
        throw new Error('Orcamento nao encontrado ou link invalido.')
    }

    if (user) {
        const { data: membership } = await admin
            .from('organization_members')
            .select('id')
            .eq('organization_id', quote.organization_id)
            .eq('user_id', user.id)
            .maybeSingle()

        if (quote.user_id === user.id || membership) {
            throw new Error('O prestador nao pode aprovar ou recusar a propria proposta.')
        }
    }

    if (!['pending', 'sent'].includes(quote.status || '')) {
        throw new Error('Este orcamento ja foi processado.')
    }

    const { data: updatedQuote, error } = await admin
        .from('quotes')
        .update({
            status,
            client_response_note: cleanNote || null,
            client_responded_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })
        .select('id')
        .eq('id', quoteId)
        .eq('public_token', publicToken)
        .in('status', ['pending', 'sent'])
        .maybeSingle()

    if (error) {
        console.error('Erro ao aprovar orcamento:', error)
        throw new Error(error.message)
    }

    if (!updatedQuote) {
        throw new Error('Este orcamento ja foi processado.')
    }

    const titleMap = {
        approved: 'Proposta aprovada pelo cliente',
        rejected: 'Proposta recusada pelo cliente',
        changes_requested: 'Cliente pediu ajuste na proposta',
    } as const

    const verbMap = {
        approved: 'aprovou',
        rejected: 'recusou',
        changes_requested: 'pediu ajuste em',
    } as const

    await admin
        .from('notifications')
        .insert({
            user_id: quote.user_id,
            organization_id: quote.organization_id,
            title: titleMap[status],
            message: `${quote.client_name} ${verbMap[status]} a proposta.${cleanNote ? ` Motivo: ${cleanNote}` : ''}`,
            link: `/quotes/${quoteId}`,
            type: status === 'approved' ? 'success' : 'alert',
        })

    revalidatePath(`/quotes/${quoteId}`)
    revalidatePath(`/app/quotes/${quoteId}`)
    revalidatePath('/quotes')
    revalidatePath('/app/quotes')
    revalidatePath('/')
}
