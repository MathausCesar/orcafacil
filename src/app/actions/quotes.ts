'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createNotification } from './notifications'

export async function createQuote(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const clientName = formData.get('clientName') as string
    const clientPhone = formData.get('clientPhone') as string
    const expirationDate = formData.get('expirationDate') as string || null
    const paymentTerms = formData.get('paymentTerms') as string
    const notes = formData.get('notes') as string
    const itemsJson = formData.get('items') as string

    // Customization fields
    const showTimeline = formData.get('show_timeline') === 'true'
    const showPaymentOptions = formData.get('show_payment_options') === 'true'
    const estimatedDays = formData.get('estimated_days') ? parseInt(formData.get('estimated_days') as string) : null
    const cashDiscountPercent = formData.get('cash_discount_percent') ? parseInt(formData.get('cash_discount_percent') as string) : 0
    const installmentCount = formData.get('installment_count') ? parseInt(formData.get('installment_count') as string) : null
    const paymentMethodsStr = formData.get('payment_methods') as string
    const paymentMethods = paymentMethodsStr ? JSON.parse(paymentMethodsStr) : []

    const items = JSON.parse(itemsJson)

    // Calcule Total
    const total = items.reduce((acc: number, item: any) => acc + (item.quantity * item.unitPrice), 0)

    // 1. Create Quote
    const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .insert({
            user_id: user.id,
            client_name: clientName,
            client_phone: clientPhone,
            expiration_date: expirationDate,
            payment_terms: paymentTerms,
            notes: notes,
            total: total,
            status: 'draft',
            // Customization fields
            show_timeline: showTimeline,
            show_payment_options: showPaymentOptions,
            estimated_days: estimatedDays,
            cash_discount_percent: cashDiscountPercent,
            payment_methods: paymentMethods,
            installment_count: installmentCount
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
    redirect(`/quotes/${quote.id}`)
}

export async function updateQuote(id: string, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const clientName = formData.get('clientName') as string
    const clientPhone = formData.get('clientPhone') as string
    const expirationDate = formData.get('expirationDate') as string || null
    const paymentTerms = formData.get('paymentTerms') as string
    const notes = formData.get('notes') as string
    const itemsJson = formData.get('items') as string

    // Customization fields
    const showTimeline = formData.get('show_timeline') === 'true'
    const showPaymentOptions = formData.get('show_payment_options') === 'true'
    const estimatedDays = formData.get('estimated_days') ? parseInt(formData.get('estimated_days') as string) : null
    const cashDiscountPercent = formData.get('cash_discount_percent') ? parseInt(formData.get('cash_discount_percent') as string) : 0
    const installmentCount = formData.get('installment_count') ? parseInt(formData.get('installment_count') as string) : null
    const paymentMethodsStr = formData.get('payment_methods') as string
    const paymentMethods = paymentMethodsStr ? JSON.parse(paymentMethodsStr) : []

    const items = JSON.parse(itemsJson)
    const total = items.reduce((acc: number, item: any) => acc + (item.quantity * item.unitPrice), 0)

    // 1. Update Quote Info
    const { error: updateError } = await supabase
        .from('quotes')
        .update({
            client_name: clientName,
            client_phone: clientPhone,
            expiration_date: expirationDate,
            payment_terms: paymentTerms,
            notes: notes,
            total: total,
            updated_at: new Date().toISOString(),
            // Customization fields
            show_timeline: showTimeline,
            show_payment_options: showPaymentOptions,
            estimated_days: estimatedDays,
            cash_discount_percent: cashDiscountPercent,
            payment_methods: paymentMethods,
            installment_count: installmentCount
        })
        .eq('id', id)
        .eq('user_id', user.id)

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
    redirect(`/quotes/${id}`)
}

export async function deleteQuote(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { error } = await supabase
        .from('quotes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error deleting quote:', error)
        throw new Error('Failed to delete quote')
    }

    revalidatePath('/')
    revalidatePath('/quotes')
    return { success: true }
}

export async function updateQuoteStatus(id: string, status: 'approved' | 'rejected') {
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

    revalidatePath(`/quotes/${id}`)
    return { success: true }
}
