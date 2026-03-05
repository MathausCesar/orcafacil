import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"

export async function getActiveOrganizationId(
    existingSupabase?: Awaited<ReturnType<typeof createClient>>
) {
    const cookieStore = await cookies()
    const activeOrgId = cookieStore.get("active_organization_id")?.value

    if (activeOrgId) {
        return activeOrgId
    }

    // Fallback: query only if cookie is missing
    const supabase = existingSupabase || await createClient()
    const { data: userData } = await supabase.auth.getUser()

    if (!userData.user) return null

    const { data: orgData } = await supabase
        .from("organizations")
        .select("id")
        .order("created_at", { ascending: true })
        .limit(1)
        .single()

    return orgData?.id || null
}
