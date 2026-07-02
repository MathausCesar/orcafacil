import type { Metadata } from 'next'
import { PricingSection } from '@/components/marketing/pricing-section'
import { SeoPageLayout, SectionBlock } from '@/components/marketing/seo-page-layout'
import { SEO_BASE_URL } from '@/lib/seo-site-content'

export const metadata: Metadata = {
    title: 'Precos do Zacly | Plano gratis e planos Pro',
    description: 'Veja os planos da Zacly para criar orcamentos profissionais. Comece gratis, sem cartao, e evolua para propostas sem marca Zacly.',
    alternates: { canonical: `${SEO_BASE_URL}/precos` },
    openGraph: {
        type: 'website',
        locale: 'pt_BR',
        url: `${SEO_BASE_URL}/precos`,
        siteName: 'Zacly',
        title: 'Precos do Zacly',
        description: 'Comece gratis e evolua para propostas profissionais sem marca Zacly.',
        images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Precos do Zacly' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Precos do Zacly',
        description: 'Plano gratis para comecar e planos Pro para vender com sua marca.',
        images: ['/og-image.png'],
    },
}

export default function PrecosPage() {
    return (
        <SeoPageLayout
            eyebrow="Planos Zacly"
            title="Comece gratis e destrave a personalizacao quando ela virar necessidade."
            description="O plano gratis ajuda o autonomo a testar a rotina. Os planos Pro liberam mais volume, identidade visual, modelos e mensagens personalizadas."
        >
            <PricingSection />

            <SectionBlock
                eyebrow="Quando faz sentido pagar"
                title="O plano pago entra quando o orcamento vira parte da sua venda."
                description="Para quem envia proposta com frequencia, a marca propria, a mensagem personalizada e os modelos liberados ajudam a transmitir mais confianca ao cliente."
            >
                <div className="grid gap-4 md:grid-cols-3">
                    {[
                        'Remover a marca Zacly das propostas.',
                        'Usar modelos visuais alem do profissional.',
                        'Personalizar a mensagem de envio pelo WhatsApp.',
                    ].map((item) => (
                        <div key={item} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
                            <p className="text-sm font-semibold leading-6 text-zinc-300">{item}</p>
                        </div>
                    ))}
                </div>
            </SectionBlock>
        </SeoPageLayout>
    )
}
