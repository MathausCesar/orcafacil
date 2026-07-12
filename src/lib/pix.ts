type PixPayloadInput = {
    key: string
    recipientName: string
    recipientCity: string
    amount: number
    transactionId?: string
}

function field(id: string, value: string) {
    const size = String(value.length).padStart(2, '0')
    return `${id}${size}${value}`
}

function crc16(value: string) {
    let crc = 0xffff

    for (let index = 0; index < value.length; index += 1) {
        crc ^= value.charCodeAt(index) << 8
        for (let bit = 0; bit < 8; bit += 1) {
            crc = (crc & 0x8000) !== 0
                ? (crc << 1) ^ 0x1021
                : crc << 1
            crc &= 0xffff
        }
    }

    return crc.toString(16).toUpperCase().padStart(4, '0')
}

function pixText(value: string, maxLength: number, fallback: string) {
    const normalized = value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9 ]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .toUpperCase()

    return (normalized || fallback).slice(0, maxLength)
}

/** Builds a static BR Code for a payment sent directly to the business owner. */
export function buildPixCopyAndPaste({
    key,
    recipientName,
    recipientCity,
    amount,
    transactionId,
}: PixPayloadInput) {
    const cleanKey = key.trim()
    const safeAmount = Number(amount)

    if (!cleanKey || !Number.isFinite(safeAmount) || safeAmount <= 0) return null

    const merchantAccount = field('00', 'br.gov.bcb.pix') + field('01', cleanKey)
    const additionalData = field('05', pixText(transactionId || '***', 25, '***'))
    const payload = [
        field('00', '01'),
        field('26', merchantAccount),
        field('52', '0000'),
        field('53', '986'),
        field('54', safeAmount.toFixed(2)),
        field('58', 'BR'),
        field('59', pixText(recipientName, 25, 'RECEBEDOR')),
        field('60', pixText(recipientCity, 15, 'BRASIL')),
        field('62', additionalData),
        '6304',
    ].join('')

    return `${payload}${crc16(payload)}`
}
