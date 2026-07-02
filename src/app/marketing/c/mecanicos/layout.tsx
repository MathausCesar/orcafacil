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
        title: 'Zacly para mecanicos',
        description: 'Orcamentos profissionais para oficinas e mecanicos enviarem pelo WhatsApp com PDF e aprovacao do cliente.',
        images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Zacly para mecanicos' }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Zacly para mecanicos',
        description: 'Orcamentos em PDF, WhatsApp e aprovacao para oficinas e mecanicos.',
        images: ['/og-image.png'],
    },
}

export default function MecanicosLayout({ children }: { children: ReactNode }) {
    return children
}
