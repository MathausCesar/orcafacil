import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { SEO_BASE_URL } from '@/lib/seo-site-content'

export const metadata: Metadata = {
    alternates: {
        canonical: `${SEO_BASE_URL}/c/mecanicos`,
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
        url: `${SEO_BASE_URL}/c/mecanicos`,
        siteName: 'Zacly',
        title: 'Orcamento para oficina mecanica pelo WhatsApp | Zacly',
        description: 'Propostas profissionais para pequenas oficinas separarem pecas, mao de obra, prazo e aprovacao do cliente.',
        images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Zacly para oficinas mecanicas' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Orcamento para oficina mecanica pelo WhatsApp | Zacly',
        description: 'Crie proposta profissional com link de aprovacao para o cliente.',
        images: ['/og-image.png'],
    },
}

export default function MecanicosLayout({ children }: { children: ReactNode }) {
    return children
}
