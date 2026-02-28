'use server'

import { createClient } from '@/lib/supabase/server'
import { getActiveOrganizationId } from '@/lib/get-active-organization'

export async function searchQuotes(query: string) {
    if (!query || query.length < 1) return []
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const orgId = await getActiveOrganizationId()

    if (!orgId) return []

    // Search by client_name
    const { data: quotes } = await supabase
        .from('quotes')
        .select('id, client_name, total, status, created_at')
        .eq('organization_id', orgId)
        .ilike('client_name', `%${query}%`)
        .order('created_at', { ascending: false })
        .limit(10)

    return quotes || []
}
