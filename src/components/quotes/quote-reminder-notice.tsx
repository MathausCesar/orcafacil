import Link from 'next/link'
import { AlertTriangle, BellRing, Clock3, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { QuoteReminder } from '@/lib/quote-reminders'

type QuoteReminderNoticeProps = {
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

export function QuoteReminderNotice({ reminder, followUpUrl }: QuoteReminderNoticeProps) {
    const Icon = reminder.tone === 'red'
        ? AlertTriangle
        : reminder.kind === 'follow_up'
            ? BellRing
            : Clock3

    return (
        <section className={cn('rounded-2xl border p-4 shadow-sm print:hidden', toneClass[reminder.tone])}>
            <div className="flex items-start gap-3">
                <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', iconClass[reminder.tone])} />
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-black">{reminder.label}</p>
                    <p className="mt-1 text-xs leading-5 opacity-80">{reminder.description}</p>
                </div>
            </div>

            {followUpUrl && reminder.kind === 'follow_up' && (
                <Link
                    href={followUpUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-current/20 bg-white/70 px-4 py-2 text-sm font-bold transition hover:bg-white"
                >
                    <MessageCircle className="h-4 w-4" />
                    Enviar lembrete no WhatsApp
                </Link>
            )}
        </section>
    )
}
