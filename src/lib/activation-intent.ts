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

export type ProfileActivationFields = {
    intended_plan?: IntendedPlan
    first_attribution?: Record<string, string>
    last_attribution?: Record<string, string>
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

export function hasAttribution(value: unknown) {
    return Object.keys(normalizeAttribution(value)).length > 0
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

export function mergeActivationIntents(...values: unknown[]): ActivationIntent {
    return values.reduce<ActivationIntent>((merged, value) => {
        const current = normalizeActivationIntent(value)
        return {
            intendedPlan: current.intendedPlan || merged.intendedPlan,
            attribution: {
                ...merged.attribution,
                ...current.attribution,
            },
        }
    }, { intendedPlan: null, attribution: {} })
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

export function getActivationIntentFromPath(path: string | null | undefined): ActivationIntent {
    if (!path) return { intendedPlan: null, attribution: {} }

    try {
        return getActivationIntentFromSearchParams(new URL(path, 'https://app.zacly.com.br').searchParams)
    } catch {
        return { intendedPlan: null, attribution: {} }
    }
}

export function buildOnboardingIntentPath(nextPath: string, intent: ActivationIntent) {
    const fallback = '/onboarding'
    const initialTarget = nextPath.startsWith('/pricing') ? fallback : (nextPath || fallback)
    const url = new URL(initialTarget, 'https://app.zacly.com.br')
    const normalizedIntent = normalizeActivationIntent(intent)

    if (normalizedIntent.intendedPlan) url.searchParams.set('intent_plan', normalizedIntent.intendedPlan)
    Object.entries(normalizedIntent.attribution).forEach(([key, value]) => {
        if (!url.searchParams.has(key)) url.searchParams.set(key, value)
    })

    return `${url.pathname}${url.search}`
}

export function buildProfileActivationFields(
    intent: unknown,
    existingFirstAttribution: unknown,
): ProfileActivationFields {
    const normalizedIntent = normalizeActivationIntent(intent)
    const fields: ProfileActivationFields = {}

    if (normalizedIntent.intendedPlan) {
        fields.intended_plan = normalizedIntent.intendedPlan
    }

    if (!hasAttribution(normalizedIntent.attribution)) {
        return fields
    }

    fields.last_attribution = normalizedIntent.attribution
    if (!hasAttribution(existingFirstAttribution)) {
        fields.first_attribution = normalizedIntent.attribution
    }

    return fields
}
