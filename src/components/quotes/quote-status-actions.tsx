'use client'

import { useState } from 'react'
import { updateQuoteStatus } from '@/app/actions/quotes'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2, PlayCircle, Trophy } from 'lucide-react'
import { toast } from 'sonner'

interface QuoteActionsProps {
    quoteId: string
    currentStatus: string
    isOwner: boolean
}

export function QuoteStatusActions({ quoteId, currentStatus, isOwner }: QuoteActionsProps) {
    const [loading, setLoading] = useState(false)

    const handleStatusChange = async (status: 'approved' | 'rejected' | 'in_progress' | 'completed') => {
        setLoading(true)
        try {
            await updateQuoteStatus(quoteId, status)
            const messages: Record<string, string> = {
                approved: 'Orçamento Aprovado!',
                rejected: 'Orçamento Recusado.',
                in_progress: 'Execução iniciada!',
                completed: 'Orçamento concluído!'
            }
            toast.success(messages[status])
        } catch {
            toast.error('Erro ao atualizar status.')
        } finally {
            setLoading(false)
        }
    }

    if (currentStatus === 'completed') {
        return (
            <div className="flex items-center justify-center gap-2 p-4 bg-teal-50 text-teal-700 rounded-lg border border-teal-200 w-full">
                <Trophy className="h-5 w-5" />
                <span className="font-bold">Orçamento Concluído</span>
            </div>
        )
    }

    if (currentStatus === 'in_progress') {
        return (
            <div className="flex flex-col gap-3 w-full print:hidden">
                <div className="flex items-center justify-center gap-2 p-3 bg-violet-50 text-violet-700 rounded-lg border border-violet-200 w-full">
                    <PlayCircle className="h-5 w-5" />
                    <span className="font-bold">Em Execução</span>
                </div>
                {isOwner && (
                    <Button
                        onClick={() => handleStatusChange('completed')}
                        disabled={loading}
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-200"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trophy className="h-4 w-4 mr-2" />}
                        Marcar como Concluído
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
                    <span className="font-bold">Orçamento Aprovado</span>
                </div>
                {isOwner && (
                    <Button
                        onClick={() => handleStatusChange('in_progress')}
                        disabled={loading}
                        className="w-full bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-200"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <PlayCircle className="h-4 w-4 mr-2" />}
                        Iniciar Execução
                    </Button>
                )}
            </div>
        )
    }

    if (currentStatus === 'rejected') {
        return (
            <div className="flex items-center justify-center gap-2 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 w-full">
                <XCircle className="h-5 w-5" />
                <span className="font-bold">Orçamento Recusado</span>
            </div>
        )
    }

    // pending / sent / draft — show approve/reject buttons
    return (
        <div className="flex flex-col sm:flex-row gap-3 w-full print:hidden">
            <Button
                onClick={() => handleStatusChange('approved')}
                disabled={loading}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200"
            >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                Aprovar Orçamento
            </Button>
            <Button
                onClick={() => handleStatusChange('rejected')}
                disabled={loading}
                variant="outline"
                className="flex-1 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
            >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                Recusar
            </Button>
        </div>
    )
}
