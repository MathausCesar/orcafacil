import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, CheckCircle2, FileText, MessageCircle, Workflow } from 'lucide-react'
import { MarketingFooter } from '@/components/marketing/marketing-footer'
import { MarketingHeader } from '@/components/marketing/marketing-header'
import { SEO_PROFESSION_PAGES, getSeoProfessionPage } from '@/lib/seo-profession-pages'

const BASE_URL = 'https://www.zacly.com.br'

type PageProps = {
    params: Promise<{ slug: string }>
}

export function generateStaticParams() {
    return SEO_PROFESSION_PAGES.map((page) => ({ slug: page.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params
    const page = getSeoProfessionPage(slug)

    if (!page) {
        return {}
    }

    const url = `${BASE_URL}/c/${page.slug}`

    return {
        title: page.title,
        description: page.description,
        keywords: page.keywords,
        alternates: {
            canonical: url,
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-image-preview': 'large',
                'max-snippet': -1,
                'max-video-preview': -1,
            },
        },
        openGraph: {
            type: 'website',
            locale: 'pt_BR',
            url,
            siteName: 'Zacly',
            title: page.title,
            description: page.description,
            images: [
                {
                    url: '/og-image.png',
                    width: 1200,
                    height: 630,
                    alt: page.title,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: page.title,
            description: page.description,
            images: ['/og-image.png'],
        },
    }
}

export default async function ProfessionLandingPage({ params }: PageProps) {
    const { slug } = await params
    const page = getSeoProfessionPage(slug)

    if (!page) {
        notFound()
    }

    const pageUrl = `${BASE_URL}/c/${page.slug}`
    const jsonLd = {
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

    const softwareJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Zacly',
        url: pageUrl,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        audience: {
            '@type': 'Audience',
            audienceType: page.profession,
        },
        description: page.description,
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'BRL',
        },
    }

    return (
        <main className="min-h-screen bg-zinc-950 text-zinc-50">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
            />

            <MarketingHeader />

            <section className="border-b border-white/10 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
                <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                    <div>
                        <p className="text-sm font-black uppercase tracking-[0.22em] text-emerald-400">{page.eyebrow}</p>
                        <h1 className="mt-5 max-w-4xl text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                            {page.h1}
                        </h1>
                        <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
                            {page.intro}
                        </p>
                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Link
                                href="https://app.zacly.com.br/register"
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-400 px-6 py-3 text-sm font-black text-zinc-950 transition hover:bg-emerald-300"
                            >
                                Comecar gratis
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <Link
                                href="/#planos"
                                className="inline-flex items-center justify-center rounded-full border border-white/15 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
                            >
                                Ver planos
                            </Link>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 shadow-2xl shadow-black/30">
                        <div className="rounded-2xl bg-white p-5 text-slate-950">
                            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                                <div>
                                    <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Proposta Zacly</p>
                                    <p className="mt-1 text-xl font-black">Servico aprovado com clareza</p>
                                </div>
                                <FileText className="h-8 w-8 text-emerald-600" />
                            </div>
                            <div className="mt-5 space-y-3">
                                {page.outcomes.map((item) => (
                                    <div key={item} className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                                        <p className="text-sm font-semibold leading-6 text-slate-700">{item}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="px-4 py-14 sm:px-6 lg:px-8">
                <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
                    <div>
                        <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-400">Antes da Zacly</p>
                        <h2 className="mt-3 text-3xl font-black tracking-tight text-white">O problema nao e so fazer o servico. E vender com organizacao.</h2>
                        <div className="mt-6 space-y-3">
                            {page.pains.map((pain) => (
                                <div key={pain} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm leading-6 text-zinc-300">
                                    {pain}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-400">Com Zacly</p>
                        <h2 className="mt-3 text-3xl font-black tracking-tight text-white">A proposta vira uma experiencia simples para o cliente aprovar.</h2>
                        <div className="mt-6 grid gap-3">
                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                                <MessageCircle className="h-6 w-6 text-emerald-400" />
                                <h3 className="mt-4 font-black text-white">Envio pelo WhatsApp</h3>
                                <p className="mt-2 text-sm leading-6 text-zinc-400">Mensagem pronta com link seguro para visualizar e aprovar.</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                                <Workflow className="h-6 w-6 text-emerald-400" />
                                <h3 className="mt-4 font-black text-white">Pipeline de orcamentos</h3>
                                <p className="mt-2 text-sm leading-6 text-zinc-400">Acompanhe enviados, aprovados, recusados e em andamento.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="border-y border-white/10 bg-white/[0.03] px-4 py-14 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-5xl">
                    <h2 className="text-3xl font-black tracking-tight text-white">Duvidas frequentes de {page.profession}</h2>
                    <div className="mt-8 grid gap-4 md:grid-cols-2">
                        {page.faq.map((item) => (
                            <div key={item.question} className="rounded-2xl border border-white/10 bg-zinc-950 p-5">
                                <h3 className="font-black text-white">{item.question}</h3>
                                <p className="mt-3 text-sm leading-6 text-zinc-400">{item.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="px-4 py-16 text-center sm:px-6 lg:px-8">
                <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-400">Comece sem cartao</p>
                <h2 className="mx-auto mt-3 max-w-3xl text-3xl font-black tracking-tight text-white sm:text-4xl">
                    Troque o orcamento no papel por uma proposta que ajuda o cliente a dizer sim.
                </h2>
                <Link
                    href="https://app.zacly.com.br/register"
                    className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-emerald-400 px-7 py-3 text-sm font-black text-zinc-950 transition hover:bg-emerald-300"
                >
                    Criar minha primeira proposta
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </section>

            <MarketingFooter />
        </main>
    )
}
