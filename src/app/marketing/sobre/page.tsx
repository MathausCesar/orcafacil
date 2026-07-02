import type { Metadata } from 'next'
import { CheckCircle2 } from 'lucide-react'
import { SeoPageLayout, SectionBlock } from '@/components/marketing/seo-page-layout'
import { SEO_BASE_URL } from '@/lib/seo-site-content'

export const metadata: Metadata = {
    title: 'Sobre a Zacly | App de orcamentos para autonomos',
    description: 'Conheca a Zacly, plataforma criada para ajudar autonomos e prestadores a sair do papel e vender servicos com propostas profissionais.',
    alternates: { canonical: `${SEO_BASE_URL}/sobre` },
}

const principles = [
    'Ajudar o prestador a parecer tao profissional quanto o servico que entrega.',
    'Manter a rotina simples para quem trabalha sozinho ou em equipe pequena.',
    'Transformar orcamento em proposta clara, aprovada pelo cliente e facil de acompanhar.',
]

export default function SobrePage() {
    return (
        <SeoPageLayout
            eyebrow="Sobre a Zacly"
            title="A Zacly existe para tirar o orcamento do papel, sem complicar a vida do autonomo."
            description="O produto foi criado para mecanicos, marceneiros, eletricistas, pintores, tecnicos e prestadores que vendem servico todos os dias pelo celular."
        >
            <SectionBlock
                eyebrow="Nossa visao"
                title="Organizacao comercial para quem hoje resolve tudo no WhatsApp."
                description="Muitos autonomos fazem bom trabalho, mas perdem venda quando apresentam preco de forma improvisada. O Zacly organiza cliente, proposta, envio e aprovacao em um fluxo simples."
            >
                <div className="grid gap-4 md:grid-cols-3">
                    {principles.map((principle) => (
                        <div key={principle} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                            <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                            <p className="mt-4 text-sm font-semibold leading-6 text-zinc-300">{principle}</p>
                        </div>
                    ))}
                </div>
            </SectionBlock>
        </SeoPageLayout>
    )
}
