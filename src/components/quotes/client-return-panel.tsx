'use client'

import { type FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BellRing, Check, CheckCircle, Clock3, Crown, Loader2, MessageCircle, Send, X, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import {
    confirmClientReturnSent,
    dismissClientReturn,
    scheduleClientReturn,
} from '@/app/actions/quotes'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { captureEvent, captureException } from '@/lib/analytics'
import { cn } from '@/lib/utils'

export type ClientReturnReminder = {
    id: string
    dueDate: string | Date
    status: string
    note?: string | null
}

type ClientReturnPanelProps = {
    quoteId: string
    clientName: string
    clientPhone?: string | null
    reminder?: ClientReturnReminder | null
    isPro: boolean
}

type PendingAction = 'schedule' | 'confirm' | 'dismiss' | null

const returnOptions = [30, 90, 180] as const

function normalizeWhatsAppPhone(phone?: string | null) {
    const digits = (phone || '').replace(/\D/g, '')

    // Phone numbers saved with a Brazilian area code commonly omit the country code.
    return digits.length === 10 || digits.length === 11 ? `55${digits}` : digits
}

function formatDueDate(dueDate: ClientReturnReminder['dueDate']) {
    const dateOnlyMatch = typeof dueDate === 'string'
        ? dueDate.match(/^(\d{4})-(\d{2})-(\d{2})$/)
        : null
    const parsedDate = dueDate instanceof Date
        ? dueDate
        : dateOnlyMatch
            ? new Date(
                Number(dateOnlyMatch[1]),
                Number(dateOnlyMatch[2]) - 1,
                Number(dateOnlyMatch[3]),
            )
            : new Date(dueDate)

    if (Number.isNaN(parsedDate.getTime())) {
        return 'na data programada'
    }

    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    }).format(parsedDate)
}

function getActionError(result: unknown) {
    if (
        result
        && typeof result === 'object'
        && 'error' in result
        && typeof result.error === 'string'
        && result.error
    ) {
        return result.error
    }

    return null
}

export function ClientReturnPanel({ quoteId, clientName, clientPhone, reminder, isPro }: ClientReturnPanelProps) {
    const router = useRouter()
    const [selectedDays, setSelectedDays] = useState<(typeof returnOptions)[number]>(30)
    const [note, setNote] = useState('')
    const [pendingAction, setPendingAction] = useState<PendingAction>(null)
    const [showSentConfirmation, setShowSentConfirmation] = useState(false)
    const [showDismissConfirmation, setShowDismissConfirmation] = useState(false)

    const whatsappPhone = normalizeWhatsAppPhone(clientPhone)
    const hasClientPhone = whatsappPhone.length >= 10
    const normalizedStatus = reminder?.status.toLowerCase() || ''
    const isSent = ['sent', 'completed', 'done'].includes(normalizedStatus)
    const isDismissed = ['dismissed', 'cancelled', 'canceled'].includes(normalizedStatus)
    const isFinal = isSent || isDismissed
    const isBusy = pendingAction !== null
    const reminderNote = reminder?.note?.trim()
    const whatsappMessage = [
        `Olá, ${clientName}! Tudo bem?`,
        'Estou entrando em contato para acompanhar o serviço realizado.',
        reminderNote ? `Observação: ${reminderNote}` : '',
    ].filter(Boolean).join('\n\n')
    const whatsappHref = hasClientPhone
        ? `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(whatsappMessage)}`
        : null

    const handleSchedule = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const trimmedNote = note.trim()

        setPendingAction('schedule')
        try {
            const result = await scheduleClientReturn(quoteId, selectedDays, trimmedNote || undefined)
            const actionError = getActionError(result)

            if (actionError) {
                throw new Error(actionError)
            }

            captureEvent('client_return_scheduled', {
                quote_id: quoteId,
                days: selectedDays,
                has_note: Boolean(trimmedNote),
                source: 'client_return_panel',
            })
            toast.success(`Retorno agendado para daqui a ${selectedDays} dias.`)
            setNote('')
            router.refresh()
        } catch (error) {
            captureException(error, {
                source: 'client_return_schedule',
                quote_id: quoteId,
                days: selectedDays,
            })
            toast.error(error instanceof Error ? error.message : 'Não foi possível agendar o retorno.')
        } finally {
            setPendingAction(null)
        }
    }

    const handleWhatsAppOpen = () => {
        if (!whatsappHref || !reminder) return

        window.open(whatsappHref, '_blank', 'noopener,noreferrer')
        captureEvent('client_return_whatsapp_opened', {
            quote_id: quoteId,
            reminder_id: reminder.id,
            source: 'client_return_panel',
        })
        setShowDismissConfirmation(false)
        setShowSentConfirmation(true)
    }

    const handleConfirmSent = async () => {
        if (!reminder) return

        setPendingAction('confirm')
        try {
            const result = await confirmClientReturnSent(reminder.id)
            const actionError = getActionError(result)

            if (actionError) {
                throw new Error(actionError)
            }

            captureEvent('client_return_sent_confirmed', {
                quote_id: quoteId,
                reminder_id: reminder.id,
                source: 'client_return_panel',
            })
            toast.success('Retorno registrado como enviado.')
            setShowSentConfirmation(false)
            router.refresh()
        } catch (error) {
            captureException(error, {
                source: 'client_return_confirm_sent',
                quote_id: quoteId,
                reminder_id: reminder.id,
            })
            toast.error(error instanceof Error ? error.message : 'Não foi possível registrar o envio.')
        } finally {
            setPendingAction(null)
        }
    }

    const handleDismiss = async () => {
        if (!reminder) return

        setPendingAction('dismiss')
        try {
            const result = await dismissClientReturn(reminder.id)
            const actionError = getActionError(result)

            if (actionError) {
                throw new Error(actionError)
            }

            captureEvent('client_return_dismissed', {
                quote_id: quoteId,
                reminder_id: reminder.id,
                source: 'client_return_panel',
            })
            toast.success('Retorno dispensado.')
            setShowDismissConfirmation(false)
            router.refresh()
        } catch (error) {
            captureException(error, {
                source: 'client_return_dismiss',
                quote_id: quoteId,
                reminder_id: reminder.id,
            })
            toast.error(error instanceof Error ? error.message : 'Não foi possível dispensar o retorno.')
        } finally {
            setPendingAction(null)
        }
    }

    if (reminder && isFinal) {
        const isCompleted = isSent
        const StatusIcon = isCompleted ? CheckCircle : XCircle

        return (
            <section className={cn(
                'print:hidden rounded-lg border p-4',
                isCompleted
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
                    : 'border-slate-200 bg-slate-50 text-slate-800',
            )}>
                <div className="flex items-start gap-3">
                    <StatusIcon className={cn('mt-0.5 h-5 w-5 shrink-0', isCompleted ? 'text-emerald-600' : 'text-slate-500')} />
                    <div className="min-w-0">
                        <p className="text-sm font-semibold">{isCompleted ? 'Retorno registrado como enviado' : 'Retorno dispensado'}</p>
                        <p className="mt-1 text-xs leading-5 opacity-80">Lembrete previsto para {formatDueDate(reminder.dueDate)}.</p>
                    </div>
                </div>
            </section>
        )
    }

    if (reminder) {
        return (
            <section className="print:hidden rounded-lg border border-sky-200 bg-sky-50 p-4 text-slate-950">
                <div className="flex items-start gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                        <Clock3 className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">Retorno programado</p>
                        <p className="mt-1 text-sm leading-5 text-slate-700">Fale com {clientName} em {formatDueDate(reminder.dueDate)}.</p>
                        {reminderNote && (
                            <p className="mt-3 rounded-md border border-sky-200 bg-white/80 px-3 py-2 text-xs leading-5 text-slate-700">{reminderNote}</p>
                        )}
                    </div>
                </div>

                <div className="mt-4 border-t border-sky-200 pt-4">
                    <p className="text-xs leading-5 text-slate-600">O WhatsApp será aberto no seu dispositivo. O envio é feito por você.</p>
                    <Button
                        type="button"
                        className="mt-3 h-10 w-full bg-[#25D366] text-white hover:bg-[#20bd59]"
                        onClick={handleWhatsAppOpen}
                        disabled={!hasClientPhone || isBusy}
                    >
                        <MessageCircle className="h-4 w-4" />
                        {hasClientPhone ? 'Abrir conversa no WhatsApp' : 'WhatsApp do cliente necessário'}
                    </Button>
                    {!hasClientPhone && (
                        <p className="mt-2 text-xs leading-5 text-slate-600">Adicione um telefone ao cliente para abrir o WhatsApp.</p>
                    )}
                </div>

                {showSentConfirmation && (
                    <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                        <div className="flex items-start gap-2">
                            <Send className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                            <div>
                                <p className="text-sm font-semibold text-emerald-950">Você enviou a mensagem?</p>
                                <p className="mt-1 text-xs leading-5 text-emerald-900">Registre somente depois de concluir o envio no WhatsApp.</p>
                            </div>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2">
                            <Button type="button" variant="outline" className="h-9 border-emerald-200 bg-white text-xs" onClick={() => setShowSentConfirmation(false)} disabled={isBusy}>
                                Ainda não
                            </Button>
                            <Button type="button" className="h-9 bg-emerald-600 text-xs hover:bg-emerald-700" onClick={handleConfirmSent} disabled={isBusy}>
                                {pendingAction === 'confirm' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                                Registrar enviado
                            </Button>
                        </div>
                    </div>
                )}

                {showDismissConfirmation ? (
                    <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
                        <p className="text-xs leading-5 text-slate-700">Dispensar remove este lembrete de retorno.</p>
                        <div className="mt-3 grid grid-cols-2 gap-2">
                            <Button type="button" variant="outline" className="h-9 text-xs" onClick={() => setShowDismissConfirmation(false)} disabled={isBusy}>
                                Manter lembrete
                            </Button>
                            <Button type="button" variant="destructive" className="h-9 text-xs" onClick={handleDismiss} disabled={isBusy}>
                                {pendingAction === 'dismiss' ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                                Dispensar
                            </Button>
                        </div>
                    </div>
                ) : (
                    <Button
                        type="button"
                        variant="ghost"
                        className="mt-2 h-8 w-full text-xs text-slate-600 hover:bg-sky-100 hover:text-slate-900"
                        onClick={() => {
                            setShowSentConfirmation(false)
                            setShowDismissConfirmation(true)
                        }}
                        disabled={isBusy}
                    >
                        <X className="h-4 w-4" />
                        Dispensar retorno
                    </Button>
                )}
            </section>
        )
    }

    if (!isPro) {
        return (
            <section className="print:hidden rounded-lg border border-amber-200 bg-amber-50 p-4 text-slate-950">
                <div className="flex items-start gap-3">
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                        <Crown className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">Transforme servico concluido em retorno</p>
                        <p className="mt-1 text-xs leading-5 text-slate-700">No Pro, o Zacly lembra voce de chamar {clientName} de volta no momento certo, com a mensagem pronta no WhatsApp.</p>
                        <Button asChild size="sm" className="mt-3 h-9 bg-slate-950 text-xs hover:bg-slate-800">
                            <Link href="/pricing?plan=monthly&source=client_return_paywall">Ver recursos Pro</Link>
                        </Button>
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section className="print:hidden rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                    <BellRing className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-950">Retorno pós-serviço</p>
                    <p className="mt-1 text-xs leading-5 text-slate-600">Programe um contato para saber como ficou o serviço.</p>
                </div>
            </div>

            <form className="mt-4 space-y-4" onSubmit={handleSchedule}>
                <div>
                    <p className="text-xs font-medium text-slate-700">Quando lembrar?</p>
                    <div className="mt-2 grid grid-cols-3 gap-2" role="group" aria-label="Prazo para retorno">
                        {returnOptions.map((days) => (
                            <button
                                key={days}
                                type="button"
                                aria-pressed={selectedDays === days}
                                className={cn(
                                    'min-h-14 rounded-lg border px-2 py-2 text-center text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                                    selectedDays === days
                                        ? 'border-sky-600 bg-sky-600 text-white'
                                        : 'border-slate-200 bg-white text-slate-700 hover:border-sky-300 hover:bg-sky-50',
                                )}
                                onClick={() => setSelectedDays(days)}
                                disabled={isBusy}
                            >
                                <span className="block">{days}</span>
                                <span className="mt-0.5 block text-xs font-normal opacity-80">dias</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label htmlFor={`client-return-note-${quoteId}`} className="text-xs font-medium text-slate-700">Observação (opcional)</label>
                    <Textarea
                        id={`client-return-note-${quoteId}`}
                        value={note}
                        onChange={(event) => setNote(event.target.value)}
                        placeholder="Ex.: confirmar se ficou tudo certo"
                        maxLength={280}
                        className="mt-2 min-h-20 resize-none text-sm"
                        disabled={isBusy}
                    />
                </div>

                <Button type="submit" className="h-10 w-full bg-slate-950 hover:bg-slate-800" disabled={isBusy}>
                    {pendingAction === 'schedule' ? <Loader2 className="h-4 w-4 animate-spin" /> : <BellRing className="h-4 w-4" />}
                    Agendar em {selectedDays} dias
                </Button>
            </form>
        </section>
    )
}
