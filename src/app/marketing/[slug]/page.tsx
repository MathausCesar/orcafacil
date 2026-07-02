import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { SectionBlock, SeoPageLayout } from '@/components/marketing/seo-page-layout'
import { SEO_BASE_URL, SEO_COMMERCIAL_PAGES, getSeoCommercialPage } from '@/lib/seo-site-content'

type PageProps = {
    params: Promise<{ slug: string }>
}

export function generateStaticParams() {
    return SEO_COMMERCIAL_PAGES.map((page) => ({ slug: page.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params
    const page = getSeoCommercialPage(slug)

    if (!page) return {}

    const url = `${SEO_BASE_URL}/${page.slug}`

    return {
        title: page.title,
        description: page.description,
        keywords: page.keywords,
        alternates: { canonical: url },
        openGraph: {
            type: 'website',
            locale: 'pt_BR',
            url,
            siteName: 'Zacly',
            title: page.title,
            description: page.description,
            images: [{ url: '/og-image.png', width: 1200, height: 630, alt: page.title }],
        },
        twitter: {
            card: 'summary_large_image',
            title: page.title,
            description: page.description,
            images: ['/og-image.png'],
        },
    }
}

export default async function CommercialSeoPage({ params }: PageProps) {
    const { slug } = await params
    const page = getSeoCommercialPage(slug)

    if (!page) notFound()

    const url = `${SEO_BASE_URL}/${page.slug}`
    const faqJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: page.faq.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer,
            },
        })),
    }

    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Zacly', item: SEO_BASE_URL },
            { '@type': 'ListItem', position: 2, name: page.title, item: url },
        ],
    }

    return (
        <SeoPageLayout eyebrow={page.eyebrow} title={page.h1} description={page.intro}>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />

            <SectionBlock
                eyebrow="Por que usar"
                title="O Zacly transforma o orcamento em uma etapa de venda mais profissional."
                description={page.description}
            >
                <div className="grid gap-4 md:grid-cols-3">
                    {page.benefits.map((benefit) => (
                        <div key={benefit} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                            <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                            <p className="mt-4 text-sm font-semibold leading-6 text-zinc-300">{benefit}</p>
                        </div>
                    ))}
                </div>
            </SectionBlock>

            <section className="border-y border-white/10 bg-white/[0.03] px-4 py-16 sm:px-6 lg:px-8">
                <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2">
                    {page.sections.map((section) => (
                        <div key={section.heading} className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
                            <h2 className="text-2xl font-black tracking-tight text-white">{section.heading}</h2>
                            <p className="mt-4 text-sm leading-7 text-zinc-400">{section.body}</p>
                        </div>
                    ))}
                </div>
            </section>

            <SectionBlock eyebrow="Perguntas frequentes" title="Duvidas comuns antes de criar uma proposta.">
                <div className="grid gap-4 md:grid-cols-2">
                    {page.faq.map((item) => (
                        <div key={item.question} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                            <h2 className="font-black text-white">{item.question}</h2>
                            <p className="mt-3 text-sm leading-6 text-zinc-400">{item.answer}</p>
                        </div>
                    ))}
                </div>
                <div className="mt-10 text-center">
                    <Link
                        href="https://app.zacly.com.br/register"
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-400 px-6 py-3 text-sm font-black text-zinc-950 transition hover:bg-emerald-300"
                    >
                        Testar o Zacly gratis
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </SectionBlock>
        </SeoPageLayout>
    )
}
