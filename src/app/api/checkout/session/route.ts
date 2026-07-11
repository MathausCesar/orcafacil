import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'

export async function GET(request: NextRequest) {
    const sessionId = request.nextUrl.searchParams.get('session_id')
    if (!sessionId) {
        return NextResponse.json({ error: 'Sessao de checkout ausente.' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Nao autorizado.' }, { status: 401 })
    }

    try {
        const session = await getStripe().checkout.sessions.retrieve(sessionId)
        const ownerId = session.client_reference_id || session.metadata?.userId

        if (ownerId !== user.id) {
            return NextResponse.json({ error: 'Sessao nao pertence ao usuario autenticado.' }, { status: 403 })
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('plan, subscription_status')
            .eq('id', user.id)
            .maybeSingle()

        const subscriptionActive = ['active', 'trialing'].includes(profile?.subscription_status || '')
            && ['pro_monthly', 'pro_yearly'].includes(profile?.plan || '')

        return NextResponse.json({
            checkoutStatus: session.status,
            paymentStatus: session.payment_status,
            subscriptionActive,
        })
    } catch (error) {
        console.error('Checkout session confirmation failed:', error)
        return NextResponse.json({ error: 'Nao foi possivel confirmar o pagamento agora.' }, { status: 500 })
    }
}
