'use client'

import { useId, useMemo } from 'react'
import { Crown, LockKeyhole, ShieldCheck, TrendingDown, TrendingUp, TriangleAlert } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    calculateProfitSummary,
    isMarginBelowTarget,
    normalizeMarginPercent,
    type ProfitCalculatorItem,
} from '@/lib/profit-calculator'
import { cn } from '@/lib/utils'

export type ProfitGuardItem = ProfitCalculatorItem

export type ProfitGuardProps = {
    items: readonly ProfitGuardItem[]
    targetMarginPercent: number
    onTargetMarginChange: (targetMarginPercent: number) => void
    isPro: boolean
}

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
})

const percentFormatter = new Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: 1,
})

function formatCurrency(value: number) {
    return currencyFormatter.format(value)
}

function formatPercent(value: number | null) {
    return value === null ? '--' : `${percentFormatter.format(value)}%`
}

export function ProfitGuard({ items, targetMarginPercent, onTargetMarginChange, isPro }: ProfitGuardProps) {
    const targetInputId = useId()
    const summary = useMemo(() => calculateProfitSummary(items), [items])
    const targetMargin = normalizeMarginPercent(targetMarginPercent)
    const marginBelowTarget = isMarginBelowTarget(summary.marginPercent, targetMargin)
    const hasItems = summary.itemCount > 0
    const hasIncompleteCosts = summary.itemsWithoutKnownCost > 0
    const cannotCalculateMargin = summary.marginPercent === null

    const status = !hasItems
        ? 'empty'
        : cannotCalculateMargin || marginBelowTarget || hasIncompleteCosts
            ? 'attention'
            : 'healthy'

    const statusMessage = !hasItems
        ? 'Adicione itens com preco e quantidade para acompanhar o lucro desta proposta.'
        : hasIncompleteCosts
            ? 'Informe o custo dos itens para calcular a margem real antes de enviar.'
            : cannotCalculateMargin
            ? 'Defina um preco nos itens para calcular a margem desta proposta.'
            : marginBelowTarget
                ? `A margem de ${formatPercent(summary.marginPercent)} esta abaixo da meta de ${formatPercent(targetMargin)}.`
                : `A margem de ${formatPercent(summary.marginPercent)} esta dentro da meta de ${formatPercent(targetMargin)}.`

    const handleTargetMarginChange = (value: string) => {
        if (!value.trim()) return

        const parsed = Number(value)
        if (!Number.isFinite(parsed)) return

        onTargetMarginChange(normalizeMarginPercent(parsed))
    }

    return (
        <section
            aria-label="Protecao de lucro"
            className={cn(
                'rounded-lg border p-3 shadow-sm sm:p-4',
                status === 'attention' && 'border-amber-200 bg-amber-50/70',
                status === 'healthy' && 'border-emerald-200 bg-emerald-50/60',
                status === 'empty' && 'border-slate-200 bg-white',
            )}
        >
            <div className="flex items-start gap-3">
                <div
                    className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-md',
                        status === 'attention' && 'bg-amber-100 text-amber-700',
                        status === 'healthy' && 'bg-emerald-100 text-emerald-700',
                        status === 'empty' && 'bg-slate-100 text-slate-600',
                    )}
                >
                    {status === 'attention' ? <TriangleAlert className="h-4 w-4" aria-hidden="true" /> : <ShieldCheck className="h-4 w-4" aria-hidden="true" />}
                </div>
                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <h3 className="text-sm font-black text-slate-950">Protecao de lucro</h3>
                        {status === 'attention' && <span className="text-xs font-bold text-amber-800">Revisar antes de enviar</span>}
                        {status === 'healthy' && <span className="text-xs font-bold text-emerald-800">Meta atendida</span>}
                    </div>
                    <p className="mt-0.5 text-xs leading-5 text-slate-600">{statusMessage}</p>
                </div>
            </div>

            <dl className="mt-3 grid grid-cols-2 overflow-hidden rounded-md border border-slate-200 bg-white sm:grid-cols-4">
                <div className="min-w-0 border-b border-r border-slate-200 p-2.5 sm:border-b-0">
                    <dt className="text-[11px] font-medium text-slate-500">Receita</dt>
                    <dd className="mt-1 truncate text-sm font-bold tabular-nums text-slate-900" title={formatCurrency(summary.revenue)}>{formatCurrency(summary.revenue)}</dd>
                </div>
                <div className="min-w-0 border-b border-slate-200 p-2.5 sm:border-b-0 sm:border-r">
                    <dt className="text-[11px] font-medium text-slate-500">Custo conhecido</dt>
                    <dd className="mt-1 truncate text-sm font-bold tabular-nums text-slate-900" title={formatCurrency(summary.knownCost)}>{formatCurrency(summary.knownCost)}</dd>
                </div>
                <div className="min-w-0 border-r border-slate-200 p-2.5 sm:border-r">
                    <dt className="text-[11px] font-medium text-slate-500">Lucro</dt>
                    <dd className={cn('mt-1 truncate text-sm font-bold tabular-nums', summary.profit < 0 ? 'text-red-700' : 'text-slate-900')} title={formatCurrency(summary.profit)}>{formatCurrency(summary.profit)}</dd>
                </div>
                <div className="min-w-0 p-2.5">
                    <dt className="text-[11px] font-medium text-slate-500">Margem</dt>
                    <dd className={cn('mt-1 flex items-center gap-1 text-sm font-bold tabular-nums', marginBelowTarget || cannotCalculateMargin ? 'text-amber-800' : 'text-slate-900')}>
                        {marginBelowTarget || cannotCalculateMargin ? <TrendingDown className="h-3.5 w-3.5 shrink-0" aria-hidden="true" /> : <TrendingUp className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
                        <span className="truncate">{formatPercent(summary.marginPercent)}</span>
                    </dd>
                </div>
            </dl>

            <div className="mt-3 flex flex-col gap-2 border-t border-slate-200 pt-3 sm:flex-row sm:items-center sm:justify-between">
                {isPro ? (
                    <div className="flex items-center gap-2">
                        <Label htmlFor={targetInputId} className="whitespace-nowrap text-xs font-semibold text-slate-700">Meta de margem</Label>
                        <div className="relative w-24">
                            <Input
                                id={targetInputId}
                                type="number"
                                min="0"
                                max="100"
                                step="1"
                                inputMode="decimal"
                                value={targetMargin}
                                onChange={(event) => handleTargetMarginChange(event.target.value)}
                                className="h-8 pr-7 text-xs tabular-nums"
                                aria-describedby={`${targetInputId}-hint`}
                            />
                            <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-xs font-semibold text-slate-500">%</span>
                        </div>
                        <span id={`${targetInputId}-hint`} className="text-xs text-slate-500">meta minima</span>
                    </div>
                ) : (
                    <div aria-label={`Meta de margem de ${formatPercent(targetMargin)}. Recurso Pro.`} className="flex min-w-0 items-center gap-2 text-xs text-slate-600">
                        <div className="flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2 text-slate-700">
                            <LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />
                            <span className="whitespace-nowrap font-semibold">Meta: {formatPercent(targetMargin)}</span>
                        </div>
                        <span className="flex min-w-0 items-center gap-1 leading-4"><Crown className="h-3.5 w-3.5 shrink-0 text-amber-600" aria-hidden="true" />Personalize sua meta no Pro</span>
                    </div>
                )}

                {hasIncompleteCosts && (
                    <p className="text-xs leading-5 text-amber-800">
                        {summary.itemsWithoutKnownCost} {summary.itemsWithoutKnownCost === 1 ? 'item esta sem custo informado.' : 'itens estao sem custo informado.'} O lucro considera apenas os custos conhecidos.
                    </p>
                )}
            </div>
        </section>
    )
}
