import { createClient } from "@/lib/supabase/server"
import { getActiveOrganizationId } from "@/lib/get-active-organization"

type AuthContext = {
    supabase: Awaited<ReturnType<typeof createClient>>
    user: { id: string; email?: string } | null
    orgId: string | null
}

export async function getAuthContext(): Promise<AuthContext> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { supabase, user: null, orgId: null }
    }

    const orgId = await getActiveOrganizationId(supabase)

    return { supabase, user, orgId }
}
