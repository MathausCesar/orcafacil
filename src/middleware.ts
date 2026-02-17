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

    // Protected routes pattern
    const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') ||
        request.nextUrl.pathname.startsWith('/onboarding') ||
        request.nextUrl.pathname.startsWith('/orcamentos')

    const isAuthRoute = request.nextUrl.pathname.startsWith('/login') ||
        request.nextUrl.pathname.startsWith('/register')

    if (isProtectedRoute && !user) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    if (isAuthRoute && user) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return response
}

export async function middleware(request: NextRequest) {
    try {
        return await updateSession(request)
    } catch (e) {
        console.error('MIDDLEWARE ERROR:', e)
        // Return next response to avoid blocking the request completely on error
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
