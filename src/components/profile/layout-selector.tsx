'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { DEFAULT_PROPOSAL_ACCENT, FREE_PROPOSAL_MODEL, PROPOSAL_MODELS, isFreePlan } from '@/lib/proposal-style'
import { Check, Lock, Palette } from 'lucide-react'

interface LayoutSelectorProps {
    currentLayout: string
    currentColor: string
    onLayoutChange: (layout: string) => void
    onColorChange: (color: string) => void
    plan?: string | null
    recommendedLayout?: string | null
}

const defaultColors = [
    '#0D9B5C',
    '#2563EB',
    '#DC2626',
    '#D97706',
    '#7C3AED',
    '#111827',
]

function ModelPreview({ id, color }: { id: string; color: string }) {
    if (id === 'classic') {
        return (
            <div className="h-32 rounded-lg border bg-[#f7f2e8] p-4 text-slate-900">
                <div className="mx-auto mb-3 h-4 w-1/3 rounded-full bg-slate-300" />
                <div className="space-y-2 border-y border-slate-400 py-3">
                    <div className="h-1.5 w-full rounded bg-slate-500/70" />
                    <div className="h-1.5 w-3/4 rounded bg-slate-400" />
                    <div className="h-1.5 w-1/2 rounded bg-slate-300" />
                </div>
                <div className="mt-3 h-3 w-24 rounded" style={{ backgroundColor: color }} />
            </div>
        )
    }

    if (id === 'minimalist') {
        return (
            <div className="h-32 rounded-lg border bg-white p-4">
                <div className="mb-5 h-1.5 w-16 rounded-full" style={{ backgroundColor: color }} />
                <div className="mb-3 h-6 w-2/3 rounded bg-slate-900" />
                <div className="space-y-2">
                    <div className="h-1.5 w-full rounded bg-slate-200" />
                    <div className="h-1.5 w-4/5 rounded bg-slate-200" />
                </div>
                <div className="mt-5 h-8 rounded-xl border bg-slate-50" />
            </div>
        )
    }

    if (id === 'agency') {
        return (
            <div className="h-32 rounded-lg border bg-slate-100 p-3">
                <div className="mb-3 h-7 rounded-full" style={{ backgroundColor: color }} />
                <div className="rounded-2xl border bg-white p-3 shadow-sm">
                    <div className="mb-3 h-5 w-2/3 rounded bg-slate-900" />
                    <div className="h-12 rounded-xl bg-slate-900/90" />
                </div>
            </div>
        )
    }

    if (id === 'impact') {
        return (
            <div className="h-32 rounded-lg border border-slate-800 bg-slate-950 p-3">
                <div className="mb-4 h-5 w-24 rounded" style={{ backgroundColor: color }} />
                <div className="rounded-xl border border-white/10 bg-white/10 p-3">
                    <div className="mb-3 h-5 w-2/3 rounded bg-white" />
                    <div className="h-8 rounded bg-white/10" />
                </div>
            </div>
        )
    }

    if (id === 'modern') {
        return (
            <div className="h-32 rounded-lg border bg-white p-3">
                <div className="mb-3 flex items-center gap-2">
                    <div className="h-9 w-9 rounded-2xl bg-slate-900" />
                    <div className="h-4 w-24 rounded bg-slate-900" />
                </div>
                <div className="rounded-2xl bg-slate-950 p-3">
                    <div className="mb-3 h-2 w-20 rounded-full" style={{ backgroundColor: color }} />
                    <div className="h-6 w-2/3 rounded bg-white" />
                    <div className="mt-3 h-8 rounded bg-white/10" />
                </div>
            </div>
        )
    }

    return (
        <div className="h-32 rounded-lg border bg-slate-50 p-3">
            <div className="mb-3 flex items-center justify-between border-b pb-2">
                <div className="h-4 w-24 rounded bg-slate-900" />
                <div className="h-4 w-4 rounded-full" style={{ backgroundColor: color }} />
            </div>
            <div className="rounded-xl border bg-white p-3">
                <div className="mb-3 h-5 w-3/4 rounded bg-slate-900" />
                <div className="h-10 rounded bg-slate-100" />
            </div>
        </div>
    )
}

export function LayoutSelector({ currentLayout, currentColor, onLayoutChange, onColorChange, plan, recommendedLayout }: LayoutSelectorProps) {
    const isFree = isFreePlan(plan)
    const previewColor = isFree ? DEFAULT_PROPOSAL_ACCENT : currentColor

    useEffect(() => {
        if (isFree && currentLayout !== FREE_PROPOSAL_MODEL) {
            onLayoutChange(FREE_PROPOSAL_MODEL)
        }
    }, [currentLayout, isFree, onLayoutChange])

    return (
        <div className="space-y-8">
            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Palette className="h-4 w-4" />
                        Cor da marca da proposta
                    </Label>
                    <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs uppercase text-slate-500">
                        {previewColor}
                    </span>
                </div>

                {isFree && (
                    <div className="rounded-xl border bg-muted/50 p-4 text-sm text-muted-foreground">
                        <div className="flex items-start gap-3">
                            <Lock className="mt-0.5 h-5 w-5 shrink-0" />
                            <div className="min-w-0">
                                <p>
                                    No plano gratis, a proposta usa a identidade padrao Zacly com layout Profissional. Cores, estilos e ajustes finos ficam disponiveis no Pro.
                                </p>
                                <Link href="/pricing" className="mt-3 inline-flex text-xs font-bold text-primary hover:underline">
                                    Liberar personalizacao
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {!isFree && (
                    <p className="text-xs leading-5 text-muted-foreground">
                        Se voce enviou uma logo, o Zacly usa a cor detectada como ponto de partida. Voce pode ajustar manualmente sem perder a organizacao do layout.
                    </p>
                )}

                <div className={cn('flex flex-wrap items-center gap-3', isFree && 'pointer-events-none opacity-50')}>
                    {defaultColors.map((color) => (
                        <button
                            key={color}
                            type="button"
                            disabled={isFree}
                            onClick={() => onColorChange(color)}
                            className={cn(
                                'h-10 w-10 rounded-full border-2 shadow-sm transition hover:scale-105',
                                previewColor === color
                                    ? 'scale-105 border-foreground ring-2 ring-background'
                                    : 'border-background'
                            )}
                            style={{ backgroundColor: color }}
                            aria-label={`Selecionar cor ${color}`}
                        />
                    ))}

                    <div className="relative">
                        <input
                            type="color"
                            value={previewColor}
                            disabled={isFree}
                            onChange={(event) => onColorChange(event.target.value)}
                            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                            aria-label="Selecionar cor personalizada"
                        />
                        <div className={cn(
                            'flex h-10 w-10 items-center justify-center rounded-full border-2 bg-background shadow-sm transition',
                            !defaultColors.includes(previewColor) && !isFree
                                ? 'border-foreground ring-2 ring-background'
                                : 'border-border hover:border-foreground/50'
                        )}>
                            <span className="text-sm font-bold text-muted-foreground">+</span>
                        </div>
                    </div>
                </div>
            </section>

            <div className="h-px w-full bg-border" />

            <section className="space-y-3">
                <Label className="text-sm font-semibold text-foreground">Modelo da proposta</Label>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {PROPOSAL_MODELS.map((model) => {
                        const locked = isFree && model.id !== FREE_PROPOSAL_MODEL
                        const selected = (isFree ? FREE_PROPOSAL_MODEL : currentLayout) === model.id
                        const recommended = !isFree && recommendedLayout === model.id

                        return (
                            <button
                                key={model.id}
                                type="button"
                                disabled={locked}
                                onClick={() => {
                                    if (!locked) onLayoutChange(model.id)
                                }}
                                className={cn(
                                    'group relative rounded-2xl border-2 bg-card p-4 text-left transition hover:border-primary/50 hover:shadow-sm',
                                    selected
                                        ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                                        : 'border-border',
                                    locked && 'cursor-not-allowed opacity-65 hover:border-border hover:shadow-none'
                                )}
                            >
                                {selected && (
                                    <div className="absolute right-3 top-3 text-primary">
                                        <Check className="h-4 w-4" />
                                    </div>
                                )}

                                {locked && (
                                    <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full border bg-background px-2 py-1 text-[10px] font-bold uppercase text-muted-foreground">
                                        <Lock className="h-3 w-3" />
                                        Pro
                                    </div>
                                )}
                                {recommended && !selected && (
                                    <div className="absolute right-3 top-3 rounded-full border border-primary/20 bg-primary/10 px-2 py-1 text-[10px] font-bold uppercase text-primary">
                                        Recomendado
                                    </div>
                                )}

                                <div className="mb-3 pr-24">
                                    <div className="text-sm font-bold text-foreground">{model.name}</div>
                                    <div className="mt-1 text-xs leading-5 text-muted-foreground">{model.description}</div>
                                </div>

                                <ModelPreview id={model.id} color={previewColor} />
                            </button>
                        )
                    })}
                </div>
            </section>
        </div>
    )
}
