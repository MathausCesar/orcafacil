'use client'

import Link from 'next/link'
import { ArrowRight, FilePenLine, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { captureEvent } from '@/lib/analytics'

type DraftProposalRecoveryProps = {
    count: number
    latestDraft: {
        id: string
        clientName: string
        total: number
    } | null
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value)
}

export function DraftProposalRecovery({ count, latestDraft }: DraftProposalRecoveryProps) {
    if (count <= 0 || !latestDraft) return null

    const countLabel = count === 1
        ? '1 proposta parada em rascunho'
        : `${count} propostas paradas em rascunho`

    return (
        <section
            aria-labelledby="draft-proposal-recovery-title"
            className="overflow-hidden rounded-lg border border-emerald-200 bg-emerald-50/70 shadow-sm dark:border-emerald-900/70 dark:bg-emerald-950/30"
        >
            <div className="flex flex-col gap-5 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                    <div className="shrink-0 rounded-lg bg-emerald-600 p-2.5 text-white">
                        <Send className="h-5 w-5" aria-hidden="true" />
                    </div>

                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <p className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                                Proposta pronta para enviar
                            </p>
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-white px-2 py-1 text-xs font-semibold text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200">
                                <FilePenLine className="h-3.5 w-3.5" aria-hidden="true" />
                                {countLabel}
                            </span>
                        </div>

                        <h2 id="draft-proposal-recovery-title" className="mt-2 truncate text-lg font-bold text-slate-950 dark:text-white">
                            {latestDraft.clientName}
                        </h2>
                        <p className="mt-1 text-sm leading-5 text-slate-600 dark:text-slate-300">
                            {formatCurrency(latestDraft.total)} - Revise os detalhes e escolha como enviar.
                        </p>
                    </div>
                </div>

                <Button asChild className="h-11 w-full shrink-0 sm:w-auto">
                    <Link
                        href={`/quotes/${latestDraft.id}`}
                        onClick={() => captureEvent('draft_quote_recovery_clicked', {
                            draft_count: count,
                            quote_value: latestDraft.total,
                            source: 'dashboard',
                        })}
                    >
                        Abrir proposta
                        <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                    </Link>
                </Button>
            </div>
        </section>
    )
}
