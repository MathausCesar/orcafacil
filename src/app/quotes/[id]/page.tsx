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
import { QRCodeGenerator } from '@/components/quotes/qr-code-generator'
import { WarrantyBox } from '@/components/quotes/warranty-box'
import { ValueProposition } from '@/components/quotes/value-proposition'
import { TimelineSection } from '@/components/quotes/timeline-section'
import { UrgencyBadge } from '@/components/quotes/urgency-badge'
import { PaymentOptions } from '@/components/quotes/payment-options'
import { detectItemCategory, adjustColorBrightness } from '@/lib/utils/category-detection'
import { detectClientProfile, getToneClasses, getDensityClasses, shouldShowExtra } from '@/lib/utils/profile-detection'
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
    const approvalUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://zacly.com.br'}/quotes/${id}/approve`;
    const totalFormatted = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total);
    const businessName = profile?.business_name || 'nossa empresa';
    const itemCount = quote.quote_items?.length ?? 0;

    const whatsappLines = [
        `Olá, ${quote.client_name}! 👋`,
        ``,
        `Aqui é a ${businessName}. Preparamos com cuidado a proposta que você solicitou e estamos prontos para começar! 🚀`,
        ``,
        `📋 *Resumo do Orçamento*`,
        `• ${itemCount} ${itemCount === 1 ? 'item incluído' : 'itens incluídos'}`,
        `• Valor total: *${totalFormatted}*`,
        ...(quote.valid_until ? [`• Válido até: ${new Intl.DateTimeFormat('pt-BR').format(new Date(quote.valid_until))}`] : []),
        ``,
        `✅ *Aprovar a proposta com um clique:*`,
        approvalUrl,
        ``,
        `📄 Para salvar o PDF da proposta, acesse o link acima e use o botão de impressão (🖨️) → "Salvar como PDF".`,
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

    return (
        <div
            className="force-light min-h-screen bg-slate-50 pb-20 print:bg-white print:pb-0"
            style={{ '--theme-color': themeColor, colorScheme: 'light' } as React.CSSProperties}
        >
            {/* Actions Header */}
            <div className="bg-white/90 backdrop-blur-xl border-b border-primary/10 px-4 py-3 flex items-center justify-between print:hidden sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-2">
                    <Link href="/">
                        <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary"><ArrowLeft className="h-5 w-5" /></Button>
                    </Link>
                    {/* Owner Actions (Delete, Edit) */}
                    {isOwner && <QuoteOwnerActions quoteId={quote.id} />}
                </div>

                <div className="flex gap-2">
                    <Link href={whatsappLink} target="_blank">
                        <Button variant="outline" size="sm" className="gap-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50">
                            <Share2 className="h-4 w-4" /> <span className="hidden sm:inline">WhatsApp</span>
                        </Button>
                    </Link>
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
                <div className="print:hidden">
                    <QuoteStatusActions quoteId={quote.id} currentStatus={quote.status} isOwner={isOwner} />
                </div>

                {/* MODERN LAYOUT */}
                {layout === 'modern' && (
                    <Card className="shadow-lg print:shadow-none print:border-none border-t-8 border-[var(--theme-color)] overflow-hidden">
                        <CardContent className="p-0">
                            {/* Modern Header */}
                            <div className="bg-[var(--theme-color)]/5 p-8 flex justify-between items-start">
                                <div>
                                    {profile?.logo_url && (
                                        <div className="relative h-20 w-32 mb-4">
                                            <Image src={profile.logo_url} alt="Logo" fill className="object-contain object-left" unoptimized />
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

                                {/* Items */}
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b-2 border-[var(--theme-color)]/20 text-left">
                                            <th className="py-3 font-bold text-[var(--theme-color)] pl-2">DESCRIÇÃO</th>
                                            <th className="py-3 font-bold text-[var(--theme-color)] text-center w-20">QTD</th>
                                            <th className="py-3 font-bold text-[var(--theme-color)] text-right w-24">UNIT.</th>
                                            <th className="py-3 font-bold text-[var(--theme-color)] text-right w-28 pr-2">TOTAL</th>
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
                                                    <td className="py-4 text-right text-muted-foreground">
                                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.unit_price)}
                                                    </td>
                                                    <td className="py-4 text-right font-bold text-foreground pr-2">
                                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.quantity * item.unit_price)}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>

                                {/* Totals */}
                                <div className="flex justify-end pt-4 border-t border-slate-100">
                                    <div className="w-56 space-y-2">
                                        <div className="flex justify-between text-xl font-bold bg-[var(--theme-color)] text-white p-3 rounded-md shadow-lg shadow-[var(--theme-color)]/20">
                                            <span>Total</span>
                                            <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}</span>
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
                                        showCashDiscount={(quote.cash_discount_percent ?? 0) > 0}
                                        cashDiscountPercent={quote.cash_discount_percent ?? 0}
                                        installmentCount={quote.installment_count}
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

                                    {/* QR Code Footer */}
                                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-slate-100">
                                        <div className="text-center sm:text-left">
                                            <p className="text-xs text-slate-400">Orçamento gerado via Zacly</p>
                                        </div>
                                        <QRCodeGenerator quoteId={quote.id} size={100} />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* PROFESSIONAL LAYOUT — Executive, subdued, sophisticated */}
                {layout === 'professional' && (
                    <Card className="shadow-lg print:shadow-none print:border-none rounded-none overflow-hidden border border-slate-200">
                        <CardContent className="p-0">
                            {/* Executive Header — Dark, authoritative */}
                            <div className="bg-slate-900 text-white p-8 md:p-10">
                                <div className="flex justify-between items-start">
                                    <div>
                                        {profile?.logo_url && (
                                            <div className="relative h-14 w-24 mb-4">
                                                <Image src={profile.logo_url} alt="Logo" fill className="object-contain object-left brightness-0 invert" unoptimized />
                                            </div>
                                        )}
                                        <h1 className="text-lg font-semibold tracking-wide uppercase">{profile?.business_name || 'Empresa'}</h1>
                                        <div className="text-sm text-slate-400 mt-1 space-y-0.5">
                                            {profile?.cnpj && <p>CNPJ: {profile.cnpj}</p>}
                                            <p>{[profile?.phone, profile?.email].filter(Boolean).join(' · ')}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
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

                                {/* Items Table — Neutral, clean */}
                                <div>
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b-2 border-slate-800">
                                                <th className="py-3 text-left font-semibold text-slate-800 text-xs uppercase tracking-wider">Descrição</th>
                                                <th className="py-3 text-center font-semibold text-slate-800 text-xs uppercase tracking-wider w-16">Qtd</th>
                                                <th className="py-3 text-right font-semibold text-slate-800 text-xs uppercase tracking-wider w-28">Unitário</th>
                                                <th className="py-3 text-right font-semibold text-slate-800 text-xs uppercase tracking-wider w-28">Total</th>
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
                                                    <td className="py-3.5 text-right text-slate-500">
                                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.unit_price)}
                                                    </td>
                                                    <td className="py-3.5 text-right font-semibold text-slate-900">
                                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.quantity * item.unit_price)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {/* Total — Understated, right-aligned */}
                                    <div className="flex justify-end mt-4 pt-4 border-t border-slate-200">
                                        <div className="text-right">
                                            <p className="text-[11px] uppercase tracking-widest text-slate-400 mb-1">Total</p>
                                            <p className="text-2xl font-bold text-slate-900">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
                                            </p>
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
                                        showCashDiscount={(quote.cash_discount_percent ?? 0) > 0}
                                        cashDiscountPercent={quote.cash_discount_percent ?? 0}
                                        installmentCount={quote.installment_count}
                                    />
                                )}

                                {/* Footer */}
                                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-slate-200 text-xs text-slate-400">
                                    <p>Orçamento gerado via Zacly</p>
                                    <QRCodeGenerator quoteId={quote.id} size={80} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* CLASSIC LAYOUT — Elegant formal document */}
                {layout === 'classic' && (
                    <Card className="shadow-lg print:shadow-none print:border-none rounded-none border border-slate-300">
                        <CardContent className="p-10 md:p-14 space-y-8" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
                            {/* Ornamental Header */}
                            <div className="text-center space-y-5">
                                <div className="border-t-2 border-b border-slate-800 py-1">
                                    <div className="border-t border-slate-800" />
                                </div>

                                {profile?.logo_url && (
                                    <div className="relative h-20 w-36 mx-auto">
                                        <Image src={profile.logo_url} alt="Logo" fill className="object-contain" unoptimized />
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

                            {/* Items Table */}
                            <div>
                                <table className="w-full text-sm border-collapse">
                                    <thead>
                                        <tr className="bg-slate-800 text-white">
                                            <th className="py-2.5 pl-4 text-left font-semibold text-xs uppercase tracking-wider">Descrição</th>
                                            <th className="py-2.5 text-center font-semibold text-xs uppercase tracking-wider w-16">Qtd</th>
                                            <th className="py-2.5 text-right font-semibold text-xs uppercase tracking-wider w-28">Unitário</th>
                                            <th className="py-2.5 pr-4 text-right font-semibold text-xs uppercase tracking-wider w-28">Total</th>
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
                                                <td className="py-3 text-right text-slate-600">
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.unit_price)}
                                                </td>
                                                <td className="py-3 pr-4 text-right font-semibold text-slate-900">
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.quantity * item.unit_price)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Total — Double border formal block */}
                                <div className="flex justify-end mt-4">
                                    <div className="border-2 border-slate-800 px-8 py-4 text-right">
                                        <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Total a Pagar</p>
                                        <p className="text-2xl font-bold text-slate-900">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
                                        </p>
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

                            {/* Payment Options */}
                            {quote.show_payment_options && (
                                <PaymentOptions
                                    themeColor="#1e293b"
                                    showCashDiscount={(quote.cash_discount_percent ?? 0) > 0}
                                    cashDiscountPercent={quote.cash_discount_percent ?? 0}
                                    installmentCount={quote.installment_count}
                                />
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
                            </div>

                        </CardContent>
                    </Card>
                )}

            </div>
        </div>
    )
}
