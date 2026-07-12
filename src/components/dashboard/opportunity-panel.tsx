import Link from 'next/link'
import { ArrowUpRight, BellRing, CircleDollarSign, Clock3, Eye, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { QuoteReminder } from '@/lib/quote-reminders'

type Opportunity = {
    id: string
    clientName: string
    total: number
    reminder: QuoteReminder
    wasOpened: boolean
}

type OpportunityPanelProps = {
    opportunities: Opportunity[]
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function reminderIcon(reminder: QuoteReminder) {
    if (reminder.kind === 'opened_no_response') return Eye
    if (reminder.kind === 'follow_up') return Send
    if (reminder.kind === 'expired' || reminder.kind === 'expires_today') return Clock3
    return BellRing
}

export function OpportunityPanel({ opportunities }: OpportunityPanelProps) {
    if (opportunities.length === 0) return null

    const openValue = opportunities.reduce((sum, opportunity) => sum + opportunity.total, 0)

    return (
        <section className="overflow-hidden rounded-2xl border border-amber-200 bg-amber-50/60 shadow-sm">
            <div className="flex flex-col gap-4 border-b border-amber-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-amber-500 p-2 text-white"><BellRing className="h-5 w-5" /></div>
                    <div>
                        <h2 className="text-base font-black text-amber-950">Para agir hoje</h2>
                        <p className="mt-1 text-xs leading-5 text-amber-900">Priorize as propostas que ainda podem virar servico.</p>
                    </div>
                </div>
                <div className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-white px-3 py-2 text-sm font-black text-amber-950">
                    <CircleDollarSign className="h-4 w-4 text-amber-600" />
                    {formatCurrency(openValue)} em negociacao
                </div>
            </div>
            <div className="divide-y divide-amber-100">
                {opportunities.slice(0, 5).map((opportunity) => {
                    const Icon = reminderIcon(opportunity.reminder)
                    return (
                        <Link key={opportunity.id} href={`/quotes/${opportunity.id}`} className="flex items-center gap-3 px-5 py-4 transition hover:bg-white/70">
                            <div className="rounded-lg bg-white p-2 text-amber-700"><Icon className="h-4 w-4" /></div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-bold text-slate-950">{opportunity.clientName}</p>
                                <p className="mt-1 text-xs leading-4 text-slate-600">{opportunity.reminder.label}: {opportunity.reminder.description}</p>
                            </div>
                            <div className="shrink-0 text-right">
                                <p className="text-sm font-black text-slate-950">{formatCurrency(opportunity.total)}</p>
                                <span className="mt-1 inline-flex items-center text-xs font-bold text-amber-800">Abrir <ArrowUpRight className="ml-1 h-3.5 w-3.5" /></span>
                            </div>
                        </Link>
                    )
                })}
            </div>
            <div className="border-t border-amber-200 bg-white/70 px-5 py-3">
                <Button asChild variant="ghost" size="sm" className="h-8 px-0 text-amber-800 hover:bg-transparent hover:text-amber-950">
                    <Link href="/quotes?view=pipeline">Ver pipeline completo <ArrowUpRight className="ml-1 h-4 w-4" /></Link>
                </Button>
            </div>
        </section>
    )
}
