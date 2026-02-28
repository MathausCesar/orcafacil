import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    return { response, user }
}

export async function middleware(request: NextRequest) {
    try {
        const { response, user } = await updateSession(request)

        const url = request.nextUrl
        const hostname = request.headers.get('host') || ''

        // Definindo os URLs base da Vercel para ambiente de preview/dev e o de prod
        const isAppDomain = hostname.startsWith('app.') || hostname.includes('app-zacly'); // app-zacly no preview da vercel
        const isMarketingDomain = !isAppDomain && (hostname.includes('zacly.com.br') || hostname.includes('localhost'));

        // Paths base do Next.js
        const path = url.pathname;

        // --- PROTEÇÃO DE ROTAS (Autenticação) ---
        const isProtectedRoute =
            path.startsWith('/dashboard') ||
            path.startsWith('/onboarding') ||
            path.startsWith('/orcamentos') ||
            path.startsWith('/quotes') ||
            path.startsWith('/update-password');

        const isAuthRoute =
            path.startsWith('/login') ||
            path.startsWith('/register') ||
            path.startsWith('/forgot-password');

        // Se a rota for protegida e o usuário não estiver logado
        if (isProtectedRoute && !user) {
            // Mandamos para a tela de login. Como login está no app, mantemos no domínio atual ou forçamos o app subdomínio (depende da estratégia, vamos manter na url atual)
            return NextResponse.redirect(new URL('/login', request.url))
        }

        // Se tentar acessar rota de autenticação já logado, vai pro dashboard
        if (isAuthRoute && user) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }

        // --- ROTEAMENTO MULTI-DOMÍNIO ---

        // Se já está acessando diretamente as pastas internas (não deveria, mas protege), deixamos passar
        if (path.startsWith('/app') || path.startsWith('/marketing')) {
            return response;
        }

        // Se for o domínio do App
        if (isAppDomain) {
            // Injetamos o cabeçalho "noindex"
            response.headers.set('X-Robots-Tag', 'noindex, nofollow');

            // Fazemos o rewrite invisível para a pasta /app
            const appUrl = new URL(`/app${path === '/' ? '/dashboard' : path}`, request.url);

            // Repassamos os cookies da resosta atual pro novo rewrite
            const rewriteResponse = NextResponse.rewrite(appUrl);
            rewriteResponse.headers.set('X-Robots-Tag', 'noindex, nofollow');
            return rewriteResponse;
        }

        // Se for o domínio de Marketing (ou localhost base)
        if (isMarketingDomain) {
            const marketingUrl = new URL(`/marketing${path === '/' ? '' : path}`, request.url);
            return NextResponse.rewrite(marketingUrl);
        }

        return response
    } catch (e) {
        console.error('MIDDLEWARE ERROR:', e)
        return NextResponse.next({
            request: {
                headers: request.headers,
            },
        })
    }
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, robots.txt, sitemap.xml, manifest files
         * - api routes (handled separately)
         * - static assets (images, fonts, etc.)
         */
        '/((?!_next/static|_next/image|api|favicon.ico|robots.txt|sitemap.xml|manifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)$).*)',
    ],
}
