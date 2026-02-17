import { TrendingUp, Users, Award } from 'lucide-react'

interface ValuePropositionProps {
    themeColor?: string
}

export function ValueProposition({ themeColor = '#0D9B5C' }: ValuePropositionProps) {
    const values = [
        {
            icon: TrendingUp,
            title: 'Melhor Custo-Benefício',
            description: 'Preços justos sem abrir mão da qualidade',
        },
        {
            icon: Users,
            title: 'Atendimento Personalizado',
            description: 'Suporte dedicado durante todo o projeto',
        },
        {
            icon: Award,
            title: 'Experiência Comprovada',
            description: 'Anos de mercado com clientes satisfeitos',
        },
    ]

    return (
        <div
            className="bg-slate-50 rounded-lg p-6 print:p-4 border border-slate-200 print:break-inside-avoid"
            style={{
                pageBreakInside: 'avoid',
            }}
        >
            <h3 className="font-bold text-lg mb-4 text-center print:mb-3 print:text-base">
                Por Que Aprovar Este Orçamento?
            </h3>
            <div className="grid md:grid-cols-3 gap-4 print:gap-3">
                {values.map((value, index) => {
                    const Icon = value.icon
                    return (
                        <div key={index} className="text-center">
                            <div
                                className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 print:w-10 print:h-10 print:mb-2"
                                style={{ backgroundColor: `${themeColor}15` }}
                            >
                                <Icon
                                    className="h-6 w-6 print:h-5 print:w-5"
                                    style={{ color: themeColor }}
                                />
                            </div>
                            <h4 className="font-semibold text-sm mb-1 print:text-xs">
                                {value.title}
                            </h4>
                            <p className="text-xs text-muted-foreground print:text-[10px]">
                                {value.description}
                            </p>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
