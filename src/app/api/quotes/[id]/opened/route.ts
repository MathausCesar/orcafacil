import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { captureServerActivationStage, captureServerEvent } from '@/lib/server-analytics'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const body = await request.json().catch(() => ({})) as { token?: unknown }
    const token = typeof body.token === 'string' ? body.token : ''

    if (!token) {
        return NextResponse.json({ error: 'Token ausente.' }, { status: 400 })
    }

    // The new timestamp column is introduced by the accompanying migration.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const admin = getSupabaseAdmin() as any
    const { data: quote, error } = await admin
        .from('quotes')
        .select('id, user_id, status, experience_mode, professional_context, first_public_opened_at')
        .eq('id', id)
        .eq('public_token', token)
        .maybeSingle()

    if (error || !quote) {
        return NextResponse.json({ error: 'Proposta nao encontrada.' }, { status: 404 })
    }

    if (!quote.first_public_opened_at) {
        const openedAt = new Date().toISOString()
        const { data: openedQuote } = await admin
            .from('quotes')
            .update({ first_public_opened_at: openedAt })
            .eq('id', id)
            .eq('public_token', token)
            .is('first_public_opened_at', null)
            .select('id')
            .maybeSingle()

        // Only the request that actually writes the first-open timestamp emits
        // an event, avoiding duplicate opening counts on reloads or races.
        if (openedQuote) {
            const payload = {
                quote_id: quote.id,
                quote_status: quote.status || 'unknown',
                experience_mode: quote.experience_mode || 'free_simple',
                professional_context: quote.professional_context || 'general',
                source: 'visible_public_quote_page',
            }
            await captureServerEvent('quote_public_open_confirmed', quote.user_id, payload)
            if (quote.experience_mode === 'free_simple') {
                await captureServerActivationStage(quote.user_id, 'client_opened_free', payload)
            }
        }
    }

    return NextResponse.json({ ok: true })
}
