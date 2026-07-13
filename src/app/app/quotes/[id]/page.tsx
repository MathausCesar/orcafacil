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
import type { ClientReturnReminder } from '@/components/quotes/client-return-panel'

// Public proposal links are served with the service role after their token is
// validated. Keep this projection explicit so internal billing and cost data
// can never leak into a customer-facing route by accident.
const PUBLIC_QUOTE_SELECT = `
    id,
    client_name,
    client_phone,
    created_at,
    deposit_amount,
    deposit_status,
    expiration_date,
    estimated_days,
    experience_mode,
    installment_count,
    layout_style,
    notes,
    organization_id,
    payment_methods,
    payment_terms,
    professional_context,
    public_token,
    approval_token,
    pix_key_snapshot,
    pix_key_type_snapshot,
    pix_recipient_city_snapshot,
    pix_recipient_name_snapshot,
    show_detailed_items,
    show_payment_options,
    show_timeline,
    status,
    total,
    cash_discount_percent,
    cash_discount_fixed,
    cash_discount_type,
    user_id,
    quote_items (
        id,
        description,
        details,
        item_type,
        quantity,
        service_id,
        stock_deducted_at,
        unit_price,
        total_price
    )
`

const PUBLIC_PROFILE_SELECT = `
    business_name,
    cnpj,
    email,
    logo_url,
    layout_style,
    phone,
    plan,
    pro_trial_ends_at,
    pix_key,
    pix_key_type,
    pix_recipient_city,
    pix_recipient_name,
    subscription_status,
    theme_color,
    primary_color,
    quote_settings,
    quote_font_family,
    city
`

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
            .select(PUBLIC_QUOTE_SELECT)
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
            .select(PUBLIC_PROFILE_SELECT)
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
    let clientReturnReminder: ClientReturnReminder | null = null

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

    if (isInternalViewer && user?.id === quote.user_id && quote.status === 'completed') {
        // The reminder remains private operational data; it is never queried for
        // a customer viewing the public proposal link.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: returnReminder } = await (supabase.from('client_return_reminders') as any)
            .select('id, due_date, status, note')
            .eq('quote_id', quote.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()

        if (returnReminder) {
            clientReturnReminder = {
                id: returnReminder.id,
                dueDate: returnReminder.due_date,
                status: returnReminder.status,
                note: returnReminder.note,
            }
        }
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
                clientReturnReminder={clientReturnReminder}
                viewerUserId={isInternalViewer ? user?.id || null : null}
            />
        </>
    )
}
