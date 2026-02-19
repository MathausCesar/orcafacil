'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { approveQuotePublic } from '@/app/actions/approve-quote'
import { Button } from '@/components/ui/button'
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { CheckCircle2, XCircle, Loader2, ThumbsUp, ThumbsDown } from 'lucide-react'

interface ApproveQuoteClientProps {
    quoteId: string
    clientName: string
    themeColor: string
}

export function ApproveQuoteClient({ quoteId, clientName, themeColor }: ApproveQuoteClientProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [dialog, setDialog] = useState<'approve' | 'reject' | null>(null)
    const [done, setDone] = useState<'approved' | 'rejected' | null>(null)

    const handleConfirm = async () => {
        if (!dialog) return
        setLoading(true)
        try {
            await approveQuotePublic(quoteId, dialog === 'approve' ? 'approved' : 'rejected')
            setDone(dialog === 'approve' ? 'approved' : 'rejected')
        } catch {
            // silent
        } finally {
            setLoading(false)
            setDialog(null)
        }
    }

    if (done === 'approved') {
        return (
            <div className="flex flex-col items-center gap-4 p-8 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="h-9 w-9 text-emerald-600" />
                </div>
                <div>
                    <p className="text-xl font-bold text-emerald-800">Orçamento Aprovado! 🎉</p>
                    <p className="text-sm text-emerald-700 mt-1">
                        Obrigado, {clientName}! O prestador foi notificado e entrará em contato para iniciar o serviço.
                    </p>
                </div>
            </div>
        )
    }

    if (done === 'rejected') {
        return (
            <div className="flex flex-col items-center gap-4 p-8 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                    <XCircle className="h-9 w-9 text-slate-500" />
                </div>
                <div>
                    <p className="text-xl font-bold text-slate-700">Proposta Recusada</p>
                    <p className="text-sm text-slate-500 mt-1">
                        O prestador será informado. Você pode entrar em contato para renegociar.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <>
            {/* CTA Buttons */}
            <div className="space-y-3">
                <Button
                    size="lg"
                    className="w-full h-14 text-base font-bold rounded-xl shadow-lg transition-transform active:scale-[0.98] text-white"
                    style={{ backgroundColor: themeColor, boxShadow: `0 8px 24px ${themeColor}40` }}
                    onClick={() => setDialog('approve')}
                >
                    <ThumbsUp className="mr-2 h-5 w-5" />
                    Aceitar Orçamento
                </Button>
                <Button
                    size="lg"
                    variant="outline"
                    className="w-full h-12 text-sm font-medium rounded-xl text-slate-500 hover:text-red-600 hover:border-red-300 hover:bg-red-50 transition-colors"
                    onClick={() => setDialog('reject')}
                >
                    <ThumbsDown className="mr-2 h-4 w-4" />
                    Recusar Proposta
                </Button>
            </div>

            {/* Confirm Approve Dialog */}
            <AlertDialog open={dialog === 'approve'} onOpenChange={(open) => !open && setDialog(null)}>
                <AlertDialogContent className="rounded-2xl max-w-sm mx-4">
                    <div className="flex justify-center pt-2 pb-2">
                        <div
                            className="w-16 h-16 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: `${themeColor}20` }}
                        >
                            <CheckCircle2 className="h-9 w-9" style={{ color: themeColor }} />
                        </div>
                    </div>
                    <AlertDialogHeader className="text-center">
                        <AlertDialogTitle className="text-xl">Confirmar aprovação?</AlertDialogTitle>
                        <AlertDialogDescription className="text-center">
                            Ao confirmar, o prestador será notificado que você aprovou a proposta e o serviço pode ser iniciado.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
                        <Button
                            onClick={handleConfirm}
                            disabled={loading}
                            className="w-full h-12 font-bold rounded-xl text-white"
                            style={{ backgroundColor: themeColor }}
                        >
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                            Sim, Aprovar!
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => setDialog(null)}
                            disabled={loading}
                            className="w-full"
                        >
                            Voltar e revisar
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Confirm Reject Dialog */}
            <AlertDialog open={dialog === 'reject'} onOpenChange={(open) => !open && setDialog(null)}>
                <AlertDialogContent className="rounded-2xl max-w-sm mx-4">
                    <AlertDialogHeader className="text-center">
                        <AlertDialogTitle className="text-xl">Recusar proposta?</AlertDialogTitle>
                        <AlertDialogDescription className="text-center">
                            Tem certeza? O prestador será informado que você recusou esta proposta.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
                        <Button
                            onClick={handleConfirm}
                            disabled={loading}
                            variant="outline"
                            className="w-full h-12 border-red-200 text-red-600 hover:bg-red-50 rounded-xl"
                        >
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                            Sim, Recusar
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => setDialog(null)}
                            disabled={loading}
                            className="w-full"
                        >
                            Cancelar
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
