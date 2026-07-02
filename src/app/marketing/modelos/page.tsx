import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, FileText } from 'lucide-react'
import { SeoPageLayout, SectionBlock } from '@/components/marketing/seo-page-layout'
import { SEO_BASE_URL, SEO_MODEL_PAGES } from '@/lib/seo-site-content'

export const metadata: Metadata = {
    title: 'Modelos de orcamento | Zacly',
    description: 'Veja modelos de orcamento para prestadores, mecanicos, marceneiros, eletricistas, pintores e assistencias tecnicas.',
    alternates: { canonical: `${SEO_BASE_URL}/modelos` },
}

export default function ModelosPage() {
    return (
        <SeoPageLayout
            eyebrow="Modelos"
            title="Modelos de orcamento para prestadores autonomos."
            description="Use estes modelos como referencia para montar propostas mais claras por oficio e depois criar o orcamento no Zacly."
        >
            <SectionBlock title="Escolha o modelo mais proximo do seu servico" eyebrow="Referencias">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {SEO_MODEL_PAGES.map((model) => (
                        <Link
                            key={model.slug}
                            href={`/modelos/${model.slug}`}
                            className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-emerald-500/30 hover:bg-emerald-500/5"
                        >
                            <FileText className="h-7 w-7 text-emerald-400" />
                            <h2 className="mt-5 text-xl font-black text-white">{model.h1}</h2>
                            <p className="mt-3 text-sm leading-6 text-zinc-400">{model.description}</p>
                            <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-emerald-300">
                                Ver modelo
                                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                            </span>
                        </Link>
                    ))}
                </div>
            </SectionBlock>
        </SeoPageLayout>
    )
}
