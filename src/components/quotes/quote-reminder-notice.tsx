'use client'

import { useState } from 'react'
import { AlertTriangle, BellRing, Check, Clock3, Loader2, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { QuoteReminder } from '@/lib/quote-reminders'
import { recordQuoteFollowUp } from '@/app/actions/quotes'
import { captureEvent } from '@/lib/analytics'

type QuoteReminderNoticeProps = {
    quoteId: string
    reminder: QuoteReminder
    followUpUrl?: string | null
}

const toneClass: Record<QuoteReminder['tone'], string> = {
    amber: 'border-amber-200 bg-amber-50 text-amber-900',
    red: 'border-red-200 bg-red-50 text-red-900',
    blue: 'border-blue-200 bg-blue-50 text-blue-900',
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-900',
}

const iconClass: Record<QuoteReminder['tone'], string> = {
    amber: 'text-amber-700',
    red: 'text-red-700',
    blue: 'text-blue-700',
    emerald: 'text-emerald-700',
}

export function QuoteReminderNotice({ quoteId, reminder, followUpUrl }: QuoteReminderNoticeProps) {
    const [confirming, setConfirming] = useState(false)
    const [showConfirmation, setShowConfirmation] = useState(false)
    const canFollowUp = Boolean(followUpUrl) && ['follow_up', 'opened_no_response', 'expires_today', 'expired'].includes(reminder.kind)
    const Icon = reminder.tone === 'red'
        ? AlertTriangle
        : canFollowUp
            ? BellRing
            : Clock3

    const confirmFollowUp = async () => {
        setConfirming(true)
        try {
            const result = await recordQuoteFollowUp(quoteId)
            captureEvent('quote_follow_up_confirmed', {
                quote_id: quoteId,
                reminder_kind: reminder.kind,
                follow_up_count: result.followUpCount,
                source: 'quote_reminder_notice',
            })
            toast.success('Lembrete registrado. O proximo aviso respeitara esta tentativa.')
            setShowConfirmation(false)
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Nao foi possivel registrar o lembrete.')
        } finally {
            setConfirming(false)
        }
    }

    return (
        <section className={cn('rounded-2xl border p-4 shadow-sm print:hidden', toneClass[reminder.tone])}>
            <div className="flex items-start gap-3">
                <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', iconClass[reminder.tone])} />
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-black">{reminder.label}</p>
                    <p className="mt-1 text-xs leading-5 opacity-80">{reminder.description}</p>
                </div>
            </div>

            {canFollowUp && !showConfirmation && (
                <a
                    href={followUpUrl || '#'}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => {
                        captureEvent('quote_follow_up_opened', { quote_id: quoteId, reminder_kind: reminder.kind })
                        window.setTimeout(() => setShowConfirmation(true), 250)
                    }}
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-current/20 bg-white/70 px-4 py-2 text-sm font-bold transition hover:bg-white"
                >
                    <MessageCircle className="h-4 w-4" />
                    Abrir proxima mensagem no WhatsApp
                </a>
            )}

            {canFollowUp && showConfirmation && (
                <div className="mt-3 rounded-xl border border-current/20 bg-white/70 p-3">
                    <p className="text-xs font-semibold leading-5">Voce tocou em enviar no WhatsApp?</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        <button type="button" className="rounded-lg border border-current/20 bg-white px-3 py-2 text-xs font-bold" onClick={() => setShowConfirmation(false)} disabled={confirming}>Ainda nao</button>
                        <button type="button" className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white" onClick={confirmFollowUp} disabled={confirming}>
                            {confirming ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                            Sim, registrar lembrete
                        </button>
                    </div>
                </div>
            )}
        </section>
    )
}
