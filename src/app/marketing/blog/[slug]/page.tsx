import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { SectionBlock, SeoPageLayout } from '@/components/marketing/seo-page-layout'
import { SEO_BASE_URL, SEO_GUIDE_ARTICLES, getSeoGuideArticle } from '@/lib/seo-site-content'

type PageProps = {
    params: Promise<{ slug: string }>
}

export function generateStaticParams() {
    return SEO_GUIDE_ARTICLES.map((article) => ({ slug: article.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params
    const article = getSeoGuideArticle(slug)

    if (!article) return {}

    const url = `${SEO_BASE_URL}/blog/${article.slug}`

    return {
        title: article.title,
        description: article.description,
        keywords: article.keywords,
        alternates: { canonical: url },
        openGraph: {
            type: 'article',
            locale: 'pt_BR',
            url,
            siteName: 'Zacly',
            title: article.title,
            description: article.description,
            images: [{ url: '/og-image.png', width: 1200, height: 630, alt: article.title }],
        },
        twitter: {
            card: 'summary_large_image',
            title: article.title,
            description: article.description,
            images: ['/og-image.png'],
        },
    }
}

export default async function BlogArticlePage({ params }: PageProps) {
    const { slug } = await params
    const article = getSeoGuideArticle(slug)

    if (!article) notFound()

    const url = `${SEO_BASE_URL}/blog/${article.slug}`
    const articleJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.h1,
        description: article.description,
        inLanguage: 'pt-BR',
        author: { '@type': 'Organization', name: 'Zacly' },
        publisher: { '@type': 'Organization', name: 'Zacly', logo: { '@type': 'ImageObject', url: `${SEO_BASE_URL}/logo/logo.png` } },
        mainEntityOfPage: url,
    }
    const faqJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: article.faq.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
    }
    const breadcrumbJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Zacly', item: SEO_BASE_URL },
            { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SEO_BASE_URL}/blog` },
            { '@type': 'ListItem', position: 3, name: article.title, item: url },
        ],
    }

    return (
        <SeoPageLayout eyebrow="Guia Zacly" title={article.h1} description={article.intro}>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

            <SectionBlock title="Passo a passo" eyebrow={article.readTime}>
                <article className="mx-auto max-w-4xl space-y-6">
                    {article.sections.map((section) => (
                        <section key={section.heading} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                            <h2 className="text-2xl font-black tracking-tight text-white">{section.heading}</h2>
                            <p className="mt-4 text-sm leading-7 text-zinc-400">{section.body}</p>
                            {section.bullets && (
                                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                                    {section.bullets.map((bullet) => (
                                        <li key={bullet} className="flex gap-3 text-sm font-semibold text-zinc-300">
                                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                                            {bullet}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </section>
                    ))}
                </article>
            </SectionBlock>

            <SectionBlock eyebrow="Perguntas frequentes" title="Duvidas comuns sobre o tema.">
                <div className="grid gap-4 md:grid-cols-2">
                    {article.faq.map((item) => (
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
                        Criar orcamento gratis
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </SectionBlock>
        </SeoPageLayout>
    )
}
