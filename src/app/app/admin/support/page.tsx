import { getAdminTickets } from "@/app/actions/admin"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { TicketReplyDialog } from "./ticket-reply-dialog"

export default async function AdminSupportPage() {
    const { tickets } = await getAdminTickets()

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'bug': return 'bg-rose-500'
            case 'suggestion': return 'bg-blue-500'
            case 'praise': return 'bg-emerald-500'
            default: return 'bg-slate-500'
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Suporte e Chamados</h1>
                <p className="text-muted-foreground mt-2">
                    Visualização de bugs reportados, sugestões e feedbacks.
                </p>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Usuário</TableHead>
                            <TableHead>Tipo</TableHead>
                            <TableHead>Assunto</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Ação</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tickets && tickets.length > 0 ? (
                            tickets.map((ticket: any) => (
                                <TableRow key={ticket.id}>
                                    <TableCell>
                                        {format(new Date(ticket.created_at), "dd/MM/yyyy HH:mm")}
                                    </TableCell>
                                    <TableCell>
                                        <div className="font-medium">{ticket.profiles?.business_name || 'Sem Empresa'}</div>
                                        <div className="text-xs text-muted-foreground">{ticket.profiles?.email || 'Sem email'}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={`uppercase ${getTypeColor(ticket.type)}`}>
                                            {ticket.type}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="max-w-[300px] truncate" title={ticket.subject}>
                                        {ticket.subject}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={ticket.status === 'open' ? 'destructive' : 'outline'}>
                                            {ticket.status === 'open' ? 'Aberto' : 'Respondido'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <TicketReplyDialog ticket={ticket} />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    Nenhum chamado encontrado.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
