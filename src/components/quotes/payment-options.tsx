import { CreditCard, Banknote, QrCode, Calendar } from 'lucide-react'

interface PaymentOption {
    icon: typeof CreditCard
    title: string
    description: string
}

interface PaymentOptionsProps {
    themeColor?: string
    /** Mostrar desconto à vista? */
    showCashDiscount?: boolean
    /** Percentual de desconto à vista (ex: 5 = 5%) */
    cashDiscountPercent?: number
    /** Número de parcelas */
    installmentCount?: number
    /** Total do orçamento para cálculo de parcelas */
    total?: number
}

export function PaymentOptions({
    themeColor = '#0D9B5C',
    showCashDiscount = false,
    cashDiscountPercent = 5,
    installmentCount,
    total
}: PaymentOptionsProps) {
    const formatCurrency = (value: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

    const installmentValue = installmentCount && total ? total / installmentCount : null

    const paymentMethods: PaymentOption[] = [
        {
            icon: QrCode,
            title: 'PIX',
            description: showCashDiscount && total
                ? `À vista ${formatCurrency(total * (1 - cashDiscountPercent / 100))} (${cashDiscountPercent}% desc.)`
                : showCashDiscount
                    ? `À vista com ${cashDiscountPercent}% de desconto`
                    : 'Pagamento instantâneo'
        },
        {
            icon: Banknote,
            title: 'Dinheiro',
            description: showCashDiscount && total
                ? `À vista ${formatCurrency(total * (1 - cashDiscountPercent / 100))} (${cashDiscountPercent}% desc.)`
                : showCashDiscount
                    ? `À vista com ${cashDiscountPercent}% de desconto`
                    : 'Pagamento em espécie'
        },
        {
            icon: CreditCard,
            title: 'Cartão',
            description: 'Débito ou crédito'
        },
        {
            icon: Calendar,
            title: 'Parcelado',
            description: installmentCount && installmentValue
                ? `Em até ${installmentCount}x de ${formatCurrency(installmentValue)}`
                : installmentCount
                    ? `Em até ${installmentCount}x`
                    : 'Condições a combinar'
        }
    ]

    return (
        <div
            className="bg-slate-50 rounded-lg p-6 print:p-4 border border-slate-200 print:break-inside-avoid"
            style={{
                pageBreakInside: 'avoid',
            }}
        >
            <h3 className="font-bold text-lg mb-4 print:mb-3 print:text-base">
                Formas de Pagamento
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 print:gap-2">
                {paymentMethods.map((method, index) => {
                    const Icon = method.icon
                    return (
                        <div
                            key={index}
                            className="flex flex-col items-center text-center p-3 rounded-lg border bg-white print:p-2"
                            style={{
                                borderColor: `${themeColor}20`,
                            }}
                        >
                            <div
                                className="w-10 h-10 rounded-full flex items-center justify-center mb-2 print:w-8 print:h-8 print:mb-1"
                                style={{
                                    backgroundColor: `${themeColor}15`,
                                }}
                            >
                                <Icon
                                    className="h-5 w-5 print:h-4 print:w-4"
                                    style={{ color: themeColor }}
                                />
                            </div>
                            <h4 className="font-semibold text-sm print:text-xs">
                                {method.title}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1 print:text-[10px]">
                                {method.description}
                            </p>
                        </div>
                    )
                })}
            </div>

            {showCashDiscount && (
                <div
                    className="mt-4 p-3 rounded-lg text-center print:mt-3 print:p-2"
                    style={{
                        backgroundColor: `${themeColor}10`,
                        borderLeft: `3px solid ${themeColor}`,
                    }}
                >
                    <p className="text-sm font-semibold" style={{ color: themeColor }}>
                        💰 {cashDiscountPercent}% de desconto para pagamento à vista (PIX ou Dinheiro)
                    </p>
                </div>
            )}
        </div>
    )
}
