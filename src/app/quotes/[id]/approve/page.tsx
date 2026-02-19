import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Image from 'next/image'
import { CheckCircle, FileText } from 'lucide-react'
import { ApproveQuoteClient } from '@/components/quotes/approve-quote-client'
import { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params
    return {
        title: `Aprovar Orçamento - OrçaFácil`,
        description: 'Visualize e aprove seu orçamento com um clique.',
        robots: { index: false, follow: false },
    }
}

export default async function ApprovePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: quote, error } = await supabase
        .from('quotes')
        .select('*, quote_items(*)')
        .eq('id', id)
        .single()

    if (error || !quote) notFound()

    const { data: profile } = await supabase
        .from('profiles')
        .select('business_name, phone, email, logo_url, theme_color')
        .eq('id', quote.user_id)
        .single()

    const themeColor = profile?.theme_color || '#0D9B5C'
    const total = quote.total || 0
    const isAlreadyApproved = quote.status === 'approved'
    const isRejected = quote.status === 'rejected'

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header */}
            <header className="bg-white border-b px-6 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    {profile?.logo_url ? (
                        <div className="relative h-10 w-28">
                            <Image src={profile.logo_url} alt="Logo" fill className="object-contain object-left" unoptimized />
                        </div>
                    ) : (
                        <span className="font-bold text-lg text-foreground">{profile?.business_name || 'Orçamento'}</span>
                    )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>Orçamento #{id.substring(0, 8).toUpperCase()}</span>
                </div>
            </header>

            <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 space-y-6">

                {/* Status Banner */}
                {isAlreadyApproved && (
                    <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800">
                        <CheckCircle className="h-6 w-6 flex-shrink-0 text-emerald-600" />
                        <div>
                            <p className="font-bold">Orçamento já aprovado!</p>
                            <p className="text-sm">Você já confirmou este orçamento. O prestador será notificado.</p>
                        </div>
                    </div>
                )}
                {isRejected && (
                    <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800">
                        <div>
                            <p className="font-bold">Orçamento recusado</p>
                            <p className="text-sm">Este orçamento foi recusado. Entre em contato com o prestador para mais informações.</p>
                        </div>
                    </div>
                )}

                {/* Quote Card */}
                <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
                    {/* Colored top bar */}
                    <div className="h-2" style={{ backgroundColor: themeColor }} />

                    <div className="p-6 space-y-6">
                        {/* Business + Client */}
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">De</p>
                                <p className="font-bold text-foreground">{profile?.business_name || 'Prestador'}</p>
                                {profile?.phone && <p className="text-sm text-muted-foreground">{profile.phone}</p>}
                            </div>
                            <div className="text-right">
                                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Para</p>
                                <p className="font-bold text-foreground">{quote.client_name}</p>
                                <p className="text-sm text-muted-foreground">
                                    {format(new Date(quote.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                                </p>
                            </div>
                        </div>

                        {/* Items */}
                        <div>
                            <p className="text-xs uppercase tracking-wider font-semibold text-muted-foreground mb-3">Itens do Orçamento</p>
                            <div className="space-y-2">
                                {quote.quote_items.map((item: any) => (
                                    <div key={item.id} className="flex items-center justify-between py-2 border-b border-dashed border-slate-100 last:border-0">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-foreground">{item.description}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {item.quantity} × {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.unit_price)}
                                            </p>
                                        </div>
                                        <p className="text-sm font-bold text-foreground ml-4">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.quantity * item.unit_price)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Total */}
                        <div
                            className="flex items-center justify-between p-4 rounded-xl"
                            style={{ backgroundColor: `${themeColor}15` }}
                        >
                            <span className="font-bold text-lg">Total</span>
                            <span className="font-black text-2xl" style={{ color: themeColor }}>
                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
                            </span>
                        </div>

                        {/* Payment Terms / Notes */}
                        {(quote.payment_terms || quote.notes) && (
                            <div className="text-sm text-muted-foreground space-y-1 pt-2 border-t border-slate-100">
                                {quote.payment_terms && (
                                    <p><span className="font-semibold text-foreground">Pagamento:</span> {quote.payment_terms}</p>
                                )}
                                {quote.notes && (
                                    <p className="italic">"{quote.notes}"</p>
                                )}
                            </div>
                        )}

                        {/* Validity */}
                        {quote.valid_until && (
                            <p className="text-xs text-center text-muted-foreground">
                                Proposta válida até {format(new Date(quote.valid_until), "dd/MM/yyyy")}
                            </p>
                        )}
                    </div>
                </div>

                {/* Approve / Reject buttons — client component */}
                {!isAlreadyApproved && !isRejected && (
                    <ApproveQuoteClient
                        quoteId={id}
                        clientName={quote.client_name}
                        themeColor={themeColor}
                    />
                )}

                <p className="text-center text-xs text-muted-foreground pb-4">
                    Orçamento gerado via <span className="font-semibold">OrçaFácil</span>
                </p>
            </main>
        </div>
    )
}
