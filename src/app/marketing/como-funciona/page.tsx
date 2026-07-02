import type { Metadata } from 'next'
import { CheckCircle2, MessageCircle, UserRoundPlus, Wrench } from 'lucide-react'
import { SectionBlock, SeoPageLayout } from '@/components/marketing/seo-page-layout'
import { SEO_BASE_URL } from '@/lib/seo-site-content'

export const metadata: Metadata = {
    title: 'Como funciona o Zacly | Do cliente ao orcamento aprovado',
    description: 'Veja como cadastrar cliente, montar proposta, enviar pelo WhatsApp e acompanhar aprovacao no Zacly.',
    alternates: { canonical: `${SEO_BASE_URL}/como-funciona` },
}

const steps = [
    {
        icon: UserRoundPlus,
        title: 'Cadastre o cliente',
        body: 'Comece pelo nome e telefone. No primeiro acesso, o Zacly guia o usuario para cadastrar cliente antes da proposta.',
    },
    {
        icon: Wrench,
        title: 'Monte os itens',
        body: 'Adicione servicos, produtos, quantidades, prazo, pagamento e observacoes importantes.',
    },
    {
        icon: MessageCircle,
        title: 'Envie pelo WhatsApp',
        body: 'O Zacly gera o link de aprovacao e abre o WhatsApp com uma mensagem pronta.',
    },
    {
        icon: CheckCircle2,
        title: 'Acompanhe o status',
        body: 'Veja se a proposta foi enviada, aprovada, recusada ou se precisa de ajuste.',
    },
]

export default function ComoFuncionaPage() {
    return (
        <SeoPageLayout
            eyebrow="Como funciona"
            title="Do primeiro cliente ao orcamento aprovado em um fluxo simples."
            description="O Zacly foi pensado para autonomos que precisam vender servicos com mais organizacao, sem virar refem de sistema complexo."
        >
            <SectionBlock title="Quatro passos para sair do improviso." eyebrow="Fluxo Zacly">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {steps.map((step, index) => {
                        const Icon = step.icon

                        return (
                            <div key={step.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                                <div className="flex items-center justify-between">
                                    <Icon className="h-7 w-7 text-emerald-400" />
                                    <span className="font-mono text-sm font-black text-zinc-600">0{index + 1}</span>
                                </div>
                                <h2 className="mt-6 text-xl font-black text-white">{step.title}</h2>
                                <p className="mt-3 text-sm leading-6 text-zinc-400">{step.body}</p>
                            </div>
                        )
                    })}
                </div>
            </SectionBlock>
        </SeoPageLayout>
    )
}
