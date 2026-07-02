import { QuoteForm } from '@/components/quotes/quote-form'
import { createClient } from '@/lib/supabase/server'
import { getActiveOrganizationId } from '@/lib/get-active-organization'
import { FREE_PROPOSAL_MODEL, isFreePlan, normalizeProposalModel } from '@/lib/proposal-style'
import { getProfessionalContext } from '@/lib/professional-context'
import { parseOnboardingQuoteSettings } from '@/lib/onboarding-catalog'

type NewQuotePageProps = {
    searchParams: Promise<{ clientName?: string; quick?: string }>
}

export default async function NewQuotePage({ searchParams }: NewQuotePageProps) {
    const { clientName, quick } = await searchParams
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const orgId = user ? await getActiveOrganizationId(supabase) : null

    const [profileResult, quoteCountResult] = user
        ? await Promise.all([
            supabase
                .from('profiles')
                .select('layout_style, quote_settings, plan')
                .eq('id', user.id)
                .maybeSingle(),
            orgId
                ? supabase
                    .from('quotes')
                    .select('id', { count: 'exact', head: true })
                    .eq('organization_id', orgId)
                : Promise.resolve({ count: 0 }),
        ])
        : [{ data: null }, { count: 0 }]

    const profile = profileResult.data
    const isFree = isFreePlan(profile?.plan)
    const quickMode = quick === '1' || (quoteCountResult.count ?? 0) === 0
    const onboardingSettings = quickMode
        ? parseOnboardingQuoteSettings(profile?.quote_settings)
        : null
    const professionalContext = getProfessionalContext(onboardingSettings?.professionalContext)
    const suggestedPaymentMethods = [...professionalContext.suggestedPaymentMethods]

    return (
        <QuoteForm
            quickMode={quickMode}
            plan={profile?.plan}
            initialData={{
                clientName: clientName || '',
                layoutStyle: isFree ? FREE_PROPOSAL_MODEL : normalizeProposalModel(profile?.layout_style),
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
