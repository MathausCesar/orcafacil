export const ACTIVATION_ATTRIBUTION_KEYS = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_content',
    'utm_term',
    'gclid',
    'fbclid',
    'msclkid',
    'zacly_campaign',
    'zacly_content',
] as const

export type IntendedPlan = 'monthly' | 'yearly'

export type ActivationIntent = {
    intendedPlan: IntendedPlan | null
    attribution: Record<string, string>
}

function cleanValue(value: unknown) {
    if (typeof value !== 'string') return ''
    return value.trim().slice(0, 500)
}

export function normalizeIntendedPlan(value: unknown): IntendedPlan | null {
    return value === 'monthly' || value === 'yearly' ? value : null
}

export function normalizeAttribution(value: unknown): Record<string, string> {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return {}

    const input = value as Record<string, unknown>
    return ACTIVATION_ATTRIBUTION_KEYS.reduce<Record<string, string>>((acc, key) => {
        const cleaned = cleanValue(input[key])
        if (cleaned) acc[key] = cleaned
        return acc
    }, {})
}

export function normalizeActivationIntent(value: unknown): ActivationIntent {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
        return { intendedPlan: null, attribution: {} }
    }

    const record = value as Record<string, unknown>
    return {
        intendedPlan: normalizeIntendedPlan(record.intendedPlan),
        attribution: normalizeAttribution(record.attribution),
    }
}

export function parseActivationIntent(value: unknown): ActivationIntent {
    if (typeof value !== 'string' || !value.trim()) {
        return { intendedPlan: null, attribution: {} }
    }

    try {
        return normalizeActivationIntent(JSON.parse(value))
    } catch {
        return { intendedPlan: null, attribution: {} }
    }
}

export function getActivationIntentFromSearchParams(searchParams: { get: (key: string) => string | null }): ActivationIntent {
    const attribution = ACTIVATION_ATTRIBUTION_KEYS.reduce<Record<string, string>>((acc, key) => {
        const value = cleanValue(searchParams.get(key))
        if (value) acc[key] = value
        return acc
    }, {})

    return {
        intendedPlan: normalizeIntendedPlan(searchParams.get('intent_plan') || searchParams.get('plan')),
        attribution,
    }
}

export function buildOnboardingIntentPath(nextPath: string, intent: ActivationIntent) {
    const fallback = '/onboarding'
    const initialTarget = nextPath.startsWith('/pricing') ? fallback : (nextPath || fallback)
    const url = new URL(initialTarget, 'https://app.zacly.com.br')

    if (intent.intendedPlan) url.searchParams.set('intent_plan', intent.intendedPlan)
    Object.entries(intent.attribution).forEach(([key, value]) => {
        if (!url.searchParams.has(key)) url.searchParams.set(key, value)
    })

    return `${url.pathname}${url.search}`
}
