export const PRICING = {
    monthly: 49.90,
    yearly: 358.80,
    freeQuotesPerMonth: 1,
    proSampleQuotes: 1,
} as const

export const YEARLY_MONTHLY_EQUIV = PRICING.yearly / 12
export const YEARLY_SAVINGS = (PRICING.monthly * 12) - PRICING.yearly
export const YEARLY_DISCOUNT_PCT = Math.round((YEARLY_SAVINGS / (PRICING.monthly * 12)) * 100)

export const MARKETING_COPY = {
    corePromise: 'Crie um orçamento profissional em até 1 minuto, envie pelo WhatsApp e acompanhe se o cliente abriu, aprovou ou ficou parado.',
    signupHint: `Sem cartão. 1 proposta simples grátis e 1 deguste Pro para sentir a diferença.`,
    freePlan: `Plano gratuito com 1 proposta simples por mês e 1 proposta deguste Pro.`,
    proPlan: `Plano Pro a partir de ${formatCurrencyBR(YEARLY_MONTHLY_EQUIV)} por mês no plano anual.`,
} as const

export function formatCurrencyBR(value: number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function formatNumberBR(value: number, decimals = 2) {
    return value.toFixed(decimals).replace('.', ',')
}
