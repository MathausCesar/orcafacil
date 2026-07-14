'use server'

import { randomUUID } from 'crypto'
import { revalidatePath } from 'next/cache'
import { createNotification } from './notifications'
import { getAuthContext } from '@/lib/get-auth-context'
import { PRICING, getFreeQuoteAllowance } from '@/lib/pricing-copy'
import { normalizeProfessionalContext } from '@/lib/professional-context'
import { FREE_PROPOSAL_MODEL, getEntitledPlan, isFreePlan, normalizeProposalModel } from '@/lib/proposal-style'
import { captureServerActivationStage, captureServerEvent } from '@/lib/server-analytics'

type QuoteExperienceMode = 'free_simple' | 'pro_sample' | 'pro'

type QuoteFormItem = {
    serviceId?: string | null
    itemType?: 'service' | 'product'
    description: string
    details: string | null
    quantity: number
    unitPrice: number
    unitCost?: number
    costIsKnown?: boolean
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
    cost_is_known: boolean
}

type QuoteUpdatePayload = {
    client_id?: string | null
    client_name: string
    client_phone: string
    client_email?: string | null
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
    deposit_amount: number
    cost_total?: number
    profit_amount?: number
    profit_margin_percent?: number
    target_margin_percent?: number
    costs_complete?: boolean
    deposit_status?: 'not_requested'
    status?: 'draft'
}

type PaymentStatus = 'unpaid' | 'partial' | 'paid'

type QuoteFinancialSummary = {
    total: number
    costTotal: number
    profitAmount: number
    profitMarginPercent: number
    targetMarginPercent: number
    costsComplete: boolean
}

type LinkedQuoteClient = {
    id: string
}

function normalizePaymentStatus(value: string): PaymentStatus {
    return ['unpaid', 'partial', 'paid'].includes(value) ? value as PaymentStatus : 'unpaid'
}

function normalizeTargetMargin(value: FormDataEntryValue | null, fallback = 30) {
    const normalizedValue = typeof value === 'string' ? value.replace(',', '.').trim() : ''
    const parsed = Number(normalizedValue)
    const nextValue = Number.isFinite(parsed) ? parsed : fallback
    return Math.min(95, Math.max(0, nextValue))
}

function calculateQuoteFinancialSummary(items: QuoteFormItem[], targetMarginPercent: number): QuoteFinancialSummary {
    const relevantItems = items.filter((item) => item.quantity > 0)
    const total = relevantItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
    const costsComplete = relevantItems.length > 0 && relevantItems.every((item) => Boolean(item.costIsKnown))
    const costTotal = relevantItems.reduce((sum, item) => sum + (item.costIsKnown ? item.quantity * (item.unitCost || 0) : 0), 0)
    const profitAmount = costsComplete ? total - costTotal : 0
    const profitMarginPercent = total > 0 && costsComplete ? (profitAmount / total) * 100 : 0

    return {
        total,
        costTotal,
        profitAmount,
        profitMarginPercent,
        targetMarginPercent,
        costsComplete,
    }
}

async function resolveQuoteClient({
    supabase,
    userId,
    orgId,
    requestedClientId,
    clientName,
    clientPhone,
    clientEmail,
}: {
    supabase: Awaited<ReturnType<typeof getAuthContext>>['supabase']
    userId: string
    orgId: string
    requestedClientId: string
    clientName: string
    clientPhone: string
    clientEmail: string
}): Promise<LinkedQuoteClient> {
    const clientId = requestedClientId.trim()

    if (clientId) {
        const { data: selectedClient, error } = await supabase
            .from('clients')
            .select('id')
            .eq('id', clientId)
            .eq('organization_id', orgId)
            .maybeSingle()

        if (error || !selectedClient) {
            throw new Error('O cliente selecionado nao pertence a sua organizacao.')
        }

        return selectedClient
    }

    const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .eq('organization_id', orgId)
        .eq('name', clientName)
        .maybeSingle()

    if (existingClient) return existingClient

    const { data: createdClient, error: createClientError } = await supabase
        .from('clients')
        .insert({
            user_id: userId,
            organization_id: orgId,
            name: clientName,
            phone: clientPhone || null,
            email: clientEmail || null,
            notes: null,
            person_type: 'pf',
        })
        .select('id')
        .single()

    if (createClientError || !createdClient) {
        throw new Error('Nao foi possivel registrar este cliente junto da proposta.')
    }

    return createdClient
}

function normalizeExperienceMode(value: FormDataEntryValue | null, isFree: boolean): QuoteExperienceMode {
    if (!isFree) return 'pro'
    return value === 'pro_sample' ? 'pro_sample' : 'free_simple'
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
        const costIsKnown = record.costIsKnown === true
            || (record.costIsKnown !== false && Number.isFinite(unitCost) && unitCost > 0)
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
            costIsKnown,
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
        unit_cost: item.unitCost || 0,
        cost_is_known: Boolean(item.costIsKnown),
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
        .select('plan, subscription_status, pro_trial_ends_at, onboarded_at, logo_url, target_margin_percent')
        .eq('id', user.id)
        .single()

    const userPlan = getEntitledPlan(profile?.plan, profile?.subscription_status, profile?.pro_trial_ends_at)
    const isFree = isFreePlan(userPlan)
    const requestedExperienceMode = normalizeExperienceMode(formData.get('experience_mode'), isFree)

    const clientName = formData.get('clientName') as string
    const clientPhone = formData.get('clientPhone') as string
    const clientEmail = formData.get('clientEmail') as string
    const requestedClientId = String(formData.get('clientId') || '')
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
    const hasProPresentation = !isFree || requestedExperienceMode === 'pro_sample'
    const layoutStyle = hasProPresentation ? normalizeProposalModel(requestedLayoutStyle) : FREE_PROPOSAL_MODEL
    const professionalContext = normalizeProfessionalContext(formData.get('professional_context') as string | null)
    const afterCreate = formData.get('after_create') as string | null

    const items = parseQuoteItems(itemsJson)

    if (!clientName?.trim()) {
        return { error: 'Informe o nome do cliente antes de criar a proposta.' }
    }

    if (
        isFree
        && requestedExperienceMode === 'pro_sample'
        && (!profile?.logo_url || !clientName.trim() || !clientPhone.trim() || items.length === 0)
    ) {
        return {
            error: 'PRO_SAMPLE_REQUIREMENTS',
            message: 'Para usar a Amostra Pro, informe cliente e WhatsApp, adicione um item e envie sua logo.',
        }
    }

    let quotaUsageId: string | null = null
    if (isFree) {
        const allowance = getFreeQuoteAllowance(profile?.onboarded_at)
        const quotaLimit = requestedExperienceMode === 'pro_sample'
            ? PRICING.proSampleQuotes
            : allowance.limit
        const quotaPeriodStart = requestedExperienceMode === 'free_simple'
            ? allowance.periodStart.toISOString()
            : null

        // The database reservation serializes simultaneous browser submissions.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: reservationId, error: quotaError } = await (supabase as any).rpc('reserve_free_quote_quota', {
            p_organization_id: orgId,
            p_user_id: user.id,
            p_experience_mode: requestedExperienceMode,
            p_period_start: quotaPeriodStart,
            p_limit: quotaLimit,
        })

        if (quotaError || !reservationId) {
            const limitMessage = requestedExperienceMode === 'pro_sample'
                ? 'Sua Amostra Pro ja foi usada. Assine o Pro para criar propostas profissionais sem limite.'
                : allowance.period === 'activation'
                    ? 'Voce ja usou as 5 propostas simples do periodo inicial. Use sua Amostra Pro ou assine para criar sem limite.'
                    : 'Voce ja criou sua proposta simples gratis deste mes. Use sua Amostra Pro ou assine para criar sem limite.'
            return { error: 'LIMIT_REACHED', message: limitMessage }
        }

        quotaUsageId = reservationId as string
    }

    let linkedClient: LinkedQuoteClient
    try {
        linkedClient = await resolveQuoteClient({
            supabase,
            userId: user.id,
            orgId,
            requestedClientId,
            clientName: clientName.trim(),
            clientPhone: clientPhone?.trim() || '',
            clientEmail: clientEmail?.trim() || '',
        })
    } catch (error) {
        if (quotaUsageId) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any).rpc('release_free_quote_quota', { p_usage_id: quotaUsageId })
        }
        return { error: error instanceof Error ? error.message : 'Nao foi possivel vincular o cliente.' }
    }

    const targetMarginPercent = normalizeTargetMargin(
        isFree ? null : formData.get('target_margin_percent'),
        Number(profile?.target_margin_percent ?? 30),
    )
    const financialSummary = calculateQuoteFinancialSummary(items, targetMarginPercent)
    const total = financialSummary.total
    const requestedDepositAmount = Number(formData.get('deposit_amount') || 0)
    const depositAmount = Number.isFinite(requestedDepositAmount)
        ? Math.min(Math.max(requestedDepositAmount, 0), total)
        : 0

    // 1. Create Quote
    // The client email column is introduced in the same deployment migration.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: quote, error: quoteError } = await (supabase.from('quotes') as any)
        .insert({
            user_id: user.id,
            organization_id: orgId,
            client_id: linkedClient.id,
            client_name: clientName,
            client_phone: clientPhone,
            client_email: clientEmail?.trim() || null,
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
            professional_context: professionalContext,
            experience_mode: requestedExperienceMode,
            deposit_amount: depositAmount,
            deposit_status: 'not_requested',
            cost_total: financialSummary.costTotal,
            profit_amount: financialSummary.profitAmount,
            profit_margin_percent: financialSummary.profitMarginPercent,
            target_margin_percent: financialSummary.targetMarginPercent,
            costs_complete: financialSummary.costsComplete,
        })
        .select()
        .single()

    if (quoteError || !quote) {
        console.error('Error creating quote:', quoteError)
        if (quotaUsageId) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase as any).rpc('release_free_quote_quota', { p_usage_id: quotaUsageId })
        }
        return { error: 'Failed to create quote' }
    }

    if (quotaUsageId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: claimError } = await (supabase as any).rpc('claim_free_quote_quota', {
            p_usage_id: quotaUsageId,
            p_quote_id: quote.id,
        })

        if (claimError) {
            await supabase.from('quotes').delete().eq('id', quote.id)
            return { error: 'Nao foi possivel confirmar sua cota gratuita. Tente novamente.' }
        }
    }

    // 2. Create Items
    const quoteItems = buildQuoteItems(quote.id, items)

    const { error: itemsError } = await supabase
        .from('quote_items')
        .insert(quoteItems)

    if (itemsError) {
        console.error('Error creating items:', itemsError)
        await supabase.from('quotes').delete().eq('id', quote.id)
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
        experienceMode: requestedExperienceMode,
        redirect: afterCreate === 'pipeline' ? '/quotes?view=pipeline' : `/quotes/${quote.id}`
    }
}

export async function updateQuote(id: string, formData: FormData) {
    const { supabase, user, orgId } = await getAuthContext()

    if (!user || !orgId) {
        return { error: 'Unauthorized', redirect: '/login' }
    }

    // Check current status — block locked quotes
    const { data: currentQuote } = await supabase
        .from('quotes')
        .select('status, organization_id, experience_mode, deposit_amount, user_id')
        .eq('id', id)
        .single()

    if (!currentQuote || currentQuote.organization_id !== orgId || currentQuote.user_id !== user.id) {
        return { error: 'Quote not found or Unauthorized' }
    }

    if (['in_progress', 'completed'].includes(currentQuote.status)) {
        return { error: 'Orçamentos em execução ou concluídos não podem ser editados.' }
    }

    // If the client already decided or requested changes, editing creates a new version for re-approval.
    const shouldResetStatus = ['sent', 'approved', 'changes_requested'].includes(currentQuote.status || '')

    const { data: profile } = await supabase
        .from('profiles')
        .select('plan, subscription_status, pro_trial_ends_at, target_margin_percent')
        .eq('id', user.id)
        .maybeSingle()

    const userPlan = getEntitledPlan(profile?.plan, profile?.subscription_status, profile?.pro_trial_ends_at)
    const isFree = isFreePlan(userPlan)

    const clientName = formData.get('clientName') as string
    const clientPhone = formData.get('clientPhone') as string
    const clientEmail = formData.get('clientEmail') as string
    const requestedClientId = String(formData.get('clientId') || '')
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
    const hasProPresentation = !isFree || currentQuote.experience_mode === 'pro_sample'
    const layoutStyle = hasProPresentation ? normalizeProposalModel(requestedLayoutStyle) : FREE_PROPOSAL_MODEL
    const professionalContext = normalizeProfessionalContext(formData.get('professional_context') as string | null)

    const items = parseQuoteItems(itemsJson)
    if (!clientName?.trim()) {
        return { error: 'Informe o nome do cliente antes de atualizar a proposta.' }
    }

    let linkedClient: LinkedQuoteClient
    try {
        linkedClient = await resolveQuoteClient({
            supabase,
            userId: user.id,
            orgId,
            requestedClientId,
            clientName: clientName.trim(),
            clientPhone: clientPhone?.trim() || '',
            clientEmail: clientEmail?.trim() || '',
        })
    } catch (error) {
        return { error: error instanceof Error ? error.message : 'Nao foi possivel vincular o cliente.' }
    }

    const targetMarginPercent = normalizeTargetMargin(
        isFree ? null : formData.get('target_margin_percent'),
        Number(profile?.target_margin_percent ?? 30),
    )
    const financialSummary = calculateQuoteFinancialSummary(items, targetMarginPercent)
    const total = financialSummary.total
    const requestedDepositAmount = Number(formData.get('deposit_amount') || 0)
    const depositAmount = Number.isFinite(requestedDepositAmount)
        ? Math.min(Math.max(requestedDepositAmount, 0), total)
        : 0

    // 1. Update Quote Info
    const updateData: QuoteUpdatePayload = {
        client_id: linkedClient.id,
        client_name: clientName,
        client_phone: clientPhone,
        client_email: clientEmail?.trim() || null,
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
        professional_context: professionalContext,
        deposit_amount: depositAmount,
        cost_total: financialSummary.costTotal,
        profit_amount: financialSummary.profitAmount,
        profit_margin_percent: financialSummary.profitMarginPercent,
        target_margin_percent: financialSummary.targetMarginPercent,
        costs_complete: financialSummary.costsComplete,
    }

    // Reset decided quotes back to draft for re-approval
    if (shouldResetStatus) {
        updateData.status = 'draft'
    }

    const approvalReset = shouldResetStatus
        ? {
            approval_token: randomUUID(),
            approval_recipient_phone: null,
            approval_recipient_name: null,
            approval_link_issued_at: null,
            approval_verified_at: null,
            approval_verification_method: null,
            sent_confirmed_at: null,
            sent_via: null,
            deposit_status: 'not_requested',
            deposit_requested_at: null,
            deposit_marked_paid_at: null,
            pix_key_snapshot: null,
            pix_key_type_snapshot: null,
            pix_recipient_name_snapshot: null,
            pix_recipient_city_snapshot: null,
        }
        : {}

    const { error: updateError } = await supabase
        .from('quotes')
        // The approval columns are introduced in the same deployment migration.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .update({ ...updateData, ...approvalReset } as any)
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

export async function duplicateQuote(id: string) {
    const { supabase, user, orgId } = await getAuthContext()

    if (!user || !orgId) {
        return { error: 'Unauthorized', redirect: '/login' }
    }

    const [sourceResult, itemsResult, profileResult] = await Promise.all([
        supabase
            .from('quotes')
            .select('*')
            .eq('id', id)
            .eq('organization_id', orgId)
            .maybeSingle(),
        supabase
            .from('quote_items')
            .select('service_id, item_type, description, details, quantity, unit_price, unit_cost')
            .eq('quote_id', id),
        supabase
            .from('profiles')
            .select('plan, subscription_status, pro_trial_ends_at')
            .eq('id', user.id)
            .maybeSingle(),
    ])

    const sourceQuote = sourceResult.data
    if (!sourceQuote || sourceQuote.user_id !== user.id) {
        return { error: 'Proposta nao encontrada.' }
    }

    const accessPlan = getEntitledPlan(
        profileResult.data?.plan,
        profileResult.data?.subscription_status,
        profileResult.data?.pro_trial_ends_at,
    )

    if (isFreePlan(accessPlan)) {
        return {
            error: 'UPGRADE_REQUIRED',
            message: 'Usar uma proposta como base faz parte do Pro. Envie sua primeira proposta para liberar o teste Pro de 7 dias.',
        }
    }

    if (itemsResult.error) {
        console.error('Error loading quote items to duplicate:', itemsResult.error)
        return { error: 'Nao foi possivel copiar os itens desta proposta.' }
    }

    const expiration = new Date()
    expiration.setDate(expiration.getDate() + 7)

    // A duplicate is intentionally a fresh draft: no public link, send record,
    // client decision, payment confirmation or stock deduction is carried over.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: duplicatedQuote, error: duplicateError } = await (supabase.from('quotes') as any)
        .insert({
            user_id: user.id,
            organization_id: orgId,
            client_name: sourceQuote.client_name,
            client_phone: sourceQuote.client_phone,
            client_email: sourceQuote.client_email,
            client_company_name: sourceQuote.client_company_name,
            client_type: sourceQuote.client_type,
            expiration_date: expiration.toISOString().slice(0, 10),
            payment_terms: sourceQuote.payment_terms,
            notes: sourceQuote.notes,
            total: sourceQuote.total,
            status: 'draft',
            show_timeline: sourceQuote.show_timeline,
            show_payment_options: sourceQuote.show_payment_options,
            show_detailed_items: sourceQuote.show_detailed_items,
            estimated_days: sourceQuote.estimated_days,
            cash_discount_type: sourceQuote.cash_discount_type,
            cash_discount_percent: sourceQuote.cash_discount_percent,
            cash_discount_fixed: sourceQuote.cash_discount_fixed,
            payment_methods: sourceQuote.payment_methods,
            installment_count: sourceQuote.installment_count,
            layout_style: sourceQuote.layout_style,
            professional_context: sourceQuote.professional_context,
            experience_mode: 'pro',
            deposit_amount: sourceQuote.deposit_amount || 0,
            deposit_status: 'not_requested',
            source_quote_id: sourceQuote.id,
        })
        .select('id, client_name')
        .single()

    if (duplicateError || !duplicatedQuote) {
        console.error('Error duplicating quote:', duplicateError)
        return { error: 'Nao foi possivel criar a nova proposta.' }
    }

    const duplicateItems = (itemsResult.data || []).map((item) => ({
        quote_id: duplicatedQuote.id,
        service_id: item.service_id || null,
        item_type: item.item_type || 'service',
        description: item.description,
        details: item.details,
        quantity: item.quantity,
        unit_price: item.unit_price,
        unit_cost: item.unit_cost || 0,
    }))

    const { error: duplicateItemsError } = await supabase
        .from('quote_items')
        .insert(duplicateItems)

    if (duplicateItemsError) {
        console.error('Error copying quote items:', duplicateItemsError)
        await supabase.from('quotes').delete().eq('id', duplicatedQuote.id)
        return { error: 'Nao foi possivel copiar os itens desta proposta.' }
    }

    await captureServerEvent('quote_duplicated', user.id, {
        source_quote_id: sourceQuote.id,
        new_quote_id: duplicatedQuote.id,
        item_count: duplicateItems.length,
        source_status: sourceQuote.status || 'unknown',
        professional_context: sourceQuote.professional_context || 'general',
    })

    revalidatePath('/quotes')
    revalidatePath('/')
    return { success: true, quoteId: duplicatedQuote.id, redirect: `/quotes/${duplicatedQuote.id}/edit` }
}

type QuoteEvidenceInput = {
    storagePath: string
    fileName: string
    contentType: string
    fileSize: number
}

export async function addQuoteEvidence(quoteId: string, evidence: QuoteEvidenceInput) {
    const { supabase, user, orgId } = await getAuthContext()

    if (!user || !orgId) throw new Error('Unauthorized')

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    const allowedPath = `${user.id}/${quoteId}/`
    if (!allowedTypes.includes(evidence.contentType) || evidence.fileSize <= 0 || evidence.fileSize > 6 * 1024 * 1024 || !evidence.storagePath.startsWith(allowedPath)) {
        throw new Error('Arquivo de evidencia invalido.')
    }

    const [quoteResult, profileResult, evidenceCountResult] = await Promise.all([
        supabase
            .from('quotes')
            .select('id, user_id, organization_id')
            .eq('id', quoteId)
            .eq('organization_id', orgId)
            .maybeSingle(),
        supabase
            .from('profiles')
            .select('plan, subscription_status, pro_trial_ends_at')
            .eq('id', user.id)
            .maybeSingle(),
        supabase
            .from('quote_evidences')
            .select('id', { count: 'exact', head: true })
            .eq('quote_id', quoteId),
    ])

    if (!quoteResult.data || quoteResult.data.user_id !== user.id) {
        throw new Error('Proposta nao encontrada.')
    }

    const accessPlan = getEntitledPlan(
        profileResult.data?.plan,
        profileResult.data?.subscription_status,
        profileResult.data?.pro_trial_ends_at,
    )
    if (isFreePlan(accessPlan)) {
        throw new Error('Fotos de referencia fazem parte do Pro. Envie sua primeira proposta para liberar o teste Pro de 7 dias.')
    }
    if ((evidenceCountResult.count || 0) >= 6) {
        throw new Error('Cada proposta pode ter ate 6 fotos de referencia.')
    }

    const { error } = await supabase
        .from('quote_evidences')
        .insert({
            quote_id: quoteId,
            organization_id: orgId,
            user_id: user.id,
            storage_path: evidence.storagePath,
            file_name: evidence.fileName.slice(0, 180),
            content_type: evidence.contentType,
            file_size: evidence.fileSize,
            is_client_visible: false,
        })

    if (error) {
        console.error('Error saving quote evidence:', error)
        throw new Error('Nao foi possivel salvar a foto na proposta.')
    }

    await captureServerEvent('quote_evidence_added', user.id, {
        quote_id: quoteId,
        file_type: evidence.contentType,
        file_size_band: evidence.fileSize < 512 * 1024 ? 'under_512kb' : evidence.fileSize < 1024 * 1024 ? '512kb_1mb' : 'over_1mb',
        source: 'quote_evidence_manager',
    })

    revalidatePath(`/quotes/${quoteId}`)
    return { success: true }
}

export async function updateQuoteEvidenceVisibility(evidenceId: string, visibleToClient: boolean) {
    const { supabase, user, orgId } = await getAuthContext()
    if (!user || !orgId) throw new Error('Unauthorized')

    const { data: evidence } = await supabase
        .from('quote_evidences')
        .select('id, quote_id, user_id, organization_id')
        .eq('id', evidenceId)
        .eq('organization_id', orgId)
        .maybeSingle()

    if (!evidence || evidence.user_id !== user.id) throw new Error('Foto nao encontrada.')

    const { error } = await supabase
        .from('quote_evidences')
        .update({ is_client_visible: visibleToClient })
        .eq('id', evidenceId)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error updating evidence visibility:', error)
        throw new Error('Nao foi possivel atualizar a visibilidade da foto.')
    }

    await captureServerEvent('quote_evidence_visibility_changed', user.id, {
        quote_id: evidence.quote_id,
        visible_to_client: visibleToClient,
        source: 'quote_evidence_manager',
    })

    revalidatePath(`/quotes/${evidence.quote_id}`)
    return { success: true }
}

export async function deleteQuoteEvidence(evidenceId: string) {
    const { supabase, user, orgId } = await getAuthContext()
    if (!user || !orgId) throw new Error('Unauthorized')

    const { data: evidence } = await supabase
        .from('quote_evidences')
        .select('id, quote_id, user_id, organization_id, storage_path')
        .eq('id', evidenceId)
        .eq('organization_id', orgId)
        .maybeSingle()

    if (!evidence || evidence.user_id !== user.id) throw new Error('Foto nao encontrada.')

    const { error: storageError } = await supabase.storage
        .from('quote-evidences')
        .remove([evidence.storage_path])

    if (storageError) {
        console.error('Error deleting evidence file:', storageError)
        throw new Error('Nao foi possivel remover o arquivo da foto.')
    }

    const { error } = await supabase
        .from('quote_evidences')
        .delete()
        .eq('id', evidenceId)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error deleting quote evidence:', error)
        throw new Error('Nao foi possivel remover a foto da proposta.')
    }

    revalidatePath(`/quotes/${evidence.quote_id}`)
    return { success: true }
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

    if (status === 'sent') {
        throw new Error('Confirme o envio pelo fluxo de compartilhamento antes de marcar a proposta como enviada.')
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

export async function confirmQuoteSent(id: string, channel: 'whatsapp' | 'email' = 'whatsapp') {
    const { supabase, user, orgId } = await getAuthContext()

    if (!user || !orgId) {
        throw new Error('Unauthorized')
    }

    const { data: quote } = await supabase
        .from('quotes')
        .select('id, client_name, client_phone, client_email, total, organization_id, status, experience_mode, sent_confirmed_at')
        .eq('id', id)
        .eq('organization_id', orgId)
        .maybeSingle()

    if (!quote) {
        throw new Error('Orcamento nao encontrado.')
    }

    if (channel === 'whatsapp' && (quote.client_phone || '').replace(/\D/g, '').length < 10) {
        throw new Error('Informe o WhatsApp do cliente antes de confirmar o envio.')
    }

    if (channel === 'email' && !/^\S+@\S+\.\S+$/.test(quote.client_email || '')) {
        throw new Error('Informe o email do cliente antes de confirmar o envio.')
    }

    const wasAlreadyConfirmed = Boolean(quote.sent_confirmed_at)
    const { data: atomicRows, error: atomicError } = await supabase.rpc('confirm_quote_sent_and_start_trial', {
        p_quote_id: id,
        p_channel: channel,
    })

    if (!atomicError) {
        const atomicConfirmation = Array.isArray(atomicRows) ? atomicRows[0] : null
        const confirmedAt = atomicConfirmation?.confirmed_at || new Date().toISOString()
        const trialStarted = Boolean(atomicConfirmation?.trial_started)
        const trialEndsAt = atomicConfirmation?.trial_ends_at || null
        const payload = {
            quote_id: id,
            channel,
            previous_status: quote.status || 'unknown',
            experience_mode: quote.experience_mode || 'free_simple',
            total_band: Number(quote.total || 0) < 500 ? 'under_500' : Number(quote.total || 0) < 1500 ? '500_1499' : Number(quote.total || 0) < 5000 ? '1500_4999' : '5000_plus',
            source: 'owner_confirmed_send',
        }

        if (!wasAlreadyConfirmed) {
            await createNotification(
                user.id,
                'Orcamento enviado',
                `O orcamento para ${quote.client_name} foi confirmado como enviado pelo ${channel === 'whatsapp' ? 'WhatsApp' : 'email'}.`,
                `/quotes/${id}`,
                'info',
            )
            await captureServerEvent('quote_sent_confirmed', user.id, payload)
            await captureServerActivationStage(user.id, 'quote_sent_no_subscription', payload)
        }

        if (trialStarted) {
            await captureServerEvent('pro_trial_started', user.id, {
                ...payload,
                source: 'first_confirmed_quote_send',
                trial_days: 7,
            })
            await createNotification(
                user.id,
                'Teste Pro liberado por 7 dias',
                'Sua primeira proposta foi enviada. Agora voce pode testar recursos Pro por 7 dias.',
                '/profile?tab=proposal',
                'success',
            )
        }

        revalidatePath(`/quotes/${id}`)
        revalidatePath('/quotes')
        revalidatePath('/')
        return { success: true, confirmedAt, trialStarted, trialEndsAt }
    }

    // A short compatibility fallback prevents a deploy race from blocking a
    // real send while the database migration is still propagating.
    if (!atomicError.message.includes('confirm_quote_sent_and_start_trial')) {
        console.error('Error confirming quote sent:', atomicError)
        throw new Error(atomicError.message || 'Nao foi possivel confirmar o envio.')
    }

    if (['draft', 'pending'].includes(quote.status || '')) {
        const { error: sentStatusError } = await supabase.rpc('update_quote_status', {
            quote_id: id,
            new_status: 'sent',
        })

        if (sentStatusError) {
            console.error('Error updating quote to sent:', sentStatusError)
            throw new Error('Não foi possível confirmar o envio da proposta.')
        }

        await createNotification(
            user.id,
            'Orçamento enviado',
            `O orçamento para ${quote.client_name} foi confirmado como enviado pelo ${channel === 'whatsapp' ? 'WhatsApp' : 'email'}.`,
            `/quotes/${id}`,
            'info',
        )
    }

    const confirmedAt = new Date().toISOString()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('quotes') as any)
        .update({
            sent_confirmed_at: confirmedAt,
            sent_via: channel,
            approval_recipient_phone: quote.client_phone || null,
            approval_recipient_name: quote.client_name,
            approval_link_issued_at: confirmedAt,
            updated_at: confirmedAt,
        })
        .eq('id', id)
        .eq('organization_id', orgId)

    if (error) {
        console.error('Error confirming quote sent:', error)
        throw new Error('Nao foi possivel confirmar o envio.')
    }

    const payload = {
        quote_id: id,
        channel,
        previous_status: quote.status || 'unknown',
        experience_mode: quote.experience_mode || 'free_simple',
        total_band: Number(quote.total || 0) < 500 ? 'under_500' : Number(quote.total || 0) < 1500 ? '500_1499' : Number(quote.total || 0) < 5000 ? '1500_4999' : '5000_plus',
        source: 'owner_confirmed_send',
    }

    await captureServerEvent('quote_sent_confirmed', user.id, payload)
    await captureServerActivationStage(user.id, 'quote_sent_no_subscription', payload)

    revalidatePath(`/quotes/${id}`)
    revalidatePath('/quotes')
    revalidatePath('/')
    return { success: true, confirmedAt, trialStarted: false, trialEndsAt: null }
}

export async function recordQuoteFollowUp(id: string) {
    const { supabase, user, orgId } = await getAuthContext()

    if (!user || !orgId) {
        throw new Error('Unauthorized')
    }

    const { data: quote } = await supabase
        .from('quotes')
        .select('id, user_id, total, status, first_public_opened_at, organization_id')
        .eq('id', id)
        .eq('organization_id', orgId)
        .maybeSingle()

    if (!quote || quote.user_id !== user.id) {
        throw new Error('Proposta nao encontrada.')
    }

    const { data: followUpCount, error } = await supabase.rpc('register_quote_follow_up', {
        p_quote_id: id,
    })

    if (error) {
        console.error('Error registering quote follow-up:', error)
        throw new Error(error.message || 'Nao foi possivel registrar o lembrete.')
    }

    await captureServerEvent('quote_follow_up_confirmed', user.id, {
        quote_id: id,
        quote_status: quote.status || 'unknown',
        follow_up_count: Number(followUpCount || 0),
        has_public_open: Boolean(quote.first_public_opened_at),
        total_band: Number(quote.total || 0) < 500 ? 'under_500' : Number(quote.total || 0) < 1500 ? '500_1499' : Number(quote.total || 0) < 5000 ? '1500_4999' : '5000_plus',
        source: 'owner_confirmed_follow_up',
    })

    revalidatePath(`/quotes/${id}`)
    revalidatePath('/quotes')
    revalidatePath('/')
    return { success: true, followUpCount: Number(followUpCount || 0) }
}

export async function scheduleClientReturn(quoteId: string, days: number, note?: string) {
    const { supabase, user, orgId } = await getAuthContext()

    if (!user || !orgId) return { error: 'Sua sessao expirou. Entre novamente para agendar o retorno.' }

    if (![30, 90, 180].includes(days)) {
        return { error: 'Escolha um prazo valido para o retorno.' }
    }

    const trimmedNote = String(note || '').trim()
    if (trimmedNote.length > 500) return { error: 'A observacao pode ter no maximo 500 caracteres.' }

    const [quoteResult, profileResult] = await Promise.all([
        supabase
            .from('quotes')
            .select('id, user_id, organization_id, client_id, client_name, client_phone, client_email, status')
            .eq('id', quoteId)
            .eq('organization_id', orgId)
            .maybeSingle(),
        supabase
            .from('profiles')
            .select('plan, subscription_status, pro_trial_ends_at')
            .eq('id', user.id)
            .maybeSingle(),
    ])

    const quote = quoteResult.data
    if (!quote || quote.user_id !== user.id) return { error: 'Proposta nao encontrada.' }
    if (quote.status !== 'completed') return { error: 'O retorno pode ser agendado depois de concluir o servico.' }

    const accessPlan = getEntitledPlan(
        profileResult.data?.plan,
        profileResult.data?.subscription_status,
        profileResult.data?.pro_trial_ends_at,
    )
    if (isFreePlan(accessPlan)) {
        return { error: 'Retornos pos-servico fazem parte do Pro. Envie uma proposta para liberar seu teste Pro de 7 dias.' }
    }

    let clientId = quote.client_id
    if (!clientId) {
        try {
            const linkedClient = await resolveQuoteClient({
                supabase,
                userId: user.id,
                orgId,
                requestedClientId: '',
                clientName: quote.client_name,
                clientPhone: quote.client_phone || '',
                clientEmail: quote.client_email || '',
            })
            clientId = linkedClient.id
            await supabase
                .from('quotes')
                // The client relation is introduced in this deployment migration.
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .update({ client_id: clientId } as any)
                .eq('id', quoteId)
                .eq('organization_id', orgId)
        } catch (error) {
            return { error: error instanceof Error ? error.message : 'Nao foi possivel vincular o cliente.' }
        }
    }

    const dueDate = new Date()
    dueDate.setUTCDate(dueDate.getUTCDate() + days)
    const dueDateValue = dueDate.toISOString().slice(0, 10)

    // A quote has one active return reminder. Rescheduling keeps the history
    // clear instead of flooding the owner with duplicate reminders.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const reminderTable = supabase.from('client_return_reminders') as any
    const { data: activeReminder, error: activeReminderError } = await reminderTable
        .select('id')
        .eq('quote_id', quoteId)
        .eq('status', 'scheduled')
        .maybeSingle()

    if (activeReminderError) {
        console.error('Error loading client return reminder:', activeReminderError)
        return { error: 'Nao foi possivel preparar o retorno.' }
    }

    const reminderPayload = {
        client_id: clientId,
        organization_id: orgId,
        user_id: user.id,
        due_date: dueDateValue,
        note: trimmedNote || null,
        status: 'scheduled',
        sent_at: null,
        dismissed_at: null,
    }

    const { data: reminder, error: reminderError } = activeReminder
        ? await reminderTable
            .update(reminderPayload)
            .eq('id', activeReminder.id)
            .eq('user_id', user.id)
            .select('id, due_date, status, note')
            .single()
        : await reminderTable
            .insert({ quote_id: quoteId, ...reminderPayload })
            .select('id, due_date, status, note')
            .single()

    if (reminderError || !reminder) {
        console.error('Error scheduling client return:', reminderError)
        return { error: 'Nao foi possivel agendar o retorno.' }
    }

    await createNotification(
        user.id,
        'Retorno de cliente agendado',
        `Lembre de falar com ${quote.client_name} em ${days} dias.`,
        `/quotes/${quoteId}`,
        'info',
    )
    await captureServerEvent('client_return_scheduled', user.id, {
        quote_id: quoteId,
        days,
        has_note: Boolean(trimmedNote),
        source: 'quote_completion',
    })

    revalidatePath(`/quotes/${quoteId}`)
    revalidatePath('/clients')
    revalidatePath('/')
    return {
        success: true,
        reminder: {
            id: reminder.id,
            dueDate: reminder.due_date,
            status: reminder.status,
            note: reminder.note,
        },
    }
}

async function updateClientReturnStatus(reminderId: string, status: 'sent' | 'dismissed') {
    const { supabase, user, orgId } = await getAuthContext()
    if (!user || !orgId) return { error: 'Sua sessao expirou. Entre novamente.' }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const reminderTable = supabase.from('client_return_reminders') as any
    const { data: reminder } = await reminderTable
        .select('id, quote_id, organization_id, user_id, status')
        .eq('id', reminderId)
        .eq('organization_id', orgId)
        .maybeSingle()

    if (!reminder || reminder.user_id !== user.id) return { error: 'Lembrete nao encontrado.' }
    if (reminder.status !== 'scheduled') return { error: 'Este retorno ja foi encerrado.' }

    const now = new Date().toISOString()
    const { error } = await reminderTable
        .update({
            status,
            sent_at: status === 'sent' ? now : null,
            dismissed_at: status === 'dismissed' ? now : null,
        })
        .eq('id', reminderId)
        .eq('user_id', user.id)
        .eq('status', 'scheduled')

    if (error) {
        console.error('Error updating client return reminder:', error)
        return { error: 'Nao foi possivel atualizar o retorno.' }
    }

    await captureServerEvent(status === 'sent' ? 'client_return_sent_confirmed' : 'client_return_dismissed', user.id, {
        quote_id: reminder.quote_id,
        reminder_id: reminderId,
        source: 'client_return_panel',
    })
    revalidatePath(`/quotes/${reminder.quote_id}`)
    revalidatePath('/clients')
    revalidatePath('/')
    return { success: true }
}

export async function confirmClientReturnSent(reminderId: string) {
    return updateClientReturnStatus(reminderId, 'sent')
}

export async function dismissClientReturn(reminderId: string) {
    return updateClientReturnStatus(reminderId, 'dismissed')
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
        .select('id, client_name, total, organization_id, user_id, deposit_amount, deposit_status')
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
    const marksDepositPaid = quote.deposit_status === 'requested'
        && Number(quote.deposit_amount || 0) > 0
        && nextAmount >= Number(quote.deposit_amount || 0)

    const { error } = await supabase
        .from('quotes')
        .update({
            payment_status: paymentStatus,
            amount_paid: nextAmount,
            paid_at: paymentStatus === 'paid' ? new Date().toISOString() : null,
            payment_updated_at: new Date().toISOString(),
            deposit_status: marksDepositPaid ? 'marked_paid' : quote.deposit_status,
            deposit_marked_paid_at: marksDepositPaid ? new Date().toISOString() : null,
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

export async function markQuoteDepositPaid(id: string) {
    const { supabase, user, orgId } = await getAuthContext()

    if (!user || !orgId) {
        throw new Error('Unauthorized')
    }

    const { data: quote } = await supabase
        .from('quotes')
        .select('id, client_name, total, user_id, organization_id, amount_paid, deposit_amount, deposit_status')
        .eq('id', id)
        .eq('organization_id', orgId)
        .maybeSingle()

    if (!quote || quote.user_id !== user.id) {
        throw new Error('Proposta nao encontrada.')
    }

    const depositAmount = Number(quote.deposit_amount || 0)
    if (depositAmount <= 0 || quote.deposit_status === 'not_requested') {
        throw new Error('Nao ha sinal Pix solicitado nesta proposta.')
    }

    const currentAmount = Number(quote.amount_paid || 0)
    const nextAmount = Math.min(Math.max(currentAmount, depositAmount), Number(quote.total || 0))
    const isFullyPaid = nextAmount >= Number(quote.total || 0) && Number(quote.total || 0) > 0
    const markedAt = new Date().toISOString()

    const { error } = await supabase
        .from('quotes')
        .update({
            deposit_status: 'marked_paid',
            deposit_marked_paid_at: markedAt,
            amount_paid: nextAmount,
            payment_status: isFullyPaid ? 'paid' : 'partial',
            paid_at: isFullyPaid ? markedAt : null,
            payment_updated_at: markedAt,
            updated_at: markedAt,
        })
        .eq('id', id)
        .eq('organization_id', orgId)

    if (error) {
        console.error('Error confirming deposit:', error)
        throw new Error('Nao foi possivel registrar o sinal.')
    }

    await createNotification(
        quote.user_id,
        'Sinal Pix registrado',
        `O sinal de ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(depositAmount)} de ${quote.client_name} foi marcado como recebido.`,
        `/quotes/${id}`,
        'success',
    )

    await captureServerEvent('quote_deposit_marked_paid', user.id, {
        quote_id: id,
        deposit_amount: depositAmount,
        total_band: Number(quote.total || 0) < 500 ? 'under_500' : Number(quote.total || 0) < 1500 ? '500_1499' : Number(quote.total || 0) < 5000 ? '1500_4999' : '5000_plus',
        source: 'manual_owner_confirmation',
    })

    revalidatePath(`/quotes/${id}`)
    revalidatePath('/quotes')
    revalidatePath('/')
    return { success: true, amountPaid: nextAmount }
}
