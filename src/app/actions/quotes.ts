'use server'

import { revalidatePath } from 'next/cache'
import { createNotification } from './notifications'
import { getAuthContext } from '@/lib/get-auth-context'
import { PRICING } from '@/lib/pricing-copy'
import { normalizeProfessionalContext } from '@/lib/professional-context'
import { FREE_PROPOSAL_MODEL, isFreePlan, normalizeProposalModel } from '@/lib/proposal-style'

type QuoteFormItem = {
    serviceId?: string | null
    itemType?: 'service' | 'product'
    description: string
    details: string | null
    quantity: number
    unitPrice: number
    unitCost?: number
}

type QuoteItemPayload = {
    quote_id: string
    service_id?: string | null
    item_type: 'service' | 'product'
    description: string
    details: string | null
    quantity: number
    unit_price: number
    unit_cost: number
}

type QuoteUpdatePayload = {
    client_name: string
    client_phone: string
    expiration_date: string | null
    payment_terms: string
    notes: string
    total: number
    updated_at: string
    show_timeline: boolean
    show_payment_options: boolean
    show_detailed_items: boolean
    estimated_days: number | null
    cash_discount_type: string
    cash_discount_percent: number
    cash_discount_fixed: number
    payment_methods: string[]
    installment_count: number | null
    layout_style: string | null
    professional_context: string
    status?: 'draft'
}

type PaymentStatus = 'unpaid' | 'partial' | 'paid'

function normalizePaymentStatus(value: string): PaymentStatus {
    return ['unpaid', 'partial', 'paid'].includes(value) ? value as PaymentStatus : 'unpaid'
}

function parseQuoteItems(itemsJson: string): QuoteFormItem[] {
    const parsed: unknown = JSON.parse(itemsJson)

    if (!Array.isArray(parsed)) {
        return []
    }

    return parsed.map((item) => {
        const record = item as Record<string, unknown>
        const description = typeof record.description === 'string' ? record.description : ''
        const details = typeof record.details === 'string' && record.details.trim() ? record.details : null
        const quantity = Number(record.quantity)
        const unitPrice = Number(record.unitPrice)
        const unitCost = Number(record.unitCost)
        const serviceId = typeof record.serviceId === 'string' && record.serviceId.trim()
            ? record.serviceId
            : null
        const itemType = record.itemType === 'product' ? 'product' : 'service'

        return {
            serviceId,
            itemType,
            description,
            details,
            quantity: Number.isFinite(quantity) ? quantity : 0,
            unitPrice: Number.isFinite(unitPrice) ? unitPrice : 0,
            unitCost: Number.isFinite(unitCost) ? unitCost : 0,
        }
    })
}

function buildQuoteItems(quoteId: string, items: QuoteFormItem[]): QuoteItemPayload[] {
    return items.map((item) => ({
        quote_id: quoteId,
        service_id: item.serviceId || null,
        item_type: item.itemType || 'service',
        description: item.description,
        details: item.details,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        unit_cost: item.unitCost || 0
    }))
}

export async function createQuote(formData: FormData) {
    const { supabase, user, orgId } = await getAuthContext()

    if (!user) {
        return { error: 'Unauthorized', redirect: '/login' }
    }

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

        if (!countError && count !== null && count >= PRICING.freeQuotesPerMonth) {
            return { error: 'LIMIT_REACHED', message: `Você atingiu o limite de ${PRICING.freeQuotesPerMonth} orçamentos grátis neste mês.` }
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
    const cashDiscountType = formData.get('cash_discount_type') as string || 'percent'
    const cashDiscountPercent = formData.get('cash_discount_percent') ? parseInt(formData.get('cash_discount_percent') as string) : 0
    const cashDiscountFixed = formData.get('cash_discount_fixed') ? parseFloat(formData.get('cash_discount_fixed') as string) : 0
    const installmentCount = formData.get('installment_count') ? parseInt(formData.get('installment_count') as string) : null
    const paymentMethodsStr = formData.get('payment_methods') as string
    const paymentMethods = paymentMethodsStr ? JSON.parse(paymentMethodsStr) : []
    const requestedLayoutStyle = formData.get('layout_style') as string || null
    const layoutStyle = isFreePlan(userPlan) ? FREE_PROPOSAL_MODEL : normalizeProposalModel(requestedLayoutStyle)
    const professionalContext = normalizeProfessionalContext(formData.get('professional_context') as string | null)
    const afterCreate = formData.get('after_create') as string | null

    const items = parseQuoteItems(itemsJson)

    // Calcule Total
    const total = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0)

    // 1. Create Quote
    const { data: quote, error: quoteError } = await supabase
        .from('quotes')
        .insert({
            user_id: user.id,
            organization_id: orgId,
            client_name: clientName,
            client_phone: clientPhone,
            expiration_date: expirationDate,
            payment_terms: paymentTerms,
            notes: notes,
            total: total,
            status: 'draft',
            show_timeline: showTimeline,
            show_payment_options: showPaymentOptions,
            show_detailed_items: showDetailedItems,
            estimated_days: estimatedDays,
            cash_discount_type: cashDiscountType,
            cash_discount_percent: cashDiscountPercent,
            cash_discount_fixed: cashDiscountFixed,
            payment_methods: paymentMethods,
            installment_count: installmentCount,
            layout_style: layoutStyle,
            professional_context: professionalContext
        })
        .select()
        .single()

    if (quoteError || !quote) {
        console.error('Error creating quote:', quoteError)
        return { error: 'Failed to create quote' }
    }

    // 2. Create Items
    const quoteItems = buildQuoteItems(quote.id, items)

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
    revalidatePath('/quotes')

    return {
        success: true,
        quoteId: quote.id,
        total,
        status: quote.status,
        plan: userPlan,
        redirect: afterCreate === 'pipeline' ? '/quotes?view=pipeline' : `/quotes/${quote.id}`
    }
}

export async function updateQuote(id: string, formData: FormData) {
    const { supabase, user, orgId } = await getAuthContext()

    if (!user) {
        return { error: 'Unauthorized', redirect: '/login' }
    }

    // Check current status — block locked quotes
    const { data: currentQuote } = await supabase
        .from('quotes')
        .select('status, organization_id')
        .eq('id', id)
        .single()

    if (!currentQuote || currentQuote.organization_id !== orgId) {
        return { error: 'Quote not found or Unauthorized' }
    }

    if (['in_progress', 'completed'].includes(currentQuote.status)) {
        return { error: 'Orçamentos em execução ou concluídos não podem ser editados.' }
    }

    // If the client already decided or requested changes, editing creates a new version for re-approval.
    const shouldResetStatus = ['approved', 'changes_requested'].includes(currentQuote.status || '')

    const { data: profile } = await supabase
        .from('profiles')
        .select('plan')
        .eq('id', user.id)
        .maybeSingle()

    const userPlan = profile?.plan || 'free'

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
    const cashDiscountType = formData.get('cash_discount_type') as string || 'percent'
    const cashDiscountPercent = formData.get('cash_discount_percent') ? parseInt(formData.get('cash_discount_percent') as string) : 0
    const cashDiscountFixed = formData.get('cash_discount_fixed') ? parseFloat(formData.get('cash_discount_fixed') as string) : 0
    const installmentCount = formData.get('installment_count') ? parseInt(formData.get('installment_count') as string) : null
    const paymentMethodsStr = formData.get('payment_methods') as string
    const paymentMethods = paymentMethodsStr ? JSON.parse(paymentMethodsStr) : []
    const requestedLayoutStyle = formData.get('layout_style') as string || null
    const layoutStyle = isFreePlan(userPlan) ? FREE_PROPOSAL_MODEL : normalizeProposalModel(requestedLayoutStyle)
    const professionalContext = normalizeProfessionalContext(formData.get('professional_context') as string | null)

    const items = parseQuoteItems(itemsJson)
    const total = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0)

    // 1. Update Quote Info
    const updateData: QuoteUpdatePayload = {
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
        cash_discount_type: cashDiscountType,
        cash_discount_percent: cashDiscountPercent,
        cash_discount_fixed: cashDiscountFixed,
        payment_methods: paymentMethods,
        installment_count: installmentCount,
        layout_style: layoutStyle,
        professional_context: professionalContext
    }

    // Reset decided quotes back to draft for re-approval
    if (shouldResetStatus) {
        updateData.status = 'draft'
    }

    const { error: updateError } = await supabase
        .from('quotes')
        .update(updateData)
        .eq('id', id)
        .eq('organization_id', orgId || '')

    if (updateError) {
        console.error('Error updating quote:', updateError)
        return { error: 'Failed to update quote' }
    }

    // 2. Update Items (Delete all and recreate)
    const { error: deleteError } = await supabase
        .from('quote_items')
        .delete()
        .eq('quote_id', id)

    if (deleteError) {
        console.error('Error deleting old items:', deleteError)
        return { error: 'Failed to update items' }
    }

    const quoteItems = buildQuoteItems(id, items)

    const { error: insertError } = await supabase
        .from('quote_items')
        .insert(quoteItems)

    if (insertError) {
        console.error('Error inserting new items:', insertError)
        return { error: 'Failed to update items' }
    }

    revalidatePath(`/quotes/${id}`)
    revalidatePath('/')
    return { success: true, quoteId: id, total, redirect: `/quotes/${id}` }
}

export async function deleteQuote(id: string) {
    const { supabase, user, orgId } = await getAuthContext()

    if (!user) {
        throw new Error('Unauthorized')
    }

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

export async function updateQuoteStatus(id: string, status: 'sent' | 'in_progress' | 'completed') {
    const { supabase } = await getAuthContext()

    if (!['sent', 'in_progress', 'completed'].includes(status)) {
        throw new Error('Status change is not allowed for quote owners')
    }

    // Owner-controlled transitions only; client decisions use approveQuotePublic.
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
        const statusMessages: Record<'sent' | 'in_progress' | 'completed', { title: string; message: string; type: 'info' | 'success' }> = {
            sent: {
                title: 'Orçamento enviado',
                message: `O orçamento para ${quote.client_name} foi marcado como enviado.`,
                type: 'info'
            },
            in_progress: {
                title: 'Orçamento em execução',
                message: `O orçamento para ${quote.client_name} entrou em fase de execução.`,
                type: 'info'
            },
            completed: {
                title: 'Orçamento concluído',
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

export async function deductQuoteStock(id: string) {
    const { supabase, user } = await getAuthContext()

    if (!user) {
        return { error: 'Unauthorized', redirect: '/login' }
    }

    const { data, error } = await supabase.rpc('consume_quote_stock', {
        p_quote_id: id
    })

    if (error) {
        console.error('Error consuming quote stock:', error)
        return { error: 'Não foi possível baixar o estoque deste orçamento.' }
    }

    const deductedItems = typeof data === 'object' && data && 'deducted_items' in data
        ? Number((data as { deducted_items?: unknown }).deducted_items || 0)
        : 0

    revalidatePath(`/quotes/${id}`)
    revalidatePath('/quotes')
    revalidatePath('/catalog')
    revalidatePath('/profile')
    revalidatePath('/')

    return { success: true, deductedItems }
}

export async function updateQuotePayment(id: string, status: string, amountPaid?: number) {
    const { supabase, user, orgId } = await getAuthContext()

    if (!user || !orgId) {
        throw new Error('Unauthorized')
    }

    const paymentStatus = normalizePaymentStatus(status)

    const { data: quote } = await supabase
        .from('quotes')
        .select('id, client_name, total, organization_id, user_id')
        .eq('id', id)
        .eq('organization_id', orgId)
        .single()

    if (!quote) {
        throw new Error('Quote not found or Unauthorized')
    }

    const total = Number(quote.total || 0)
    const cleanAmount = Math.max(0, Number.isFinite(Number(amountPaid)) ? Number(amountPaid) : 0)
    const nextAmount = paymentStatus === 'paid'
        ? total
        : paymentStatus === 'partial'
            ? Math.min(cleanAmount, total)
            : 0

    const { error } = await supabase
        .from('quotes')
        .update({
            payment_status: paymentStatus,
            amount_paid: nextAmount,
            paid_at: paymentStatus === 'paid' ? new Date().toISOString() : null,
            payment_updated_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('organization_id', orgId)

    if (error) {
        console.error('Error updating quote payment:', error)
        throw new Error('Failed to update payment')
    }

    const statusMessages: Record<PaymentStatus, { title: string; message: string; type: 'info' | 'success' }> = {
        unpaid: {
            title: 'Recebimento em aberto',
            message: `O recebimento de ${quote.client_name} foi marcado como em aberto.`,
            type: 'info',
        },
        partial: {
            title: 'Recebimento parcial registrado',
            message: `Voce registrou recebimento parcial de ${quote.client_name}.`,
            type: 'info',
        },
        paid: {
            title: 'Recebimento confirmado',
            message: `O recebimento de ${quote.client_name} foi marcado como pago.`,
            type: 'success',
        },
    }

    const notification = statusMessages[paymentStatus]
    await createNotification(quote.user_id, notification.title, notification.message, `/quotes/${id}`, notification.type)

    revalidatePath(`/quotes/${id}`)
    revalidatePath('/quotes')
    revalidatePath('/')

    return { success: true }
}
