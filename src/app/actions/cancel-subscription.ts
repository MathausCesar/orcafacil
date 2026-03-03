'use server'

import { createClient } from '@/lib/supabase/server'
import { getActiveOrganizationId } from '@/lib/get-active-organization'
import { revalidatePath } from 'next/cache'

export interface CancellationData {
    reason: string
    additionalComments?: string
}

export async function cancelSubscription(data: CancellationData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Não autorizado.' }

    const orgId = await getActiveOrganizationId()

    const { data: profile } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .single()

    // 1. Save cancellation feedback
    const { error: feedbackError } = await supabase
        .from('cancellation_feedback')
        .insert({
            user_id: user.id,
            organization_id: orgId,
            reason: data.reason,
            additional_comments: data.additionalComments || null,
            plan: profile?.plan || 'free'
        })

    if (feedbackError) {
        console.error('Error saving cancellation feedback:', feedbackError)
        return { error: 'Erro ao salvar feedback. Tente novamente.' }
    }

    // 2. Downgrade to free plan
    const { error: updateError } = await supabase
        .from('profiles')
        .update({ plan: 'free', updated_at: new Date().toISOString() })
        .eq('id', user.id)

    if (updateError) {
        console.error('Error downgrading plan:', updateError)
        return { error: 'Feedback salvo, mas erro ao cancelar assinatura. Contate o suporte.' }
    }

    revalidatePath('/app/profile')
    revalidatePath('/app')

    return { success: true }
}
