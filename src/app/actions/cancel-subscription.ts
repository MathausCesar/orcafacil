'use server'

import { createClient } from '@/lib/supabase/server'
import { getActiveOrganizationId } from '@/lib/get-active-organization'
import { getStripe } from '@/lib/stripe'
import { revalidatePath } from 'next/cache'
import type Stripe from 'stripe'

export interface CancellationData {
    reason: string
    additionalComments?: string
}

function getPeriodEnd(subscription: Stripe.Subscription) {
    return "current_period_end" in subscription && typeof subscription.current_period_end === "number"
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : null
}

function getPlanFromPriceId(priceId: string | null | undefined) {
    if (priceId && priceId === process.env.STRIPE_PRICE_YEARLY) return 'pro_yearly'
    return 'pro_monthly'
}

function isMissingColumnError(error: unknown) {
    return typeof error === 'object'
        && error !== null
        && 'code' in error
        && (error as { code?: unknown }).code === '42703'
}

async function findSubscriptionId(stripeCustomerId: string | null | undefined) {
    if (!stripeCustomerId) return null

    const stripe = getStripe()
    const subscriptions = await stripe.subscriptions.list({
        customer: stripeCustomerId,
        status: 'all',
        limit: 10,
    })

    const subscription = subscriptions.data.find((item) =>
        ['active', 'trialing', 'past_due', 'unpaid'].includes(item.status)
    )

    return subscription?.id ?? null
}

export async function cancelSubscription(data: CancellationData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Não autorizado.' }

    const orgId = await getActiveOrganizationId()

    const profileQuery = await supabase
        .from('profiles')
        .select('plan, stripe_customer_id, stripe_subscription_id')
        .eq('id', user.id)
        .single()

    let profile = profileQuery.data

    if (profileQuery.error && isMissingColumnError(profileQuery.error)) {
        const legacyProfileQuery = await supabase
            .from('profiles')
            .select('plan, stripe_customer_id')
            .eq('id', user.id)
            .single()

        if (legacyProfileQuery.error) {
            console.error('Error loading legacy billing profile:', legacyProfileQuery.error)
            return { error: 'Nao foi possivel carregar sua assinatura. Contate o suporte.' }
        }

        profile = {
            ...legacyProfileQuery.data,
            stripe_subscription_id: null,
        }
    } else if (profileQuery.error) {
        console.error('Error loading billing profile:', profileQuery.error)
        return { error: 'Nao foi possivel carregar sua assinatura. Contate o suporte.' }
    }

    if (!profile || !profile.plan || profile.plan === 'free') {
        return { success: true }
    }

    // Feedback nao deve impedir cancelamento de cobranca se a tabela ainda nao existir.
    const { error: feedbackError } = await supabase
        .from('cancellation_feedback')
        .insert({
            user_id: user.id,
            organization_id: orgId,
            reason: data.reason,
            additional_comments: data.additionalComments || null,
            plan: profile?.plan || 'free'
        })

    if (feedbackError) {
        console.error('Error saving cancellation feedback:', feedbackError)
    }

    const subscriptionId = profile.stripe_subscription_id
        || await findSubscriptionId(profile.stripe_customer_id)

    if (!subscriptionId) {
        return { error: 'Assinatura Stripe nao encontrada. Contate o suporte para cancelar com seguranca.' }
    }

    const stripe = getStripe()
    const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
    })

    const priceId = subscription.items.data[0]?.price?.id ?? null

    const updatePayload = {
        plan: getPlanFromPriceId(priceId),
        stripe_subscription_id: subscription.id,
        stripe_price_id: priceId,
        subscription_status: subscription.status,
        current_period_end: getPeriodEnd(subscription),
        cancel_at_period_end: subscription.cancel_at_period_end,
        updated_at: new Date().toISOString(),
    }

    const { error: updateError } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('id', user.id)

    if (updateError) {
        if (isMissingColumnError(updateError)) {
            const { error: legacyUpdateError } = await supabase
                .from('profiles')
                .update({
                    plan: updatePayload.plan,
                    subscription_status: updatePayload.subscription_status,
                    updated_at: updatePayload.updated_at,
                })
                .eq('id', user.id)

            if (!legacyUpdateError) {
                revalidatePath('/app/profile')
                revalidatePath('/app')
                return { success: true, cancelAtPeriodEnd: true, migrationRequired: true }
            }

            console.error('Error updating legacy billing profile:', legacyUpdateError)
        }

        console.error('Error downgrading plan:', updateError)
        return { error: 'Assinatura marcada para cancelamento no Stripe, mas houve erro ao atualizar o app. Contate o suporte.' }
    }

    revalidatePath('/app/profile')
    revalidatePath('/app')

    return { success: true, cancelAtPeriodEnd: true }
}
