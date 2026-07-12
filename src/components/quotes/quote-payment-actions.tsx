'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, CircleDollarSign, Loader2, WalletCards } from 'lucide-react'
import { toast } from 'sonner'
import { updateQuotePayment } from '@/app/actions/quotes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type PaymentStatus = 'unpaid' | 'partial' | 'paid'

type QuotePaymentActionsProps = {
    quoteId: string
    total: number
    paymentStatus?: string | null
    amountPaid?: number | null
    depositAmount?: number | null
    depositStatus?: string | null
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function normalizePaymentStatus(status?: string | null): PaymentStatus {
    return status === 'partial' || status === 'paid' ? status : 'unpaid'
}

export function QuotePaymentActions({
    quoteId,
    total,
    paymentStatus,
    amountPaid,
    depositAmount,
    depositStatus,
}: QuotePaymentActionsProps) {
    const router = useRouter()
    const currentStatus = normalizePaymentStatus(paymentStatus)
    const [loadingStatus, setLoadingStatus] = useState<PaymentStatus | null>(null)
    const [partialAmount, setPartialAmount] = useState(String(amountPaid && amountPaid > 0 ? amountPaid : ''))

    const paidAmount = Number(amountPaid || 0)
    const remaining = Math.max(total - paidAmount, 0)
    const requestedDeposit = Number(depositAmount || 0)

    const handlePaymentUpdate = async (status: PaymentStatus, amount?: number) => {
        if (status === 'partial' && (!amount || amount <= 0)) {
            toast.error('Informe o valor recebido parcialmente.')
            return
        }

        setLoadingStatus(status)

        try {
            await updateQuotePayment(quoteId, status, amount)
            router.refresh()

            const messages: Record<PaymentStatus, string> = {
                unpaid: 'Recebimento marcado como em aberto.',
                partial: 'Recebimento parcial registrado.',
                paid: 'Recebimento marcado como pago.',
            }

            toast.success(messages[status])
        } catch {
            toast.error('Nao foi possivel atualizar o recebimento.')
        } finally {
            setLoadingStatus(null)
        }
    }

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
                <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700">
                    <WalletCards className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <p className="text-sm font-black text-slate-950">Recebimento</p>
                            <p className="text-xs leading-5 text-slate-500">
                                Controle simples para saber se falta cobrar.
                            </p>
                        </div>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700">
                            {currentStatus === 'paid'
                                ? 'Recebido'
                                : currentStatus === 'partial'
                                    ? `Falta ${formatCurrency(remaining)}`
                                    : 'Em aberto'}
                        </span>
                    </div>

                    {currentStatus === 'partial' && (
                        <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900">
                            Recebido: {formatCurrency(paidAmount)} de {formatCurrency(total)}
                        </p>
                    )}

                    {requestedDeposit > 0 && (
                        <p className={`mt-3 rounded-xl px-3 py-2 text-xs font-semibold ${depositStatus === 'marked_paid' ? 'bg-emerald-50 text-emerald-900' : 'bg-sky-50 text-sky-900'}`}>
                            {depositStatus === 'marked_paid'
                                ? `Sinal Pix registrado: ${formatCurrency(requestedDeposit)}`
                                : `Sinal Pix solicitado: ${formatCurrency(requestedDeposit)}. Confirme pelo extrato antes de marcar como recebido.`}
                        </p>
                    )}

                    <div className="mt-4 grid gap-2 sm:grid-cols-3">
                        <Button
                            type="button"
                            variant={currentStatus === 'unpaid' ? 'default' : 'outline'}
                            className="h-10"
                            disabled={!!loadingStatus}
                            onClick={() => handlePaymentUpdate('unpaid', 0)}
                        >
                            {loadingStatus === 'unpaid' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CircleDollarSign className="mr-2 h-4 w-4" />}
                            Falta receber
                        </Button>
                        <div className="flex gap-2 sm:col-span-1">
                            <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={partialAmount}
                                onChange={(event) => setPartialAmount(event.target.value)}
                                placeholder="Valor"
                                className="h-10"
                            />
                            <Button
                                type="button"
                                variant={currentStatus === 'partial' ? 'default' : 'outline'}
                                className="h-10 shrink-0"
                                disabled={!!loadingStatus}
                                onClick={() => handlePaymentUpdate('partial', Number(partialAmount))}
                            >
                                {loadingStatus === 'partial' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Parcial'}
                            </Button>
                        </div>
                        <Button
                            type="button"
                            variant={currentStatus === 'paid' ? 'default' : 'outline'}
                            className="h-10 bg-emerald-600 text-white hover:bg-emerald-700"
                            disabled={!!loadingStatus}
                            onClick={() => handlePaymentUpdate('paid', total)}
                        >
                            {loadingStatus === 'paid' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                            Recebido
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    )
}
