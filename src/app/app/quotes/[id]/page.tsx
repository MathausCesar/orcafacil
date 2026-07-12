import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { getAppBaseUrl } from '@/lib/app-url'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ProposalCanvas, type ProposalProfile, type ProposalQuote } from '@/components/quotes/proposal-canvas'
import { getEntitledPlan, isFreePlan, parseProposalIdentitySettings } from '@/lib/proposal-style'
import { buildQuoteApprovalMessage, buildWhatsAppLink } from '@/lib/quote-share'
import { PublicQuoteOpenTracker } from '@/components/quotes/public-quote-open-tracker'
import { buildPixCopyAndPaste } from '@/lib/pix'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params

    return {
        title: `Orçamento #${id.substring(0, 8)} - Zacly`,
        description: 'Visualize sua proposta comercial no Zacly.',
        robots: {
            index: false,
            follow: false,
        },
    }
}

export default async function QuotePage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>
    searchParams: Promise<{ token?: string; approval?: string }>
}) {
    const { id } = await params
    const { token, approval } = await searchParams
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let publicTokenValidated = false
    let { data: quote, error } = await supabase
        .from('quotes')
        .select(`
            *,
            quote_items (*)
        `)
        .eq('id', id)
        .maybeSingle()

    if (!quote && token) {
        const admin = getSupabaseAdmin()
        const publicQuoteResult = await admin
            .from('quotes')
            .select(`
                *,
                quote_items (*)
            `)
            .eq('id', id)
            .eq('public_token', token)
            .maybeSingle()

        quote = publicQuoteResult.data
        error = publicQuoteResult.error
        publicTokenValidated = !!publicQuoteResult.data
    }

    if (error || !quote) {
        notFound()
    }

    let isInternalViewer = user?.id === quote.user_id
    if (user && !isInternalViewer) {
        const { data: membership } = await supabase
            .from('organization_members')
            .select('id')
            .eq('organization_id', quote.organization_id)
            .eq('user_id', user.id)
            .maybeSingle()
        isInternalViewer = Boolean(membership)
    }

    const tokenMatchesQuote = !!token && token === quote.public_token
    const canViewPublic = !isInternalViewer && (publicTokenValidated || tokenMatchesQuote)
    const approvalToken = String((quote as typeof quote & { approval_token?: string }).approval_token || '')
    const hasRecipientPhone = String(quote.client_phone || '').replace(/\D/g, '').length >= 10
    const canClientRespond = canViewPublic && Boolean(approval) && approval === approvalToken && hasRecipientPhone

    let { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', quote.user_id)
        .maybeSingle()

    if (!profile && canViewPublic) {
        const admin = getSupabaseAdmin()
        const publicProfileResult = await admin
            .from('profiles')
            .select('*')
            .eq('id', quote.user_id)
            .maybeSingle()

        profile = publicProfileResult.data
    }

    const total = quote.total || 0
    const totalFormatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)
    const businessName = profile?.business_name || 'Zacly'
    const approvalUrl = `${getAppBaseUrl()}/quotes/${quote.id}?token=${quote.public_token}&approval=${approvalToken}`
    const pdfUrl = `/api/quotes/${quote.id}/pdf${canViewPublic ? `?token=${quote.public_token}` : ''}`
    const identitySettings = parseProposalIdentitySettings(profile?.quote_settings, profile?.quote_font_family)
    const accountPlan = getEntitledPlan(profile?.plan, profile?.subscription_status, profile?.pro_trial_ends_at)
    const accountIsFree = isFreePlan(accountPlan)
    const hasProPresentation = !accountIsFree || quote.experience_mode === 'pro_sample'
    const whatsappMessage = buildQuoteApprovalMessage({
        clientName: quote.client_name,
        businessName,
        totalFormatted,
        validUntil: quote.expiration_date,
        approvalUrl,
        template: hasProPresentation ? identitySettings.whatsappMessageTemplate : '',
        includeZaclyMarketing: !hasProPresentation,
    })
    const whatsappLink = buildWhatsAppLink(quote.client_phone, whatsappMessage)
    const quoteWithPayments = quote as typeof quote & {
        deposit_amount?: number | null
        pix_key_snapshot?: string | null
        pix_recipient_name_snapshot?: string | null
        pix_recipient_city_snapshot?: string | null
    }
    const depositAmount = Number(quoteWithPayments.deposit_amount || 0)
    const pixKey = quoteWithPayments.pix_key_snapshot || (isInternalViewer ? profile?.pix_key : null)
    const pixRecipientName = quoteWithPayments.pix_recipient_name_snapshot || (isInternalViewer ? profile?.pix_recipient_name : null) || profile?.business_name || ''
    const pixRecipientCity = quoteWithPayments.pix_recipient_city_snapshot || (isInternalViewer ? profile?.pix_recipient_city : null) || profile?.city || ''
    const pixPayload = buildPixCopyAndPaste({
        key: pixKey || '',
        recipientName: pixRecipientName,
        recipientCity: pixRecipientCity,
        amount: depositAmount,
        transactionId: quote.id.replace(/-/g, '').slice(-20),
    })

    let evidences: Array<{
        id: string
        fileName: string
        isClientVisible: boolean
        signedUrl: string | null
    }> = []

    if (isInternalViewer || canViewPublic) {
        const admin = getSupabaseAdmin()
        let evidenceQuery = admin
            .from('quote_evidences')
            .select('id, file_name, is_client_visible, storage_path')
            .eq('quote_id', quote.id)
            .order('created_at', { ascending: true })

        if (!isInternalViewer) {
            evidenceQuery = evidenceQuery.eq('is_client_visible', true)
        }

        const { data: evidenceRows } = await evidenceQuery
        evidences = await Promise.all((evidenceRows || []).map(async (evidence) => {
            const { data: signed } = await admin.storage
                .from('quote-evidences')
                .createSignedUrl(evidence.storage_path, 5 * 60)

            return {
                id: evidence.id,
                fileName: evidence.file_name,
                isClientVisible: evidence.is_client_visible,
                signedUrl: signed?.signedUrl || null,
            }
        }))
    }

    return (
        <>
            {canViewPublic && token && <PublicQuoteOpenTracker quoteId={quote.id} token={token} />}
            <ProposalCanvas
                quote={quote as ProposalQuote}
                profile={profile as ProposalProfile | null}
                isOwner={isInternalViewer}
                canClientRespond={canClientRespond}
                approvalUrl={approvalUrl}
                approvalToken={approvalToken}
                pdfUrl={pdfUrl}
                whatsappLink={whatsappLink}
                whatsappMessage={whatsappMessage}
                totalFormatted={totalFormatted}
                pixPayload={pixPayload}
                evidences={evidences}
                viewerUserId={isInternalViewer ? user?.id || null : null}
            />
        </>
    )
}
