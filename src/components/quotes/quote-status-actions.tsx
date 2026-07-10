'use client'

import { useState } from 'react'
import { updateQuoteStatus } from '@/app/actions/quotes'
import { Button } from '@/components/ui/button'
import { CheckCircle, Clock, Loader2, PlayCircle, ShieldCheck, Trophy, Send, FileText, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { usePostHog } from 'posthog-js/react'
import { addExceptionStep, captureActivationStage, captureConversion, captureException } from '@/lib/analytics'

interface QuoteActionsProps {
    quoteId: string
    currentStatus: string
    isOwner: boolean
    whatsappLink?: string
}

type OwnerStatus = 'sent' | 'in_progress' | 'completed'

export function QuoteStatusActions({ quoteId, currentStatus, isOwner, whatsappLink }: QuoteActionsProps) {
    const [loading, setLoading] = useState(false)
    const posthog = usePostHog()

    const openPreparedWhatsApp = (targetWindow: Window | null) => {
        if (!whatsappLink) return

        if (targetWindow) {
            targetWindow.opener = null
            targetWindow.location.href = whatsappLink
            return
        }

        window.open(whatsappLink, '_blank', 'noopener,noreferrer')
    }

    const handleStatusChange = async (status: OwnerStatus) => {
        const whatsappWindow = status === 'sent' && whatsappLink
            ? window.open('', '_blank')
            : null

        addExceptionStep('quote_status_change_started', {
            previous_status: currentStatus,
            next_status: status,
            source: 'quote_detail_action',
            opened_whatsapp: status === 'sent' && Boolean(whatsappLink),
        })

        setLoading(true)
        try {
            if (!isOwner) {
                throw new Error('Ação não permitida.')
            }

            await updateQuoteStatus(quoteId, status)

            posthog.capture('quote_status_changed', {
                previous_status: currentStatus,
                next_status: status,
                source: 'quote_detail_action',
                opened_whatsapp: status === 'sent' && Boolean(whatsappLink),
            })

            if (status === 'sent' && whatsappLink) {
                captureConversion('quote_share_clicked', {
                    quote_id: quoteId,
                    method: 'whatsapp',
                    previous_status: currentStatus,
                    marked_as_sent: true,
                    source: 'mark_as_sent_action',
                    has_whatsapp_link: true,
                    currency: 'BRL',
                    transaction_id: `quote_share_${quoteId}`,
                })
            }

            if (status === 'sent') {
                captureActivationStage('quote_sent_no_subscription', {
                    quote_id: quoteId,
                    previous_status: currentStatus,
                    source: 'quote_detail_action',
                    has_whatsapp_link: Boolean(whatsappLink),
                })
            }

            if (status === 'sent') {
                openPreparedWhatsApp(whatsappWindow)
            }

            const messages: Record<string, string> = {
                sent: whatsappLink ? 'Marcado como enviado. Abrindo WhatsApp...' : 'Marcado como enviado!',
                in_progress: 'Execução iniciada!',
                completed: 'Orçamento concluído!',
            }
            toast.success(messages[status])
        } catch (error) {
            whatsappWindow?.close()
            captureException(error, {
                source: 'quote_status_action',
                previous_status: currentStatus,
                next_status: status,
                opened_whatsapp: status === 'sent' && Boolean(whatsappLink),
            })
            toast.error('Erro ao atualizar status.')
        } finally {
            setLoading(false)
        }
    }

    if (currentStatus === 'completed') {
        return (
            <div className="flex items-center justify-center gap-2 p-4 bg-teal-50 text-teal-700 rounded-lg border border-teal-200 w-full">
                <Trophy className="h-5 w-5" />
                <span className="font-bold">Orçamento concluído</span>
            </div>
        )
    }

    if (currentStatus === 'draft') {
        return (
            <div className="flex flex-col gap-3 w-full print:hidden">
                <div className="flex items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-zinc-700">
                    <FileText className="h-5 w-5" />
                    <span className="font-bold">Rascunho</span>
                </div>
                {isOwner && (
                    <Button
                        onClick={() => handleStatusChange('sent')}
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                        Marcar como enviado
                    </Button>
                )}
            </div>
        )
    }

    if (currentStatus === 'in_progress') {
        return (
            <div className="flex flex-col gap-3 w-full print:hidden">
                <div className="flex items-center justify-center gap-2 p-3 bg-violet-50 text-violet-700 rounded-lg border border-violet-200 w-full">
                    <PlayCircle className="h-5 w-5" />
                    <span className="font-bold">Em execução</span>
                </div>
                {isOwner && (
                    <Button
                        onClick={() => handleStatusChange('completed')}
                        disabled={loading}
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-200"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trophy className="h-4 w-4 mr-2" />}
                        Marcar como concluído
                    </Button>
                )}
            </div>
        )
    }

    if (currentStatus === 'approved') {
        return (
            <div className="flex flex-col gap-3 w-full print:hidden">
                <div className="flex items-center justify-center gap-2 p-3 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 w-full">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-bold">Orçamento aprovado</span>
                </div>
                {isOwner && (
                    <Button
                        onClick={() => handleStatusChange('in_progress')}
                        disabled={loading}
                        className="w-full bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-200"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <PlayCircle className="h-4 w-4 mr-2" />}
                        Iniciar execução
                    </Button>
                )}
            </div>
        )
    }

    if (currentStatus === 'rejected') {
        return (
            <div className="flex items-center justify-center gap-2 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 w-full">
                <XCircle className="h-5 w-5" />
                <span className="font-bold">Proposta recusada</span>
            </div>
        )
    }

    if (currentStatus === 'changes_requested') {
        return (
            <div className="flex items-center justify-center gap-2 p-4 bg-amber-50 text-amber-800 rounded-lg border border-amber-200 w-full">
                <XCircle className="h-5 w-5" />
                <span className="font-bold">Cliente pediu ajuste</span>
            </div>
        )
    }

    if (currentStatus === 'sent' || currentStatus === 'pending') {
        return (
            <div className="flex items-center justify-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800 print:hidden">
                <Clock className="h-5 w-5" />
                <span className="font-bold">Aguardando resposta do cliente</span>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white p-4 text-slate-700 print:hidden">
            <ShieldCheck className="h-5 w-5" />
            <span className="font-bold">Aprovação disponível apenas no link do cliente</span>
        </div>
    )
}
