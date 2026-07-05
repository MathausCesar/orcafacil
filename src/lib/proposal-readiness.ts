type ReadinessQuoteItem = {
    description?: string | null
    details?: string | null
    quantity?: number | null
    unitPrice?: number | null
    unit_price?: number | null
}

type ProposalReadinessInput = {
    clientName: string
    clientPhone?: string | null
    items: ReadinessQuoteItem[]
    total: number
    expirationDate?: string | null
    paymentTerms?: string | null
    notes?: string | null
    showDetailedItems: boolean
    showTimeline: boolean
    estimatedDays?: string | number | null
    showPaymentOptions: boolean
    paymentMethods: string[]
    hasLogo: boolean
    hasLogoAnalysis: boolean
    layoutMatchesRecommendation: boolean
}

export type ProposalReadinessCheck = {
    id: string
    label: string
    status: 'ready' | 'missing'
    weight: number
}

export type ProposalReadiness = {
    score: number
    label: string
    checks: ProposalReadinessCheck[]
    improvements: ProposalReadinessCheck[]
}

function hasText(value: string | null | undefined) {
    return Boolean(value?.trim())
}

function itemHasValue(item: ReadinessQuoteItem) {
    const unitPrice = item.unitPrice ?? item.unit_price ?? 0
    return hasText(item.description || '') && (item.quantity || 0) > 0 && unitPrice > 0
}

function itemHasDetail(item: ReadinessQuoteItem) {
    return hasText(item.details || '')
}

function buildCheck(id: string, label: string, status: boolean, weight: number): ProposalReadinessCheck {
    return {
        id,
        label,
        status: status ? 'ready' : 'missing',
        weight,
    }
}

export function calculateProposalReadiness(input: ProposalReadinessInput): ProposalReadiness {
    const hasValidItems = input.items.length > 0 && input.items.every(itemHasValue)
    const hasDetails = input.showDetailedItems
        ? input.items.some(itemHasDetail)
        : input.items.length >= 2

    const checks = [
        buildCheck('client', 'Cliente identificado', hasText(input.clientName), 10),
        buildCheck('phone', 'WhatsApp do cliente informado', hasText(input.clientPhone), 8),
        buildCheck('items', 'Itens com quantidade e valor', hasValidItems, 16),
        buildCheck('details', 'Escopo facil de entender', hasDetails, 8),
        buildCheck('total', 'Total calculado', input.total > 0, 10),
        buildCheck('validity', 'Validade da proposta definida', hasText(input.expirationDate), 10),
        buildCheck('payment_terms', 'Condicao de pagamento clara', hasText(input.paymentTerms), 8),
        buildCheck('timeline', 'Prazo ou cronograma indicado', input.showTimeline && hasText(String(input.estimatedDays || '')), 8),
        buildCheck('payment_options', 'Formas de pagamento visiveis', input.showPaymentOptions && input.paymentMethods.length > 0, 8),
        buildCheck('notes', 'Observacao final util', hasText(input.notes), 6),
        buildCheck('logo', 'Identidade da empresa aplicada', input.hasLogo, 8),
        buildCheck('logo_analysis', 'Logo analisada automaticamente', input.hasLogoAnalysis, 4),
        buildCheck('layout', 'Modelo alinhado ao tipo de servico', input.layoutMatchesRecommendation, 6),
    ]

    const totalWeight = checks.reduce((sum, check) => sum + check.weight, 0)
    const readyWeight = checks.reduce((sum, check) => (
        check.status === 'ready' ? sum + check.weight : sum
    ), 0)
    const score = Math.min(100, Math.round((readyWeight / totalWeight) * 100))

    const label = score >= 88
        ? 'pronta para passar confianca'
        : score >= 72
            ? 'quase pronta para enviar'
            : score >= 50
                ? 'precisa de alguns ajustes'
                : 'ainda esta incompleta'

    return {
        score,
        label,
        checks,
        improvements: checks
            .filter((check) => check.status === 'missing')
            .sort((a, b) => b.weight - a.weight),
    }
}
