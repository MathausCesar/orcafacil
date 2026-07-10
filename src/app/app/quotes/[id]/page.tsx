import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { getAppBaseUrl } from '@/lib/app-url'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ProposalCanvas, type ProposalProfile, type ProposalQuote } from '@/components/quotes/proposal-canvas'
import { getEntitledPlan, isFreePlan, parseProposalIdentitySettings } from '@/lib/proposal-style'
import { buildQuoteApprovalMessage, buildWhatsAppLink } from '@/lib/quote-share'
import { captureServerActivationStage, captureServerEvent } from '@/lib/server-analytics'

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
    searchParams: Promise<{ token?: string }>
}) {
    const { id } = await params
    const { token } = await searchParams
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

    const isOwner = user?.id === quote.user_id
    const tokenMatchesQuote = !!token && token === quote.public_token
    const canClientRespond = !isOwner && (publicTokenValidated || tokenMatchesQuote)

    let { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', quote.user_id)
        .maybeSingle()

    if (!profile && canClientRespond) {
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
    const approvalUrl = `${getAppBaseUrl()}/quotes/${quote.id}?token=${quote.public_token}`
    const pdfUrl = `/api/quotes/${quote.id}/pdf${canClientRespond ? `?token=${quote.public_token}` : ''}`
    const identitySettings = parseProposalIdentitySettings(profile?.quote_settings, profile?.quote_font_family)
    const accountPlan = getEntitledPlan(profile?.plan, profile?.subscription_status)
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

    if (canClientRespond) {
        const publicOpenPayload = {
            quote_id: quote.id,
            quote_status: quote.status || 'unknown',
            plan: accountPlan,
            is_free: accountIsFree,
            proposal_experience_mode: quote.experience_mode || 'free_simple',
            has_pro_presentation: hasProPresentation,
            has_logo: Boolean(profile?.logo_url),
            layout_style: quote.layout_style || profile?.layout_style || 'professional',
            professional_context: quote.professional_context || 'general',
            total_band: total < 500 ? 'under_500' : total < 1500 ? '500_1499' : total < 5000 ? '1500_4999' : '5000_plus',
            source: 'public_quote_page',
        }

        await captureServerEvent('quote_public_opened', quote.user_id, publicOpenPayload)

        if (accountIsFree) {
            await captureServerActivationStage(quote.user_id, 'client_opened_free', publicOpenPayload)
        }
    }

    return (
        <ProposalCanvas
            quote={quote as ProposalQuote}
            profile={profile as ProposalProfile | null}
            isOwner={isOwner}
            canClientRespond={canClientRespond}
            approvalUrl={approvalUrl}
            pdfUrl={pdfUrl}
            whatsappLink={whatsappLink}
            whatsappMessage={whatsappMessage}
            totalFormatted={totalFormatted}
        />
    )
}
