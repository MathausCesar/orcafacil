'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    CheckCircle, Eye, Send, WalletCards,
    Calendar, ChevronDown, X
} from 'lucide-react'
import { useOrganization } from '@/contexts/organization-context'

type Period = '7d' | '30d' | 'month' | 'custom'

interface Stats {
    sent: number
    opened: number
    approved: number
    negotiationValue: number
}

interface QuoteMetricRow {
    status: string | null
    total: number | null
    first_public_opened_at: string | null
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
    const [stats, setStats] = useState<Stats>({ sent: 0, opened: 0, approved: 0, negotiationValue: 0 })
    const [loading, setLoading] = useState(true)
    const { organization, isLoading: isOrgLoading } = useOrganization()

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
            if (!organization?.id) {
                setStats({ sent: 0, opened: 0, approved: 0, negotiationValue: 0 })
                setLoading(false)
                return
            }

            setLoading(true)
            const supabase = createClient()
            const { from, to } = getDateRange()

            const { data, error } = await supabase
                .from('quotes')
                .select('status, total, first_public_opened_at')
                .eq('organization_id', organization.id)
                .gte('created_at', from)
                .lte('created_at', to)

            if (error) {
                setStats({ sent: 0, opened: 0, approved: 0, negotiationValue: 0 })
                setLoading(false)
                return
            }

            const quotes = (data || []) as QuoteMetricRow[]
            const sentStatuses = new Set(['sent', 'approved', 'changes_requested', 'in_progress', 'completed'])
            const approvedStatuses = new Set(['approved', 'in_progress', 'completed'])
            const negotiationStatuses = new Set(['sent', 'changes_requested'])

            setStats({
                sent: quotes.filter((quote) => sentStatuses.has(quote.status || '')).length,
                opened: quotes.filter((quote) => Boolean(quote.first_public_opened_at)).length,
                approved: quotes.filter((quote) => approvedStatuses.has(quote.status || '')).length,
                negotiationValue: quotes
                    .filter((quote) => negotiationStatuses.has(quote.status || ''))
                    .reduce((total, quote) => total + (Number(quote.total) || 0), 0),
            })
            setLoading(false)
        }

        if (!isOrgLoading && (period !== 'custom' || (customFrom && customTo))) {
            fetchStats()
        }
    }, [period, customFrom, customTo, getDateRange, organization?.id, isOrgLoading])

    const handleCustomApply = () => {
        if (customFrom && customTo) {
            setPeriod('custom')
            setShowPicker(false)
        }
    }

    const cards = [
        {
            label: 'Enviadas',
            value: stats.sent,
            icon: Send,
            color: 'text-blue-600',
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/20'
        },
        {
            label: 'Abertas',
            value: stats.opened,
            icon: Eye,
            color: 'text-violet-600',
            bg: 'bg-violet-500/10',
            border: 'border-violet-500/20'
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
            label: 'Em negociação',
            value: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(stats.negotiationValue),
            icon: WalletCards,
            color: 'text-amber-600',
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/20'
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
                            <h3 className={`text-2xl md:text-3xl font-bold tracking-tight text-foreground ${loading ? 'animate-pulse' : ''}`}>
                                {loading ? '—' : card.value}
                            </h3>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </section>
    )
}
