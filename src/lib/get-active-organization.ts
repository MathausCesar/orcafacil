import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function getActiveOrganizationId() {
    const cookieStore = await cookies();
    const activeOrgId = cookieStore.get("activeOrganizationId")?.value;

    if (activeOrgId) {
        return activeOrgId;
    }

    // Backup: Get the user's first available organization if no cookie is set
    const supabase = await createClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) return null;

    const { data: orgData } = await (await supabase)
        .from("organizations")
        .select("id")
        .order("created_at", { ascending: true })
        .limit(1)
        .single();

    return orgData?.id || null;
}
