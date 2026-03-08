'use server'

import { createClient } from '@supabase/supabase-js'

import { Resend } from 'resend'

// Utiliza a Service Role Key para ignorar RLS e consultar métricas globais
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const resend = new Resend(process.env.RESEND_API_KEY)

export async function getAdminDashboardStats() {
    try {
        // Total de usuários cadastrados
        const { count: totalUsers } = await supabaseAdmin
            .from('profiles')
            .select('*', { count: 'exact', head: true })

        // Total de assinantes ativos
        const { count: activeSubscribers } = await supabaseAdmin
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .in('subscription_status', ['active', 'trialing'])

        // Total de orçamentos gerados
        const { count: totalQuotes } = await supabaseAdmin
            .from('quotes')
            .select('*', { count: 'exact', head: true })

        // Tickets pendentes (abertos)
        const { count: openTickets } = await supabaseAdmin
            .from('support_tickets')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'open')

        return {
            totalUsers: totalUsers || 0,
            activeSubscribers: activeSubscribers || 0,
            totalQuotes: totalQuotes || 0,
            openTickets: openTickets || 0,
            success: true
        }
    } catch (error) {
        console.error('Error fetching admin stats:', error)
        return {
            totalUsers: 0,
            activeSubscribers: 0,
            totalQuotes: 0,
            openTickets: 0,
            success: false
        }
    }
}

export async function getAdminUsers() {
    try {
        const { data: users, error } = await supabaseAdmin
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
        const { data: tickets, error } = await supabaseAdmin
            .from('support_tickets')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error

        if (tickets && tickets.length > 0) {
            const userIds = tickets.map(t => t.user_id);
            const { data: profiles } = await supabaseAdmin
                .from('profiles')
                .select('id, email, business_name')
                .in('id', userIds);

            tickets.forEach(ticket => {
                ticket.profiles = profiles?.find(p => p.id === ticket.user_id) || null;
            });
        }

        return { tickets, success: true }
    } catch (error) {
        console.error('Error fetching tickets:', error)
        return { tickets: [], success: false }
    }
}

export async function replyToTicket(ticketId: string, replyMessage: string, userEmail: string, userName: string) {
    try {
        // Atualiza o ticket no DB
        const { error } = await supabaseAdmin
            .from('support_tickets')
            .update({
                admin_reply: replyMessage,
                status: 'closed', // ou 'answered' dependendo do schema
                replied_at: new Date().toISOString()
            })
            .eq('id', ticketId)

        if (error) throw error

        // Envia email pelo Resend
        const { error: emailError } = await resend.emails.send({
            from: 'Zacly Suporte <oi@zacly.com.br>',
            to: [userEmail],
            subject: 'Resposta ao seu chamado - Zacly',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2>Olá, ${userName}!</h2>
                    <p>Você abriu um chamado conosco, aqui está a nossa resposta:</p>
                    <div style="padding: 15px; border-left: 4px solid #14b8a6; background-color: #f0fdfa; margin-top: 20px; font-size: 16px;">
                        ${replyMessage.replace(/\n/g, '<br/>')}
                    </div>
                    <p style="margin-top: 30px; font-size: 14px; color: #666;">
                        Equipe Zacly<br/>
                        <a href="https://zacly.com.br" style="color: #14b8a6;">sac@acm.com.br</a>
                    </p>
                </div>
            `
        })

        if (emailError) {
            console.error('Email sending failed:', emailError)
            return { success: false, error: 'Falha ao enviar email' }
        }

        return { success: true }
    } catch (error) {
        console.error('Error replying to ticket:', error)
        return { success: false, error: 'Erro de servidor' }
    }
}
