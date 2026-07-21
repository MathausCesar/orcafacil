import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import {
    AlertTriangle,
    ArrowRight,
    Check,
    CheckCircle2,
    ClipboardCheck,
    Eye,
    MessageCircle,
    Send,
    ShieldCheck,
    Sparkles,
    XCircle,
} from "lucide-react"

import { CampaignRegisterLink } from "@/components/marketing/campaign-register-link"
import { LogoDemoPlayground } from "@/components/marketing/logo-demo-playground"
import { MarketingFooter } from "@/components/marketing/marketing-footer"

const CAMPAIGN = "search_propostas_alta_intencao"
const BASE_URL = "https://www.zacly.com.br/orcamentos-profissionais"
const PAGE_DESCRIPTION =
    "Pare de perder serviços depois de mandar o preço no WhatsApp. Crie, envie e acompanhe propostas até o cliente abrir, pedir ajuste ou aceitar."

const ctaClass =
    "inline-flex min-h-14 w-full min-w-0 max-w-full items-center justify-center gap-2 whitespace-normal rounded-full bg-emerald-400 px-5 py-3 text-center text-sm font-black leading-5 text-zinc-950 shadow-[0_16px_40px_rgba(52,211,153,0.25)] transition hover:bg-emerald-300 sm:w-auto sm:px-7"

const secondaryCtaClass =
    "inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-white/15 px-6 text-sm font-bold text-white transition hover:bg-white/10 sm:w-auto"

const painCards = [
    {
        icon: MessageCircle,
        title: "Você manda o preço e a conversa esfria",
        text: "Sem um próximo passo claro, a proposta se mistura às outras mensagens e você fica esperando uma resposta que pode não chegar.",
    },
    {
        icon: AlertTriangle,
        title: "O acompanhamento vira tentativa e erro",
        text: "Sem saber se o cliente abriu a proposta, você cobra cedo demais, retoma tarde demais ou deixa uma oportunidade esfriar.",
    },
    {
        icon: ClipboardCheck,
        title: "O aceite fica perdido no WhatsApp",
        text: "Aprovação, pedido de ajuste e recusa se espalham pelo chat, dificultando saber o que avançou e o que precisa da sua atenção.",
    },
]

const workflow = [
    {
        icon: Send,
        title: "Envie no WhatsApp",
        text: "Compartilhe uma mensagem pronta com o link da proposta para o cliente abrir no celular.",
    },
    {
        icon: Eye,
        title: "Veja quando abrir",
        text: "Saiba quando a proposta foi aberta e pare de depender de suposições para fazer o próximo contato.",
    },
    {
        icon: ClipboardCheck,
        title: "Acompanhe a negociação",
        text: "Consulte o status de cada proposta e identifique quais conversas ainda precisam de acompanhamento.",
    },
    {
        icon: ShieldCheck,
        title: "Receba o aceite",
        text: "O cliente pode aceitar, pedir ajuste ou recusar pelo link, com a resposta ligada à proposta.",
    },
]

const goodFit = [
    "Prestadores que já recebem pedidos de preço pelo WhatsApp",
    "Autônomos e pequenas empresas que precisam retomar propostas no momento certo",
    "Quem quer acompanhar abertura, ajustes e aceite sem procurar mensagens antigas",
    "Negócios que precisam transformar mais orçamentos enviados em conversas acompanhadas",
]

const notFor = [
    "Quem quer apenas baixar um modelo de orçamento para editar",
    "Quem procura somente criar um PDF avulso e desaparecer depois do envio",
    "Quem busca um gerador grátis sem rotina de acompanhamento comercial",
    "Empresas que precisam de ERP, emissão fiscal, estoque ou gestão financeira",
]

const faq = [
    {
        question: "O Zacly é um ERP?",
        answer: "Não. O Zacly é uma ferramenta focada em criar orçamentos profissionais, enviar pelo WhatsApp e registrar a decisão do cliente. Ele não substitui um ERP, sistema fiscal ou financeiro.",
    },
    {
        question: "O cliente precisa criar conta para ver ou aprovar?",
        answer: "Não. O cliente abre o link da proposta no navegador e pode aprovar, recusar ou pedir ajuste sem criar uma conta.",
    },
    {
        question: "É um gerador grátis de orçamento ou modelo de PDF?",
        answer: "Não. O Zacly foi feito para quem envia propostas reais e precisa acompanhar o que acontece depois. O teste permite usar 5 propostas em 14 dias + 1 Amostra Pro antes de decidir continuar.",
    },
    {
        question: "O que está incluído no teste gratuito?",
        answer: "Você pode testar 5 propostas em 14 dias + 1 Amostra Pro para criar, enviar e acompanhar uma negociação real antes de decidir continuar.",
    },
    {
        question: "Posso usar minha logo no orçamento?",
        answer: "Sim. Você pode enviar sua logo para testar uma proposta com uma identidade visual mais próxima da sua empresa e uma mensagem pronta para WhatsApp.",
    },
]

type LandingSearchParams = Record<string, string | string[] | undefined>

function serializeSearchParams(searchParams: LandingSearchParams) {
    const query = new URLSearchParams()

    Object.entries(searchParams).forEach(([key, value]) => {
        if (Array.isArray(value)) {
            value.forEach((item) => query.append(key, item))
            return
        }

        if (value) query.set(key, value)
    })

    return query.toString()
}

export const metadata: Metadata = {
    title: "Sistema de orçamento: acompanhe até o aceite",
    description: PAGE_DESCRIPTION,
    keywords: [
        "orçamento profissional",
        "orçamento pelo WhatsApp",
        "acompanhar proposta comercial",
        "proposta comercial pelo WhatsApp",
        "orçamento para autônomo",
        "orçamento para pequena empresa",
        "abertura de proposta comercial",
        "aprovação de orçamento por link",
    ],
    alternates: {
        canonical: BASE_URL,
    },
    robots: {
        index: false,
        follow: true,
    },
    openGraph: {
        title: "Pare de perder serviços depois de enviar o preço | Zacly",
        description: "Crie, envie e acompanhe propostas pelo WhatsApp até o cliente abrir, pedir ajuste ou aceitar.",
        url: BASE_URL,
        siteName: "Zacly",
        locale: "pt_BR",
        type: "website",
        images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Orçamentos profissionais com Zacly" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "Pare de perder serviços depois de enviar o preço | Zacly",
        description: "Envie propostas pelo WhatsApp, acompanhe a abertura e registre o aceite do cliente.",
        images: ["/og-image.png"],
    },
}

export default async function ProfessionalQuotesLandingPage({
    searchParams,
}: {
    searchParams: Promise<LandingSearchParams>
}) {
    const queryString = serializeSearchParams(await searchParams)
    const faqJsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faq.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
                "@type": "Answer",
                text: item.answer,
            },
        })),
    }

    const softwareJsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "Zacly",
        url: BASE_URL,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        audience: {
            "@type": "Audience",
            audienceType: "autônomos e pequenas empresas que vendem serviços pelo WhatsApp",
        },
        description: PAGE_DESCRIPTION,
        offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "BRL",
        },
    }

    return (
        <main className="min-h-screen overflow-x-hidden bg-zinc-950 text-zinc-100">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
            />

            <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-zinc-950/90 backdrop-blur-md">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Link href="/" className="relative h-10 w-32" aria-label="Página inicial da Zacly">
                        <Image
                            src="/logo/logo.png"
                            alt="Zacly"
                            fill
                            sizes="128px"
                            className="object-contain object-left"
                            priority
                        />
                    </Link>
                    <Link
                        href="https://app.zacly.com.br/login"
                        className="text-sm font-semibold text-zinc-300 transition hover:text-white"
                    >
                        Entrar
                    </Link>
                </div>
            </header>

            <section className="relative isolate overflow-hidden border-b border-white/10 px-4 pb-10 pt-24 sm:px-6 lg:px-8 lg:pb-14 lg:pt-32">
                <Image
                    src="/og-image.png"
                    alt=""
                    fill
                    priority
                    sizes="100vw"
                    className="absolute inset-0 -z-20 object-cover object-center opacity-25"
                />
                <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,#09090b_0%,rgba(9,9,11,0.94)_38%,rgba(9,9,11,0.72)_68%,rgba(9,9,11,0.92)_100%)]" />

                <div className="mx-auto flex min-h-[76svh] max-w-7xl flex-col justify-center">
                    <div className="min-w-0 max-w-3xl">
                        <p className="inline-flex w-fit max-w-full items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1.5 text-xs font-black uppercase text-emerald-300">
                            <MessageCircle className="h-4 w-4 shrink-0" />
                            <span className="min-w-0 text-center leading-5">Sistema de propostas para serviços</span>
                        </p>

                        <h1 className="mt-6 max-w-full break-words text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
                            Pare de perder serviços depois de enviar o orçamento pelo WhatsApp.
                        </h1>

                        <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300 sm:text-xl">
                            Crie e envie uma proposta com link, veja quando o cliente abrir e acompanhe cada negociação até o pedido de ajuste ou aceite. Sem depender de mensagens perdidas para saber o que fazer depois.
                        </p>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <CampaignRegisterLink campaign={CAMPAIGN} content="hero_primary" queryString={queryString} className={ctaClass}>
                                Criar e enviar minha primeira proposta
                                <ArrowRight className="h-4 w-4" />
                            </CampaignRegisterLink>
                            <Link href="#como-funciona" className={secondaryCtaClass}>
                                Ver como funciona
                            </Link>
                        </div>

                        <div className="mt-5 flex flex-wrap gap-3 text-sm text-zinc-300">
                            <span className="inline-flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                                5 propostas em 14 dias + 1 Amostra Pro
                            </span>
                            <span className="inline-flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                                Sem cartão no cadastro
                            </span>
                            <span className="inline-flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                                Envio, abertura, acompanhamento e aceite
                            </span>
                        </div>
                    </div>

                    <div className="mt-12 grid gap-3 border-t border-white/10 pt-6 text-sm text-zinc-300 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                            <p className="font-black text-white">Envie pelo WhatsApp</p>
                            <p className="mt-1 text-zinc-400">Mensagem pronta com o link da proposta.</p>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                            <p className="font-black text-white">Veja quando abrir</p>
                            <p className="mt-1 text-zinc-400">Saiba quando o cliente visualizou a proposta.</p>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                            <p className="font-black text-white">Acompanhe o andamento</p>
                            <p className="mt-1 text-zinc-400">Encontre as negociações que pedem retorno.</p>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                            <p className="font-black text-white">Registre o aceite</p>
                            <p className="mt-1 text-zinc-400">Ajuste, aceite ou recusa ficam na proposta.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
                <div className="mx-auto max-w-7xl">
                    <div className="max-w-3xl">
                        <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">O problema começa depois do envio</p>
                        <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                            Montar o orçamento é só o começo. O serviço se perde quando ninguém acompanha.
                        </h2>
                        <p className="mt-5 text-base leading-7 text-zinc-400">
                            O Zacly organiza o caminho entre o envio e a decisão do cliente para você saber quais propostas avançaram e quais ainda precisam de contato.
                        </p>
                    </div>

                    <div className="mt-10 grid gap-4 md:grid-cols-3">
                        {painCards.map((item) => (
                            <article key={item.title} className="rounded-lg border border-white/10 bg-white/[0.04] p-6">
                                <item.icon className="h-7 w-7 text-amber-300" />
                                <h3 className="mt-5 text-lg font-black text-white">{item.title}</h3>
                                <p className="mt-3 text-sm leading-6 text-zinc-400">{item.text}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section id="como-funciona" className="scroll-mt-24 border-y border-white/10 bg-white/[0.03] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
                <div className="mx-auto max-w-7xl">
                    <div className="max-w-3xl">
                        <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">Do envio ao aceite</p>
                        <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                            Saiba o que aconteceu com cada proposta e qual conversa retomar.
                        </h2>
                        <p className="mt-5 text-base leading-7 text-zinc-400">
                            Depois de organizar itens, prazo e valor, você envia pelo WhatsApp e acompanha a negociação até a resposta do cliente.
                        </p>
                    </div>

                    <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {workflow.map((item, index) => (
                            <article key={item.title} className="rounded-lg border border-white/10 bg-zinc-950 p-6">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-300">
                                    <item.icon className="h-5 w-5" />
                                </div>
                                <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-zinc-500">Passo {index + 1}</p>
                                <h3 className="mt-2 text-lg font-black text-white">{item.title}</h3>
                                <p className="mt-3 text-sm leading-6 text-zinc-400">{item.text}</p>
                            </article>
                        ))}
                    </div>

                    <div className="mt-8">
                        <CampaignRegisterLink campaign={CAMPAIGN} content="workflow_cta" queryString={queryString} className={ctaClass}>
                            Criar e enviar minha primeira proposta
                            <ArrowRight className="h-4 w-4" />
                        </CampaignRegisterLink>
                    </div>
                </div>
            </section>

            <section id="teste-logo" className="border-y border-white/10 bg-zinc-900 px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
                <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                    <div>
                        <p className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
                            <Sparkles className="h-4 w-4" />
                            1 Amostra Pro incluída
                        </p>
                        <h2 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-4xl">
                            Depois do fluxo comercial, personalize a apresentação.
                        </h2>
                        <p className="mt-5 text-base leading-7 text-zinc-400">
                            Envie sua logo para visualizar uma proposta com paleta e mensagem de WhatsApp alinhadas à sua marca. A apresentação reforça o trabalho; o envio, o acompanhamento e o aceite conduzem a negociação.
                        </p>
                        <div className="mt-8">
                            <Link href="#logo-demo-upload" className={secondaryCtaClass}>
                                Ver minha marca na proposta
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>

                    <LogoDemoPlayground
                        compact
                        industryLabel="sua empresa"
                        title="Veja sua marca depois de conhecer o fluxo."
                        subtitle="Use sua Amostra Pro para visualizar a proposta e a mensagem de envio com a identidade da sua empresa."
                        campaign={CAMPAIGN}
                        campaignContent="logo_demo_professional_quotes"
                        queryString={queryString}
                    />
                </div>
            </section>

            <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
                <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
                    <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/[0.08] p-6">
                        <Check className="h-7 w-7 text-emerald-300" />
                        <h2 className="mt-5 text-2xl font-black text-white">Bom encaixe para você se...</h2>
                        <ul className="mt-6 space-y-3">
                            {goodFit.map((item) => (
                                <li key={item} className="flex gap-3 text-sm leading-6 text-zinc-300">
                                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-300" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-6">
                        <XCircle className="h-7 w-7 text-zinc-400" />
                        <h2 className="mt-5 text-2xl font-black text-white">Não é para você se...</h2>
                        <ul className="mt-6 space-y-3">
                            {notFor.map((item) => (
                                <li key={item} className="flex gap-3 text-sm leading-6 text-zinc-400">
                                    <XCircle className="mt-1 h-4 w-4 shrink-0 text-zinc-600" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            <section className="border-y border-white/10 bg-zinc-900 px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
                <div className="mx-auto max-w-5xl text-center">
                    <ShieldCheck className="mx-auto h-8 w-8 text-emerald-300" />
                    <h2 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-4xl">
                        Seu próximo serviço não deveria depender de uma mensagem esquecida.
                    </h2>
                    <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-zinc-400">
                        Centralize envio, abertura, acompanhamento e aceite para conduzir cada oportunidade até uma resposta clara, sem adotar um ERP complexo.
                    </p>
                    <div className="mt-8 flex justify-center">
                        <CampaignRegisterLink campaign={CAMPAIGN} content="confidence_cta" queryString={queryString} className={ctaClass}>
                            Criar e enviar minha primeira proposta
                            <ArrowRight className="h-4 w-4" />
                        </CampaignRegisterLink>
                    </div>
                </div>
            </section>

            <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
                <div className="mx-auto max-w-5xl">
                    <div className="max-w-3xl">
                        <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">Dúvidas antes de testar</p>
                        <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                            Tudo o que você precisa para decidir se faz sentido para a sua rotina.
                        </h2>
                    </div>
                    <div className="mt-8 grid gap-4 md:grid-cols-2">
                        {faq.map((item) => (
                            <article key={item.question} className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
                                <h3 className="font-black text-white">{item.question}</h3>
                                <p className="mt-3 text-sm leading-6 text-zinc-400">{item.answer}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="border-t border-emerald-400/20 bg-emerald-400/[0.08] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
                <div className="mx-auto max-w-4xl text-center">
                    <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">Acompanhe sua próxima oportunidade</p>
                    <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
                        Pare de mandar preço e esperar sem saber o que aconteceu.
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-zinc-300">
                        Comece com 5 propostas em 14 dias + 1 Amostra Pro. Crie, envie e acompanhe uma negociação real antes de decidir continuar.
                    </p>
                    <div className="mt-8 flex justify-center">
                        <CampaignRegisterLink campaign={CAMPAIGN} content="final_cta" queryString={queryString} className={ctaClass}>
                            Criar e enviar minha primeira proposta
                            <ArrowRight className="h-4 w-4" />
                        </CampaignRegisterLink>
                    </div>
                </div>
            </section>

            <MarketingFooter />
        </main>
    )
}
