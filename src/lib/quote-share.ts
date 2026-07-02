export const DEFAULT_QUOTE_APPROVAL_MESSAGE_TEMPLATE = [
    'Ola, {cliente}. Tudo bem?',
    '',
    'Preparei sua proposta pela {empresa} com escopo, valores e condicoes organizados para facilitar sua decisao.',
    '',
    'Valor total: {total}',
    '{validade_linha}',
    '',
    'Para visualizar e aprovar com seguranca, acesse:',
    '{link}',
    '',
    'Se tiver qualquer duvida ou quiser ajustar algum ponto, me responda por aqui.',
].join('\n')

const FREE_QUOTE_APPROVAL_MARKETING_FOOTER = [
    'Proposta gerada com Zacly, um aplicativo de gestao para quem faz orcamentos, clientes e aprovacoes em um so lugar.',
    'Conheca e teste: https://zacly.com.br',
].join('\n')

type QuoteApprovalMessageInput = {
    clientName: string
    businessName: string
    totalFormatted: string
    validUntil: string | null
    approvalUrl: string
    template?: string | null
    includeZaclyMarketing?: boolean
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
    includeZaclyMarketing = false,
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

    const messageWithApprovalLink = message.includes(approvalUrl)
        ? message
        : `${message}\n\nLink para visualizar e aprovar:\n${approvalUrl}`

    if (!includeZaclyMarketing || messageWithApprovalLink.includes('Proposta gerada com Zacly')) {
        return messageWithApprovalLink
    }

    return `${messageWithApprovalLink}\n\n${FREE_QUOTE_APPROVAL_MARKETING_FOOTER}`
}

export function buildWhatsAppLink(phone: string | null | undefined, message: string) {
    const encodedMessage = encodeURIComponent(message)
    const digits = phone?.replace(/\D/g, '')

    if (!digits) {
        return `https://wa.me/?text=${encodedMessage}`
    }

    return `https://wa.me/${digits}?text=${encodedMessage}`
}
