'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getActiveOrganizationId } from '@/lib/get-active-organization'

export async function getNotifications() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const orgId = await getActiveOrganizationId()

    if (!orgId) return []

    // Check for inactive quotes first (Lazy Trigger)
    await checkInactiveQuotes(user.id, orgId)
    // Check for expiring quotes (Lazy Trigger)
    await checkExpiringQuotes(user.id, orgId)

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
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const orgId = await getActiveOrganizationId()

    if (!orgId) return

    await supabase
        .from('notifications')
        .update({ read: true })
        .eq('organization_id', orgId)
        .eq('read', false)

    revalidatePath('/')
}

async function checkInactiveQuotes(userId: string, orgId: string) {
    const supabase = await createClient()

    // 1. Get active quotes (pending or sent)
    const { data: quotes } = await supabase
        .from('quotes')
        .select('id, client_name, updated_at, created_at, status')
        .in('status', ['pending', 'sent'])
        .eq('organization_id', orgId)

    if (!quotes) return

    const now = new Date()
    const notificationThresholds = [7, 10, 15, 30]

    for (const quote of quotes) {
        const lastUpdate = new Date(quote.updated_at || quote.created_at)
        const diffTime = Math.abs(now.getTime() - lastUpdate.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        // Check if any threshold matches
        // Optimization: We could check specifically if diffDays is close to a threshold
        // But simply ">= 7" would spam every day.
        // Needs a way to know if we ALREADY notified for THIS threshold.

        for (const days of notificationThresholds) {
            if (diffDays >= days) {
                // Check if we already notified for this quote and this threshold
                // We can check local "cache" in DB? 
                // Query notifications for this quote link AND title containing "X dias"
                const titleKey = `${days} dias sem movimentação`

                const { count } = await supabase
                    .from('notifications')
                    .select('id', { count: 'exact', head: true })
                    .eq('link', `/quotes/${quote.id}`)
                    .ilike('title', `%${titleKey}%`)
                    .eq('organization_id', orgId)

                if (count === 0) {
                    // Create notification
                    await supabase.from('notifications').insert({
                        user_id: userId, // Keep explicit target user
                        organization_id: orgId,
                        title: `Alerta: ${titleKey}`,
                        message: `O orçamento para ${quote.client_name} não é atualizado há ${diffDays} dias.`,
                        link: `/quotes/${quote.id}`,
                        type: 'warning'
                    })
                }
            }
        }
    }
}

async function checkExpiringQuotes(userId: string, orgId: string) {
    const supabase = await createClient()

    // Get quotes in analysis with a valid_until date
    const { data: quotes } = await supabase
        .from('quotes')
        .select('id, client_name, valid_until')
        .in('status', ['pending', 'sent', 'draft'])
        .not('valid_until', 'is', null)
        .eq('organization_id', orgId)

    if (!quotes) return

    const now = new Date()

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

        // Dedup: check if we already notified for this quote + this specific alert
        const { count } = await supabase
            .from('notifications')
            .select('id', { count: 'exact', head: true })
            .eq('link', `/quotes/${quote.id}`)
            .ilike('title', `%${titleKey}%`)
            .eq('organization_id', orgId)

        if (count === 0) {
            await supabase.from('notifications').insert({
                user_id: userId,
                organization_id: orgId,
                title: `⏰ ${titleKey}`,
                message,
                link: `/quotes/${quote.id}`,
                type
            })
        }
    }
}

export async function createNotification(userId: string, title: string, message: string, link: string, type: 'info' | 'success' | 'warning' | 'alert' = 'info') {
    const supabase = await createClient()
    const orgId = await getActiveOrganizationId()

    await supabase.from('notifications').insert({
        user_id: userId,
        organization_id: orgId || null,
        title,
        message,
        link,
        type
    })
}
