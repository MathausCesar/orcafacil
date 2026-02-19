'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Ação pública de aprovação/recusa de orçamento.
 * Não requer autenticação — usada pela página de aprovação via QR code.
 * A segurança é garantida por:
 *   1. UUID do orçamento como token não-enumerável (122 bits)
 *   2. Função SQL `approve_quote_public` com SECURITY DEFINER que:
 *      - Valida que status só pode ser 'approved' ou 'rejected'
 *      - Só atualiza orçamentos com status 'pending' (impede re-aprovação)
 */
export async function approveQuotePublic(quoteId: string, status: 'approved' | 'rejected') {
    const supabase = await createClient()

    const { error } = await supabase.rpc('approve_quote_public', {
        quote_id: quoteId,
        new_status: status,
    })

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath(`/quotes/${quoteId}/approve`)
}
