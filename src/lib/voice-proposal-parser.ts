export type VoiceProposalSuggestion = {
    transcript: string
    clientName?: string
    clientPhone?: string
    estimatedDays?: number
    notes?: string
    item?: {
        description: string
        quantity: number
        unitPrice: number
    }
}

function parseBrazilianAmount(value: string) {
    const normalized = value.trim().includes(',')
        ? value.trim().replace(/\./g, '').replace(',', '.')
        : value.trim()
    const amount = Number(normalized)
    return Number.isFinite(amount) && amount >= 0 ? amount : undefined
}

function findSegment(text: string, pattern: RegExp) {
    const match = text.match(pattern)
    return match?.[1]?.trim() || undefined
}

/**
 * Produces suggestions only. The transcript stays in the browser and a user
 * must explicitly review and apply every suggestion before it reaches a quote.
 */
export function parseVoiceProposalTranscript(transcript: string): VoiceProposalSuggestion {
    const cleanTranscript = transcript.replace(/\s+/g, ' ').trim()
    const lower = cleanTranscript.toLocaleLowerCase('pt-BR')
    const phoneDigits = cleanTranscript.replace(/\D/g, '')
    const phone = phoneDigits.length >= 10 && phoneDigits.length <= 13 ? phoneDigits : undefined
    const clientName = findSegment(
        cleanTranscript,
        /(?:cliente|para)\s+(.+?)(?=\s+(?:telefone|whatsapp|zap|item|servi[cç]o|valor|prazo|observa[cç][aã]o|$))/i,
    )
    const daysValue = lower.match(/(?:prazo|entrega)\s+(?:de\s+)?(\d{1,3})\s+dias?/i)?.[1]
    const estimatedDays = daysValue ? Number(daysValue) : undefined
    const notes = findSegment(cleanTranscript, /(?:observa[cç][aã]o|detalhe|nota)\s*:?[\s]*(.+)$/i)
    const amountMatch = cleanTranscript.match(/(?:r\$|reais?|valor)\s*(\d{1,3}(?:[.]\d{3})*(?:,\d{1,2})?|\d+(?:\.\d{1,2})?)/i)
    const unitPrice = amountMatch ? parseBrazilianAmount(amountMatch[1]) : undefined
    const quantityMatch = cleanTranscript.match(/(?:quantidade|qtd|(?:^|\s))(\d{1,3})\s*(?:unidades?|pecas?|itens?)?/i)
    const quantity = quantityMatch ? Math.max(1, Number(quantityMatch[1])) : 1
    const itemDescription = findSegment(
        cleanTranscript,
        /(?:item|servi[cç]o)\s*:?[\s]*(.+?)(?=\s+(?:r\$|reais?|valor|quantidade|qtd|prazo|observa[cç][aã]o|$))/i,
    )

    return {
        transcript: cleanTranscript,
        clientName,
        clientPhone: phone,
        estimatedDays: Number.isFinite(estimatedDays) && estimatedDays && estimatedDays > 0 ? estimatedDays : undefined,
        notes,
        item: itemDescription && unitPrice !== undefined
            ? { description: itemDescription, quantity, unitPrice }
            : undefined,
    }
}
