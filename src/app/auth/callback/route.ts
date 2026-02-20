import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // Define o padrão como /login caso não haja next param
    const next = searchParams.get('next') ?? '/login'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            // Em caso de sucesso na verificação e criação de sessão,
            // redireciona para o destino (que por padrão será /login, ou interceptado pelo middleware para /dashboard)
            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    // Falha na verificação do código ou ausência de código (ex: link clicado 2x)
    // Direciona para o login com aviso de checagem.
    // Isso evita a página 404 que causava o "travamento" do usuário.
    return NextResponse.redirect(`${origin}/login?message=auth_code_error`)
}
