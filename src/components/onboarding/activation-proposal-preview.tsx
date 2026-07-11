"use client"

import Image from "next/image"
import { CheckCircle2, Sparkles } from "lucide-react"
import { getInitialCatalogForOnboarding } from "@/lib/onboarding-catalog"

interface ActivationProposalPreviewProps {
    businessName: string
    categoryName: string
    categorySlug: string
    specialties: string[]
    logoUrl: string | null
    accentColor: string | null
    recommendedModel: string
}

export function ActivationProposalPreview({
    businessName,
    categoryName,
    categorySlug,
    specialties,
    logoUrl,
    accentColor,
    recommendedModel,
}: ActivationProposalPreviewProps) {
    const accent = accentColor || "#0D9B5C"
    const items = getInitialCatalogForOnboarding(categorySlug, specialties).slice(0, 2)
    const displayName = businessName.trim() || `Sua ${categoryName}`
    const total = items.reduce((sum, item) => sum + item.price, 0)

    return (
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 text-white" style={{ backgroundColor: accent }}>
                <div className="flex min-w-0 items-center gap-2">
                    {logoUrl ? (
                        <div className="relative h-8 w-12 shrink-0 overflow-hidden rounded bg-white p-1">
                            <Image src={logoUrl} alt="Logo da empresa" fill className="object-contain p-1" unoptimized />
                        </div>
                    ) : (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-white/20 text-xs font-black">
                            {displayName.slice(0, 1).toUpperCase()}
                        </div>
                    )}
                    <div className="min-w-0">
                        <p className="truncate text-xs font-black">{displayName}</p>
                        <p className="text-[10px] text-white/75">Proposta comercial</p>
                    </div>
                </div>
                <Sparkles className="h-4 w-4 text-white/90" />
            </div>

            <div className="space-y-3 p-4">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Previa para seu cliente</p>
                    <p className="mt-1 text-sm font-black text-slate-900">Servico organizado, valor claro e aceite seguro.</p>
                </div>

                <div className="space-y-2 rounded-md border border-slate-100 bg-slate-50 p-3">
                    {items.map((item) => (
                        <div key={item.name} className="flex items-start justify-between gap-3 text-xs">
                            <span className="min-w-0 font-medium text-slate-700">{item.name}</span>
                            <span className="shrink-0 font-bold text-slate-900">
                                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(item.price)}
                            </span>
                        </div>
                    ))}
                    <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-2 text-xs font-black text-slate-950">
                        <span>Total estimado</span>
                        <span>{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(total)}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-[11px] font-medium text-slate-600">
                    <CheckCircle2 className="h-3.5 w-3.5" style={{ color: accent }} />
                    Modelo {recommendedModel} recomendado para {categoryName.toLowerCase()}.
                </div>
            </div>
        </section>
    )
}
