'use client'

import { useState, useEffect } from 'react'
import { createQuote, updateQuote } from '@/app/actions/quotes'
import { ProductSearch } from '@/components/quotes/product-search'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trash2, Save, ArrowLeft, Calendar as CalendarIcon, FileText, Loader2, Settings2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { ClientAutocomplete } from '@/components/clients/client-autocomplete'
import { useRouter } from 'next/navigation'

export interface QuoteItem {
    id: string;
    description: string;
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

    const handleAddItem = (product: { name: string; price: number; quantity: number }) => {
        const newItem: QuoteItem = {
            id: Math.random().toString(36).substr(2, 9),
            description: product.name,
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
                // Redirect handled by action usually, but update might return success.
            }
        } catch (e) {
            toast.error('Erro ao salvar orçamento.')
        } finally {
            setLoading(false)
        }
    }

    const total = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0)

    return (
        <form action={handleSubmit} className="space-y-6 pb-44 md:pb-24">
            <div className="flex items-center gap-2 mb-4">
                <Link href={initialData?.id ? `/quotes/${initialData.id}` : "/"}>
                    <Button variant="ghost" size="icon" className="hover:bg-primary/10 hover:text-primary"><ArrowLeft className="h-5 w-5" /></Button>
                </Link>
                <h1 className="text-xl font-bold text-foreground">
                    {initialData?.id ? 'Editar Orçamento' : 'Novo Orçamento'}
                </h1>
            </div>

            {/* Client Data - Full Width */}
            <Card className="border-primary/10">
                <CardHeader className="pb-3 bg-primary/5 border-b border-primary/10">
                    <CardTitle className="text-sm font-semibold text-primary flex items-center gap-2">
                        <FileText className="h-4 w-4" /> Dados do Cliente
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                    <ClientAutocomplete
                        defaultValue={clientName}
                        onSelect={(client) => {
                            setClientName(client.name)
                            setClientPhone(client.phone)
                        }}
                    />
                    {/* Hidden input for phone if not provided by autocomplete text input directly */}
                    <input type="hidden" name="clientPhone" value={clientPhone} />
                </CardContent>
            </Card>

            {/* Items Section */}
            <Card className="border-t-4 border-t-primary border-primary/10">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base text-foreground">Itens e Serviços</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <ProductSearch onAddProduct={handleAddItem} />

                    {items.length > 0 ? (
                        <div className="space-y-3 mt-4">
                            <div className="hidden md:grid grid-cols-12 gap-4 text-xs font-medium text-muted-foreground px-2">
                                <div className="col-span-6">DESCRIÇÃO</div>
                                <div className="col-span-2 text-center">QTD</div>
                                <div className="col-span-2 text-right">UNIT.</div>
                                <div className="col-span-2 text-right">TOTAL</div>
                            </div>

                            {items.map((item) => (
                                <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-card p-3 rounded-lg border border-primary/10 shadow-sm group hover:border-primary/25 transition-all">

                                    <div className="col-span-12 md:col-span-6">
                                        <Input
                                            value={item.description}
                                            onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                                            className="h-9 font-medium focus-visible:ring-primary"
                                            placeholder="Descrição"
                                        />
                                    </div>

                                    <div className="col-span-4 md:col-span-2">
                                        <div className="md:hidden text-[10px] text-muted-foreground mb-1">Qtd</div>
                                        <Input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => handleUpdateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                                            className="h-9 text-center focus-visible:ring-primary"
                                        />
                                    </div>

                                    <div className="col-span-4 md:col-span-2">
                                        <div className="md:hidden text-[10px] text-muted-foreground mb-1">Unit.</div>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={item.unitPrice}
                                            onChange={(e) => handleUpdateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                                            className="h-9 text-right focus-visible:ring-primary"
                                        />
                                    </div>

                                    <div className="col-span-4 md:col-span-2 flex items-center justify-end gap-2">
                                        <div className="text-right">
                                            <div className="md:hidden text-[10px] text-muted-foreground mb-1">Total</div>
                                            <span className="font-bold text-sm text-primary">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.quantity * item.unitPrice)}
                                            </span>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                                            onClick={() => handleRemoveItem(item.id)}
                                            tabIndex={-1}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}

                            <div className="pt-6 mt-6 border-t border-primary/10 flex justify-end items-center gap-4">
                                <span className="text-sm font-medium text-muted-foreground">SUBTOTAL</span>
                                <span className="text-2xl font-bold text-primary">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground bg-primary/5 rounded-lg border-dashed border-2 border-primary/20">
                            <p>Nenhum item adicionado.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Customization Section */}
            <Card className="border-primary/10">
                <CardHeader className="pb-3 bg-primary/5 border-b border-primary/10">
                    <CardTitle className="text-sm font-semibold text-primary flex items-center gap-2">
                        <Settings2 className="h-4 w-4" /> Personalização do Orçamento
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                        Adicione informações opcionais que aparecem automaticamente no orçamento
                    </p>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    {/* Timeline Toggle */}
                    <div className="flex items-start space-x-3 p-4 rounded-lg border border-slate-200 bg-slate-50/50">
                        <Checkbox
                            id="show_timeline"
                            checked={showTimeline}
                            onCheckedChange={(checked) => setShowTimeline(checked as boolean)}
                        />
                        <div className="flex-1">
                            <Label
                                htmlFor="show_timeline"
                                className="text-sm font-medium cursor-pointer"
                            >
                                📅 Mostrar Cronograma de Execução
                            </Label>
                            <p className="text-xs text-muted-foreground mt-1">
                                Exibe timeline visual com fases do projeto
                            </p>

                            {showTimeline && (
                                <div className="mt-3 space-y-2">
                                    <Label htmlFor="estimated_days" className="text-xs">
                                        Prazo estimado (dias úteis)
                                    </Label>
                                    <Input
                                        id="estimated_days"
                                        type="number"
                                        min="1"
                                        max="365"
                                        value={estimatedDays}
                                        onChange={(e) => setEstimatedDays(e.target.value)}
                                        placeholder="Ex: 5"
                                        className="h-9"
                                    />
                                    <p className="text-[10px] text-muted-foreground">
                                        Deixe vazio para usar padrão (5-8 dias)
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Payment Options Toggle */}
                    <div className="flex items-start space-x-3 p-4 rounded-lg border border-slate-200 bg-slate-50/50">
                        <Checkbox
                            id="show_payment"
                            checked={showPaymentOptions}
                            onCheckedChange={(checked) => setShowPaymentOptions(checked as boolean)}
                        />
                        <div className="flex-1">
                            <Label
                                htmlFor="show_payment"
                                className="text-sm font-medium cursor-pointer"
                            >
                                💳 Mostrar Formas de Pagamento
                            </Label>
                            <p className="text-xs text-muted-foreground mt-1">
                                Exibe ícones visuais das formas de pagamento aceitas
                            </p>

                            {showPaymentOptions && (
                                <div className="mt-3 space-y-4">
                                    {/* Payment Methods */}
                                    <div className="space-y-2">
                                        <Label className="text-xs">
                                            Formas aceitas (selecione uma ou mais):
                                        </Label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                { value: 'pix', label: '📱 PIX' },
                                                { value: 'cash', label: '💵 Dinheiro' },
                                                { value: 'card', label: '💳 Cartão' },
                                                { value: 'installment', label: '📅 Parcelado' },
                                            ].map((method) => (
                                                <div key={method.value} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={method.value}
                                                        checked={paymentMethods.includes(method.value)}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                setPaymentMethods([...paymentMethods, method.value])
                                                            } else {
                                                                setPaymentMethods(paymentMethods.filter(m => m !== method.value))
                                                            }
                                                        }}
                                                    />
                                                    <Label htmlFor={method.value} className="text-xs font-normal cursor-pointer">
                                                        {method.label}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Installment Count - Only if installment is selected */}
                                    {paymentMethods.includes('installment') && (
                                        <div className="space-y-2">
                                            <Label htmlFor="installment_count" className="text-xs">
                                                Número de parcelas
                                            </Label>
                                            <Input
                                                id="installment_count"
                                                type="number"
                                                min="2"
                                                max="36"
                                                value={installmentCount}
                                                onChange={(e) => setInstallmentCount(e.target.value)}
                                                placeholder="Ex: 6"
                                                className="h-9"
                                            />
                                            <p className="text-[10px] text-muted-foreground">
                                                Máximo de 36 parcelas
                                            </p>
                                        </div>
                                    )}

                                    {/* Cash Discount */}
                                    {(paymentMethods.includes('pix') || paymentMethods.includes('cash')) && (
                                        <div className="space-y-2">
                                            <Label htmlFor="cash_discount" className="text-xs">
                                                Desconto à vista (%) - opcional
                                            </Label>
                                            <Input
                                                id="cash_discount"
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={cashDiscount}
                                                onChange={(e) => setCashDiscount(e.target.value)}
                                                placeholder="Ex: 5"
                                                className="h-9"
                                            />
                                            <p className="text-[10px] text-muted-foreground">
                                                Será aplicado para PIX e/ou Dinheiro
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Final Notes */}
            <Card className="border-primary/10">
                <CardContent className="pt-6">
                    <div className="space-y-2">
                        <Label htmlFor="notes">Observações Finais / Garantia</Label>
                        <Textarea
                            id="notes"
                            name="notes"
                            defaultValue={initialData?.notes}
                            placeholder="Ex: Garantia de 3 meses para peças. Mão de obra inclusa."
                            className="min-h-[100px] focus-visible:ring-primary"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Floating Save Button */}
            <div className="fixed bottom-[4rem] left-0 right-0 p-4 bg-white/90 backdrop-blur-xl border-t border-primary/10 md:static md:bg-transparent md:border-0 md:p-0 z-40 pb-safe">
                <Button size="lg" className="w-full text-lg h-14 shadow-xl shadow-primary/25 bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90" disabled={loading}>
                    {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processando...</> : <><Save className="mr-2 h-5 w-5" /> {initialData?.id ? 'Atualizar Orçamento' : 'Finalizar Orçamento'}</>}
                </Button>
            </div>
        </form>
    )
}
