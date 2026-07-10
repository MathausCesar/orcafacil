type ServerAnalyticsProperties = Record<string, unknown>

const SENSITIVE_PROPERTY_PATTERN = /(password|secret|token|authorization|email|phone|cpf|cnpj|document|session_id)/i

function sanitizeProperties(properties: ServerAnalyticsProperties = {}) {
    return Object.entries(properties).reduce<ServerAnalyticsProperties>((acc, [key, value]) => {
        if (value === undefined) return acc

        if (typeof value === 'string' && SENSITIVE_PROPERTY_PATTERN.test(key)) {
            acc[key] = '[redacted]'
            return acc
        }

        acc[key] = value
        return acc
    }, {})
}

function getPostHogHost() {
    return (
        process.env.POSTHOG_HOST ||
        process.env.NEXT_PUBLIC_POSTHOG_HOST ||
        process.env.NEXT_PUBLIC_POSTHOG_UI_HOST ||
        'https://us.i.posthog.com'
    ).replace(/\/$/, '')
}

export async function captureServerEvent(
    eventName: string,
    distinctId: string,
    properties: ServerAnalyticsProperties = {}
) {
    const apiKey = process.env.POSTHOG_PROJECT_API_KEY || process.env.NEXT_PUBLIC_POSTHOG_KEY

    if (!apiKey || !distinctId) return

    try {
        const response = await fetch(`${getPostHogHost()}/capture/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                api_key: apiKey,
                event: eventName,
                distinct_id: distinctId,
                properties: sanitizeProperties(properties),
            }),
            cache: 'no-store',
        })

        if (!response.ok) {
            console.warn('Server analytics event was not accepted.', {
                eventName,
                status: response.status,
            })
        }
    } catch (error) {
        console.warn('Server analytics event failed.', {
            eventName,
            error: error instanceof Error ? error.message : String(error),
        })
    }
}
