import {
    BadgeCheck,
    CircleAlert,
    CircleDollarSign,
    Eye,
    FileText,
    Send,
    WalletCards,
    XCircle,
    type LucideIcon,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

export type CommercialScoreboardProps = {
    sentValue: number
    openedValue: number
    approvedValue: number
    receivedValue: number
    outstandingValue: number
    lostValue: number
    quoteCount: number
}

type Bottleneck = {
    title: string
    description: string
    value: number
    icon: LucideIcon
    iconClassName: string
    surfaceClassName: string
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
})

const countFormatter = new Intl.NumberFormat('pt-BR')

function normalizeValue(value: number) {
    return Number.isFinite(value) ? value : 0
}

function formatCurrency(value: number) {
    return currencyFormatter.format(normalizeValue(value))
}

function formatQuoteCount(value: number) {
    return countFormatter.format(Math.max(0, Math.trunc(normalizeValue(value))))
}

function getBottleneck({
    sentValue,
    openedValue,
    approvedValue,
    receivedValue,
    outstandingValue,
    lostValue,
    quoteCount,
}: CommercialScoreboardProps): Bottleneck {
    if (quoteCount <= 0) {
        return {
            title: 'Comece pelo envio',
            description: 'Crie e envie uma proposta para colocar o funil em movimento.',
            value: 0,
            icon: Send,
            iconClassName: 'text-primary',
            surfaceClassName: 'bg-primary/10',
        }
    }

    if (outstandingValue > 0) {
        return {
            title: 'Cobrança pendente',
            description: 'Priorize os valores que já foram aprovados e ainda não entraram.',
            value: outstandingValue,
            icon: CircleAlert,
            iconClassName: 'text-amber-700',
            surfaceClassName: 'bg-amber-100',
        }
    }

    if (sentValue > 0 && openedValue <= 0) {
        return {
            title: 'Confirme a abertura',
            description: 'Retome as propostas enviadas que ainda não foram abertas.',
            value: sentValue,
            icon: Send,
            iconClassName: 'text-sky-700',
            surfaceClassName: 'bg-sky-100',
        }
    }

    if (openedValue > 0 && approvedValue <= 0) {
        return {
            title: 'Faça o follow-up',
            description: 'As propostas abertas precisam de uma próxima conversa para avançar.',
            value: openedValue,
            icon: Eye,
            iconClassName: 'text-violet-700',
            surfaceClassName: 'bg-violet-100',
        }
    }

    if (approvedValue > 0 && receivedValue <= 0) {
        return {
            title: 'Converta aprovação em caixa',
            description: 'Combine o pagamento das propostas aprovadas para fechar a venda.',
            value: approvedValue,
            icon: BadgeCheck,
            iconClassName: 'text-emerald-700',
            surfaceClassName: 'bg-emerald-100',
        }
    }

    if (lostValue > 0) {
        return {
            title: 'Revise as perdas',
            description: 'Use as propostas perdidas para ajustar preço, prazo ou abordagem.',
            value: lostValue,
            icon: XCircle,
            iconClassName: 'text-rose-700',
            surfaceClassName: 'bg-rose-100',
        }
    }

    return {
        title: 'Funil em dia',
        description: 'Não há um valor crítico pedindo ação agora.',
        value: 0,
        icon: BadgeCheck,
        iconClassName: 'text-emerald-700',
        surfaceClassName: 'bg-emerald-100',
    }
}

export function CommercialScoreboard(props: CommercialScoreboardProps) {
    const sentValue = normalizeValue(props.sentValue)
    const openedValue = normalizeValue(props.openedValue)
    const approvedValue = normalizeValue(props.approvedValue)
    const receivedValue = normalizeValue(props.receivedValue)
    const outstandingValue = normalizeValue(props.outstandingValue)
    const lostValue = normalizeValue(props.lostValue)
    const quoteCount = Math.max(0, Math.trunc(normalizeValue(props.quoteCount)))

    const bottleneck = getBottleneck({
        sentValue,
        openedValue,
        approvedValue,
        receivedValue,
        outstandingValue,
        lostValue,
        quoteCount,
    })
    const BottleneckIcon = bottleneck.icon

    return (
        <section aria-labelledby="commercial-scoreboard-title">
            <Card className="gap-0 overflow-hidden rounded-xl border-border shadow-sm">
                <CardContent className="p-0">
                    <div className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                        <div className="min-w-0">
                            <p className="text-xs font-bold uppercase tracking-wider text-primary">Painel comercial</p>
                            <h2 id="commercial-scoreboard-title" className="mt-1 text-base font-bold text-foreground">
                                O que move seu caixa agora
                            </h2>
                        </div>
                        <Badge variant="outline" className="h-7 border-border bg-muted/40 px-2.5 text-muted-foreground">
                            <FileText className="h-3.5 w-3.5" />
                            {formatQuoteCount(quoteCount)} {quoteCount === 1 ? 'proposta' : 'propostas'}
                        </Badge>
                    </div>

                    <div className="grid divide-y divide-border md:grid-cols-3 md:divide-x md:divide-y-0">
                        <div className="space-y-3 px-4 py-4 sm:px-5">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <div className="rounded-lg bg-sky-100 p-2 text-sky-700">
                                    <CircleDollarSign className="h-4 w-4" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wider">Em negociação</span>
                            </div>
                            <p className="break-words text-2xl font-bold text-foreground">{formatCurrency(sentValue)}</p>
                            <p className="text-xs leading-5 text-muted-foreground">
                                {formatCurrency(openedValue)} abertas e {formatCurrency(approvedValue)} aprovadas.
                            </p>
                        </div>

                        <div className="space-y-3 px-4 py-4 sm:px-5">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <div className="rounded-lg bg-emerald-100 p-2 text-emerald-700">
                                    <WalletCards className="h-4 w-4" />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wider">Recebido</span>
                            </div>
                            <p className="break-words text-2xl font-bold text-foreground">{formatCurrency(receivedValue)}</p>
                            <p className="text-xs leading-5 text-muted-foreground">
                                {formatCurrency(outstandingValue)} ainda está a receber.
                            </p>
                        </div>

                        <div className="space-y-3 px-4 py-4 sm:px-5">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <div className={`rounded-lg p-2 ${bottleneck.surfaceClassName}`}>
                                    <BottleneckIcon className={`h-4 w-4 ${bottleneck.iconClassName}`} />
                                </div>
                                <span className="text-xs font-bold uppercase tracking-wider">Próximo gargalo</span>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-foreground">{bottleneck.title}</p>
                                {bottleneck.value > 0 && (
                                    <p className="mt-1 break-words text-lg font-bold text-foreground">
                                        {formatCurrency(bottleneck.value)}
                                    </p>
                                )}
                            </div>
                            <p className="text-xs leading-5 text-muted-foreground">{bottleneck.description}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 divide-x divide-y divide-border border-t border-border bg-muted/20 sm:grid-cols-4 sm:divide-y-0">
                        <div className="flex items-center gap-2 px-4 py-3 sm:px-5">
                            <Send className="h-3.5 w-3.5 shrink-0 text-sky-700" />
                            <div className="min-w-0">
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Enviado</p>
                                <p className="truncate text-xs font-bold text-foreground">{formatCurrency(sentValue)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-3 sm:px-5">
                            <Eye className="h-3.5 w-3.5 shrink-0 text-violet-700" />
                            <div className="min-w-0">
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Aberto</p>
                                <p className="truncate text-xs font-bold text-foreground">{formatCurrency(openedValue)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-3 sm:px-5">
                            <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-emerald-700" />
                            <div className="min-w-0">
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Aprovado</p>
                                <p className="truncate text-xs font-bold text-foreground">{formatCurrency(approvedValue)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-3 sm:px-5">
                            <XCircle className="h-3.5 w-3.5 shrink-0 text-rose-700" />
                            <div className="min-w-0">
                                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Perdido</p>
                                <p className="truncate text-xs font-bold text-foreground">{formatCurrency(lostValue)}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </section>
    )
}
