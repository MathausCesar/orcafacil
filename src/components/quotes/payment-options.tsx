import { CreditCard, Banknote, QrCode, Calendar } from 'lucide-react'

interface PaymentOption {
    icon: typeof CreditCard
    title: string
}

interface PaymentOptionsProps {
    themeColor?: string
    /** Mostrar PIX / Cartão etc, baseado nas seleções do DB? (Aqui pegamos por props) */
    // To keep signature consistent, we keep props even if unused for descriptions
    showCashDiscount?: boolean
    cashDiscountPercent?: number
    cashDiscountFixed?: number
    cashDiscountType?: string
    installmentCount?: number
    total?: number
}

export function PaymentOptions({
    themeColor = '#0D9B5C',
}: PaymentOptionsProps) {

    const paymentMethods: PaymentOption[] = [
        {
            icon: QrCode,
            title: 'PIX',
        },
        {
            icon: Banknote,
            title: 'Dinheiro',
        },
        {
            icon: CreditCard,
            title: 'Cartão',
        },
        {
            icon: Calendar,
            title: 'Parcelado',
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
                            className="flex flex-col items-center justify-center text-center p-4 rounded-lg border bg-white print:p-3"
                            style={{
                                borderColor: `${themeColor}20`,
                            }}
                        >
                            <div
                                className="w-12 h-12 rounded-full flex items-center justify-center mb-3 print:w-10 print:h-10 print:mb-2"
                                style={{
                                    backgroundColor: `${themeColor}15`,
                                }}
                            >
                                <Icon
                                    className="h-6 w-6 print:h-5 print:w-5"
                                    style={{ color: themeColor }}
                                />
                            </div>
                            <h4 className="font-semibold text-sm print:text-xs text-slate-800">
                                {method.title}
                            </h4>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
