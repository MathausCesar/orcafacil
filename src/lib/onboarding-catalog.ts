import {
    ProfessionalContextId,
    normalizeProfessionalContext,
} from '@/lib/professional-context'

export type OnboardingPricingTier = 'autonomous' | 'standard' | 'premium'

export type OnboardingSpecialty = {
    label: string
    value: string
    professionalContext?: ProfessionalContextId
}

export type OnboardingQuoteSettings = {
    categoryId: string
    categorySlug: string
    categoryName: string
    specialties: string[]
    pricingTier: OnboardingPricingTier
    professionalContext: ProfessionalContextId
    completedAt: string
}

export type QuoteSettingsWithOnboarding = {
    onboarding?: Partial<OnboardingQuoteSettings>
}

export const ONBOARDING_SPECIALTIES_BY_CATEGORY: Record<string, OnboardingSpecialty[]> = {
    auto: [
        { label: 'Mecanica Geral', value: 'mecanica_geral', professionalContext: 'mechanic' },
        { label: 'Auto Eletrica', value: 'eletrica', professionalContext: 'electrician' },
        { label: 'Funilaria e Pintura', value: 'funilaria', professionalContext: 'mechanic' },
        { label: 'Estetica Automotiva', value: 'estetica', professionalContext: 'mechanic' },
        { label: 'Suspensao e Freios', value: 'freios', professionalContext: 'mechanic' },
        { label: 'Som e Acessorios', value: 'som', professionalContext: 'mechanic' },
    ],
    construction: [
        { label: 'Pedreiro / Alvenaria', value: 'pedreiro', professionalContext: 'construction' },
        { label: 'Pintura e Acabamento', value: 'pintor', professionalContext: 'painter' },
        { label: 'Marido de Aluguel', value: 'marido_aluguel', professionalContext: 'construction' },
        { label: 'Gesso e Drywall', value: 'gesso', professionalContext: 'construction' },
        { label: 'Telhados e Coberturas', value: 'telhado', professionalContext: 'construction' },
    ],
    tech: [
        { label: 'Eletricista Residencial', value: 'eletricista', professionalContext: 'electrician' },
        { label: 'Ar Condicionado', value: 'ar_condicionado', professionalContext: 'hvac' },
        { label: 'Informatica / TI', value: 'ti', professionalContext: 'tech' },
        { label: 'Seguranca Eletronica', value: 'seguranca', professionalContext: 'tech' },
    ],
    beauty: [
        { label: 'Cabeleireiro(a)', value: 'cabelo', professionalContext: 'beauty' },
        { label: 'Barbearia', value: 'barbearia', professionalContext: 'beauty' },
        { label: 'Manicure / Pedicure', value: 'unhas', professionalContext: 'beauty' },
        { label: 'Estetica Facial/Corporal', value: 'estetica', professionalContext: 'beauty' },
    ],
    education: [
        { label: 'Professor Particular', value: 'professor', professionalContext: 'general' },
        { label: 'Personal Trainer', value: 'personal', professionalContext: 'general' },
        { label: 'Consultoria', value: 'consultoria', professionalContext: 'general' },
    ],
    food: [
        { label: 'Salgados e Doces', value: 'salgados', professionalContext: 'food' },
        { label: 'Confeitaria', value: 'confeitaria', professionalContext: 'food' },
        { label: 'Buffet Completo', value: 'buffet', professionalContext: 'food' },
        { label: 'Servicos Extras', value: 'servicos', professionalContext: 'food' },
        { label: 'Decoracao de Eventos', value: 'decoracao', professionalContext: 'food' },
    ],
    design: [
        { label: 'Fachadas e Letreiros', value: 'fachadas', professionalContext: 'design' },
        { label: 'Adesivos e Envelopamento', value: 'adesivos', professionalContext: 'design' },
        { label: 'Placas e ACM', value: 'acm', professionalContext: 'design' },
        { label: 'Letras Caixa e Luminosos', value: 'letreiros', professionalContext: 'design' },
        { label: 'Banners e Impressao Digital', value: 'banners', professionalContext: 'design' },
        { label: 'Identidade Visual e Logotipos', value: 'identidade_visual', professionalContext: 'design' },
        { label: 'Artes Digitais e Redes Sociais', value: 'digital', professionalContext: 'design' },
        { label: 'Sinalizacao e Totens', value: 'sinalizacao', professionalContext: 'design' },
        { label: 'Envelopamento de Frotas', value: 'frotas', professionalContext: 'design' },
        { label: 'Impressos', value: 'impressos', professionalContext: 'design' },
    ],
    outros: [
        { label: 'Servicos Gerais', value: 'geral', professionalContext: 'general' },
        { label: 'Consultoria Especializada', value: 'consultoria_especializada', professionalContext: 'general' },
        { label: 'Atendimento ou Suporte', value: 'atendimento', professionalContext: 'general' },
        { label: 'Outras Especialidades', value: 'outras_especialidades', professionalContext: 'general' },
    ],
}

export const PRICING_TIER_COPY: Record<OnboardingPricingTier, {
    title: string
    description: string
    shortLabel: string
}> = {
    autonomous: {
        title: 'Preco competitivo',
        description: 'Quero comecar com valores mais acessiveis para fechar os primeiros servicos.',
        shortLabel: 'Competitivo',
    },
    standard: {
        title: 'Preco de mercado',
        description: 'Quero uma base equilibrada para cobrar de forma simples e profissional.',
        shortLabel: 'Mercado',
    },
    premium: {
        title: 'Servico premium',
        description: 'Tenho entrega mais completa e quero sugerir valores mais altos.',
        shortLabel: 'Premium',
    },
}

export function getSpecialtiesForCategory(slug: string | null | undefined) {
    return ONBOARDING_SPECIALTIES_BY_CATEGORY[slug || ''] || []
}

export function getDefaultProfessionalContext(categorySlug: string | null | undefined, specialties: string[]) {
    const options = getSpecialtiesForCategory(categorySlug)
    const selected = options.find((option) => specialties.includes(option.value) && option.professionalContext)

    if (selected?.professionalContext) {
        return selected.professionalContext
    }

    const fallbackByCategory: Record<string, ProfessionalContextId> = {
        auto: 'mechanic',
        construction: 'construction',
        tech: 'tech',
        beauty: 'beauty',
        food: 'food',
        design: 'design',
    }

    return fallbackByCategory[categorySlug || ''] || 'general'
}

export function parseOnboardingQuoteSettings(raw: unknown): Partial<OnboardingQuoteSettings> | null {
    if (!raw) return null

    try {
        const value = typeof raw === 'string' ? JSON.parse(raw) : raw
        if (!value || typeof value !== 'object') return null

        const record = value as QuoteSettingsWithOnboarding
        const onboarding = record.onboarding
        if (!onboarding || typeof onboarding !== 'object') return null

        return {
            ...onboarding,
            professionalContext: normalizeProfessionalContext(onboarding.professionalContext),
        }
    } catch {
        return null
    }
}
