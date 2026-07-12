'use client'

import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'
import { Check, Copy, Loader2, QrCode, WalletCards } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { markQuoteDepositPaid } from '@/app/actions/quotes'
import { captureEvent } from '@/lib/analytics'

type PixDepositCardProps = {
    quoteId: string
    amount: number
    pixPayload?: string | null
    depositStatus?: string | null
    isOwner: boolean
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

export function PixDepositCard({ quoteId, amount, pixPayload, depositStatus, isOwner }: PixDepositCardProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const router = useRouter()
    const [copied, setCopied] = useState(false)
    const [confirming, setConfirming] = useState(false)

    useEffect(() => {
        if (!pixPayload || !canvasRef.current) return
        void QRCode.toCanvas(canvasRef.current, pixPayload, {
            width: 168,
            margin: 1,
            color: { dark: '#0f172a', light: '#ffffff' },
        })
    }, [pixPayload])

    if (amount <= 0) return null

    if (!pixPayload) {
        return isOwner ? (
            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 print:hidden">
                <p className="text-sm font-black text-amber-950">Sinal Pix ainda sem chave</p>
                <p className="mt-1 text-xs leading-5 text-amber-800">Cadastre sua chave Pix no perfil antes de compartilhar esta proposta.</p>
            </section>
        ) : null
    }

    const copyPix = async () => {
        try {
            await navigator.clipboard.writeText(pixPayload)
            setCopied(true)
            captureEvent('quote_pix_copied', { quote_id: quoteId, source: isOwner ? 'owner_preview' : 'public_quote' })
            toast.success('Codigo Pix copiado.')
            window.setTimeout(() => setCopied(false), 1800)
        } catch {
            toast.error('Nao foi possivel copiar o codigo Pix.')
        }
    }

    const confirmDeposit = async () => {
        setConfirming(true)
        try {
            await markQuoteDepositPaid(quoteId)
            captureEvent('quote_deposit_marked_paid', { quote_id: quoteId, source: 'owner_action' })
            toast.success('Sinal marcado como recebido.')
            router.refresh()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Nao foi possivel registrar o sinal.')
        } finally {
            setConfirming(false)
        }
    }

    const isPaid = depositStatus === 'marked_paid'

    return (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 print:hidden">
            <div className="flex items-start gap-3">
                <div className="rounded-xl bg-emerald-600 p-2 text-white"><QrCode className="h-5 w-5" /></div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-emerald-950">Sinal via Pix</p>
                    <p className="mt-1 text-xs leading-5 text-emerald-800">{isPaid ? 'Sinal registrado pelo prestador.' : `Sinal solicitado: ${formatCurrency(amount)}.`}</p>
                </div>
            </div>

            {!isPaid && (
                <>
                    <div className="mt-4 flex justify-center rounded-xl border border-emerald-200 bg-white p-3"><canvas ref={canvasRef} className="rounded-lg" /></div>
                    <Button type="button" variant="outline" className="mt-3 w-full border-emerald-200 bg-white text-emerald-800 hover:bg-emerald-100" onClick={copyPix}>
                        {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                        {copied ? 'Codigo copiado' : 'Copiar Pix copia e cola'}
                    </Button>
                    <p className="mt-3 text-center text-[11px] leading-4 text-emerald-800">Pagamento direto ao prestador. Confirme apenas pelo seu extrato bancario.</p>
                </>
            )}

            {isOwner && !isPaid && (
                <Button type="button" className="mt-3 w-full bg-slate-950 text-white hover:bg-slate-800" onClick={confirmDeposit} disabled={confirming}>
                    {confirming ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <WalletCards className="mr-2 h-4 w-4" />}
                    Confirmar sinal recebido
                </Button>
            )}
        </section>
    )
}
