import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { type EmailOtpType } from '@supabase/supabase-js'

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

    const supabase = await createClient()

    if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            return NextResponse.redirect(redirectTo)
        }

        console.error('exchangeCodeForSession (marketing) error:', error)
    } else if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({
            type,
            token_hash,
        })

        if (!error) {
            return NextResponse.redirect(redirectTo)
        }

        console.error('verifyOtp (marketing) error:', error)
    }

    const authError = searchParams.get('error_description') || searchParams.get('error')
    if (authError) {
        console.error('Callback auth error from Supabase URL (marketing):', authError)
    }

    const fallback = request.nextUrl.clone()
    fallback.pathname = '/login'
    fallback.search = ''
    fallback.searchParams.set('message', 'auth_code_error')
    return NextResponse.redirect(fallback)
}
