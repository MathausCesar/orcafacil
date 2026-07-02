import type { Metadata } from 'next'
import { BadgeCheck, FileText, MessageCircle, Palette, Package, Workflow } from 'lucide-react'
import { SeoPageLayout, SectionBlock } from '@/components/marketing/seo-page-layout'
import { SEO_BASE_URL } from '@/lib/seo-site-content'

export const metadata: Metadata = {
    title: 'Recursos do Zacly | Orcamentos, PDF, WhatsApp e aprovacao',
    description: 'Conheca os recursos do Zacly para criar orcamentos profissionais, enviar pelo WhatsApp, aprovar por link e acompanhar propostas.',
    alternates: { canonical: `${SEO_BASE_URL}/recursos` },
}

const features = [
    {
        icon: FileText,
        title: 'Propostas profissionais',
        body: 'Monte orcamentos com cliente, itens, prazo, condicoes, total e link de aprovacao.',
    },
    {
        icon: MessageCircle,
        title: 'Envio pelo WhatsApp',
        body: 'Abra o WhatsApp com uma mensagem pronta e o link seguro da proposta.',
    },
    {
        icon: BadgeCheck,
        title: 'Aprovacao do cliente',
        body: 'O cliente aprova, recusa ou pede ajuste pelo link. O prestador nao aprova por ele.',
    },
    {
        icon: Workflow,
        title: 'Pipeline de orcamentos',
        body: 'Acompanhe propostas em rascunho, enviadas, aprovadas, recusadas e em andamento.',
    },
    {
        icon: Package,
        title: 'Produtos e servicos',
        body: 'Cadastre itens simples para montar orcamentos mais rapido sem partir de tela vazia.',
    },
    {
        icon: Palette,
        title: 'Modelos e identidade visual',
        body: 'Planos pagos liberam modelos, cores, fontes e mensagem personalizada para cada operacao.',
    },
]

export default function RecursosPage() {
    return (
        <SeoPageLayout
            eyebrow="Recursos Zacly"
            title="Tudo que um autonomo precisa para sair do orcamento improvisado."
            description="O Zacly une proposta, WhatsApp, aprovacao, pipeline e cadastro simples em uma rotina feita para prestadores que vendem servicos todos os dias."
        >
            <SectionBlock
                eyebrow="Produto"
                title="Recursos pensados para quem hoje usa papel, bloco de notas ou mensagem solta."
                description="A ideia nao e virar um ERP. E deixar o processo de vender servico mais profissional sem complicar a rotina."
            >
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {features.map((feature) => {
                        const Icon = feature.icon

                        return (
                            <div key={feature.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                                <Icon className="h-7 w-7 text-emerald-400" />
                                <h2 className="mt-5 text-xl font-black text-white">{feature.title}</h2>
                                <p className="mt-3 text-sm leading-6 text-zinc-400">{feature.body}</p>
                            </div>
                        )
                    })}
                </div>
            </SectionBlock>
        </SeoPageLayout>
    )
}
