export const PRICING = {
    monthly: 49.90,
    yearly: 358.80,
    freeQuotesPerMonth: 1,
    freeActivationQuotes: 5,
    freeActivationWindowDays: 14,
    proSampleQuotes: 1,
} as const

export type FreeQuoteAllowance = {
    limit: number
    period: 'activation' | 'monthly'
    periodStart: Date
    remainingDays: number | null
}

export function getFreeQuoteAllowance(onboardedAt: string | null | undefined, now = new Date()): FreeQuoteAllowance {
    const onboardingDate = onboardedAt ? new Date(onboardedAt) : null
    const activationWindowMs = PRICING.freeActivationWindowDays * 24 * 60 * 60 * 1000

    if (onboardingDate && !Number.isNaN(onboardingDate.getTime())) {
        const elapsed = now.getTime() - onboardingDate.getTime()
        if (elapsed >= 0 && elapsed < activationWindowMs) {
            return {
                limit: PRICING.freeActivationQuotes,
                period: 'activation',
                periodStart: onboardingDate,
                remainingDays: Math.max(1, Math.ceil((activationWindowMs - elapsed) / (24 * 60 * 60 * 1000))),
            }
        }
    }

    return {
        limit: PRICING.freeQuotesPerMonth,
        period: 'monthly',
        periodStart: new Date(now.getFullYear(), now.getMonth(), 1),
        remainingDays: null,
    }
}

export const YEARLY_MONTHLY_EQUIV = PRICING.yearly / 12
export const YEARLY_SAVINGS = (PRICING.monthly * 12) - PRICING.yearly
export const YEARLY_DISCOUNT_PCT = Math.round((YEARLY_SAVINGS / (PRICING.monthly * 12)) * 100)

export const MARKETING_COPY = {
    corePromise: 'Transforme preço solto no WhatsApp em uma aprovação profissional, clara e registrada. Crie, envie e acompanhe cada proposta sem virar um ERP.',
    signupHint: `Sem cartão. 5 propostas simples nos primeiros 14 dias e 1 Deguste Pro para sentir a diferença.`,
    freePlan: `Plano gratuito com 5 propostas simples nos primeiros 14 dias, depois 1 por mês, e 1 proposta Deguste Pro.`,
    proPlan: `Plano Pro a partir de ${formatCurrencyBR(YEARLY_MONTHLY_EQUIV)} por mês no plano anual.`,
} as const

export function formatCurrencyBR(value: number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function formatNumberBR(value: number, decimals = 2) {
    return value.toFixed(decimals).replace('.', ',')
}
