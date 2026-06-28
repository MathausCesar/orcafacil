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

    // Server-rendered pages can run before the client provider writes the cookie.
    // In that case, resolve the user's first membership explicitly.
    const supabase = existingSupabase || await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data: member } = await supabase
        .from("organization_members")
        .select("organization_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle()

    return member?.organization_id || null
}
