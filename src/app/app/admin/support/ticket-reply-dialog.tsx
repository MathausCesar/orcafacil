'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog"
import { replyToTicket } from "@/app/actions/admin"
import { toast } from "sonner"
import { MessageSquareReply, CheckCircle2 } from "lucide-react"

export function TicketReplyDialog({ ticket }: { ticket: any }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [replyText, setReplyText] = useState("")

    const isAnswered = ticket.status !== 'open'

    const handleReply = async () => {
        if (!replyText.trim()) {
            toast.error("A resposta não pode estar vazia.")
            return
        }

        const email = ticket.profiles?.email
        const name = ticket.profiles?.business_name || 'Usuário'

        if (!email) {
            toast.error("O usuário não tem email cadastrado.")
            return
        }

        setLoading(true)
        const result = await replyToTicket(ticket.id, replyText, email, name)

        if (result.success) {
            toast.success("Resposta enviada com sucesso!")
            setOpen(false)
        } else {
            toast.error("Falha ao enviar resposta.")
        }
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant={isAnswered ? "secondary" : "default"} size="sm">
                    {isAnswered ? (
                        <><CheckCircle2 className="w-4 h-4 mr-2" /> Respondido</>
                    ) : (
                        <><MessageSquareReply className="w-4 h-4 mr-2" /> Responder</>
                    )}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Ticket: {ticket.subject}</DialogTitle>
                    <DialogDescription>
                        De: {ticket.profiles?.email || 'N/A'}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 my-4">
                    <div className="bg-muted p-3 rounded-md text-sm whitespace-pre-wrap">
                        <strong>Mensagem do Usuário:</strong>
                        <div className="mt-2">{ticket.message}</div>
                    </div>

                    {isAnswered && ticket.admin_reply ? (
                        <div className="bg-primary/10 border border-primary/20 p-3 rounded-md text-sm whitespace-pre-wrap">
                            <strong>Sua Resposta:</strong>
                            <div className="mt-2">{ticket.admin_reply}</div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Escreva sua resposta</label>
                            <Textarea
                                placeholder="A resposta será enviada para o email do usuário..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                className="min-h-[120px]"
                            />
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>
                        Fechar
                    </Button>
                    {!isAnswered && (
                        <Button onClick={handleReply} disabled={loading}>
                            {loading ? "Enviando..." : "Enviar Email"}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
