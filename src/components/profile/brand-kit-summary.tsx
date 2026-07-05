'use client'

import { CheckCircle2, MessageCircle, Palette, ShieldCheck, Sparkles, Wand2 } from 'lucide-react'
import type { BrandKit } from '@/lib/brand-kit'

interface BrandKitSummaryProps {
    brandKit: BrandKit | null
    isFree: boolean
}

const modelNames: Record<string, string> = {
    professional: 'Profissional',
    modern: 'Moderno',
    classic: 'Classico',
    minimalist: 'Minimalista',
    agency: 'Agencia',
    impact: 'Impacto',
}

export function BrandKitSummary({ brandKit, isFree }: BrandKitSummaryProps) {
    if (!brandKit) return null

    const readyItems = brandKit.checklist.filter((item) => item.status === 'ready').slice(0, 5)
    const reviewItems = brandKit.checklist.filter((item) => item.status === 'review')

    return (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex items-center gap-2 text-sm font-black">
                        <Wand2 className="h-4 w-4" />
                        Kit visual automatico criado
                    </div>
                    <p className="mt-1 text-xs leading-5 text-emerald-800">
                        A logo virou um padrao pronto para proposta, PDF, envio pelo WhatsApp e pagina de aprovacao.
                    </p>
                </div>
                <span className="inline-flex w-fit items-center rounded-full bg-white px-3 py-1 text-[11px] font-black text-emerald-800">
                    {brandKit.status === 'ready' ? 'Pronto para usar' : 'Com ajustes seguros'}
                </span>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-white p-3">
                    <div className="flex items-center gap-2 text-xs font-bold">
                        <Palette className="h-4 w-4" />
                        Paleta
                    </div>
                    <div className="mt-3 flex gap-1.5">
                        {brandKit.palette.slice(0, 5).map((color) => (
                            <span
                                key={color}
                                className="h-6 w-6 rounded-full border border-emerald-100"
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>
                </div>

                <div className="rounded-xl bg-white p-3">
                    <div className="flex items-center gap-2 text-xs font-bold">
                        <Sparkles className="h-4 w-4" />
                        Modelo
                    </div>
                    <p className="mt-3 text-sm font-black">{modelNames[brandKit.recommendedModel] || 'Profissional'}</p>
                    <p className="text-xs text-emerald-700">{brandKit.styleLabel}</p>
                </div>

                <div className="rounded-xl bg-white p-3">
                    <div className="flex items-center gap-2 text-xs font-bold">
                        <ShieldCheck className="h-4 w-4" />
                        Confianca
                    </div>
                    <p className="mt-3 text-sm font-black">{brandKit.qualityLabel}</p>
                    <p className="text-xs text-emerald-700">{Math.round(brandKit.confidence * 100)}% de leitura</p>
                </div>
            </div>

            <div className="mt-4 grid gap-2">
                {readyItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 text-xs font-semibold text-emerald-900">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        {item.label}
                    </div>
                ))}
            </div>

            <div className="mt-4 rounded-xl border border-emerald-200 bg-white p-3 text-xs leading-5 text-emerald-900">
                <div className="mb-1 flex items-center gap-2 font-black">
                    <MessageCircle className="h-4 w-4" />
                    Mensagem sugerida pelo kit
                </div>
                <p>{brandKit.whatsappMessageTemplate}</p>
            </div>

            {reviewItems.length > 0 && (
                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
                    {brandKit.warnings[0] || 'A logo foi ajustada para manter leitura e organizacao na proposta.'}
                </div>
            )}

            {isFree && (
                <div className="mt-3 text-xs leading-5 text-emerald-800">
                    O kit fica salvo. No Pro, ele libera a identidade completa nos modelos premium e na mensagem personalizada.
                </div>
            )}
        </div>
    )
}
