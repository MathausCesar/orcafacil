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
import { toast } from 'sonner'

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
            toast.success(dialog === 'approve' ? 'Orçamento aprovado!' : 'Proposta recusada.')
        } catch (error) {
            console.error(error)
            toast.error('Erro ao processar', {
                description: 'Tente novamente ou entre em contato com o prestador.'
            })
        } finally {
            setLoading(false)
            setDialog(null)
        }
    }

    const handleClose = () => {
        window.close()
        // Fallback message if close fails (common in secure browsers)
        toast.info('Pode fechar esta janela agora.')
    }

    if (done === 'approved') {
        return (
            <div className="flex flex-col items-center gap-6 p-8 bg-emerald-50 rounded-2xl border border-emerald-200 text-center animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center shadow-sm">
                    <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-emerald-800">Orçamento Aprovado! 🎉</h2>
                    <p className="text-base text-emerald-700 mt-2 max-w-sm mx-auto">
                        Obrigado, {clientName}! O prestador já foi notificado e entrará em contato para iniciar o serviço.
                    </p>
                </div>
                <Button
                    variant="outline"
                    className="mt-2 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                    onClick={handleClose}
                >
                    Fechar Janela
                </Button>
            </div>
        )
    }

    if (done === 'rejected') {
        return (
            <div className="flex flex-col items-center gap-6 p-8 bg-slate-50 rounded-2xl border border-slate-200 text-center animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center shadow-sm">
                    <XCircle className="h-10 w-10 text-slate-500" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-700">Proposta Recusada</h2>
                    <p className="text-base text-slate-500 mt-2 max-w-sm mx-auto">
                        O prestador será informado da sua decisão.
                    </p>
                </div>
                <Button
                    variant="outline"
                    className="mt-2"
                    onClick={handleClose}
                >
                    Fechar Janela
                </Button>
            </div>
        )
    }

    return (
        <>
            {/* CTA Buttons */}
            <div className="space-y-4">
                <Button
                    size="lg"
                    className="w-full h-14 text-lg font-bold rounded-xl shadow-lg transition-all active:scale-[0.98] hover:brightness-110 text-white"
                    style={{ backgroundColor: themeColor, boxShadow: `0 8px 20px -4px ${themeColor}60` }}
                    onClick={() => setDialog('approve')}
                >
                    <ThumbsUp className="mr-2 h-6 w-6" />
                    Aceitar Orçamento
                </Button>
                <Button
                    size="lg"
                    variant="ghost"
                    className="w-full h-12 text-sm font-medium rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                    onClick={() => setDialog('reject')}
                >
                    <ThumbsDown className="mr-2 h-4 w-4" />
                    Recusar Proposta
                </Button>
            </div>

            {/* Confirm Approve Dialog */}
            <AlertDialog open={dialog === 'approve'} onOpenChange={(open) => !open && setDialog(null)}>
                <AlertDialogContent className="rounded-2xl max-w-sm mx-4 border-0 shadow-2xl">
                    <div className="flex justify-center pt-4 pb-2">
                        <div
                            className="w-20 h-20 rounded-full flex items-center justify-center animate-bounce"
                            style={{ backgroundColor: `${themeColor}15` }}
                        >
                            <CheckCircle2 className="h-10 w-10" style={{ color: themeColor }} />
                        </div>
                    </div>
                    <AlertDialogHeader className="text-center space-y-2">
                        <AlertDialogTitle className="text-2xl font-bold text-slate-900">Confirmar Aprovação?</AlertDialogTitle>
                        <AlertDialogDescription className="text-center text-slate-600 text-base">
                            Ao confirmar, o status será atualizado e o serviço poderá ser iniciado.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col gap-3 sm:flex-col pt-4">
                        <Button
                            onClick={handleConfirm}
                            disabled={loading}
                            className="w-full h-14 text-lg font-bold rounded-xl text-white shadow-lg transition-transform active:scale-[0.98]"
                            style={{ backgroundColor: themeColor }}
                        >
                            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle2 className="mr-2 h-5 w-5" />}
                            Sim, Aprovar!
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => setDialog(null)}
                            disabled={loading}
                            className="w-full h-12 rounded-xl text-slate-500 hover:bg-slate-100"
                        >
                            Cancelar
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Confirm Reject Dialog */}
            <AlertDialog open={dialog === 'reject'} onOpenChange={(open) => !open && setDialog(null)}>
                <AlertDialogContent className="rounded-2xl max-w-sm mx-4 border-0 shadow-2xl">
                    <AlertDialogHeader className="text-center space-y-2 pt-4">
                        <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-2">
                            <XCircle className="h-8 w-8 text-red-500" />
                        </div>
                        <AlertDialogTitle className="text-xl font-bold text-slate-900">Recusar proposta?</AlertDialogTitle>
                        <AlertDialogDescription className="text-center text-slate-600">
                            Tem certeza? O prestador será informado que você não aceitou esta proposta.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col gap-3 sm:flex-col pt-4">
                        <Button
                            onClick={handleConfirm}
                            disabled={loading}
                            variant="destructive"
                            className="w-full h-12 rounded-xl font-bold bg-red-500 hover:bg-red-600"
                        >
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                            Sim, Recusar
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={() => setDialog(null)}
                            disabled={loading}
                            className="w-full h-12 rounded-xl"
                        >
                            Voltar
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
