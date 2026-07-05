import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import {
    AlertTriangle,
    ArrowRight,
    Check,
    CheckCircle2,
    ClipboardCheck,
    Clock3,
    FileText,
    Gauge,
    MessageCircle,
    ShieldCheck,
    Sparkles,
    Wrench,
    XCircle,
} from "lucide-react"

import { MarketingFooter } from "@/components/marketing/marketing-footer"
import { CampaignRegisterLink } from "@/components/marketing/campaign-register-link"
import { LogoDemoPlayground } from "@/components/marketing/logo-demo-playground"

const CAMPAIGN = "sniper_mecanicos"
const BASE_URL = "https://www.zacly.com.br/c/mecanicos"
const PAGE_DESCRIPTION =
    "Crie orcamentos profissionais para oficina mecanica, envie pelo WhatsApp e acompanhe a aprovacao do cliente sem virar um ERP complexo."

const ctaClass =
    "inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-emerald-400 px-7 text-sm font-black text-zinc-950 shadow-[0_16px_40px_rgba(52,211,153,0.25)] transition hover:bg-emerald-300 sm:w-auto"

const secondaryCtaClass =
    "inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-white/15 px-6 text-sm font-bold text-white transition hover:bg-white/10 sm:w-auto"

const painCards = [
    {
        icon: AlertTriangle,
        title: "Preço solto vira pechincha",
        text: "Quando a oficina manda so um valor no WhatsApp, o cliente enxerga preco, nao escopo, peca, mao de obra e garantia.",
    },
    {
        icon: Wrench,
        title: "Peça e serviço ficam misturados",
        text: "Pastilha, oleo, filtro, bateria, diagnostico e mao de obra acabam no mesmo texto. A duvida do cliente trava a aprovacao.",
    },
    {
        icon: ClipboardCheck,
        title: "Aprovacao informal da retrabalho",
        text: "Depois do carro pronto, fica dificil provar o que foi aprovado quando tudo estava em audio, papel ou conversa perdida.",
    },
]

const workflow = [
    {
        icon: FileText,
        title: "Monte a proposta",
        text: "Inclua cliente, servicos, pecas, prazo e condicoes sem montar documento do zero.",
    },
    {
        icon: MessageCircle,
        title: "Envie pelo WhatsApp",
        text: "O cliente recebe uma mensagem pronta com link seguro para abrir no celular.",
    },
    {
        icon: ShieldCheck,
        title: "Cliente aprova no link",
        text: "A decisao fica registrada na proposta, sem depender de resposta solta no chat.",
    },
    {
        icon: Gauge,
        title: "Acompanhe o andamento",
        text: "Veja o que esta em rascunho, enviado, aprovado, em execucao e concluido.",
    },
]

const goodFit = [
    "Mecanico autonomo que fecha pelo WhatsApp",
    "Oficina pequena que ainda usa caderno, papel ou planilha",
    "Autoeletrica, suspensao, freios, revisao e troca de pecas",
    "Quem precisa parecer mais organizado sem contratar sistema grande",
]

const badFit = [
    "Quem procura emissor de nota fiscal",
    "Quem precisa de ERP completo para compras e financeiro avancado",
    "Oficina grande que ja opera com sistema robusto de OS",
    "Quem quer controle complexo de estoque e integracao com fornecedores",
]

const faq = [
    {
        question: "O Zacly substitui um ERP de oficina?",
        answer: "Nao. A proposta desta campanha e ajudar oficinas pequenas a criar orcamentos profissionais, enviar pelo WhatsApp e registrar a aprovacao do cliente. Nota fiscal, compras complexas e ERP completo ficam fora do foco.",
    },
    {
        question: "Consigo separar peca e mao de obra?",
        answer: "Sim. Voce pode colocar pecas, servicos, quantidades, valores e observacoes para o cliente entender melhor o total antes de aprovar.",
    },
    {
        question: "O cliente precisa criar conta para aprovar?",
        answer: "Nao. Ele abre o link publico da proposta e decide se aprova, recusa ou pede ajuste.",
    },
    {
        question: "Funciona pelo celular dentro da oficina?",
        answer: "Sim. O Zacly foi pensado para ser usado pelo navegador do celular, sem depender de computador no balcao.",
    },
]

export const metadata: Metadata = {
    title: "Orcamento para oficina mecanica pelo WhatsApp | Zacly",
    description: PAGE_DESCRIPTION,
    keywords: [
        "orcamento oficina mecanica",
        "app para mecanico autonomo",
        "sistema simples para oficina mecanica",
        "orcamento oficina pelo whatsapp",
        "orcamento com logo da oficina",
        "ordem de servico oficina simples",
    ],
    alternates: {
        canonical: BASE_URL,
    },
    openGraph: {
        title: "Orcamento profissional para oficina mecanica | Zacly",
        description:
            "Transforme preco solto no WhatsApp em proposta com pecas, mao de obra, prazo e link de aprovacao.",
        url: BASE_URL,
        siteName: "Zacly",
        locale: "pt_BR",
        type: "website",
        images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Zacly para oficinas mecanicas" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "Orcamento para oficina mecanica pelo WhatsApp | Zacly",
        description: "Proposta profissional com aprovacao por link para pequenas oficinas.",
        images: ["/og-image.png"],
    },
}

export default function MechanicLandingPage() {
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
            audienceType: "mecanicos autonomos e pequenas oficinas",
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
                    <Link href="/" className="relative h-10 w-32" aria-label="Pagina inicial da Zacly">
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
                            <Wrench className="h-4 w-4" />
                            Para mecanicos autonomos e oficinas pequenas
                        </p>

                        <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                            Orcamento profissional para oficina mecanica, sem virar ERP.
                        </h1>

                        <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300 sm:text-xl">
                            Pare de mandar preco solto no WhatsApp. Crie uma proposta com pecas, mao de obra, prazo, total e link de aprovacao para o cliente fechar com mais confianca.
                        </p>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <CampaignRegisterLink campaign={CAMPAIGN} content="hero_primary" className={ctaClass}>
                                Criar meu primeiro orcamento gratis
                                <ArrowRight className="h-4 w-4" />
                            </CampaignRegisterLink>
                            <Link href="#como-funciona" className={secondaryCtaClass}>
                                Ver como funciona
                            </Link>
                        </div>

                        <div className="mt-5 flex flex-wrap gap-3 text-sm text-zinc-300">
                            <span className="inline-flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                                Sem cartao no cadastro
                            </span>
                            <span className="inline-flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                                Feito para usar no celular
                            </span>
                            <span className="inline-flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                                Cliente aprova pelo link
                            </span>
                        </div>
                    </div>

                    <div className="mt-12 grid gap-3 border-t border-white/10 pt-6 text-sm text-zinc-300 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                            <p className="font-black text-white">Pecas + mao de obra</p>
                            <p className="mt-1 text-zinc-400">Separe o que esta incluso no valor.</p>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                            <p className="font-black text-white">WhatsApp pronto</p>
                            <p className="mt-1 text-zinc-400">Mensagem com link de aprovacao.</p>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                            <p className="font-black text-white">Pipeline simples</p>
                            <p className="mt-1 text-zinc-400">Rascunho, enviado, aprovado e concluido.</p>
                        </div>
                        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                            <p className="font-black text-white">Sem promessa de ERP</p>
                            <p className="mt-1 text-zinc-400">Foco em vender melhor o servico.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
                <div className="mx-auto max-w-7xl">
                    <div className="max-w-3xl">
                        <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">A dor que vamos atacar</p>
                        <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                            O problema nao e so o cliente achar caro. E ele nao entender o que esta comprando.
                        </h2>
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

            <section className="border-y border-white/10 bg-zinc-900 px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
                <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                    <div>
                        <p className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-emerald-300">
                            <Sparkles className="h-4 w-4" />
                            Identidade da oficina
                        </p>
                        <h2 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-4xl">
                            A proposta sai com a cara da sua oficina.
                        </h2>
                        <p className="mt-5 text-base leading-7 text-zinc-400">
                            Ao enviar sua logo, o Zacly identifica uma cor de marca e usa isso para orientar o visual da proposta. O cliente recebe algo com aparencia de empresa, nao apenas uma mensagem de preco.
                        </p>
                        <div className="mt-8">
                            <CampaignRegisterLink campaign={CAMPAIGN} content="logo_identity_cta" className={ctaClass}>
                                Testar com minha logo
                                <ArrowRight className="h-4 w-4" />
                            </CampaignRegisterLink>
                        </div>
                    </div>

                    <LogoDemoPlayground
                        compact
                        industryLabel="oficina mecanica"
                        title="Veja sua oficina em uma proposta."
                        subtitle="Teste a logo da oficina e veja a proposta nascer com paleta, modelo e mensagem pronta para WhatsApp."
                        campaignContent="logo_demo_mecanicos"
                    />
                </div>
            </section>

            <section id="como-funciona" className="border-y border-white/10 bg-white/[0.03] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
                <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
                    <div>
                        <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">Como o Zacly entra na rotina</p>
                        <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                            Uma proposta clara em vez de um texto comprido no WhatsApp.
                        </h2>
                        <p className="mt-5 text-base leading-7 text-zinc-400">
                            O foco da campanha e simples: ajudar a oficina pequena a vender melhor o servico que ela ja faz, sem prometer emissao fiscal, compras ou financeiro complexo.
                        </p>
                        <div className="mt-8">
                            <CampaignRegisterLink campaign={CAMPAIGN} content="workflow_cta" className={ctaClass}>
                                Testar com um orcamento real
                                <ArrowRight className="h-4 w-4" />
                            </CampaignRegisterLink>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        {workflow.map((item, index) => (
                            <article key={item.title} className="rounded-lg border border-white/10 bg-zinc-950 p-5">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-400/10 text-emerald-300">
                                    <item.icon className="h-5 w-5" />
                                </div>
                                <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-zinc-500">Passo {index + 1}</p>
                                <h3 className="mt-2 text-lg font-black text-white">{item.title}</h3>
                                <p className="mt-3 text-sm leading-6 text-zinc-400">{item.text}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>

            <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
                <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
                    <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/[0.08] p-6">
                        <Check className="h-7 w-7 text-emerald-300" />
                        <h2 className="mt-5 text-2xl font-black text-white">Bom encaixe para</h2>
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
                        <h2 className="mt-5 text-2xl font-black text-white">Nao e a promessa desta campanha</h2>
                        <ul className="mt-6 space-y-3">
                            {badFit.map((item) => (
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
                    <Clock3 className="mx-auto h-8 w-8 text-emerald-300" />
                    <h2 className="mt-5 text-3xl font-black tracking-tight text-white sm:text-4xl">
                        Seu cliente nao compara so preco. Ele compara confianca.
                    </h2>
                    <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-zinc-400">
                        Essa e a mensagem central da campanha. A oficina continua simples, mas passa a enviar um orcamento com escopo, valor e aprovacao claros.
                    </p>
                    <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                        <CampaignRegisterLink campaign={CAMPAIGN} content="trust_cta" className={ctaClass}>
                            Criar proposta profissional agora
                            <ArrowRight className="h-4 w-4" />
                        </CampaignRegisterLink>
                    </div>
                </div>
            </section>

            <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
                <div className="mx-auto max-w-5xl">
                    <h2 className="text-3xl font-black tracking-tight text-white">Duvidas antes de testar</h2>
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

            <section className="px-4 pb-20 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-5xl rounded-lg border border-white/10 bg-white/[0.04] px-6 py-10 text-center sm:px-10">
                    <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-300">Primeiro teste gratis</p>
                    <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
                        Crie um orcamento de oficina como se fosse enviar para um cliente agora.
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-zinc-400">
                        Se fizer sentido para a sua rotina, o plano pago entra quando voce precisar de mais propostas, personalizacao e controle.
                    </p>
                    <div className="mt-8 flex justify-center">
                        <CampaignRegisterLink campaign={CAMPAIGN} content="final_cta" className={ctaClass}>
                            Comecar pelo primeiro orcamento
                            <ArrowRight className="h-4 w-4" />
                        </CampaignRegisterLink>
                    </div>
                </div>
            </section>

            <MarketingFooter />
        </main>
    )
}
