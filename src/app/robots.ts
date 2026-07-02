import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = 'https://www.zacly.com.br'

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/',
                    '/app/',
                    '/marketing',
                    '/marketing/',
                    '/private/',
                    '/admin/',
                    '/login',
                    '/register',
                    '/forgot-password',
                    '/update-password',
                    '/quotes',
                    '/new',
                    '/clients',
                    '/catalog',
                    '/profile',
                    '/pricing',
                    '/onboarding',
                ],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
        host: baseUrl,
    }
}
