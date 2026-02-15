'use client'

import { useState } from 'react'
import { updateQuoteStatus } from '@/app/actions/quotes'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface QuoteActionsProps {
    quoteId: string
    currentStatus: string
    isOwner: boolean
}

export function QuoteStatusActions({ quoteId, currentStatus, isOwner }: QuoteActionsProps) {
    const [loading, setLoading] = useState(false)

    const handleStatusChange = async (status: 'approved' | 'rejected') => {
        setLoading(true)
        try {
            await updateQuoteStatus(quoteId, status)
            toast.success(status === 'approved' ? 'Orçamento Aprovado!' : 'Orçamento Recusado.')
            // Refresh logic is handled by server action revalidatePath, but client update might need manual refresh or router.refresh if not server component parent
            // But let's assume parent revalidates.
        } catch (error) {
            toast.error('Erro ao atualizar status.')
        } finally {
            setLoading(false)
        }
    }

    if (currentStatus === 'approved') {
        return (
            <div className="flex items-center justify-center gap-2 p-4 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 w-full">
                <CheckCircle className="h-5 w-5" />
                <span className="font-bold">Orçamento Aprovado</span>
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

    // Se for o dono visualizando, ele vê o status atual (Pendente). Ele não aprova sozinho, geralmente.
    // Mas o usuário pediu "dar o aceite". Talvez ele queira marcar manualmente? Sim.
    // Se for cliente (não dono), ele DEVE ver os botões.

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
