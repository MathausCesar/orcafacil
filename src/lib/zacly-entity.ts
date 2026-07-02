import { SEO_BASE_URL } from '@/lib/seo-site-content'

export const ZACLY_ENTITY = {
    name: 'Zacly',
    legalName: 'Zacly',
    alternateName: ['Zacly App', 'Zacly Orcamentos', 'App Zacly', 'Zacly Propostas'],
    url: SEO_BASE_URL,
    appUrl: 'https://app.zacly.com.br',
    logo: `${SEO_BASE_URL}/logo/logo.png`,
    icon: `${SEO_BASE_URL}/logo/zacly_icone.png`,
    foundingDate: '2026',
    email: 'suporte@zacly.com.br',
    description:
        'Zacly e uma plataforma brasileira para autonomos e pequenos prestadores criarem orcamentos profissionais em PDF, enviarem pelo WhatsApp e acompanharem a aprovacao do cliente.',
    audience:
        'Autonomos, MEIs, mecanicos, marceneiros, eletricistas, pintores, assistencias tecnicas e pequenos prestadores de servico.',
    sameAs: [] as string[],
}

export function buildZaclyOrganizationJsonLd() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: ZACLY_ENTITY.name,
        legalName: ZACLY_ENTITY.legalName,
        alternateName: ZACLY_ENTITY.alternateName,
        url: ZACLY_ENTITY.url,
        logo: ZACLY_ENTITY.logo,
        image: ZACLY_ENTITY.logo,
        foundingDate: ZACLY_ENTITY.foundingDate,
        email: ZACLY_ENTITY.email,
        description: ZACLY_ENTITY.description,
        contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer support',
            email: ZACLY_ENTITY.email,
            availableLanguage: 'pt-BR',
            areaServed: 'BR',
        },
        areaServed: {
            '@type': 'Country',
            name: 'BR',
        },
        knowsAbout: [
            'orcamento profissional',
            'proposta comercial',
            'orcamento em PDF',
            'orcamento pelo WhatsApp',
            'aprovacao de orcamento online',
            'gestao simples para autonomos',
        ],
        ...(ZACLY_ENTITY.sameAs.length > 0 ? { sameAs: ZACLY_ENTITY.sameAs } : {}),
    }
}

export function buildZaclyWebSiteJsonLd() {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: ZACLY_ENTITY.name,
        alternateName: ZACLY_ENTITY.alternateName,
        url: ZACLY_ENTITY.url,
        inLanguage: 'pt-BR',
        publisher: {
            '@type': 'Organization',
            name: ZACLY_ENTITY.name,
            url: ZACLY_ENTITY.url,
            logo: ZACLY_ENTITY.logo,
        },
    }
}

export function buildZaclySoftwareJsonLd() {
    return {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: ZACLY_ENTITY.name,
        alternateName: ZACLY_ENTITY.alternateName,
        url: ZACLY_ENTITY.url,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        description: ZACLY_ENTITY.description,
        audience: {
            '@type': 'Audience',
            audienceType: ZACLY_ENTITY.audience,
        },
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'BRL',
        },
        publisher: {
            '@type': 'Organization',
            name: ZACLY_ENTITY.name,
            url: ZACLY_ENTITY.url,
            logo: ZACLY_ENTITY.logo,
        },
    }
}
