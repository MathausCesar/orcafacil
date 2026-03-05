'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getAuthContext } from '@/lib/get-auth-context'

export async function getNotifications() {
    const { supabase, user, orgId } = await getAuthContext()

    if (!user || !orgId) return []

    // Fire-and-forget: schedule lazy checks without blocking the response
    // These run in the background and don't delay the notification list
    checkInactiveQuotesBatch(user.id, orgId).catch(() => { })
    checkExpiringQuotesBatch(user.id, orgId).catch(() => { })

    const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false })
        .limit(20)

    return data || []
}

export async function markAsRead(id: string) {
    const supabase = await createClient()
    await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)

    revalidatePath('/')
}

export async function markAllAsRead() {
    const { supabase, user, orgId } = await getAuthContext()
    if (!user || !orgId) return

    await supabase
        .from('notifications')
        .update({ read: true })
        .eq('organization_id', orgId)
        .eq('read', false)

    revalidatePath('/')
}

async function checkInactiveQuotesBatch(userId: string, orgId: string) {
    const supabase = await createClient()

    const { data: quotes } = await supabase
        .from('quotes')
        .select('id, client_name, updated_at, created_at, status')
        .in('status', ['pending', 'sent'])
        .eq('organization_id', orgId)

    if (!quotes || quotes.length === 0) return

    const now = new Date()
    const notificationThresholds = [7, 10, 15, 30]

    // Collect all quote IDs that need checking
    const quoteLinks = quotes.map(q => `/quotes/${q.id}`)

    // Batch query: get ALL existing notifications for these quotes in ONE query
    const { data: existingNotifications } = await supabase
        .from('notifications')
        .select('link, title')
        .eq('organization_id', orgId)
        .in('link', quoteLinks)

    const existingSet = new Set(
        (existingNotifications || []).map(n => `${n.link}|${n.title}`)
    )

    // Build batch of notifications to insert
    const toInsert: any[] = []

    for (const quote of quotes) {
        const lastUpdate = new Date(quote.updated_at || quote.created_at)
        const diffTime = Math.abs(now.getTime() - lastUpdate.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        for (const days of notificationThresholds) {
            if (diffDays >= days) {
                const titleKey = `${days} dias sem movimentação`
                const fullTitle = `Alerta: ${titleKey}`
                const link = `/quotes/${quote.id}`
                const key = `${link}|${fullTitle}`

                if (!existingSet.has(key)) {
                    existingSet.add(key) // Prevent duplicates within this batch
                    toInsert.push({
                        user_id: userId,
                        organization_id: orgId,
                        title: fullTitle,
                        message: `O orçamento para ${quote.client_name} não é atualizado há ${diffDays} dias.`,
                        link,
                        type: 'warning'
                    })
                }
            }
        }
    }

    if (toInsert.length > 0) {
        await supabase.from('notifications').insert(toInsert)
    }
}

async function checkExpiringQuotesBatch(userId: string, orgId: string) {
    const supabase = await createClient()

    const { data: quotes } = await supabase
        .from('quotes')
        .select('id, client_name, valid_until')
        .in('status', ['pending', 'sent', 'draft'])
        .not('valid_until', 'is', null)
        .eq('organization_id', orgId)

    if (!quotes || quotes.length === 0) return

    const now = new Date()
    const quoteLinks = quotes
        .filter(q => q.valid_until)
        .map(q => `/quotes/${q.id}`)

    if (quoteLinks.length === 0) return

    // Batch query for existing notifications
    const { data: existingNotifications } = await supabase
        .from('notifications')
        .select('link, title')
        .eq('organization_id', orgId)
        .in('link', quoteLinks)

    const existingSet = new Set(
        (existingNotifications || []).map(n => `${n.link}|${n.title}`)
    )

    const toInsert: any[] = []

    for (const quote of quotes) {
        if (!quote.valid_until) continue

        const expiryDate = new Date(quote.valid_until)
        const diffTime = expiryDate.getTime() - now.getTime()
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        let titleKey = ''
        let message = ''
        let type: 'warning' | 'alert' = 'warning'

        if (diffDays <= 0) {
            titleKey = 'Orçamento vencido'
            message = `O orçamento para ${quote.client_name} venceu! Considere entrar em contato com o cliente.`
            type = 'alert'
        } else if (diffDays <= 1) {
            titleKey = 'Orçamento vence amanhã'
            message = `O orçamento para ${quote.client_name} vence amanhã.`
            type = 'alert'
        } else if (diffDays <= 3) {
            titleKey = 'Orçamento vence em breve'
            message = `O orçamento para ${quote.client_name} vence em ${diffDays} dias.`
        } else {
            continue
        }

        const fullTitle = `⏰ ${titleKey}`
        const link = `/quotes/${quote.id}`
        const key = `${link}|${fullTitle}`

        if (!existingSet.has(key)) {
            existingSet.add(key)
            toInsert.push({
                user_id: userId,
                organization_id: orgId,
                title: fullTitle,
                message,
                link,
                type
            })
        }
    }

    if (toInsert.length > 0) {
        await supabase.from('notifications').insert(toInsert)
    }
}

export async function createNotification(userId: string, title: string, message: string, link: string, type: 'info' | 'success' | 'warning' | 'alert' = 'info') {
    const { supabase, orgId } = await getAuthContext()

    await supabase.from('notifications').insert({
        user_id: userId,
        organization_id: orgId || null,
        title,
        message,
        link,
        type
    })
}
