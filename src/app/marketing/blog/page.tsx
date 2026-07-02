import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Clock3 } from 'lucide-react'
import { SeoPageLayout, SectionBlock } from '@/components/marketing/seo-page-layout'
import { SEO_BASE_URL, SEO_GUIDE_ARTICLES } from '@/lib/seo-site-content'

export const metadata: Metadata = {
    title: 'Blog Zacly | Guias de orcamento para autonomos',
    description: 'Aprenda a criar orcamentos profissionais, enviar propostas pelo WhatsApp e organizar aprovacao de clientes.',
    alternates: { canonical: `${SEO_BASE_URL}/blog` },
}

export default function BlogPage() {
    return (
        <SeoPageLayout
            eyebrow="Guias Zacly"
            title="Conteudo pratico para vender servico com proposta melhor."
            description="Guias curtos para autonomos que querem sair do papel, melhorar a apresentacao do orcamento e acompanhar aprovacao do cliente."
        >
            <SectionBlock title="Guias recentes" eyebrow="Aprenda">
                <div className="grid gap-4 md:grid-cols-2">
                    {SEO_GUIDE_ARTICLES.map((article) => (
                        <Link
                            key={article.slug}
                            href={`/blog/${article.slug}`}
                            className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-emerald-500/30 hover:bg-emerald-500/5"
                        >
                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-400">
                                <Clock3 className="h-4 w-4" />
                                {article.readTime}
                            </div>
                            <h2 className="mt-5 text-2xl font-black tracking-tight text-white">{article.h1}</h2>
                            <p className="mt-4 text-sm leading-6 text-zinc-400">{article.description}</p>
                            <span className="mt-6 inline-flex items-center gap-2 text-sm font-black text-emerald-300">
                                Ler guia
                                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                            </span>
                        </Link>
                    ))}
                </div>
            </SectionBlock>
        </SeoPageLayout>
    )
}
