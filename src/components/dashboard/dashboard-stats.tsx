'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Clock, CheckCircle, PlayCircle, Trophy,
    Calendar, ChevronDown, X
} from 'lucide-react'

type Period = '7d' | '30d' | 'month' | 'custom'

interface Stats {
    pending: number
    approved: number
    in_progress: number
    completed: number
}

const periodLabels: Record<Period, string> = {
    '7d': 'Últimos 7 dias',
    '30d': 'Últimos 30 dias',
    'month': 'Este mês',
    'custom': 'Personalizado'
}

export function DashboardStats() {
    const [period, setPeriod] = useState<Period>('month')
    const [showPicker, setShowPicker] = useState(false)
    const [customFrom, setCustomFrom] = useState('')
    const [customTo, setCustomTo] = useState('')
    const [stats, setStats] = useState<Stats>({ pending: 0, approved: 0, in_progress: 0, completed: 0 })
    const [loading, setLoading] = useState(true)

    const getDateRange = useCallback((): { from: string; to: string } => {
        const now = new Date()
        const to = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59)

        if (period === 'custom' && customFrom && customTo) {
            return { from: new Date(customFrom).toISOString(), to: new Date(customTo + 'T23:59:59').toISOString() }
        }

        let from: Date
        switch (period) {
            case '7d':
                from = new Date(now)
                from.setDate(from.getDate() - 7)
                break
            case '30d':
                from = new Date(now)
                from.setDate(from.getDate() - 30)
                break
            case 'month':
            default:
                from = new Date(now.getFullYear(), now.getMonth(), 1)
                break
        }

        return { from: from.toISOString(), to: to.toISOString() }
    }, [period, customFrom, customTo])

    useEffect(() => {
        async function fetchStats() {
            setLoading(true)
            const supabase = createClient()
            const { from, to } = getDateRange()

            const statuses = ['pending', 'approved', 'in_progress', 'completed'] as const

            const results = await Promise.all(
                statuses.map(status =>
                    supabase
                        .from('quotes')
                        .select('*', { count: 'exact', head: true })
                        .in('status', status === 'pending' ? ['pending', 'draft', 'sent'] : [status])
                        .gte('created_at', from)
                        .lte('created_at', to)
                )
            )

            setStats({
                pending: results[0].count || 0,
                approved: results[1].count || 0,
                in_progress: results[2].count || 0,
                completed: results[3].count || 0,
            })
            setLoading(false)
        }

        if (period !== 'custom' || (customFrom && customTo)) {
            fetchStats()
        }
    }, [period, customFrom, customTo, getDateRange])

    const handleCustomApply = () => {
        if (customFrom && customTo) {
            setPeriod('custom')
            setShowPicker(false)
        }
    }

    const cards = [
        {
            label: 'Em Análise',
            value: stats.pending,
            icon: Clock,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/20'
        },
        {
            label: 'Aprovados',
            value: stats.approved,
            icon: CheckCircle,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20'
        },
        {
            label: 'Em Execução',
            value: stats.in_progress,
            icon: PlayCircle,
            color: 'text-violet-500',
            bg: 'bg-violet-500/10',
            border: 'border-violet-500/20'
        },
        {
            label: 'Concluídos',
            value: stats.completed,
            icon: Trophy,
            color: 'text-teal-500',
            bg: 'bg-teal-500/10',
            border: 'border-teal-500/20'
        }
    ]

    return (
        <section className="space-y-4">
            {/* Period Filter */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="text-lg font-bold text-foreground tracking-tight">Resumo</h2>
                <div className="flex items-center gap-2 flex-wrap">
                    {(['month', '7d', '30d'] as Period[]).map((p) => (
                        <Button
                            key={p}
                            size="sm"
                            variant={period === p ? 'default' : 'outline'}
                            onClick={() => { setPeriod(p); setShowPicker(false) }}
                            className={`h-8 text-xs rounded-lg ${period === p
                                ? 'bg-primary text-primary-foreground'
                                : 'border-border text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            {periodLabels[p]}
                        </Button>
                    ))}
                    <div className="relative">
                        <Button
                            size="sm"
                            variant={period === 'custom' ? 'default' : 'outline'}
                            onClick={() => setShowPicker(!showPicker)}
                            className={`h-8 text-xs rounded-lg gap-1 ${period === 'custom'
                                ? 'bg-primary text-primary-foreground'
                                : 'border-border text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <Calendar className="h-3 w-3" />
                            {period === 'custom' && customFrom && customTo
                                ? `${new Date(customFrom).toLocaleDateString('pt-BR')} - ${new Date(customTo).toLocaleDateString('pt-BR')}`
                                : 'Personalizado'
                            }
                            <ChevronDown className={`h-3 w-3 transition-transform ${showPicker ? 'rotate-180' : ''}`} />
                        </Button>

                        {showPicker && (
                            <>
                                {/* Overlay — fecha ao tocar fora */}
                                <div
                                    className="fixed inset-0 z-40 bg-black/20"
                                    onClick={() => setShowPicker(false)}
                                />
                                {/* Dropdown: modal sheet centralizado em mobile, absolute em desktop */}
                                <div className="
                                    fixed left-4 right-4 top-1/2 -translate-y-1/2 z-50
                                    sm:absolute sm:left-auto sm:right-0 sm:top-10 sm:translate-y-0 sm:w-72
                                    bg-popover border border-border rounded-xl p-4 shadow-xl space-y-3
                                ">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-foreground">Período personalizado</span>
                                        <button onClick={() => setShowPicker(false)} className="text-muted-foreground hover:text-foreground">
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs text-muted-foreground font-medium">De</label>
                                        <Input
                                            type="date"
                                            value={customFrom}
                                            onChange={(e) => setCustomFrom(e.target.value)}
                                            className="h-9 text-sm bg-card w-full"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs text-muted-foreground font-medium">Até</label>
                                        <Input
                                            type="date"
                                            value={customTo}
                                            onChange={(e) => setCustomTo(e.target.value)}
                                            className="h-9 text-sm bg-card w-full"
                                        />
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={handleCustomApply}
                                        disabled={!customFrom || !customTo}
                                        className="w-full h-9 text-sm bg-primary text-primary-foreground"
                                    >
                                        Aplicar
                                    </Button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {cards.map((card) => (
                    <Card key={card.label} className={`border shadow-sm rounded-2xl transition-all hover:-translate-y-0.5 hover:shadow-md ${card.border}`}>
                        <CardContent className="p-4 md:p-5">
                            <div className="flex items-center gap-2.5 mb-3">
                                <div className={`p-2 rounded-lg ${card.bg}`}>
                                    <card.icon className={`h-4 w-4 ${card.color}`} />
                                </div>
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                    {card.label}
                                </span>
                            </div>
                            <h3 className={`text-3xl md:text-4xl font-bold tracking-tight text-foreground ${loading ? 'animate-pulse' : ''}`}>
                                {loading ? '—' : card.value}
                            </h3>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
    )
}
