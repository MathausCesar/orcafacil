'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createSupportTicket(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Usuário não autenticado.')
    }

    const type = formData.get('type') as string // 'doubt' ou 'suggestion'
    const subject = formData.get('subject') as string
    const message = formData.get('message') as string

    if (!type || !subject || !message) {
        throw new Error('Preencha todos os campos obrigatórios.')
    }

    const { error } = await supabase
        .from('support_tickets')
        .insert({
            user_id: user.id,
            type,
            subject,
            message,
            status: 'open'
        })

    if (error) {
        console.error('Erro ao criar ticket de suporte:', error)
        throw new Error(error.message)
    }

    return { success: true }
}
