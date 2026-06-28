'use server'

import { revalidatePath } from 'next/cache'
import { getAuthContext } from '@/lib/get-auth-context'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

const MANAGER_ROLES = ['owner', 'admin']
const ASSIGNABLE_ROLES = ['admin', 'member']

async function requireOrganizationAdmin() {
    const { supabase, user, orgId } = await getAuthContext()

    if (!user) return { error: 'Usuario nao autenticado.' as const }
    if (!orgId) return { error: 'Organizacao nao encontrada.' as const }

    const { data: membership, error } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', orgId)
        .eq('user_id', user.id)
        .single()

    if (error || !membership || !MANAGER_ROLES.includes(membership.role)) {
        return { error: 'Voce nao tem permissao para gerenciar esta equipe.' as const }
    }

    return { supabase, user, orgId }
}

function normalizeAssignableRole(role: string) {
    return ASSIGNABLE_ROLES.includes(role) ? role : 'member'
}

export async function inviteTeamMember(email: string, role: string) {
    const context = await requireOrganizationAdmin()
    if ('error' in context) return { error: context.error }

    const { supabase, orgId } = context
    const normalizedEmail = email.trim().toLowerCase()
    const assignedRole = normalizeAssignableRole(role)
    const admin = getSupabaseAdmin()

    const { data: profile } = await admin
        .from('profiles')
        .select('id, email')
        .eq('email', normalizedEmail)
        .single()

    if (!profile) {
        return { error: 'O usuario precisa ter uma conta no Zacly primeiro. Convites por email ficam para uma proxima etapa.' }
    }

    const { error } = await supabase
        .from('organization_members')
        .upsert({
            organization_id: orgId,
            user_id: profile.id,
            role: assignedRole,
        }, { onConflict: 'organization_id, user_id' })

    if (error) return { error: 'Erro ao adicionar membro a equipe.' }

    revalidatePath('/profile')
    return { success: true, message: 'Usuario adicionado com sucesso!' }
}

export async function removeTeamMember(userId: string) {
    const context = await requireOrganizationAdmin()
    if ('error' in context) return { error: context.error }

    const { supabase, orgId } = context
    const { data: targetMember } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', orgId)
        .eq('user_id', userId)
        .single()

    if (targetMember?.role === 'owner') {
        return { error: 'O dono da organizacao nao pode ser removido por aqui.' }
    }

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
    const context = await requireOrganizationAdmin()
    if ('error' in context) return { error: context.error }

    const { supabase, orgId } = context
    const assignedRole = normalizeAssignableRole(newRole)
    const { data: targetMember } = await supabase
        .from('organization_members')
        .select('role')
        .eq('organization_id', orgId)
        .eq('user_id', userId)
        .single()

    if (targetMember?.role === 'owner') {
        return { error: 'O cargo de dono nao pode ser alterado por aqui.' }
    }

    const { error } = await supabase
        .from('organization_members')
        .update({ role: assignedRole })
        .eq('organization_id', orgId)
        .eq('user_id', userId)

    if (error) return { error: 'Erro ao atualizar funcao.' }

    revalidatePath('/profile')
    return { success: true }
}
