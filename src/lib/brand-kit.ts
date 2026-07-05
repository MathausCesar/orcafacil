import type { LogoIdentityAnalysis } from '@/lib/color-extractor'
import type { ProposalModelId, VisualToneId } from '@/lib/proposal-style'

export type BrandKitChecklistItem = {
    id: string
    label: string
    status: 'ready' | 'review'
}

export type BrandKit = {
    version: 'brand-kit-v1'
    generatedAt: string
    source: 'logo-analysis'
    status: 'ready' | 'needs-review'
    accentColor: string
    primaryColor: string
    secondaryColor: string
    neutralDark: string
    neutralLight: string
    recommendedModel: ProposalModelId
    visualTone: VisualToneId
    styleLabel: string
    qualityLabel: string
    confidence: number
    palette: string[]
    whatsappMessageTemplate: string
    approvalPage: {
        accentColor: string
        logoPlacement: 'header'
        buttonTone: 'solid'
        trustCopy: string
    }
    checklist: BrandKitChecklistItem[]
    warnings: string[]
    strengths: string[]
}

export const DEFAULT_BRAND_KIT_MESSAGE_TEMPLATE =
    'Oi {cliente}, tudo bem? Aqui e {empresa}. Preparei sua proposta com escopo, prazo, validade e valor total ({total}) em um link seguro. Voce pode conferir e aprovar por aqui: {link}\n{validade_linha}'

function isRecord(value: unknown): value is Record<string, unknown> {
    return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function isProposalModel(value: unknown): value is ProposalModelId {
    return ['professional', 'modern', 'classic', 'minimalist', 'agency', 'impact'].includes(String(value))
}

function isVisualTone(value: unknown): value is VisualToneId {
    return ['balanced', 'formal', 'creative'].includes(String(value))
}

function normalizePalette(value: unknown, fallback: string) {
    if (!Array.isArray(value)) return [fallback]

    const colors = value
        .filter((item): item is string => typeof item === 'string' && /^#[0-9a-f]{6}$/i.test(item))
        .slice(0, 6)

    return colors.length ? colors : [fallback]
}

export function buildBrandKitFromLogoAnalysis(analysis: LogoIdentityAnalysis): BrandKit {
    const reviewWarnings = analysis.warnings.slice(0, 3)
    const needsReview = analysis.qualityScore < 0.58 || reviewWarnings.length > 0

    return {
        version: 'brand-kit-v1',
        generatedAt: new Date().toISOString(),
        source: 'logo-analysis',
        status: needsReview ? 'needs-review' : 'ready',
        accentColor: analysis.safeAccentColor,
        primaryColor: analysis.primaryColor,
        secondaryColor: analysis.secondaryColor,
        neutralDark: analysis.neutralDark,
        neutralLight: analysis.neutralLight,
        recommendedModel: analysis.recommendedModel,
        visualTone: analysis.visualTone,
        styleLabel: analysis.styleLabel,
        qualityLabel: analysis.qualityLabel,
        confidence: analysis.confidence,
        palette: normalizePalette(analysis.palette, analysis.safeAccentColor),
        whatsappMessageTemplate: DEFAULT_BRAND_KIT_MESSAGE_TEMPLATE,
        approvalPage: {
            accentColor: analysis.safeAccentColor,
            logoPlacement: 'header',
            buttonTone: 'solid',
            trustCopy: 'Proposta organizada com escopo, prazo, valor e aprovacao segura.',
        },
        checklist: [
            { id: 'logo', label: 'Logo aplicada na proposta', status: 'ready' },
            { id: 'palette', label: 'Paleta segura para leitura', status: 'ready' },
            { id: 'model', label: 'Modelo recomendado automaticamente', status: 'ready' },
            { id: 'message', label: 'Mensagem de envio sugerida', status: 'ready' },
            { id: 'approval', label: 'Pagina de aprovacao com identidade', status: 'ready' },
            { id: 'quality', label: 'Qualidade da logo revisada', status: needsReview ? 'review' : 'ready' },
        ],
        warnings: reviewWarnings,
        strengths: analysis.strengths.slice(0, 4),
    }
}

export function parseBrandKit(value: unknown): BrandKit | null {
    if (!isRecord(value) || value.version !== 'brand-kit-v1') return null

    const accentColor = typeof value.accentColor === 'string' ? value.accentColor : '#0D9B5C'
    const recommendedModel = isProposalModel(value.recommendedModel) ? value.recommendedModel : 'professional'
    const visualTone = isVisualTone(value.visualTone) ? value.visualTone : 'balanced'
    const approvalPage = isRecord(value.approvalPage) ? value.approvalPage : {}

    return {
        version: 'brand-kit-v1',
        generatedAt: typeof value.generatedAt === 'string' ? value.generatedAt : new Date().toISOString(),
        source: 'logo-analysis',
        status: value.status === 'needs-review' ? 'needs-review' : 'ready',
        accentColor,
        primaryColor: typeof value.primaryColor === 'string' ? value.primaryColor : accentColor,
        secondaryColor: typeof value.secondaryColor === 'string' ? value.secondaryColor : accentColor,
        neutralDark: typeof value.neutralDark === 'string' ? value.neutralDark : '#111827',
        neutralLight: typeof value.neutralLight === 'string' ? value.neutralLight : '#F8FAFC',
        recommendedModel,
        visualTone,
        styleLabel: typeof value.styleLabel === 'string' ? value.styleLabel : 'Visual profissional',
        qualityLabel: typeof value.qualityLabel === 'string' ? value.qualityLabel : 'Logo utilizavel',
        confidence: typeof value.confidence === 'number' ? value.confidence : 0.7,
        palette: normalizePalette(value.palette, accentColor),
        whatsappMessageTemplate: typeof value.whatsappMessageTemplate === 'string'
            ? value.whatsappMessageTemplate
            : DEFAULT_BRAND_KIT_MESSAGE_TEMPLATE,
        approvalPage: {
            accentColor: typeof approvalPage.accentColor === 'string' ? approvalPage.accentColor : accentColor,
            logoPlacement: 'header',
            buttonTone: 'solid',
            trustCopy: typeof approvalPage.trustCopy === 'string'
                ? approvalPage.trustCopy
                : 'Proposta organizada com escopo, prazo, valor e aprovacao segura.',
        },
        checklist: Array.isArray(value.checklist)
            ? value.checklist
                .filter((item): item is BrandKitChecklistItem => (
                    isRecord(item)
                    && typeof item.id === 'string'
                    && typeof item.label === 'string'
                    && (item.status === 'ready' || item.status === 'review')
                ))
                .slice(0, 8)
            : [],
        warnings: Array.isArray(value.warnings)
            ? value.warnings.filter((item): item is string => typeof item === 'string').slice(0, 3)
            : [],
        strengths: Array.isArray(value.strengths)
            ? value.strengths.filter((item): item is string => typeof item === 'string').slice(0, 4)
            : [],
    }
}

export function getBrandKitFromQuoteSettings(raw: unknown): BrandKit | null {
    try {
        const value = typeof raw === 'string' ? JSON.parse(raw) : raw
        if (!isRecord(value)) return null

        return parseBrandKit(value.brandKit)
    } catch {
        return null
    }
}
