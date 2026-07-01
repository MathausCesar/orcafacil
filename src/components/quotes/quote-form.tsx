'use client'

import { useState, useEffect, useRef } from 'react'
import { createQuote, updateQuote } from '@/app/actions/quotes'
import { ProductSearch } from '@/components/quotes/product-search'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Trash2, Save, ArrowLeft, FileText, Loader2, Settings2, Wallet, Clock, CheckCircle2, AlignLeft, LayoutTemplate, Check, Package, Wrench } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { ClientAutocomplete } from '@/components/clients/client-autocomplete'
import { useRouter } from 'next/navigation'
import { PROPOSAL_MODELS } from '@/lib/proposal-style'
import { PROFESSIONAL_CONTEXTS, getProfessionalContext } from '@/lib/professional-context'

type NumericQuoteItemField = 'quantity' | 'unitPrice'

function parseBrazilianNumber(value: string) {
    const cleanValue = value.trim().replace(/\s/g, '')

    if (!cleanValue) return null

    const normalized = cleanValue.includes(',')
        ? cleanValue.replace(/\./g, '').replace(',', '.')
        : cleanValue

    const parsed = Number(normalized)
    return Number.isFinite(parsed) ? parsed : null
}

function formatNumberInput(value: number) {
    return String(value).replace('.', ',')
}

export interface QuoteItem {
    id: string;
    serviceId?: string | null;
    itemType?: 'service' | 'product';
    description: string;
    details?: string | null;
    quantity: number;
    unitPrice: number;
    unitCost?: number;
}

interface QuoteFormProps {
    quickMode?: boolean
    initialData?: {
        id?: string
        clientName: string
        clientPhone?: string
        expirationDate?: string
        paymentTerms?: string
        notes?: string
        showDetailedItems?: boolean
        showTimeline?: boolean
        showPaymentOptions?: boolean
        estimatedDays?: string
        cashDiscountPercent?: number
        cashDiscountFixed?: number
        cashDiscountType?: string
        paymentMethods?: string[]
        installmentCount?: string
        layoutStyle?: string
        professionalContext?: string
        items: QuoteItem[]
    }
}

export function QuoteForm({ initialData, quickMode = false }: QuoteFormProps) {
    const [items, setItems] = useState<QuoteItem[]>(initialData?.items || [])
    const [loading, setLoading] = useState(false)
    const isSubmitting = useRef(false)
    const [date, setDate] = useState<string>(initialData?.expirationDate || '')
    const [clientName, setClientName] = useState(initialData?.clientName || '')
    const [clientPhone, setClientPhone] = useState(initialData?.clientPhone || '')
    const [paymentTerms, setPaymentTerms] = useState(initialData?.paymentTerms || 'A combinar')
    const [notes, setNotes] = useState(initialData?.notes || '')
    const [itemDrafts, setItemDrafts] = useState<Record<string, Partial<Record<NumericQuoteItemField, string>>>>({})

    // Customization states
    // In a real app, these could come from initialData too if persisted
    const [showDetailedItems, setShowDetailedItems] = useState(initialData?.showDetailedItems || false)
    const [showTimeline, setShowTimeline] = useState(initialData?.showTimeline || false)
    const [showPaymentOptions, setShowPaymentOptions] = useState(initialData?.showPaymentOptions || false)
    const [estimatedDays, setEstimatedDays] = useState(initialData?.estimatedDays || '')
    const [cashDiscountType, setCashDiscountType] = useState(initialData?.cashDiscountType || 'percent')
    const [cashDiscount, setCashDiscount] = useState(
        initialData?.cashDiscountType === 'fixed'
            ? String(initialData?.cashDiscountFixed || '')
            : String(initialData?.cashDiscountPercent || '')
    )
    const [paymentMethods, setPaymentMethods] = useState<string[]>(initialData?.paymentMethods || [])
    const [installmentCount, setInstallmentCount] = useState(initialData?.installmentCount || '')
    const [layoutStyle, setLayoutStyle] = useState(initialData?.layoutStyle || 'professional')
    const [professionalContext, setProfessionalContext] = useState(initialData?.professionalContext || 'general')
    const [showAdvancedSettings, setShowAdvancedSettings] = useState(!quickMode)

    const router = useRouter()

    useEffect(() => {
        if (!date) {
            const d = new Date()
            d.setDate(d.getDate() + 7)
            setDate(d.toISOString().split('T')[0])
        }
    }, [date])

    const handleAddItem = (product: {
        serviceId?: string | null
        itemType?: 'service' | 'product'
        name: string
        price: number
        quantity: number
        details?: string | null
        unitCost?: number
    }) => {
        const newItem: QuoteItem = {
            id: Math.random().toString(36).substr(2, 9),
            serviceId: product.serviceId || null,
            itemType: product.itemType || 'service',
            description: product.name,
            details: product.details || null,
            quantity: product.quantity,
            unitPrice: product.price,
            unitCost: product.unitCost || 0
        }
        setItems([...items, newItem])
    }

    const handleRemoveItem = (id: string) => {
        setItems(items.filter(i => i.id !== id))
    }

    const handleUpdateItem = <Field extends keyof QuoteItem>(id: string, field: Field, value: QuoteItem[Field]) => {
        setItems(items.map(i => i.id === id ? { ...i, [field]: value } : i))
    }

    const handleItemNumberChange = (id: string, field: NumericQuoteItemField, value: string) => {
        setItemDrafts((current) => ({
            ...current,
            [id]: {
                ...current[id],
                [field]: value,
            },
        }))

        const parsed = parseBrazilianNumber(value)
        if (parsed !== null) {
            handleUpdateItem(id, field, parsed)
        }
    }

    const handleItemNumberBlur = (id: string, field: NumericQuoteItemField) => {
        setItemDrafts((current) => {
            const next = { ...current }
            const itemDraft = { ...(next[id] || {}) }
            delete itemDraft[field]

            if (Object.keys(itemDraft).length > 0) {
                next[id] = itemDraft
            } else {
                delete next[id]
            }

            return next
        })
    }

    const handleProfessionalContextChange = (contextId: string) => {
        const context = getProfessionalContext(contextId)

        setProfessionalContext(context.id)
        setShowTimeline(true)
        setEstimatedDays((current) => current || String(context.defaultEstimatedDays))
        setShowPaymentOptions(true)
        setPaymentMethods((current) => current.length > 0 ? current : [...context.suggestedPaymentMethods])

        if ((context.suggestedPaymentMethods as readonly string[]).includes('installment') && !installmentCount) {
            setInstallmentCount('3')
        }

        if (!notes.trim()) {
            setNotes(context.defaultNotes)
        }
    }

    const handleSubmit = async (formData: FormData) => {
        if (isSubmitting.current) return;

        if (items.length === 0) {
            toast.error('Adicione pelo menos um item.')
            return
        }

        if (!clientName) {
            toast.error('Informe o nome do cliente.')
            return
        }

        isSubmitting.current = true;
        setLoading(true)
        formData.set('items', JSON.stringify(items))
        formData.set('clientName', clientName)
        if (clientPhone) formData.set('clientPhone', clientPhone)
        formData.set('expirationDate', date)
        formData.set('paymentTerms', paymentTerms)
        formData.set('notes', notes)

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
                const normalizedCashDiscount = String(parseBrazilianNumber(cashDiscount) || 0)
                if (cashDiscountType === 'percent') {
                    formData.set('cash_discount_percent', normalizedCashDiscount)
                    formData.set('cash_discount_fixed', '0')
                } else {
                    formData.set('cash_discount_fixed', normalizedCashDiscount)
                    formData.set('cash_discount_percent', '0')
                }
                formData.set('cash_discount_type', cashDiscountType)
            }
            if (paymentMethods.includes('installment') && installmentCount) {
                formData.set('installment_count', installmentCount)
            }
        }
        formData.set('layout_style', layoutStyle)
        formData.set('professional_context', professionalContext)

        try {
            let result;
            if (initialData?.id) {
                result = await updateQuote(initialData.id, formData)
            } else {
                result = await createQuote(formData)
            }

            if (result?.error === 'LIMIT_REACHED') {
                const limitMessage = 'message' in result && typeof result.message === 'string'
                    ? result.message
                    : 'Limite de orçamentos atingido.'
                toast.error(limitMessage, {
                    action: {
                        label: 'Ver Planos',
                        onClick: () => router.push('/pricing')
                    },
                    duration: 10000,
                })
                router.push('/pricing')
                return
            } else if (result?.error) {
                toast.error(result.error)
            } else if (result?.success) {
                toast.success(initialData?.id ? 'Orçamento atualizado!' : 'Orçamento criado!')
                if (result.redirect) {
                    router.push(result.redirect)
                }
            }
        } catch {
            toast.error('Erro ao salvar orçamento.')
        } finally {
            isSubmitting.current = false;
            setLoading(false)
        }
    }

    const total = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0)

    return (
        <form action={handleSubmit} className="pb-40 lg:pb-0">
            {/* Header Area */}
            <div className="flex items-center gap-4 mb-8">
                <Link href={initialData?.id ? `/quotes/${initialData.id}` : "/"}>
                    <Button variant="outline" size="icon" className="h-10 w-10 rounded-full border-border">
                        <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">
                        {initialData?.id ? 'Editar Orçamento' : 'Novo Orçamento'}
                    </h1>
                    <p className="text-muted-foreground text-sm">Comece pelo cliente e pelos itens. O visual fica como ajuste opcional.</p>
                </div>
            </div>

            {quickMode && (
                <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                    <p className="font-semibold">Modo rápido para o primeiro orçamento</p>
                    <p className="mt-1 text-emerald-800/80">
                        Comece com cliente, itens e observações. Layout, pagamento e cronograma continuam disponíveis nos ajustes da proposta.
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                {/* Main Column (Left) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Client Data */}
                    <Card className="border-0 shadow-sm ring-1 ring-border">
                        <CardHeader className="pb-4 border-b border-border">
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                                    <FileText className="h-5 w-5" />
                                </div>
                                Cliente
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <ClientAutocomplete
                                defaultValue={clientName}
                                onSelect={(client) => {
                                    setClientName(client.name)
                                    setClientPhone(client.phone || '')
                                }}
                            />
                            <input type="hidden" name="clientPhone" value={clientPhone} />
                        </CardContent>
                    </Card>

                    {/* Items Section */}
                    <Card className="border-0 shadow-sm ring-1 ring-border overflow-hidden">
                        <CardHeader className="pb-4 border-b border-border bg-muted/30">
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
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
                                    <div className="hidden lg:grid grid-cols-12 gap-2 text-xs font-semibold text-muted-foreground px-4 uppercase tracking-wider">
                                        <div className="col-span-5">Descrição</div>
                                        <div className="col-span-1 text-center">Qtd</div>
                                        <div className="col-span-3 text-right">Unitário</div>
                                        <div className="col-span-3 text-right">Total</div>
                                    </div>

                                    <div className="space-y-3">
                                        {items.map((item) => (
                                            <div key={item.id} className="grid grid-cols-1 lg:grid-cols-12 gap-2 lg:gap-2 items-center bg-card p-4 rounded-xl border border-border shadow-sm group hover:border-primary/30 hover:shadow-md transition-all">

                                                <div className="lg:col-span-5 min-w-0">
                                                    <div className="mb-1 flex items-center gap-2">
                                                        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${item.itemType === 'product'
                                                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                                            : 'border-slate-200 bg-slate-50 text-slate-600'
                                                            }`}>
                                                            {item.itemType === 'product' ? <Package className="h-3 w-3" /> : <Wrench className="h-3 w-3" />}
                                                            {item.itemType === 'product' ? 'Produto' : 'Serviço'}
                                                        </span>
                                                        {item.itemType === 'product' && item.serviceId && (
                                                            <span className="text-[10px] text-muted-foreground">vinculado ao estoque</span>
                                                        )}
                                                    </div>
                                                    <Input
                                                        value={item.description}
                                                        onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                                                        className="font-medium border-transparent hover:border-slate-200 focus:border-emerald-500 bg-transparent px-0 lg:px-3 h-auto py-1 truncate"
                                                        placeholder="Descrição do item"
                                                    />
                                                </div>

                                                <div className="lg:col-span-1 flex items-center lg:justify-center">
                                                    <span className="lg:hidden text-sm text-muted-foreground mr-2">Qtd:</span>
                                                    <Input
                                                        type="text"
                                                        inputMode="decimal"
                                                        value={itemDrafts[item.id]?.quantity ?? formatNumberInput(item.quantity)}
                                                        onChange={(e) => handleItemNumberChange(item.id, 'quantity', e.target.value)}
                                                        onBlur={() => handleItemNumberBlur(item.id, 'quantity')}
                                                        className="w-16 text-center h-8"
                                                    />
                                                </div>

                                                <div className="lg:col-span-3 flex items-center lg:justify-end min-w-0">
                                                    <span className="lg:hidden text-sm text-muted-foreground mr-2 shrink-0">Unitário:</span>
                                                    <Input
                                                        type="text"
                                                        inputMode="decimal"
                                                        value={itemDrafts[item.id]?.unitPrice ?? formatNumberInput(item.unitPrice)}
                                                        onChange={(e) => handleItemNumberChange(item.id, 'unitPrice', e.target.value)}
                                                        onBlur={() => handleItemNumberBlur(item.id, 'unitPrice')}
                                                        className="w-full max-w-[120px] text-right h-8"
                                                    />
                                                </div>

                                                <div className="lg:col-span-3 flex items-center justify-between lg:justify-end gap-2 border-t lg:border-t-0 pt-3 lg:pt-0 mt-2 lg:mt-0 min-w-0">
                                                    <span className="font-bold text-foreground text-sm whitespace-nowrap">
                                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.quantity * item.unitPrice)}
                                                    </span>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 shrink-0 text-muted-foreground hover:text-red-600 hover:bg-red-500/10 rounded-full"
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
                                                            className="text-sm min-h-[60px] resize-none bg-muted/30 border-border"
                                                            placeholder="Detalhamento opcional do serviço ou produto..."
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex justify-end pt-4 border-t border-border">
                                        <div className="text-right">
                                            <p className="text-sm text-muted-foreground">Subtotal dos itens</p>
                                            <p className="text-2xl font-bold text-foreground">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-muted/30 rounded-xl border border-dashed border-border">
                                    <p className="text-muted-foreground">Nenhum item adicionado ainda.</p>
                                    <p className="text-sm text-muted-foreground/70">Use a busca acima para adicionar serviços ou produtos.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Observations */}
                    <Card className="border-0 shadow-sm ring-1 ring-border">
                        <CardHeader className="pb-4 border-b border-border">
                            <CardTitle className="text-base font-semibold">Observações Finais</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <Textarea
                                id="notes"
                                name="notes"
                                value={notes}
                                onChange={(event) => setNotes(event.target.value)}
                                placeholder="Ex: Garantia de 3 meses, condições especiais de entrega..."
                                className="min-h-[120px] resize-none"
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Column (Right) - Sticky */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="lg:sticky lg:top-6 flex flex-col gap-6">
                        <Card className="border-0 shadow-sm ring-1 ring-border">
                            <CardHeader className="pb-4 border-b border-border">
                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                    <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg">
                                        <Wrench className="h-4 w-4" />
                                    </div>
                                    Tipo de serviço
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-5 space-y-3">
                                <Select value={professionalContext} onValueChange={handleProfessionalContextChange}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Escolha o tipo de serviço" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {PROFESSIONAL_CONTEXTS.map((context) => (
                                            <SelectItem key={context.id} value={context.id}>
                                                {context.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs leading-5 text-muted-foreground">
                                    Ajusta sugestões de prazo, pagamento e texto sem travar sua proposta.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Summary & Save */}
                        <Card className="order-last lg:order-first border-0 shadow-lg ring-1 ring-border bg-slate-900 dark:bg-card text-white dark:text-card-foreground overflow-hidden">
                            <CardContent className="p-6">
                                <div className="space-y-1 mb-6">
                                    <p className="text-slate-400 dark:text-muted-foreground text-sm font-medium uppercase tracking-wider">Valor Total</p>
                                    <p className="text-4xl font-bold text-white dark:text-foreground tracking-tight">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
                                    </p>
                                </div>
                                <Button size="lg" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold h-12 shadow-lg shadow-emerald-900/20 border-0" disabled={loading}>
                                    {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                                    {initialData?.id ? 'Salvar alterações' : 'Finalizar orçamento'}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Customization Options */}
                        {quickMode && !showAdvancedSettings ? (
                            <Button
                                type="button"
                                variant="outline"
                                className="h-auto w-full justify-start gap-3 rounded-2xl border-dashed p-4 text-left"
                                onClick={() => setShowAdvancedSettings(true)}
                            >
                                <div className="rounded-lg bg-primary/10 p-2 text-primary">
                                    <Settings2 className="h-4 w-4" />
                                </div>
                                <span className="flex min-w-0 flex-col items-start">
                                    <span className="font-semibold text-foreground">Mostrar ajustes da proposta</span>
                                    <span className="text-xs font-normal text-muted-foreground">
                                        Escolha layout, pagamento, cronograma e detalhes extras.
                                    </span>
                                </span>
                            </Button>
                        ) : (
                        <Card className="border-0 shadow-sm ring-1 ring-border">
                            <CardHeader className="pb-3 border-b border-border bg-muted/30">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
                                    <Settings2 className="h-4 w-4" /> Ajustes da proposta
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-border">
                                    {/* Layout Style Selector */}
                                    <div className="p-4 space-y-3">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="p-2 bg-primary/10 text-primary rounded-lg">
                                                <LayoutTemplate className="h-4 w-4" />
                                            </div>
                                            <Label className="font-medium">Modelo visual</Label>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                            {PROPOSAL_MODELS.map((l) => (
                                                <button
                                                    key={l.id}
                                                    type="button"
                                                    onClick={() => setLayoutStyle(l.id)}
                                                    className={`relative p-3 rounded-xl border-2 text-center transition-all text-xs font-semibold ${layoutStyle === l.id
                                                        ? 'border-primary bg-primary/5 text-primary'
                                                        : 'border-border bg-card text-muted-foreground hover:border-primary/30'
                                                        }`}
                                                >
                                                    {layoutStyle === l.id && <Check className="absolute top-1.5 right-1.5 h-3 w-3 text-primary" />}
                                                    {l.name}
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-snug">Cada orçamento salva o modelo escolhido no momento da criação.</p>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg">
                                                <CheckCircle2 className="h-4 w-4" />
                                            </div>
                                            <Label className="font-medium">Condições comerciais</Label>
                                        </div>
                                        <div className="grid gap-3">
                                            <div>
                                                <Label htmlFor="expirationDate" className="mb-1.5 block text-xs text-muted-foreground">
                                                    Validade da proposta
                                                </Label>
                                                <Input
                                                    id="expirationDate"
                                                    name="expirationDate"
                                                    type="date"
                                                    value={date}
                                                    onChange={(event) => setDate(event.target.value)}
                                                    className="h-9 text-sm"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="paymentTerms" className="mb-1.5 block text-xs text-muted-foreground">
                                                    Condição combinada
                                                </Label>
                                                <Input
                                                    id="paymentTerms"
                                                    name="paymentTerms"
                                                    value={paymentTerms}
                                                    onChange={(event) => setPaymentTerms(event.target.value)}
                                                    placeholder="Ex: 50% no início e 50% na entrega"
                                                    className="h-9 text-sm"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    {/* Detailed Items Toggle */}
                                    <div className="p-4 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                                                <AlignLeft className="h-4 w-4" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <Label htmlFor="show_detailed" className="font-medium cursor-pointer">Mostrar detalhes dos itens</Label>
                                                    <Checkbox
                                                        id="show_detailed"
                                                        checked={showDetailedItems}
                                                        onCheckedChange={(checked) => setShowDetailedItems(checked as boolean)}
                                                    />
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1 leading-snug">Exibe descrições extras de produtos e serviços no documento.</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Timeline */}
                                    <div className="p-4 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
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
                                            <div className="pr-1 sm:pl-11 animate-in slide-in-from-top-2 duration-200">
                                                <Label className="text-xs text-muted-foreground mb-1.5 block">Dias estimados</Label>
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
                                            <div className="p-2 bg-orange-500/10 text-orange-500 rounded-lg">
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
                                            <div className="pr-1 space-y-3 sm:pl-11 animate-in slide-in-from-top-2 duration-200">
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
                                                        <Label className="text-xs text-muted-foreground mb-1 block">Número de parcelas</Label>
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
                                                        <Label className="text-xs text-muted-foreground mb-1 block">Desconto à vista</Label>
                                                        <div className="flex gap-2">
                                                            <div className="flex bg-muted rounded-md p-1 self-start">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setCashDiscountType('percent')}
                                                                    className={`px-3 py-1 text-xs rounded-sm font-medium transition-all ${cashDiscountType === 'percent' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                                                >%</button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setCashDiscountType('fixed')}
                                                                    className={`px-3 py-1 text-xs rounded-sm font-medium transition-all ${cashDiscountType === 'fixed' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                                                                >R$</button>
                                                            </div>
                                                            <Input
                                                                type="text"
                                                                inputMode="decimal"
                                                                placeholder={cashDiscountType === 'percent' ? "Ex: 5" : "Ex: 100,00"}
                                                                value={cashDiscount}
                                                                onChange={(e) => setCashDiscount(e.target.value)}
                                                                className="h-8 text-sm flex-1"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        )}
                    </div>
                </div>

                {/* Mobile Floating Button - Visible only on mobile */}
                <div className="fixed bottom-[calc(4.25rem+env(safe-area-inset-bottom))] left-0 right-0 z-40 border-t border-border bg-background/95 p-4 shadow-[0_-12px_30px_rgba(15,23,42,0.12)] backdrop-blur lg:hidden">
                    <Button type="submit" size="lg" className="w-full bg-emerald-600 font-bold" disabled={loading}>
                        {loading ? 'Salvando...' : `Salvar (${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)})`}
                    </Button>
                </div>

            </div>
        </form>
    )
}
