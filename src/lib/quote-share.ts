export const DEFAULT_QUOTE_APPROVAL_MESSAGE_TEMPLATE = [
    'Olá, {cliente}. Tudo bem?',
    '',
    'Preparei sua proposta pela {empresa} com escopo, valores e condições organizados para facilitar sua decisão.',
    '',
    'Valor total: {total}',
    '{validade_linha}',
    '',
    'Para visualizar e aprovar com segurança, acesse:',
    '{link}',
    '',
    'Se tiver qualquer dúvida ou quiser ajustar algum ponto, me responda por aqui.',
].join('\n')

type QuoteApprovalMessageInput = {
    clientName: string
    businessName: string
    totalFormatted: string
    validUntil: string | null
    approvalUrl: string
    template?: string | null
}

function formatValidity(validUntil: string | null) {
    if (!validUntil) return ''

    return `Validade: ${new Intl.DateTimeFormat('pt-BR').format(new Date(validUntil))}`
}

function cleanTemplate(value?: string | null) {
    const template = value?.trim()

    return template || DEFAULT_QUOTE_APPROVAL_MESSAGE_TEMPLATE
}

export function buildQuoteApprovalMessage({
    clientName,
    businessName,
    totalFormatted,
    validUntil,
    approvalUrl,
    template,
}: QuoteApprovalMessageInput) {
    const validityLine = formatValidity(validUntil)
    const message = cleanTemplate(template)
        .replaceAll('{cliente}', clientName)
        .replaceAll('{empresa}', businessName)
        .replaceAll('{total}', totalFormatted)
        .replaceAll('{validade}', validityLine)
        .replaceAll('{validade_linha}', validityLine)
        .replaceAll('{link}', approvalUrl)
        .replace(/\n{3,}/g, '\n\n')
        .trim()

    if (message.includes(approvalUrl)) {
        return message
    }

    return `${message}\n\nLink para visualizar e aprovar:\n${approvalUrl}`
}

export function buildWhatsAppLink(phone: string | null | undefined, message: string) {
    const encodedMessage = encodeURIComponent(message)
    const digits = phone?.replace(/\D/g, '')

    if (!digits) {
        return `https://wa.me/?text=${encodedMessage}`
    }

    return `https://wa.me/${digits}?text=${encodedMessage}`
}
