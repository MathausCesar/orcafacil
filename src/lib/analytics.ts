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
    'zacly_campaign',
    'zacly_content',
] as const

export const ATTRIBUTION_STORAGE_KEY = 'zacly_attribution'

type AnalyticsProperties = Record<string, unknown>
export type ActivationStage =
    | 'account_created_not_onboarded'
    | 'onboarded_no_quote'
    | 'quote_created_not_sent'
    | 'quote_sent_no_subscription'
    | 'client_opened_free'
    | 'client_approved_free'
    | 'subscribed'

type GtagFunction = (
    command: 'event',
    eventName: string,
    properties?: Record<string, unknown>
) => void

declare global {
    interface Window {
        gtag?: GtagFunction
        dataLayer?: unknown[]
    }
}

const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || 'AW-18295542064'

const GOOGLE_ADS_CONVERSION_LABELS = {
    signup_completed: process.env.NEXT_PUBLIC_GOOGLE_ADS_SIGNUP_LABEL,
    onboarding_completed: process.env.NEXT_PUBLIC_GOOGLE_ADS_ONBOARDING_LABEL,
    quote_created: process.env.NEXT_PUBLIC_GOOGLE_ADS_QUOTE_CREATED_LABEL,
    // Keep the former key as a temporary fallback while production moves to the
    // explicit "sent" name. A share click is not evidence that the proposal
    // actually reached the client.
    quote_sent_confirmed:
        process.env.NEXT_PUBLIC_GOOGLE_ADS_QUOTE_SENT_LABEL ||
        process.env.NEXT_PUBLIC_GOOGLE_ADS_QUOTE_SHARE_LABEL,
    checkout_started: process.env.NEXT_PUBLIC_GOOGLE_ADS_CHECKOUT_STARTED_LABEL,
    subscription_started: process.env.NEXT_PUBLIC_GOOGLE_ADS_SUBSCRIPTION_LABEL,
} as const

type GoogleAdsConversionName = keyof typeof GOOGLE_ADS_CONVERSION_LABELS

const SENSITIVE_QUERY_KEYS = [
    'token',
    'public_token',
    'approval',
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
        return value.replace(/([?&](?:token|public_token|approval|code|access_token|refresh_token|auth|email|phone|session_id|password)=)[^&]+/gi, '$1[redacted]')
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

export function captureActivationStage(stage: ActivationStage, properties: AnalyticsProperties = {}) {
    captureEvent('activation_stage_updated', {
        ...properties,
        stage,
        activation_stage: stage,
        activation_stage_updated_at: new Date().toISOString(),
        $set: {
            activation_stage: stage,
            activation_stage_updated_at: new Date().toISOString(),
        },
    })
}

export function trackGoogleAdsConversion(
    eventName: GoogleAdsConversionName,
    properties: AnalyticsProperties = {}
) {
    if (typeof window === 'undefined') return

    const label = GOOGLE_ADS_CONVERSION_LABELS[eventName]
    if (!label) return

    const sanitized = sanitizeProperties(properties)
    const conversionPayload = {
        send_to: `${GOOGLE_ADS_ID}/${label}`,
        value: typeof sanitized.value === 'number' ? sanitized.value : undefined,
        currency: typeof sanitized.currency === 'string' ? sanitized.currency : 'BRL',
        transaction_id: typeof sanitized.transaction_id === 'string' ? sanitized.transaction_id : undefined,
    }

    // The first product event can happen before the external Google script finishes
    // loading. Queue it in the standard data layer instead of silently dropping it.
    if (typeof window.gtag !== 'function') {
        window.dataLayer = window.dataLayer || []
        window.gtag = (...args) => {
            window.dataLayer?.push(args)
        }
    }

    window.gtag('event', 'conversion', conversionPayload)
}

export function captureConversion(
    eventName: GoogleAdsConversionName,
    properties: AnalyticsProperties = {}
) {
    captureEvent(eventName, properties)
    trackGoogleAdsConversion(eventName, properties)
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
