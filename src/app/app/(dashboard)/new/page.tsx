import { QuoteForm } from '@/components/quotes/quote-form'
import { createClient } from '@/lib/supabase/server'
import { getActiveOrganizationId } from '@/lib/get-active-organization'
import { normalizeProposalModel } from '@/lib/proposal-style'

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
                .select('layout_style')
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
    const quickMode = quick === '1' || (quoteCountResult.count ?? 0) === 0

    return (
        <QuoteForm
            quickMode={quickMode}
            initialData={{
                clientName: clientName || '',
                layoutStyle: normalizeProposalModel(profile?.layout_style),
                items: []
            }}
        />
    )
}
