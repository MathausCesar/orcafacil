import { QuoteForm, type QuoteItem } from '@/components/quotes/quote-form'
import { createClient } from '@/lib/supabase/server'
import { getActiveOrganizationId } from '@/lib/get-active-organization'
import { getEntitledPlan, isFreePlan, normalizeProposalModel } from '@/lib/proposal-style'
import { getProfessionalContext } from '@/lib/professional-context'
import { PRICING } from '@/lib/pricing-copy'
import { getInitialCatalogForOnboarding, parseOnboardingQuoteSettings } from '@/lib/onboarding-catalog'
import {
    buildStarterQuoteItemsFromCatalog,
    catalogSeedToStarterItems,
    type StarterCatalogItem,
} from '@/lib/starter-quote'
import {
    getLayoutRecommendationForContext,
    getLayoutRecommendationFromQuoteHistory,
    getLayoutRecommendationFromQuoteSettings,
    type QuoteLayoutHistoryRecord,
} from '@/lib/profession-layout-recommendations'

type NewQuotePageProps = {
    searchParams: Promise<{
        clientName?: string
        quick?: string
        starter?: string
        demo?: string
        guided?: string
    }>
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
    const { clientName, quick, starter, demo, guided } = await searchParams
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const orgId = user ? await getActiveOrganizationId(supabase) : null

    const [profileResult, quoteCountResult, quoteHistoryResult, proSampleCountResult] = user
        ? await Promise.all([
            supabase
                .from('profiles')
                .select('business_name, logo_url, layout_style, theme_color, primary_color, quote_settings, plan, subscription_status, pro_trial_ends_at')
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
            orgId
                ? supabase
                    .from('quotes')
                    .select('id', { count: 'exact', head: true })
                    .eq('organization_id', orgId)
                    .eq('experience_mode', 'pro_sample')
                : Promise.resolve({ count: 0 }),
        ])
        : [{ data: null }, { count: 0 }, { data: [] as QuoteLayoutHistoryRecord[] }, { count: 0 }]

    const profile = profileResult.data
    const accessPlan = getEntitledPlan(profile?.plan, profile?.subscription_status, profile?.pro_trial_ends_at)
    const isFree = isFreePlan(accessPlan)
    const proSampleAvailable = isFree && (proSampleCountResult.count ?? 0) < PRICING.proSampleQuotes
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
    const starterMode = quickMode && (starter === '1' || demo === '1' || guided === 'proposal_test')
    let starterQuoteItems: QuoteItem[] = []

    if (starterMode && orgId) {
        const { data: catalogRows } = await supabase
            .from('services')
            .select('id, description, details, default_price, cost_price, type, unit')
            .eq('organization_id', orgId)
            .limit(80)

        const persistedCatalog: StarterCatalogItem[] = (catalogRows || []).map((item) => ({
            id: item.id,
            description: item.description,
            details: item.details,
            default_price: Number(item.default_price) || 0,
            cost_price: Number(item.cost_price) || 0,
            type: item.type,
            unit: item.unit,
            persisted: true,
        }))

        const fallbackCatalog = catalogSeedToStarterItems(
            getInitialCatalogForOnboarding(
                onboardingSettings?.categorySlug,
                onboardingSettings?.specialties || [],
            ),
        )

        starterQuoteItems = buildStarterQuoteItemsFromCatalog(
            persistedCatalog.length > 0 ? persistedCatalog : fallbackCatalog,
            professionalContext.id,
        )
    }

    return (
        <QuoteForm
            quickMode={quickMode}
            starterMode={starterMode && starterQuoteItems.length > 0}
            plan={accessPlan}
            proSampleAvailable={proSampleAvailable}
            layoutRecommendation={layoutRecommendation}
            brandPreview={{
                businessName: profile?.business_name || null,
                logoUrl: profile?.logo_url || null,
                accentColor: profile?.theme_color || profile?.primary_color || null,
                hasLogoAnalysis: hasLogoAnalysis(profile?.quote_settings),
            }}
            initialData={{
                // Starter items are prefilled, but the customer remains intentional so this can become a real proposal.
                clientName: clientName || '',
                experienceMode: isFree ? 'free_simple' : 'pro',
                layoutStyle: suggestedLayout,
                professionalContext: quickMode ? professionalContext.id : 'general',
                showTimeline: quickMode,
                estimatedDays: quickMode ? String(professionalContext.defaultEstimatedDays) : '',
                showPaymentOptions: quickMode && suggestedPaymentMethods.length > 0,
                paymentMethods: quickMode ? suggestedPaymentMethods : [],
                installmentCount: quickMode && suggestedPaymentMethods.includes('installment') ? '3' : '',
                notes: quickMode ? professionalContext.defaultNotes : '',
                items: starterQuoteItems
            }}
        />
    )
}
