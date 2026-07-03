type AuthCallbackMessage = 'auth_code_error' | 'auth_session_expired' | 'oauth_provider_error'

type AuthErrorDetails = {
    code?: string
    name?: string
    status?: number
    message?: string
}

function getErrorDetails(error: unknown): AuthErrorDetails {
    if (!error || typeof error !== 'object') return {}

    const candidate = error as Record<string, unknown>

    return {
        code: typeof candidate.code === 'string' ? candidate.code : undefined,
        name: typeof candidate.name === 'string' ? candidate.name : undefined,
        status: typeof candidate.status === 'number' ? candidate.status : undefined,
        message: typeof candidate.message === 'string' ? candidate.message : undefined,
    }
}

export function getAuthCallbackMessage(error: unknown): AuthCallbackMessage {
    const details = getErrorDetails(error)

    if (
        details.code === 'pkce_code_verifier_not_found' ||
        details.name === 'AuthPKCECodeVerifierMissingError'
    ) {
        return 'auth_session_expired'
    }

    return 'auth_code_error'
}

export function logAuthCallbackFailure(scope: string, error: unknown, context?: Record<string, string | null>) {
    const details = getErrorDetails(error)

    console.error(scope, {
        code: details.code,
        name: details.name,
        status: details.status,
        message: details.message,
        ...context,
    })
}
