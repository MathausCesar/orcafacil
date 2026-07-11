import { getAdminSuggestions, getAdminTickets } from '@/app/actions/admin'
import { FeedbackWorkbench } from './feedback-workbench'
import type { AdminSupportTicket } from './ticket-reply-dialog'

export const dynamic = 'force-dynamic'

export default async function AdminSupportPage() {
    const [{ tickets }, { suggestions }] = await Promise.all([getAdminTickets(), getAdminSuggestions()])

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Central de feedback</h1>
                <p className="mt-2 text-muted-foreground">Acompanhe bugs, duvidas e ideias enviadas pelos clientes. Respostas so ficam marcadas como enviadas depois que o provedor de e-mail as aceita.</p>
            </div>
            <FeedbackWorkbench tickets={tickets as AdminSupportTicket[]} suggestions={suggestions} />
        </div>
    )
}
