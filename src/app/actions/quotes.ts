'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createNotification } from './notifications'
import { getActiveOrganizationId } from '@/lib/get-active-organization'

export async function createQuote(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized', redirect: '/login' }
    }

    const orgId = await getActiveOrganizationId()

    if (!orgId) {
        return { error: 'No active organization found' }
    }

    // --- FREEMIUM CHECK ---
    const { data: profile } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .single()

    const userPlan = profile?.plan || 'free'

    if (userPlan === 'free') {
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const { count, error: countError } = await supabase
            .from('quotes')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', orgId)
            .gte('created_at', firstDayOfMonth.toISOString())

        if (!countError && count !== null && count >= 5) {
            return { error: 'LIMIT_REACHED', message: 'Você atingiu o limite de 5 orçamentos grátis neste mês.' }
        }
    }
    // ----------------------

    const clientName = formData.get('clientName') as string
    const clientPhone = formData.get('clientPhone') as string
    const expirationDate = formData.get('expirationDate') as string || null
    const paymentTerms = formData.get('paymentTerms') as string
    const notes = formData.get('notes') as string
    const itemsJson = formData.get('items') as string

    // Customization fields
    const showTimeline = formData.get('show_timeline') === 'true'
    const showPaymentOptions = formData.get('show_payment_options') === 'true'
    const showDetailedItems = formData.get('show_detailed_items') === 'true'
    const estimatedDays = formData.get('estimated_days') ? parseInt(formData.get('estimated_days') as string) : null
    const cashDiscountPercent = formData.get('cash_discount_percent') ? parseInt(formData.get('cash_discount_percent') as string) : 0
    const installmentCount = formData.get('installment_count') ? parseInt(formData.get('installment_count') as string) : null
    const paymentMethodsStr = formData.get('payment_methods') as string
    const paymentMethods = paymentMethodsStr ? JSON.parse(paymentMethodsStr) : []
    const layoutStyle = formData.get('layout_style') as string || null

    const items = JSON.parse(itemsJson)

    // Calcule Total
    const total = items.reduce((acc: number, item: any) => acc + (item.quantity * item.unitPrice), 0)

    // 1. Create Quote
    const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .insert({
            user_id: user.id, // Keeping user_id for original creator reference
            organization_id: orgId,
            client_name: clientName,
            client_phone: clientPhone,
            expiration_date: expirationDate,
            payment_terms: paymentTerms,
            notes: notes,
            total: total,
            status: 'pending',
            // Customization fields
            show_timeline: showTimeline,
            show_payment_options: showPaymentOptions,
            show_detailed_items: showDetailedItems,
            estimated_days: estimatedDays,
            cash_discount_percent: cashDiscountPercent,
            payment_methods: paymentMethods,
            installment_count: installmentCount,
            layout_style: layoutStyle
        })
        .select()
        .single()

    if (quoteError || !quote) {
        console.error('Error creating quote:', quoteError)
        return { error: 'Failed to create quote' }
    }

    // 2. Create Items
    const quoteItems = items.map((item: any) => ({
        quote_id: quote.id,
        description: item.description,
        details: item.details || null,
        quantity: item.quantity,
        unit_price: item.unitPrice
    }))

    const { error: itemsError } = await supabase
        .from('quote_items')
        .insert(quoteItems)

    if (itemsError) {
        console.error('Error creating items:', itemsError)
        return { error: 'Failed to create items' }
    }

    // Notify user
    await createNotification(
        user.id,
        'Novo Orçamento Criado',
        `Orçamento para ${clientName} no valor de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)} foi gerado.`,
        `/quotes/${quote.id}`,
        'success'
    )

    revalidatePath('/')
    return { success: true, redirect: `/quotes/${quote.id}` }
}

export async function updateQuote(id: string, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized', redirect: '/login' }
    }

    const orgId = await getActiveOrganizationId()

    // Check current status — block locked quotes
    const { data: currentQuote } = await supabase
        .from('quotes')
        .select('status, organization_id')
        .eq('id', id)
        .single()

    if (!currentQuote || currentQuote.organization_id !== orgId) {
        return { error: 'Quote not found or Unauthorized' }
    }

    if (!currentQuote) {
        return { error: 'Quote not found' }
    }

    if (['in_progress', 'completed'].includes(currentQuote.status)) {
        return { error: 'Orçamentos em execução ou concluídos não podem ser editados.' }
    }

    // If approved, reset to pending for re-approval
    const shouldResetStatus = currentQuote.status === 'approved'

    const clientName = formData.get('clientName') as string
    const clientPhone = formData.get('clientPhone') as string
    const expirationDate = formData.get('expirationDate') as string || null
    const paymentTerms = formData.get('paymentTerms') as string
    const notes = formData.get('notes') as string
    const itemsJson = formData.get('items') as string

    // Customization fields
    const showTimeline = formData.get('show_timeline') === 'true'
    const showPaymentOptions = formData.get('show_payment_options') === 'true'
    const showDetailedItems = formData.get('show_detailed_items') === 'true'
    const estimatedDays = formData.get('estimated_days') ? parseInt(formData.get('estimated_days') as string) : null
    const cashDiscountPercent = formData.get('cash_discount_percent') ? parseInt(formData.get('cash_discount_percent') as string) : 0
    const installmentCount = formData.get('installment_count') ? parseInt(formData.get('installment_count') as string) : null
    const paymentMethodsStr = formData.get('payment_methods') as string
    const paymentMethods = paymentMethodsStr ? JSON.parse(paymentMethodsStr) : []
    const layoutStyle = formData.get('layout_style') as string || null

    const items = JSON.parse(itemsJson)
    const total = items.reduce((acc: number, item: any) => acc + (item.quantity * item.unitPrice), 0)

    // 1. Update Quote Info
    const updateData: any = {
        client_name: clientName,
        client_phone: clientPhone,
        expiration_date: expirationDate,
        payment_terms: paymentTerms,
        notes: notes,
        total: total,
        updated_at: new Date().toISOString(),
        show_timeline: showTimeline,
        show_payment_options: showPaymentOptions,
        show_detailed_items: showDetailedItems,
        estimated_days: estimatedDays,
        cash_discount_percent: cashDiscountPercent,
        payment_methods: paymentMethods,
        installment_count: installmentCount,
        layout_style: layoutStyle
    }

    // Reset approved quotes back to pending for re-approval
    if (shouldResetStatus) {
        updateData.status = 'pending'
    }

    const { error: updateError } = await supabase
        .from('quotes')
        .update(updateData)
        .eq('id', id)
        .eq('organization_id', orgId)

    if (updateError) {
        console.error('Error updating quote:', updateError)
        return { error: 'Failed to update quote' }
    }

    // 2. Update Items (Delete all and recreate - simplest strategy for now)
    // First, delete existing items
    const { error: deleteError } = await supabase
        .from('quote_items')
        .delete()
        .eq('quote_id', id)

    if (deleteError) {
        console.error('Error deleting old items:', deleteError)
        return { error: 'Failed to update items' }
    }

    // Insert new items
    const quoteItems = items.map((item: any) => ({
        quote_id: id,
        description: item.description,
        details: item.details || null,
        quantity: item.quantity,
        unit_price: item.unitPrice
    }))

    const { error: insertError } = await supabase
        .from('quote_items')
        .insert(quoteItems)

    if (insertError) {
        console.error('Error inserting new items:', insertError)
        return { error: 'Failed to update items' }
    }

    revalidatePath(`/quotes/${id}`)
    revalidatePath('/')
    return { success: true, redirect: `/quotes/${id}` }
}

export async function deleteQuote(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const orgId = await getActiveOrganizationId()

    const { error } = await supabase
        .from('quotes')
        .delete()
        .eq('id', id)
        .eq('organization_id', orgId || '')

    if (error) {
        console.error('Error deleting quote:', error)
        throw new Error('Failed to delete quote')
    }

    revalidatePath('/')
    revalidatePath('/quotes')
    return { success: true }
}

export async function updateQuoteStatus(id: string, status: 'approved' | 'rejected' | 'in_progress' | 'completed') {
    const supabase = await createClient()

    // Calls the security definer RPC function to allow public updates
    const { error } = await supabase.rpc('update_quote_status', {
        quote_id: id,
        new_status: status
    })

    if (error) {
        console.error('Error updating status:', error)
        throw new Error('Failed to update status')
    }

    // Create notification for status change
    const { data: quote } = await supabase
        .from('quotes')
        .select('client_name, user_id')
        .eq('id', id)
        .single()

    if (quote) {
        const statusMessages: Record<string, { title: string; message: string; type: 'info' | 'success' | 'warning' | 'alert' }> = {
            approved: {
                title: '✅ Orçamento Aprovado',
                message: `O orçamento para ${quote.client_name} foi aprovado!`,
                type: 'success'
            },
            rejected: {
                title: '❌ Orçamento Recusado',
                message: `O orçamento para ${quote.client_name} foi recusado.`,
                type: 'alert'
            },
            in_progress: {
                title: '🚀 Orçamento Em Execução',
                message: `O orçamento para ${quote.client_name} entrou em fase de execução.`,
                type: 'info'
            },
            completed: {
                title: '🏆 Orçamento Concluído',
                message: `O orçamento para ${quote.client_name} foi concluído com sucesso!`,
                type: 'success'
            }
        }

        const msg = statusMessages[status]
        if (msg) {
            await createNotification(quote.user_id, msg.title, msg.message, `/quotes/${id}`, msg.type)
        }
    }

    revalidatePath(`/quotes/${id}`)
    return { success: true }
}
