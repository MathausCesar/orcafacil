'use client'

import { useState } from 'react'
import { approveQuotePublic } from '@/app/actions/approve-quote'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { CheckCircle2, XCircle, Loader2, ThumbsUp, ThumbsDown, PencilLine } from 'lucide-react'
import { toast } from 'sonner'
import { usePostHog } from 'posthog-js/react'
import { addExceptionStep, captureException } from '@/lib/analytics'

interface ApproveQuoteClientProps {
    quoteId: string
    publicToken: string
    approvalToken: string
    clientName: string
    themeColor: string
    totalFormatted: string
    layoutStyle?: string
    professionalContext?: string
}

type DecisionDialog = 'approve' | 'reject' | 'changes' | null
type ClientDecision = 'approved' | 'rejected' | 'changes_requested'

export function ApproveQuoteClient({
    quoteId,
    publicToken,
    approvalToken,
    clientName,
    themeColor,
    totalFormatted,
    layoutStyle,
    professionalContext,
}: ApproveQuoteClientProps) {
    const [loading, setLoading] = useState(false)
    const [dialog, setDialog] = useState<DecisionDialog>(null)
    const [note, setNote] = useState('')
    const [phoneSuffix, setPhoneSuffix] = useState('')
    const [done, setDone] = useState<ClientDecision | null>(null)
    const posthog = usePostHog()

    const resetDialog = () => {
        setDialog(null)
        setNote('')
    }

    const handleConfirm = async () => {
        if (!dialog) return

        const status: ClientDecision = dialog === 'approve'
            ? 'approved'
            : dialog === 'changes'
                ? 'changes_requested'
                : 'rejected'

        const analyticsPayload = {
            decision: status,
            quote_id: quoteId,
            has_note: Boolean(note.trim()),
            layout_style: layoutStyle,
            professional_context: professionalContext,
        }

        addExceptionStep('quote_client_decision_started', analyticsPayload)
        posthog.capture('quote_client_decision_started', analyticsPayload)

        if (status !== 'approved' && note.trim().length < 5) {
            toast.error('Informe um motivo ou pedido de ajuste.')
            return
        }

        setLoading(true)
        try {
            if (phoneSuffix.replace(/\D/g, '').length !== 4) {
                toast.error('Informe os quatro ultimos digitos do WhatsApp do cliente.')
                return
            }

            await approveQuotePublic(quoteId, publicToken, approvalToken, status, note, phoneSuffix)
            setDone(status)
            posthog.capture('quote_client_decision_completed', {
                ...analyticsPayload,
            })
            toast.success(
                status === 'approved'
                    ? 'Orcamento aprovado!'
                    : status === 'changes_requested'
                        ? 'Pedido de ajuste enviado.'
                        : 'Proposta recusada.'
            )
        } catch (error) {
            console.error(error)
            posthog.capture('quote_client_decision_failed', {
                ...analyticsPayload,
                reason: 'action_error',
            })
            captureException(error, {
                source: 'quote_client_decision',
                ...analyticsPayload,
            })
            toast.error('Erro ao processar', {
                description: error instanceof Error ? error.message : 'Tente novamente ou entre em contato com o prestador.',
            })
        } finally {
            setLoading(false)
            resetDialog()
        }
    }

    const handleClose = () => {
        window.close()
        toast.info('Pode fechar esta janela agora.')
    }

    if (done === 'approved') {
        return (
            <div className="flex flex-col items-center gap-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center animate-in fade-in zoom-in duration-300">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 shadow-sm">
                    <CheckCircle2 className="h-10 w-10 text-emerald-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-emerald-800">Orcamento aprovado</h2>
                    <p className="mx-auto mt-2 max-w-sm text-base text-emerald-700">
                        Obrigado, {clientName}! O prestador ja foi notificado e entrara em contato para iniciar o servico.
                    </p>
                </div>
                <Button variant="outline" className="mt-2 border-emerald-200 text-emerald-700 hover:bg-emerald-100" onClick={handleClose}>
                    Fechar janela
                </Button>
            </div>
        )
    }

    if (done === 'rejected') {
        return (
            <div className="flex flex-col items-center gap-6 rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center animate-in fade-in zoom-in duration-300">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 shadow-sm">
                    <XCircle className="h-10 w-10 text-slate-500" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-700">Proposta recusada</h2>
                    <p className="mx-auto mt-2 max-w-sm text-base text-slate-500">
                        O prestador sera informado da sua decisao e do motivo enviado.
                    </p>
                </div>
                <Button variant="outline" className="mt-2" onClick={handleClose}>
                    Fechar janela
                </Button>
            </div>
        )
    }

    if (done === 'changes_requested') {
        return (
            <div className="flex flex-col items-center gap-6 rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center animate-in fade-in zoom-in duration-300">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 shadow-sm">
                    <PencilLine className="h-10 w-10 text-amber-600" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-amber-800">Pedido de ajuste enviado</h2>
                    <p className="mx-auto mt-2 max-w-sm text-base text-amber-700">
                        O prestador recebeu sua mensagem e podera revisar a proposta.
                    </p>
                </div>
                <Button variant="outline" className="mt-2 border-amber-200 text-amber-700 hover:bg-amber-100" onClick={handleClose}>
                    Fechar janela
                </Button>
            </div>
        )
    }

    const isChangeRequest = dialog === 'changes'
    const isReject = dialog === 'reject'

    return (
        <>
            <div className="space-y-3">
                <Button
                    size="lg"
                    className="h-14 w-full rounded-xl text-lg font-bold text-white shadow-lg transition-all hover:brightness-110 active:scale-[0.98]"
                    style={{ backgroundColor: themeColor, boxShadow: `0 8px 20px -4px ${themeColor}60` }}
                    onClick={() => setDialog('approve')}
                >
                    <ThumbsUp className="mr-2 h-6 w-6" />
                    Aceitar orcamento
                </Button>
                <Button
                    size="lg"
                    variant="outline"
                    className="h-12 w-full rounded-xl border-amber-200 text-sm font-semibold text-amber-700 transition-colors hover:bg-amber-50 hover:text-amber-800"
                    onClick={() => setDialog('changes')}
                >
                    <PencilLine className="mr-2 h-4 w-4" />
                    Pedir ajuste
                </Button>
                <Button
                    size="lg"
                    variant="ghost"
                    className="h-12 w-full rounded-xl text-sm font-medium text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
                    onClick={() => setDialog('reject')}
                >
                    <ThumbsDown className="mr-2 h-4 w-4" />
                    Recusar proposta
                </Button>
            </div>

            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-3 py-3 shadow-[0_-12px_28px_rgba(15,23,42,0.16)] backdrop-blur lg:hidden print:hidden">
                <div className="mx-auto flex max-w-2xl items-center gap-3">
                    <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Total da proposta</p>
                        <p className="truncate text-lg font-black text-slate-950">{totalFormatted}</p>
                    </div>
                    <Button
                        className="h-11 shrink-0 rounded-xl px-5 font-bold text-white shadow-lg"
                        style={{ backgroundColor: themeColor, boxShadow: `0 8px 20px -8px ${themeColor}` }}
                        onClick={() => setDialog('approve')}
                    >
                        Aceitar
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-11 w-11 shrink-0 rounded-xl border-amber-200 text-amber-700"
                        aria-label="Pedir ajuste"
                        onClick={() => setDialog('changes')}
                    >
                        <PencilLine className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <AlertDialog open={dialog === 'approve'} onOpenChange={(open) => !open && resetDialog()}>
                <AlertDialogContent className="mx-4 max-w-sm rounded-2xl border-0 shadow-2xl">
                    <div className="flex justify-center pb-2 pt-4">
                        <div className="flex h-20 w-20 animate-bounce items-center justify-center rounded-full" style={{ backgroundColor: `${themeColor}15` }}>
                            <CheckCircle2 className="h-10 w-10" style={{ color: themeColor }} />
                        </div>
                    </div>
                    <AlertDialogHeader className="space-y-2 text-center">
                        <AlertDialogTitle className="text-2xl font-bold text-slate-900">Confirmar aprovacao?</AlertDialogTitle>
                    <AlertDialogDescription className="text-center text-base text-slate-600">
                            Confirme os quatro ultimos digitos do seu WhatsApp. Isso protege o aceite e registra a decisao para o prestador.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-2">
                        <label htmlFor="approval-phone-suffix" className="text-sm font-semibold text-slate-800">Ultimos 4 digitos do seu WhatsApp</label>
                        <input
                            id="approval-phone-suffix"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={4}
                            value={phoneSuffix}
                            onChange={(event) => setPhoneSuffix(event.target.value.replace(/\D/g, '').slice(-4))}
                            placeholder="0000"
                            className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-center text-lg font-bold tracking-[0.35em] outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                        />
                    </div>
                    <AlertDialogFooter className="flex-col gap-3 pt-4 sm:flex-col">
                        <Button
                            onClick={handleConfirm}
                            disabled={loading}
                            className="h-14 w-full rounded-xl text-lg font-bold text-white shadow-lg transition-transform active:scale-[0.98]"
                            style={{ backgroundColor: themeColor }}
                        >
                            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle2 className="mr-2 h-5 w-5" />}
                            Sim, aprovar
                        </Button>
                        <Button variant="ghost" onClick={resetDialog} disabled={loading} className="h-12 w-full rounded-xl text-slate-500 hover:bg-slate-100">
                            Cancelar
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={isReject || isChangeRequest} onOpenChange={(open) => !open && resetDialog()}>
                <AlertDialogContent className="mx-4 max-w-sm rounded-2xl border-0 shadow-2xl">
                    <AlertDialogHeader className="space-y-2 pt-4 text-center">
                        <div className={`mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full ${isChangeRequest ? 'bg-amber-50' : 'bg-red-50'}`}>
                            {isChangeRequest ? (
                                <PencilLine className="h-8 w-8 text-amber-500" />
                            ) : (
                                <XCircle className="h-8 w-8 text-red-500" />
                            )}
                        </div>
                        <AlertDialogTitle className="text-xl font-bold text-slate-900">
                            {isChangeRequest ? 'Pedir ajuste na proposta?' : 'Recusar proposta?'}
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-center text-slate-600">
                            {isChangeRequest
                                ? 'Explique o que precisa mudar para o prestador reenviar uma versao melhor.'
                                : 'Informe o motivo para o prestador entender sua decisao.'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <Textarea
                        value={note}
                        onChange={(event) => setNote(event.target.value)}
                        maxLength={500}
                        className="min-h-[110px] resize-none"
                        placeholder={isChangeRequest ? 'Ex: Pode separar material e mao de obra?' : 'Ex: O valor ficou acima do esperado.'}
                    />
                    <div className="space-y-2">
                        <label htmlFor="decision-phone-suffix" className="text-sm font-semibold text-slate-800">Ultimos 4 digitos do seu WhatsApp</label>
                        <input
                            id="decision-phone-suffix"
                            inputMode="numeric"
                            maxLength={4}
                            value={phoneSuffix}
                            onChange={(event) => setPhoneSuffix(event.target.value.replace(/\D/g, '').slice(-4))}
                            placeholder="0000"
                            className="h-11 w-full rounded-xl border border-slate-300 bg-white px-4 text-center font-bold tracking-[0.35em] outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                        />
                    </div>
                    <p className="text-right text-xs text-slate-400">{note.length}/500</p>
                    <AlertDialogFooter className="flex-col gap-3 pt-2 sm:flex-col">
                        <Button
                            onClick={handleConfirm}
                            disabled={loading}
                            variant={isChangeRequest ? 'default' : 'destructive'}
                            className={`h-12 w-full rounded-xl font-bold ${isChangeRequest ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-red-500 hover:bg-red-600'}`}
                        >
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : isChangeRequest ? <PencilLine className="mr-2 h-4 w-4" /> : <XCircle className="mr-2 h-4 w-4" />}
                            {isChangeRequest ? 'Enviar pedido de ajuste' : 'Sim, recusar'}
                        </Button>
                        <Button variant="ghost" onClick={resetDialog} disabled={loading} className="h-12 w-full rounded-xl">
                            Voltar
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
