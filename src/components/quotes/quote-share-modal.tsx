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
import { Share2, Mail, Copy, Printer, Check, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface QuoteShareModalProps {
    quoteId: string
    clientName: string
    approvalUrl: string
    whatsappLink: string
    businessName: string
    totalFormatted: string
    whatsappMessage: string
}

export function QuoteShareModal({ quoteId, clientName, approvalUrl, whatsappLink, businessName, totalFormatted, whatsappMessage }: QuoteShareModalProps) {
    const [open, setOpen] = useState(false)
    const [copied, setCopied] = useState(false)

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(approvalUrl)
            setCopied(true)
            toast.success('Link copiado para a área de transferência!')
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            toast.error('Erro ao copiar o link.')
        }
    }

    const handlePrint = () => {
        setOpen(false)
        setTimeout(() => {
            try {
                window.print()
            } catch (e) {
                console.error("Failed to print:", e)
            }
        }, 300)
    }

    const emailSubject = encodeURIComponent(`Orçamento: ${businessName} para ${clientName}`)
    const emailBody = encodeURIComponent(whatsappMessage)

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50 bg-white">
                    <Share2 className="h-4 w-4" /> <span className="hidden sm:inline">Compartilhar</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl flex items-center gap-2">
                        <Share2 className="h-5 w-5 text-emerald-600" />
                        Compartilhar Orçamento
                    </DialogTitle>
                    <DialogDescription>
                        Escolha como deseja enviar o orçamento para o cliente.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex flex-col gap-3">
                        {/* WhatsApp */}
                        <Link href={whatsappLink} target="_blank" onClick={() => setOpen(false)}>
                            <Button
                                variant="outline"
                                className="w-full justify-start h-14 bg-[#25D366]/5 border-[#25D366]/20 hover:bg-[#25D366]/10 text-[#25D366] hover:text-[#25D366] font-medium transition-all"
                            >
                                <div className="bg-[#25D366] p-2 rounded-full mr-3">
                                    <MessageCircle className="h-4 w-4 text-white" />
                                </div>
                                <div className="flex flex-col items-start leading-none">
                                    <span>WhatsApp</span>
                                    <span className="text-xs font-normal opacity-70 mt-1">Enviar mensagem pré-configurada</span>
                                </div>
                            </Button>
                        </Link>

                        {/* Copiar Link */}
                        <Button
                            variant="outline"
                            className="w-full justify-start h-14 border-zinc-200 hover:bg-zinc-50 font-medium transition-all"
                            onClick={handleCopyLink}
                        >
                            <div className="bg-zinc-100 p-2 rounded-full mr-3">
                                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-zinc-600" />}
                            </div>
                            <div className="flex flex-col items-start leading-none">
                                <span className={copied ? "text-emerald-700" : ""}>{copied ? 'Copiado!' : 'Copiar Link'}</span>
                                <span className="text-xs font-normal text-muted-foreground mt-1 truncate max-w-[200px] sm:max-w-[250px]">{approvalUrl}</span>
                            </div>
                        </Button>

                        {/* Email */}
                        <a href={`mailto:?subject=${emailSubject}&body=${emailBody}`} onClick={() => setOpen(false)}>
                            <Button
                                variant="outline"
                                className="w-full justify-start h-14 border-zinc-200 hover:bg-zinc-50 font-medium transition-all"
                            >
                                <div className="bg-blue-100 p-2 rounded-full mr-3">
                                    <Mail className="h-4 w-4 text-blue-600" />
                                </div>
                                <div className="flex flex-col items-start leading-none">
                                    <span>Enviar por Email</span>
                                    <span className="text-xs font-normal text-muted-foreground mt-1">Abre seu cliente de email padrão</span>
                                </div>
                            </Button>
                        </a>

                        {/* Imprimir / PDF */}
                        <Button
                            variant="outline"
                            className="w-full justify-start h-14 border-zinc-200 hover:bg-zinc-50 font-medium transition-all"
                            onClick={handlePrint}
                        >
                            <div className="bg-indigo-100 p-2 rounded-full mr-3">
                                <Printer className="h-4 w-4 text-indigo-600" />
                            </div>
                            <div className="flex flex-col items-start leading-none">
                                <span>Salvar como PDF</span>
                                <span className="text-xs font-normal text-muted-foreground mt-1">Use a opção "Imprimir" e "Salvar como PDF"</span>
                            </div>
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
