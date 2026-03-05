'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { LayoutList, KanbanSquare, MoreVertical, FileText, ChevronDown, ChevronRight } from 'lucide-react'
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
    {
        id: 'created', label: 'CRIADO',
        accent: 'bg-zinc-500', accentHex: '#71717a',
        color: 'text-zinc-600 dark:text-zinc-400',
        bg: 'bg-zinc-500/5 dark:bg-zinc-500/10', border: 'border-zinc-500/20',
        dotRing: 'ring-zinc-500/30'
    },
    {
        id: 'sent', label: 'ENVIADO',
        accent: 'bg-blue-500', accentHex: '#3b82f6',
        color: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-500/5 dark:bg-blue-500/10', border: 'border-blue-500/20',
        dotRing: 'ring-blue-500/30'
    },
    {
        id: 'approved', label: 'APROVADO',
        accent: 'bg-emerald-500', accentHex: '#10b981',
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-500/5 dark:bg-emerald-500/10', border: 'border-emerald-500/20',
        dotRing: 'ring-emerald-500/30'
    },
    {
        id: 'rejected', label: 'RECUSADO',
        accent: 'bg-red-500', accentHex: '#ef4444',
        color: 'text-red-600 dark:text-red-400',
        bg: 'bg-red-500/5 dark:bg-red-500/10', border: 'border-red-500/20',
        dotRing: 'ring-red-500/30'
    },
    {
        id: 'in_progress', label: 'EM EXECUÇÃO',
        accent: 'bg-violet-500', accentHex: '#8b5cf6',
        color: 'text-violet-600 dark:text-violet-400',
        bg: 'bg-violet-500/5 dark:bg-violet-500/10', border: 'border-violet-500/20',
        dotRing: 'ring-violet-500/30'
    },
    {
        id: 'completed', label: 'CONCLUÍDO',
        accent: 'bg-teal-500', accentHex: '#14b8a6',
        color: 'text-teal-600 dark:text-teal-400',
        bg: 'bg-teal-500/5 dark:bg-teal-500/10', border: 'border-teal-500/20',
        dotRing: 'ring-teal-500/30'
    },
]

function getColumnId(status: string): string {
    if (status === 'draft' || status === 'pending') return 'created'
    return status
}

export function QuotesView({ quotes, totalCount }: QuotesViewProps) {
    const [view, setView] = useState<'list' | 'pipeline'>('list')
    const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())

    const fmt = (val: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

    const fmtDate = (dt: string) => {
        try {
            return format(new Date(dt), "d 'de' MMM", { locale: ptBR })
        } catch {
            return dt
        }
    }

    const toggleSection = (id: string) => {
        setCollapsedSections(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    // Progress bar data
    const totalQuotes = quotes.length
    const distribution = PIPELINE_COLUMNS.map(col => ({
        ...col,
        count: quotes.filter(q => getColumnId(q.status) === col.id).length
    }))

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header & View Toggle Container */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Orçamentos</h1>
                    {totalCount > 0 && (
                        <div className="flex items-center justify-center min-w-6 h-6 px-2 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                            {totalCount}
                        </div>
                    )}
                </div>

                {/* Premium Segmented Control Toggle */}
                <div className="flex items-center bg-muted/50 p-1 rounded-full border border-border/50 shadow-inner w-full sm:w-auto">
                    <button
                        onClick={() => setView('list')}
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${view === 'list'
                            ? 'bg-background text-foreground shadow-sm ring-1 ring-border shadow-black/5 dark:shadow-white/5'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                            }`}
                    >
                        <LayoutList className="h-4 w-4" />
                        Lista
                    </button>
                    <button
                        onClick={() => setView('pipeline')}
                        className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${view === 'pipeline'
                            ? 'bg-background text-foreground shadow-sm ring-1 ring-border shadow-black/5 dark:shadow-white/5'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                            }`}
                    >
                        <KanbanSquare className="h-4 w-4" />
                        Pipeline
                    </button>
                </div>
            </div>

            {/* List View */}
            {view === 'list' && (
                <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                    {quotes.length === 0 ? (
                        <div className="text-center py-16 px-4 bg-muted/20 rounded-2xl border border-dashed border-border flex flex-col items-center">
                            <div className="h-16 w-16 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                                <FileText className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground">Ainda não há orçamentos</h3>
                            <p className="text-sm text-muted-foreground max-w-sm mt-1">Crie o seu primeiro orçamento para iniciar o gerenciamento de propostas.</p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {quotes.map((quote) => (
                                <Link key={quote.id} href={`/quotes/${quote.id}`}>
                                    <Card className="hover:border-primary/40 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 border border-border/60 bg-card group overflow-hidden relative">
                                        <CardContent className="p-0 flex flex-col sm:flex-row sm:items-center justify-between">
                                            {/* Accent left border indicator */}
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20 group-hover:bg-primary transition-colors duration-300" />

                                            <div className="p-5 flex items-center gap-4 flex-1">
                                                <div className="hidden sm:flex h-10 w-10 shrink-0 rounded-full bg-primary/10 items-center justify-center">
                                                    <FileText className="h-5 w-5 text-primary" />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <p className="font-bold text-foreground group-hover:text-primary transition-colors text-base sm:text-lg">
                                                        {quote.client_name}
                                                    </p>
                                                    <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                                                        {fmtDate(quote.created_at)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="p-5 sm:py-5 sm:pl-0 sm:pr-6 flex items-center justify-between sm:justify-end gap-6 bg-muted/10 sm:bg-transparent border-t border-border/50 sm:border-0">
                                                <QuoteStatusBadge status={quote.status} />
                                                <p className="font-black text-foreground text-lg tracking-tight">
                                                    {fmt(quote.total)}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Pipeline View */}
            {view === 'pipeline' && (
                <>
                    {/* ====================== */}
                    {/* MOBILE: Timeline Vertical */}
                    {/* ====================== */}
                    <div className="md:hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Mini Progress Bar */}
                        {totalQuotes > 0 && (
                            <div className="mb-6">
                                <div className="flex h-2 rounded-full overflow-hidden bg-muted/50 border border-border/30">
                                    {distribution.map(d => d.count > 0 && (
                                        <div
                                            key={d.id}
                                            className={`${d.accent} transition-all duration-500`}
                                            style={{ width: `${(d.count / totalQuotes) * 100}%` }}
                                            title={`${d.label}: ${d.count}`}
                                        />
                                    ))}
                                </div>
                                <div className="flex justify-between mt-1.5">
                                    {distribution.filter(d => d.count > 0).map(d => (
                                        <span key={d.id} className={`text-[10px] font-semibold ${d.color}`}>
                                            {d.count}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Timeline */}
                        <div className="relative pl-10">
                            {/* Vertical Line */}
                            <div className="absolute left-[15px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-zinc-300 via-border to-zinc-200 dark:from-zinc-600 dark:via-border dark:to-zinc-700 rounded-full" />

                            {PIPELINE_COLUMNS.map((col, colIdx) => {
                                const colQuotes = quotes.filter(q => getColumnId(q.status) === col.id)
                                const isCollapsed = collapsedSections.has(col.id)
                                const isLast = colIdx === PIPELINE_COLUMNS.length - 1

                                return (
                                    <div
                                        key={col.id}
                                        className={`relative ${!isLast ? 'pb-6' : 'pb-2'} animate-in fade-in`}
                                        style={{ animationDelay: `${colIdx * 80}ms`, animationFillMode: 'both' }}
                                    >
                                        {/* Dot on the line */}
                                        <div className="absolute -left-10 top-0 flex items-center justify-center">
                                            <div className={`relative w-8 h-8 rounded-full ${col.accent} flex items-center justify-center shadow-lg ring-4 ${col.dotRing} ring-offset-2 ring-offset-background transition-all duration-300`}>
                                                {colQuotes.length > 0 && (
                                                    <span className="text-white text-xs font-black">
                                                        {colQuotes.length}
                                                    </span>
                                                )}
                                                {/* Pulse animation for sections with items */}
                                                {colQuotes.length > 0 && (
                                                    <div className={`absolute inset-0 rounded-full ${col.accent} animate-ping opacity-20`} />
                                                )}
                                            </div>
                                        </div>

                                        {/* Section Header (tappable) */}
                                        <button
                                            onClick={() => toggleSection(col.id)}
                                            className="flex items-center gap-2 mb-3 w-full text-left group/header"
                                        >
                                            <h3 className={`text-xs font-black tracking-widest uppercase ${col.color} group-hover/header:opacity-80 transition-opacity`}>
                                                {col.label}
                                            </h3>
                                            <div className="flex-1 h-px bg-border/50" />
                                            {colQuotes.length > 0 && (
                                                <div className={`${col.color} transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`}>
                                                    <ChevronDown className="h-3.5 w-3.5" />
                                                </div>
                                            )}
                                        </button>

                                        {/* Cards */}
                                        {!isCollapsed && colQuotes.length > 0 && (
                                            <div className="space-y-2.5 animate-in slide-in-from-top-2 duration-300">
                                                {colQuotes.map((quote, idx) => (
                                                    <Link key={quote.id} href={`/quotes/${quote.id}`}>
                                                        <div
                                                            className="group relative bg-card rounded-xl border border-border/60 p-4 shadow-sm hover:shadow-md hover:border-foreground/20 active:scale-[0.98] transition-all duration-200 cursor-pointer animate-in fade-in slide-in-from-left-3"
                                                            style={{ animationDelay: `${idx * 60}ms`, animationFillMode: 'both' }}
                                                        >
                                                            {/* Left accent */}
                                                            <div className={`absolute left-0 top-2 bottom-2 w-[3px] rounded-full ${col.accent} opacity-40 group-hover:opacity-100 transition-opacity`} />

                                                            <div className="flex items-center justify-between gap-3">
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                                                                        {quote.client_name}
                                                                    </p>
                                                                    <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
                                                                        {fmtDate(quote.created_at)}
                                                                    </p>
                                                                </div>
                                                                <p className="font-black text-foreground text-sm tracking-tight shrink-0">
                                                                    {fmt(quote.total)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                        )}

                                        {/* Empty state for this phase */}
                                        {!isCollapsed && colQuotes.length === 0 && (
                                            <p className="text-[11px] text-muted-foreground/50 italic pl-1">
                                                Nenhum orçamento nesta fase
                                            </p>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* ====================== */}
                    {/* DESKTOP: Kanban Melhorado */}
                    {/* ====================== */}
                    <div className="hidden md:block animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Mini Progress Bar */}
                        {totalQuotes > 0 && (
                            <div className="mb-6 px-1">
                                <div className="flex h-2.5 rounded-full overflow-hidden bg-muted/30 border border-border/30 shadow-inner">
                                    {distribution.map(d => d.count > 0 && (
                                        <div
                                            key={d.id}
                                            className={`${d.accent} transition-all duration-700 ease-out relative group/bar`}
                                            style={{ width: `${(d.count / totalQuotes) * 100}%` }}
                                        >
                                            {/* Tooltip on hover */}
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background text-[10px] font-bold px-2 py-0.5 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                                {d.label}: {d.count}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-3 mt-2 flex-wrap">
                                    {distribution.filter(d => d.count > 0).map(d => (
                                        <div key={d.id} className="flex items-center gap-1.5">
                                            <span className={`w-2 h-2 rounded-full ${d.accent}`} />
                                            <span className={`text-[10px] font-semibold ${d.color}`}>
                                                {d.label} ({d.count})
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Kanban Columns */}
                        <div className="relative">
                            <div className="flex gap-4 overflow-x-auto pb-8 snap-x snap-mandatory pt-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent">
                                {PIPELINE_COLUMNS.map(col => {
                                    const colQuotes = quotes.filter(q => getColumnId(q.status) === col.id)
                                    return (
                                        <div
                                            key={col.id}
                                            className={`w-[320px] flex-shrink-0 flex flex-col snap-center rounded-2xl border ${col.border} ${col.bg} relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.01]`}
                                        >
                                            {/* Top Accent Line */}
                                            <div className={`absolute top-0 left-0 right-0 h-1.5 ${col.accent} opacity-80`} />

                                            {/* Column Header */}
                                            <div className="flex items-center justify-between px-5 pt-5 pb-3">
                                                <div className="flex items-center gap-2.5">
                                                    <span className={`w-2.5 h-2.5 rounded-full ${col.accent} shadow-sm`} />
                                                    <h3 className={`text-xs font-black tracking-widest uppercase ${col.color}`}>
                                                        {col.label}
                                                    </h3>
                                                </div>
                                                <span className="text-xs bg-background/80 backdrop-blur-md border border-border/50 px-2.5 py-1 rounded-full text-foreground font-bold shadow-sm">
                                                    {colQuotes.length}
                                                </span>
                                            </div>

                                            {/* Cards Container */}
                                            <div className="flex px-3 pb-4 flex-col gap-3 overflow-y-auto max-h-[65vh] scrollbar-none">
                                                {colQuotes.map((quote, idx) => (
                                                    <Link key={quote.id} href={`/quotes/${quote.id}`}>
                                                        <div
                                                            className="group relative bg-background rounded-xl border border-border/60 p-4 shadow-sm hover:shadow-md hover:border-foreground/20 hover:-translate-y-1 transition-all duration-300 cursor-pointer animate-in fade-in slide-in-from-bottom-2"
                                                            style={{ animationDelay: `${idx * 50}ms`, animationFillMode: 'both' }}
                                                        >
                                                            {/* Card Left Indicator */}
                                                            <div className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl ${col.accent} opacity-30 group-hover:opacity-100 transition-opacity duration-300`} />

                                                            <div className="flex flex-col gap-3">
                                                                <div>
                                                                    <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors leading-tight line-clamp-2">
                                                                        {quote.client_name}
                                                                    </p>
                                                                    <p className="text-xs text-muted-foreground mt-1.5 font-medium flex items-center gap-1.5">
                                                                        {fmtDate(quote.created_at)}
                                                                    </p>
                                                                </div>
                                                                <div className="flex items-end justify-between border-t border-border/40 pt-3 mt-1">
                                                                    <div className={`text-[10px] uppercase font-bold tracking-wider ${col.color} bg-background px-2 py-0.5 rounded-md border border-inherit`}>
                                                                        id: {quote.id.split('-')[0]}
                                                                    </div>
                                                                    <p className="font-black text-foreground text-sm tracking-tight">
                                                                        {fmt(quote.total)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ))}

                                                {/* Empty State */}
                                                {colQuotes.length === 0 && (
                                                    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-current/10 rounded-xl opacity-60 m-1">
                                                        <p className="text-xs font-bold uppercase tracking-widest text-foreground/50">Vazio</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
