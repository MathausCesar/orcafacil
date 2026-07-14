import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, FileText, MessageCircle, Workflow } from 'lucide-react'
import { SeoPageLayout, SectionBlock } from '@/components/marketing/seo-page-layout'
import { SEO_BASE_URL } from '@/lib/seo-site-content'
import {
    buildZaclyOrganizationJsonLd,
    buildZaclySoftwareJsonLd,
    ZACLY_ENTITY,
} from '@/lib/zacly-entity'

export const metadata: Metadata = {
    title: 'O que e Zacly? | App de orcamentos para autonomos',
    description:
        'Zacly e uma plataforma brasileira para autonomos criarem orcamentos profissionais em PDF, enviarem pelo WhatsApp e acompanharem aprovacao do cliente.',
    keywords: [
        'o que e Zacly',
        'Zacly',
        'Zacly app',
        'app de orcamento Zacly',
        'Zacly orcamentos',
        'plataforma Zacly',
    ],
    alternates: { canonical: `${SEO_BASE_URL}/sobre-zacly` },
    openGraph: {
        type: 'website',
        locale: 'pt_BR',
        url: `${SEO_BASE_URL}/sobre-zacly`,
        siteName: 'Zacly',
        title: 'O que e Zacly?',
        description: ZACLY_ENTITY.description,
        images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Zacly app de orcamentos' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'O que e Zacly?',
        description: ZACLY_ENTITY.description,
        images: ['/og-image.png'],
    },
}

const facts = [
    'Zacly e uma plataforma ativa para criar orcamentos profissionais online.',
    'O app foi pensado para autonomos, MEIs e pequenos prestadores de servico.',
    'A rotina principal une cliente, itens, PDF, WhatsApp, link de aprovacao e controle simples.',
]

const differentiators = [
    {
        icon: FileText,
        title: 'Orcamento profissional',
        body: 'O prestador monta propostas com cliente, itens, prazo, condicoes, total e apresentacao organizada.',
    },
    {
        icon: MessageCircle,
        title: 'Envio pelo WhatsApp',
        body: 'O Zacly gera o link da proposta e ajuda o usuario a enviar uma mensagem clara para o cliente decidir.',
    },
    {
        icon: Workflow,
        title: 'Acompanhamento simples',
        body: 'As propostas podem ser acompanhadas em etapas como rascunho, enviada, aprovada, recusada e em andamento.',
    },
]

const faq = [
    {
        question: 'O Zacly e um site ativo?',
        answer:
            'Sim. Zacly e uma plataforma ativa em zacly.com.br e app.zacly.com.br para criar e acompanhar orcamentos profissionais.',
    },
    {
        question: 'Zacly e uma loja ou marca de moda?',
        answer:
            'Nao. Zacly e um app de orcamentos e propostas para autonomos e pequenos prestadores de servico.',
    },
    {
        question: 'Quem usa o Zacly?',
        answer:
            'O Zacly atende mecanicos, marceneiros, eletricistas, pintores, assistencias tecnicas, MEIs e prestadores que hoje fazem orcamentos no papel ou no WhatsApp.',
    },
]

export default function SobreZaclyPage() {
    const pageUrl = `${SEO_BASE_URL}/sobre-zacly`
    const aboutPageJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        name: 'O que e Zacly?',
        url: pageUrl,
        inLanguage: 'pt-BR',
        description: ZACLY_ENTITY.description,
        mainEntity: buildZaclyOrganizationJsonLd(),
        about: buildZaclySoftwareJsonLd(),
    }
    const faqJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faq.map((item) => ({
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
            { '@type': 'ListItem', position: 2, name: 'O que e Zacly?', item: pageUrl },
        ],
    }

    return (
        <SeoPageLayout
            eyebrow="Entidade da marca"
            title="O que e Zacly?"
            description="Zacly e uma plataforma brasileira para autonomos criarem orcamentos profissionais, enviarem propostas pelo WhatsApp e acompanharem a aprovacao do cliente."
        >
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPageJsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

            <SectionBlock
                eyebrow="Resumo direto"
                title="Zacly nao e uma loja, marketplace ou pagina desativada."
                description="A marca Zacly identifica um software web voltado para a organizacao comercial de prestadores autonomos."
            >
                <div className="grid gap-4 md:grid-cols-3">
                    {facts.map((fact) => (
                        <div key={fact} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                            <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                            <p className="mt-4 text-sm font-semibold leading-6 text-zinc-300">{fact}</p>
                        </div>
                    ))}
                </div>
            </SectionBlock>

            <section className="border-y border-white/10 bg-white/[0.03] px-4 py-16 sm:px-6 lg:px-8">
                <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
                    <div>
                        <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-400">Para quem e</p>
                        <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                            Feito para quem vende servico e ainda controla tudo no papel.
                        </h2>
                        <p className="mt-5 text-sm leading-7 text-zinc-400">
                            O Zacly atende profissionais que precisam transformar preco, escopo, prazo e condicoes em uma proposta mais confiavel para o cliente.
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                        {differentiators.map((item) => {
                            const Icon = item.icon

                            return (
                                <div key={item.title} className="rounded-2xl border border-white/10 bg-zinc-950 p-6">
                                    <Icon className="h-7 w-7 text-emerald-400" />
                                    <h3 className="mt-5 text-lg font-black text-white">{item.title}</h3>
                                    <p className="mt-3 text-sm leading-6 text-zinc-400">{item.body}</p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            <SectionBlock eyebrow="Perguntas sobre a marca" title="Informacoes para clientes e mecanismos de busca.">
                <div className="grid gap-4 md:grid-cols-3">
                    {faq.map((item) => (
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
