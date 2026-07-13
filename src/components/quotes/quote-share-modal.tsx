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
import { Share2, Mail, Copy, Download, Check, MessageCircle, Send } from 'lucide-react'
import { toast } from 'sonner'
import { confirmQuoteSent } from '@/app/actions/quotes'
import { usePostHog } from 'posthog-js/react'
import { captureActivationStage, captureConversion, captureException } from '@/lib/analytics'
import { useRouter } from 'next/navigation'

interface QuoteShareModalProps {
    quoteId: string
    clientName: string
    clientPhone?: string | null
    clientEmail?: string | null
    approvalUrl: string
    whatsappLink: string
    businessName: string
    totalFormatted: string
    whatsappMessage: string
    quoteStatus?: string | null
    pdfUrl: string
}

type ShareMethod = 'whatsapp' | 'email' | 'pdf' | 'copy'

export function QuoteShareModal({
    quoteId,
    clientName,
    clientPhone,
    clientEmail,
    approvalUrl,
    whatsappLink,
    businessName,
    whatsappMessage,
    quoteStatus,
    pdfUrl,
}: QuoteShareModalProps) {
    const [open, setOpen] = useState(false)
    const [copied, setCopied] = useState(false)
    const [confirmingSent, setConfirmingSent] = useState(false)
    const [showSentConfirmation, setShowSentConfirmation] = useState(false)
    const [sentChannel, setSentChannel] = useState<'whatsapp' | 'email'>('whatsapp')
    const posthog = usePostHog()
    const router = useRouter()
    const hasWhatsappRecipient = (clientPhone || '').replace(/\D/g, '').length >= 10
    const hasEmailRecipient = /^\S+@\S+\.\S+$/.test(clientEmail || '')
    const shouldMarkAsSent = ['draft', 'pending'].includes(quoteStatus || '')

    const trackShare = (method: ShareMethod) => {
        captureConversion('quote_share_clicked', {
            quote_id: quoteId,
            method,
            previous_status: quoteStatus || 'unknown',
            source: 'share_modal',
            has_whatsapp_recipient: hasWhatsappRecipient,
        })
    }

    const confirmSent = async () => {
        if (!shouldMarkAsSent) {
            setShowSentConfirmation(false)
            setOpen(false)
            return
        }

        setConfirmingSent(true)
        try {
            const result = await confirmQuoteSent(quoteId, sentChannel)
            posthog.capture('quote_sent_confirmed', {
                quote_id: quoteId,
                previous_status: quoteStatus || 'unknown',
                channel: sentChannel,
                source: 'share_modal_confirmation',
            })
            captureActivationStage('quote_sent_no_subscription', {
                quote_id: quoteId,
                previous_status: quoteStatus || 'unknown',
                source: 'share_modal_confirmation',
                channel: sentChannel,
            })
            toast.success(result.trialStarted
                ? 'Proposta enviada. Seu teste Pro de 7 dias foi liberado.'
                : `Proposta marcada como enviada para ${clientName}.`)
            setShowSentConfirmation(false)
            setOpen(false)
            router.refresh()
        } catch (error) {
            captureException(error, {
                source: 'quote_share_confirm_sent',
                quote_id: quoteId,
            })
            toast.error(error instanceof Error ? error.message : 'Nao foi possivel confirmar o envio.')
        } finally {
            setConfirmingSent(false)
        }
    }

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(approvalUrl)
            trackShare('copy')
            setCopied(true)
            toast.success('Link copiado. O status continua como rascunho ate voce confirmar o envio.')
            window.setTimeout(() => setCopied(false), 2000)
        } catch (error) {
            captureException(error, { source: 'quote_share_copy_link', quote_id: quoteId })
            toast.error('Erro ao copiar o link.')
        }
    }

    const handleWhatsAppOpened = () => {
        trackShare('whatsapp')
        posthog.capture('quote_whatsapp_opened', {
            quote_id: quoteId,
            previous_status: quoteStatus || 'unknown',
            source: 'share_modal',
        })
        if (shouldMarkAsSent) {
            setSentChannel('whatsapp')
            setShowSentConfirmation(true)
            return
        }

        toast.success('Mensagem aberta no WhatsApp.')
    }

    const handleEmailOpened = () => {
        trackShare('email')
        if (shouldMarkAsSent) {
            setSentChannel('email')
            setShowSentConfirmation(true)
            return
        }
        setOpen(false)
    }

    const handleExternalShare = (method: Exclude<ShareMethod, 'whatsapp' | 'copy'>) => {
        trackShare(method)
        setOpen(false)
    }

    const emailSubject = encodeURIComponent(`Orcamento: ${businessName} para ${clientName}`)
    const emailBody = encodeURIComponent(whatsappMessage)
    const emailHref = hasEmailRecipient
        ? `mailto:${encodeURIComponent(clientEmail || '')}?subject=${emailSubject}&body=${emailBody}`
        : '#'

    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                setOpen(nextOpen)
                if (!nextOpen) setShowSentConfirmation(false)
                if (nextOpen) {
                    posthog.capture('quote_share_opened', {
                        quote_id: quoteId,
                        previous_status: quoteStatus || 'unknown',
                        has_whatsapp_recipient: hasWhatsappRecipient,
                    })
                }
            }}
        >
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-50">
                    <Share2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Compartilhar</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                {showSentConfirmation ? (
                    <div className="space-y-5 py-2">
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                            <div className="flex items-start gap-3">
                                <div className="rounded-full bg-emerald-600 p-2 text-white"><Send className="h-4 w-4" /></div>
                                <div>
                                    <h2 className="font-bold text-emerald-950">{sentChannel === 'whatsapp' ? 'A mensagem abriu no WhatsApp' : 'O email foi aberto'}</h2>
                                    <p className="mt-1 text-sm leading-5 text-emerald-900">Voce conseguiu enviar a proposta para {clientName}?</p>
                                </div>
                            </div>
                        </div>
                        <p className="text-sm leading-6 text-muted-foreground">Marque como enviado apenas depois de concluir o envio. Isso deixa seu pipeline e os lembretes confiaveis.</p>
                        <div className="grid gap-2 sm:grid-cols-2">
                            <Button variant="outline" onClick={() => setShowSentConfirmation(false)} disabled={confirmingSent}>Ainda nao</Button>
                            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={confirmSent} disabled={confirmingSent}>
                                {confirmingSent ? 'Confirmando...' : 'Sim, marcar enviado'}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-xl"><Share2 className="h-5 w-5 text-emerald-600" /> Compartilhar proposta</DialogTitle>
                            <DialogDescription>Envie o link de aceite ao cliente. Abrir um canal nao altera o status da proposta.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="flex flex-col gap-3">
                                {hasWhatsappRecipient ? (
                                    <a href={whatsappLink} target="_blank" rel="noreferrer" onClick={handleWhatsAppOpened}>
                                        <Button variant="outline" className="h-14 w-full justify-start border-[#25D366]/20 bg-[#25D366]/5 font-medium text-[#25D366] hover:bg-[#25D366]/10 hover:text-[#25D366]">
                                            <div className="mr-3 rounded-full bg-[#25D366] p-2"><MessageCircle className="h-4 w-4 text-white" /></div>
                                            <div className="flex flex-col items-start leading-none"><span>Enviar pelo WhatsApp</span><span className="mt-1 text-xs font-normal opacity-70">Abre a mensagem pronta para {clientName}</span></div>
                                        </Button>
                                    </a>
                                ) : (
                                    <Button variant="outline" className="h-14 w-full justify-start" disabled>
                                        <div className="mr-3 rounded-full bg-muted p-2"><MessageCircle className="h-4 w-4" /></div>
                                        <div className="flex flex-col items-start leading-none"><span>WhatsApp do cliente necessario</span><span className="mt-1 text-xs font-normal text-muted-foreground">Edite a proposta e informe o numero antes de enviar.</span></div>
                                    </Button>
                                )}

                                <Button variant="outline" className="h-14 w-full justify-start border-zinc-200 hover:bg-zinc-50" onClick={handleCopyLink}>
                                    <div className="mr-3 rounded-full bg-zinc-100 p-2">{copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-zinc-600" />}</div>
                                    <div className="flex min-w-0 flex-col items-start leading-none"><span className={copied ? 'text-emerald-700' : ''}>{copied ? 'Copiado' : 'Copiar link de aceite'}</span><span className="mt-1 max-w-[240px] truncate text-xs font-normal text-muted-foreground">{approvalUrl}</span></div>
                                </Button>

                                <a href={emailHref} onClick={hasEmailRecipient ? handleEmailOpened : (event) => event.preventDefault()}>
                                    <Button variant="outline" className="h-14 w-full justify-start border-zinc-200 hover:bg-zinc-50" disabled={!hasEmailRecipient}><div className="mr-3 rounded-full bg-blue-100 p-2"><Mail className="h-4 w-4 text-blue-600" /></div><div className="flex flex-col items-start leading-none"><span>{hasEmailRecipient ? 'Enviar por email' : 'Email do cliente necessario'}</span><span className="mt-1 text-xs font-normal text-muted-foreground">{hasEmailRecipient ? 'Abre seu cliente de email' : 'Edite a proposta para informar o email.'}</span></div></Button>
                                </a>

                                <a href={pdfUrl} onClick={() => handleExternalShare('pdf')}>
                                    <Button variant="outline" className="h-14 w-full justify-start border-zinc-200 hover:bg-zinc-50"><div className="mr-3 rounded-full bg-indigo-100 p-2"><Download className="h-4 w-4 text-indigo-600" /></div><div className="flex flex-col items-start leading-none"><span>Baixar PDF</span><span className="mt-1 text-xs font-normal text-muted-foreground">Arquivo pronto para enviar</span></div></Button>
                                </a>
                            </div>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
