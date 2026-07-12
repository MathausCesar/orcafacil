'use client'

import { useEffect, useRef, useState, type MouseEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
    AlertTriangle,
    ArrowRight,
    CheckCircle2,
    ImageIcon,
    Loader2,
    MessageCircle,
    Palette,
    Sparkles,
    Upload,
    Wand2,
} from 'lucide-react'
import { MARKETING_LINKS } from '@/lib/marketing-links'
import { analyzeLogoIdentity, type LogoIdentityAnalysis } from '@/lib/color-extractor'
import { buildBrandKitFromLogoAnalysis, type BrandKit } from '@/lib/brand-kit'
import { prepareLogoFile } from '@/lib/logo-image-prep'
import { captureEvent } from '@/lib/analytics'
import { cn } from '@/lib/utils'

interface LogoDemoPlaygroundProps {
    industryLabel?: string
    title?: string
    subtitle?: string
    compact?: boolean
    campaignContent?: string
}

type PreparedState = {
    previewUrl: string
    analysis: LogoIdentityAnalysis
    brandKit: BrandKit
    improved: boolean
}

const sampleItems = [
    ['Diagnostico', 'R$ 120'],
    ['Pecas', 'R$ 390'],
    ['Mao de obra', 'R$ 280'],
]

function getRegisterUrl(campaignContent?: string, queryString = '') {
    const url = new URL(MARKETING_LINKS.register)
    const source = new URLSearchParams(queryString)
    ;['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'fbclid', 'msclkid', 'zacly_campaign'].forEach((key) => {
        const value = source.get(key)
        if (value) url.searchParams.set(key, value)
    })
    if (campaignContent) url.searchParams.set('zacly_content', campaignContent)
    return url.toString()
}

export function LogoDemoPlayground({
    industryLabel = 'seu negocio',
    title = 'Teste sua logo antes de criar conta.',
    subtitle = 'Envie uma imagem e veja como o Zacly transforma a marca em paleta, modelo visual e proposta mais confiavel.',
    compact = false,
    campaignContent = 'logo_demo',
}: LogoDemoPlaygroundProps) {
    const inputRef = useRef<HTMLInputElement>(null)
    const [prepared, setPrepared] = useState<PreparedState | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        return () => {
            if (prepared?.previewUrl) URL.revokeObjectURL(prepared.previewUrl)
        }
    }, [prepared?.previewUrl])

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        setError('')

        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            setError('Envie uma logo em PNG, JPG ou WebP.')
            return
        }

        if (file.size > 6 * 1024 * 1024) {
            setError('Use uma imagem de ate 6MB para testar.')
            return
        }

        setLoading(true)
        captureEvent('marketing_logo_demo_started', {
            file_type: file.type,
            file_size_kb: Math.round(file.size / 1024),
            industry_label: industryLabel,
        })

        try {
            const preparedLogo = await prepareLogoFile(file)
            const previewUrl = URL.createObjectURL(preparedLogo.file)
            const analysis = await analyzeLogoIdentity(previewUrl)
            const brandKit = buildBrandKitFromLogoAnalysis(analysis)

            setPrepared((current) => {
                if (current?.previewUrl) URL.revokeObjectURL(current.previewUrl)

                return {
                    previewUrl,
                    analysis,
                    brandKit,
                    improved: preparedLogo.improved,
                }
            })

            captureEvent('marketing_logo_demo_completed', {
                quality_score: analysis.qualityScore,
                confidence: analysis.confidence,
                recommended_model: analysis.recommendedModel,
                visual_tone: analysis.visualTone,
                image_improved: preparedLogo.improved,
                industry_label: industryLabel,
            })
        } catch (demoError) {
            console.error('Logo demo failed', demoError)
            setError('Nao conseguimos analisar essa imagem. Tente outra logo mais nitida.')
            captureEvent('marketing_logo_demo_failed', {
                reason: demoError instanceof Error ? demoError.message : 'unknown',
                industry_label: industryLabel,
            })
        } finally {
            setLoading(false)
            event.target.value = ''
        }
    }

    const accent = prepared?.analysis.safeAccentColor || '#22C55E'
    const palette = prepared?.brandKit.palette.slice(0, 5) || ['#22C55E', '#111827', '#F8FAFC']

    return (
        <div className={cn(
            'rounded-lg border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-black/25',
            compact ? 'lg:p-5' : 'lg:p-6',
        )}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                <div className="flex-1">
                    <p className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-300">
                        <Wand2 className="h-4 w-4" />
                        Demo com sua marca
                    </p>
                    <h3 className={cn('mt-4 font-black tracking-tight text-white', compact ? 'text-2xl' : 'text-3xl')}>
                        {title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-zinc-400">
                        {subtitle}
                    </p>

                    <div className="mt-5">
                        <button
                            id="logo-demo-upload"
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            disabled={loading}
                            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-emerald-400 px-5 text-sm font-black text-zinc-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                            {loading ? 'Analisando logo...' : 'Enviar logo para testar'}
                        </button>
                        <input
                            ref={inputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>

                    <p className="mt-3 text-xs leading-5 text-zinc-500">
                        O arquivo fica apenas no seu navegador durante esta demonstracao.
                    </p>

                    {error && (
                        <div className="mt-4 flex gap-2 rounded-lg border border-amber-400/25 bg-amber-400/10 p-3 text-xs leading-5 text-amber-100">
                            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                            {error}
                        </div>
                    )}

                    {prepared && (
                        <div className="mt-5 grid gap-3 text-xs text-zinc-300 sm:grid-cols-2">
                            <div className="rounded-lg border border-white/10 bg-zinc-950 p-3">
                                <div className="mb-2 flex items-center gap-2 font-black text-white">
                                    <Palette className="h-4 w-4 text-emerald-300" />
                                    Paleta detectada
                                </div>
                                <div className="flex gap-1.5">
                                    {palette.map((color) => (
                                        <span key={color} className="h-6 w-6 rounded-full border border-white/15" style={{ backgroundColor: color }} />
                                    ))}
                                </div>
                            </div>
                            <div className="rounded-lg border border-white/10 bg-zinc-950 p-3">
                                <div className="mb-2 flex items-center gap-2 font-black text-white">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                                    Visual sugerido
                                </div>
                                <p>{prepared.analysis.styleLabel}</p>
                                <p className="mt-1 text-zinc-500">
                                    {prepared.improved ? 'Logo reenquadrada automaticamente.' : 'Logo pronta para proposta.'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex-1 rounded-lg bg-white p-4 text-zinc-950">
                    <div className="rounded-lg p-4 text-white" style={{ backgroundColor: prepared?.analysis.neutralDark || '#111827' }}>
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg bg-white p-2 text-center text-[10px] font-black leading-tight text-zinc-950">
                                    {prepared ? (
                                        <Image src={prepared.previewUrl} alt="Logo enviada" fill className="object-contain p-1.5" unoptimized />
                                    ) : (
                                        <ImageIcon className="h-6 w-6 text-zinc-400" />
                                    )}
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/55">
                                        Proposta para {industryLabel}
                                    </p>
                                    <p className="mt-1 text-lg font-black">Servico aprovado no link</p>
                                </div>
                            </div>
                            <Sparkles className="h-6 w-6" style={{ color: accent }} />
                        </div>
                    </div>

                    <div className="mt-4 rounded-lg border border-zinc-200 p-4">
                        <div className="mb-4 h-2 w-28 rounded-full" style={{ backgroundColor: accent }} />
                        <h4 className="text-xl font-black">Proposta comercial</h4>
                        <p className="mt-2 text-sm leading-6 text-zinc-500">
                            Escopo, prazo, valor e aprovacao organizados com a identidade da empresa.
                        </p>
                        <div className="mt-4 space-y-2">
                            {sampleItems.map(([label, value]) => (
                                <div key={label} className="flex items-center justify-between border-t border-zinc-100 pt-2 text-sm">
                                    <span className="font-semibold text-zinc-600">{label}</span>
                                    <span className="font-black">{value}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 rounded-lg px-4 py-3 text-sm font-black" style={{ backgroundColor: accent, color: '#FFFFFF' }}>
                            Cliente aprova pelo link seguro
                        </div>
                    </div>

                    <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-xs leading-5 text-zinc-600">
                        <div className="mb-1 flex items-center gap-2 font-black text-zinc-950">
                            <MessageCircle className="h-4 w-4" />
                            Mensagem de envio pronta
                        </div>
                        <p>
                            {prepared?.brandKit.whatsappMessageTemplate || 'O Zacly tambem sugere uma mensagem para enviar a proposta pelo WhatsApp.'}
                        </p>
                    </div>

                    <Link
                        href={getRegisterUrl(campaignContent)}
                        onClick={(event: MouseEvent<HTMLAnchorElement>) => {
                            event.currentTarget.href = getRegisterUrl(campaignContent, window.location.search)
                        }}
                        className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-zinc-950 px-5 text-sm font-black text-white transition hover:bg-zinc-800"
                    >
                        Criar conta e usar minha logo
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </div>
    )
}
