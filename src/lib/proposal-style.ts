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
}

export const PROPOSAL_TONE_INTRO: Record<VisualToneId, string> = {
    balanced: 'Escopo, valores e condicoes organizados para decisao rapida. A aprovacao deve ser feita pelo link publico enviado ao cliente.',
    formal: 'Documento comercial estruturado com escopo, condicoes e investimento para uma decisao segura do cliente.',
    creative: 'Uma proposta clara, visual e personalizada para apresentar o servico com mais presenca e confianca.',
}

export function normalizeProposalModel(value: string | null | undefined): ProposalModelId {
    return PROPOSAL_MODELS.some(model => model.id === value)
        ? value as ProposalModelId
        : 'professional'
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
        visualTone: 'balanced',
        footerText: '',
        quoteFont: normalizeProposalFont(fallbackFont),
        whatsappMessageTemplate: '',
    }

    if (!raw) return fallback

    try {
        const value = typeof raw === 'string' ? JSON.parse(raw) : raw
        if (!value || typeof value !== 'object' || Array.isArray(value)) return fallback

        const record = value as Record<string, unknown>

        return {
            visualTone: normalizeVisualTone(typeof record.visualTone === 'string' ? record.visualTone : undefined),
            footerText: typeof record.footerText === 'string' ? record.footerText.trim() : '',
            quoteFont: normalizeProposalFont(
                typeof record.quote_font_family === 'string' ? record.quote_font_family : fallbackFont,
            ),
            whatsappMessageTemplate: typeof record.whatsappMessageTemplate === 'string'
                ? record.whatsappMessageTemplate.trim()
                : '',
        }
    } catch {
        return fallback
    }
}
