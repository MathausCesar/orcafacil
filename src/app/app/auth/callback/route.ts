import { createClient } from '@/lib/supabase/server'
import { NextResponse, type NextRequest } from 'next/server'
import { type EmailOtpType } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type') as EmailOtpType | null
    // Define o padrão como /login caso não haja next param
    const next = searchParams.get('next') ?? '/login'

    const redirectTo = request.nextUrl.clone()
    redirectTo.pathname = next
    redirectTo.searchParams.delete('code')
    redirectTo.searchParams.delete('token_hash')
    redirectTo.searchParams.delete('type')
    redirectTo.searchParams.delete('error')
    redirectTo.searchParams.delete('error_code')
    redirectTo.searchParams.delete('error_description')

    const supabase = await createClient()

    if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            redirectTo.searchParams.delete('next')
            return NextResponse.redirect(redirectTo)
        } else {
            console.error('exchangeCodeForSession error:', error)
        }
    } else if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({
            type,
            token_hash,
        })

        if (!error) {
            redirectTo.searchParams.delete('next')
            return NextResponse.redirect(redirectTo)
        } else {
            console.error('verifyOtp error:', error)
        }
    }

    // Falha na verificação do código ou ausência de código (ex: link clicado 2x)
    // Direciona para o login com aviso de checagem.
    // Isso evita a página 404 que causava o "travamento" do usuário.
    const authError = searchParams.get('error_description') || searchParams.get('error')
    if (authError) {
        console.error('Callback auth error from Supabase URL:', authError)
    }

    redirectTo.pathname = '/login'
    redirectTo.searchParams.set('message', 'auth_code_error')
    return NextResponse.redirect(redirectTo)
}
