import { createServerClient } from '@supabase/ssr'
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
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => {
                        request.cookies.set(name, value)
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    cookiesToSet.forEach(({ name, value, options }) => {
                        response.cookies.set(name, value, options)
                    })
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    return { response, user, supabase }
}

export async function proxy(request: NextRequest) {
    try {
        const { response, user, supabase } = await updateSession(request)

        const url = request.nextUrl
        const hostname = request.headers.get('host') || ''

        // --- PREVENÇÃO DE LOOPS DE REWRITE ---
        // Ignora requests que já passaram por rewrite ou são chamadas internas do App Router (/app ou /marketing visível no path)
        const isInternalAppPath = url.pathname === '/app' || url.pathname.startsWith('/app/')
        const isInternalMarketingPath = url.pathname === '/marketing' || url.pathname.startsWith('/marketing/')

        if (isInternalAppPath || isInternalMarketingPath || url.pathname.includes('_next')) {
            return response;
        }

        // Definindo os URLs base da Vercel para ambiente de preview/dev e o de prod
        // Paths base do Next.js
        const path = url.pathname;
        const isLocalHost = hostname.startsWith('localhost') || hostname.startsWith('127.0.0.1')
        const isLocalAppPath = isLocalHost && (
            path === '/login' ||
            path === '/register' ||
            path === '/forgot-password' ||
            path === '/update-password' ||
            path === '/quotes' ||
            path.startsWith('/quotes/') ||
            path.startsWith('/new') ||
            path.startsWith('/clients') ||
            path.startsWith('/catalog') ||
            path.startsWith('/profile') ||
            path.startsWith('/pricing') ||
            path.startsWith('/dashboard') ||
            path.startsWith('/onboarding') ||
            path.startsWith('/admin') ||
            path.startsWith('/auth/callback')
        )

        const isAppDomain = hostname.startsWith('app.') || hostname.includes('app-zacly') || isLocalAppPath; // app-zacly no preview da vercel
        const isMarketingDomain = !isAppDomain && (hostname.includes('zacly.com.br') || hostname.includes('localhost'));

        // --- PROTEÇÃO DE ROTAS (Autenticação) ---
        // Apenas listamos as rotas que dependem de auth na nossa app
        const isProtectedRoute = isAppDomain && (
            path === '/' ||
            path === '/quotes' || // A listagem é protegida
            path.startsWith('/new') ||
            path.startsWith('/clients') ||
            path.startsWith('/profile') ||
            path.startsWith('/pricing') ||
            path.startsWith('/dashboard') ||
            path.startsWith('/onboarding') ||
            path.startsWith('/orcamentos') ||
            path.startsWith('/update-password')
        );

        const isAuthRoute =
            path.startsWith('/login') ||
            path.startsWith('/register') ||
            path.startsWith('/forgot-password');

        const isAdminRoute = path.startsWith('/admin');

        // Se a rota for protegida e o usuário não estiver logado
        if ((isProtectedRoute || isAdminRoute) && !user) {
            return NextResponse.redirect(new URL('/login', request.url))
        }

        // Bloqueia acesso à rota admin se não for superadmin
        if (isAdminRoute && user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('is_superadmin')
                .eq('id', user.id)
                .single();

            if (!profile?.is_superadmin) {
                return NextResponse.redirect(new URL('/', request.url))
            }
        }

        // Se tentar acessar rota de autenticação já logado, vai pro dashboard
        if (isAuthRoute && user) {
            return NextResponse.redirect(new URL('/', request.url))
        }

        // --- ROTEAMENTO MULTI-DOMÍNIO ---

        // Se for o domínio do App
        if (isAppDomain) {
            // Fazemos o rewrite invisível para a pasta /app (path === '/' vira /app, não /app/dashboard)
            const appPath = path === '/' ? '' : path;
            const appUrl = new URL(`/app${appPath}`, request.url);
            appUrl.search = url.search;

            const rewriteResponse = NextResponse.rewrite(appUrl);

            // Repassamos os cookies da sessão atualizados pelo supabase
            response.cookies.getAll().forEach(cookie => {
                rewriteResponse.cookies.set(cookie.name, cookie.value);
            });

            // Injetamos o cabeçalho "noindex"
            rewriteResponse.headers.set('X-Robots-Tag', 'noindex, nofollow');

            return rewriteResponse;
        }

        // Se for o domínio de Marketing (ou localhost base)
        if (isMarketingDomain) {
            const marketingUrl = new URL(`/marketing${path === '/' ? '' : path}`, request.url);
            marketingUrl.search = url.search;
            const rewriteResponse = NextResponse.rewrite(marketingUrl);

            // Repassamos os cookies da sessão atualizados pelo supabase
            response.cookies.getAll().forEach(cookie => {
                rewriteResponse.cookies.set(cookie.name, cookie.value);
            });

            return rewriteResponse;
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
         * - _next (framework assets, image optimization and dev HMR)
         * - favicon.ico, robots.txt, sitemap.xml, manifest files
         * - api routes (handled separately)
         * - static assets (images, fonts, etc.)
         */
        '/((?!_next|api|favicon.ico|robots.txt|sitemap.xml|manifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)$).*)',
    ],
}
