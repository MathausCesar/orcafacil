'use client'

import { useState, useEffect } from 'react'
import { createQuote, updateQuote } from '@/app/actions/quotes'
import { ProductSearch } from '@/components/quotes/product-search'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Trash2, Save, ArrowLeft, Calendar as CalendarIcon, FileText, Loader2, Settings2, Wallet, Clock, CheckCircle2, AlignLeft } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { ClientAutocomplete } from '@/components/clients/client-autocomplete'
import { useRouter } from 'next/navigation'

export interface QuoteItem {
    id: string;
    description: string;
    details?: string | null;
    quantity: number;
    unitPrice: number;
}

interface QuoteFormProps {
    initialData?: {
        id?: string
        clientName: string
        clientPhone?: string
        expirationDate?: string
        paymentTerms?: string
        notes?: string
        showDetailedItems?: boolean
        items: QuoteItem[]
    }
}

export function QuoteForm({ initialData }: QuoteFormProps) {
    const [items, setItems] = useState<QuoteItem[]>(initialData?.items || [])
    const [loading, setLoading] = useState(false)
    const [date, setDate] = useState<string>(initialData?.expirationDate || '')
    const [clientName, setClientName] = useState(initialData?.clientName || '')
    const [clientPhone, setClientPhone] = useState(initialData?.clientPhone || '')

    // Customization states
    // In a real app, these could come from initialData too if persisted
    const [showDetailedItems, setShowDetailedItems] = useState(initialData?.showDetailedItems || false)
    const [showTimeline, setShowTimeline] = useState(false)
    const [showPaymentOptions, setShowPaymentOptions] = useState(false)
    const [estimatedDays, setEstimatedDays] = useState('')
    const [cashDiscount, setCashDiscount] = useState('')
    const [paymentMethods, setPaymentMethods] = useState<string[]>([])
    const [installmentCount, setInstallmentCount] = useState('')

    const router = useRouter()

    useEffect(() => {
        if (!date) {
            const d = new Date()
            d.setDate(d.getDate() + 7)
            setDate(d.toISOString().split('T')[0])
        }
    }, [date])

    const handleAddItem = (product: { name: string; price: number; quantity: number; details?: string | null }) => {
        const newItem: QuoteItem = {
            id: Math.random().toString(36).substr(2, 9),
            description: product.name,
            details: product.details || null,
            quantity: product.quantity,
            unitPrice: product.price
        }
        setItems([...items, newItem])
    }

    const handleRemoveItem = (id: string) => {
        setItems(items.filter(i => i.id !== id))
    }

    const handleUpdateItem = (id: string, field: keyof QuoteItem, value: any) => {
        setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i))
    }

    const handleSubmit = async (formData: FormData) => {
        if (items.length === 0) {
            toast.error('Adicione pelo menos um item.')
            return
        }

        if (!clientName) {
            toast.error('Informe o nome do cliente.')
            return
        }

        setLoading(true)
        formData.append('items', JSON.stringify(items))
        formData.set('clientName', clientName)
        if (clientPhone) formData.set('clientPhone', clientPhone)

        // Add customization fields
        formData.set('show_detailed_items', String(showDetailedItems))
        formData.set('show_timeline', String(showTimeline))
        formData.set('show_payment_options', String(showPaymentOptions))
        if (showTimeline && estimatedDays) {
            formData.set('estimated_days', estimatedDays)
        }
        if (showPaymentOptions) {
            if (paymentMethods.length > 0) {
                formData.set('payment_methods', JSON.stringify(paymentMethods))
            }
            if (cashDiscount) {
                formData.set('cash_discount_percent', cashDiscount)
            }
            if (paymentMethods.includes('installment') && installmentCount) {
                formData.set('installment_count', installmentCount)
            }
        }
        if (initialData?.notes) formData.set('notes', initialData.notes) // Persist existing if not changed, form gets it from textarea

        try {
            let result;
            if (initialData?.id) {
                result = await updateQuote(initialData.id, formData)
            } else {
                result = await createQuote(formData)
            }

            if (result?.error) {
                toast.error(result.error)
            } else {
                toast.success(initialData?.id ? 'Orçamento atualizado!' : 'Orçamento criado!')
            }
        } catch (e) {
            toast.error('Erro ao salvar orçamento.')
        } finally {
            setLoading(false)
        }
    }

    const total = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0)

    return (
        <form action={handleSubmit} className="pb-24 lg:pb-0">
            {/* Header Area */}
            <div className="flex items-center gap-4 mb-8">
                <Link href={initialData?.id ? `/quotes/${initialData.id}` : "/"}>
                    <Button variant="outline" size="icon" className="h-10 w-10 rounded-full border-slate-200">
                        <ArrowLeft className="h-5 w-5 text-slate-600" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        {initialData?.id ? 'Editar Orçamento' : 'Novo Orçamento'}
                    </h1>
                    <p className="text-slate-500 text-sm">Preencha as informações para gerar a proposta.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                {/* Main Column (Left) */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Client Data */}
                    <Card className="border-0 shadow-sm ring-1 ring-slate-200">
                        <CardHeader className="pb-4 border-b border-slate-100">
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                    <FileText className="h-5 w-5" />
                                </div>
                                Dados do Cliente
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <ClientAutocomplete
                                defaultValue={clientName}
                                onSelect={(client) => {
                                    setClientName(client.name)
                                    setClientPhone(client.phone)
                                }}
                            />
                            <input type="hidden" name="clientPhone" value={clientPhone} />
                        </CardContent>
                    </Card>

                    {/* Items Section */}
                    <Card className="border-0 shadow-sm ring-1 ring-slate-200 overflow-hidden">
                        <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/50">
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                    <CheckCircle2 className="h-5 w-5" />
                                </div>
                                Itens e Serviços
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            <ProductSearch onAddProduct={handleAddItem} />

                            {items.length > 0 ? (
                                <div className="space-y-4">
                                    {/* Desktop Table Header */}
                                    <div className="hidden lg:grid grid-cols-12 gap-4 text-xs font-semibold text-slate-500 px-4 uppercase tracking-wider">
                                        <div className="col-span-6">Descrição</div>
                                        <div className="col-span-2 text-center">Qtd</div>
                                        <div className="col-span-2 text-right">Unitário</div>
                                        <div className="col-span-2 text-right">Total</div>
                                    </div>

                                    <div className="space-y-3">
                                        {items.map((item) => (
                                            <div key={item.id} className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm group hover:border-emerald-200 hover:shadow-md transition-all">

                                                <div className="lg:col-span-6">
                                                    <Input
                                                        value={item.description}
                                                        onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                                                        className="font-medium border-transparent hover:border-slate-200 focus:border-emerald-500 bg-transparent px-0 lg:px-3 h-auto py-1"
                                                        placeholder="Descrição do item"
                                                    />
                                                </div>

                                                <div className="lg:col-span-2 flex items-center lg:justify-center">
                                                    <span className="lg:hidden text-sm text-slate-500 mr-2">Qtd:</span>
                                                    <Input
                                                        type="number"
                                                        value={item.quantity}
                                                        onChange={(e) => handleUpdateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                                                        className="w-20 text-center h-8"
                                                    />
                                                </div>

                                                <div className="lg:col-span-2 flex items-center lg:justify-end">
                                                    <span className="lg:hidden text-sm text-slate-500 mr-2">Unit:</span>
                                                    <Input
                                                        type="number"
                                                        step="0.01"
                                                        value={item.unitPrice}
                                                        onChange={(e) => handleUpdateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                                                        className="w-24 text-right h-8"
                                                    />
                                                </div>

                                                <div className="lg:col-span-2 flex items-center justify-between lg:justify-end gap-4 border-t lg:border-t-0 pt-3 lg:pt-0 mt-2 lg:mt-0">
                                                    <span className="font-bold text-slate-900">
                                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.quantity * item.unitPrice)}
                                                    </span>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                                                        onClick={() => handleRemoveItem(item.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>

                                                {showDetailedItems && (
                                                    <div className="col-span-1 lg:col-span-12 mt-2">
                                                        <Textarea
                                                            value={item.details || ''}
                                                            onChange={(e) => handleUpdateItem(item.id, 'details', e.target.value)}
                                                            className="text-sm min-h-[60px] resize-none bg-slate-50 border-slate-200"
                                                            placeholder="Detalhamento opcional do serviço ou produto..."
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex justify-end pt-4 border-t border-slate-100">
                                        <div className="text-right">
                                            <p className="text-sm text-slate-500">Subtotal dos itens</p>
                                            <p className="text-2xl font-bold text-slate-900">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                    <p className="text-slate-500">Nenhum item adicionado ainda.</p>
                                    <p className="text-sm text-slate-400">Use a busca acima para adicionar serviços.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Observations */}
                    <Card className="border-0 shadow-sm ring-1 ring-slate-200">
                        <CardHeader className="pb-4 border-b border-slate-100">
                            <CardTitle className="text-base font-semibold">Observações Finais</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <Textarea
                                id="notes"
                                name="notes"
                                defaultValue={initialData?.notes}
                                placeholder="Ex: Garantia de 3 meses, condições especiais de entrega..."
                                className="min-h-[120px] resize-none"
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Column (Right) - Sticky */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="sticky top-6 space-y-6">

                        {/* Summary & Save */}
                        <Card className="border-0 shadow-lg ring-1 ring-slate-200 bg-slate-900 text-white overflow-hidden">
                            <CardContent className="p-6">
                                <div className="space-y-1 mb-6">
                                    <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Valor Total</p>
                                    <p className="text-4xl font-bold text-white tracking-tight">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
                                    </p>
                                </div>
                                <Button size="lg" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-12 shadow-lg shadow-emerald-900/20 border-0" disabled={loading}>
                                    {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                                    {initialData?.id ? 'Salvar Alterações' : 'Finalizar Orçamento'}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Customization Options */}
                        <Card className="border-0 shadow-sm ring-1 ring-slate-200">
                            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                                    <Settings2 className="h-4 w-4" /> Configurações
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-slate-100">
                                    {/* Detailed Items Toggle */}
                                    <div className="p-4 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                                <AlignLeft className="h-4 w-4" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <Label htmlFor="show_detailed" className="font-medium cursor-pointer">Orçamento Detalhado</Label>
                                                    <Checkbox
                                                        id="show_detailed"
                                                        checked={showDetailedItems}
                                                        onCheckedChange={(checked) => setShowDetailedItems(checked as boolean)}
                                                    />
                                                </div>
                                                <p className="text-xs text-slate-500 mt-1 leading-snug">Se ativo, exibe as descrições extras de produtos e serviços no documento.</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Timeline */}
                                    <div className="p-4 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                                <Clock className="h-4 w-4" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <Label htmlFor="show_timeline" className="font-medium cursor-pointer">Cronograma</Label>
                                                    <Checkbox
                                                        id="show_timeline"
                                                        checked={showTimeline}
                                                        onCheckedChange={(checked) => setShowTimeline(checked as boolean)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        {showTimeline && (
                                            <div className="pl-11 pr-1 animate-in slide-in-from-top-2 duration-200">
                                                <Label className="text-xs text-slate-500 mb-1.5 block">Dias estimados</Label>
                                                <Input
                                                    type="number"
                                                    placeholder="Ex: 5"
                                                    value={estimatedDays}
                                                    onChange={(e) => setEstimatedDays(e.target.value)}
                                                    className="h-8 text-sm"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Payment */}
                                    <div className="p-4 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                                                <Wallet className="h-4 w-4" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <Label htmlFor="show_payment" className="font-medium cursor-pointer">Pagamento</Label>
                                                    <Checkbox
                                                        id="show_payment"
                                                        checked={showPaymentOptions}
                                                        onCheckedChange={(checked) => setShowPaymentOptions(checked as boolean)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        {showPaymentOptions && (
                                            <div className="pl-11 pr-1 space-y-3 animate-in slide-in-from-top-2 duration-200">
                                                <div className="grid grid-cols-2 gap-2">
                                                    {[
                                                        { value: 'pix', label: 'PIX' },
                                                        { value: 'cash', label: 'Dinheiro' },
                                                        { value: 'card', label: 'Cartão' },
                                                        { value: 'installment', label: 'Parcelado' },
                                                    ].map((m) => (
                                                        <div key={m.value} className="flex items-center gap-2">
                                                            <Checkbox
                                                                id={m.value}
                                                                checked={paymentMethods.includes(m.value)}
                                                                onCheckedChange={(c) => {
                                                                    if (c) setPaymentMethods([...paymentMethods, m.value])
                                                                    else setPaymentMethods(paymentMethods.filter(x => x !== m.value))
                                                                }}
                                                            />
                                                            <Label htmlFor={m.value} className="text-xs">{m.label}</Label>
                                                        </div>
                                                    ))}
                                                </div>

                                                {paymentMethods.includes('installment') && (
                                                    <div>
                                                        <Label className="text-xs text-slate-500 mb-1 block">Nº Parcelas</Label>
                                                        <Input
                                                            type="number"
                                                            placeholder="Ex: 12"
                                                            value={installmentCount}
                                                            onChange={(e) => setInstallmentCount(e.target.value)}
                                                            className="h-8 text-sm"
                                                        />
                                                    </div>
                                                )}

                                                {(paymentMethods.includes('pix') || paymentMethods.includes('cash')) && (
                                                    <div>
                                                        <Label className="text-xs text-slate-500 mb-1 block">Desconto à vista (%)</Label>
                                                        <Input
                                                            type="number"
                                                            placeholder="Ex: 5"
                                                            value={cashDiscount}
                                                            onChange={(e) => setCashDiscount(e.target.value)}
                                                            className="h-8 text-sm"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Mobile Floating Button - Visible only on mobile */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t lg:hidden z-50">
                    <Button type="submit" size="lg" className="w-full bg-emerald-600 font-bold" disabled={loading}>
                        {loading ? 'Salvando...' : `Salvar (${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)})`}
                    </Button>
                </div>

            </div>
        </form>
    )
}
