import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { MarketingFooter } from '@/components/marketing/marketing-footer'
import { MarketingHeader } from '@/components/marketing/marketing-header'

type SeoPageLayoutProps = {
    eyebrow: string
    title: string
    description: string
    children: ReactNode
    primaryCta?: string
}

export function SeoPageLayout({
    eyebrow,
    title,
    description,
    children,
    primaryCta = 'Comecar gratis',
}: SeoPageLayoutProps) {
    return (
        <main className="min-h-screen bg-zinc-950 text-zinc-50">
            <MarketingHeader />

            <section className="relative overflow-hidden border-b border-white/10 px-4 pb-16 pt-28 sm:px-6 lg:px-8 lg:pb-24 lg:pt-36">
                <div className="absolute left-1/2 top-24 h-72 w-[720px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />
                <div className="relative mx-auto max-w-5xl text-center">
                    <p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-400">{eyebrow}</p>
                    <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                        {title}
                    </h1>
                    <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-zinc-300">{description}</p>
                    <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <Link
                            href="https://app.zacly.com.br/register"
                            className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-400 px-6 py-3 text-sm font-black text-zinc-950 transition hover:bg-emerald-300"
                        >
                            {primaryCta}
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                        <span className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-400">
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                            Sem cartao no plano gratis
                        </span>
                    </div>
                </div>
            </section>

            {children}

            <MarketingFooter />
        </main>
    )
}

export function SectionBlock({
    eyebrow,
    title,
    description,
    children,
}: {
    eyebrow?: string
    title: string
    description?: string
    children: ReactNode
}) {
    return (
        <section className="px-4 py-16 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                {(eyebrow || title || description) && (
                    <div className="mb-10 max-w-3xl">
                        {eyebrow && <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-400">{eyebrow}</p>}
                        <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">{title}</h2>
                        {description && <p className="mt-4 text-base leading-7 text-zinc-400">{description}</p>}
                    </div>
                )}
                {children}
            </div>
        </section>
    )
}
