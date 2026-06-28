'use client'

import { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Share2, Mail, Copy, Download, Check, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'
import { updateQuoteStatus } from '@/app/actions/quotes'

interface QuoteShareModalProps {
    quoteId: string
    clientName: string
    approvalUrl: string
    whatsappLink: string
    businessName: string
    totalFormatted: string
    whatsappMessage: string
    quoteStatus?: string | null
    pdfUrl: string
}

export function QuoteShareModal({
    quoteId,
    clientName,
    approvalUrl,
    whatsappLink,
    businessName,
    whatsappMessage,
    quoteStatus,
    pdfUrl,
}: QuoteShareModalProps) {
    const [open, setOpen] = useState(false)
    const [copied, setCopied] = useState(false)
    const [markingSent, setMarkingSent] = useState(false)

    const markAsSentIfNeeded = async () => {
        if (!['draft', 'pending'].includes(quoteStatus || '')) return

        setMarkingSent(true)
        try {
            await updateQuoteStatus(quoteId, 'sent')
        } catch (error) {
            console.error('Failed to mark quote as sent:', error)
        } finally {
            setMarkingSent(false)
        }
    }

    const handleCopyLink = async () => {
        try {
            await markAsSentIfNeeded()
            await navigator.clipboard.writeText(approvalUrl)
            setCopied(true)
            toast.success('Link copiado.')
            setTimeout(() => setCopied(false), 2000)
        } catch {
            toast.error('Erro ao copiar o link.')
        }
    }

    const handleExternalShare = async () => {
        await markAsSentIfNeeded()
        setOpen(false)
    }

    const emailSubject = encodeURIComponent(`Orçamento: ${businessName} para ${clientName}`)
    const emailBody = encodeURIComponent(whatsappMessage)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-50">
                    <Share2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Compartilhar</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Share2 className="h-5 w-5 text-emerald-600" />
                        Compartilhar proposta
                    </DialogTitle>
                    <DialogDescription>
                        Envie o link seguro para o cliente aprovar ou recusar.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex flex-col gap-3">
                        <a href={whatsappLink} target="_blank" rel="noreferrer" onClick={handleExternalShare}>
                            <Button
                                disabled={markingSent}
                                variant="outline"
                                className="h-14 w-full justify-start border-[#25D366]/20 bg-[#25D366]/5 font-medium text-[#25D366] transition-all hover:bg-[#25D366]/10 hover:text-[#25D366]"
                            >
                                <div className="mr-3 rounded-full bg-[#25D366] p-2">
                                    <MessageCircle className="h-4 w-4 text-white" />
                                </div>
                                <div className="flex flex-col items-start leading-none">
                                    <span>WhatsApp</span>
                                    <span className="mt-1 text-xs font-normal opacity-70">Enviar mensagem pronta</span>
                                </div>
                            </Button>
                        </a>

                        <Button
                            variant="outline"
                            className="h-14 w-full justify-start border-zinc-200 font-medium transition-all hover:bg-zinc-50"
                            onClick={handleCopyLink}
                            disabled={markingSent}
                        >
                            <div className="mr-3 rounded-full bg-zinc-100 p-2">
                                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-zinc-600" />}
                            </div>
                            <div className="flex min-w-0 flex-col items-start leading-none">
                                <span className={copied ? 'text-emerald-700' : ''}>{copied ? 'Copiado' : 'Copiar link'}</span>
                                <span className="mt-1 max-w-[200px] truncate text-xs font-normal text-muted-foreground sm:max-w-[250px]">{approvalUrl}</span>
                            </div>
                        </Button>

                        <a href={`mailto:?subject=${emailSubject}&body=${emailBody}`} onClick={handleExternalShare}>
                            <Button
                                disabled={markingSent}
                                variant="outline"
                                className="h-14 w-full justify-start border-zinc-200 font-medium transition-all hover:bg-zinc-50"
                            >
                                <div className="mr-3 rounded-full bg-blue-100 p-2">
                                    <Mail className="h-4 w-4 text-blue-600" />
                                </div>
                                <div className="flex flex-col items-start leading-none">
                                    <span>Enviar por email</span>
                                    <span className="mt-1 text-xs font-normal text-muted-foreground">Abre seu cliente de e-mail</span>
                                </div>
                            </Button>
                        </a>

                        <a href={pdfUrl} onClick={handleExternalShare}>
                            <Button
                                disabled={markingSent}
                                variant="outline"
                                className="h-14 w-full justify-start border-zinc-200 font-medium transition-all hover:bg-zinc-50"
                            >
                                <div className="mr-3 rounded-full bg-indigo-100 p-2">
                                    <Download className="h-4 w-4 text-indigo-600" />
                                </div>
                                <div className="flex flex-col items-start leading-none">
                                    <span>Baixar PDF</span>
                                    <span className="mt-1 text-xs font-normal text-muted-foreground">Arquivo pronto para enviar</span>
                                </div>
                            </Button>
                        </a>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
