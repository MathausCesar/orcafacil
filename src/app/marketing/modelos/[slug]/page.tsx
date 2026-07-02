import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { SectionBlock, SeoPageLayout } from '@/components/marketing/seo-page-layout'
import { SEO_BASE_URL, SEO_MODEL_PAGES, getSeoModelPage } from '@/lib/seo-site-content'

type PageProps = {
    params: Promise<{ slug: string }>
}

export function generateStaticParams() {
    return SEO_MODEL_PAGES.map((model) => ({ slug: model.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params
    const model = getSeoModelPage(slug)

    if (!model) return {}

    const url = `${SEO_BASE_URL}/modelos/${model.slug}`

    return {
        title: model.title,
        description: model.description,
        alternates: { canonical: url },
        openGraph: {
            type: 'website',
            locale: 'pt_BR',
            url,
            siteName: 'Zacly',
            title: model.title,
            description: model.description,
            images: [{ url: '/og-image.png', width: 1200, height: 630, alt: model.title }],
        },
        twitter: {
            card: 'summary_large_image',
            title: model.title,
            description: model.description,
            images: ['/og-image.png'],
        },
    }
}

export default async function ModeloPage({ params }: PageProps) {
    const { slug } = await params
    const model = getSeoModelPage(slug)

    if (!model) notFound()

    const url = `${SEO_BASE_URL}/modelos/${model.slug}`
    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Zacly', item: SEO_BASE_URL },
            { '@type': 'ListItem', position: 2, name: 'Modelos', item: `${SEO_BASE_URL}/modelos` },
            { '@type': 'ListItem', position: 3, name: model.title, item: url },
        ],
    }

    return (
        <SeoPageLayout eyebrow="Modelo de orcamento" title={model.h1} description={model.intro}>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

            <SectionBlock
                eyebrow="Quando usar"
                title={`Indicado para ${model.useFor}.`}
                description="O modelo serve como checklist comercial para nao esquecer informacoes importantes antes de enviar ao cliente."
            >
                <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                        <h2 className="text-2xl font-black tracking-tight text-white">Campos recomendados</h2>
                        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                            {model.fields.map((field) => (
                                <li key={field} className="flex gap-3 text-sm font-semibold text-zinc-300">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                                    {field}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6">
                        <h2 className="text-2xl font-black tracking-tight text-white">Dicas para vender melhor</h2>
                        <ul className="mt-6 space-y-3">
                            {model.tips.map((tip) => (
                                <li key={tip} className="text-sm leading-6 text-emerald-50">{tip}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </SectionBlock>

            <SectionBlock
                eyebrow="Proximo passo"
                title="Transforme o modelo em uma proposta real."
                description="No Zacly, voce cadastra cliente, adiciona itens, define prazo e envia a proposta por WhatsApp com link de aprovacao."
            >
                <div className="text-center">
                    <Link
                        href="https://app.zacly.com.br/register"
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-400 px-6 py-3 text-sm font-black text-zinc-950 transition hover:bg-emerald-300"
                    >
                        Criar proposta gratis
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </SectionBlock>
        </SeoPageLayout>
    )
}
