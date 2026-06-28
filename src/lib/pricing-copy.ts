export const PRICING = {
    monthly: 49.90,
    yearly: 358.80,
    freeQuotesPerMonth: 5,
} as const

export const YEARLY_MONTHLY_EQUIV = PRICING.yearly / 12
export const YEARLY_SAVINGS = (PRICING.monthly * 12) - PRICING.yearly
export const YEARLY_DISCOUNT_PCT = Math.round((YEARLY_SAVINGS / (PRICING.monthly * 12)) * 100)

export const MARKETING_COPY = {
    corePromise: 'Crie orcamentos profissionais com sua logo em ate 1 minuto. Envie pelo WhatsApp e acompanhe a aprovacao do cliente.',
    signupHint: 'Sem cartao de credito.',
    freePlan: `Plano gratuito com ate ${PRICING.freeQuotesPerMonth} orcamentos por mes.`,
    proPlan: `Plano Pro a partir de ${formatCurrencyBR(YEARLY_MONTHLY_EQUIV)} por mes no plano anual.`,
} as const

export function formatCurrencyBR(value: number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function formatNumberBR(value: number, decimals = 2) {
    return value.toFixed(decimals).replace('.', ',')
}
