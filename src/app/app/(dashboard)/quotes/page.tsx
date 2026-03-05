import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { QuoteFilters } from '@/components/quotes/quote-filters'
import { QuotesView } from '@/components/quotes/quotes-pipeline'
import { getActiveOrganizationId } from '@/lib/get-active-organization'

interface SearchParams {
    q?: string
    status?: string
    from?: string
    to?: string
    sort?: string
}

export default async function QuotesListPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
    const params = await searchParams
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const orgId = await getActiveOrganizationId()

    if (!orgId) {
        return <div className="p-8 text-center text-muted-foreground">Nenhuma organização encontrada.</div>
    }

    let query = supabase
        .from('quotes')
        .select('id, client_name, total, status, created_at')
        .eq('organization_id', orgId)

    if (params.q) query = query.ilike('client_name', `%${params.q}%`)
    if (params.status) query = query.eq('status', params.status)
    if (params.from) query = query.gte('created_at', `${params.from}T00:00:00`)
    if (params.to) query = query.lte('created_at', `${params.to}T23:59:59`)

    const sort = params.sort || 'recent'
    switch (sort) {
        case 'oldest': query = query.order('created_at', { ascending: true }); break
        case 'highest': query = query.order('total', { ascending: false }); break
        case 'lowest': query = query.order('total', { ascending: true }); break
        case 'name_asc': query = query.order('client_name', { ascending: true }); break
        case 'name_desc': query = query.order('client_name', { ascending: false }); break
        default: query = query.order('created_at', { ascending: false })
    }

    const { data: quotes } = await query

    return (
        <div className="space-y-6 pb-20">
            <QuotesView quotes={quotes || []} totalCount={quotes?.length ?? 0} />
            <QuoteFilters />
        </div>
    )
}
