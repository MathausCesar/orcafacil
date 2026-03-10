import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Share2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import Image from 'next/image'
import { PrintButton } from '@/components/quotes/print-button'
import { cn } from '@/lib/utils'
import { QuoteStatusActions } from '@/components/quotes/quote-status-actions'
import { QuoteOwnerActions } from '@/components/quotes/quote-owner-actions'
import { QuoteShareModal } from '@/components/quotes/quote-share-modal'
import { QRCodeGenerator } from '@/components/quotes/qr-code-generator'
import { WarrantyBox } from '@/components/quotes/warranty-box'
import { ValueProposition } from '@/components/quotes/value-proposition'
import { TimelineSection } from '@/components/quotes/timeline-section'
import { UrgencyBadge } from '@/components/quotes/urgency-badge'
import { PaymentOptions } from '@/components/quotes/payment-options'
import { detectItemCategory, adjustColorBrightness } from '@/lib/utils/category-detection'
import { detectClientProfile, getToneClasses, getDensityClasses, shouldShowExtra } from '@/lib/utils/profile-detection'
import { Watermark } from '@/components/quotes/watermark'
import { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params

    return {
        title: `Orçamento #${id.substring(0, 8)} - Zacly`,
        description: 'Visualize seu orçamento no Zacly.',
        robots: {
            index: false,
            follow: false,
        },
    }
}

export default async function QuotePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    // Fetch quote
    const { data: quote, error } = await supabase
        .from('quotes')
        .select(`
      *,
      quote_items (*)
    `)
        .eq('id', id)
        .single()

    if (error || !quote) {
        notFound()
    }

    // Fetch profile (owner of the quote)
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', quote.user_id)
        .single()

    // Auth Check:
    // If user is logged in AND is the owner -> isOwner = true
    // If not logged in OR not owner -> isOwner = false (Public View)
    const isOwner = user?.id === quote.user_id

    const total = quote.total || 0;
    const approvalUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://zacly.com.br'}/quotes/${id}`;
    const totalFormatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total);
    const businessName = profile?.business_name || 'nossa empresa';
    const itemCount = quote.quote_items?.length ?? 0;

    const itemNames = quote.quote_items
        ?.map((item: any) => `  ▫️ ${item.description}`)
        .join('\n') || '';

    const whatsappLines = [
        `Olá, ${quote.client_name}! 👋`,
        ``,
        `Aqui é a ${businessName}. Preparamos com cuidado a proposta que você solicitou e estamos prontos para começar! 🚀`,
        ``,
        `📋 *Resumo do Orçamento*`,
        `• ${itemCount} ${itemCount === 1 ? 'item incluído' : 'itens incluídos'}${itemCount > 0 ? ':' : ''}`,
        ...(itemCount > 0 ? [itemNames] : []),
        `• Valor total: *${totalFormatted}*`,
        ...(quote.valid_until ? [`• Válido até: ${new Intl.DateTimeFormat('pt-BR').format(new Date(quote.valid_until))}`] : []),
        ``,
        `✅ *Veja a proposta completa e aprove com um clique:*`,
        approvalUrl,
        ``,
        `📄 Para salvar o PDF, acesse o link acima e use o botão de impressão (🖨️) → \"Salvar como PDF\".`,
        ``,
        `Por esse mesmo link você acompanha o andamento do serviço em tempo real! 📊`,
        ``,
        `Qualquer dúvida, estou à disposição! 😊`,
    ];
    const whatsappMessage = whatsappLines.join('\n');
    const whatsappLink = `https://wa.me/${quote.client_phone?.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappMessage)}`;

    // Layout Logic
    const themeColor = profile?.theme_color || '#0D9B5C';
    const gradientColor = adjustColorBrightness(themeColor, 15);

    // Detect client profile automatically
    const detectedProfile = detectClientProfile(
        {
            id: quote.id,
            total: quote.total,
            client_name: quote.client_name,
            quote_items: quote.quote_items,
        },
        {
            business_name: profile?.business_name,
            theme_color: profile?.theme_color,
            layout_style: profile?.layout_style,
        }
    );

    // Use quote's own layout first, fallback to profile setting, then auto-detect
    const layout = quote.layout_style || profile?.layout_style || detectedProfile.layout;
    const toneClasses = getToneClasses(detectedProfile.tone);
    const densityClasses = getDensityClasses(detectedProfile.density);

    // Personalização de Orçamento
    const isFree = !profile?.plan || profile?.plan === 'free';
    const rawQuoteSettings = profile?.quote_settings as any;

    const quoteSettings = isFree || !rawQuoteSettings ? {
        logoSize: 'medium',
        logoPosition: 'header',
        logoAlignment: 'left',
        footerText: '',
        quote_font_family: 'Inter'
    } : {
        logoSize: rawQuoteSettings.logoSize || 'medium',
        logoPosition: rawQuoteSettings.logoPosition || 'header',
        logoAlignment: rawQuoteSettings.logoAlignment || 'left',
        footerText: rawQuoteSettings.footerText || '',
        quote_font_family: rawQuoteSettings.quote_font_family || 'Inter'
    };

    const logoSizeMap: Record<string, string> = {
        small: 'h-12 w-20',
        medium: 'h-20 w-32',
        large: 'h-28 w-48'
    };
    const logoSizeClass = logoSizeMap[quoteSettings.logoSize] || logoSizeMap.medium;

    const blockAlignmentClasses = quoteSettings.logoAlignment === 'center' ? 'flex flex-col items-center text-center'
        : quoteSettings.logoAlignment === 'right' ? 'flex flex-col items-end text-right'
            : 'flex flex-col items-start text-left';

    const imageObjectFitClass = quoteSettings.logoAlignment === 'center' ? 'object-center'
        : quoteSettings.logoAlignment === 'right' ? 'object-right'
            : 'object-left';

    const logoConfig = {
        shouldShowInHeader: quoteSettings.logoPosition === 'header',
        shouldShowInFooter: quoteSettings.logoPosition === 'footer',
        wrapperClass: `relative mb-4 shrink-0 ${logoSizeClass}`,
        imageClass: `object-contain ${imageObjectFitClass}`,
        blockClass: blockAlignmentClasses
    };

    const FooterLogoAndText = () => (
        <div className={`w-full mt-8 space-y-4 ${logoConfig.blockClass}`}>
            {logoConfig.shouldShowInFooter && profile?.logo_url && (
                <div className={`relative ${logoSizeClass}`}>
                    <Image src={profile.logo_url} alt="Logo" fill className={logoConfig.imageClass} unoptimized />
                </div>
            )}
            {quoteSettings.footerText && (
                <p className="text-sm text-muted-foreground italic max-w-lg">
                    "{quoteSettings.footerText}"
                </p>
            )}
        </div>
    );

    return (
        <div
            className="force-light min-h-screen bg-slate-50 pb-20 print:bg-white print:pb-0"
            style={{
                '--theme-color': themeColor,
                colorScheme: 'light',
                fontFamily: quoteSettings.quote_font_family !== 'Inter' ? `"${quoteSettings.quote_font_family}", sans-serif` : undefined
            } as React.CSSProperties}
        >
            {/* Actions Header */}
            <div className="bg-white/90 backdrop-blur-xl border-b border-primary/10 px-4 py-3 flex items-center justify-between print:hidden sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-2">
                    <Link href="/">
                        <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary"><ArrowLeft className="h-5 w-5" /></Button>
                    </Link>
                    {/* Owner Actions (Delete, Edit) */}
                    {isOwner && <QuoteOwnerActions quoteId={quote.id} status={quote.status} />}
                </div>

                <div className="flex gap-2">
                    {isOwner && (
                        <QuoteShareModal
                            quoteId={quote.id}
                            clientName={quote.client_name}
                            approvalUrl={approvalUrl}
                            whatsappLink={whatsappLink}
                            businessName={businessName}
                            totalFormatted={totalFormatted}
                            whatsappMessage={whatsappMessage}
                        />
                    )}
                    <PrintButton />
                </div>
            </div>

            {/* Quote Document Wrapper */}
            <div className={cn(
                "max-w-3xl mx-auto p-4 md:p-8 print:p-0 print:max-w-none space-y-6",
                toneClasses,
                densityClasses
            )}>

                {/* Status Actions (Approve/Reject) - Visible to everyone, but context matters */}
                {/* Normally only client approves, but for simplicity showing to all if not pending? Or show always? */}
                {/* Let's show it prominently if status is pending or sent */}
                <div className="print:hidden relative z-30">
                    <QuoteStatusActions quoteId={quote.id} currentStatus={quote.status} isOwner={isOwner} />
                </div>

                {(!profile?.plan || profile?.plan === 'free') && <Watermark />}


                {/* MODERN LAYOUT */}
                {layout === 'modern' && (
                    <Card className="relative shadow-lg print:shadow-none print:border-none border-t-8 border-[var(--theme-color)] overflow-hidden">
                        <CardContent className="p-0">
                            {/* Modern Header */}
                            <div className="bg-[var(--theme-color)]/5 p-8 flex justify-between items-start">
                                <div className={logoConfig.blockClass}>
                                    {logoConfig.shouldShowInHeader && profile?.logo_url && (
                                        <div className={logoConfig.wrapperClass}>
                                            <Image src={profile.logo_url} alt="Logo" fill className={logoConfig.imageClass} unoptimized />
                                        </div>
                                    )}
                                    {profile?.business_name && <h1 className="text-2xl font-bold text-foreground">{profile.business_name}</h1>}
                                    <div className="text-sm text-muted-foreground mt-1 space-y-0.5">
                                        {profile?.cnpj && <p>CNPJ: {profile.cnpj}</p>}
                                        {profile?.phone && <p>{profile.phone}</p>}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <h2 className="text-3xl font-black text-[var(--theme-color)]/20 tracking-tighter">ORÇAMENTO</h2>
                                    <p className="font-mono text-lg font-bold text-[var(--theme-color)]">#{quote.id.substring(0, 8).toUpperCase()}</p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Data: {format(new Date(quote.created_at), "dd/MM/yyyy")}
                                    </p>
                                    {quote.valid_until && (
                                        <p className="text-sm text-red-500 font-medium">
                                            Válido até: {format(new Date(quote.valid_until), "dd/MM/yyyy")}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="p-8 space-y-8">
                                {/* Clients */}
                                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                                    <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-1">Cliente</p>
                                    <p className="font-bold text-lg text-foreground">{quote.client_name}</p>
                                    <p className="text-sm text-muted-foreground">{quote.client_phone}</p>
                                </div>

                                {/* Items - Mobile Cards */}
                                <div className="md:hidden space-y-3">
                                    <div className="grid grid-cols-4 gap-2 text-xs font-bold text-[var(--theme-color)] uppercase tracking-wider pb-2 border-b-2 border-[var(--theme-color)]/20 px-1">
                                        <div className="col-span-2">Descrição</div>
                                        <div className="text-right">Unit.</div>
                                        <div className="text-right">Total</div>
                                    </div>
                                    {quote.quote_items.map((item: any) => {
                                        const categoryInfo = detectItemCategory(item.description)
                                        const CategoryIcon = categoryInfo.icon
                                        return (
                                            <div key={item.id} className="grid grid-cols-4 gap-2 items-start py-3 border-b border-dashed border-slate-200 px-1">
                                                <div className="col-span-2 min-w-0">
                                                    <div className="flex items-start gap-1.5">
                                                        <CategoryIcon
                                                            className="h-3.5 w-3.5 flex-shrink-0 mt-0.5"
                                                            style={{ color: categoryInfo.color }}
                                                        />
                                                        <div className="min-w-0">
                                                            <p className="font-medium text-foreground text-sm leading-tight">{item.quantity} {item.description}</p>
                                                            {quote.show_detailed_items && item.details && (
                                                                <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap leading-relaxed">{item.details}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right text-xs text-muted-foreground whitespace-nowrap pt-0.5">
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.unit_price)}
                                                </div>
                                                <div className="text-right font-bold text-sm text-foreground whitespace-nowrap pt-0.5">
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.quantity * item.unit_price)}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Items - Desktop Table */}
                                <table className="hidden md:table w-full text-sm">
                                    <thead>
                                        <tr className="border-b-2 border-[var(--theme-color)]/20 text-left">
                                            <th className="py-3 font-bold text-[var(--theme-color)] pl-2">DESCRIÇÃO</th>
                                            <th className="py-3 font-bold text-[var(--theme-color)] text-center w-16">QTD</th>
                                            <th className="py-3 font-bold text-[var(--theme-color)] text-right whitespace-nowrap">UNIT.</th>
                                            <th className="py-3 font-bold text-[var(--theme-color)] text-right whitespace-nowrap pr-2">TOTAL</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-dashed divide-slate-200">
                                        {quote.quote_items.map((item: any) => {
                                            const categoryInfo = detectItemCategory(item.description)
                                            const CategoryIcon = categoryInfo.icon
                                            return (
                                                <tr key={item.id} className="group">
                                                    <td className="py-4 pl-2 font-medium text-foreground">
                                                        <div className="flex items-center gap-2">
                                                            <CategoryIcon
                                                                className="h-4 w-4 flex-shrink-0 print:h-3 print:w-3"
                                                                style={{ color: categoryInfo.color }}
                                                            />
                                                            <span>{item.description}</span>
                                                        </div>
                                                        {quote.show_detailed_items && item.details && (
                                                            <p className="text-sm text-muted-foreground mt-1 ml-6 whitespace-pre-wrap font-normal leading-relaxed">{item.details}</p>
                                                        )}
                                                    </td>
                                                    <td className="py-4 text-center text-muted-foreground">{item.quantity}</td>
                                                    <td className="py-4 text-right text-muted-foreground whitespace-nowrap">
                                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.unit_price)}
                                                    </td>
                                                    <td className="py-4 text-right font-bold text-foreground pr-2 whitespace-nowrap">
                                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.quantity * item.unit_price)}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>

                                {/* Totals */}
                                <div className="flex justify-end pt-4 border-t border-slate-100">
                                    <div className="min-w-fit space-y-2">
                                        <div className="flex justify-between gap-4 text-lg sm:text-xl font-bold bg-[var(--theme-color)] text-white p-3 rounded-md shadow-lg shadow-[var(--theme-color)]/20 whitespace-nowrap">
                                            <span>Total da Proposta</span>
                                            <span>{totalFormatted}</span>
                                        </div>

                                        {/* Detalhes de Desconto e Parcelamento */}
                                        <div className="flex flex-col items-end text-sm text-foreground/80 space-y-1 pr-1">
                                            {quote.cash_discount_type === 'percent' && (quote.cash_discount_percent ?? 0) > 0 && (
                                                <p className="font-semibold text-[var(--theme-color)]">
                                                    🔥 À vista: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total * (1 - (quote.cash_discount_percent ?? 0) / 100))} <span className="text-xs font-normal">({quote.cash_discount_percent}% desc.)</span>
                                                </p>
                                            )}
                                            {quote.cash_discount_type === 'fixed' && (quote.cash_discount_fixed ?? 0) > 0 && (
                                                <p className="font-semibold text-[var(--theme-color)]">
                                                    🔥 À vista: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.max(0, total - (quote.cash_discount_fixed ?? 0)))} <span className="text-xs font-normal">({new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(quote.cash_discount_fixed ?? 0)} desc.)</span>
                                                </p>
                                            )}
                                            {quote.installment_count && quote.installment_count > 1 && (
                                                <p className="text-muted-foreground">
                                                    💳 Ou em até <span className="font-semibold">{quote.installment_count}x</span> de <span className="font-semibold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total / quote.installment_count)}</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Urgency Badge - Always show for non-pending quotes (since pending replaces draft) */}
                                {quote.status !== 'pending' && (
                                    <div className="flex justify-center">
                                        <UrgencyBadge
                                            themeColor={themeColor}
                                            createdAt={quote.created_at}
                                            validityDays={7}
                                        />
                                    </div>
                                )}

                                {/* Timeline - Usar a opção escolhida na personalização do orçamento */}
                                {quote.show_timeline && (
                                    <TimelineSection
                                        themeColor={themeColor}
                                        estimatedDays={quote.estimated_days ?? undefined}
                                        quoteStatus={quote.status}
                                    />
                                )}

                                {/* Value Proposition - Show based on profile */}
                                {shouldShowExtra('value_proposition', detectedProfile) && (
                                    <div className="print:hidden">
                                        <ValueProposition themeColor={themeColor} />
                                    </div>
                                )}

                                {/* Payment Options - Usar a opção escolhida na personalização do orçamento */}
                                {quote.show_payment_options && (
                                    <PaymentOptions
                                        themeColor={themeColor}
                                        showCashDiscount={(quote.cash_discount_percent ?? 0) > 0 || (quote.cash_discount_fixed ?? 0) > 0}
                                        cashDiscountPercent={quote.cash_discount_percent ?? 0}
                                        cashDiscountFixed={quote.cash_discount_fixed ?? 0}
                                        cashDiscountType={quote.cash_discount_type ?? 'percent'}
                                        installmentCount={quote.installment_count}
                                        total={total}
                                    />
                                )}

                                {/* Warranty Box - Show based on profile */}
                                {shouldShowExtra('warranty', detectedProfile) && (
                                    <WarrantyBox themeColor={themeColor} />
                                )}

                                {/* Footer Notes */}
                                <div className="pt-6 text-center sm:text-left text-sm text-muted-foreground grid gap-4 border-t border-slate-100">
                                    {(quote.payment_terms || profile?.payment_info) && (
                                        <div>
                                            <span className="font-semibold text-foreground">Condições de Pagamento:</span>{' '}
                                            {quote.payment_terms || profile?.payment_info}
                                        </div>
                                    )}
                                    {quote.notes && (
                                        <div className="italic bg-yellow-50 p-3 rounded border border-yellow-100 text-yellow-800 text-xs">
                                            &quot;{quote.notes}&quot;
                                        </div>
                                    )}

                                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-slate-100">
                                        <div className="text-center sm:text-left">
                                            {isFree && <p className="text-xs text-slate-400">Orçamento gerado via Zacly</p>}
                                        </div>
                                        <QRCodeGenerator quoteId={quote.id} size={100} />
                                    </div>
                                    <FooterLogoAndText />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* PROFESSIONAL LAYOUT — Executive, subdued, sophisticated */}
                {layout === 'professional' && (
                    <Card className="relative shadow-lg print:shadow-none print:border-none rounded-none overflow-hidden border border-slate-200">
                        <CardContent className="p-0">
                            {/* Executive Header — Dark, authoritative */}
                            <div className="bg-slate-900 text-white p-8 md:p-10">
                                <div className="flex justify-between items-start gap-8">
                                    <div className={`flex-1 w-full ${logoConfig.blockClass}`}>
                                        {logoConfig.shouldShowInHeader && profile?.logo_url && (
                                            <div className={logoConfig.wrapperClass}>
                                                <Image src={profile.logo_url} alt="Logo" fill className={logoConfig.imageClass} unoptimized />
                                            </div>
                                        )}
                                        <h1 className="text-lg font-semibold tracking-wide uppercase">{profile?.business_name || 'Empresa'}</h1>
                                        <div className="text-sm text-slate-400 mt-1 space-y-0.5">
                                            {profile?.cnpj && <p>CNPJ: {profile.cnpj}</p>}
                                            <p>{[profile?.phone, profile?.email].filter(Boolean).join(' · ')}</p>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-xs font-medium uppercase tracking-widest text-slate-500">Proposta</p>
                                        <p className="text-2xl font-bold mt-1">#{quote.id.substring(0, 8).toUpperCase()}</p>
                                        <p className="text-sm text-slate-400 mt-2">{format(new Date(quote.created_at), "dd/MM/yyyy")}</p>
                                        {quote.valid_until && (
                                            <p className="text-sm text-slate-400 mt-1">
                                                Válido até {format(new Date(quote.valid_until), "dd/MM/yyyy")}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                {/* Brand color hairline */}
                                <div className="h-0.5 mt-6 rounded-full" style={{ backgroundColor: themeColor }} />
                            </div>

                            <div className="p-8 md:p-10 space-y-8">
                                {/* Client Section — Minimal */}
                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">Cliente</p>
                                        <p className="text-base font-semibold text-slate-900">{quote.client_name}</p>
                                        {quote.client_phone && <p className="text-sm text-slate-500 mt-0.5">{quote.client_phone}</p>}
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">Detalhes</p>
                                        <p className="text-sm text-slate-700">Data: {format(new Date(quote.created_at), "dd/MM/yyyy")}</p>
                                        {quote.valid_until && <p className="text-sm text-slate-700">Validade: {format(new Date(quote.valid_until), "dd/MM/yyyy")}</p>}
                                    </div>
                                </div>

                                {/* Items — Responsive */}
                                <div>
                                    {/* Mobile Cards */}
                                    <div className="md:hidden space-y-3">
                                        <div className="grid grid-cols-4 gap-2 text-[11px] font-semibold text-slate-800 uppercase tracking-wider pb-2 border-b-2 border-slate-800 px-1">
                                            <div className="col-span-2">Descrição</div>
                                            <div className="text-right">Unitário</div>
                                            <div className="text-right">Total</div>
                                        </div>
                                        {quote.quote_items.map((item: any) => (
                                            <div key={item.id} className="grid grid-cols-4 gap-2 items-start py-3 border-b border-slate-100 px-1">
                                                <div className="col-span-2 min-w-0">
                                                    <p className="font-medium text-slate-800 text-sm leading-tight">{item.quantity} {item.description}</p>
                                                    {quote.show_detailed_items && item.details && (
                                                        <p className="text-xs text-slate-400 mt-1 whitespace-pre-wrap leading-relaxed">{item.details}</p>
                                                    )}
                                                </div>
                                                <div className="text-right text-xs text-slate-500 whitespace-nowrap pt-0.5">
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.unit_price)}
                                                </div>
                                                <div className="text-right font-semibold text-sm text-slate-900 whitespace-nowrap pt-0.5">
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.quantity * item.unit_price)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Desktop Table */}
                                    <table className="hidden md:table w-full text-sm">
                                        <thead>
                                            <tr className="border-b-2 border-slate-800">
                                                <th className="py-3 text-left font-semibold text-slate-800 text-xs uppercase tracking-wider">Descrição</th>
                                                <th className="py-3 text-center font-semibold text-slate-800 text-xs uppercase tracking-wider w-16">Qtd</th>
                                                <th className="py-3 text-right font-semibold text-slate-800 text-xs uppercase tracking-wider whitespace-nowrap">Unitário</th>
                                                <th className="py-3 text-right font-semibold text-slate-800 text-xs uppercase tracking-wider whitespace-nowrap">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {quote.quote_items.map((item: any) => (
                                                <tr key={item.id} className="border-b border-slate-100">
                                                    <td className="py-3.5 font-medium text-slate-800">
                                                        <div>{item.description}</div>
                                                        {quote.show_detailed_items && item.details && (
                                                            <div className="text-xs text-slate-400 mt-1 whitespace-pre-wrap font-normal leading-relaxed">{item.details}</div>
                                                        )}
                                                    </td>
                                                    <td className="py-3.5 text-center text-slate-500">{item.quantity}</td>
                                                    <td className="py-3.5 text-right text-slate-500 whitespace-nowrap">
                                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.unit_price)}
                                                    </td>
                                                    <td className="py-3.5 text-right font-semibold text-slate-900 whitespace-nowrap">
                                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.quantity * item.unit_price)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {/* Total — Understated, right-aligned */}
                                    <div className="flex justify-end mt-4 pt-4 border-t border-slate-200">
                                        <div className="text-right">
                                            <p className="text-[11px] uppercase tracking-widest text-slate-400 mb-1">Total da Proposta</p>
                                            <p className="text-2xl font-bold text-slate-900 whitespace-nowrap mb-2">
                                                {totalFormatted}
                                            </p>

                                            {/* Detalhes de Desconto e Parcelamento */}
                                            <div className="flex flex-col items-end text-sm text-slate-600 space-y-1">
                                                {quote.cash_discount_type === 'percent' && (quote.cash_discount_percent ?? 0) > 0 && (
                                                    <p className="font-semibold text-slate-800">
                                                        🔥 À vista: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total * (1 - (quote.cash_discount_percent ?? 0) / 100))} <span className="text-xs font-normal">({quote.cash_discount_percent}% desc.)</span>
                                                    </p>
                                                )}
                                                {quote.cash_discount_type === 'fixed' && (quote.cash_discount_fixed ?? 0) > 0 && (
                                                    <p className="font-semibold text-slate-800">
                                                        🔥 À vista: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.max(0, total - (quote.cash_discount_fixed ?? 0)))} <span className="text-xs font-normal">({new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(quote.cash_discount_fixed ?? 0)} desc.)</span>
                                                    </p>
                                                )}
                                                {quote.installment_count && quote.installment_count > 1 && (
                                                    <p className="text-slate-500">
                                                        💳 Ou em até <span className="font-medium text-slate-700">{quote.installment_count}x</span> de <span className="font-medium text-slate-700">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total / quote.installment_count)}</span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Notes — Clean, neutral */}
                                {(quote.notes || quote.payment_terms) && (
                                    <div className="bg-slate-50 p-5 text-sm space-y-1.5 border-l-2 border-slate-300">
                                        {quote.payment_terms && <p className="text-slate-700"><span className="font-semibold text-slate-900">Pagamento:</span> {quote.payment_terms}</p>}
                                        {quote.notes && <p className="italic text-slate-500">{quote.notes}</p>}
                                    </div>
                                )}

                                {/* Timeline */}
                                {quote.show_timeline && (
                                    <TimelineSection themeColor="#334155" estimatedDays={quote.estimated_days ?? undefined} quoteStatus={quote.status} />
                                )}

                                {/* Payment Options */}
                                {quote.show_payment_options && (
                                    <PaymentOptions
                                        themeColor="#334155"
                                        showCashDiscount={(quote.cash_discount_percent ?? 0) > 0 || (quote.cash_discount_fixed ?? 0) > 0}
                                        cashDiscountPercent={quote.cash_discount_percent ?? 0}
                                        cashDiscountFixed={quote.cash_discount_fixed ?? 0}
                                        cashDiscountType={quote.cash_discount_type ?? 'percent'}
                                        installmentCount={quote.installment_count}
                                        total={total}
                                    />
                                )}

                                {/* Footer */}
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-slate-200 text-xs text-slate-400">
                                    {isFree ? <p>Orçamento gerado via Zacly</p> : <div />}
                                    <QRCodeGenerator quoteId={quote.id} size={80} />
                                </div>
                                <FooterLogoAndText />
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* CLASSIC LAYOUT — Elegant formal document */}
                {layout === 'classic' && (
                    <Card className="relative shadow-lg print:shadow-none print:border-none rounded-none border border-slate-300">
                        <CardContent className="p-10 md:p-14 space-y-8" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
                            {/* Ornamental Header */}
                            <div className={`space-y-5 w-full ${logoConfig.blockClass}`}>
                                <div className="border-t-2 border-b border-slate-800 py-1 w-full">
                                    <div className="border-t border-slate-800" />
                                </div>

                                {logoConfig.shouldShowInHeader && profile?.logo_url && (
                                    <div className={logoConfig.wrapperClass}>
                                        <Image src={profile.logo_url} alt="Logo" fill className={logoConfig.imageClass} unoptimized />
                                    </div>
                                )}
                                <h1 className="text-3xl font-normal text-slate-900 tracking-[0.2em] uppercase">{profile?.business_name}</h1>
                                <div className="text-sm text-slate-500 space-y-0.5 italic">
                                    {profile?.cnpj && <p>CNPJ: {profile.cnpj}</p>}
                                    <p>{[profile?.phone, profile?.email].filter(Boolean).join(' · ')}</p>
                                </div>

                                <div className="border-t-2 border-b border-slate-800 py-1">
                                    <div className="border-t border-slate-800" />
                                </div>
                            </div>

                            {/* Title Banner */}
                            <div className="text-center py-3 border border-slate-400">
                                <h2 className="text-lg font-bold uppercase tracking-[0.25em] text-slate-800">Proposta Comercial</h2>
                            </div>

                            {/* Client & Quote Info */}
                            <div className="grid grid-cols-2 gap-8 text-sm">
                                <div className="space-y-2">
                                    <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">Cliente</p>
                                    <p className="text-lg text-slate-900">{quote.client_name}</p>
                                    {quote.client_phone && <p className="text-slate-600">{quote.client_phone}</p>}
                                </div>
                                <div className="text-right space-y-2">
                                    <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">Referência</p>
                                    <p className="text-lg text-slate-900">Nº {quote.id.substring(0, 6).toUpperCase()}</p>
                                    <p className="text-slate-600">{format(new Date(quote.created_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
                                    {quote.valid_until && (
                                        <p className="text-slate-600 italic">Válido até {format(new Date(quote.valid_until), "dd/MM/yyyy")}</p>
                                    )}
                                </div>
                            </div>

                            {/* Urgency Badge */}
                            {quote.status !== 'pending' && (
                                <div className="flex justify-center border-t border-b border-slate-200 py-6 my-8">
                                    <UrgencyBadge
                                        themeColor={themeColor}
                                        createdAt={quote.created_at}
                                        validityDays={7}
                                    />
                                </div>
                            )}

                            {/* Items Table — Responsive */}
                            <div>
                                {/* Mobile Cards */}
                                <div className="md:hidden space-y-3">
                                    <div className="grid grid-cols-4 gap-2 bg-slate-800 text-white text-[11px] font-semibold uppercase tracking-wider py-2.5 px-3">
                                        <div className="col-span-2">Descrição</div>
                                        <div className="text-right">Unitário</div>
                                        <div className="text-right">Total</div>
                                    </div>
                                    {quote.quote_items.map((item: any, idx: number) => (
                                        <div key={item.id} className="grid grid-cols-4 gap-2 items-start py-3 border-b border-slate-200 px-3">
                                            <div className="col-span-2 min-w-0">
                                                <p className="font-medium text-slate-800 text-sm leading-tight">{item.quantity} {item.description}</p>
                                                {quote.show_detailed_items && item.details && (
                                                    <p className="text-xs italic text-slate-500 mt-1 whitespace-pre-wrap leading-relaxed">{item.details}</p>
                                                )}
                                            </div>
                                            <div className="text-right text-xs text-slate-600 whitespace-nowrap pt-0.5">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.unit_price)}
                                            </div>
                                            <div className="text-right font-semibold text-sm text-slate-900 whitespace-nowrap pt-0.5">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.quantity * item.unit_price)}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Desktop Table */}
                                <table className="hidden md:table w-full text-sm border-collapse">
                                    <thead>
                                        <tr className="bg-slate-800 text-white">
                                            <th className="py-2.5 pl-4 text-left font-semibold text-xs uppercase tracking-wider">Descrição</th>
                                            <th className="py-2.5 text-center font-semibold text-xs uppercase tracking-wider w-16">Qtd</th>
                                            <th className="py-2.5 text-right font-semibold text-xs uppercase tracking-wider whitespace-nowrap">Unitário</th>
                                            <th className="py-2.5 pr-4 text-right font-semibold text-xs uppercase tracking-wider whitespace-nowrap">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {quote.quote_items.map((item: any, idx: number) => (
                                            <tr key={item.id} className="border-b border-slate-200">
                                                <td className="py-3 pl-4">
                                                    <div className="font-medium text-slate-800">{item.description}</div>
                                                    {quote.show_detailed_items && item.details && (
                                                        <div className="text-xs italic text-slate-500 mt-1 whitespace-pre-wrap leading-relaxed">{item.details}</div>
                                                    )}
                                                </td>
                                                <td className="py-3 text-center text-slate-600">{item.quantity}</td>
                                                <td className="py-3 text-right text-slate-600 whitespace-nowrap">
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.unit_price)}
                                                </td>
                                                <td className="py-3 pr-4 text-right font-semibold text-slate-900 whitespace-nowrap">
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.quantity * item.unit_price)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Total — Double border formal block */}
                                <div className="flex justify-end mt-4">
                                    <div className="border-2 border-slate-800 px-6 sm:px-8 py-4 text-right">
                                        <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Total a Pagar</p>
                                        <p className="text-xl sm:text-2xl font-bold text-slate-900 whitespace-nowrap mb-2">
                                            {totalFormatted}
                                        </p>

                                        {/* Detalhes de Desconto e Parcelamento */}
                                        <div className="flex flex-col items-end text-sm text-slate-700 space-y-1 border-t border-slate-200 mt-3 pt-3">
                                            {quote.cash_discount_type === 'percent' && (quote.cash_discount_percent ?? 0) > 0 && (
                                                <p className="font-semibold text-slate-900">
                                                    🔥 À vista: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total * (1 - (quote.cash_discount_percent ?? 0) / 100))} <span className="text-xs font-normal text-slate-500">({quote.cash_discount_percent}% desc.)</span>
                                                </p>
                                            )}
                                            {quote.cash_discount_type === 'fixed' && (quote.cash_discount_fixed ?? 0) > 0 && (
                                                <p className="font-semibold text-slate-900">
                                                    🔥 À vista: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Math.max(0, total - (quote.cash_discount_fixed ?? 0)))} <span className="text-xs font-normal text-slate-500">({new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(quote.cash_discount_fixed ?? 0)} desc.)</span>
                                                </p>
                                            )}
                                            {quote.installment_count && quote.installment_count > 1 && (
                                                <p className="text-slate-600">
                                                    💳 Ou em até <span className="font-bold">{quote.installment_count}x</span> de <span className="font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total / quote.installment_count)}</span>
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            {(quote.notes || quote.payment_terms) && (
                                <div className="border border-slate-300 p-6 text-sm space-y-2">
                                    <p className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-2">Observações</p>
                                    {quote.payment_terms && <p className="text-slate-800"><span className="font-semibold">Pagamento:</span> {quote.payment_terms}</p>}
                                    {quote.notes && <p className="italic text-slate-600">{quote.notes}</p>}
                                </div>
                            )}

                            {/* Timeline */}
                            {quote.show_timeline && (
                                <TimelineSection themeColor="#1e293b" estimatedDays={quote.estimated_days ?? undefined} quoteStatus={quote.status} />
                            )}

                            {/* Value Proposition */}
                            {shouldShowExtra('value_proposition', detectedProfile) && (
                                <div className="print:hidden">
                                    <ValueProposition themeColor="#1e293b" />
                                </div>
                            )}

                            {/* Payment Options */}
                            {quote.show_payment_options && (
                                <PaymentOptions
                                    themeColor="#1e293b"
                                    showCashDiscount={(quote.cash_discount_percent ?? 0) > 0 || (quote.cash_discount_fixed ?? 0) > 0}
                                    cashDiscountPercent={quote.cash_discount_percent ?? 0}
                                    cashDiscountFixed={quote.cash_discount_fixed ?? 0}
                                    cashDiscountType={quote.cash_discount_type ?? 'percent'}
                                    installmentCount={quote.installment_count}
                                    total={total}
                                />
                            )}

                            {/* Warranty Box */}
                            {shouldShowExtra('warranty', detectedProfile) && (
                                <WarrantyBox themeColor="#1e293b" />
                            )}

                            {/* Signatures */}
                            <div className="text-center pt-12 pb-4 space-y-10">
                                <div className="grid grid-cols-2 gap-20 px-8">
                                    <div className="pt-2">
                                        <div className="border-b border-dashed border-slate-400 mb-2 h-12" />
                                        <p className="text-xs uppercase tracking-wider text-slate-500">Assinatura do Responsável</p>
                                    </div>
                                    <div className="pt-2">
                                        <div className="border-b border-dashed border-slate-400 mb-2 h-12" />
                                        <p className="text-xs uppercase tracking-wider text-slate-500">Aprovação do Cliente</p>
                                    </div>
                                </div>
                                <div className="border-t border-slate-300 pt-4">
                                    <p className="text-xs uppercase tracking-[0.15em] text-slate-400">
                                        Orçamento válido por {quote.valid_until ? format(new Date(quote.valid_until), "dd/MM/yyyy") : '15 dias'}
                                    </p>
                                </div>
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-slate-200 text-xs text-slate-400 mt-6">
                                    {isFree ? <p>Orçamento gerado via Zacly</p> : <div />}
                                    <QRCodeGenerator quoteId={quote.id} size={80} />
                                </div>
                                <FooterLogoAndText />
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* MINIMALIST LAYOUT — Barebones, typography focused */}
                {layout === 'minimalist' && (
                    <div className="bg-white p-8 md:p-16 print:p-0 space-y-12 shadow-sm rounded-none border border-slate-100">
                        {/* Header */}
                        <div className={`flex flex-col gap-6 w-full ${logoConfig.blockClass}`}>
                            {logoConfig.shouldShowInHeader && profile?.logo_url && (
                                <div className={logoConfig.wrapperClass}>
                                    <Image src={profile.logo_url} alt="Logo" fill className={logoConfig.imageClass} unoptimized />
                                </div>
                            )}
                            <div className="w-12 h-1 mb-2" style={{ backgroundColor: themeColor }}></div>
                            <div>
                                <h1 className="text-2xl font-light tracking-tight text-slate-900">{profile?.business_name}</h1>
                                <p className="text-sm text-slate-500 mt-1">{[profile?.phone, profile?.email].filter(Boolean).join(' · ')}</p>
                            </div>
                        </div>

                        {/* Proposal Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-sm leading-relaxed border-t border-b border-slate-100 py-8">
                            <div>
                                <p className="text-slate-400 uppercase tracking-widest text-[10px] font-bold mb-3">Para</p>
                                <p className="text-lg text-slate-900">{quote.client_name}</p>
                                {quote.client_phone && <p className="text-slate-500">{quote.client_phone}</p>}
                            </div>
                            <div className="md:text-right">
                                <p className="text-slate-400 uppercase tracking-widest text-[10px] font-bold mb-3">Proposta</p>
                                <p className="text-slate-900">Nº {quote.id.substring(0, 8).toUpperCase()}</p>
                                <p className="text-slate-500">{format(new Date(quote.created_at), "dd/MM/yyyy")}</p>
                                {quote.valid_until && <p className="text-slate-400">Validade: {format(new Date(quote.valid_until), "dd/MM/yyyy")}</p>}
                            </div>
                        </div>

                        {/* Urgency Badge */}
                        {quote.status !== 'pending' && (
                            <div className="flex justify-center">
                                <UrgencyBadge
                                    themeColor={themeColor}
                                    createdAt={quote.created_at}
                                    validityDays={7}
                                />
                            </div>
                        )}

                        {/* Items */}
                        <div className="space-y-6">
                            {quote.quote_items.map((item: any, idx: number) => (
                                <div key={item.id} className="flex flex-col md:flex-row md:items-start justify-between gap-4 py-4 border-b border-slate-50">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <span className="text-slate-300 font-mono text-xs">{String(idx + 1).padStart(2, '0')}</span>
                                            <span className="font-medium text-slate-900">{item.description}</span>
                                        </div>
                                        {quote.show_detailed_items && item.details && (
                                            <p className="text-sm text-slate-500 mt-2 ml-7 whitespace-pre-wrap">{item.details}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-8 ml-7 md:ml-0 text-sm">
                                        <div className="text-slate-500 whitespace-nowrap">{item.quantity} x {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.unit_price)}</div>
                                        <div className="font-medium text-slate-900 w-24 text-right whitespace-nowrap">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.quantity * item.unit_price)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Total */}
                        <div className="flex justify-end pt-8">
                            <div className="w-full md:w-1/2 lg:w-1/3">
                                <div className="flex justify-between items-end border-b-2 py-4" style={{ borderColor: themeColor }}>
                                    <span className="text-xs uppercase tracking-widest text-slate-500 font-bold">Total</span>
                                    <span className="text-3xl font-light text-slate-900">{totalFormatted}</span>
                                </div>
                                <div className="mt-4 space-y-2 text-right text-sm text-slate-600">
                                    {quote.cash_discount_type === 'percent' && (quote.cash_discount_percent ?? 0) > 0 && (
                                        <p>À vista: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total * (1 - (quote.cash_discount_percent ?? 0) / 100))} ({(quote.cash_discount_percent ?? 0)}%)</p>
                                    )}
                                    {quote.installment_count && quote.installment_count > 1 && (
                                        <p>Em até {quote.installment_count}x de {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total / quote.installment_count)}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {(quote.notes || quote.payment_terms) && (
                            <div className="pt-8 text-sm text-slate-600 space-y-4">
                                {quote.payment_terms && <p><span className="font-semibold text-slate-900">Termos:</span> {quote.payment_terms}</p>}
                                {quote.notes && <p className="italic">{quote.notes}</p>}
                            </div>
                        )}

                        {/* Conversion Triggers */}
                        <div className="py-8 space-y-8">
                            {/* Timeline */}
                            {quote.show_timeline && (
                                <TimelineSection themeColor={themeColor} estimatedDays={quote.estimated_days ?? undefined} quoteStatus={quote.status} />
                            )}

                            {/* Value Proposition */}
                            {shouldShowExtra('value_proposition', detectedProfile) && (
                                <div className="print:hidden">
                                    <ValueProposition themeColor={themeColor} />
                                </div>
                            )}

                            {/* Payment Options */}
                            {quote.show_payment_options && (
                                <PaymentOptions
                                    themeColor={themeColor}
                                    showCashDiscount={(quote.cash_discount_percent ?? 0) > 0 || (quote.cash_discount_fixed ?? 0) > 0}
                                    cashDiscountPercent={quote.cash_discount_percent ?? 0}
                                    cashDiscountFixed={quote.cash_discount_fixed ?? 0}
                                    cashDiscountType={quote.cash_discount_type ?? 'percent'}
                                    installmentCount={quote.installment_count}
                                    total={total}
                                />
                            )}

                            {/* Warranty Box */}
                            {shouldShowExtra('warranty', detectedProfile) && (
                                <WarrantyBox themeColor={themeColor} />
                            )}
                        </div>

                        <div className="flex justify-between items-end pt-16 mt-8 border-t border-slate-100">
                            <FooterLogoAndText />
                            <QRCodeGenerator quoteId={quote.id} size={64} />
                        </div>
                    </div>
                )}

                {/* AGENCY LAYOUT — Colorful, modern, rounded */}
                {layout === 'agency' && (
                    <Card className="relative shadow-xl print:shadow-none print:border-none rounded-[2rem] border-0 overflow-hidden bg-slate-100">
                        <CardContent className="p-2 sm:p-4">
                            <div className="bg-white rounded-[1.5rem] p-6 sm:p-10 shadow-sm border border-slate-100 relative overflow-hidden">
                                {/* Decorative blob */}
                                <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full opacity-10 blur-3xl pointer-events-none" style={{ backgroundColor: themeColor }}></div>

                                {/* Header */}
                                <div className="flex flex-col md:flex-row justify-between items-start gap-8 relative z-10">
                                    <div className={`w-full ${logoConfig.blockClass}`}>
                                        {logoConfig.shouldShowInHeader && profile?.logo_url ? (
                                            <div className={logoConfig.wrapperClass}>
                                                <Image src={profile.logo_url} alt="Logo" fill className={logoConfig.imageClass} unoptimized />
                                            </div>
                                        ) : (
                                            <div className="h-16 w-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-md shadow-[var(--theme-color)]/20 mb-4" style={{ backgroundColor: themeColor }}>
                                                {profile?.business_name?.charAt(0) || 'E'}
                                            </div>
                                        )}
                                        <h1 className="text-xl font-bold mt-2" style={{ color: themeColor }}>{profile?.business_name}</h1>
                                        <p className="text-sm text-slate-500 font-medium">{[profile?.phone, profile?.email].filter(Boolean).join(' • ')}</p>
                                    </div>
                                    <div className="bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100 text-center w-full md:w-auto shrink-0">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Proposta</p>
                                        <p className="text-xl font-black text-slate-800 my-1">#{quote.id.substring(0, 8)}</p>
                                        <div className="flex flex-col gap-1 mt-2 text-xs font-semibold text-slate-500">
                                            <div className="flex justify-between gap-4"><span>Criada:</span> <span>{format(new Date(quote.created_at), "dd/MM/yy")}</span></div>
                                            {quote.valid_until && <div className="flex justify-between gap-4"><span>Validade:</span> <span style={{ color: themeColor }}>{format(new Date(quote.valid_until), "dd/MM/yy")}</span></div>}
                                        </div>
                                    </div>
                                </div>

                                <div className="my-10 p-6 sm:p-8 rounded-2xl" style={{ backgroundColor: `${themeColor}0a` }}>
                                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                                        <div className="h-16 w-16 shrink-0 rounded-full flex items-center justify-center text-xl shadow-inner bg-white font-bold" style={{ color: themeColor }}>
                                            {quote.client_name.charAt(0)}
                                        </div>
                                        <div className="text-center sm:text-left">
                                            <p className="text-xs font-bold uppercase tracking-widest mb-1 opacity-60" style={{ color: themeColor }}>Preparado para</p>
                                            <h2 className="text-2xl font-bold text-slate-900">{quote.client_name}</h2>
                                            {quote.client_phone && <p className="text-slate-600 mt-1">{quote.client_phone}</p>}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-slate-900 border-b-2 border-slate-100 pb-2 mb-6">Investimento</h3>
                                    {quote.quote_items.map((item: any) => (
                                        <div key={item.id} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm transition-shadow hover:shadow-md flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                                            <div className="flex gap-4 items-start flex-1 min-w-0">
                                                <div className="bg-slate-50 w-10 h-10 rounded-lg flex items-center justify-center text-slate-400 font-bold shrink-0">{item.quantity}x</div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-slate-800 text-base">{item.description}</p>
                                                    {quote.show_detailed_items && item.details && <p className="text-sm text-slate-500 mt-1 line-clamp-2 md:line-clamp-none whitespace-pre-wrap">{item.details}</p>}
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0 w-full md:w-auto flex justify-between md:block px-2 md:px-0">
                                                <span className="md:hidden text-slate-400 text-sm">Valor</span>
                                                <span className="font-bold text-lg text-slate-900 whitespace-nowrap">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.quantity * item.unit_price)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-10 p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden" style={{ backgroundColor: themeColor }}>
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                                    <div className="flex flex-col sm:flex-row justify-between items-center gap-6 relative z-10">
                                        <div className="text-center sm:text-left">
                                            <p className="text-white/80 text-sm font-semibold uppercase tracking-wider mb-1">Total do Projeto</p>
                                            <p className="text-4xl sm:text-5xl font-black tracking-tight">{totalFormatted}</p>
                                        </div>
                                        <div className="flex flex-col items-center sm:items-end gap-2 text-white/90 text-sm font-medium bg-black/10 p-4 rounded-xl w-full sm:w-auto">
                                            {quote.cash_discount_type === 'percent' && (quote.cash_discount_percent ?? 0) > 0 && (
                                                <p>À vista: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total * (1 - (quote.cash_discount_percent ?? 0) / 100))}</p>
                                            )}
                                            {quote.installment_count && quote.installment_count > 1 && (
                                                <p>Até {quote.installment_count}x sem juros</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {(quote.notes || quote.payment_terms) && (
                                    <div className="mt-8 bg-slate-50 rounded-2xl p-6 text-sm text-slate-600">
                                        {quote.payment_terms && <p className="mb-3"><span className="font-bold text-slate-800">Pagamento:</span> {quote.payment_terms}</p>}
                                        {quote.notes && <p className="italic">{quote.notes}</p>}
                                    </div>
                                )}

                                {/* Conversion Triggers */}
                                <div className="mt-12 space-y-8">
                                    {/* Urgency Badge */}
                                    {quote.status !== 'pending' && (
                                        <div className="flex justify-center">
                                            <UrgencyBadge themeColor={themeColor} createdAt={quote.created_at} validityDays={7} />
                                        </div>
                                    )}

                                    {/* Timeline */}
                                    {quote.show_timeline && (
                                        <div className="bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
                                            <TimelineSection themeColor={themeColor} estimatedDays={quote.estimated_days ?? undefined} quoteStatus={quote.status} />
                                        </div>
                                    )}

                                    {/* Value Proposition */}
                                    {shouldShowExtra('value_proposition', detectedProfile) && (
                                        <div className="print:hidden">
                                            <ValueProposition themeColor={themeColor} />
                                        </div>
                                    )}

                                    {/* Payment Options */}
                                    {quote.show_payment_options && (
                                        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
                                            <PaymentOptions
                                                themeColor={themeColor}
                                                showCashDiscount={(quote.cash_discount_percent ?? 0) > 0 || (quote.cash_discount_fixed ?? 0) > 0}
                                                cashDiscountPercent={quote.cash_discount_percent ?? 0}
                                                cashDiscountFixed={quote.cash_discount_fixed ?? 0}
                                                cashDiscountType={quote.cash_discount_type ?? 'percent'}
                                                installmentCount={quote.installment_count}
                                                total={total}
                                            />
                                        </div>
                                    )}

                                    {/* Warranty Box */}
                                    {shouldShowExtra('warranty', detectedProfile) && (
                                        <div className="bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
                                            <WarrantyBox themeColor={themeColor} />
                                        </div>
                                    )}
                                </div>

                                <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-slate-100 pt-8">
                                    <FooterLogoAndText />
                                    <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-sm shrink-0">
                                        <QRCodeGenerator quoteId={quote.id} size={72} />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* IMPACT LAYOUT — High contrast, dark accents */}
                {layout === 'impact' && (
                    <Card className="relative shadow-2xl print:shadow-none print:border-none rounded-none border-x-0 sm:border-x border-y-0 sm:border border-slate-800 bg-slate-900 text-slate-100 overflow-hidden">
                        {/* Huge background text */}
                        <div className="absolute top-0 right-0 text-[10rem] font-black text-slate-800/50 leading-none -mt-12 -mr-12 pointer-events-none select-none tracking-tighter">
                            PROPOSTA
                        </div>
                        <CardContent className="p-0 relative z-10">
                            <div className="p-8 sm:p-12">
                                <div className="flex flex-col md:flex-row justify-between items-start gap-12">
                                    <div className={`w-full ${logoConfig.blockClass}`}>
                                        {logoConfig.shouldShowInHeader && profile?.logo_url ? (
                                            <div className={logoConfig.wrapperClass}>
                                                <Image src={profile.logo_url} alt="Logo" fill className={logoConfig.imageClass} unoptimized />
                                            </div>
                                        ) : (
                                            <h1 className="text-3xl font-black tracking-tight" style={{ color: themeColor }}>{profile?.business_name}</h1>
                                        )}
                                        <div className="mt-4 text-sm font-mono text-slate-400">
                                            {profile?.cnpj && <p>CNPJ {profile.cnpj}</p>}
                                            {profile?.phone && <p>{profile.phone}</p>}
                                        </div>
                                    </div>
                                    <div className="border border-slate-700 p-6 w-full md:w-64 bg-slate-800/50 backdrop-blur-sm shrink-0">
                                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-bold mb-4">Orçamento</p>
                                        <p className="font-mono text-2xl text-white mb-6">#{quote.id.substring(0, 8)}</p>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between border-b border-slate-700 pb-1">
                                                <span className="text-slate-400">Data</span>
                                                <span className="font-mono text-white">{format(new Date(quote.created_at), "dd/MM")}</span>
                                            </div>
                                            {quote.valid_until && (
                                                <div className="flex justify-between border-b border-slate-700 pb-1">
                                                    <span className="text-slate-400">Expira</span>
                                                    <span className="font-mono" style={{ color: themeColor }}>{format(new Date(quote.valid_until), "dd/MM")}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-16 sm:mt-24 border-l-4 pl-6 sm:pl-8 py-2" style={{ borderColor: themeColor }}>
                                    <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-2">Preparado Especialmente Para</p>
                                    <p className="text-3xl sm:text-4xl font-bold text-white tracking-tight">{quote.client_name}</p>
                                    <p className="text-slate-400 mt-2 font-mono text-sm">{quote.client_phone}</p>
                                </div>

                                <div className="mt-16">
                                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-4 text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-slate-700 pb-4 mb-4">
                                        <div className="col-span-3 sm:col-span-4">Item & Descrição</div>
                                        <div className="text-center sm:text-right hidden sm:block">Unit.</div>
                                        <div className="text-right">Total</div>
                                    </div>
                                    <div className="space-y-4">
                                        {quote.quote_items.map((item: any, idx: number) => (
                                            <div key={item.id} className="grid grid-cols-4 sm:grid-cols-6 gap-4 items-start bg-slate-800/30 p-4 sm:p-5 border border-slate-800 hover:border-slate-600 transition-colors">
                                                <div className="col-span-3 sm:col-span-4 min-w-0">
                                                    <div className="flex items-start gap-4">
                                                        <div className="font-mono text-slate-600 text-sm hidden sm:block">{String(idx + 1).padStart(2, '0')}</div>
                                                        <div className="min-w-0">
                                                            <p className="font-bold text-white text-base sm:text-lg leading-tight break-words">
                                                                <span className="sm:hidden text-slate-500 font-normal mr-2">{item.quantity}x</span>
                                                                {item.description}
                                                            </p>
                                                            {quote.show_detailed_items && item.details && (
                                                                <p className="text-sm text-slate-400 mt-2 whitespace-pre-wrap">{item.details}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right font-mono text-slate-500 text-sm mt-1 hidden sm:block whitespace-nowrap">
                                                    <div className="text-[10px] uppercase text-slate-600 mb-1">{item.quantity} un</div>
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.unit_price)}
                                                </div>
                                                <div className="text-right font-mono font-bold text-white text-base sm:text-lg mt-0.5 whitespace-nowrap">
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.quantity * item.unit_price)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-8 flex justify-end">
                                    <div className="w-full sm:w-80 bg-slate-800 p-6 sm:p-8 border-l-4" style={{ borderColor: themeColor }}>
                                        <p className="text-xs uppercase tracking-widest text-slate-400 mb-2">Total</p>
                                        <p className="text-4xl text-white font-black tracking-tighter whitespace-nowrap">{totalFormatted}</p>

                                        <div className="mt-6 space-y-3 pt-6 border-t border-slate-700">
                                            {quote.cash_discount_type === 'percent' && (quote.cash_discount_percent ?? 0) > 0 && (
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-slate-400">À vista</span>
                                                    <span className="text-white font-mono font-bold" style={{ color: themeColor }}>
                                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total * (1 - (quote.cash_discount_percent ?? 0) / 100))}
                                                    </span>
                                                </div>
                                            )}
                                            {quote.installment_count && quote.installment_count > 1 && (
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-slate-400">{quote.installment_count}x sem juros</span>
                                                    <span className="text-white font-mono font-bold">
                                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total / quote.installment_count)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {(quote.notes || quote.payment_terms) && (
                                    <div className="mt-16 grid sm:grid-cols-2 gap-8 text-sm">
                                        {quote.payment_terms && (
                                            <div>
                                                <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-2">Formas de Pagamento</p>
                                                <p className="text-slate-300 leading-relaxed">{quote.payment_terms}</p>
                                            </div>
                                        )}
                                        {quote.notes && (
                                            <div>
                                                <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-2">Avisos Importantes</p>
                                                <p className="text-slate-400 leading-relaxed italic">{quote.notes}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Conversion Triggers in high contrast block */}
                                <div className="mt-16 bg-slate-50 rounded-xl p-6 sm:p-10 text-slate-900 shadow-2xl space-y-8 border border-slate-200">
                                    <h3 className="text-xl sm:text-2xl font-black tracking-tight text-center mb-8" style={{ color: themeColor }}>Detalhes da Execução</h3>

                                    {/* Urgency Badge */}
                                    {quote.status !== 'pending' && (
                                        <div className="flex justify-center border-b border-slate-200 pb-8">
                                            <UrgencyBadge themeColor={themeColor} createdAt={quote.created_at} validityDays={7} />
                                        </div>
                                    )}

                                    {/* Timeline */}
                                    {quote.show_timeline && (
                                        <TimelineSection themeColor={themeColor} estimatedDays={quote.estimated_days ?? undefined} quoteStatus={quote.status} />
                                    )}

                                    {/* Value Proposition */}
                                    {shouldShowExtra('value_proposition', detectedProfile) && (
                                        <div className="print:hidden">
                                            <ValueProposition themeColor={themeColor} />
                                        </div>
                                    )}

                                    {/* Payment Options */}
                                    {quote.show_payment_options && (
                                        <PaymentOptions
                                            themeColor={themeColor}
                                            showCashDiscount={(quote.cash_discount_percent ?? 0) > 0 || (quote.cash_discount_fixed ?? 0) > 0}
                                            cashDiscountPercent={quote.cash_discount_percent ?? 0}
                                            cashDiscountFixed={quote.cash_discount_fixed ?? 0}
                                            cashDiscountType={quote.cash_discount_type ?? 'percent'}
                                            installmentCount={quote.installment_count}
                                            total={total}
                                        />
                                    )}

                                    {/* Warranty Box */}
                                    {shouldShowExtra('warranty', detectedProfile) && (
                                        <WarrantyBox themeColor={themeColor} />
                                    )}
                                </div>

                                <div className="mt-20 flex flex-col sm:flex-row justify-between items-end border-t border-slate-800 pt-8">
                                    <div className="text-slate-500 text-xs w-full">
                                        <FooterLogoAndText />
                                    </div>
                                    <div className="bg-white p-2 mt-6 sm:mt-0 shrink-0">
                                        <QRCodeGenerator quoteId={quote.id} size={64} />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

            </div>
        </div>
    )
}
