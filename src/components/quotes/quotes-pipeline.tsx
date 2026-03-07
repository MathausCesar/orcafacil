'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { LayoutList, KanbanSquare, FileText, ChevronDown, GripVertical } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { QuoteStatusBadge } from '@/components/quotes/quote-status-badge'
import { updateQuoteStatus } from '@/app/actions/quotes'
import { toast } from 'sonner'

import {
    DndContext,
    DragOverlay,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    closestCenter,
    DragStartEvent,
    DragEndEvent,
    useDroppable,
    DragOverEvent,
} from '@dnd-kit/core'
import { useDraggable } from '@dnd-kit/core'

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

const STATUS_MAP: Record<string, string> = {
    'created': 'draft',
    'sent': 'sent',
    'approved': 'approved',
    'rejected': 'rejected',
    'in_progress': 'in_progress',
    'completed': 'completed',
}

function getColumnId(status: string): string {
    if (status === 'draft' || status === 'pending') return 'created'
    return status
}

// ===========================
// Draggable Card Component
// ===========================
function DraggableQuoteCard({
    quote, colAccent, colColor, fmt, fmtDate, variant = 'kanban'
}: {
    quote: Quote
    colAccent: string
    colColor: string
    fmt: (val: number) => string
    fmtDate: (dt: string) => string
    variant?: 'kanban' | 'timeline'
}) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: quote.id,
        data: { quote },
    })

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 50,
    } : undefined

    if (variant === 'timeline') {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className={`group relative bg-card rounded-xl border border-border/60 shadow-sm transition-all duration-200 ${isDragging ? 'opacity-30 scale-95' : 'hover:shadow-md hover:border-foreground/20'
                    }`}
            >
                <div className={`absolute left-0 top-2 bottom-2 w-[3px] rounded-full ${colAccent} opacity-40 group-hover:opacity-100 transition-opacity`} />
                <div className="flex items-center gap-1">
                    {/* Drag Handle */}
                    <button
                        className="p-3 pr-0 cursor-grab active:cursor-grabbing touch-none shrink-0 self-stretch flex items-center"
                        {...attributes}
                        {...listeners}
                    >
                        <GripVertical className="h-4 w-4 text-muted-foreground/40 hover:text-muted-foreground transition-colors" />
                    </button>
                    {/* Clickable area */}
                    <Link href={`/quotes/${quote.id}`} className="flex-1 min-w-0 flex items-center justify-between gap-3 p-3 pl-1">
                        <div className="min-w-0">
                            <p className="font-semibold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                                {quote.client_name}
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-0.5 font-medium">
                                {fmtDate(quote.created_at)}
                            </p>
                        </div>
                        <p className="font-black text-foreground text-sm tracking-tight shrink-0">
                            {fmt(quote.total)}
                        </p>
                    </Link>
                </div>
            </div>
        )
    }

    // Kanban variant
    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group relative bg-background rounded-xl border border-border/60 shadow-sm transition-all duration-300 ${isDragging ? 'opacity-30 scale-95' : 'hover:shadow-md hover:border-foreground/20 hover:-translate-y-0.5'
                }`}
        >
            <div className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl ${colAccent} opacity-30 group-hover:opacity-100 transition-opacity duration-300`} />
            <div className="flex items-stretch">
                {/* Drag Handle */}
                <button
                    className="px-2 xl:px-2.5 cursor-grab active:cursor-grabbing touch-none shrink-0 flex items-center border-r border-border/30 hover:bg-muted/50 transition-colors rounded-l-xl"
                    {...attributes}
                    {...listeners}
                >
                    <GripVertical className="h-3.5 w-3.5 text-muted-foreground/30 hover:text-muted-foreground transition-colors" />
                </button>
                {/* Clickable area */}
                <Link href={`/quotes/${quote.id}`} className="flex-1 min-w-0 p-3 xl:p-4">
                    <div className="flex flex-col gap-3">
                        <div>
                            <p className="font-semibold text-sm text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                                {quote.client_name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1.5 font-medium">
                                {fmtDate(quote.created_at)}
                            </p>
                        </div>
                        <div className="flex items-end justify-between border-t border-border/40 pt-2 mt-1">
                            <div className={`text-[9px] xl:text-[10px] uppercase font-bold tracking-wider ${colColor} bg-background px-1.5 py-0.5 rounded-md border border-inherit truncate`}>
                                {quote.id.split('-')[0]}
                            </div>
                            <p className="font-black text-foreground text-xs xl:text-sm tracking-tight shrink-0">
                                {fmt(quote.total)}
                            </p>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    )
}

// ===========================
// Drag Overlay Card (ghost)
// ===========================
function DragOverlayCard({ quote, fmt, fmtDate }: { quote: Quote; fmt: (val: number) => string; fmtDate: (dt: string) => string }) {
    return (
        <div className="bg-background rounded-xl border-2 border-primary shadow-2xl p-4 w-[280px] rotate-2 scale-105 opacity-95">
            <div className="flex flex-col gap-2">
                <p className="font-bold text-sm text-foreground">{quote.client_name}</p>
                <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">{fmtDate(quote.created_at)}</p>
                    <p className="font-black text-foreground text-sm">{fmt(quote.total)}</p>
                </div>
            </div>
        </div>
    )
}

// ===========================
// Droppable Zone
// ===========================
function DroppableColumn({ id, children, isOver, className }: { id: string; children: React.ReactNode; isOver?: boolean; className?: string }) {
    const { setNodeRef, isOver: dropping } = useDroppable({ id })
    const active = isOver ?? dropping

    return (
        <div ref={setNodeRef} className={`${className} ${active ? 'ring-2 ring-primary/50 bg-primary/5' : ''} transition-all duration-200`}>
            {children}
        </div>
    )
}

// ===========================
// Main Component
// ===========================
export function QuotesView({ quotes: initialQuotes, totalCount }: QuotesViewProps) {
    const router = useRouter()
    const [view, setView] = useState<'list' | 'pipeline'>('list')
    const [quotes, setQuotes] = useState(initialQuotes)
    const [activeQuote, setActiveQuote] = useState<Quote | null>(null)
    const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())
    const [overId, setOverId] = useState<string | null>(null)

    // Sensors: pointer for desktop, touch for mobile
    const pointerSensor = useSensor(PointerSensor, {
        activationConstraint: { distance: 8 },
    })
    const touchSensor = useSensor(TouchSensor, {
        activationConstraint: { delay: 200, tolerance: 6 },
    })
    const sensors = useSensors(pointerSensor, touchSensor)

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

    // DnD Handlers
    const handleDragStart = useCallback((event: DragStartEvent) => {
        const quote = event.active.data.current?.quote as Quote
        if (quote) setActiveQuote(quote)
    }, [])

    const handleDragOver = useCallback((event: DragOverEvent) => {
        setOverId(event.over?.id as string || null)
    }, [])

    const handleDragEnd = useCallback(async (event: DragEndEvent) => {
        setActiveQuote(null)
        setOverId(null)

        const { active, over } = event
        if (!over) return

        const quoteId = active.id as string
        const targetColumnId = over.id as string

        // Find the quote
        const quote = quotes.find(q => q.id === quoteId)
        if (!quote) return

        // Check if it's actually a different column
        const currentColumnId = getColumnId(quote.status)
        if (currentColumnId === targetColumnId) return

        // Map column id to actual status value
        const newStatus = STATUS_MAP[targetColumnId]
        if (!newStatus) return

        // Get the column label for toast
        const targetCol = PIPELINE_COLUMNS.find(c => c.id === targetColumnId)

        // Optimistic update
        setQuotes(prev => prev.map(q =>
            q.id === quoteId ? { ...q, status: newStatus } : q
        ))

        toast.success(`Movido para "${targetCol?.label}"`, {
            description: `${quote.client_name} atualizado`,
        })

        try {
            await updateQuoteStatus(quoteId, newStatus as any)
            router.refresh()
        } catch {
            // Revert on error
            setQuotes(prev => prev.map(q =>
                q.id === quoteId ? { ...q, status: quote.status } : q
            ))
            toast.error('Erro ao mover orçamento', {
                description: 'Tente novamente',
            })
        }
    }, [quotes, router])

    // Progress bar data
    const totalQuotes = quotes.length
    const distribution = PIPELINE_COLUMNS.map(col => ({
        ...col,
        count: quotes.filter(q => getColumnId(q.status) === col.id).length
    }))

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header & View Toggle */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">Orçamentos</h1>
                    {totalCount > 0 && (
                        <div className="flex items-center justify-center min-w-6 h-6 px-2 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                            {totalCount}
                        </div>
                    )}
                </div>

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

            {/* List View (no drag) */}
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

            {/* Pipeline View with DnD */}
            {view === 'pipeline' && (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                >
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
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Timeline */}
                        <div className="relative pl-10">
                            <div className="absolute left-[15px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-zinc-300 via-border to-zinc-200 dark:from-zinc-600 dark:via-border dark:to-zinc-700 rounded-full" />

                            {PIPELINE_COLUMNS.map((col, colIdx) => {
                                const colQuotes = quotes.filter(q => getColumnId(q.status) === col.id)
                                const isCollapsed = collapsedSections.has(col.id)
                                const isLast = colIdx === PIPELINE_COLUMNS.length - 1
                                const isDropTarget = overId === col.id

                                return (
                                    <DroppableColumn
                                        key={col.id}
                                        id={col.id}
                                        className={`relative ${!isLast ? 'pb-6' : 'pb-2'} rounded-xl px-1 -mx-1 animate-in fade-in`}
                                    >
                                        {/* Dot */}
                                        <div className="absolute -left-10 top-0 flex items-center justify-center">
                                            <div className={`relative w-8 h-8 rounded-full ${col.accent} flex items-center justify-center shadow-lg ring-4 ${isDropTarget ? 'ring-primary scale-110' : col.dotRing} ring-offset-2 ring-offset-background transition-all duration-300`}>
                                                {colQuotes.length > 0 && (
                                                    <span className="text-white text-xs font-black">{colQuotes.length}</span>
                                                )}
                                                {colQuotes.length > 0 && !isDropTarget && (
                                                    <div className={`absolute inset-0 rounded-full ${col.accent} animate-ping opacity-20`} />
                                                )}
                                            </div>
                                        </div>

                                        {/* Section Header */}
                                        <button
                                            onClick={() => toggleSection(col.id)}
                                            className="flex items-center gap-2 mb-3 w-full text-left group/header"
                                        >
                                            <h3 className={`text-xs font-black tracking-widest uppercase ${col.color}`}>
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
                                            <div className="space-y-2.5">
                                                {colQuotes.map((quote) => (
                                                    <DraggableQuoteCard
                                                        key={quote.id}
                                                        quote={quote}
                                                        colAccent={col.accent}
                                                        colColor={col.color}
                                                        fmt={fmt}
                                                        fmtDate={fmtDate}
                                                        variant="timeline"
                                                    />
                                                ))}
                                            </div>
                                        )}

                                        {!isCollapsed && colQuotes.length === 0 && (
                                            <div className={`text-[11px] italic pl-1 py-2 rounded-lg transition-colors ${isDropTarget ? 'text-primary font-semibold bg-primary/5 text-center' : 'text-muted-foreground/50'}`}>
                                                {isDropTarget ? '↓ Soltar aqui' : 'Nenhum orçamento nesta fase'}
                                            </div>
                                        )}
                                    </DroppableColumn>
                                )
                            })}
                        </div>
                    </div>

                    {/* ====================== */}
                    {/* DESKTOP: Kanban */}
                    {/* ====================== */}
                    <div className="hidden md:block animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Progress Bar */}
                        {totalQuotes > 0 && (
                            <div className="mb-6 px-1">
                                <div className="flex h-2.5 rounded-full overflow-hidden bg-muted/30 border border-border/30 shadow-inner">
                                    {distribution.map(d => d.count > 0 && (
                                        <div
                                            key={d.id}
                                            className={`${d.accent} transition-all duration-700 ease-out relative group/bar`}
                                            style={{ width: `${(d.count / totalQuotes) * 100}%` }}
                                        >
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
                        <div className="grid grid-cols-6 gap-3 pt-2">
                            {PIPELINE_COLUMNS.map(col => {
                                const colQuotes = quotes.filter(q => getColumnId(q.status) === col.id)
                                const isDropTarget = overId === col.id

                                return (
                                    <DroppableColumn
                                        key={col.id}
                                        id={col.id}
                                        className={`min-w-0 flex flex-col rounded-2xl border ${col.border} ${col.bg} relative overflow-hidden transition-all duration-300 hover:shadow-lg ${isDropTarget ? 'ring-2 ring-primary shadow-xl scale-[1.02]' : ''}`}
                                    >
                                        {/* Top Accent */}
                                        <div className={`absolute top-0 left-0 right-0 h-1.5 ${col.accent} opacity-80`} />

                                        {/* Header */}
                                        <div className="flex items-center justify-between px-3 xl:px-4 pt-4 pb-2">
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${col.accent} shadow-sm`} />
                                                <h3 className={`text-[10px] xl:text-xs font-black tracking-widest uppercase ${col.color}`}>
                                                    {col.label}
                                                </h3>
                                            </div>
                                            <span className="text-[10px] xl:text-xs bg-background/80 backdrop-blur-md border border-border/50 px-2 py-0.5 rounded-full text-foreground font-bold shadow-sm">
                                                {colQuotes.length}
                                            </span>
                                        </div>

                                        {/* Cards */}
                                        <div className="flex px-2 xl:px-3 pb-3 flex-col gap-2 overflow-y-auto max-h-[65vh] scrollbar-none min-h-[80px]">
                                            {colQuotes.map((quote) => (
                                                <DraggableQuoteCard
                                                    key={quote.id}
                                                    quote={quote}
                                                    colAccent={col.accent}
                                                    colColor={col.color}
                                                    fmt={fmt}
                                                    fmtDate={fmtDate}
                                                    variant="kanban"
                                                />
                                            ))}

                                            {colQuotes.length === 0 && (
                                                <div className={`flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-xl m-1 transition-all ${isDropTarget
                                                    ? 'border-primary/50 bg-primary/5 text-primary'
                                                    : 'border-current/10 opacity-60'
                                                    }`}>
                                                    <p className="text-xs font-bold uppercase tracking-widest text-foreground/50">
                                                        {isDropTarget ? 'Soltar aqui' : 'Vazio'}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </DroppableColumn>
                                )
                            })}
                        </div>
                    </div>

                    {/* Drag Overlay - the ghost card that follows cursor */}
                    <DragOverlay dropAnimation={{ duration: 200, easing: 'ease-out' }}>
                        {activeQuote && (
                            <DragOverlayCard quote={activeQuote} fmt={fmt} fmtDate={fmtDate} />
                        )}
                    </DragOverlay>
                </DndContext>
            )}
        </div>
    )
}
