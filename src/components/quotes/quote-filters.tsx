'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Search, SlidersHorizontal, X, ArrowUpDown } from 'lucide-react'

const STATUS_OPTIONS = [
    { value: '', label: 'Todos' },
    { value: 'pending', label: 'Pendente' },
    { value: 'approved', label: 'Aprovado' },
    { value: 'rejected', label: 'Recusado' },
    { value: 'in_progress', label: 'Em Execução' },
    { value: 'completed', label: 'Concluído' },
]

const SORT_OPTIONS = [
    { value: 'recent', label: 'Mais recente' },
    { value: 'oldest', label: 'Mais antigo' },
    { value: 'highest', label: 'Maior valor' },
    { value: 'lowest', label: 'Menor valor' },
    { value: 'name_asc', label: 'Cliente A→Z' },
    { value: 'name_desc', label: 'Cliente Z→A' },
]

export function QuoteFilters() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [open, setOpen] = useState(() => {
        // Auto-open if any filter is active
        return !!(searchParams.get('status') || searchParams.get('from') || searchParams.get('to') || searchParams.get('sort'))
    })

    const currentView = searchParams.get('view') || ''

    const createQueryString = useCallback((updates: Record<string, string>) => {
        const params = new URLSearchParams(searchParams.toString())
        Object.entries(updates).forEach(([key, value]) => {
            if (value) {
                params.set(key, value)
            } else {
                params.delete(key)
            }
        })
        return params.toString()
    }, [searchParams])

    const apply = (updates: Record<string, string>) => {
        router.push(`${pathname}?${createQueryString(updates)}`)
    }

    const clearAll = () => {
        router.push(currentView ? `${pathname}?view=${currentView}` : pathname)
        setOpen(false)
    }

    const currentQ = searchParams.get('q') || ''
    const currentStatus = searchParams.get('status') || ''
    const currentFrom = searchParams.get('from') || ''
    const currentTo = searchParams.get('to') || ''
    const currentSort = searchParams.get('sort') || 'recent'

    const hasActiveFilters = !!(currentStatus || currentFrom || currentTo || (currentSort && currentSort !== 'recent'))

    return (
        <div className="space-y-3">
            {/* Search + Filter Toggle Row */}
            <div className="flex gap-2">
                <form className="relative flex-1" action={pathname}>
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        name="q"
                        placeholder="Buscar por cliente..."
                        className="pl-10 h-10 bg-card border-primary/10 focus-visible:ring-primary"
                        defaultValue={currentQ}
                    />
                    {/* Preserve other params including view */}
                    {currentStatus && <input type="hidden" name="status" value={currentStatus} />}
                    {currentFrom && <input type="hidden" name="from" value={currentFrom} />}
                    {currentTo && <input type="hidden" name="to" value={currentTo} />}
                    {currentSort !== 'recent' && <input type="hidden" name="sort" value={currentSort} />}
                    {currentView && <input type="hidden" name="view" value={currentView} />}
                </form>
                <Button
                    type="button"
                    variant={hasActiveFilters ? 'default' : 'outline'}
                    size="icon"
                    className={`h-10 w-10 shrink-0 ${hasActiveFilters ? 'bg-primary text-primary-foreground' : ''}`}
                    onClick={() => setOpen(!open)}
                >
                    <SlidersHorizontal className="h-4 w-4" />
                </Button>
            </div>

            {/* Filter Panel */}
            {open && (
                <div className="bg-card rounded-xl border border-border p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Status Filter */}
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</Label>
                        <div className="flex flex-wrap gap-2">
                            {STATUS_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => apply({ status: opt.value })}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${currentStatus === opt.value
                                        ? 'bg-primary text-primary-foreground border-primary'
                                        : 'bg-muted/50 text-muted-foreground border-transparent hover:border-primary/30 hover:text-foreground'
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Date Range */}
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Período</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="min-w-0">
                                <Label className="text-xs text-muted-foreground mb-1 block">De</Label>
                                <Input
                                    type="date"
                                    value={currentFrom}
                                    onChange={(e) => apply({ from: e.target.value })}
                                    className="h-9 text-sm w-full"
                                />
                            </div>
                            <div className="min-w-0">
                                <Label className="text-xs text-muted-foreground mb-1 block">Até</Label>
                                <Input
                                    type="date"
                                    value={currentTo}
                                    onChange={(e) => apply({ to: e.target.value })}
                                    className="h-9 text-sm w-full"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sort */}
                    <div className="space-y-2">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                            <ArrowUpDown className="h-3 w-3" /> Ordenar por
                        </Label>
                        <div className="flex flex-wrap gap-2">
                            {SORT_OPTIONS.map((opt) => (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => apply({ sort: opt.value })}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${currentSort === opt.value
                                        ? 'bg-primary text-primary-foreground border-primary'
                                        : 'bg-muted/50 text-muted-foreground border-transparent hover:border-primary/30 hover:text-foreground'
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Clear Filters */}
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-muted-foreground hover:text-destructive"
                            onClick={clearAll}
                        >
                            <X className="h-3 w-3 mr-1" /> Limpar filtros
                        </Button>
                    )}
                </div>
            )}
        </div>
    )
}
