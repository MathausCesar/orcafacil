import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { type EmailOtpType } from '@supabase/supabase-js'
import { getAuthCallbackMessage, logAuthCallbackFailure } from '@/lib/auth-callback-error'

export const dynamic = 'force-dynamic'

function getSafeNext(value: string | null, fallback: string) {
    if (!value || !value.startsWith('/') || value.startsWith('//')) {
        return fallback
    }

    return value
}

function buildRedirectUrl(request: NextRequest, next: string) {
    const target = new URL(next, request.nextUrl.origin)
    const redirectTo = request.nextUrl.clone()

    redirectTo.pathname = target.pathname
    redirectTo.search = target.search
    redirectTo.searchParams.delete('code')
    redirectTo.searchParams.delete('token_hash')
    redirectTo.searchParams.delete('type')
    redirectTo.searchParams.delete('error')
    redirectTo.searchParams.delete('error_code')
    redirectTo.searchParams.delete('error_description')
    redirectTo.searchParams.delete('next')

    return redirectTo
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type') as EmailOtpType | null
    const fallbackNext = type === 'recovery' ? '/update-password' : '/login'
    const next = getSafeNext(searchParams.get('next'), fallbackNext)
    const redirectTo = buildRedirectUrl(request, next)
    let failureMessage: 'auth_code_error' | 'auth_session_expired' | 'oauth_provider_error' = 'auth_code_error'

    const supabase = await createClient()

    if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            return NextResponse.redirect(redirectTo)
        }

        failureMessage = getAuthCallbackMessage(error)
        logAuthCallbackFailure('exchangeCodeForSession error', error, { next })
    } else if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({
            type,
            token_hash,
        })

        if (!error) {
            return NextResponse.redirect(redirectTo)
        }

        failureMessage = getAuthCallbackMessage(error)
        logAuthCallbackFailure('verifyOtp error', error, { next, type })
    }

    const authError = searchParams.get('error_description') || searchParams.get('error')
    if (authError) {
        failureMessage = 'oauth_provider_error'
        console.error('Callback auth error from Supabase URL:', {
            message: authError,
            errorCode: searchParams.get('error_code'),
            next,
        })
    }

    const fallback = request.nextUrl.clone()
    fallback.pathname = '/login'
    fallback.search = ''
    fallback.searchParams.set('message', failureMessage)
    return NextResponse.redirect(fallback)
}
