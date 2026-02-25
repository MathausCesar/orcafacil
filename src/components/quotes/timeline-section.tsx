import { Calendar, CheckCircle2 } from 'lucide-react'

interface TimelineItem {
    phase: string
    duration: string
    status: 'pending' | 'current' | 'completed'
    subtitle?: string
}

interface TimelineSectionProps {
    themeColor?: string
    estimatedDays?: number
    quoteStatus?: string
}

export function TimelineSection({
    themeColor = '#0D9B5C',
    estimatedDays,
    quoteStatus = 'pending'
}: TimelineSectionProps) {
    const getPhases = (): TimelineItem[] => {
        switch (quoteStatus) {
            case 'completed':
                return [
                    { phase: 'Aprovação e Início', duration: '✓', status: 'completed', subtitle: 'Concluído' },
                    { phase: 'Execução do Serviço', duration: '✓', status: 'completed', subtitle: 'Concluído' },
                    { phase: 'Revisão e Entrega', duration: '✓', status: 'completed', subtitle: 'Serviço finalizado' }
                ]
            case 'in_progress':
                return [
                    { phase: 'Aprovação e Início', duration: '✓', status: 'completed', subtitle: 'Aprovado' },
                    { phase: 'Execução do Serviço', duration: estimatedDays ? `${estimatedDays} dias` : '3-5 dias', status: 'current', subtitle: 'Em andamento' },
                    { phase: 'Revisão e Entrega', duration: '1 dia', status: 'pending' }
                ]
            case 'approved':
                return [
                    { phase: 'Aprovação e Início', duration: '✓', status: 'completed', subtitle: 'Aprovado pelo cliente' },
                    { phase: 'Execução do Serviço', duration: estimatedDays ? `${estimatedDays} dias` : '3-5 dias', status: 'pending' },
                    { phase: 'Revisão e Entrega', duration: '1 dia', status: 'pending' }
                ]
            default:
                return [
                    { phase: 'Aprovação e Início', duration: '1-2 dias', status: 'current', subtitle: 'Aguardando sua aprovação' },
                    { phase: 'Execução do Serviço', duration: estimatedDays ? `${estimatedDays} dias` : '3-5 dias', status: 'pending' },
                    { phase: 'Revisão e Entrega', duration: '1 dia', status: 'pending' }
                ]
        }
    }

    const phases = getPhases()

    return (
        <div className="bg-slate-50 rounded-lg p-6 print:p-4 border border-slate-200 print:break-inside-avoid"
            style={{
                pageBreakInside: 'avoid',
            }}
        >
            <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5" style={{ color: themeColor }} />
                <h3 className="font-bold text-lg print:text-base">
                    Cronograma de Execução
                </h3>
            </div>

            <div className="space-y-4">
                {phases.map((item, index) => (
                    <div key={index} className="flex gap-4">
                        {/* Timeline Visual */}
                        <div className="flex flex-col items-center">
                            {item.status === 'completed' ? (
                                <CheckCircle2
                                    className="h-3.5 w-3.5 flex-shrink-0"
                                    style={{ color: themeColor }}
                                />
                            ) : (
                                <div
                                    className="w-3 h-3 rounded-full border-2 flex-shrink-0"
                                    style={{
                                        borderColor: themeColor,
                                        backgroundColor: item.status === 'current' ? themeColor : undefined
                                    }}
                                />
                            )}
                            {index < phases.length - 1 && (
                                <div
                                    className="w-0.5 h-full min-h-[40px] print:min-h-[30px]"
                                    style={{
                                        backgroundColor: item.status === 'completed' ? `${themeColor}80` : `${themeColor}30`
                                    }}
                                />
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 pb-2">
                            <div className="flex items-center justify-between">
                                <h4 className={`font-semibold text-sm ${item.status === 'completed' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                                    {item.phase}
                                </h4>
                                <span className="text-xs text-muted-foreground">
                                    {item.duration}
                                </span>
                            </div>
                            {item.subtitle && (
                                <p className={`text-xs mt-1 ${item.status === 'current' ? 'font-medium' : ''}`}
                                    style={{ color: item.status === 'current' ? themeColor : undefined }}
                                >
                                    {item.status === 'current' ? `● ${item.subtitle}` : item.subtitle}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-200 flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: themeColor }} />
                <p className="text-xs text-muted-foreground">
                    {quoteStatus === 'completed'
                        ? 'Serviço finalizado com sucesso!'
                        : `Prazo total estimado: ${estimatedDays ? `${estimatedDays + 3} dias úteis` : '5-8 dias úteis'}`
                    }
                </p>
            </div>
        </div>
    )
}
