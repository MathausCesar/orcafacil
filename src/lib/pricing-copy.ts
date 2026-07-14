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
    corePromise: 'Você escolhe os serviços, o Zacly monta o orçamento bonito com seu nome, e o cliente aprova com um toque no WhatsApp. Sem papel, sem planilha, sem complicação.',
    signupHint: `Grátis pra testar: 5 orçamentos nos primeiros 14 dias. Sem cartão, sem pegadinha.`,
    freePlan: `Grátis pra começar: 5 orçamentos nos primeiros 14 dias, depois 1 por mês. Você ainda ganha 1 orçamento com visual Pro de brinde pra ver a diferença.`,
    proPlan: `Plano Pro a partir de ${formatCurrencyBR(YEARLY_MONTHLY_EQUIV)} por mês no plano anual.`,
} as const

export function formatCurrencyBR(value: number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function formatNumberBR(value: number, decimals = 2) {
    return value.toFixed(decimals).replace('.', ',')
}
