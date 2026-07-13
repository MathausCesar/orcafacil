export type QuoteReminderKind = 'follow_up' | 'opened_no_response' | 'expires_today' | 'expired' | 'start_work' | 'collect_payment'

export type QuoteReminder = {
    kind: QuoteReminderKind
    label: string
    description: string
    tone: 'amber' | 'red' | 'blue' | 'emerald'
}

export type QuoteReminderInput = {
    status?: string | null
    created_at?: string | null
    updated_at?: string | null
    expiration_date?: string | null
    payment_status?: string | null
    amount_paid?: number | null
    total?: number | null
    sent_confirmed_at?: string | null
    first_public_opened_at?: string | null
    client_responded_at?: string | null
    follow_up_sent_at?: string | null
    follow_up_count?: number | null
}

function parseDate(value?: string | null) {
    if (!value) return null

    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? null : date
}

function startOfDay(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function diffDays(from: Date, to: Date) {
    const dayMs = 24 * 60 * 60 * 1000
    return Math.floor((startOfDay(to).getTime() - startOfDay(from).getTime()) / dayMs)
}

export function getQuoteReminder(quote: QuoteReminderInput, now = new Date()): QuoteReminder | null {
    const status = quote.status || 'draft'
    const paymentStatus = quote.payment_status || 'unpaid'
    const updatedAt = parseDate(quote.updated_at) || parseDate(quote.created_at)
    const sentAt = parseDate(quote.sent_confirmed_at) || parseDate(quote.created_at)
    const openedAt = parseDate(quote.first_public_opened_at)
    const clientRespondedAt = parseDate(quote.client_responded_at)
    const followUpSentAt = parseDate(quote.follow_up_sent_at)
    const expirationDate = parseDate(quote.expiration_date)
    const isWaitingClient = ['pending', 'sent'].includes(status)

    if (status === 'completed' && paymentStatus !== 'paid') {
        return {
            kind: 'collect_payment',
            label: 'Falta marcar recebimento',
            description: 'Servico concluido. Registre se ja recebeu tudo ou parte do valor.',
            tone: 'emerald',
        }
    }

    if (status === 'approved' && updatedAt && diffDays(updatedAt, now) >= 1) {
        return {
            kind: 'start_work',
            label: 'Aprovado sem inicio',
            description: 'Combine a data, separe o material e inicie a execucao.',
            tone: 'blue',
        }
    }

    if (isWaitingClient && expirationDate) {
        const daysToExpire = diffDays(now, expirationDate)

        if (daysToExpire < 0) {
            return {
                kind: 'expired',
                label: 'Proposta vencida',
                description: 'Atualize a validade ou reenvie a proposta para o cliente.',
                tone: 'red',
            }
        }

        if (daysToExpire <= 1) {
            return {
                kind: 'expires_today',
                label: daysToExpire === 0 ? 'Vence hoje' : 'Vence amanha',
                description: 'Vale fazer um contato rapido antes da proposta vencer.',
                tone: 'amber',
            }
        }
    }

    const lastFollowUpReference = followUpSentAt || openedAt || sentAt

    if (
        isWaitingClient
        && openedAt
        && !clientRespondedAt
        && lastFollowUpReference
        && diffDays(lastFollowUpReference, now) >= 1
    ) {
        return {
            kind: 'opened_no_response',
            label: 'Link aberto sem resposta',
            description: 'O link da proposta foi aberto. Vale perguntar se ficou alguma duvida antes da validade terminar.',
            tone: 'amber',
        }
    }

    if (isWaitingClient && !openedAt && sentAt && diffDays(followUpSentAt || sentAt, now) >= 2) {
        return {
            kind: 'follow_up',
            label: 'Link ainda nao abriu',
            description: 'A proposta foi confirmada como enviada, mas o link ainda nao registrou abertura. Vale reenviar o lembrete.',
            tone: 'amber',
        }
    }

    return null
}

export function buildQuoteFollowUpMessage(
    clientName: string,
    approvalUrl: string,
    reminderKind: QuoteReminderKind = 'follow_up',
) {
    const opening = reminderKind === 'opened_no_response'
        ? 'Vi que voce conseguiu abrir a proposta e quis saber se ficou alguma duvida para decidir com tranquilidade.'
        : reminderKind === 'expires_today'
            ? 'A validade da proposta esta perto do fim. Quer que eu esclareca algum ponto ou ajuste algo antes de vencer?'
            : reminderKind === 'expired'
                ? 'A proposta venceu, mas posso atualizar a validade ou ajustar algum ponto para voce avaliar novamente.'
                : 'Passando para saber se ficou alguma duvida sobre a proposta que enviei.'

    return [
        `Ola, ${clientName}.`,
        '',
        opening,
        'Segue o link para visualizar e aprovar quando estiver tudo certo:',
        approvalUrl,
        '',
        'Fico a disposicao.',
    ].join('\n')
}
