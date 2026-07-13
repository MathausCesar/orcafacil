import Link from 'next/link'
import { ArrowUpRight, BellRing, CalendarClock } from 'lucide-react'
import { Button } from '@/components/ui/button'

export type ClientReturnQueueItem = {
    id: string
    quoteId: string
    clientName: string
    dueDate: string
    note?: string | null
}

type ClientReturnQueueProps = {
    returns: ClientReturnQueueItem[]
}

function formatDate(value: string) {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
    const date = match
        ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
        : new Date(value)

    if (Number.isNaN(date.getTime())) return 'hoje'
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(date)
}

export function ClientReturnQueue({ returns }: ClientReturnQueueProps) {
    if (returns.length === 0) return null

    return (
        <section className="overflow-hidden rounded-2xl border border-sky-200 bg-sky-50/70 shadow-sm">
            <div className="flex flex-col gap-3 border-b border-sky-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                    <div className="rounded-xl bg-sky-600 p-2 text-white"><CalendarClock className="h-5 w-5" /></div>
                    <div>
                        <h2 className="text-base font-black text-sky-950">Retornos para fazer</h2>
                        <p className="mt-1 text-xs leading-5 text-sky-900">Clientes que ja receberam um servico e merecem uma nova conversa.</p>
                    </div>
                </div>
                <span className="inline-flex w-fit items-center rounded-xl border border-sky-200 bg-white px-3 py-2 text-sm font-black text-sky-950">
                    {returns.length} {returns.length === 1 ? 'retorno' : 'retornos'}
                </span>
            </div>
            <div className="divide-y divide-sky-100">
                {returns.slice(0, 4).map((item) => (
                    <Link key={item.id} href={`/quotes/${item.quoteId}`} className="flex items-center gap-3 px-5 py-4 transition hover:bg-white/70">
                        <div className="rounded-lg bg-white p-2 text-sky-700"><BellRing className="h-4 w-4" /></div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-slate-950">{item.clientName}</p>
                            <p className="mt-1 truncate text-xs leading-4 text-slate-600">{item.note || 'Pergunte como ficou o servico e abra uma nova oportunidade.'}</p>
                        </div>
                        <div className="shrink-0 text-right">
                            <p className="text-xs font-black text-sky-900">{formatDate(item.dueDate)}</p>
                            <span className="mt-1 inline-flex items-center text-xs font-bold text-sky-800">Abrir <ArrowUpRight className="ml-1 h-3.5 w-3.5" /></span>
                        </div>
                    </Link>
                ))}
            </div>
            <div className="border-t border-sky-200 bg-white/70 px-5 py-3">
                <Button asChild variant="ghost" size="sm" className="h-8 px-0 text-sky-800 hover:bg-transparent hover:text-sky-950">
                    <Link href="/clients">Ver clientes e historico <ArrowUpRight className="ml-1 h-4 w-4" /></Link>
                </Button>
            </div>
        </section>
    )
}
