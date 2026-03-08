import posthog from 'posthog-js'

export function register() {
    if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
        posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
            api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
            capture_pageview: false // Desabilitado para usarmos o componente customizado do App Router
        })
    }
}
