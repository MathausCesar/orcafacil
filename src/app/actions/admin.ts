'use server'

import { ZaclyEmailTemplate } from '@/components/emails/zacly-email-template'
import { getAppBaseUrl } from '@/lib/app-url'
import { getResend } from '@/lib/resend'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function requireSuperAdmin() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    const admin = getSupabaseAdmin()
    const { data: profile, error } = await admin
        .from('profiles')
        .select('is_superadmin')
        .eq('id', user.id)
        .single()

    if (error || !profile?.is_superadmin) throw new Error('Forbidden')

    return { admin, user }
}

export async function getAdminDashboardStats() {
    try {
        const { admin } = await requireSuperAdmin()
        const { count: totalUsers } = await admin.from('profiles').select('*', { count: 'exact', head: true })
        const { count: activeSubscribers } = await admin
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .in('subscription_status', ['active', 'trialing'])
        const { count: totalQuotes } = await admin.from('quotes').select('*', { count: 'exact', head: true })
        const { count: openTickets } = await admin.from('support_tickets').select('*', { count: 'exact', head: true }).eq('status', 'open')

        // This table predates the generated database types.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { count: openSuggestions } = await ((admin as any).from('feature_suggestions') as any)
            .select('*', { count: 'exact', head: true })
            .eq('status', 'open')

        return {
            totalUsers: totalUsers || 0,
            activeSubscribers: activeSubscribers || 0,
            totalQuotes: totalQuotes || 0,
            openTickets: openTickets || 0,
            openSuggestions: openSuggestions || 0,
            success: true,
        }
    } catch (error) {
        console.error('Error fetching admin stats:', error)
        return { totalUsers: 0, activeSubscribers: 0, totalQuotes: 0, openTickets: 0, openSuggestions: 0, success: false }
    }
}

export async function getAdminUsers() {
    try {
        const { admin } = await requireSuperAdmin()
        const { data: users, error } = await admin.from('profiles').select('*').order('updated_at', { ascending: false })
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
        const { data: tickets, error } = await admin.from('support_tickets').select('*').order('created_at', { ascending: false })
        if (error) throw error
        if (!tickets?.length) return { tickets: [], success: true }

        const userIds = tickets.map(ticket => ticket.user_id)
        const { data: profiles } = await admin.from('profiles').select('id, email, business_name').in('id', userIds)

        return {
            tickets: tickets.map(ticket => ({
                ...ticket,
                profiles: profiles?.find(profile => profile.id === ticket.user_id) || null,
            })),
            success: true,
        }
    } catch (error) {
        console.error('Error fetching tickets:', error)
        return { tickets: [], success: false }
    }
}

export async function getAdminSuggestions() {
    try {
        const { admin } = await requireSuperAdmin()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: suggestions, error } = await ((admin as any).from('feature_suggestions') as any)
            .select('*')
            .order('votes_count', { ascending: false })
            .order('created_at', { ascending: false })

        if (error) throw error
        if (!suggestions?.length) return { suggestions: [], success: true }

        const userIds = suggestions.map((suggestion: { user_id: string }) => suggestion.user_id)
        const { data: profiles } = await admin.from('profiles').select('id, email, business_name').in('id', userIds)

        return {
            suggestions: suggestions.map((suggestion: { user_id: string }) => ({
                ...suggestion,
                profiles: profiles?.find(profile => profile.id === suggestion.user_id) || null,
            })),
            success: true,
        }
    } catch (error) {
        console.error('Error fetching suggestions:', error)
        return { suggestions: [], success: false }
    }
}

export async function updateTicketStatus(ticketId: string, status: 'open' | 'in_progress' | 'answered' | 'closed') {
    try {
        const { admin } = await requireSuperAdmin()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (admin.from('support_tickets') as any)
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', ticketId)
        if (error) throw error
        revalidatePath('/admin/support')
        return { success: true }
    } catch (error) {
        console.error('Error updating ticket status:', error)
        return { success: false, error: 'Nao foi possivel atualizar o chamado.' }
    }
}

export async function updateSuggestionStatus(
    suggestionId: string,
    status: 'open' | 'planned' | 'done' | 'rejected',
    adminNote?: string,
) {
    try {
        const { admin } = await requireSuperAdmin()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await ((admin as any).from('feature_suggestions') as any)
            .update({ status, admin_note: adminNote?.trim() || null, updated_at: new Date().toISOString() })
            .eq('id', suggestionId)
        if (error) throw error
        revalidatePath('/admin/support')
        return { success: true }
    } catch (error) {
        console.error('Error updating suggestion status:', error)
        return { success: false, error: 'Nao foi possivel atualizar a sugestao.' }
    }
}

export async function replyToTicket(ticketId: string, replyMessage: string) {
    try {
        const { admin } = await requireSuperAdmin()
        const cleanReply = replyMessage.trim()
        if (!cleanReply) return { success: false, error: 'Resposta vazia.' }

        const { data: ticket, error: ticketError } = await admin
            .from('support_tickets')
            .select('id, user_id')
            .eq('id', ticketId)
            .single()
        if (ticketError || !ticket) return { success: false, error: 'Ticket nao encontrado.' }

        const { data: authUser, error: authError } = await admin.auth.admin.getUserById(ticket.user_id)
        if (authError || !authUser.user?.email) return { success: false, error: 'Email do usuario nao encontrado.' }

        const { data: profile } = await admin.from('profiles').select('business_name').eq('id', ticket.user_id).single()
        const userName = profile?.business_name || 'voce'
        const resend = getResend()
        const { error: emailError } = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'Zacly <contato@zacly.com.br>',
            to: [authUser.user.email],
            subject: 'Resposta ao seu chamado | Zacly',
            text: `Ola, ${userName}.\n\n${cleanReply}\n\nAcesse sua conta: ${getAppBaseUrl()}`,
            react: ZaclyEmailTemplate({
                preheader: 'A equipe Zacly respondeu ao seu chamado.',
                title: 'Respondemos seu chamado',
                greeting: `Ola, ${userName}!`,
                message: cleanReply,
                ctaLabel: 'Abrir minha conta',
                ctaUrl: getAppBaseUrl(),
                footer: 'Precisa complementar alguma informacao? Abra um novo chamado dentro do Zacly.',
            }),
        })

        if (emailError) {
            console.error('Email sending failed:', emailError)
            return { success: false, error: 'Falha ao enviar email. O chamado segue aberto.' }
        }

        // Only mark a ticket as answered after the provider accepted the email.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (admin.from('support_tickets') as any)
            .update({
                admin_reply: cleanReply,
                status: 'answered',
                replied_at: new Date().toISOString(),
                first_response_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq('id', ticketId)
        if (error) throw error

        revalidatePath('/admin/support')
        return { success: true }
    } catch (error) {
        console.error('Error replying to ticket:', error)
        return { success: false, error: 'Erro de servidor.' }
    }
}
