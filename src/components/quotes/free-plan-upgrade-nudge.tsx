'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { BadgeCheck, Crown, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { captureEvent } from '@/lib/analytics'

interface FreePlanUpgradeNudgeProps {
    quoteId: string
    status: string
    experienceMode: string
    hasLogo: boolean
    layoutStyle: string
    professionalContext: string
}

export function FreePlanUpgradeNudge({
    quoteId,
    status,
    experienceMode,
    hasLogo,
    layoutStyle,
    professionalContext,
}: FreePlanUpgradeNudgeProps) {
    useEffect(() => {
        captureEvent('paywall_contextual_shown', {
            trigger: 'quote_detail',
            quote_id: quoteId,
            status,
            experience_mode: experienceMode,
            has_logo: hasLogo,
            layout_style: layoutStyle,
            professional_context: professionalContext,
            plan_type: 'free',
        })
    }, [experienceMode, hasLogo, layoutStyle, professionalContext, quoteId, status])

    const trackClick = () => {
        captureEvent('paywall_contextual_clicked', {
            trigger: 'quote_detail',
            quote_id: quoteId,
            status,
            experience_mode: experienceMode,
            has_logo: hasLogo,
            layout_style: layoutStyle,
            professional_context: professionalContext,
            plan_type: 'free',
        })
    }

    const isProSample = experienceMode === 'pro_sample'
    const isApproved = status === 'approved'
    const heading = isApproved
        ? 'Voce fechou um servico. Mantenha sua identidade nas proximas propostas.'
        : isProSample
            ? 'Sua proposta com marca profissional ja foi enviada. Mantenha esse padrao no Pro.'
            : 'Sua proposta foi enviada. A proxima pode sair com a marca da sua oficina.'
    const cta = isApproved ? 'Manter minha marca' : isProSample ? 'Manter visual Pro' : 'Ver plano Pro'

    return (
        <section className="mb-5 rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm print:hidden sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                    <div className="flex items-center gap-2 text-sm font-black text-slate-950">
                        <Crown className="h-4 w-4 text-emerald-600" />
                        {heading}
                    </div>
                    <div className="mt-3 grid gap-2 text-xs leading-5 text-slate-600 sm:grid-cols-2">
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                            <p className="flex items-center gap-2 font-bold text-slate-800">
                                <BadgeCheck className="h-4 w-4" />
                                Plano gratis
                            </p>
                            <p className="mt-1">Marca Zacly, modelo Profissional e proposta pronta para enviar.</p>
                        </div>
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                            <p className="flex items-center gap-2 font-bold text-emerald-900">
                                <Sparkles className="h-4 w-4" />
                                Plano Pro
                            </p>
                            <p className="mt-1">Sua logo, cores do negocio, mensagem personalizada e proposta sem marca Zacly.</p>
                        </div>
                    </div>
                </div>
                <Button asChild className="h-11 shrink-0 bg-emerald-600 px-5 font-bold text-white hover:bg-emerald-700">
                    <Link href={`/pricing?source=proposal_${status}_paywall`} onClick={trackClick}>
                        {cta}
                    </Link>
                </Button>
            </div>
        </section>
    )
}
