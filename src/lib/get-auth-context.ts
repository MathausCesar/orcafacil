import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"

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

    const cookieStore = await cookies()
    const orgId = cookieStore.get("active_organization_id")?.value || null

    if (orgId) {
        return { supabase, user, orgId }
    }

    // Fallback: query only if cookie is missing
    const { data: orgData } = await supabase
        .from("organizations")
        .select("id")
        .order("created_at", { ascending: true })
        .limit(1)
        .single()

    return { supabase, user, orgId: orgData?.id || null }
}
