'use server'

import { revalidatePath } from 'next/cache'
import { getAuthContext } from '@/lib/get-auth-context'

export async function inviteTeamMember(email: string, role: string) {
    const { supabase, orgId } = await getAuthContext()

    if (!orgId) return { error: 'Organização não encontrada.' }

    const { data: profile } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', email)
        .single()

    if (profile) {
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
        return { error: 'O usuário precisa ter uma conta no OrcaFacil primeiro. (Convites por email em breve)' }
    }
}

export async function removeTeamMember(userId: string) {
    const { supabase, orgId } = await getAuthContext()

    if (!orgId) return { error: 'Organização não encontrada.' }

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
    const { supabase, orgId } = await getAuthContext()

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
