import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { QuoteForm, type QuoteItem } from '@/components/quotes/quote-form'
import { FREE_PROPOSAL_MODEL, getEntitledPlan, isFreePlan } from '@/lib/proposal-style'
import { getLayoutRecommendationForContext } from '@/lib/profession-layout-recommendations'

interface PageProps {
    params: Promise<{ id: string }>
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

type QuoteItemRecord = {
    id: string
    service_id?: string | null
    item_type?: 'service' | 'product' | string | null
    description: string
    details?: string | null
    quantity?: number | null
    unit_price?: number | null
    unit_cost?: number | null
    cost_is_known?: boolean | null
}

export default async function EditQuotePage(props: PageProps) {
    const params = await props.params;
    const { id } = params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: quote, error } = await supabase
        .from('quotes')
        .select(`
            *,
            quote_items (*)
        `)
        .eq('id', id)
        .single()

    if (error || !quote) {
        notFound()
    }

    if (quote.user_id !== user.id) {
        redirect('/') // Unauthorized
    }

    // Block editing for in_progress and completed quotes
    if (['in_progress', 'completed'].includes(quote.status)) {
        redirect(`/quotes/${id}`)
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('business_name, logo_url, theme_color, primary_color, quote_settings, plan, subscription_status, pro_trial_ends_at, target_margin_percent')
        .eq('id', user.id)
        .maybeSingle()

    const accessPlan = getEntitledPlan(profile?.plan, profile?.subscription_status, profile?.pro_trial_ends_at)
    const isFree = isFreePlan(accessPlan)
    const experienceMode: 'free_simple' | 'pro_sample' | 'pro' = quote.experience_mode === 'pro_sample'
        ? 'pro_sample'
        : isFree
            ? 'free_simple'
            : 'pro'

    // Transform data for QuoteForm
    const initialData = {
        id: quote.id,
        clientId: quote.client_id || null,
        clientName: quote.client_name,
        clientPhone: quote.client_phone,
        expirationDate: quote.expiration_date,
        paymentTerms: quote.payment_terms,
        notes: quote.notes,
        showDetailedItems: quote.show_detailed_items || false,
        showTimeline: quote.show_timeline || false,
        showPaymentOptions: quote.show_payment_options || false,
        estimatedDays: quote.estimated_days || '',
        cashDiscountPercent: quote.cash_discount_percent || 0,
        cashDiscountFixed: quote.cash_discount_fixed || 0,
        cashDiscountType: quote.cash_discount_type || 'percent',
        depositAmount: quote.deposit_amount || 0,
        targetMarginPercent: quote.target_margin_percent || profile?.target_margin_percent || 30,
        paymentMethods: quote.payment_methods || [],
        installmentCount: quote.installment_count || '',
        experienceMode,
        layoutStyle: experienceMode === 'free_simple' ? FREE_PROPOSAL_MODEL : quote.layout_style || FREE_PROPOSAL_MODEL,
        professionalContext: quote.professional_context || 'general',
        items: (quote.quote_items as QuoteItemRecord[]).map((item): QuoteItem => ({
            id: item.id, // Or generate random if needed, but ID is fine
            serviceId: item.service_id || null,
            itemType: item.item_type === 'product' ? 'product' : 'service',
            description: item.description,
            details: item.details,
            quantity: item.quantity || 0,
            unitPrice: item.unit_price || 0,
            unitCost: item.unit_cost || 0,
            costIsKnown: item.cost_is_known ?? Number(item.unit_cost || 0) > 0,
        }))
    }

    return (
        <div className="container max-w-4xl mx-auto py-8 px-4">
            <QuoteForm
                initialData={initialData}
                plan={accessPlan}
                layoutRecommendation={getLayoutRecommendationForContext(quote.professional_context)}
                brandPreview={{
                    businessName: profile?.business_name || null,
                    logoUrl: profile?.logo_url || null,
                    accentColor: profile?.theme_color || profile?.primary_color || null,
                    hasLogoAnalysis: hasLogoAnalysis(profile?.quote_settings),
                }}
            />
        </div>
    )
}
