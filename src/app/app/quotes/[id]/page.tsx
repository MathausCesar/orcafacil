import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { getAppBaseUrl } from '@/lib/app-url'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ProposalCanvas, type ProposalProfile, type ProposalQuote } from '@/components/quotes/proposal-canvas'

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

function buildWhatsAppLink(phone: string | null, message: string) {
    const encodedMessage = encodeURIComponent(message)
    const digits = phone?.replace(/\D/g, '')

    if (!digits) {
        return `https://wa.me/?text=${encodedMessage}`
    }

    return `https://wa.me/${digits}?text=${encodedMessage}`
}

function buildWhatsAppMessage({
    clientName,
    businessName,
    totalFormatted,
    validUntil,
    approvalUrl,
}: {
    clientName: string
    businessName: string
    totalFormatted: string
    validUntil: string | null
    approvalUrl: string
}) {
    const lines = [
        `Olá, ${clientName}.`,
        ``,
        `${businessName} preparou sua proposta comercial.`,
        `Total: ${totalFormatted}`,
        ...(validUntil ? [`Validade: ${new Intl.DateTimeFormat('pt-BR').format(new Date(validUntil))}`] : []),
        ``,
        `Abra o link para visualizar, aprovar ou recusar:`,
        approvalUrl,
        ``,
        `Qualquer dúvida, responda por aqui.`,
    ]

    return lines.join('\n')
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
    const whatsappMessage = buildWhatsAppMessage({
        clientName: quote.client_name,
        businessName,
        totalFormatted,
        validUntil: quote.expiration_date,
        approvalUrl,
    })
    const whatsappLink = buildWhatsAppLink(quote.client_phone, whatsappMessage)

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
