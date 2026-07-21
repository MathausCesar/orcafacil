import { NextRequest, NextResponse } from 'next/server'
import { getAppBaseUrl } from '@/lib/app-url'
import { getResend } from '@/lib/resend'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { ZaclyEmailTemplate } from '@/components/emails/zacly-email-template'

type LifecycleProfile = {
    id: string
    email: string | null
    business_name: string | null
    created_at: string
    onboarded_at: string | null
    is_superadmin: boolean | null
    lifecycle_emails_enabled: boolean
    plan: string | null
    subscription_status: string | null
}

type LifecycleQuote = {
    id: string
    user_id: string
    client_name: string
    status: string | null
    created_at: string | null
    sent_at: string | null
    first_public_opened_at: string | null
}

type LifecycleStage = 'account_without_onboarding' | 'onboarded_without_quote' | 'quote_not_sent' | 'quote_not_opened'

const DAY = 24 * 60 * 60 * 1000

function isOlderThan(value: string | null, milliseconds: number, now: number) {
    if (!value) return false
    const timestamp = new Date(value).getTime()
    return Number.isFinite(timestamp) && now - timestamp >= milliseconds
}

function stageCopy(stage: LifecycleStage, profile: LifecycleProfile, quote?: LifecycleQuote) {
    const name = profile.business_name?.trim() || 'voce'
    const appUrl = getAppBaseUrl()

    switch (stage) {
        case 'account_without_onboarding':
            return {
                subject: 'Sua primeira proposta no Zacly esta a poucos passos',
                message: `Ola, ${name}. Escolha seu oficio e veja uma proposta pronta para adaptar ao seu proximo cliente.`,
                url: `${appUrl}/onboarding`,
                cta: 'Montar minha proposta',
            }
        case 'onboarded_without_quote':
            return {
                subject: 'Sua proposta sugerida ja esta pronta para virar um orcamento real',
                message: `Ola, ${name}. Abra a proposta com itens do seu oficio, informe cliente e valor e envie pelo WhatsApp.`,
                url: `${appUrl}/new?quick=1&starter=1&guided=proposal_test`,
                cta: 'Criar proposta para um cliente',
            }
        case 'quote_not_sent':
            return {
                subject: 'Seu orcamento esta pronto para enviar',
                message: `Ola, ${name}. A proposta para ${quote?.client_name || 'seu cliente'} esta salva. Compartilhe o link seguro pelo WhatsApp para acompanhar a resposta.`,
                url: `${appUrl}/quotes/${quote?.id || ''}`,
                cta: 'Enviar proposta',
            }
        case 'quote_not_opened':
            return {
                subject: 'Seu cliente ainda nao abriu a proposta',
                message: `Ola, ${name}. A proposta para ${quote?.client_name || 'seu cliente'} foi enviada, mas ainda nao foi aberta. Um lembrete educado pode ajudar a avancar.`,
                url: `${appUrl}/quotes/${quote?.id || ''}`,
                cta: 'Ver proposta e fazer follow-up',
            }
    }
}

function getDispatchDedupeKey(profile: LifecycleProfile, stage: LifecycleStage, quote?: LifecycleQuote) {
    const day = new Date().toISOString().slice(0, 10)
    return [profile.id, stage, quote?.id || 'account', day].join(':')
}

async function dispatchLifecycleEmail(
    // The lifecycle table is introduced in the same deployment migration and is not in generated types yet.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    db: any,
    profile: LifecycleProfile,
    stage: LifecycleStage,
    quote?: LifecycleQuote,
) {
    if (!profile.email) return 'skipped_no_email'

    const sevenDaysAgo = new Date(Date.now() - 7 * DAY).toISOString()
    const { data: recent } = await db
        .from('lifecycle_email_dispatches')
        .select('id')
        .eq('user_id', profile.id)
        .gte('created_at', sevenDaysAgo)
        .limit(1)

    if (recent?.length) return 'skipped_recent'

    const { data: dispatch, error: claimError } = await db
        .from('lifecycle_email_dispatches')
        .upsert(
            {
                user_id: profile.id,
                quote_id: quote?.id || null,
                stage,
                status: 'pending',
                dedupe_key: getDispatchDedupeKey(profile, stage, quote),
            },
            { onConflict: 'dedupe_key', ignoreDuplicates: true },
        )
        .select('id')
        .maybeSingle()

    if (claimError) {
        console.error('Lifecycle email claim failed:', claimError)
        return 'failed_claim'
    }

    if (!dispatch) {
        return 'skipped_duplicate'
    }

    const copy = stageCopy(stage, profile, quote)
    try {
        const result = await getResend().emails.send({
            from: process.env.EMAIL_FROM || 'Zacly <contato@zacly.com.br>',
            to: profile.email,
            subject: copy.subject,
            text: `${copy.message}\n\n${copy.cta}: ${copy.url}`,
            react: ZaclyEmailTemplate({
                preheader: copy.message,
                title: copy.subject,
                message: copy.message,
                ctaLabel: copy.cta,
                ctaUrl: copy.url,
                footer: 'Voce recebeu este lembrete porque iniciou uma etapa no Zacly. Entre na sua conta para continuar ou ignore esta mensagem.',
            }),
        })

        if (result.error) throw new Error(result.error.message)

        await db
            .from('lifecycle_email_dispatches')
            .update({ status: 'sent', sent_at: new Date().toISOString(), provider_message_id: result.data?.id || null })
            .eq('id', dispatch.id)
        return 'sent'
    } catch (error) {
        await db
            .from('lifecycle_email_dispatches')
            .update({ status: 'failed', error_message: error instanceof Error ? error.message.slice(0, 500) : 'Erro ao enviar' })
            .eq('id', dispatch.id)
        return 'failed_send'
    }
}

export async function GET(request: NextRequest) {
    const cronSecret = process.env.CRON_SECRET
    const authorization = request.headers.get('authorization')
    if (!cronSecret || authorization !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Nao autorizado.' }, { status: 401 })
    }

    if (!process.env.RESEND_API_KEY) {
        return NextResponse.json({ error: 'Email de ciclo de vida nao configurado.' }, { status: 503 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = getSupabaseAdmin() as any
    const { data: profiles, error } = await db
        .from('profiles')
        .select('id, email, business_name, created_at, onboarded_at, is_superadmin, lifecycle_emails_enabled, plan, subscription_status')
        .eq('lifecycle_emails_enabled', true)
        .or('is_superadmin.is.null,is_superadmin.eq.false')
        .limit(500)

    if (error) {
        console.error('Lifecycle profile lookup failed:', error)
        return NextResponse.json({ error: 'Falha ao carregar usuarios.' }, { status: 500 })
    }

    const now = Date.now()
    const summary: Record<string, number> = {}

    for (const profile of (profiles || []) as LifecycleProfile[]) {
        if (['active', 'trialing'].includes(profile.subscription_status || '') && profile.plan !== 'free') continue

        const { data: quotes } = await db
            .from('quotes')
            .select('id, user_id, client_name, status, created_at, sent_at, first_public_opened_at')
            .eq('user_id', profile.id)
            .order('created_at', { ascending: false })
            .limit(20)
        const quoteRows = (quotes || []) as LifecycleQuote[]

        let stage: LifecycleStage | null = null
        let quote: LifecycleQuote | undefined

        const sentWithoutOpen = quoteRows.find((item) => item.status === 'sent' && !item.first_public_opened_at && isOlderThan(item.sent_at, DAY, now))
        const draftWithoutSend = quoteRows.find((item) => item.status === 'draft' && isOlderThan(item.created_at, 2 * 60 * 60 * 1000, now))

        if (sentWithoutOpen) {
            stage = 'quote_not_opened'
            quote = sentWithoutOpen
        } else if (draftWithoutSend) {
            stage = 'quote_not_sent'
            quote = draftWithoutSend
        } else if (profile.onboarded_at && quoteRows.length === 0 && isOlderThan(profile.onboarded_at, DAY, now)) {
            stage = 'onboarded_without_quote'
        } else if (!profile.onboarded_at && isOlderThan(profile.created_at, 30 * 60 * 1000, now)) {
            stage = 'account_without_onboarding'
        }

        if (!stage) continue
        const result = await dispatchLifecycleEmail(db, profile, stage, quote)
        summary[result] = (summary[result] || 0) + 1
    }

    return NextResponse.json({ ok: true, summary })
}
