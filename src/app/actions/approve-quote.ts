'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Ação pública de aprovação/recusa de orçamento.
 * Não requer autenticação — usada pela página de aprovação via QR code.
 */
export async function approveQuotePublic(quoteId: string, status: 'approved' | 'rejected') {
    const supabase = await createClient()

    // 1. Executa a função segura no banco
    const { error } = await supabase.rpc('approve_quote_public', {
        quote_id: quoteId,
        new_status: status,
    })

    if (error) {
        console.error('Erro ao aprovar orçamento:', error)
        throw new Error(error.message)
    }

    // 2. Revalida caches para atualizar a interface imediatamente
    // Atualiza a página pública do cliente
    revalidatePath(`/quotes/${quoteId}/approve`)

    // Atualiza a página de detalhes do orçamento (visão do prestador)
    revalidatePath(`/quotes/${quoteId}`)

    // Atualiza a lista de orçamentos (visão do prestador)
    revalidatePath('/quotes')

    // Atualiza o dashboard principal (contadores)
    revalidatePath('/')
}
