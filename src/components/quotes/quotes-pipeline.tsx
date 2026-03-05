'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { LayoutList, KanbanSquare, MoreVertical, FileText } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { QuoteStatusBadge } from '@/components/quotes/quote-status-badge'

interface Quote {
    id: string
    client_name: string
    total: number
    status: string
    created_at: string
}

interface QuotesViewProps {
    quotes: Quote[]
    totalCount: number
}

const PIPELINE_COLUMNS = [
    { id: 'created', label: 'Criado', bg: 'bg-zinc-50', border: 'border-zinc-200', dot: 'bg-zinc-400' },
    { id: 'sent', label: 'Enviado', bg: 'bg-blue-50', border: 'border-blue-200', dot: 'bg-blue-500' },
    { id: 'approved', label: 'Aprovado', bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500' },
    { id: 'rejected', label: 'Recusado', bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-500' },
    { id: 'in_progress', label: 'Em Execução', bg: 'bg-violet-50', border: 'border-violet-200', dot: 'bg-violet-500' },
    { id: 'completed', label: 'Concluído', bg: 'bg-teal-50', border: 'border-teal-200', dot: 'bg-teal-500' },
]

function getColumnId(status: string): string {
    if (status === 'draft' || status === 'pending') return 'created'
    return status
}

export function QuotesView({ quotes, totalCount }: QuotesViewProps) {
    const [view, setView] = useState<'list' | 'pipeline'>('list')

    const fmt = (val: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

    const fmtDate = (dt: string) => {
        try {
            return format(new Date(dt), 'dd MMM, yyyy', { locale: ptBR })
        } catch {
            return dt
        }
    }

    return (
        <div className="space-y-6">
            {/* Header with toggle */}
            <div className="flex justify-between items-center flex-wrap gap-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-foreground">Meus Orçamentos</h1>
                    {totalCount > 0 && (
                        <span className="text-sm text-muted-foreground bg-primary/10 px-2 py-0.5 rounded-full font-medium">
                            {totalCount} {totalCount === 1 ? 'orçamento' : 'orçamentos'}
                        </span>
                    )}
                </div>

                <div className="flex items-center bg-zinc-100/70 p-1 rounded-xl border border-zinc-200 shadow-sm gap-1">
                    <button
                        onClick={() => setView('list')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${view === 'list'
                            ? 'bg-white text-primary shadow-sm ring-1 ring-zinc-200/80'
                            : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200/50'
                            }`}
                    >
                        <LayoutList className="h-4 w-4" />
                        Lista
                    </button>
                    <button
                        onClick={() => setView('pipeline')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${view === 'pipeline'
                            ? 'bg-white text-primary shadow-sm ring-1 ring-zinc-200/80'
                            : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200/50'
                            }`}
                    >
                        <KanbanSquare className="h-4 w-4" />
                        Pipeline
                    </button>
                </div>
            </div>

            {/* Content: List View */}
            {view === 'list' && (
                <div className="space-y-3">
                    {quotes.length === 0 ? (
                        <div className="text-center py-10 text-muted-foreground bg-primary/5 rounded-xl border border-dashed border-primary/20">
                            <FileText className="h-12 w-12 mx-auto mb-3 text-primary/25" />
                            <p>Nenhum orçamento encontrado.</p>
                        </div>
                    ) : (
                        quotes.map((quote) => (
                            <Link key={quote.id} href={`/quotes/${quote.id}`}>
                                <Card className="hover:border-primary/25 hover:shadow-md transition-all border-l-4 border-l-primary cursor-pointer group border-primary/10">
                                    <CardContent className="p-4 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-primary/10 rounded-lg">
                                                <FileText className="h-4 w-4 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                                    {quote.client_name}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    {fmtDate(quote.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between md:justify-end gap-4">
                                            <QuoteStatusBadge status={quote.status} />
                                            <p className="font-bold text-primary text-right">
                                                {fmt(quote.total)}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))
                    )}
                </div>
            )}

            {/* Content: Pipeline / Kanban View */}
            {view === 'pipeline' && (
                <div className="overflow-x-auto pb-4">
                    <div className="flex gap-4 min-w-max">
                        {PIPELINE_COLUMNS.map(col => {
                            const colQuotes = quotes.filter(q => getColumnId(q.status) === col.id)
                            return (
                                <div
                                    key={col.id}
                                    className={`w-72 flex-shrink-0 rounded-xl border ${col.border} ${col.bg} flex flex-col overflow-hidden`}
                                >
                                    {/* Column Header */}
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-inherit">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${col.dot}`}></span>
                                            <h3 className="text-sm font-semibold text-foreground">{col.label}</h3>
                                        </div>
                                        <span className="text-xs bg-white/70 border border-inherit px-2 py-0.5 rounded-full text-muted-foreground font-medium">
                                            {colQuotes.length}
                                        </span>
                                    </div>

                                    {/* Cards */}
                                    <div className="flex flex-col gap-2 p-3 overflow-y-auto max-h-[65vh] scrollbar-thin">
                                        {colQuotes.map(quote => (
                                            <Link key={quote.id} href={`/quotes/${quote.id}`}>
                                                <div className="bg-white rounded-lg border border-zinc-200/80 p-3 hover:shadow-md hover:border-primary/30 cursor-pointer transition-all group">
                                                    <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors leading-tight">
                                                        {quote.client_name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {fmtDate(quote.created_at)}
                                                    </p>
                                                    <p className="font-bold text-primary text-sm mt-2">
                                                        {fmt(quote.total)}
                                                    </p>
                                                </div>
                                            </Link>
                                        ))}

                                        {colQuotes.length === 0 && (
                                            <div className="text-center py-6 border-2 border-dashed border-current/20 rounded-lg opacity-40">
                                                <p className="text-xs font-medium text-foreground">Vazio</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
