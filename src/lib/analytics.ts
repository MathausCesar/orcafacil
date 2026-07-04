'use client'

import posthog from 'posthog-js'

export const ATTRIBUTION_KEYS = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_content',
    'utm_term',
    'gclid',
    'fbclid',
    'msclkid',
] as const

export const ATTRIBUTION_STORAGE_KEY = 'zacly_attribution'

type AnalyticsProperties = Record<string, unknown>

const SENSITIVE_QUERY_KEYS = [
    'token',
    'public_token',
    'code',
    'access_token',
    'refresh_token',
    'auth',
    'email',
    'phone',
    'session_id',
    'password',
]

const SENSITIVE_PROPERTY_PATTERN = /(password|secret|token|authorization|email|phone|cpf|cnpj|document|session_id)/i

export function redactUrl(value: string) {
    if (!value) return value

    try {
        const url = new URL(value, typeof window !== 'undefined' ? window.location.origin : 'https://zacly.com.br')

        SENSITIVE_QUERY_KEYS.forEach((key) => {
            if (url.searchParams.has(key)) {
                url.searchParams.set(key, '[redacted]')
            }
        })

        return url.toString()
    } catch {
        return value.replace(/([?&](?:token|public_token|code|access_token|refresh_token|auth|email|phone|session_id|password)=)[^&]+/gi, '$1[redacted]')
    }
}

export function getCurrentAnalyticsUrl() {
    if (typeof window === 'undefined') return ''
    return redactUrl(window.location.href)
}

export function getStoredAttribution() {
    if (typeof window === 'undefined') return {}

    try {
        const stored = window.localStorage.getItem(ATTRIBUTION_STORAGE_KEY)
        if (!stored) return {}

        const parsed = JSON.parse(stored)
        return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
            ? parsed as Record<string, string>
            : {}
    } catch {
        return {}
    }
}

export function isPaidAttribution(attribution: Record<string, string>) {
    const medium = attribution.utm_medium?.toLowerCase()
    return Boolean(
        attribution.gclid ||
        medium === 'cpc' ||
        medium === 'ppc' ||
        medium === 'paid' ||
        medium === 'paid_search'
    )
}

function sanitizeProperties(properties: AnalyticsProperties = {}) {
    return Object.entries(properties).reduce<AnalyticsProperties>((acc, [key, value]) => {
        if (value === undefined) return acc

        if (typeof value === 'string' && SENSITIVE_PROPERTY_PATTERN.test(key)) {
            acc[key] = '[redacted]'
            return acc
        }

        if (typeof value === 'string' && /^https?:\/\//i.test(value)) {
            acc[key] = redactUrl(value)
            return acc
        }

        acc[key] = value
        return acc
    }, {})
}

export function captureEvent(eventName: string, properties: AnalyticsProperties = {}) {
    posthog.capture(eventName, sanitizeProperties(properties))
}

export function addExceptionStep(stepName: string, properties: AnalyticsProperties = {}) {
    try {
        posthog.addExceptionStep(stepName, sanitizeProperties(properties))
    } catch {
        // Exception breadcrumbs are useful, but should never break the product flow.
    }
}

export function captureException(error: unknown, properties: AnalyticsProperties = {}) {
    const context = sanitizeProperties({
        current_path: typeof window !== 'undefined' ? window.location.pathname : '',
        current_url: getCurrentAnalyticsUrl(),
        ...properties,
    })

    try {
        posthog.captureException(error, context)
    } catch {
        posthog.capture('app_error_captured', {
            ...context,
            error_message: error instanceof Error ? error.message : String(error),
        })
    }
}
