import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Share2, ArrowLeft, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import Image from 'next/image'
import { PrintButton } from '@/components/quotes/print-button'
import { cn } from '@/lib/utils'
import { QuoteStatusActions } from '@/components/quotes/quote-status-actions'
import { QuoteOwnerActions } from '@/components/quotes/quote-owner-actions'

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
    const whatsappMessage = `Olá ${quote.client_name}, aqui está o seu orçamento no valor de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}. Acesse: ${process.env.NEXT_PUBLIC_APP_URL || 'https://orcafacil.com'}/quotes/${id}`;
    const whatsappLink = `https://wa.me/${quote.client_phone?.replace(/\D/g, '')}?text=${encodeURIComponent(whatsappMessage)}`;

    // Layout Logic
    const themeColor = profile?.theme_color || '#0D9B5C';
    const layout = profile?.layout_style || 'modern';

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
            <div className="max-w-3xl mx-auto p-4 md:p-8 print:p-0 print:max-w-none space-y-6">

                {/* Status Actions (Approve/Reject) - Visible to everyone, but context matters */}
                {/* Normally only client approves, but for simplicity showing to all if not draft? Or show always? */}
                {/* Let's show it prominently if status is draft or sent */}
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
                                    <h1 className="text-2xl font-bold text-foreground">{profile?.business_name || 'Sua Empresa'}</h1>
                                    <p className="text-sm text-muted-foreground">{profile?.phone}</p>
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
                                        {quote.quote_items.map((item: any) => (
                                            <tr key={item.id} className="group">
                                                <td className="py-4 pl-2 font-medium text-foreground">{item.description}</td>
                                                <td className="py-4 text-center text-muted-foreground">{item.quantity}</td>
                                                <td className="py-4 text-right text-muted-foreground">
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.unit_price)}
                                                </td>
                                                <td className="py-4 text-right font-bold text-foreground pr-2">
                                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.quantity * item.unit_price)}
                                                </td>
                                            </tr>
                                        ))}
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

                                {/* Footer Notes */}
                                <div className="pt-8 text-center sm:text-left text-sm text-muted-foreground grid gap-4 border-t border-slate-100">
                                    {quote.payment_terms && (
                                        <div>
                                            <span className="font-semibold text-foreground">Condições de Pagamento:</span> {quote.payment_terms}
                                        </div>
                                    )}
                                    {quote.notes && (
                                        <div className="italic bg-yellow-50 p-3 rounded border border-yellow-100 text-yellow-800 text-xs">
                                            "{quote.notes}"
                                        </div>
                                    )}
                                    <div className="text-center pt-8 text-xs text-slate-300">Orçamento gerado via OrçaFácil</div>
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
                                        <p>{profile?.phone}</p>
                                        <p>{profile?.email}</p>
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
                                <p className="text-sm italic">{profile?.phone} &bull; {profile?.email}</p>
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
                        </CardContent>
                    </Card>
                )}

            </div>
        </div>
    )
}
