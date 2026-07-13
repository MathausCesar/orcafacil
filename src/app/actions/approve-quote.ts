'use server'

import { revalidatePath } from 'next/cache'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { getEntitledPlan, isFreePlan } from '@/lib/proposal-style'
import { captureServerActivationStage, captureServerEvent } from '@/lib/server-analytics'

const CLIENT_DECISIONS = ['approved', 'rejected', 'changes_requested'] as const
type ClientDecision = typeof CLIENT_DECISIONS[number]

function isClientDecision(status: string): status is ClientDecision {
    return CLIENT_DECISIONS.includes(status as ClientDecision)
}

export async function approveQuotePublic(
    quoteId: string,
    publicToken: string,
    approvalToken: string,
    status: string,
    note?: string,
    phoneSuffix?: string,
) {
    if (!publicToken) {
        throw new Error('Link de aprovacao invalido.')
    }

    if (!approvalToken) {
        throw new Error('Use o link de aceite enviado pelo prestador para registrar sua decisao.')
    }

    if (!isClientDecision(status)) {
        throw new Error('Decisao invalida para este link.')
    }

    const cleanNote = typeof note === 'string' ? note.trim().slice(0, 500) : ''
    const cleanPhoneSuffix = typeof phoneSuffix === 'string' ? phoneSuffix.replace(/\D/g, '').slice(-4) : ''

    if (['rejected', 'changes_requested'].includes(status) && cleanNote.length < 5) {
        throw new Error('Informe um motivo ou pedido de ajuste para o prestador.')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const admin = getSupabaseAdmin()
    // Approval-specific fields are introduced in the same deployment migration.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: quote, error: quoteError } = await (admin.from('quotes') as any)
        .select('id, status, client_name, client_phone, expiration_date, user_id, organization_id, total, layout_style, professional_context, experience_mode, approval_token')
        .eq('id', quoteId)
        .eq('public_token', publicToken)
        .single()

    if (quoteError || !quote) {
        throw new Error('Orcamento nao encontrado ou link invalido.')
    }

    if (String(quote.approval_token) !== approvalToken) {
        throw new Error('Este link permite apenas visualizar a proposta. Use o link de aceite enviado pelo prestador.')
    }

    const expectedPhoneSuffix = String(quote.client_phone || '').replace(/\D/g, '').slice(-4)
    if (expectedPhoneSuffix.length !== 4 || cleanPhoneSuffix !== expectedPhoneSuffix) {
        throw new Error('Os digitos nao conferem com o WhatsApp cadastrado nesta proposta. Se o numero certo e o seu, peca ao prestador para conferir o telefone salvo e reenviar o link.')
    }

    if (quote.expiration_date) {
        const validUntil = new Date(`${quote.expiration_date}T23:59:59`)
        if (Number.isFinite(validUntil.getTime()) && validUntil.getTime() < Date.now()) {
            throw new Error('Esta proposta venceu e nao pode mais receber aceite.')
        }
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

    const { data: ownerProfile } = await admin
        .from('profiles')
        .select('plan, subscription_status, pro_trial_ends_at, logo_url')
        .eq('id', quote.user_id)
        .maybeSingle()
    const ownerPlan = getEntitledPlan(ownerProfile?.plan, ownerProfile?.subscription_status, ownerProfile?.pro_trial_ends_at)
    const ownerIsFree = isFreePlan(ownerPlan)
    const hasProPresentation = !ownerIsFree || quote.experience_mode === 'pro_sample'

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: updatedQuote, error } = await (admin.from('quotes') as any)
        .update({
            status,
            client_response_note: cleanNote || null,
            client_responded_at: new Date().toISOString(),
            approval_verified_at: new Date().toISOString(),
            approval_verification_method: 'approval_link_phone_suffix',
            updated_at: new Date().toISOString()
        })
        .select('id')
        .eq('id', quoteId)
        .eq('public_token', publicToken)
        .eq('approval_token', approvalToken)
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

    const decisionPayload = {
        decision: status,
        quote_id: quoteId,
        previous_status: quote.status || 'unknown',
        plan: ownerPlan,
        is_free: ownerIsFree,
        proposal_experience_mode: quote.experience_mode || 'free_simple',
        has_pro_presentation: hasProPresentation,
        has_logo: Boolean(ownerProfile?.logo_url),
        layout_style: quote.layout_style || 'professional',
        professional_context: quote.professional_context || 'general',
        total_band: (quote.total || 0) < 500 ? 'under_500' : (quote.total || 0) < 1500 ? '500_1499' : (quote.total || 0) < 5000 ? '1500_4999' : '5000_plus',
        source: 'public_quote_decision',
    }

    await captureServerEvent('quote_client_decision_completed_for_owner', quote.user_id, decisionPayload)

    if (status === 'approved' && ownerIsFree) {
        await captureServerActivationStage(quote.user_id, 'client_approved_free', decisionPayload)
    }

    revalidatePath(`/quotes/${quoteId}`)
    revalidatePath(`/app/quotes/${quoteId}`)
    revalidatePath('/quotes')
    revalidatePath('/app/quotes')
    revalidatePath('/')
}
