'use server'

import { getAuthContext } from '@/lib/get-auth-context'

export async function searchQuotes(query: string) {
    if (!query || query.length < 1) return []

    const { supabase, user, orgId } = await getAuthContext()

    if (!user || !orgId) return []

    const { data: quotes } = await supabase
        .from('quotes')
        .select('id, client_name, total, status, created_at')
        .eq('organization_id', orgId)
        .ilike('client_name', `%${query}%`)
        .order('created_at', { ascending: false })
        .limit(10)

    return quotes || []
}
