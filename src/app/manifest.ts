import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'OrçaFácil - Orçamentos Profissionais',
        short_name: 'OrçaFácil',
        description: 'Crie orçamentos profissionais em segundos.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#0D9B5C',
        icons: [
            {
                src: '/icon-192x192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}
