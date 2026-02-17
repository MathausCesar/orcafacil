import { Shield, CheckCircle, Clock } from 'lucide-react'

interface WarrantyBoxProps {
    themeColor?: string
}

export function WarrantyBox({ themeColor = '#0D9B5C' }: WarrantyBoxProps) {
    const warranties = [
        {
            icon: Shield,
            text: 'Garantia de qualidade em todos os serviços',
        },
        {
            icon: CheckCircle,
            text: 'Profissionais qualificados e experientes',
        },
        {
            icon: Clock,
            text: 'Prazo de execução garantido',
        },
    ]

    return (
        <div
            className="border-2 rounded-lg p-6 print:p-4 print:break-inside-avoid"
            style={{
                borderColor: themeColor,
                backgroundColor: `${themeColor}08`,
                pageBreakInside: 'avoid',
            }}
        >
            <h3
                className="font-bold text-lg mb-4 print:mb-3 print:text-base"
                style={{ color: themeColor }}
            >
                Nossos Compromissos
            </h3>
            <div className="grid gap-3 print:gap-2">
                {warranties.map((warranty, index) => {
                    const Icon = warranty.icon
                    return (
                        <div key={index} className="flex items-start gap-3">
                            <Icon
                                className="h-5 w-5 flex-shrink-0 mt-0.5 print:h-4 print:w-4"
                                style={{ color: themeColor }}
                            />
                            <p className="text-sm text-foreground print:text-xs">
                                {warranty.text}
                            </p>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
