import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, BadgeCheck, CalendarDays, Clock3, ListChecks, MessageCircle, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { QuoteOwnerActions } from '@/components/quotes/quote-owner-actions'
import { QuoteShareModal } from '@/components/quotes/quote-share-modal'
import { PrintButton } from '@/components/quotes/print-button'
import { PdfDownloadButton } from '@/components/quotes/pdf-download-button'
import { QuoteStatusActions } from '@/components/quotes/quote-status-actions'
import { QuoteStockActions } from '@/components/quotes/quote-stock-actions'
import { QuoteNextSteps } from '@/components/quotes/quote-next-steps'
import { QuotePaymentActions } from '@/components/quotes/quote-payment-actions'
import { QuoteReminderNotice } from '@/components/quotes/quote-reminder-notice'
import { ApproveQuoteClient } from '@/components/quotes/approve-quote-client'
import { PaymentOptions } from '@/components/quotes/payment-options'
import { QRCodeGenerator } from '@/components/quotes/qr-code-generator'
import { TimelineSection } from '@/components/quotes/timeline-section'
import { Watermark } from '@/components/quotes/watermark'
import { getProfessionalContext } from '@/lib/professional-context'
import { buildQuoteFollowUpMessage, getQuoteReminder } from '@/lib/quote-reminders'
import {
    PROPOSAL_TONE_INTRO,
    ProposalFont,
    ProposalModelId,
    VisualToneId,
    normalizeProposalFont,
    normalizeProposalModel,
    normalizeVisualTone,
    parseProposalIdentitySettings,
} from '@/lib/proposal-style'

type QuoteItem = {
    id: string
    description: string | null
    details?: string | null
    item_type?: string | null
    quantity: number | null
    service_id?: string | null
    stock_deducted_at?: string | null
    unit_cost?: number | null
    unit_price: number | null
}

export type ProposalQuote = {
    id: string
    client_name: string
    client_phone: string | null
    created_at: string | null
    expiration_date: string | null
    estimated_days: number | null
    installment_count: number | null
    layout_style?: string | null
    notes: string | null
    organization_id: string
    amount_paid?: number | null
    paid_at?: string | null
    payment_status?: string | null
    payment_updated_at?: string | null
    payment_methods?: string[] | null
    payment_terms: string | null
    professional_context?: string | null
    public_token: string
    quote_items: QuoteItem[]
    client_response_note?: string | null
    client_responded_at?: string | null
    show_detailed_items: boolean | null
    show_payment_options: boolean | null
    show_timeline: boolean | null
    status: string | null
    total: number | null
    updated_at?: string | null
    user_id: string
    cash_discount_percent?: number | null
    cash_discount_fixed?: number | null
    cash_discount_type?: string | null
}

export type ProposalProfile = {
    business_name: string | null
    cnpj: string | null
    email: string | null
    logo_url: string | null
    layout_style?: string | null
    phone: string | null
    plan: string | null
    theme_color: string | null
    primary_color: string | null
    quote_settings?: unknown
}

type ProposalIdentitySettings = ReturnType<typeof parseProposalIdentitySettings>

type ProposalSkin = {
    pageClass: string
    articleClass: string
    heroClass: string
    heroAccentClass: string
    logoClass: string
    heroMutedClass: string
    heroSoftClass: string
    metaPanelClass: string
    metaCardClass: string
    metaDividerClass: string
    infoSectionClass: string
    infoCardClass: string
    itemHeaderClass: string
    timelineClass: string
    summaryClass: string
    bottomSectionClass: string
    bottomCardClass: string
}

type ProposalCanvasProps = {
    quote: ProposalQuote
    profile: ProposalProfile | null
    isOwner: boolean
    canClientRespond: boolean
    approvalUrl: string
    pdfUrl: string
    whatsappLink: string
    whatsappMessage: string
    totalFormatted: string
}

const statusCopy: Record<string, { label: string; className: string }> = {
    draft: { label: 'Rascunho', className: 'border-slate-200 bg-slate-100 text-slate-700' },
    pending: { label: 'Aguardando cliente', className: 'border-amber-200 bg-amber-50 text-amber-800' },
    sent: { label: 'Enviado ao cliente', className: 'border-amber-200 bg-amber-50 text-amber-800' },
    approved: { label: 'Aprovado pelo cliente', className: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
    rejected: { label: 'Recusado pelo cliente', className: 'border-red-200 bg-red-50 text-red-700' },
    changes_requested: { label: 'Cliente pediu ajuste', className: 'border-amber-200 bg-amber-50 text-amber-800' },
    in_progress: { label: 'Em execução', className: 'border-blue-200 bg-blue-50 text-blue-800' },
    completed: { label: 'Concluído', className: 'border-teal-200 bg-teal-50 text-teal-800' },
}

const proposalSkins: Record<ProposalModelId, ProposalSkin> = {
    modern: {
        pageClass: 'bg-[#eef2f5]',
        articleClass: 'rounded-[1.75rem] border-slate-200 bg-white shadow-2xl shadow-slate-900/10',
        heroClass: 'bg-slate-950 text-white',
        heroAccentClass: 'bg-[var(--proposal-accent)] opacity-20',
        logoClass: 'rounded-2xl bg-white text-slate-950',
        heroMutedClass: 'text-white/50',
        heroSoftClass: 'text-white/70',
        metaPanelClass: 'rounded-3xl border-white/10 bg-white/10 text-white backdrop-blur',
        metaCardClass: 'rounded-2xl bg-white/10',
        metaDividerClass: 'border-white/10',
        infoSectionClass: 'border-slate-200 bg-white',
        infoCardClass: 'rounded-2xl border-slate-200 bg-slate-50',
        itemHeaderClass: 'bg-slate-100 text-slate-500',
        timelineClass: 'rounded-2xl border-slate-200 bg-slate-50',
        summaryClass: 'rounded-3xl border-slate-200 bg-slate-950 text-white shadow-xl shadow-slate-900/10',
        bottomSectionClass: 'border-slate-200 bg-slate-50',
        bottomCardClass: 'rounded-3xl border-slate-200 bg-white',
    },
    professional: {
        pageClass: 'bg-[#edf1f4]',
        articleClass: 'rounded-2xl border-slate-300 bg-white shadow-xl shadow-slate-900/10',
        heroClass: 'bg-[#101820] text-white',
        heroAccentClass: 'bg-[var(--proposal-accent)] opacity-[0.16]',
        logoClass: 'rounded-xl bg-white text-slate-950',
        heroMutedClass: 'text-white/55',
        heroSoftClass: 'text-white/72',
        metaPanelClass: 'rounded-2xl border-white/10 bg-white/10 text-white backdrop-blur',
        metaCardClass: 'rounded-xl bg-white/10',
        metaDividerClass: 'border-white/10',
        infoSectionClass: 'border-slate-200 bg-white',
        infoCardClass: 'rounded-xl border-slate-200 bg-slate-50',
        itemHeaderClass: 'bg-slate-100 text-slate-500',
        timelineClass: 'rounded-xl border-slate-200 bg-slate-50',
        summaryClass: 'rounded-2xl border-slate-200 bg-[#101820] text-white shadow-lg shadow-slate-900/10',
        bottomSectionClass: 'border-slate-200 bg-slate-50',
        bottomCardClass: 'rounded-2xl border-slate-200 bg-white',
    },
    classic: {
        pageClass: 'bg-[#eee7dc]',
        articleClass: 'rounded-sm border-[#d7cbbb] bg-[#fffdf8] shadow-xl shadow-stone-900/10',
        heroClass: 'bg-[#fffaf1] text-slate-950',
        heroAccentClass: 'bg-[var(--proposal-accent)] opacity-10',
        logoClass: 'rounded-sm bg-slate-950 text-white',
        heroMutedClass: 'text-slate-500',
        heroSoftClass: 'text-slate-600',
        metaPanelClass: 'rounded-sm border-stone-300 bg-white/80 text-slate-950',
        metaCardClass: 'rounded-sm bg-stone-100',
        metaDividerClass: 'border-stone-200',
        infoSectionClass: 'border-stone-200 bg-[#fffdf8]',
        infoCardClass: 'rounded-sm border-stone-200 bg-white',
        itemHeaderClass: 'bg-stone-100 text-stone-600',
        timelineClass: 'rounded-sm border-stone-200 bg-white',
        summaryClass: 'rounded-sm border-stone-300 bg-[#2c2721] text-white shadow-lg shadow-stone-900/10',
        bottomSectionClass: 'border-stone-200 bg-[#f8f3ea]',
        bottomCardClass: 'rounded-sm border-stone-200 bg-white',
    },
    minimalist: {
        pageClass: 'bg-white',
        articleClass: 'rounded-none border-slate-200 bg-white shadow-none',
        heroClass: 'bg-white text-slate-950',
        heroAccentClass: 'bg-[var(--proposal-accent)] opacity-[0.08]',
        logoClass: 'rounded-xl bg-slate-950 text-white',
        heroMutedClass: 'text-slate-500',
        heroSoftClass: 'text-slate-600',
        metaPanelClass: 'rounded-2xl border-slate-200 bg-slate-50 text-slate-950',
        metaCardClass: 'rounded-xl bg-white',
        metaDividerClass: 'border-slate-200',
        infoSectionClass: 'border-slate-200 bg-white',
        infoCardClass: 'rounded-2xl border-slate-200 bg-white',
        itemHeaderClass: 'bg-white text-slate-500',
        timelineClass: 'rounded-2xl border-slate-200 bg-white',
        summaryClass: 'rounded-2xl border-slate-200 bg-slate-950 text-white',
        bottomSectionClass: 'border-slate-200 bg-white',
        bottomCardClass: 'rounded-2xl border-slate-200 bg-white',
    },
    agency: {
        pageClass: 'bg-[#edf4f1]',
        articleClass: 'rounded-[2rem] border-emerald-100 bg-white shadow-2xl shadow-emerald-950/10',
        heroClass: 'bg-[#061b1a] text-white',
        heroAccentClass: 'bg-[var(--proposal-accent)] opacity-[0.28]',
        logoClass: 'rounded-[1.4rem] bg-white text-slate-950',
        heroMutedClass: 'text-white/55',
        heroSoftClass: 'text-white/75',
        metaPanelClass: 'rounded-[1.75rem] border-white/10 bg-white/[0.12] text-white backdrop-blur',
        metaCardClass: 'rounded-[1.35rem] bg-white/[0.12]',
        metaDividerClass: 'border-white/10',
        infoSectionClass: 'border-emerald-100 bg-white',
        infoCardClass: 'rounded-[1.5rem] border-emerald-100 bg-emerald-50/40',
        itemHeaderClass: 'bg-emerald-50 text-emerald-900/60',
        timelineClass: 'rounded-[1.5rem] border-emerald-100 bg-emerald-50/40',
        summaryClass: 'rounded-[1.75rem] border-emerald-900 bg-slate-950 text-white shadow-xl shadow-emerald-950/10',
        bottomSectionClass: 'border-emerald-100 bg-emerald-50/40',
        bottomCardClass: 'rounded-[1.75rem] border-emerald-100 bg-white',
    },
    impact: {
        pageClass: 'bg-slate-950',
        articleClass: 'rounded-[1.4rem] border-slate-800 bg-white shadow-2xl shadow-black/30',
        heroClass: 'bg-[#050816] text-white',
        heroAccentClass: 'bg-[var(--proposal-accent)] opacity-[0.24]',
        logoClass: 'rounded-xl bg-white text-slate-950',
        heroMutedClass: 'text-white/50',
        heroSoftClass: 'text-white/78',
        metaPanelClass: 'rounded-2xl border-white/10 bg-white/10 text-white backdrop-blur',
        metaCardClass: 'rounded-xl bg-white/10',
        metaDividerClass: 'border-white/10',
        infoSectionClass: 'border-slate-200 bg-white',
        infoCardClass: 'rounded-xl border-slate-200 bg-slate-50',
        itemHeaderClass: 'bg-slate-950 text-white/70',
        timelineClass: 'rounded-xl border-slate-200 bg-slate-50',
        summaryClass: 'rounded-2xl border-slate-900 bg-slate-950 text-white shadow-xl shadow-black/20',
        bottomSectionClass: 'border-slate-200 bg-slate-100',
        bottomCardClass: 'rounded-2xl border-slate-200 bg-white',
    },
}

const toneIntro: Record<VisualToneId, string> = {
    balanced: 'Escopo, valores e condições organizados para decisão rápida. A aprovação deve ser feita pelo link público enviado ao cliente.',
    formal: 'Documento comercial estruturado com escopo, condições e investimento para uma decisão segura do cliente.',
    creative: 'Uma proposta clara, visual e personalizada para apresentar o serviço com mais presença e confiança.',
}

function formatDate(value: string | null) {
    if (!value) return 'A combinar'
    return new Intl.DateTimeFormat('pt-BR').format(new Date(value))
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function normalizeColor(value: string | null | undefined) {
    return value && /^#[0-9a-f]{6}$/i.test(value) ? value : '#0D9B5C'
}

function parseIdentitySettings(raw: unknown): ProposalIdentitySettings {
    return parseProposalIdentitySettings(raw)
}

function getFontFamily(font: ProposalFont) {
    const fontMap: Record<ProposalFont, string | undefined> = {
        Inter: undefined,
        Roboto: 'Roboto, Arial, sans-serif',
        'Playfair Display': '"Playfair Display", Georgia, serif',
        Montserrat: 'Montserrat, Arial, sans-serif',
    }

    return fontMap[font]
}

function getInitials(name: string) {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0]?.toUpperCase())
        .join('') || 'Z'
}

function getWhatsappQuestionUrl(phone: string | null | undefined, clientName: string) {
    const digits = phone?.replace(/\D/g, '')
    if (!digits) return null

    const message = encodeURIComponent(`Olá, tenho uma dúvida sobre a proposta de ${clientName}.`)
    return `https://wa.me/${digits}?text=${message}`
}

function getWhatsappFollowUpUrl(phone: string | null | undefined, message: string) {
    const digits = phone?.replace(/\D/g, '')
    if (!digits) return null

    return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}

export function ProposalCanvas({
    quote,
    profile,
    isOwner,
    canClientRespond,
    approvalUrl,
    pdfUrl,
    whatsappLink,
    whatsappMessage,
    totalFormatted,
}: ProposalCanvasProps) {
    const businessName = profile?.business_name || 'Zacly'
    const themeColor = normalizeColor(profile?.theme_color || profile?.primary_color)
    const identitySettings = parseIdentitySettings(profile?.quote_settings)
    const proposalModel = normalizeProposalModel(quote.layout_style || profile?.layout_style)
    const visualTone = normalizeVisualTone(identitySettings.visualTone)
    const proposalFont = normalizeProposalFont(identitySettings.quoteFont)
    const skin = proposalSkins[proposalModel]
    const footerText = identitySettings.footerText.trim()
    const isDocumentModel = proposalModel === 'classic' || proposalModel === 'minimalist'
    const isAgencyModel = proposalModel === 'agency'
    const status = quote.status || 'draft'
    const statusInfo = statusCopy[status] || statusCopy.draft
    const isFree = !profile?.plan || profile.plan === 'free'
    const questionUrl = getWhatsappQuestionUrl(profile?.phone, quote.client_name)
    const itemTotal = quote.quote_items.reduce((sum, item) => {
        return sum + ((item.quantity || 0) * (item.unit_price || 0))
    }, 0)
    const stockLinkedItems = quote.quote_items.filter((item) => item.item_type === 'product' && item.service_id)
    const pendingStockItems = stockLinkedItems.filter((item) => !item.stock_deducted_at).length
    const deductedStockItems = stockLinkedItems.length - pendingStockItems
    const total = quote.total ?? itemTotal
    const discount = Math.max(itemTotal - total, 0)
    const professionalContext = getProfessionalContext(quote.professional_context)
    const reminder = isOwner ? getQuoteReminder(quote) : null
    const followUpUrl = reminder?.kind === 'follow_up'
        ? getWhatsappFollowUpUrl(quote.client_phone, buildQuoteFollowUpMessage(quote.client_name, approvalUrl))
        : null

    return (
        <div
            className={cn('force-light min-h-screen overflow-x-hidden pb-16 text-slate-950 print:bg-white print:pb-0', skin.pageClass)}
            style={{
                '--proposal-accent': themeColor,
                colorScheme: 'light',
                fontFamily: getFontFamily(proposalFont),
            } as React.CSSProperties}
        >
            <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-3 py-3 shadow-sm backdrop-blur print:hidden">
                <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                        {isOwner && (
                            <Link href="/">
                                <Button variant="ghost" size="icon" aria-label="Voltar">
                                    <ArrowLeft className="h-5 w-5" />
                                </Button>
                            </Link>
                        )}
                        <div className="min-w-0">
                            <p className="truncate text-sm font-bold text-slate-900">
                                {isOwner ? 'Proposta pronta para envio' : 'Proposta comercial'}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                                {isOwner ? quote.client_name : businessName}
                            </p>
                        </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                        {isOwner && <QuoteOwnerActions quoteId={quote.id} status={status} />}
                        {isOwner && (
                            <QuoteShareModal
                                quoteId={quote.id}
                                clientName={quote.client_name}
                                approvalUrl={approvalUrl}
                                whatsappLink={whatsappLink}
                                businessName={businessName}
                                totalFormatted={totalFormatted}
                                whatsappMessage={whatsappMessage}
                                quoteStatus={status}
                                pdfUrl={pdfUrl}
                            />
                        )}
                        <PdfDownloadButton href={pdfUrl} />
                        <PrintButton />
                    </div>
                </div>
            </header>

            <main className="mx-auto w-full max-w-6xl overflow-x-hidden px-3 py-6 sm:px-6 lg:py-10 print:max-w-none print:px-0 print:py-0">
                <article
                    data-proposal-model={proposalModel}
                    className={cn('relative w-full max-w-full overflow-hidden border print:rounded-none print:border-0 print:shadow-none', skin.articleClass)}
                >
                    {isFree && <Watermark />}

                    <section className={cn('relative overflow-hidden px-4 py-8 sm:px-10 lg:px-12', skin.heroClass)}>
                        <div className={cn('absolute inset-y-0 right-0 w-2/5', skin.heroAccentClass)} />
                        <div
                            className={cn(
                                'relative grid min-w-0 gap-8',
                                isDocumentModel
                                    ? 'lg:grid-cols-1 lg:text-center'
                                    : isAgencyModel
                                        ? 'lg:grid-cols-[1fr_0.9fr] lg:items-end'
                                        : 'lg:grid-cols-[1.2fr_0.8fr] lg:items-end',
                            )}
                        >
                            <div className="min-w-0">
                                <div className={cn('mb-8 flex min-w-0 items-center gap-4', isDocumentModel && 'justify-center')}>
                                    {profile?.logo_url ? (
                                        <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded-2xl bg-white p-3 sm:h-16 sm:w-28">
                                            <Image src={profile.logo_url} alt={businessName} fill className="object-contain p-2" unoptimized />
                                        </div>
                                    ) : (
                                        <div className={cn('flex h-14 w-14 shrink-0 items-center justify-center text-lg font-black sm:h-16 sm:w-16 sm:text-xl', skin.logoClass)}>
                                            {getInitials(businessName)}
                                        </div>
                                    )}
                                    <div className="min-w-0">
                                        <p className={cn('text-xs font-bold uppercase tracking-[0.22em]', skin.heroMutedClass)}>
                                            Proposta preparada por
                                        </p>
                                        <h1 className="break-words text-xl font-black tracking-tight sm:text-3xl">
                                            {businessName}
                                        </h1>
                                    </div>
                                </div>

                                <p className="text-xs font-bold uppercase tracking-[0.28em]" style={{ color: themeColor }}>
                                    Orçamento profissional
                                </p>
                                <h2
                                    className={cn(
                                        'mt-3 max-w-3xl break-words font-black leading-none tracking-tight',
                                        isDocumentModel ? 'mx-auto text-3xl sm:text-4xl lg:text-5xl' : 'text-4xl sm:text-5xl lg:text-6xl',
                                    )}
                                >
                                    {quote.client_name}
                                </h2>
                                <p className={cn('mt-5 max-w-2xl text-base leading-7', skin.heroSoftClass, isDocumentModel && 'mx-auto')}>
                                    {PROPOSAL_TONE_INTRO[visualTone] || toneIntro[visualTone]}
                                </p>
                            </div>

                            <div className={cn('min-w-0 border p-4 sm:p-5', skin.metaPanelClass, isDocumentModel && 'mx-auto w-full max-w-3xl')}>
                                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                                    <span className={cn('rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.12em]', statusInfo.className)}>
                                        {statusInfo.label}
                                    </span>
                                    <span className={cn('font-mono text-sm', skin.heroMutedClass)}>#{quote.id.slice(0, 8).toUpperCase()}</span>
                                </div>
                                <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                                    <div className={cn('p-4', skin.metaCardClass)}>
                                        <CalendarDays className="mb-3 h-5 w-5" style={{ color: themeColor }} />
                                        <p className={cn('text-xs uppercase', skin.heroMutedClass)}>Emissão</p>
                                        <p className="mt-1 font-bold">{formatDate(quote.created_at)}</p>
                                    </div>
                                    <div className={cn('p-4', skin.metaCardClass)}>
                                        <Clock3 className="mb-3 h-5 w-5" style={{ color: themeColor }} />
                                        <p className={cn('text-xs uppercase', skin.heroMutedClass)}>Validade</p>
                                        <p className="mt-1 font-bold">{formatDate(quote.expiration_date)}</p>
                                    </div>
                                </div>
                                <div className={cn('mt-5 border-t pt-5', skin.metaDividerClass)}>
                                    <p className={cn('text-xs uppercase tracking-[0.2em]', skin.heroMutedClass)}>Investimento</p>
                                    <p className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{formatCurrency(total)}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className={cn('grid gap-6 border-b px-4 py-6 sm:grid-cols-3 sm:px-10 lg:px-12', skin.infoSectionClass)}>
                        <div className={cn('min-w-0 border p-5', skin.infoCardClass)}>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Cliente</p>
                            <p className="mt-2 break-words text-lg font-black text-slate-950">{quote.client_name}</p>
                            {quote.client_phone && <p className="mt-1 text-sm text-slate-500">{quote.client_phone}</p>}
                        </div>
                        <div className={cn('min-w-0 border p-5', skin.infoCardClass)}>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Empresa</p>
                            <p className="mt-2 break-words text-lg font-black text-slate-950">{businessName}</p>
                            <p className="mt-1 break-words text-sm text-slate-500">{profile?.phone || profile?.email || 'Contato informado na proposta'}</p>
                        </div>
                        <div className={cn('min-w-0 border p-5', skin.infoCardClass)}>
                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Entrega</p>
                            <p className="mt-2 break-words text-lg font-black text-slate-950">
                                {quote.estimated_days ? `${quote.estimated_days} dias estimados` : 'Prazo a combinar'}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">Após aprovação do cliente</p>
                        </div>
                    </section>

                    <section className={cn('border-b px-4 py-6 sm:px-10 lg:px-12', skin.infoSectionClass)}>
                        <div className="grid gap-5 lg:grid-cols-[260px_1fr] lg:items-start">
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <ListChecks className="h-5 w-5" style={{ color: themeColor }} />
                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Plano de execucao</p>
                                </div>
                                <h3 className="mt-2 break-words text-2xl font-black tracking-tight text-slate-950">
                                    {professionalContext.name}
                                </h3>
                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                    {professionalContext.description}
                                </p>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-3">
                                {professionalContext.proposalBullets.map((bullet) => (
                                    <div key={bullet} className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4">
                                        <span className="mb-3 block h-1.5 w-10 rounded-full" style={{ backgroundColor: themeColor }} />
                                        <p className="text-sm font-semibold leading-6 text-slate-700">{bullet}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="grid min-w-0 gap-8 px-4 py-8 sm:px-10 lg:grid-cols-[1.55fr_0.75fr] lg:px-12">
                        <div className="min-w-0 space-y-6">
                            <div>
                                <div className="mb-4 flex items-end justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-[0.22em]" style={{ color: themeColor }}>
                                            Escopo
                                        </p>
                                        <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                                            Itens incluídos
                                        </h3>
                                    </div>
                                    <p className="hidden text-sm text-slate-500 sm:block">
                                        {quote.quote_items.length} {quote.quote_items.length === 1 ? 'item' : 'itens'}
                                    </p>
                                </div>

                                <div className="overflow-hidden rounded-2xl border border-slate-200">
                                    <div className={cn('hidden grid-cols-[1fr_80px_120px_130px] gap-4 px-5 py-3 text-xs font-bold uppercase tracking-[0.14em] sm:grid', skin.itemHeaderClass)}>
                                        <div>Descrição</div>
                                        <div className="text-center">Qtd</div>
                                        <div className="text-right">Unitário</div>
                                        <div className="text-right">Total</div>
                                    </div>
                                    <div className="divide-y divide-slate-200">
                                        {quote.quote_items.map((item, index) => {
                                            const quantity = item.quantity || 0
                                            const unitPrice = item.unit_price || 0
                                            const lineTotal = quantity * unitPrice

                                            return (
                                                <div key={item.id} className="grid min-w-0 gap-3 px-4 py-5 sm:grid-cols-[1fr_80px_120px_130px] sm:gap-4 sm:px-5">
                                                    <div className="min-w-0">
                                                        <div className="flex gap-3">
                                                            <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black text-white" style={{ backgroundColor: themeColor }}>
                                                                {index + 1}
                                                            </span>
                                                            <div className="min-w-0">
                                                                <p className="break-words font-bold leading-snug text-slate-950">{item.description || 'Item sem descrição'}</p>
                                                                {quote.show_detailed_items && item.details && (
                                                                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-500">{item.details}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between text-sm sm:block sm:text-center">
                                                        <span className="font-bold text-slate-500 sm:hidden">Qtd</span>
                                                        <span className="font-semibold text-slate-800">{quantity}</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm sm:block sm:text-right">
                                                        <span className="font-bold text-slate-500 sm:hidden">Unitário</span>
                                                        <span className="font-semibold text-slate-800">{formatCurrency(unitPrice)}</span>
                                                    </div>
                                                    <div className="flex justify-between text-sm sm:block sm:text-right">
                                                        <span className="font-bold text-slate-500 sm:hidden">Total</span>
                                                        <span className="font-black text-slate-950">{formatCurrency(lineTotal)}</span>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>

                            {quote.show_timeline && (
                                <section className={cn('border p-5', skin.timelineClass)}>
                                    <TimelineSection themeColor={themeColor} estimatedDays={quote.estimated_days ?? undefined} quoteStatus={status} />
                                </section>
                            )}
                        </div>

                        <aside className="min-w-0 space-y-5">
                            <section className={cn('border p-6', skin.summaryClass)}>
                                <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/45">Resumo</p>
                                <div className="mt-5 space-y-3 text-sm">
                                    <div className="flex justify-between gap-4">
                                        <span className="text-white/60">Subtotal</span>
                                        <span className="font-bold">{formatCurrency(itemTotal)}</span>
                                    </div>
                                    {discount > 0 && (
                                        <div className="flex justify-between gap-4">
                                            <span className="text-white/60">Desconto</span>
                                            <span className="font-bold">-{formatCurrency(discount)}</span>
                                        </div>
                                    )}
                                    <div className="border-t border-white/10 pt-4">
                                        <span className="text-xs uppercase tracking-[0.18em] text-white/45">Total da proposta</span>
                                        <p className="mt-2 text-4xl font-black tracking-tight">{formatCurrency(total)}</p>
                                    </div>
                                </div>
                            </section>

                            {quote.show_payment_options && (
                                <PaymentOptions
                                    themeColor={themeColor}
                                    paymentMethods={quote.payment_methods}
                                    showCashDiscount={(quote.cash_discount_percent ?? 0) > 0 || (quote.cash_discount_fixed ?? 0) > 0}
                                    cashDiscountPercent={quote.cash_discount_percent ?? 0}
                                    cashDiscountFixed={quote.cash_discount_fixed ?? 0}
                                    cashDiscountType={quote.cash_discount_type ?? 'percent'}
                                    installmentCount={quote.installment_count}
                                    total={total}
                                />
                            )}

                            {(quote.payment_terms || quote.notes) && (
                                <section className={cn('border p-5', skin.bottomCardClass)}>
                                    <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-900">Condições</h3>
                                    {quote.payment_terms && <p className="mt-4 text-sm leading-6 text-slate-600">{quote.payment_terms}</p>}
                                    {quote.notes && <p className="mt-4 whitespace-pre-wrap border-t border-slate-200 pt-4 text-sm leading-6 text-slate-500">{quote.notes}</p>}
                                </section>
                            )}
                        </aside>
                    </section>

                    <section className={cn('border-t px-4 py-8 sm:px-10 lg:px-12', skin.bottomSectionClass)}>
                        <div className="grid min-w-0 gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
                            <div className="min-w-0 space-y-4">
                            <div className={cn('border p-6', skin.bottomCardClass)}>
                                <div className="mb-5 flex items-start gap-3">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl" style={{ backgroundColor: `${themeColor}18` }}>
                                        <ShieldCheck className="h-6 w-6" style={{ color: themeColor }} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black tracking-tight text-slate-950">Aprovação segura</h3>
                                        <p className="mt-1 text-sm leading-6 text-slate-500">
                                            O prestador não aprova a própria proposta. A decisão fica no link público enviado ao cliente.
                                        </p>
                                    </div>
                                </div>

                                {canClientRespond && ['pending', 'sent'].includes(status) ? (
                                    <ApproveQuoteClient quoteId={quote.id} publicToken={quote.public_token} clientName={quote.client_name} themeColor={themeColor} />
                                ) : isOwner ? (
                                    <>
                                        {quote.client_response_note && (
                                            <div className="mb-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                                                <p className="font-black uppercase tracking-[0.12em] text-amber-700">
                                                    Retorno do cliente
                                                </p>
                                                <p className="mt-2 whitespace-pre-wrap">{quote.client_response_note}</p>
                                            </div>
                                        )}
                                        <QuoteStatusActions
                                            quoteId={quote.id}
                                            currentStatus={status}
                                            isOwner={isOwner}
                                            whatsappLink={whatsappLink}
                                        />
                                        <QuoteStockActions
                                            quoteId={quote.id}
                                            status={status}
                                            pendingStockItems={pendingStockItems}
                                            deductedStockItems={deductedStockItems}
                                        />
                                    </>
                                ) : (
                                    <div className={cn('flex items-center gap-3 rounded-2xl border p-4', statusInfo.className)}>
                                        <BadgeCheck className="h-5 w-5" />
                                        <span className="font-bold">{statusInfo.label}</span>
                                    </div>
                                )}

                                {questionUrl && !isOwner && (
                                    <a href={questionUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
                                        <MessageCircle className="h-4 w-4" />
                                        Tirar dúvida pelo WhatsApp
                                    </a>
                                )}
                            </div>

                                {isOwner && reminder && (
                                    <QuoteReminderNotice reminder={reminder} followUpUrl={followUpUrl} />
                                )}

                                {isOwner && (
                                    <QuoteNextSteps
                                        status={status}
                                        paymentStatus={quote.payment_status}
                                        amountPaid={quote.amount_paid}
                                        total={total}
                                        pendingStockItems={pendingStockItems}
                                        deductedStockItems={deductedStockItems}
                                    />
                                )}

                                {isOwner && (
                                    <QuotePaymentActions
                                        quoteId={quote.id}
                                        total={total}
                                        paymentStatus={quote.payment_status}
                                        amountPaid={quote.amount_paid}
                                    />
                                )}
                            </div>

                            <div className={cn('border p-6 text-center', skin.bottomCardClass)}>
                                <div className="mx-auto inline-flex rounded-2xl border border-slate-200 bg-white p-3">
                                    <QRCodeGenerator quoteId={quote.id} token={quote.public_token} size={140} />
                                </div>
                                <p className="mt-4 text-xs leading-5 text-slate-500">
                                    QR Code único desta proposta. Use para abrir o link de aprovação no celular.
                                </p>
                            </div>
                        </div>

                        {footerText && (
                            <div className="mt-6 rounded-2xl border border-slate-200 bg-white/70 px-5 py-4 text-center text-sm font-medium leading-6 text-slate-600">
                                {footerText}
                            </div>
                        )}
                    </section>
                </article>
            </main>
        </div>
    )
}
