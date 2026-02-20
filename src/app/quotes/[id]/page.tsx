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
        title: `Orçamento #${id.substring(0, 8)} - OrçaFácil`,
        description: 'Visualize seu orçamento no OrçaFácil.',
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
    const approvalUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://orcafacil.com'}/quotes/${id}/approve`;
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

    // Use detected layout or fallback to user's preference
    const layout = profile?.layout_style || detectedProfile.layout;
    const toneClasses = getToneClasses(detectedProfile.tone);
    const densityClasses = getDensityClasses(detectedProfile.density);

    return (
        <div
            className="min-h-screen bg-slate-50 pb-20 print:bg-white print:pb-0"
            style={{ '--theme-color': themeColor } as React.CSSProperties}
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
                                            <p className="text-xs text-slate-400">Orçamento gerado via OrçaFácil</p>
                                        </div>
                                        <QRCodeGenerator quoteId={quote.id} size={100} />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* PROFESSIONAL LAYOUT (Grid based, clean lines) */}
                {layout === 'professional' && (
                    <Card className="shadow-lg print:shadow-none print:border-none rounded-none border border-slate-300">
                        <CardContent className="p-8 md:p-12 space-y-10">
                            {/* Pro Header */}
                            <div className="grid grid-cols-2 gap-8 border-b-4 border-[var(--theme-color)] pb-8">
                                <div>
                                    <div className="h-4 w-12 bg-[var(--theme-color)] mb-4"></div>
                                    <h1 className="text-3xl font-bold uppercase tracking-wide text-foreground">{profile?.business_name || 'EMPRESA'}</h1>
                                    <div className="mt-2 text-sm text-muted-foreground space-y-0.5">
                                        {profile?.cnpj && <p>CNPJ: {profile.cnpj}</p>}
                                        {profile?.phone && <p>{profile.phone}</p>}
                                        {profile?.email && <p>{profile.email}</p>}
                                    </div>
                                </div>
                                <div className="text-right flex flex-col items-end">
                                    {profile?.logo_url && (
                                        <div className="relative h-20 w-32 mb-4">
                                            <Image src={profile.logo_url} alt="Logo" fill className="object-contain object-right" unoptimized />
                                        </div>
                                    )}
                                    <div className="mt-auto">
                                        <h2 className="text-xl font-semibold text-foreground">ORÇAMENTO</h2>
                                        <p className="text-lg font-light text-muted-foreground">#{quote.id.substring(0, 8)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-12">
                                <div>
                                    <h3 className="text-sm font-bold text-[var(--theme-color)] uppercase mb-2">Cliente</h3>
                                    <p className="text-lg font-medium">{quote.client_name}</p>
                                    <p className="text-muted-foreground">{quote.client_phone}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <h3 className="text-sm font-bold text-[var(--theme-color)] uppercase mb-1">Data</h3>
                                        <p>{format(new Date(quote.created_at), "dd/MM/yyyy")}</p>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-[var(--theme-color)] uppercase mb-1">Validade</h3>
                                        <p>{quote.valid_until ? format(new Date(quote.valid_until), "dd/MM/yyyy") : 'Indefinido'}</p>
                                    </div>
                                </div>
                            </div>

                            <table className="w-full">
                                <thead className="bg-slate-100 border-y border-slate-200">
                                    <tr>
                                        <th className="py-2 pl-4 text-left font-semibold text-xs uppercase text-slate-600">Descrição</th>
                                        <th className="py-2 text-center font-semibold text-xs uppercase text-slate-600">Qtd</th>
                                        <th className="py-2 text-right font-semibold text-xs uppercase text-slate-600 w-32">Preço Unit.</th>
                                        <th className="py-2 text-right font-semibold text-xs uppercase text-slate-600 pr-4 w-32">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {quote.quote_items.map((item: any) => (
                                        <tr key={item.id}>
                                            <td className="py-3 pl-4 text-sm font-medium">{item.description}</td>
                                            <td className="py-3 text-center text-sm text-slate-500">{item.quantity}</td>
                                            <td className="py-3 text-right text-sm text-slate-500">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.unit_price)}
                                            </td>
                                            <td className="py-3 text-right pr-4 text-sm font-semibold">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.quantity * item.unit_price)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="flex justify-end">
                                <div className="w-64 border-t-2 border-[var(--theme-color)] pt-4">
                                    <div className="flex justify-between items-center text-xl font-bold">
                                        <span>TOTAL</span>
                                        <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}</span>
                                    </div>
                                </div>
                            </div>

                            {(quote.notes || quote.payment_terms) && (
                                <div className="bg-slate-50 p-6 rounded-none border-l-4 border-[var(--theme-color)] text-sm">
                                    {quote.payment_terms && <p className="mb-2"><strong>Pagamento:</strong> {quote.payment_terms}</p>}
                                    {quote.notes && <p className="italic text-slate-600">{quote.notes}</p>}
                                </div>
                            )}

                            {/* Cronograma - Layout Professional */}
                            {quote.show_timeline && (
                                <div className="border border-slate-200 p-6">
                                    <h3 className="text-sm font-bold text-[var(--theme-color)] uppercase tracking-wider mb-4">Cronograma de Execução</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="text-center border border-slate-200 p-3">
                                            <p className="text-xs text-slate-500 uppercase mb-1">Aprovação</p>
                                            <p className="font-bold text-sm">1–2 dias</p>
                                        </div>
                                        <div className="text-center border border-[var(--theme-color)] p-3 bg-[var(--theme-color)]/5">
                                            <p className="text-xs text-slate-500 uppercase mb-1">Execução</p>
                                            <p className="font-bold text-sm">{quote.estimated_days ? `${quote.estimated_days} dias` : '3–5 dias'}</p>
                                        </div>
                                        <div className="text-center border border-slate-200 p-3">
                                            <p className="text-xs text-slate-500 uppercase mb-1">Entrega</p>
                                            <p className="font-bold text-sm">1 dia</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-3">
                                        Prazo total estimado: {quote.estimated_days ? `${quote.estimated_days + 3} dias úteis` : '5–8 dias úteis'}
                                    </p>
                                </div>
                            )}

                            {/* Formas de Pagamento - Layout Professional */}
                            {quote.show_payment_options && (
                                <div className="border border-slate-200 p-6">
                                    <h3 className="text-sm font-bold text-[var(--theme-color)] uppercase tracking-wider mb-4">Formas de Pagamento</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {(quote.payment_methods?.length ? quote.payment_methods : ['pix', 'card', 'cash', 'installment']).map((m: string) => (
                                            <span key={m} className="px-4 py-2 border border-slate-300 text-sm font-medium">
                                                {m === 'pix' ? '📱 PIX' : m === 'cash' ? '💵 Dinheiro' : m === 'card' ? '💳 Cartão' : `📅 Parcelado${quote.installment_count ? ` em até ${quote.installment_count}x` : ''}`}
                                            </span>
                                        ))}
                                    </div>
                                    {(quote.cash_discount_percent ?? 0) > 0 && (
                                        <p className="mt-3 text-sm font-semibold" style={{ color: themeColor }}>
                                            ✓ {quote.cash_discount_percent}% de desconto para pagamento à vista (PIX ou Dinheiro)
                                        </p>
                                    )}
                                </div>
                            )}

                        </CardContent>
                    </Card>
                )}

                {/* CLASSIC LAYOUT (Paper like, serif logic approx) */}
                {layout === 'classic' && (
                    <Card className="shadow-lg print:shadow-none print:border-none rounded-none">
                        <CardContent className="p-12 font-serif space-y-8">
                            <div className="text-center space-y-4 border-b pb-8 border-black">
                                {profile?.logo_url && (
                                    <div className="relative h-24 w-40 mx-auto">
                                        <Image src={profile.logo_url} alt="Logo" fill className="object-contain" unoptimized />
                                    </div>
                                )}
                                <h1 className="text-4xl font-normal text-black tracking-widest uppercase">{profile?.business_name}</h1>

                                <div className="text-sm italic space-y-1">
                                    {profile?.cnpj && <p>CNPJ: {profile.cnpj}</p>}
                                    <p>
                                        {[profile?.phone, profile?.email].filter(Boolean).join(' • ')}
                                    </p>
                                </div>
                            </div>

                            <div className="flex justify-between items-baseline pt-4">
                                <div className="text-lg">
                                    <span className="font-bold">Cliente:</span> {quote.client_name}
                                </div>
                                <div className="text-right">
                                    <p>Orçamento Nº <strong>{quote.id.substring(0, 6)}</strong></p>
                                    <p className="text-sm">{format(new Date(quote.created_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
                                </div>
                            </div>

                            <div className="py-4">
                                <div className="border-t border-b border-black py-1 mb-1">
                                    <div className="grid grid-cols-12 gap-4 font-bold text-sm uppercase px-2">
                                        <div className="col-span-6">Descrição</div>
                                        <div className="col-span-2 text-center">Qtd</div>
                                        <div className="col-span-2 text-right">Unitário</div>
                                        <div className="col-span-2 text-right">Total</div>
                                    </div>
                                </div>
                                <div className="divide-y divide-dotted divide-gray-300">
                                    {quote.quote_items.map((item: any) => (
                                        <div key={item.id} className="grid grid-cols-12 gap-4 py-3 px-2 text-sm">
                                            <div className="col-span-6">{item.description}</div>
                                            <div className="col-span-2 text-center">{item.quantity}</div>
                                            <div className="col-span-2 text-right">
                                                {new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2 }).format(item.unit_price)}
                                            </div>
                                            <div className="col-span-2 text-right">
                                                {new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2 }).format(item.quantity * item.unit_price)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t border-black mt-1 pt-4 flex justify-end">
                                    <div className="text-2xl font-bold">
                                        <span className="mr-8 text-base font-normal uppercase">Total a Pagar</span>
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
                                    </div>
                                </div>
                            </div>

                            {/* Rodapé com assinaturas */}
                            <div className="text-center pt-16 pb-8 space-y-12">
                                <div className="grid grid-cols-2 gap-16">
                                    <div className="border-t border-black pt-2">
                                        <p className="text-sm">Assinatura do Responsável</p>
                                    </div>
                                    <div className="border-t border-black pt-2">
                                        <p className="text-sm">Aprovação do Cliente</p>
                                    </div>
                                </div>
                                <p className="text-xs uppercase tracking-widest">Orçamento válido por {quote.valid_until ? format(new Date(quote.valid_until), "dd/MM/yyyy") : '15 dias'}</p>
                            </div>

                            {/* Cronograma - Layout Classic */}
                            {quote.show_timeline && (
                                <div className="border-t border-black pt-8 mt-4">
                                    <h3 className="text-base font-bold uppercase tracking-widest text-center mb-6">Cronograma de Execução</h3>
                                    <div className="grid grid-cols-3 gap-0 border border-black">
                                        <div className="p-4 text-center border-r border-black">
                                            <p className="text-xs uppercase tracking-wider mb-1">Aprovação</p>
                                            <p className="font-bold">1–2 dias</p>
                                        </div>
                                        <div className="p-4 text-center border-r border-black bg-gray-50">
                                            <p className="text-xs uppercase tracking-wider mb-1">Execução</p>
                                            <p className="font-bold">{quote.estimated_days ? `${quote.estimated_days} dias` : '3–5 dias'}</p>
                                        </div>
                                        <div className="p-4 text-center">
                                            <p className="text-xs uppercase tracking-wider mb-1">Entrega</p>
                                            <p className="font-bold">1 dia</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-center mt-3 italic">
                                        Prazo total estimado: {quote.estimated_days ? `${quote.estimated_days + 3} dias úteis` : '5–8 dias úteis'}
                                    </p>
                                </div>
                            )}

                            {/* Formas de Pagamento - Layout Classic */}
                            {quote.show_payment_options && (
                                <div className="border-t border-black pt-8 mt-4">
                                    <h3 className="text-base font-bold uppercase tracking-widest text-center mb-6">Formas de Pagamento</h3>
                                    <div className="flex flex-wrap justify-center gap-4">
                                        {(quote.payment_methods?.length ? quote.payment_methods : ['pix', 'card', 'cash', 'installment']).map((m: string) => (
                                            <span key={m} className="px-6 py-3 border border-black text-sm uppercase tracking-wider">
                                                {m === 'pix' ? 'PIX' : m === 'cash' ? 'Dinheiro' : m === 'card' ? 'Cartão' : `Parcelado${quote.installment_count ? ` em até ${quote.installment_count}x` : ''}`}
                                            </span>
                                        ))}
                                    </div>
                                    {(quote.cash_discount_percent ?? 0) > 0 && (
                                        <p className="text-center mt-4 text-sm font-bold">
                                            {quote.cash_discount_percent}% de desconto para pagamento à vista
                                        </p>
                                    )}
                                </div>
                            )}

                        </CardContent>
                    </Card>
                )}

            </div>
        </div>
    )
}
