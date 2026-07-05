'use client'

import Image from 'next/image'
import { AlertTriangle, CheckCircle2, Eye, Palette, Sparkles } from 'lucide-react'
import type { LogoIdentityAnalysis } from '@/lib/color-extractor'

interface LogoIdentityPreviewProps {
    analysis: LogoIdentityAnalysis | null
    businessName: string
    logoUrl: string | null
    fallbackColor: string
    isFree: boolean
}

const modelCopy: Record<string, string> = {
    professional: 'Profissional',
    modern: 'Moderno',
    classic: 'Classico',
    minimalist: 'Minimalista',
    agency: 'Agencia',
    impact: 'Impacto',
}

function scoreToPercent(value: number | undefined) {
    return `${Math.round((value || 0) * 100)}%`
}

export function LogoIdentityPreview({
    analysis,
    businessName,
    logoUrl,
    fallbackColor,
    isFree,
}: LogoIdentityPreviewProps) {
    const accent = analysis?.safeAccentColor || fallbackColor
    const palette = analysis?.palette?.length ? analysis.palette.slice(0, 4) : [accent]
    const displayName = businessName || 'Sua empresa'
    const hasLogo = Boolean(logoUrl)

    return (
        <div className="rounded-2xl border border-primary/15 bg-background p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex items-center gap-2 text-sm font-black text-foreground">
                        <Sparkles className="h-4 w-4 text-primary" />
                        Visual automatico da proposta
                    </div>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {hasLogo
                            ? 'O Zacly usa sua logo para montar uma proposta com cara de empresa, sem editor complicado.'
                            : 'Envie sua logo para ver como a proposta pode ficar mais profissional.'}
                    </p>
                </div>

                <div className="flex shrink-0 items-center gap-2 rounded-full border bg-muted/40 px-3 py-1.5 text-xs font-bold text-muted-foreground">
                    <Eye className="h-3.5 w-3.5" />
                    Antes e depois
                </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-dashed bg-muted/30 p-4">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Antes</p>
                    <div className="mt-3 rounded-2xl bg-white p-3 text-sm text-slate-700 shadow-sm">
                        <p className="font-semibold text-slate-950">Oi, segue o preco:</p>
                        <p className="mt-2 leading-5">Servico + pecas: R$ 850,00</p>
                        <p className="mt-2 text-xs text-slate-500">Mensagem solta no WhatsApp</p>
                    </div>
                </div>

                <div className="rounded-2xl border bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Com Zacly</p>
                        <span className="rounded-full px-2 py-1 text-[10px] font-black text-white" style={{ backgroundColor: accent }}>
                            Com sua marca
                        </span>
                    </div>
                    <div className="mt-3 rounded-2xl border border-slate-200 p-3">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-50">
                                {logoUrl ? (
                                    <Image src={logoUrl} alt="Logo" fill className="object-contain p-1.5" unoptimized />
                                ) : (
                                    <span className="text-xs font-black text-slate-400">LOGO</span>
                                )}
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-sm font-black text-slate-950">{displayName}</p>
                                <p className="text-xs text-slate-500">Proposta comercial</p>
                            </div>
                        </div>
                        <div className="mt-3 space-y-2">
                            <div className="h-2 w-24 rounded-full" style={{ backgroundColor: accent }} />
                            <div className="h-3 w-4/5 rounded bg-slate-900" />
                            <div className="h-2 w-full rounded bg-slate-100" />
                            <div className="h-2 w-2/3 rounded bg-slate-100" />
                        </div>
                        <div className="mt-4 rounded-xl bg-slate-950 p-3 text-white">
                            <p className="text-[10px] uppercase tracking-wide text-white/50">Total</p>
                            <p className="mt-1 text-lg font-black">R$ 850,00</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr]">
                <div className="rounded-xl border bg-muted/20 p-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                        <Palette className="h-4 w-4 text-primary" />
                        Paleta segura
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {palette.map((color) => (
                            <span key={color} className="inline-flex items-center gap-2 rounded-full border bg-background px-2.5 py-1 text-[11px] font-bold text-muted-foreground">
                                <span className="h-3.5 w-3.5 rounded-full border border-border" style={{ backgroundColor: color }} />
                                {color.toUpperCase()}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="rounded-xl border bg-muted/20 p-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        Recomendacao
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-bold">
                        <span className="rounded-full border bg-background px-2.5 py-1 text-muted-foreground">
                            {analysis?.styleLabel || 'Visual profissional'}
                        </span>
                        <span className="rounded-full border bg-background px-2.5 py-1 text-muted-foreground">
                            Modelo {modelCopy[analysis?.recommendedModel || 'professional']}
                        </span>
                        <span className="rounded-full border bg-background px-2.5 py-1 text-muted-foreground">
                            Qualidade {analysis ? scoreToPercent(analysis.qualityScore) : '--'}
                        </span>
                    </div>
                </div>
            </div>

            {analysis?.warnings?.length ? (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
                    <div className="flex gap-2">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                        <div>
                            <p className="font-bold">Ajuste automatico aplicado</p>
                            <p className="mt-1">{analysis.warnings[0]}</p>
                        </div>
                    </div>
                </div>
            ) : null}

            {isFree && hasLogo ? (
                <div className="mt-4 rounded-xl border border-primary/15 bg-primary/5 p-3 text-xs leading-5 text-muted-foreground">
                    No gratis, sua logo ajuda no visual basico. No Pro, voce libera modelos premium, remove a marca Zacly e usa a identidade completa da empresa.
                </div>
            ) : null}
        </div>
    )
}

