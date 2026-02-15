'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getNotifications() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    // Check for inactive quotes first (Lazy Trigger)
    await checkInactiveQuotes(user.id)

    const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
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

    await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false)

    revalidatePath('/')
}

async function checkInactiveQuotes(userId: string) {
    const supabase = await createClient()

    // 1. Get active quotes (draft or sent)
    const { data: quotes } = await supabase
        .from('quotes')
        .select('id, client_name, updated_at, created_at, status')
        .in('status', ['draft', 'sent'])
        .eq('user_id', userId)

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
                    .eq('user_id', userId)

                if (count === 0) {
                    // Create notification
                    await supabase.from('notifications').insert({
                        user_id: userId,
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

export async function createNotification(userId: string, title: string, message: string, link: string, type: 'info' | 'success' | 'warning' | 'alert' = 'info') {
    const supabase = await createClient()
    await supabase.from('notifications').insert({
        user_id: userId,
        title,
        message,
        link,
        type
    })
}
