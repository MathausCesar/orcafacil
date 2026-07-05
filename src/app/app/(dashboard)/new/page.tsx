import { QuoteForm } from '@/components/quotes/quote-form'
import { createClient } from '@/lib/supabase/server'
import { getActiveOrganizationId } from '@/lib/get-active-organization'
import { FREE_PROPOSAL_MODEL, isFreePlan, normalizeProposalModel } from '@/lib/proposal-style'
import { getProfessionalContext } from '@/lib/professional-context'
import { parseOnboardingQuoteSettings } from '@/lib/onboarding-catalog'
import {
    getLayoutRecommendationForContext,
    getLayoutRecommendationFromQuoteHistory,
    getLayoutRecommendationFromQuoteSettings,
    type QuoteLayoutHistoryRecord,
} from '@/lib/profession-layout-recommendations'

type NewQuotePageProps = {
    searchParams: Promise<{ clientName?: string; quick?: string }>
}

function hasLogoAnalysis(value: unknown) {
    try {
        const settings = typeof value === 'string' ? JSON.parse(value) : value
        return Boolean(
            settings
            && typeof settings === 'object'
            && !Array.isArray(settings)
            && (settings as Record<string, unknown>).logoAnalysis
        )
    } catch {
        return false
    }
}

export default async function NewQuotePage({ searchParams }: NewQuotePageProps) {
    const { clientName, quick } = await searchParams
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const orgId = user ? await getActiveOrganizationId(supabase) : null

    const [profileResult, quoteCountResult, quoteHistoryResult] = user
        ? await Promise.all([
            supabase
                .from('profiles')
                .select('business_name, logo_url, layout_style, theme_color, primary_color, quote_settings, plan')
                .eq('id', user.id)
                .maybeSingle(),
            orgId
                ? supabase
                    .from('quotes')
                    .select('id', { count: 'exact', head: true })
                    .eq('organization_id', orgId)
                : Promise.resolve({ count: 0 }),
            orgId
                ? supabase
                    .from('quotes')
                    .select('layout_style, professional_context, status')
                    .eq('organization_id', orgId)
                    .in('status', ['approved', 'rejected', 'changes_requested', 'in_progress', 'completed'])
                    .limit(120)
                : Promise.resolve({ data: [] as QuoteLayoutHistoryRecord[] }),
        ])
        : [{ data: null }, { count: 0 }, { data: [] as QuoteLayoutHistoryRecord[] }]

    const profile = profileResult.data
    const isFree = isFreePlan(profile?.plan)
    const quickMode = quick === '1' || (quoteCountResult.count ?? 0) === 0
    const onboardingSettings = quickMode
        ? parseOnboardingQuoteSettings(profile?.quote_settings)
        : null
    const professionalContext = getProfessionalContext(onboardingSettings?.professionalContext)
    const suggestedPaymentMethods = [...professionalContext.suggestedPaymentMethods]
    const onboardingRecommendation = getLayoutRecommendationFromQuoteSettings(profile?.quote_settings)
    const tradeRecommendation = getLayoutRecommendationForContext(professionalContext.id)
    const historyRecommendation = getLayoutRecommendationFromQuoteHistory(
        (quoteHistoryResult.data || []) as QuoteLayoutHistoryRecord[],
        professionalContext.id,
    )
    const layoutRecommendation = historyRecommendation || onboardingRecommendation || tradeRecommendation
    const suggestedLayout = normalizeProposalModel(
        layoutRecommendation.model || onboardingSettings?.recommendedLayout || profile?.layout_style,
    )

    return (
        <QuoteForm
            quickMode={quickMode}
            plan={profile?.plan}
            layoutRecommendation={layoutRecommendation}
            brandPreview={{
                businessName: profile?.business_name || null,
                logoUrl: profile?.logo_url || null,
                accentColor: isFree ? profile?.primary_color || null : profile?.theme_color || profile?.primary_color || null,
                hasLogoAnalysis: hasLogoAnalysis(profile?.quote_settings),
            }}
            initialData={{
                clientName: clientName || '',
                layoutStyle: isFree ? FREE_PROPOSAL_MODEL : suggestedLayout,
                professionalContext: quickMode ? professionalContext.id : 'general',
                showTimeline: quickMode,
                estimatedDays: quickMode ? String(professionalContext.defaultEstimatedDays) : '',
                showPaymentOptions: quickMode && suggestedPaymentMethods.length > 0,
                paymentMethods: quickMode ? suggestedPaymentMethods : [],
                installmentCount: quickMode && suggestedPaymentMethods.includes('installment') ? '3' : '',
                notes: quickMode ? professionalContext.defaultNotes : '',
                items: []
            }}
        />
    )
}
