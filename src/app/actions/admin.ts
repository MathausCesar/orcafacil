'use server'

import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { getResend } from '@/lib/resend'

async function requireSuperAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const admin = getSupabaseAdmin()
    const { data: profile, error } = await admin
        .from('profiles')
        .select('is_superadmin')
        .eq('id', user.id)
        .single()

    if (error || !profile?.is_superadmin) {
        throw new Error('Forbidden')
    }

    return { admin, user }
}

function escapeHtml(value: string) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
}

export async function getAdminDashboardStats() {
    try {
        const { admin } = await requireSuperAdmin()

        const { count: totalUsers } = await admin
            .from('profiles')
            .select('*', { count: 'exact', head: true })

        const { count: activeSubscribers } = await admin
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .in('subscription_status', ['active', 'trialing'])

        const { count: totalQuotes } = await admin
            .from('quotes')
            .select('*', { count: 'exact', head: true })

        const { count: openTickets } = await admin
            .from('support_tickets')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'open')

        return {
            totalUsers: totalUsers || 0,
            activeSubscribers: activeSubscribers || 0,
            totalQuotes: totalQuotes || 0,
            openTickets: openTickets || 0,
            success: true,
        }
    } catch (error) {
        console.error('Error fetching admin stats:', error)
        return {
            totalUsers: 0,
            activeSubscribers: 0,
            totalQuotes: 0,
            openTickets: 0,
            success: false,
        }
    }
}

export async function getAdminUsers() {
    try {
        const { admin } = await requireSuperAdmin()
        const { data: users, error } = await admin
            .from('profiles')
            .select('*')
            .order('updated_at', { ascending: false })

        if (error) throw error

        return { users, success: true }
    } catch (error) {
        console.error('Error fetching users:', error)
        return { users: [], success: false }
    }
}

export async function getAdminTickets() {
    try {
        const { admin } = await requireSuperAdmin()
        const { data: tickets, error } = await admin
            .from('support_tickets')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error

        if (!tickets || tickets.length === 0) {
            return { tickets: [], success: true }
        }

        const userIds = tickets.map(ticket => ticket.user_id)
        const { data: profiles } = await admin
            .from('profiles')
            .select('id, email, business_name')
            .in('id', userIds)

        const ticketsWithProfiles = tickets.map(ticket => ({
            ...ticket,
            profiles: profiles?.find(profile => profile.id === ticket.user_id) || null,
        }))

        return { tickets: ticketsWithProfiles, success: true }
    } catch (error) {
        console.error('Error fetching tickets:', error)
        return { tickets: [], success: false }
    }
}

export async function replyToTicket(ticketId: string, replyMessage: string) {
    try {
        const { admin } = await requireSuperAdmin()
        const sanitizedReply = escapeHtml(replyMessage.trim())

        if (!sanitizedReply) {
            return { success: false, error: 'Resposta vazia.' }
        }

        const { data: ticket, error: ticketError } = await admin
            .from('support_tickets')
            .select('id, user_id')
            .eq('id', ticketId)
            .single()

        if (ticketError || !ticket) {
            return { success: false, error: 'Ticket nao encontrado.' }
        }

        const { data: authUser, error: authError } = await admin.auth.admin.getUserById(ticket.user_id)

        if (authError || !authUser.user?.email) {
            return { success: false, error: 'Email do usuario nao encontrado.' }
        }

        const { data: profile } = await admin
            .from('profiles')
            .select('business_name')
            .eq('id', ticket.user_id)
            .single()

        const { error } = await admin
            .from('support_tickets')
            .update({
                admin_reply: replyMessage.trim(),
                status: 'closed',
                replied_at: new Date().toISOString(),
            })
            .eq('id', ticketId)

        if (error) throw error

        const resend = getResend()
        const userName = escapeHtml(profile?.business_name || 'usuario')
        const { error: emailError } = await resend.emails.send({
            from: 'Zacly Suporte <oi@zacly.com.br>',
            to: [authUser.user.email],
            subject: 'Resposta ao seu chamado - Zacly',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2>Ola, ${userName}!</h2>
                    <p>Voce abriu um chamado conosco, aqui esta a nossa resposta:</p>
                    <div style="padding: 15px; border-left: 4px solid #14b8a6; background-color: #f0fdfa; margin-top: 20px; font-size: 16px;">
                        ${sanitizedReply.replace(/\n/g, '<br/>')}
                    </div>
                    <p style="margin-top: 30px; font-size: 14px; color: #666;">
                        Equipe Zacly<br/>
                        <a href="https://zacly.com.br" style="color: #14b8a6;">oi@zacly.com.br</a>
                    </p>
                </div>
            `,
        })

        if (emailError) {
            console.error('Email sending failed:', emailError)
            return { success: false, error: 'Falha ao enviar email.' }
        }

        return { success: true }
    } catch (error) {
        console.error('Error replying to ticket:', error)
        return { success: false, error: 'Erro de servidor.' }
    }
}
