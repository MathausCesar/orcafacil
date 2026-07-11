'use client'

import { TicketReplyDialog, type AdminSupportTicket } from './ticket-reply-dialog'
import { updateSuggestionStatus, updateTicketStatus } from '@/app/actions/admin'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { format } from 'date-fns'
import { Lightbulb, MessageSquare, ThumbsUp } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

type ProfileSummary = { email?: string | null; business_name?: string | null } | null

type AdminSuggestion = {
    id: string
    title: string
    description?: string | null
    status: 'open' | 'planned' | 'done' | 'rejected'
    votes_count: number
    created_at: string
    admin_note?: string | null
    profiles?: ProfileSummary
}

const ticketStatusLabel: Record<string, string> = {
    open: 'Novo',
    in_progress: 'Em andamento',
    answered: 'Respondido',
    closed: 'Fechado',
}

const suggestionStatusLabel: Record<AdminSuggestion['status'], string> = {
    open: 'Em analise',
    planned: 'Planejada',
    done: 'Entregue',
    rejected: 'Nao priorizada',
}

function ticketBadgeClass(type: string) {
    if (type === 'bug') return 'bg-rose-600 text-white'
    if (type === 'suggestion') return 'bg-sky-600 text-white'
    if (type === 'praise') return 'bg-emerald-600 text-white'
    return 'bg-slate-600 text-white'
}

export function FeedbackWorkbench({ tickets, suggestions }: { tickets: AdminSupportTicket[]; suggestions: AdminSuggestion[] }) {
    const router = useRouter()
    const [updatingTicketId, setUpdatingTicketId] = useState<string | null>(null)
    const [updatingSuggestionId, setUpdatingSuggestionId] = useState<string | null>(null)

    const pendingTickets = tickets.filter(ticket => ['open', 'in_progress'].includes(ticket.status)).length
    const pendingSuggestions = suggestions.filter(suggestion => suggestion.status === 'open').length

    const handleTicketStatus = async (ticketId: string, status: AdminSupportTicket['status']) => {
        setUpdatingTicketId(ticketId)
        const result = await updateTicketStatus(ticketId, status as 'open' | 'in_progress' | 'answered' | 'closed')
        setUpdatingTicketId(null)
        if (!result.success) {
            toast.error(result.error || 'Nao foi possivel atualizar o chamado.')
            return
        }
        toast.success('Status atualizado.')
        router.refresh()
    }

    const handleSuggestionStatus = async (suggestionId: string, status: AdminSuggestion['status']) => {
        setUpdatingSuggestionId(suggestionId)
        const result = await updateSuggestionStatus(suggestionId, status)
        setUpdatingSuggestionId(null)
        if (!result.success) {
            toast.error(result.error || 'Nao foi possivel atualizar a sugestao.')
            return
        }
        toast.success('Sugestao atualizada.')
        router.refresh()
    }

    return (
        <Tabs defaultValue="tickets" className="gap-5">
            <TabsList className="w-full justify-start overflow-x-auto">
                <TabsTrigger value="tickets" className="shrink-0">
                    <MessageSquare className="size-4" /> Chamados {pendingTickets > 0 ? `(${pendingTickets})` : ''}
                </TabsTrigger>
                <TabsTrigger value="ideas" className="shrink-0">
                    <Lightbulb className="size-4" /> Ideias {pendingSuggestions > 0 ? `(${pendingSuggestions})` : ''}
                </TabsTrigger>
            </TabsList>

            <TabsContent value="tickets">
                <div className="overflow-x-auto rounded-lg border bg-card">
                    <table className="w-full min-w-[880px] text-sm">
                        <thead className="border-b bg-muted/40 text-left text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3 font-medium">Relato</th>
                                <th className="px-4 py-3 font-medium">Cliente</th>
                                <th className="px-4 py-3 font-medium">Recebido</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 text-right font-medium">Acao</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tickets.length ? tickets.map(ticket => (
                                <tr key={ticket.id} className="border-b last:border-0">
                                    <td className="max-w-[360px] px-4 py-4 align-top">
                                        <div className="mb-2 flex items-center gap-2">
                                            <Badge className={ticketBadgeClass(ticket.type)}>{ticket.type}</Badge>
                                            <span className="font-medium">{ticket.subject}</span>
                                        </div>
                                        <p className="line-clamp-2 text-muted-foreground">{ticket.message}</p>
                                    </td>
                                    <td className="px-4 py-4 align-top">
                                        <div className="font-medium">{ticket.profiles?.business_name || 'Sem empresa'}</div>
                                        <div className="text-xs text-muted-foreground">{ticket.profiles?.email || 'Sem email'}</div>
                                    </td>
                                    <td className="px-4 py-4 align-top text-muted-foreground">{format(new Date(ticket.created_at), 'dd/MM/yyyy HH:mm')}</td>
                                    <td className="px-4 py-4 align-top">
                                        <select
                                            aria-label={`Status do chamado ${ticket.subject}`}
                                            className="h-9 rounded-md border bg-background px-2 text-sm"
                                            disabled={updatingTicketId === ticket.id}
                                            value={ticket.status}
                                            onChange={(event) => handleTicketStatus(ticket.id, event.target.value)}
                                        >
                                            {Object.entries(ticketStatusLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                                        </select>
                                    </td>
                                    <td className="px-4 py-4 text-right align-top"><TicketReplyDialog ticket={ticket} /></td>
                                </tr>
                            )) : (
                                <tr><td colSpan={5} className="h-32 px-4 text-center text-muted-foreground">Nenhum chamado recebido.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </TabsContent>

            <TabsContent value="ideas">
                <div className="overflow-x-auto rounded-lg border bg-card">
                    <table className="w-full min-w-[880px] text-sm">
                        <thead className="border-b bg-muted/40 text-left text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3 font-medium">Ideia</th>
                                <th className="px-4 py-3 font-medium">Enviada por</th>
                                <th className="px-4 py-3 font-medium">Votos</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 text-right font-medium">Acompanhamento</th>
                            </tr>
                        </thead>
                        <tbody>
                            {suggestions.length ? suggestions.map(suggestion => (
                                <tr key={suggestion.id} className="border-b last:border-0">
                                    <td className="max-w-[420px] px-4 py-4 align-top">
                                        <div className="font-medium">{suggestion.title}</div>
                                        {suggestion.description ? <p className="mt-1 line-clamp-2 text-muted-foreground">{suggestion.description}</p> : null}
                                        <p className="mt-2 text-xs text-muted-foreground">{format(new Date(suggestion.created_at), 'dd/MM/yyyy HH:mm')}</p>
                                    </td>
                                    <td className="px-4 py-4 align-top">
                                        <div className="font-medium">{suggestion.profiles?.business_name || 'Sem empresa'}</div>
                                        <div className="text-xs text-muted-foreground">{suggestion.profiles?.email || 'Sem email'}</div>
                                    </td>
                                    <td className="px-4 py-4 align-top"><span className="inline-flex items-center gap-1 font-medium"><ThumbsUp className="size-4 text-primary" /> {suggestion.votes_count}</span></td>
                                    <td className="px-4 py-4 align-top">
                                        <Badge variant="outline">{suggestionStatusLabel[suggestion.status]}</Badge>
                                    </td>
                                    <td className="px-4 py-4 text-right align-top">
                                        <select
                                            aria-label={`Status da sugestao ${suggestion.title}`}
                                            className="h-9 rounded-md border bg-background px-2 text-sm"
                                            disabled={updatingSuggestionId === suggestion.id}
                                            value={suggestion.status}
                                            onChange={(event) => handleSuggestionStatus(suggestion.id, event.target.value as AdminSuggestion['status'])}
                                        >
                                            {Object.entries(suggestionStatusLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                                        </select>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={5} className="h-32 px-4 text-center text-muted-foreground">Nenhuma sugestao recebida.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">As sugestoes do mural continuam visiveis aos clientes para receber votos. Chamados de suporte permanecem privados.</p>
            </TabsContent>
        </Tabs>
    )
}
