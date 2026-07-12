import { parseBrandKit } from '@/lib/brand-kit'

export const PROPOSAL_MODELS = [
    {
        id: 'modern',
        name: 'Moderno',
        description: 'Leve, limpo e com destaque de cor.',
    },
    {
        id: 'professional',
        name: 'Profissional',
        description: 'Sólido, direto e ideal para serviços técnicos.',
    },
    {
        id: 'classic',
        name: 'Clássico',
        description: 'Formal, organizado e com sensação de documento.',
    },
    {
        id: 'minimalist',
        name: 'Minimalista',
        description: 'Poucos elementos e foco total no conteúdo.',
    },
    {
        id: 'agency',
        name: 'Agência',
        description: 'Mais visual, vibrante e comercial.',
    },
    {
        id: 'impact',
        name: 'Impacto',
        description: 'Contraste alto para propostas de maior presença.',
    },
] as const

export type ProposalModelId = typeof PROPOSAL_MODELS[number]['id']

export const FREE_PROPOSAL_MODEL: ProposalModelId = 'professional'
export const DEFAULT_PROPOSAL_ACCENT = '#0D9B5C'
const ACTIVE_SUBSCRIPTION_STATUSES = ['active', 'trialing'] as const
const PAID_PLAN_IDS = ['pro', 'pro_monthly', 'pro_yearly'] as const
export const LOCAL_PRO_TRIAL_PLAN = 'pro_trial' as const

export const VISUAL_TONES = [
    {
        id: 'balanced',
        name: 'Equilibrado',
        description: 'Visual versátil para a maioria dos clientes.',
    },
    {
        id: 'formal',
        name: 'Sóbrio',
        description: 'Mais institucional para negociações formais.',
    },
    {
        id: 'creative',
        name: 'Criativo',
        description: 'Mais expressivo sem perder organização.',
    },
] as const

export type VisualToneId = typeof VISUAL_TONES[number]['id']

export const PROPOSAL_FONTS = ['Inter', 'Roboto', 'Playfair Display', 'Montserrat'] as const

export type ProposalFont = typeof PROPOSAL_FONTS[number]

export type ProposalIdentitySettings = {
    visualTone: VisualToneId
    footerText: string
    quoteFont: ProposalFont
    whatsappMessageTemplate: string
    approvalAccentColor: string | null
    approvalTrustCopy: string
    brandPalette: string[]
}

export const DEFAULT_PROPOSAL_IDENTITY_SETTINGS: ProposalIdentitySettings = {
    visualTone: 'balanced',
    footerText: '',
    quoteFont: 'Inter',
    whatsappMessageTemplate: '',
    approvalAccentColor: null,
    approvalTrustCopy: 'Proposta organizada com escopo, prazo, valor e aprovacao segura.',
    brandPalette: [],
}

export const PROPOSAL_TONE_INTRO: Record<VisualToneId, string> = {
    balanced: 'Escopo, valores e condicoes organizados para decisao rapida. A aprovacao deve ser feita pelo link publico enviado ao cliente.',
    formal: 'Documento comercial estruturado com escopo, condicoes e investimento para uma decisao segura do cliente.',
    creative: 'Uma proposta clara, visual e personalizada para apresentar o servico com mais presenca e confianca.',
}

export function isActivePaidPlan(
    plan: string | null | undefined,
    subscriptionStatus?: string | null,
): boolean {
    // Local trials do not create a Stripe subscription. Callers receive this
    // synthetic entitlement from getEntitledPlan after its expiry is checked.
    if (plan === LOCAL_PRO_TRIAL_PLAN) {
        return subscriptionStatus === undefined || subscriptionStatus === 'trialing'
    }

    if (!plan || !PAID_PLAN_IDS.includes(plan as typeof PAID_PLAN_IDS[number])) return false

    if (subscriptionStatus === undefined) {
        return plan !== 'free'
    }

    return ACTIVE_SUBSCRIPTION_STATUSES.includes(subscriptionStatus as typeof ACTIVE_SUBSCRIPTION_STATUSES[number])
}

export function isLocalProTrialActive(
    trialEndsAt: string | null | undefined,
    now = new Date(),
): boolean {
    if (!trialEndsAt) return false

    const end = new Date(trialEndsAt)
    return Number.isFinite(end.getTime()) && end.getTime() > now.getTime()
}

export function getEntitledPlan(
    plan: string | null | undefined,
    subscriptionStatus?: string | null,
    trialEndsAt?: string | null,
): string {
    if (isActivePaidPlan(plan, subscriptionStatus)) return String(plan)
    return isLocalProTrialActive(trialEndsAt) ? LOCAL_PRO_TRIAL_PLAN : 'free'
}

export function isFreePlan(
    plan: string | null | undefined,
    subscriptionStatus?: string | null,
    trialEndsAt?: string | null,
): boolean {
    return !isActivePaidPlan(plan, subscriptionStatus) && !isLocalProTrialActive(trialEndsAt)
}

export function normalizeProposalModel(value: string | null | undefined): ProposalModelId {
    return PROPOSAL_MODELS.some(model => model.id === value)
        ? value as ProposalModelId
        : 'professional'
}

export function resolveProposalModelForPlan(
    plan: string | null | undefined,
    value: string | null | undefined,
): ProposalModelId {
    return isFreePlan(plan) ? FREE_PROPOSAL_MODEL : normalizeProposalModel(value)
}

export function normalizeVisualTone(value: string | null | undefined): VisualToneId {
    return VISUAL_TONES.some(tone => tone.id === value)
        ? value as VisualToneId
        : 'balanced'
}

export function normalizeProposalFont(value: string | null | undefined): ProposalFont {
    return PROPOSAL_FONTS.some(font => font === value)
        ? value as ProposalFont
        : 'Inter'
}

export function parseProposalIdentitySettings(
    raw: unknown,
    fallbackFont?: string | null,
): ProposalIdentitySettings {
    const fallback: ProposalIdentitySettings = {
        ...DEFAULT_PROPOSAL_IDENTITY_SETTINGS,
        quoteFont: normalizeProposalFont(fallbackFont),
    }

    if (!raw) return fallback

    try {
        const value = typeof raw === 'string' ? JSON.parse(raw) : raw
        if (!value || typeof value !== 'object' || Array.isArray(value)) return fallback

        const record = value as Record<string, unknown>
        const brandKit = parseBrandKit(record.brandKit)
        const whatsappMessageTemplate = typeof record.whatsappMessageTemplate === 'string'
            ? record.whatsappMessageTemplate.trim()
            : ''

        return {
            visualTone: normalizeVisualTone(typeof record.visualTone === 'string' ? record.visualTone : undefined),
            footerText: typeof record.footerText === 'string' ? record.footerText.trim() : '',
            quoteFont: normalizeProposalFont(
                typeof record.quote_font_family === 'string' ? record.quote_font_family : fallbackFont,
            ),
            whatsappMessageTemplate: whatsappMessageTemplate || brandKit?.whatsappMessageTemplate || '',
            approvalAccentColor: brandKit?.approvalPage.accentColor || brandKit?.accentColor || null,
            approvalTrustCopy: brandKit?.approvalPage.trustCopy || DEFAULT_PROPOSAL_IDENTITY_SETTINGS.approvalTrustCopy,
            brandPalette: brandKit?.palette || [],
        }
    } catch {
        return fallback
    }
}

export function applyProposalIdentityPlanLimits(
    settings: ProposalIdentitySettings,
    plan: string | null | undefined,
): ProposalIdentitySettings {
    if (!isFreePlan(plan)) return settings
    return DEFAULT_PROPOSAL_IDENTITY_SETTINGS
}
