'use client'

import { useEffect } from 'react'
import type { SupabaseClient, User } from '@supabase/supabase-js'
import posthog from 'posthog-js'
import { createClient } from '@/lib/supabase/client'
import type { Database, Json } from '@/types/database.types'
import {
    captureEvent,
    captureActivationStage,
    captureConversion,
    captureException,
    getCurrentAnalyticsUrl,
    getStoredAttribution,
    isPaidAttribution,
} from '@/lib/analytics'
import { getEntitledPlan } from '@/lib/proposal-style'

type ProfileRow = Pick<
    Database['public']['Tables']['profiles']['Row'],
    'business_name' | 'email' | 'plan' | 'subscription_status' | 'onboarded_at' | 'quote_settings'
>

type ProfileClient = SupabaseClient<Database>

function compact(properties: Record<string, unknown>) {
    return Object.entries(properties).reduce<Record<string, unknown>>((acc, [key, value]) => {
        if (value === undefined || value === '') return acc
        acc[key] = value
        return acc
    }, {})
}

function getOnboardingInfo(settings: Json | null) {
    if (!settings || typeof settings !== 'object' || Array.isArray(settings)) return {}

    const onboarding = (settings as Record<string, unknown>).onboarding
    if (!onboarding || typeof onboarding !== 'object' || Array.isArray(onboarding)) return {}

    const data = onboarding as Record<string, unknown>

    return compact({
        onboarding_category_id: data.categoryId,
        onboarding_category_slug: data.categorySlug,
        onboarding_category_name: data.categoryName,
        onboarding_pricing_tier: data.pricingTier,
        onboarding_professional_context: data.professionalContext,
        onboarding_specialty_count: Array.isArray(data.specialties) ? data.specialties.length : undefined,
    })
}

function getAuthProvider(user: User) {
    const appProvider = user.app_metadata?.provider
    if (typeof appProvider === 'string') return appProvider

    const identityProvider = user.identities?.[0]?.provider
    return typeof identityProvider === 'string' ? identityProvider : 'password'
}

async function getProfile(supabase: ProfileClient, userId: string): Promise<ProfileRow | null> {
    const { data, error } = await supabase
        .from('profiles')
        .select('business_name, email, plan, subscription_status, onboarded_at, quote_settings')
        .eq('id', userId)
        .maybeSingle()

    if (error) {
        captureException(error, {
            source: 'user_analytics_profile_fetch',
        })
        return null
    }

    return data
}

async function identifyUser(supabase: ProfileClient, user: User) {
    const profile = await getProfile(supabase, user.id)
    const attribution = getStoredAttribution()
    const onboarding = getOnboardingInfo(profile?.quote_settings || null)
    const authProvider = getAuthProvider(user)
    const subscriptionStatus = profile?.subscription_status || 'none'
    const billingPlan = profile?.plan || 'free'
    const plan = getEntitledPlan(billingPlan, subscriptionStatus)
    const paidTraffic = isPaidAttribution(attribution)

    const currentProperties = compact({
        email: profile?.email || user.email,
        business_name: profile?.business_name,
        plan,
        billing_plan: billingPlan,
        subscription_status: subscriptionStatus,
        onboarded: Boolean(profile?.onboarded_at),
        auth_provider: authProvider,
        last_seen_at: new Date().toISOString(),
        last_url: getCurrentAnalyticsUrl(),
        last_landing_path: attribution.landing_path,
        last_utm_source: attribution.utm_source,
        last_utm_medium: attribution.utm_medium,
        last_utm_campaign: attribution.utm_campaign,
        last_utm_content: attribution.utm_content,
        last_utm_term: attribution.utm_term,
        has_google_click_id: Boolean(attribution.gclid),
        ...onboarding,
    })

    const firstTouchProperties = compact({
        signup_date: user.created_at,
        first_seen_at: new Date().toISOString(),
        first_landing_path: attribution.landing_path,
        first_utm_source: attribution.utm_source,
        first_utm_medium: attribution.utm_medium,
        first_utm_campaign: attribution.utm_campaign,
        first_utm_content: attribution.utm_content,
        first_utm_term: attribution.utm_term,
        first_gclid: attribution.gclid,
    })

    posthog.identify(user.id, currentProperties, firstTouchProperties)
    posthog.register({
        app_user_id: user.id,
        plan,
        subscription_status: subscriptionStatus,
        onboarding_category_slug: currentProperties.onboarding_category_slug,
        onboarding_professional_context: currentProperties.onboarding_professional_context,
    })

    if (paidTraffic) {
        try {
            posthog.startSessionRecording({ linked_flag: true, sampling: true })
        } catch {
            // Session replay can be controlled by PostHog settings; analytics should continue either way.
        }
    }

    const createdAt = user.created_at ? new Date(user.created_at).getTime() : 0
    const accountAgeHours = createdAt ? (Date.now() - createdAt) / (1000 * 60 * 60) : null
    const signupStorageKey = `zacly_signup_completed_${user.id}`

    if (
        accountAgeHours !== null &&
        accountAgeHours >= 0 &&
        accountAgeHours <= 168 &&
        !window.localStorage.getItem(signupStorageKey)
    ) {
        window.localStorage.setItem(signupStorageKey, '1')
        captureConversion('signup_completed', {
            auth_provider: authProvider,
            paid_traffic: paidTraffic,
            has_google_click_id: Boolean(attribution.gclid),
            utm_campaign: attribution.utm_campaign,
            account_age_hours: Math.round(accountAgeHours * 10) / 10,
            transaction_id: user.id,
        })
    }

    const accountCreatedStageKey = `zacly_activation_stage_account_created_not_onboarded_${user.id}`
    if (!profile?.onboarded_at && !window.localStorage.getItem(accountCreatedStageKey)) {
        window.localStorage.setItem(accountCreatedStageKey, '1')
        captureActivationStage('account_created_not_onboarded', {
            auth_provider: authProvider,
            plan,
            subscription_status: subscriptionStatus,
            paid_traffic: paidTraffic,
            utm_campaign: attribution.utm_campaign,
            has_google_click_id: Boolean(attribution.gclid),
            account_age_hours: accountAgeHours !== null ? Math.round(accountAgeHours * 10) / 10 : undefined,
        })
    }

    const sessionKey = `zacly_identified_session_${user.id}`
    if (!window.sessionStorage.getItem(sessionKey)) {
        window.sessionStorage.setItem(sessionKey, '1')
        captureEvent('app_user_identified', {
            auth_provider: authProvider,
            plan,
            subscription_status: subscriptionStatus,
            onboarded: Boolean(profile?.onboarded_at),
            paid_traffic: paidTraffic,
            utm_campaign: attribution.utm_campaign,
            has_google_click_id: Boolean(attribution.gclid),
        })
    }
}

export function UserAnalyticsProvider() {
    useEffect(() => {
        const supabase = createClient()
        let active = true

        const identifyCurrentUser = async (user: User | null) => {
            if (!active) return

            if (!user) {
                return
            }

            try {
                await identifyUser(supabase, user)
            } catch (error) {
                captureException(error, {
                    source: 'user_analytics_identify',
                })
            }
        }

        supabase.auth.getUser().then(({ data }) => {
            void identifyCurrentUser(data.user)
        })

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') {
                posthog.reset()
                return
            }

            if (session?.user && ['SIGNED_IN', 'TOKEN_REFRESHED', 'USER_UPDATED', 'INITIAL_SESSION'].includes(event)) {
                window.setTimeout(() => {
                    void identifyCurrentUser(session.user)
                }, 0)
            }
        })

        return () => {
            active = false
            authListener.subscription.unsubscribe()
        }
    }, [])

    return null
}
