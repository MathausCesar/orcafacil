import { CreditCard, Banknote, QrCode, Calendar } from 'lucide-react'

interface PaymentOption {
    id: string
    icon: typeof CreditCard
    title: string
    detail?: string
}

interface PaymentOptionsProps {
    themeColor?: string
    paymentMethods?: string[] | null
    showCashDiscount?: boolean
    cashDiscountPercent?: number
    cashDiscountFixed?: number
    cashDiscountType?: string
    installmentCount?: number | null
    total?: number
}

const methodCatalog: PaymentOption[] = [
    { id: 'pix', icon: QrCode, title: 'PIX', detail: 'Confirmação rápida' },
    { id: 'cash', icon: Banknote, title: 'Dinheiro', detail: 'Pagamento à vista' },
    { id: 'card', icon: CreditCard, title: 'Cartão', detail: 'Crédito ou débito' },
    { id: 'installment', icon: Calendar, title: 'Parcelado', detail: 'Parcelamento combinado' },
]

function formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function PaymentOptions({
    themeColor = '#0D9B5C',
    paymentMethods,
    showCashDiscount,
    cashDiscountPercent = 0,
    cashDiscountFixed = 0,
    cashDiscountType = 'percent',
    installmentCount,
    total = 0,
}: PaymentOptionsProps) {
    const selectedMethods = paymentMethods && paymentMethods.length > 0
        ? methodCatalog.filter(method => paymentMethods.includes(method.id))
        : methodCatalog

    const discountValue = cashDiscountType === 'fixed'
        ? cashDiscountFixed
        : total * (cashDiscountPercent / 100)

    const cashTotal = Math.max(total - discountValue, 0)
    const installmentValue = installmentCount && installmentCount > 1 ? total / installmentCount : null

    return (
        <section className="break-inside-avoid rounded-2xl border border-slate-200 bg-white p-5 shadow-sm print:border-slate-300 print:p-4">
            <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                    <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-900">
                        Pagamento
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                        Condições aceitas nesta proposta
                    </p>
                </div>
                {showCashDiscount && discountValue > 0 && (
                    <div className="rounded-full px-3 py-1 text-xs font-bold text-white" style={{ backgroundColor: themeColor }}>
                        À vista {formatCurrency(cashTotal)}
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 print:grid-cols-2">
                {selectedMethods.map((method) => {
                    const Icon = method.icon
                    const detail = method.id === 'installment' && installmentValue
                        ? `${installmentCount}x de ${formatCurrency(installmentValue)}`
                        : method.detail

                    return (
                        <div
                            key={method.id}
                            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-4"
                        >
                            <div
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                                style={{ backgroundColor: `${themeColor}18` }}
                            >
                                <Icon className="h-5 w-5" style={{ color: themeColor }} />
                            </div>
                            <div className="min-w-0">
                                <h4 className="text-sm font-bold text-slate-900">{method.title}</h4>
                                {detail && <p className="text-xs text-slate-500">{detail}</p>}
                            </div>
                        </div>
                    )
                })}
            </div>
        </section>
    )
}
