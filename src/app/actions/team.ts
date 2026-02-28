'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getActiveOrganizationId } from '@/lib/get-active-organization'

export async function inviteTeamMember(email: string, role: string) {
    const supabase = await createClient()
    const orgId = await getActiveOrganizationId()

    if (!orgId) return { error: 'Organização não encontrada.' }

    // 1. Check if user with this email exists in auth (Optional: Supabase Admin API could be used to invite logic)
    // Actually, normally you create an "invitation" record and send an email with a link.
    // For MVP, we insert an invitation or if the user is already registered, we just add them to the team.

    const { data: profile } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', email)
        .single()

    if (profile) {
        // User exists, add them as member
        const { error } = await supabase
            .from('organization_members')
            .upsert({
                organization_id: orgId,
                user_id: profile.id,
                role: role
            }, { onConflict: 'organization_id, user_id' })

        if (error) return { error: 'Erro ao adicionar membro à equipe.' }

        revalidatePath('/profile')
        return { success: true, message: 'Usuário adicionado com sucesso!' }
    } else {
        // Feature to implement: Send email invite / store pending invites
        return { error: 'O usuário precisa ter uma conta no OrcaFacil primeiro. (Convites por email em breve)' }
    }
}

export async function removeTeamMember(userId: string) {
    const supabase = await createClient()
    const orgId = await getActiveOrganizationId()

    if (!orgId) return { error: 'Organização não encontrada.' }

    // Check if trying to remove the owner or the last admin
    // For MVP, just delete
    const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('organization_id', orgId)
        .eq('user_id', userId)

    if (error) return { error: 'Erro ao remover membro.' }

    revalidatePath('/profile')
    return { success: true }
}

export async function updateTeamMemberRole(userId: string, newRole: string) {
    const supabase = await createClient()
    const orgId = await getActiveOrganizationId()

    if (!orgId) return { error: 'Organização não encontrada.' }

    const { error } = await supabase
        .from('organization_members')
        .update({ role: newRole })
        .eq('organization_id', orgId)
        .eq('user_id', userId)

    if (error) return { error: 'Erro ao atualizar função.' }

    revalidatePath('/profile')
    return { success: true }
}
