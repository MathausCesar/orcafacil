import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Zacly - Orçamentos Profissionais',
        short_name: 'Zacly',
        description: 'Crie orçamentos profissionais em segundos.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#165952',
        icons: [
            {
                src: '/logo/zacly_icone.png',
                sizes: 'any',
                type: 'image/png',
            }
        ],
    }
}
