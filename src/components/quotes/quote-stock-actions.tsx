'use client'

import { useState } from 'react'
import { deductQuoteStock } from '@/app/actions/quotes'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Loader2, PackageCheck, PackageMinus } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface QuoteStockActionsProps {
    quoteId: string
    status: string
    pendingStockItems: number
    deductedStockItems: number
}

export function QuoteStockActions({
    quoteId,
    status,
    pendingStockItems,
    deductedStockItems,
}: QuoteStockActionsProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const canDeduct = ['approved', 'in_progress'].includes(status)

    const handleDeduct = async () => {
        setLoading(true)

        try {
            const result = await deductQuoteStock(quoteId)

            if (result.error) {
                toast.error(result.error)
                return
            }

            toast.success(
                result.deductedItems && result.deductedItems > 0
                    ? 'Estoque baixado com sucesso.'
                    : 'Nenhum material pendente para baixar.'
            )
            router.refresh()
        } catch {
            toast.error('Nao foi possivel baixar o estoque.')
        } finally {
            setLoading(false)
        }
    }

    if (pendingStockItems <= 0 && deductedStockItems <= 0) {
        return null
    }

    if (pendingStockItems <= 0 && deductedStockItems > 0) {
        return (
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 print:hidden">
                <CheckCircle2 className="h-4 w-4" />
                Materiais ja baixados do estoque
            </div>
        )
    }

    if (!canDeduct) {
        return (
            <div className="mt-3 flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 print:hidden">
                <PackageCheck className="mt-0.5 h-4 w-4 shrink-0" />
                A baixa de materiais fica disponivel depois da aprovacao do cliente.
            </div>
        )
    }

    return (
        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 print:hidden">
            <div className="mb-3 flex items-start gap-2 text-sm text-amber-800">
                <PackageMinus className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                    Esta proposta tem {pendingStockItems} {pendingStockItems === 1 ? 'material vinculado' : 'materiais vinculados'} ao estoque.
                </span>
            </div>
            <Button
                type="button"
                onClick={handleDeduct}
                disabled={loading}
                className="w-full bg-amber-600 text-white hover:bg-amber-700"
            >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PackageMinus className="mr-2 h-4 w-4" />}
                Baixar materiais do estoque
            </Button>
        </div>
    )
}
