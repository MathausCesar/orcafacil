'use client'

import { useState } from 'react'
import { updateQuoteStatus } from '@/app/actions/quotes'
import { Button } from '@/components/ui/button'
import { CheckCircle, Clock, FileText, Loader2, PlayCircle, ShieldCheck, Trophy, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { captureEvent, captureException } from '@/lib/analytics'

interface QuoteActionsProps {
    quoteId: string
    currentStatus: string
    isOwner: boolean
}

type OwnerStatus = 'in_progress' | 'completed'

export function QuoteStatusActions({ quoteId, currentStatus, isOwner }: QuoteActionsProps) {
    const [loading, setLoading] = useState(false)

    const handleStatusChange = async (status: OwnerStatus) => {
        setLoading(true)
        try {
            if (!isOwner) {
                throw new Error('Ação não permitida.')
            }

            await updateQuoteStatus(quoteId, status)
            captureEvent('quote_status_changed', {
                quote_id: quoteId,
                previous_status: currentStatus,
                next_status: status,
                source: 'quote_detail_action',
            })

            toast.success(status === 'in_progress' ? 'Execução iniciada.' : 'Orçamento concluído.')
        } catch (error) {
            captureException(error, {
                source: 'quote_status_action',
                quote_id: quoteId,
                previous_status: currentStatus,
                next_status: status,
            })
            toast.error('Erro ao atualizar status.')
        } finally {
            setLoading(false)
        }
    }

    if (currentStatus === 'completed') {
        return (
            <div className="flex w-full items-center justify-center gap-2 rounded-lg border border-teal-200 bg-teal-50 p-4 text-teal-700">
                <Trophy className="h-5 w-5" />
                <span className="font-bold">Orçamento concluído</span>
            </div>
        )
    }

    if (currentStatus === 'draft') {
        return (
            <div className="flex w-full flex-col gap-3 print:hidden">
                <div className="flex items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-zinc-700">
                    <FileText className="h-5 w-5" />
                    <span className="font-bold">Rascunho</span>
                </div>
                {isOwner && (
                    <p className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-center text-xs leading-5 text-blue-900">
                        Use Compartilhar para abrir o WhatsApp. A proposta só vira enviada depois da sua confirmação.
                    </p>
                )}
            </div>
        )
    }

    if (currentStatus === 'in_progress') {
        return (
            <div className="flex w-full flex-col gap-3 print:hidden">
                <div className="flex w-full items-center justify-center gap-2 rounded-lg border border-violet-200 bg-violet-50 p-3 text-violet-700">
                    <PlayCircle className="h-5 w-5" />
                    <span className="font-bold">Em execução</span>
                </div>
                {isOwner && (
                    <Button onClick={() => handleStatusChange('completed')} disabled={loading} className="w-full bg-teal-600 text-white shadow-md shadow-teal-200 hover:bg-teal-700">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trophy className="mr-2 h-4 w-4" />}
                        Marcar como concluído
                    </Button>
                )}
            </div>
        )
    }

    if (currentStatus === 'approved') {
        return (
            <div className="flex w-full flex-col gap-3 print:hidden">
                <div className="flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-emerald-700">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-bold">Orçamento aprovado</span>
                </div>
                {isOwner && (
                    <Button onClick={() => handleStatusChange('in_progress')} disabled={loading} className="w-full bg-violet-600 text-white shadow-md shadow-violet-200 hover:bg-violet-700">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlayCircle className="mr-2 h-4 w-4" />}
                        Iniciar execução
                    </Button>
                )}
            </div>
        )
    }

    if (currentStatus === 'rejected') {
        return (
            <div className="flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 print:hidden">
                <XCircle className="h-5 w-5" />
                <span className="font-bold">Proposta recusada</span>
            </div>
        )
    }

    if (currentStatus === 'changes_requested') {
        return (
            <div className="flex items-center justify-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800 print:hidden">
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
