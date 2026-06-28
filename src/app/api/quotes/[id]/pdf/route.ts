import PDFDocument from 'pdfkit'
import { NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import type { Database } from '@/types/database.types'
import { getProfessionalContext } from '@/lib/professional-context'

export const runtime = 'nodejs'

type QuoteRow = Database['public']['Tables']['quotes']['Row']
type QuoteItemRow = Database['public']['Tables']['quote_items']['Row']
type ProfileRow = Pick<
    Database['public']['Tables']['profiles']['Row'],
    'business_name' | 'phone' | 'email' | 'cnpj' | 'address' | 'address_number' | 'city' | 'state' | 'payment_info'
>

type QuoteWithItems = QuoteRow & {
    quote_items: QuoteItemRow[]
}

function formatCurrency(value: number | null | undefined) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)
}

function formatDate(value: string | null | undefined) {
    if (!value) return 'A combinar'
    return new Intl.DateTimeFormat('pt-BR').format(new Date(value))
}

function safeFileName(value: string) {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/gi, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase()
        .slice(0, 60) || 'orcamento'
}

function ensureSpace(doc: PDFKit.PDFDocument, height: number) {
    const bottom = doc.page.height - doc.page.margins.bottom
    if (doc.y + height > bottom) {
        doc.addPage()
    }
}

function drawInfoLine(doc: PDFKit.PDFDocument, label: string, value: string) {
    doc.font('Helvetica-Bold').fillColor('#0f172a').text(`${label}: `, { continued: true })
    doc.font('Helvetica').fillColor('#334155').text(value)
}

async function renderQuotePdf(quote: QuoteWithItems, profile: ProfileRow | null) {
    const doc = new PDFDocument({
        size: 'A4',
        margin: 48,
        info: {
            Title: `Orcamento ${quote.client_name}`,
            Author: profile?.business_name || 'Zacly',
            Subject: 'Proposta comercial',
        },
    })

    const chunks: Buffer[] = []
    const bufferPromise = new Promise<Buffer>((resolve, reject) => {
        doc.on('data', (chunk: Buffer) => chunks.push(chunk))
        doc.on('end', () => resolve(Buffer.concat(chunks)))
        doc.on('error', reject)
    })

    const businessName = profile?.business_name || 'Zacly'
    const professionalContext = getProfessionalContext(quote.professional_context)
    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right
    const left = doc.page.margins.left
    const right = doc.page.width - doc.page.margins.right
    const tableWidths = {
        description: 235,
        quantity: 48,
        unit: 86,
        total: 86,
    }

    doc.rect(0, 0, doc.page.width, 132).fill('#0f172a')
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(24).text('Proposta comercial', left, 38)
    doc.fillColor('#cbd5e1').font('Helvetica').fontSize(10).text(`Orcamento #${quote.id.slice(0, 8)}`, left, 70)
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(13).text(businessName, left, 92, { width: pageWidth * 0.62 })
    doc.fillColor('#cbd5e1').font('Helvetica').fontSize(9).text(`Emitido em ${formatDate(quote.created_at)}`, right - 160, 44, { width: 160, align: 'right' })
    doc.text(`Validade: ${formatDate(quote.expiration_date)}`, right - 160, 62, { width: 160, align: 'right' })

    doc.y = 162
    doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(14).text('Cliente')
    doc.moveDown(0.4)
    doc.fontSize(10)
    drawInfoLine(doc, 'Nome', quote.client_name)
    if (quote.client_company_name) drawInfoLine(doc, 'Empresa', quote.client_company_name)
    if (quote.client_phone) drawInfoLine(doc, 'Telefone', quote.client_phone)

    const companyY = 162
    doc.y = companyY
    doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(14).text('Profissional', left + 300, companyY, { width: 210 })
    doc.moveDown(0.4)
    doc.fontSize(10)
    doc.x = left + 300
    doc.font('Helvetica-Bold').fillColor('#0f172a').text('Nome: ', { continued: true })
    doc.font('Helvetica').fillColor('#334155').text(businessName, { width: 210 })
    if (profile?.phone) {
        doc.x = left + 300
        doc.font('Helvetica-Bold').fillColor('#0f172a').text('Telefone: ', { continued: true })
        doc.font('Helvetica').fillColor('#334155').text(profile.phone, { width: 210 })
    }
    if (profile?.email) {
        doc.x = left + 300
        doc.font('Helvetica-Bold').fillColor('#0f172a').text('Email: ', { continued: true })
        doc.font('Helvetica').fillColor('#334155').text(profile.email, { width: 210 })
    }
    if (profile?.cnpj) {
        doc.x = left + 300
        doc.font('Helvetica-Bold').fillColor('#0f172a').text('CNPJ: ', { continued: true })
        doc.font('Helvetica').fillColor('#334155').text(profile.cnpj, { width: 210 })
    }

    doc.y = Math.max(doc.y, 238)
    ensureSpace(doc, 86)
    doc.moveDown(1)
    doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(13).text(`Plano de execucao: ${professionalContext.name}`)
    doc.moveDown(0.3)
    doc.fillColor('#334155').font('Helvetica').fontSize(9).text(professionalContext.description, { width: pageWidth })
    doc.moveDown(0.3)
    professionalContext.proposalBullets.forEach((bullet) => {
        doc.fillColor('#334155').font('Helvetica').fontSize(9).text(`- ${bullet}`, { width: pageWidth })
    })
    doc.moveDown(1)

    doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(14).text('Itens e servicos')
    doc.moveDown(0.5)

    const headerY = doc.y
    doc.roundedRect(left, headerY, pageWidth, 24, 4).fill('#f1f5f9')
    doc.fillColor('#475569').font('Helvetica-Bold').fontSize(8)
    doc.text('DESCRICAO', left + 10, headerY + 8, { width: tableWidths.description })
    doc.text('QTD', left + 260, headerY + 8, { width: tableWidths.quantity, align: 'right' })
    doc.text('UNITARIO', left + 315, headerY + 8, { width: tableWidths.unit, align: 'right' })
    doc.text('TOTAL', left + 410, headerY + 8, { width: tableWidths.total, align: 'right' })
    doc.y = headerY + 36

    quote.quote_items.forEach((item) => {
        const description = item.details ? `${item.description}\n${item.details}` : item.description
        const quantity = item.quantity || 0
        const unitPrice = item.unit_price || 0
        const total = quantity * unitPrice
        const rowHeight = Math.max(
            34,
            doc.heightOfString(description, { width: tableWidths.description }) + 16,
        )

        ensureSpace(doc, rowHeight + 16)
        const rowY = doc.y
        doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(10)
        doc.text(item.description, left + 10, rowY, { width: tableWidths.description })

        if (item.details) {
            doc.fillColor('#64748b').font('Helvetica').fontSize(8)
            doc.text(item.details, left + 10, doc.y + 2, { width: tableWidths.description })
        }

        doc.fillColor('#334155').font('Helvetica').fontSize(9)
        doc.text(String(quantity), left + 260, rowY, { width: tableWidths.quantity, align: 'right' })
        doc.text(formatCurrency(unitPrice), left + 315, rowY, { width: tableWidths.unit, align: 'right' })
        doc.font('Helvetica-Bold').fillColor('#0f172a').text(formatCurrency(total), left + 410, rowY, { width: tableWidths.total, align: 'right' })

        doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(left, rowY + rowHeight).lineTo(right, rowY + rowHeight).stroke()
        doc.y = rowY + rowHeight + 10
    })

    const subtotal = quote.quote_items.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unit_price || 0)), 0)
    const total = quote.total ?? subtotal
    const discount = Math.max(subtotal - total, 0)

    ensureSpace(doc, 128)
    const totalsY = doc.y + 6
    doc.roundedRect(right - 210, totalsY, 210, discount > 0 ? 92 : 68, 8).fill('#f8fafc')
    doc.fillColor('#475569').font('Helvetica').fontSize(10).text('Subtotal', right - 190, totalsY + 16, { width: 80 })
    doc.text(formatCurrency(subtotal), right - 105, totalsY + 16, { width: 84, align: 'right' })
    if (discount > 0) {
        doc.text('Desconto', right - 190, totalsY + 38, { width: 80 })
        doc.text(formatCurrency(discount), right - 105, totalsY + 38, { width: 84, align: 'right' })
    }
    const totalY = discount > 0 ? totalsY + 62 : totalsY + 40
    doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(12).text('Total', right - 190, totalY, { width: 80 })
    doc.text(formatCurrency(total), right - 105, totalY, { width: 84, align: 'right' })
    doc.y = totalsY + (discount > 0 ? 112 : 88)

    if (quote.show_payment_options && (quote.payment_methods?.length || quote.payment_terms || profile?.payment_info)) {
        ensureSpace(doc, 70)
        doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(13).text('Condicoes de pagamento')
        doc.moveDown(0.3)
        doc.fillColor('#334155').font('Helvetica').fontSize(10)
        if (quote.payment_methods?.length) doc.text(`Formas aceitas: ${quote.payment_methods.join(', ')}`)
        if (quote.installment_count) doc.text(`Parcelamento: ate ${quote.installment_count}x`)
        if (quote.payment_terms) doc.text(quote.payment_terms)
        if (profile?.payment_info) doc.text(profile.payment_info)
        doc.moveDown(1)
    }

    if (quote.show_timeline && quote.estimated_days) {
        ensureSpace(doc, 46)
        doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(13).text('Prazo estimado')
        doc.moveDown(0.3)
        doc.fillColor('#334155').font('Helvetica').fontSize(10).text(`${quote.estimated_days} dias apos a aprovacao.`)
        doc.moveDown(1)
    }

    if (quote.notes) {
        ensureSpace(doc, 80)
        doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(13).text('Observacoes')
        doc.moveDown(0.3)
        doc.fillColor('#334155').font('Helvetica').fontSize(10).text(quote.notes, { width: pageWidth })
        doc.moveDown(1)
    }

    const footerY = doc.page.height - 52
    doc.strokeColor('#e2e8f0').moveTo(left, footerY - 12).lineTo(right, footerY - 12).stroke()
    doc.fillColor('#64748b').font('Helvetica').fontSize(8).text('Gerado pelo Zacly. A aprovacao oficial deve ser feita pelo link publico enviado ao cliente.', left, footerY, {
        width: pageWidth,
        align: 'center',
    })

    doc.end()

    return bufferPromise
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> },
) {
    const { id } = await params
    const token = request.nextUrl.searchParams.get('token')
    const admin = getSupabaseAdmin()
    const supabase = await createClient()

    const { data: quote } = await admin
        .from('quotes')
        .select('*, quote_items (*)')
        .eq('id', id)
        .maybeSingle()

    if (!quote) {
        return new Response('Not found', { status: 404 })
    }

    const typedQuote = quote as QuoteWithItems
    const { data: { user } } = await supabase.auth.getUser()
    const tokenAuthorized = !!token && token === typedQuote.public_token

    let ownerAuthorized = user?.id === typedQuote.user_id
    if (!ownerAuthorized && user && typedQuote.organization_id) {
        const { data: member } = await admin
            .from('organization_members')
            .select('id')
            .eq('organization_id', typedQuote.organization_id)
            .eq('user_id', user.id)
            .maybeSingle()

        ownerAuthorized = !!member
    }

    if (!tokenAuthorized && !ownerAuthorized) {
        return new Response('Not found', { status: 404 })
    }

    const { data: profile } = await admin
        .from('profiles')
        .select('business_name, phone, email, cnpj, address, address_number, city, state, payment_info')
        .eq('id', typedQuote.user_id)
        .maybeSingle()

    const pdf = await renderQuotePdf(typedQuote, profile)
    const fileName = `orcamento-${safeFileName(typedQuote.client_name)}.pdf`

    return new Response(new Uint8Array(pdf), {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${fileName}"`,
            'Cache-Control': 'no-store',
        },
    })
}
