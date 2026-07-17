import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import {
    AlertTriangle,
    ArrowRight,
    Check,
    CheckCircle2,
    ClipboardCheck,
    FileText,
    MessageCircle,
    ShieldCheck,
    Sparkles,
    XCircle,
} from "lucide-react"

import { BeforeAfterComparisonSection } from "@/components/marketing/before-after-comparison-section"
import { CampaignRegisterLink } from "@/components/marketing/campaign-register-link"
import { LogoDemoPlayground } from "@/components/marketing/logo-demo-playground"
import { MarketingFooter } from "@/components/marketing/marketing-footer"

const CAMPAIGN = "search_propostas_alta_intencao"
const BASE_URL = "https://www.zacly.com.br/orcamentos-profissionais"
const PAGE_DESCRIPTION =
    "Transforme cada preço no WhatsApp em um orçamento profissional, claro e registrado. Para autônomos e pequenas empresas que ainda fazem propostas manualmente."

const ctaClass =
    "inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-emerald-400 px-7 text-sm font-black text-zinc-950 shadow-[0_16px_40px_rgba(52,211,153,0.25)] transition hover:bg-emerald-300 sm:w-auto"

const secondaryCtaClass =
    "inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-white/15 px-6 text-sm font-bold text-white transition hover:bg-white/10 sm:w-auto"

const painCards = [
    {
        icon: MessageCircle,
        title: "Preço solto convida à pechincha",
        text: "Quando o cliente recebe apenas um valor no WhatsApp, ele não enxerga o escopo, o prazo e o cuidado por trás do serviço.",
    },
    {
        icon: AlertTriangle,
        title: "Informações ficam espalhadas",
        text: "Áudio, papel, bloco de notas e conversa perdida dificultam explicar o combinado e retomar uma negociação depois.",
    },
    {
        icon: ClipboardCheck,
        title: "A decisão não fica registrada",
        text: "Sem uma proposta clara, aprovar, pedir ajuste ou recusar vira uma sequência de mensagens difíceis de acompanhar.",
    },
]

const workflow = [
    {
        icon: FileText,
        title: "Monte o orçamento",
        text: "Adicione cliente, itens, valores, prazo e observações sem começar um documento do zero.",
    },
    {
        icon: MessageCircle,
        title: "Envie no WhatsApp",
        text: "Compartilhe uma mensagem pronta com um link para o cliente abrir a proposta no celular.",
    },
    {
        icon: ShieldCheck,
        title: "Registre a resposta",
        text: "A aprovação, o pedido de ajuste ou a recusa ficam vinculados ao orçamento, no mesmo lugar.",
    },
]

const goodFit = [
    "Autônomos que enviam preços para clientes pelo WhatsApp",
    "Pequenas empresas que ainda montam propostas em papel, Word ou planilha",
    "Prestadores que querem explicar melhor escopo, prazo e valor",
    "Quem precisa de uma rotina leve para criar e acompanhar orçamentos",
]

const notFor = [
    "Emissão de nota fiscal, controle de estoque ou compras",
    "Financeiro, caixa, folha de pagamento ou conciliação bancária",
    "Implantação de um sistema completo de gestão empresarial",
    "Processos complexos de ERP para operações grandes",
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
        question: "O que está incluído no teste gratuito?",
        answer: "Você pode testar com 5 propostas em 14 dias + 1 Amostra Pro para entender como o orçamento fica para o seu cliente antes de decidir continuar.",
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
    title: "Orçamentos profissionais pelo WhatsApp",
    description: PAGE_DESCRIPTION,
    keywords: [
        "orçamento profissional",
        "orçamento pelo WhatsApp",
        "proposta comercial simples",
        "criar orçamento online",
        "orçamento para autônomo",
        "orçamento para pequena empresa",
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
        title: "Orçamentos profissionais pelo WhatsApp | Zacly",
        description: "Transforme preço solto no WhatsApp em um orçamento claro, profissional e registrado.",
        url: BASE_URL,
        siteName: "Zacly",
        locale: "pt_BR",
        type: "website",
        images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Orçamentos profissionais com Zacly" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "Orçamentos profissionais pelo WhatsApp | Zacly",
        description: "Crie propostas claras, envie pelo WhatsApp e registre a decisão do cliente.",
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
            audienceType: "autônomos e pequenas empresas que fazem orçamentos manualmente",
        },
        description: PAGE_DESCRIPTION,
        offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "BRL",
        },
    }

    return (
        <main className="min-h-screen bg-zinc-950 text-zinc-100">
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
                    <div className="max-w-3xl">
                        <p className="inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
                            <FileText className="h-4 w-4" />
                            Para autônomos e pequenas empresas
                        </p>

                        <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                            Transforme cada preço no WhatsApp em um orçamento profissional, claro e registrado.
                        </h1>

                        <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300 sm:text-xl">
                            Em vez de mandar um valor solto no chat, envie uma proposta com itens, prazo, total e um link para o cliente responder. Você passa mais confiança e sabe o que foi combinado.
                        </p>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <CampaignRegisterLink campaign={CAMPAIGN} content="hero_primary" queryString={queryString} className={ctaClass}>
                                Criar meu orçamento profissional
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
                                Cliente responde pelo link
                            </span>
                        </div>
                    </div>

                    <div className="mt-12 grid gap-3 border-t border-white/10 pt-6 text-sm text-zinc-300 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                            <p className="font-black text-white">Proposta organizada</p>
                            <p className="mt-1 text-zinc-400">Itens, valores, prazo e observações em um só lugar.</p>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                            <p className="font-black text-white">WhatsApp pronto</p>
                            <p className="mt-1 text-zinc-400">Mensagem com link para o cliente abrir no celular.</p>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                            <p className="font-black text-white">Resposta registrada</p>
                            <p className="mt-1 text-zinc-400">Aprovação, ajuste ou recusa ligados ao orçamento.</p>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                            <p className="font-black text-white">Sem ERP complexo</p>
                            <p className="mt-1 text-zinc-400">Foco na proposta e no próximo sim do cliente.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
                <div className="mx-auto max-w-7xl">
                    <div className="max-w-3xl">
                        <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">O custo do preço solto</p>
                        <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                            Seu cliente não deveria ter que adivinhar o que está incluído no valor.
                        </h2>
                        <p className="mt-5 text-base leading-7 text-zinc-400">
                            Uma proposta simples deixa o serviço mais fácil de entender e a conversa mais fácil de continuar, sem transformar sua rotina em um sistema pesado.
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

            <BeforeAfterComparisonSection
                campaign={CAMPAIGN}
                content="before_after_professional_quotes"
                industryLabel="sua empresa"
                queryString={queryString}
            />

            <section id="teste-logo" className="border-y border-white/10 bg-zinc-900 px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
                <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                    <div>
                        <p className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
                            <Sparkles className="h-4 w-4" />
                            Sua marca na proposta
                        </p>
                        <h2 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-4xl">
                            Faça o orçamento parecer parte da sua empresa.
                        </h2>
                        <p className="mt-5 text-base leading-7 text-zinc-400">
                            Envie sua logo para ver uma proposta com paleta, modelo e mensagem de WhatsApp mais alinhados à sua marca. Assim, o cliente recebe mais do que um preço: recebe uma apresentação clara do seu trabalho.
                        </p>
                        <div className="mt-8">
                            <Link href="#logo-demo-upload" className={ctaClass}>
                                Testar com minha logo
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>

                    <LogoDemoPlayground
                        compact
                        industryLabel="sua empresa"
                        title="Veja sua marca em uma proposta profissional."
                        subtitle="Teste sua logo e veja uma proposta ganhar paleta, visual e mensagem pronta para WhatsApp."
                        campaign={CAMPAIGN}
                        campaignContent="logo_demo_professional_quotes"
                        queryString={queryString}
                    />
                </div>
            </section>

            <section id="como-funciona" className="scroll-mt-24 border-y border-white/10 bg-white/[0.03] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
                <div className="mx-auto max-w-7xl">
                    <div className="max-w-3xl">
                        <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">Três passos para sair do improviso</p>
                        <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                            Do primeiro item ao retorno do cliente, sem planilha, PDF manual ou ERP.
                        </h2>
                        <p className="mt-5 text-base leading-7 text-zinc-400">
                            O Zacly cuida da parte que acontece entre montar a proposta e saber se ela avançou. Você continua focado no seu trabalho e na conversa com o cliente.
                        </p>
                    </div>

                    <div className="mt-10 grid gap-4 md:grid-cols-3">
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
                            Criar meu orçamento profissional
                            <ArrowRight className="h-4 w-4" />
                        </CampaignRegisterLink>
                    </div>
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
                        <h2 className="mt-5 text-2xl font-black text-white">O que o Zacly não tenta ser</h2>
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
                        A clareza da proposta ajuda seu cliente a decidir com confiança.
                    </h2>
                    <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-zinc-400">
                        Você não precisa de um sistema de gestão completo para deixar de enviar preço solto. Precisa de uma proposta que organize o combinado e deixe o próximo passo evidente.
                    </p>
                    <div className="mt-8 flex justify-center">
                        <CampaignRegisterLink campaign={CAMPAIGN} content="confidence_cta" queryString={queryString} className={ctaClass}>
                            Criar meu orçamento profissional
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
                    <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">Teste na sua próxima conversa</p>
                    <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
                        Crie agora o orçamento que você gostaria de enviar pelo WhatsApp.
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-zinc-300">
                        Comece com 5 propostas em 14 dias + 1 Amostra Pro. Veja sua marca, seus itens e a resposta do cliente organizados antes de assumir qualquer compromisso.
                    </p>
                    <div className="mt-8 flex justify-center">
                        <CampaignRegisterLink campaign={CAMPAIGN} content="final_cta" queryString={queryString} className={ctaClass}>
                            Criar meu orçamento profissional
                            <ArrowRight className="h-4 w-4" />
                        </CampaignRegisterLink>
                    </div>
                </div>
            </section>

            <MarketingFooter />
        </main>
    )
}
