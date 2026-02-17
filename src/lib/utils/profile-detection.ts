/**
 * Sistema de Detecção Inteligente de Perfil de Cliente
 * 
 * Detecta automaticamente o perfil do cliente baseado em:
 * - Valor total do orçamento
 * - Razão social (presença de Ltda, S.A., ME, EIRELI)
 * - Categoria predominante dos itens
 * 
 * E adapta o layout, tom e elementos extras do orçamento
 */

export type ProfileTone = 'friendly' | 'balanced' | 'corporate'
export type ProfileLayout = 'modern' | 'professional' | 'classic'
export type ProfileDensity = 'spacious' | 'normal' | 'compact'
export type ProfileExtra = 'timeline' | 'warranty' | 'terms' | 'signatures' | 'value_proposition'

export interface ProfileDetectionResult {
    /** Layout recomendado para o orçamento */
    layout: ProfileLayout

    /** Tom de comunicação (friendly, balanced, corporate) */
    tone: ProfileTone

    /** Densidade de informação na página */
    density: ProfileDensity

    /** Elementos extras a serem exibidos */
    extras: ProfileExtra[]

    /** Razão da detecção (para debug/transparência) */
    reason: string
}

export interface QuoteData {
    id: string
    total: number
    client_name: string
    quote_items: Array<{
        description: string
        quantity: number
        unit_price: number
    }>
}

export interface ProfileData {
    business_name?: string | null
    theme_color?: string | null
    layout_style?: string | null
}

/**
 * Detecta se o cliente é corporativo baseado na razão social
 */
function isCorporateClient(businessName?: string | null, clientName?: string): boolean {
    const name = (businessName || clientName || '').toLowerCase()

    const corporateIndicators = [
        'ltda',
        'limitada',
        's.a.',
        's/a',
        'sa',
        'sociedade anônima',
        'me',
        'mei',
        'eireli',
        'epp',
        'empresa',
        'indústria',
        'comércio',
        'serviços',
        'tecnologia',
        'solutions',
        'sistemas',
        'engenharia',
    ]

    return corporateIndicators.some(indicator => name.includes(indicator))
}

/**
 * Calcula a complexidade do orçamento baseado nos itens
 */
function calculateQuoteComplexity(items: QuoteData['quote_items']): 'low' | 'medium' | 'high' {
    const itemCount = items.length

    if (itemCount <= 3) return 'low'
    if (itemCount <= 10) return 'medium'
    return 'high'
}

/**
 * Detecta automaticamente o perfil do cliente e retorna configuração de layout
 */
export function detectClientProfile(
    quote: QuoteData,
    profile: ProfileData
): ProfileDetectionResult {
    const total = quote.total
    const isCorporate = isCorporateClient(profile.business_name, quote.client_name)
    const complexity = calculateQuoteComplexity(quote.quote_items)

    // === CORPORATE (Alto Ticket ou Razão Social Corporativa) ===
    if (total > 5000 || isCorporate) {
        return {
            layout: 'classic',
            tone: 'corporate',
            density: 'compact',
            extras: ['terms', 'signatures', 'warranty'],
            reason: isCorporate
                ? `Cliente corporativo detectado: "${profile.business_name || quote.client_name}"`
                : `Orçamento de alto valor: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}`,
        }
    }

    // === MID TICKET (Médio Ticket) ===
    if (total > 500 && total <= 5000) {
        return {
            layout: 'professional',
            tone: 'balanced',
            density: 'normal',
            extras: ['warranty', 'timeline', 'value_proposition'],
            reason: `Orçamento de médio valor: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}`,
        }
    }

    // === LOW TICKET (Baixo Ticket) ===
    return {
        layout: 'modern',
        tone: 'friendly',
        density: 'spacious',
        extras: ['timeline', 'value_proposition', 'warranty'],
        reason: `Orçamento de baixo valor: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}`,
    }
}

/**
 * Verifica se um extra específico deve ser exibido
 */
export function shouldShowExtra(
    extra: ProfileExtra,
    detectedProfile: ProfileDetectionResult
): boolean {
    return detectedProfile.extras.includes(extra)
}

/**
 * Obtém classes CSS baseadas no tom detectado
 */
export function getToneClasses(tone: ProfileTone): string {
    switch (tone) {
        case 'friendly':
            return 'tone-friendly'
        case 'balanced':
            return 'tone-balanced'
        case 'corporate':
            return 'tone-corporate'
        default:
            return ''
    }
}

/**
 * Obtém classes CSS baseadas na densidade
 */
export function getDensityClasses(density: ProfileDensity): string {
    switch (density) {
        case 'spacious':
            return 'density-spacious'
        case 'normal':
            return 'density-normal'
        case 'compact':
            return 'density-compact'
        default:
            return ''
    }
}
