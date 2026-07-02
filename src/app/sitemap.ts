import { MetadataRoute } from 'next'
import { SEO_PROFESSION_PAGES } from '@/lib/seo-profession-pages'
import {
    SEO_BASE_URL,
    SEO_COMMERCIAL_PAGES,
    SEO_GUIDE_ARTICLES,
    SEO_MODEL_PAGES,
    SEO_STATIC_PAGES,
} from '@/lib/seo-site-content'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = SEO_BASE_URL
    const lastModified = new Date('2026-07-02T00:00:00.000Z')

    return [
        {
            url: baseUrl,
            lastModified,
            changeFrequency: 'weekly',
            priority: 1,
        },
        ...SEO_STATIC_PAGES.map((page) => ({
            url: `${baseUrl}${page.path}`,
            lastModified,
            changeFrequency: 'weekly' as const,
            priority: page.priority,
        })),
        {
            url: `${baseUrl}/c/mecanicos`,
            lastModified,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        ...SEO_PROFESSION_PAGES.map((page) => ({
            url: `${baseUrl}/c/${page.slug}`,
            lastModified,
            changeFrequency: 'monthly' as const,
            priority: page.slug === 'prestadores-autonomos' ? 0.85 : 0.75,
        })),
        ...SEO_COMMERCIAL_PAGES.map((page) => ({
            url: `${baseUrl}/${page.slug}`,
            lastModified,
            changeFrequency: 'monthly' as const,
            priority: 0.9,
        })),
        ...SEO_MODEL_PAGES.map((page) => ({
            url: `${baseUrl}/modelos/${page.slug}`,
            lastModified,
            changeFrequency: 'monthly' as const,
            priority: 0.72,
        })),
        ...SEO_GUIDE_ARTICLES.map((article) => ({
            url: `${baseUrl}/blog/${article.slug}`,
            lastModified,
            changeFrequency: 'monthly' as const,
            priority: 0.7,
        })),
    ]
}
