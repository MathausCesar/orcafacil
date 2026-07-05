import {
    getProfessionalContext,
    normalizeProfessionalContext,
    type ProfessionalContextId,
} from '@/lib/professional-context'
import {
    normalizeProposalModel,
    PROPOSAL_MODELS,
    type ProposalModelId,
    type VisualToneId,
} from '@/lib/proposal-style'

export type LayoutRecommendationSource = 'trade' | 'onboarding' | 'conversion' | 'fallback'
export type LayoutRecommendationConfidence = 'low' | 'medium' | 'high'

export type LayoutRecommendation = {
    professionalContext: ProfessionalContextId
    model: ProposalModelId
    visualTone: VisualToneId
    title: string
    summary: string
    badge: string
    reason: string
    source: LayoutRecommendationSource
    confidence: LayoutRecommendationConfidence
    evidence?: string
}

export type QuoteLayoutHistoryRecord = {
    layout_style: string | null
    professional_context: string | null
    status: string | null
}

const RECOMMENDATIONS_BY_CONTEXT: Record<ProfessionalContextId, Omit<LayoutRecommendation, 'professionalContext' | 'source' | 'confidence'>> = {
    general: {
        model: 'professional',
        visualTone: 'balanced',
        title: 'Modelo profissional para servicos gerais',
        summary: 'Mantem escopo, prazo e valor bem separados para passar confianca sem exagero visual.',
        badge: 'Profissional',
        reason: 'Bom ponto de partida quando o servico ainda nao tem um formato especifico.',
    },
    mechanic: {
        model: 'professional',
        visualTone: 'formal',
        title: 'Modelo tecnico para mecanicos',
        summary: 'Separa pecas, mao de obra, prazo e garantia de um jeito direto para oficina.',
        badge: 'Tecnico',
        reason: 'Clientes de oficina precisam entender exatamente o que esta incluso antes de aprovar.',
    },
    woodworker: {
        model: 'agency',
        visualTone: 'creative',
        title: 'Modelo visual para marceneiros',
        summary: 'Da mais presenca para medidas, materiais, etapas e acabamento do projeto.',
        badge: 'Visual',
        reason: 'Marcenaria vende percepcao de acabamento; a proposta precisa parecer mais apresentada.',
    },
    electrician: {
        model: 'minimalist',
        visualTone: 'balanced',
        title: 'Modelo objetivo para eletricistas',
        summary: 'Prioriza pontos, materiais, execucao, prazo e validade sem distrair o cliente.',
        badge: 'Objetivo',
        reason: 'Servicos eletricos costumam fechar melhor com informacao curta e organizada.',
    },
    painter: {
        model: 'modern',
        visualTone: 'balanced',
        title: 'Modelo claro para pintores',
        summary: 'Ajuda a organizar ambientes, metragem, preparo, demaos, material e prazo.',
        badge: 'Ambientes',
        reason: 'Pintura precisa mostrar o que esta incluso para evitar comparacao apenas por preco.',
    },
    construction: {
        model: 'professional',
        visualTone: 'balanced',
        title: 'Modelo estruturado para obra e reparos',
        summary: 'Organiza mao de obra, materiais, etapas, condicoes do local e prazo combinado.',
        badge: 'Estruturado',
        reason: 'Reformas pequenas precisam deixar o escopo fechado antes do inicio.',
    },
    hvac: {
        model: 'professional',
        visualTone: 'formal',
        title: 'Modelo tecnico para climatizacao',
        summary: 'Destaca equipamento, acesso, distancia, pecas, garantia e condicoes de instalacao.',
        badge: 'Tecnico',
        reason: 'Instalacao e manutencao exigem clareza sobre o que entra no valor.',
    },
    tech: {
        model: 'professional',
        visualTone: 'formal',
        title: 'Modelo tecnico para suporte',
        summary: 'Organiza diagnostico, acessos, equipamentos, prazo e proximos passos.',
        badge: 'Tecnico',
        reason: 'Servicos de tecnologia precisam parecer objetivos e rastreaveis.',
    },
    design: {
        model: 'agency',
        visualTone: 'creative',
        title: 'Modelo visual para comunicacao',
        summary: 'Valoriza materiais, aplicacao, prova, instalacao e acabamento comercial.',
        badge: 'Visual',
        reason: 'Comunicacao visual vende imagem; a proposta deve refletir isso.',
    },
    food: {
        model: 'modern',
        visualTone: 'balanced',
        title: 'Modelo claro para alimentos e eventos',
        summary: 'Organiza quantidade, sabores, entrega, data, montagem e condicoes do pedido.',
        badge: 'Pedido claro',
        reason: 'Eventos dependem de data, quantidade e combinados sem ambiguidade.',
    },
    beauty: {
        model: 'modern',
        visualTone: 'creative',
        title: 'Modelo leve para beleza e estetica',
        summary: 'Mostra procedimento, horario, produtos, deslocamento e condicoes com boa apresentacao.',
        badge: 'Leve',
        reason: 'Atendimentos pessoais precisam de clareza sem ficar com cara de contrato pesado.',
    },
}

const APPROVED_STATUSES = new Set(['approved', 'in_progress', 'completed'])
const DECIDED_STATUSES = new Set(['approved', 'rejected', 'changes_requested', 'in_progress', 'completed'])

export function getProposalModelName(model: string | null | undefined) {
    const normalized = normalizeProposalModel(model)
    return PROPOSAL_MODELS.find((item) => item.id === normalized)?.name || 'Profissional'
}

export function getLayoutRecommendationForContext(
    value: string | null | undefined,
    source: LayoutRecommendationSource = 'trade',
): LayoutRecommendation {
    const professionalContext = normalizeProfessionalContext(value)
    const recommendation = RECOMMENDATIONS_BY_CONTEXT[professionalContext] || RECOMMENDATIONS_BY_CONTEXT.general

    return {
        professionalContext,
        ...recommendation,
        source,
        confidence: professionalContext === 'general' ? 'low' : 'medium',
    }
}

export function getRecommendedProposalModelForTrade(
    value: string | null | undefined,
): ProposalModelId {
    return getLayoutRecommendationForContext(value).model
}

export function getLayoutRecommendationFromQuoteSettings(raw: unknown): LayoutRecommendation | null {
    try {
        const value = typeof raw === 'string' ? JSON.parse(raw) : raw
        if (!value || typeof value !== 'object' || Array.isArray(value)) return null

        const onboarding = (value as Record<string, unknown>).onboarding
        if (!onboarding || typeof onboarding !== 'object' || Array.isArray(onboarding)) return null

        const record = onboarding as Record<string, unknown>
        const context = normalizeProfessionalContext(typeof record.professionalContext === 'string' ? record.professionalContext : null)
        const base = getLayoutRecommendationForContext(context, 'onboarding')
        const model = typeof record.recommendedLayout === 'string'
            ? normalizeProposalModel(record.recommendedLayout)
            : base.model

        return {
            ...base,
            model,
            source: 'onboarding',
            confidence: 'medium',
        }
    } catch {
        return null
    }
}

export function getLayoutRecommendationFromQuoteHistory(
    records: QuoteLayoutHistoryRecord[],
    contextValue: string | null | undefined,
): LayoutRecommendation | null {
    const context = normalizeProfessionalContext(contextValue)
    const contextName = getProfessionalContext(context).shortName
    const decided = records.filter((record) => (
        DECIDED_STATUSES.has(record.status || '')
        && normalizeProfessionalContext(record.professional_context) === context
        && record.layout_style
    ))

    if (decided.length < 2) return null

    const scores = new Map<ProposalModelId, { approved: number; decided: number }>()

    decided.forEach((record) => {
        const model = normalizeProposalModel(record.layout_style)
        const current = scores.get(model) || { approved: 0, decided: 0 }
        current.decided += 1
        if (APPROVED_STATUSES.has(record.status || '')) current.approved += 1
        scores.set(model, current)
    })

    let best: {
        model: ProposalModelId
        stats: { approved: number; decided: number }
        score: number
    } | null = null

    for (const [model, stats] of scores) {
        const smoothedScore = (stats.approved + 1) / (stats.decided + 2)
        if (!best || smoothedScore > best.score) {
            best = {
                model,
                stats,
                score: smoothedScore,
            }
        }
    }

    if (!best) return null

    const base = getLayoutRecommendationForContext(context, 'conversion')
    const confidence: LayoutRecommendationConfidence = best.stats.decided >= 10
        ? 'high'
        : best.stats.decided >= 5
            ? 'medium'
            : 'low'

    return {
        ...base,
        model: best.model,
        title: `Mais aprovado em ${contextName}`,
        summary: `Seu historico indica que o modelo ${getProposalModelName(best.model)} tem melhor resposta nesse tipo de servico.`,
        badge: 'Aprendizado',
        reason: 'Recomendacao baseada em propostas ja respondidas pelo cliente.',
        source: 'conversion',
        confidence,
        evidence: `${best.stats.approved} de ${best.stats.decided} propostas decididas foram aprovadas com esse padrao.`,
    }
}
