import { CheckCircle2, Circle, PackageCheck, PlayCircle, ShieldCheck, Trophy, WalletCards } from 'lucide-react'
import { cn } from '@/lib/utils'

type QuoteNextStepsProps = {
    status: string
    paymentStatus?: string | null
    amountPaid?: number | null
    total: number
    pendingStockItems: number
    deductedStockItems: number
}

const statusRank: Record<string, number> = {
    draft: 0,
    pending: 0,
    sent: 1,
    changes_requested: 1,
    rejected: 1,
    approved: 2,
    in_progress: 3,
    completed: 4,
}

function StepIcon({ done }: { done: boolean }) {
    return done
        ? <CheckCircle2 className="h-4 w-4 text-emerald-700" />
        : <Circle className="h-4 w-4 text-slate-300" />
}

export function QuoteNextSteps({
    status,
    paymentStatus,
    amountPaid,
    total,
    pendingStockItems,
    deductedStockItems,
}: QuoteNextStepsProps) {
    const rank = statusRank[status] ?? 0
    const paidAmount = Number(amountPaid || 0)
    const isPaid = paymentStatus === 'paid' || (total > 0 && paidAmount >= total)
    const hasStock = pendingStockItems > 0 || deductedStockItems > 0

    const steps = [
        {
            label: 'Enviar ao cliente',
            description: 'Compartilhe o link ou QR Code da proposta.',
            icon: ShieldCheck,
            done: rank >= 1,
        },
        {
            label: 'Cliente aprovar',
            description: 'A aprovacao oficial acontece apenas pelo link publico.',
            icon: CheckCircle2,
            done: rank >= 2,
        },
        {
            label: 'Separar material e iniciar',
            description: hasStock ? 'Baixe os materiais vinculados quando for executar.' : 'Combine agenda, prazo e acesso ao local.',
            icon: PackageCheck,
            done: rank >= 3 || deductedStockItems > 0,
        },
        {
            label: 'Concluir execucao',
            description: 'Marque como concluido quando o servico estiver entregue.',
            icon: Trophy,
            done: rank >= 4,
        },
        {
            label: 'Registrar recebimento',
            description: 'Controle se recebeu tudo, parte ou se ainda esta em aberto.',
            icon: WalletCards,
            done: isPaid,
        },
    ]

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm print:hidden">
            <div className="flex items-start gap-3">
                <div className="rounded-xl bg-slate-950 p-2 text-white">
                    <PlayCircle className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-slate-950">Proximos passos</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                        Um roteiro simples para transformar proposta aprovada em servico entregue e recebido.
                    </p>
                </div>
            </div>

            <div className="mt-5 space-y-3">
                {steps.map((step) => {
                    const Icon = step.icon

                    return (
                        <div
                            key={step.label}
                            className={cn(
                                'flex gap-3 rounded-xl border px-3 py-3',
                                step.done ? 'border-emerald-100 bg-emerald-50/70' : 'border-slate-200 bg-slate-50',
                            )}
                        >
                            <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
                                <StepIcon done={step.done} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <Icon className={cn('h-4 w-4', step.done ? 'text-emerald-700' : 'text-slate-400')} />
                                    <p className="text-sm font-bold text-slate-950">{step.label}</p>
                                </div>
                                <p className="mt-1 text-xs leading-5 text-slate-500">{step.description}</p>
                            </div>
                        </div>
                    )
                })}
            </div>

        </section>
    )
}
