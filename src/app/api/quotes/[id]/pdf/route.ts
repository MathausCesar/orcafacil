import PDFDocument from 'pdfkit'
import { NextRequest } from 'next/server'
import QRCode from 'qrcode'
import { createClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { getAppBaseUrl } from '@/lib/app-url'
import type { Database } from '@/types/database.types'
import { getProfessionalContext } from '@/lib/professional-context'
import {
    PROPOSAL_TONE_INTRO,
    normalizeProposalModel,
    parseProposalIdentitySettings,
    type ProposalFont,
    type ProposalModelId,
    type VisualToneId,
} from '@/lib/proposal-style'

export const runtime = 'nodejs'

type QuoteRow = Database['public']['Tables']['quotes']['Row']
type QuoteItemRow = Database['public']['Tables']['quote_items']['Row']
type ProfileRow = Pick<
    Database['public']['Tables']['profiles']['Row'],
    | 'business_name'
    | 'phone'
    | 'email'
    | 'cnpj'
    | 'address'
    | 'address_number'
    | 'city'
    | 'state'
    | 'payment_info'
    | 'logo_url'
    | 'theme_color'
    | 'primary_color'
    | 'layout_style'
    | 'quote_font_family'
    | 'quote_settings'
    | 'plan'
>

type QuoteWithItems = QuoteRow & {
    quote_items: QuoteItemRow[]
}

type PdfIdentitySettings = ReturnType<typeof parseProposalIdentitySettings>

type PdfSkin = {
    model: ProposalModelId
    headerBg: string
    headerText: string
    mutedHeaderText: string
    pageBg: string
    cardBg: string
    border: string
    tableHeaderBg: string
    tableHeaderText: string
    summaryBg: string
    summaryText: string
    roundness: number
}

type LogoImage = {
    buffer: Buffer
    contentType: string
} | null

function getQuoteSubtotal(quote: QuoteWithItems) {
    return quote.quote_items.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unit_price || 0)), 0)
}

function getQuoteTotal(quote: QuoteWithItems) {
    return quote.total ?? getQuoteSubtotal(quote)
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

function normalizeColor(value: string | null | undefined) {
    return value && /^#[0-9a-f]{6}$/i.test(value) ? value : '#0D9B5C'
}

function parseIdentitySettings(raw: unknown, fallbackFont: string | null | undefined): PdfIdentitySettings {
    return parseProposalIdentitySettings(raw, fallbackFont)
}

function getPdfFonts(font: ProposalFont) {
    if (font === 'Playfair Display') {
        return { regular: 'Times-Roman', bold: 'Times-Bold' }
    }

    return { regular: 'Helvetica', bold: 'Helvetica-Bold' }
}

function getPdfSkin(model: ProposalModelId, accent: string, tone: VisualToneId): PdfSkin {
    const sober = tone === 'formal'
    const creative = tone === 'creative'

    const common = {
        model,
        border: sober ? '#cbd5e1' : '#e2e8f0',
        cardBg: sober ? '#f8fafc' : creative ? '#f0fdf4' : '#f8fafc',
        roundness: model === 'classic' || model === 'minimalist' ? 2 : model === 'agency' ? 12 : 8,
    }

    const skins: Record<ProposalModelId, PdfSkin> = {
        modern: {
            ...common,
            headerBg: '#0f172a',
            headerText: '#ffffff',
            mutedHeaderText: '#cbd5e1',
            pageBg: '#ffffff',
            tableHeaderBg: '#f1f5f9',
            tableHeaderText: '#475569',
            summaryBg: '#0f172a',
            summaryText: '#ffffff',
        },
        professional: {
            ...common,
            headerBg: '#101820',
            headerText: '#ffffff',
            mutedHeaderText: '#cbd5e1',
            pageBg: '#ffffff',
            tableHeaderBg: '#eef2f7',
            tableHeaderText: '#334155',
            summaryBg: '#101820',
            summaryText: '#ffffff',
        },
        classic: {
            ...common,
            headerBg: '#fff7ed',
            headerText: '#1f2937',
            mutedHeaderText: '#64748b',
            pageBg: '#fffdf8',
            tableHeaderBg: '#f3eadc',
            tableHeaderText: '#57534e',
            summaryBg: '#2c2721',
            summaryText: '#ffffff',
        },
        minimalist: {
            ...common,
            headerBg: '#ffffff',
            headerText: '#0f172a',
            mutedHeaderText: '#64748b',
            pageBg: '#ffffff',
            tableHeaderBg: '#ffffff',
            tableHeaderText: '#64748b',
            summaryBg: '#0f172a',
            summaryText: '#ffffff',
        },
        agency: {
            ...common,
            headerBg: '#061b1a',
            headerText: '#ffffff',
            mutedHeaderText: '#bbf7d0',
            pageBg: '#ffffff',
            tableHeaderBg: '#ecfdf5',
            tableHeaderText: '#065f46',
            summaryBg: '#061b1a',
            summaryText: '#ffffff',
        },
        impact: {
            ...common,
            headerBg: '#050816',
            headerText: '#ffffff',
            mutedHeaderText: '#cbd5e1',
            pageBg: '#ffffff',
            tableHeaderBg: '#0f172a',
            tableHeaderText: '#ffffff',
            summaryBg: '#050816',
            summaryText: '#ffffff',
        },
    }

    const skin = skins[model]
    if (creative && model !== 'impact') {
        return { ...skin, summaryBg: accent }
    }

    return skin
}

function pdfSafeText(value: string | null | undefined, fallback = '') {
    if (!value) return fallback

    return value
        .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
        .replace(/[\u200D\uFE0F]/g, '')
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
        .replace(/\s+/g, ' ')
        .trim() || fallback
}

function getInitials(name: string) {
    return pdfSafeText(name, 'Z')
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0]?.toUpperCase())
        .join('') || 'Z'
}

function ensureSpace(doc: PDFKit.PDFDocument, height: number) {
    const bottom = doc.page.height - doc.page.margins.bottom
    if (doc.y + height > bottom) {
        doc.addPage()
    }
}

function drawSectionTitle(
    doc: PDFKit.PDFDocument,
    title: string,
    accent: string,
    fonts: ReturnType<typeof getPdfFonts>,
    left: number,
) {
    doc.fillColor(accent).rect(left, doc.y + 3, 28, 3).fill()
    doc.moveDown(0.65)
    doc.fillColor('#0f172a').font(fonts.bold).fontSize(15).text(title, left, doc.y)
    doc.moveDown(0.55)
}

function drawInfoLine(
    doc: PDFKit.PDFDocument,
    label: string,
    value: string | null | undefined,
    x: number,
    y?: number,
    width = 220,
    fonts = getPdfFonts('Inter'),
) {
    const safeValue = pdfSafeText(value, 'Nao informado')
    if (typeof y === 'number') doc.y = y
    doc.x = x
    doc.font(fonts.bold).fillColor('#0f172a').fontSize(9).text(`${label}: `, { continued: true })
    doc.font(fonts.regular).fillColor('#334155').text(safeValue, { width })
}

function drawBox(
    doc: PDFKit.PDFDocument,
    x: number,
    y: number,
    width: number,
    height: number,
    fill: string,
    stroke: string,
    radius: number,
) {
    doc.roundedRect(x, y, width, height, radius).fillAndStroke(fill, stroke)
}

async function fetchLogoImage(url: string | null | undefined): Promise<LogoImage> {
    if (!url) return null

    try {
        const response = await fetch(url)
        if (!response.ok) return null

        const contentType = response.headers.get('content-type') || ''
        if (!contentType.includes('png') && !contentType.includes('jpeg') && !contentType.includes('jpg')) {
            return null
        }

        const arrayBuffer = await response.arrayBuffer()
        return { buffer: Buffer.from(arrayBuffer), contentType }
    } catch {
        return null
    }
}

async function generateApprovalQr(approvalUrl: string) {
    try {
        return await QRCode.toBuffer(approvalUrl, {
            type: 'png',
            width: 132,
            margin: 1,
            color: {
                dark: '#0f172a',
                light: '#ffffff',
            },
        })
    } catch {
        return null
    }
}

function drawLogo(
    doc: PDFKit.PDFDocument,
    logo: LogoImage,
    businessName: string,
    x: number,
    y: number,
    accent: string,
    fonts: ReturnType<typeof getPdfFonts>,
) {
    doc.roundedRect(x, y, 82, 54, 10).fill('#ffffff')

    if (logo) {
        try {
            doc.image(logo.buffer, x + 8, y + 8, { fit: [66, 38], align: 'center', valign: 'center' })
            return
        } catch {
            // Fall through to initials if the image cannot be embedded by PDFKit.
        }
    }

    doc.roundedRect(x + 8, y + 8, 38, 38, 9).fill(accent)
    doc.fillColor('#ffffff')
        .font(fonts.bold)
        .fontSize(15)
        .text(getInitials(businessName), x + 8, y + 20, { width: 38, align: 'center' })
}

function drawHeader(
    doc: PDFKit.PDFDocument,
    quote: QuoteWithItems,
    profile: ProfileRow | null,
    skin: PdfSkin,
    accent: string,
    fonts: ReturnType<typeof getPdfFonts>,
    logo: LogoImage,
) {
    const left = doc.page.margins.left
    const right = doc.page.width - doc.page.margins.right
    const pageWidth = right - left
    const businessName = pdfSafeText(profile?.business_name, 'Zacly')
    const clientName = pdfSafeText(quote.client_name, 'Cliente')
    const quoteTotal = formatCurrency(getQuoteTotal(quote))
    const headerHeight = skin.model === 'agency' ? 172 : skin.model === 'minimalist' ? 132 : 150

    doc.save()
    doc.rect(0, 0, doc.page.width, doc.page.height).fill(skin.pageBg)
    doc.restore()

    if (skin.model === 'classic') {
        doc.rect(0, 0, doc.page.width, headerHeight).fill(skin.headerBg)
        doc.strokeColor('#d7cbbb').lineWidth(1).moveTo(left, 34).lineTo(right, 34).stroke()
        doc.strokeColor('#d7cbbb').lineWidth(1).moveTo(left, headerHeight - 24).lineTo(right, headerHeight - 24).stroke()
        doc.rect(left, headerHeight - 13, pageWidth, 3).fill(accent)

        drawLogo(doc, logo, businessName, left, 50, accent, fonts)
        doc.fillColor(skin.headerText).font(fonts.bold).fontSize(20).text('Proposta comercial', left + 98, 48, {
            width: pageWidth - 250,
            align: 'center',
            lineGap: 1,
        })
        doc.fillColor(skin.mutedHeaderText).font(fonts.regular).fontSize(8.5).text(`Orcamento #${quote.id.slice(0, 8)}`, left + 98, 75, {
            width: pageWidth - 250,
            align: 'center',
        })
        doc.fillColor(skin.headerText).font(fonts.bold).fontSize(12).text(clientName, left + 98, 94, {
            width: pageWidth - 250,
            align: 'center',
        })

        const metaX = right - 132
        doc.fillColor(skin.mutedHeaderText).font(fonts.regular).fontSize(8).text('Emitido', metaX, 50, { width: 132, align: 'right' })
        doc.fillColor(skin.headerText).font(fonts.bold).fontSize(9).text(formatDate(quote.created_at), metaX, 63, { width: 132, align: 'right' })
        doc.fillColor(skin.mutedHeaderText).font(fonts.regular).fontSize(8).text('Total', metaX, 88, { width: 132, align: 'right' })
        doc.fillColor(skin.headerText).font(fonts.bold).fontSize(11).text(quoteTotal, metaX, 101, { width: 132, align: 'right' })
        doc.y = headerHeight + 24
        return
    }

    if (skin.model === 'minimalist') {
        doc.rect(0, 0, doc.page.width, headerHeight).fill('#ffffff')
        doc.rect(0, 0, doc.page.width, 7).fill(accent)
        doc.strokeColor(skin.border).lineWidth(1).moveTo(left, headerHeight - 1).lineTo(right, headerHeight - 1).stroke()

        drawLogo(doc, logo, businessName, left, 38, accent, fonts)
        doc.fillColor(skin.headerText).font(fonts.bold).fontSize(19).text('Proposta comercial', left + 104, 40, {
            width: pageWidth - 270,
        })
        doc.fillColor(skin.mutedHeaderText).font(fonts.regular).fontSize(8.5).text(`Orcamento #${quote.id.slice(0, 8)} para ${clientName}`, left + 104, 67, {
            width: pageWidth - 270,
        })
        doc.fillColor(skin.headerText).font(fonts.bold).fontSize(11).text(businessName, left + 104, 87, {
            width: pageWidth - 270,
        })

        const metaX = right - 155
        doc.fillColor(skin.mutedHeaderText).font(fonts.regular).fontSize(8).text('Validade', metaX, 42, { width: 155, align: 'right' })
        doc.fillColor(skin.headerText).font(fonts.bold).fontSize(10).text(formatDate(quote.expiration_date), metaX, 55, { width: 155, align: 'right' })
        doc.fillColor(accent).font(fonts.bold).fontSize(13).text(quoteTotal, metaX, 84, { width: 155, align: 'right' })
        doc.y = headerHeight + 24
        return
    }

    doc.rect(0, 0, doc.page.width, headerHeight).fill(skin.headerBg)
    doc.rect(0, headerHeight - (skin.model === 'agency' ? 10 : 7), doc.page.width, skin.model === 'agency' ? 10 : 7).fill(accent)

    if (skin.model === 'agency') {
        doc.roundedRect(right - 245, 28, 210, 92, 22).fill(accent)
        doc.roundedRect(right - 235, 38, 190, 72, 18).fill('#ffffff')
        doc.fillColor('#0f172a').font(fonts.bold).fontSize(10).text('Investimento', right - 215, 52, { width: 150 })
        doc.fillColor('#0f172a').font(fonts.bold).fontSize(17).text(quoteTotal, right - 215, 72, { width: 150 })
    }

    drawLogo(doc, logo, businessName, left, 35, accent, fonts)

    const titleX = left + 102
    doc.fillColor(skin.headerText).font(fonts.bold).fontSize(22).text('Proposta comercial', titleX, 38, {
        width: skin.model === 'agency' ? pageWidth - 360 : pageWidth - 270,
        lineGap: 1,
    })
    doc.fillColor(skin.mutedHeaderText).font(fonts.regular).fontSize(9).text(`Orcamento #${quote.id.slice(0, 8)}`, titleX, 67)
    doc.fillColor(skin.headerText).font(fonts.bold).fontSize(12).text(businessName, titleX, 89, {
        width: skin.model === 'agency' ? pageWidth - 360 : pageWidth - 270,
        lineGap: 1,
    })

    const metaX = right - 170
    if (skin.model !== 'agency') {
        doc.fillColor(skin.mutedHeaderText).font(fonts.regular).fontSize(8)
        doc.text('Emitido em', metaX, 40, { width: 170, align: 'right' })
        doc.fillColor(skin.headerText).font(fonts.bold).fontSize(10).text(formatDate(quote.created_at), metaX, 53, { width: 170, align: 'right' })
        doc.fillColor(skin.mutedHeaderText).font(fonts.regular).fontSize(8).text('Validade', metaX, 79, { width: 170, align: 'right' })
        doc.fillColor(skin.headerText).font(fonts.bold).fontSize(10).text(formatDate(quote.expiration_date), metaX, 92, { width: 170, align: 'right' })
    }

    doc.y = headerHeight + 26
}

function drawPeopleSection(
    doc: PDFKit.PDFDocument,
    quote: QuoteWithItems,
    profile: ProfileRow | null,
    skin: PdfSkin,
    fonts: ReturnType<typeof getPdfFonts>,
) {
    const left = doc.page.margins.left
    const right = doc.page.width - doc.page.margins.right
    const pageWidth = right - left
    const gap = 18
    const boxWidth = (pageWidth - gap) / 2
    const startY = doc.y
    const boxHeight = 112

    ensureSpace(doc, boxHeight + 18)
    drawBox(doc, left, startY, boxWidth, boxHeight, skin.cardBg, skin.border, skin.roundness)
    drawBox(doc, left + boxWidth + gap, startY, boxWidth, boxHeight, skin.cardBg, skin.border, skin.roundness)

    doc.fillColor('#64748b').font(fonts.bold).fontSize(8).text('CLIENTE', left + 16, startY + 16)
    doc.fillColor('#0f172a').font(fonts.bold).fontSize(15).text(pdfSafeText(quote.client_name, 'Cliente'), left + 16, startY + 34, {
        width: boxWidth - 32,
        lineGap: 1,
    })
    if (quote.client_company_name) drawInfoLine(doc, 'Empresa', quote.client_company_name, left + 16, startY + 72, boxWidth - 32, fonts)
    if (quote.client_phone) drawInfoLine(doc, 'Telefone', quote.client_phone, left + 16, doc.y + 3, boxWidth - 32, fonts)

    const companyX = left + boxWidth + gap
    doc.fillColor('#64748b').font(fonts.bold).fontSize(8).text('PROFISSIONAL', companyX + 16, startY + 16)
    doc.fillColor('#0f172a').font(fonts.bold).fontSize(15).text(pdfSafeText(profile?.business_name, 'Zacly'), companyX + 16, startY + 34, {
        width: boxWidth - 32,
        lineGap: 1,
    })
    const contact = [profile?.phone, profile?.email].filter(Boolean).join(' | ')
    if (contact) drawInfoLine(doc, 'Contato', contact, companyX + 16, startY + 72, boxWidth - 32, fonts)
    if (profile?.cnpj) drawInfoLine(doc, 'CNPJ', profile.cnpj, companyX + 16, doc.y + 3, boxWidth - 32, fonts)

    doc.y = startY + boxHeight + 28
}

function drawPlanSection(
    doc: PDFKit.PDFDocument,
    quote: QuoteWithItems,
    visualTone: VisualToneId,
    accent: string,
    skin: PdfSkin,
    fonts: ReturnType<typeof getPdfFonts>,
) {
    const left = doc.page.margins.left
    const right = doc.page.width - doc.page.margins.right
    const pageWidth = right - left
    const professionalContext = getProfessionalContext(quote.professional_context)
    const toneIntro: Record<VisualToneId, string> = {
        balanced: 'Escopo, valores e condicoes organizados para uma decisao rapida e segura.',
        formal: 'Documento comercial estruturado com escopo, condicoes e investimento para analise do cliente.',
        creative: 'Proposta visual, clara e personalizada para apresentar o servico com mais presenca.',
    }

    const titleHeight = 24
    const descriptionHeight = doc.heightOfString(professionalContext.description, { width: pageWidth })
    ensureSpace(doc, titleHeight + descriptionHeight + 96)
    drawSectionTitle(doc, `Plano de execucao: ${pdfSafeText(professionalContext.name)}`, accent, fonts, left)

    doc.fillColor('#334155').font(fonts.regular).fontSize(10).text(pdfSafeText(PROPOSAL_TONE_INTRO[visualTone], toneIntro[visualTone]), left, doc.y, {
        width: pageWidth,
        lineGap: 2,
    })
    doc.moveDown(0.5)
    doc.fillColor('#475569').font(fonts.regular).fontSize(9).text(professionalContext.description, {
        width: pageWidth,
        lineGap: 2,
    })
    doc.moveDown(0.7)

    const gap = 12
    const bulletWidth = (pageWidth - gap * 2) / 3
    const bulletY = doc.y
    const bulletHeight = 78
    professionalContext.proposalBullets.forEach((bullet, index) => {
        const x = left + index * (bulletWidth + gap)
        drawBox(doc, x, bulletY, bulletWidth, bulletHeight, '#ffffff', skin.border, skin.roundness)
        doc.roundedRect(x + 12, bulletY + 12, 28, 5, 2).fill(accent)
        doc.fillColor('#334155').font(fonts.bold).fontSize(8).text(pdfSafeText(bullet), x + 12, bulletY + 28, {
            width: bulletWidth - 24,
            height: 38,
            lineGap: 1,
        })
    })

    doc.y = bulletY + bulletHeight + 26
}

function drawItemsTable(
    doc: PDFKit.PDFDocument,
    quote: QuoteWithItems,
    skin: PdfSkin,
    accent: string,
    fonts: ReturnType<typeof getPdfFonts>,
) {
    const left = doc.page.margins.left
    const right = doc.page.width - doc.page.margins.right
    const pageWidth = right - left
    const widths = {
        index: 32,
        description: pageWidth - 32 - 52 - 88 - 94,
        quantity: 52,
        unit: 88,
        total: 94,
    }

    ensureSpace(doc, 92)
    drawSectionTitle(doc, 'Itens e servicos', accent, fonts, left)

    function drawTableHeader() {
        const y = doc.y
        doc.roundedRect(left, y, pageWidth, 26, skin.roundness).fill(skin.tableHeaderBg)
        doc.fillColor(skin.tableHeaderText).font(fonts.bold).fontSize(7.5)
        doc.text('#', left + 10, y + 9, { width: widths.index - 10 })
        doc.text('DESCRICAO', left + widths.index, y + 9, { width: widths.description })
        doc.text('QTD', left + widths.index + widths.description, y + 9, { width: widths.quantity, align: 'right' })
        doc.text('UNITARIO', left + widths.index + widths.description + widths.quantity, y + 9, { width: widths.unit, align: 'right' })
        doc.text('TOTAL', left + widths.index + widths.description + widths.quantity + widths.unit, y + 9, { width: widths.total, align: 'right' })
        doc.y = y + 38
    }

    drawTableHeader()

    quote.quote_items.forEach((item, index) => {
        const quantity = item.quantity || 0
        const unitPrice = item.unit_price || 0
        const lineTotal = quantity * unitPrice
        const details = quote.show_detailed_items && item.details ? pdfSafeText(item.details) : ''
        const description = pdfSafeText(item.description, 'Item sem descricao')
        const textHeight = doc.heightOfString(description, { width: widths.description, lineGap: 1 })
        const detailsHeight = details ? doc.heightOfString(details, { width: widths.description, lineGap: 1 }) + 8 : 0
        const rowHeight = Math.max(46, textHeight + detailsHeight + 18)

        if (doc.y + rowHeight > doc.page.height - doc.page.margins.bottom) {
            doc.addPage()
            drawTableHeader()
        }

        const rowY = doc.y
        doc.roundedRect(left + 2, rowY + 3, 20, 20, 10).fill(accent)
        doc.fillColor('#ffffff').font(fonts.bold).fontSize(8).text(String(index + 1), left + 2, rowY + 9, { width: 20, align: 'center' })

        doc.fillColor('#0f172a').font(fonts.bold).fontSize(9.5).text(description, left + widths.index, rowY, {
            width: widths.description,
            lineGap: 1,
        })
        if (details) {
            doc.fillColor('#64748b').font(fonts.regular).fontSize(8).text(details, left + widths.index, doc.y + 3, {
                width: widths.description,
                lineGap: 1,
            })
        }

        const quantityX = left + widths.index + widths.description
        const unitX = quantityX + widths.quantity
        const totalX = unitX + widths.unit
        doc.fillColor('#334155').font(fonts.regular).fontSize(9)
        doc.text(String(quantity), quantityX, rowY + 2, { width: widths.quantity, align: 'right' })
        doc.text(formatCurrency(unitPrice), unitX, rowY + 2, { width: widths.unit, align: 'right' })
        doc.font(fonts.bold).fillColor('#0f172a').text(formatCurrency(lineTotal), totalX, rowY + 2, { width: widths.total, align: 'right' })

        doc.strokeColor(skin.border).lineWidth(0.8).moveTo(left, rowY + rowHeight).lineTo(right, rowY + rowHeight).stroke()
        doc.y = rowY + rowHeight + 10
    })
}

function drawSummary(
    doc: PDFKit.PDFDocument,
    quote: QuoteWithItems,
    skin: PdfSkin,
    fonts: ReturnType<typeof getPdfFonts>,
) {
    const right = doc.page.width - doc.page.margins.right
    const subtotal = quote.quote_items.reduce((sum, item) => sum + ((item.quantity || 0) * (item.unit_price || 0)), 0)
    const total = quote.total ?? subtotal
    const discount = Math.max(subtotal - total, 0)
    const boxWidth = 228
    const boxHeight = discount > 0 ? 114 : 88

    ensureSpace(doc, boxHeight + 20)
    const y = doc.y + 4
    drawBox(doc, right - boxWidth, y, boxWidth, boxHeight, skin.summaryBg, skin.summaryBg, skin.roundness)
    doc.fillColor(skin.summaryText).font(fonts.regular).fontSize(9).text('Subtotal', right - boxWidth + 18, y + 18, { width: 86 })
    doc.font(fonts.bold).text(formatCurrency(subtotal), right - 112, y + 18, { width: 92, align: 'right' })
    if (discount > 0) {
        doc.font(fonts.regular).fillColor(skin.summaryText).text('Desconto', right - boxWidth + 18, y + 42, { width: 86 })
        doc.font(fonts.bold).text(`-${formatCurrency(discount)}`, right - 112, y + 42, { width: 92, align: 'right' })
    }
    const totalY = discount > 0 ? y + 74 : y + 50
    doc.strokeColor('#ffffff').opacity(0.18).moveTo(right - boxWidth + 18, totalY - 12).lineTo(right - 18, totalY - 12).stroke().opacity(1)
    doc.fillColor(skin.summaryText).font(fonts.bold).fontSize(11).text('Total da proposta', right - boxWidth + 18, totalY, { width: 110 })
    doc.fontSize(12).text(formatCurrency(total), right - 120, totalY, { width: 100, align: 'right' })
    doc.y = y + boxHeight + 24
}

function formatPaymentMethod(value: string) {
    const labels: Record<string, string> = {
        pix: 'PIX',
        cash: 'Dinheiro',
        card: 'Cartao',
        installment: 'Parcelado',
    }

    return labels[value] || value
}

function drawPaymentSection(
    doc: PDFKit.PDFDocument,
    quote: QuoteWithItems,
    profile: ProfileRow | null,
    accent: string,
    fonts: ReturnType<typeof getPdfFonts>,
) {
    if (!quote.show_payment_options && !quote.payment_terms && !profile?.payment_info) return

    const left = doc.page.margins.left
    const right = doc.page.width - doc.page.margins.right
    const pageWidth = right - left

    ensureSpace(doc, 86)
    drawSectionTitle(doc, 'Condicoes de pagamento', accent, fonts, left)

    const lines: string[] = []
    if (quote.payment_methods?.length) {
        lines.push(`Formas aceitas: ${quote.payment_methods.map(formatPaymentMethod).join(', ')}`)
    }
    if (quote.installment_count) lines.push(`Parcelamento: ate ${quote.installment_count}x`)
    if ((quote.cash_discount_percent || 0) > 0) lines.push(`Desconto a vista: ${quote.cash_discount_percent}%`)
    if ((quote.cash_discount_fixed || 0) > 0) lines.push(`Desconto a vista: ${formatCurrency(quote.cash_discount_fixed)}`)
    if (quote.payment_terms) lines.push(pdfSafeText(quote.payment_terms))
    if (profile?.payment_info) lines.push(pdfSafeText(profile.payment_info))

    doc.fillColor('#334155').font(fonts.regular).fontSize(10).text(lines.join('\n'), left, doc.y, {
        width: pageWidth,
        lineGap: 3,
    })
    doc.moveDown(1.2)
}

function drawTimelineSection(
    doc: PDFKit.PDFDocument,
    quote: QuoteWithItems,
    skin: PdfSkin,
    accent: string,
    fonts: ReturnType<typeof getPdfFonts>,
) {
    if (!quote.show_timeline) return

    const left = doc.page.margins.left
    const right = doc.page.width - doc.page.margins.right
    const pageWidth = right - left
    const gap = 12
    const cardWidth = (pageWidth - gap * 2) / 3
    const cardHeight = 82
    const estimated = quote.estimated_days ? `${quote.estimated_days} dias` : 'A combinar'
    const steps = [
        { title: '1. Aprovacao', body: 'Cliente aprova pelo link publico enviado.' },
        { title: '2. Execucao', body: `Prazo estimado: ${estimated}.` },
        { title: '3. Entrega', body: 'Conclusao e validacao conforme escopo aprovado.' },
    ]

    ensureSpace(doc, cardHeight + 70)
    drawSectionTitle(doc, 'Cronograma de entrega', accent, fonts, left)

    const startY = doc.y
    steps.forEach((step, index) => {
        const x = left + index * (cardWidth + gap)
        drawBox(doc, x, startY, cardWidth, cardHeight, '#ffffff', skin.border, skin.roundness)
        doc.roundedRect(x + 12, startY + 12, 24, 24, 12).fill(accent)
        doc.fillColor('#ffffff').font(fonts.bold).fontSize(9).text(String(index + 1), x + 12, startY + 19, { width: 24, align: 'center' })
        doc.fillColor('#0f172a').font(fonts.bold).fontSize(9.5).text(step.title, x + 44, startY + 13, { width: cardWidth - 56 })
        doc.fillColor('#475569').font(fonts.regular).fontSize(8.5).text(step.body, x + 12, startY + 42, {
            width: cardWidth - 24,
            lineGap: 1,
        })
    })

    doc.y = startY + cardHeight + 24
}

function drawApprovalSection(
    doc: PDFKit.PDFDocument,
    approvalUrl: string,
    qrBuffer: Buffer | null,
    skin: PdfSkin,
    accent: string,
    fonts: ReturnType<typeof getPdfFonts>,
) {
    const left = doc.page.margins.left
    const right = doc.page.width - doc.page.margins.right
    const pageWidth = right - left
    const boxHeight = 126

    ensureSpace(doc, boxHeight + 56)
    drawSectionTitle(doc, 'Aprovacao segura', accent, fonts, left)

    const y = doc.y
    drawBox(doc, left, y, pageWidth, boxHeight, skin.cardBg, skin.border, skin.roundness)

    const textWidth = qrBuffer ? pageWidth - 170 : pageWidth - 36
    doc.roundedRect(left + 18, y + 18, 38, 38, 12).fill(accent)
    doc.fillColor('#ffffff').font(fonts.bold).fontSize(16).text('OK', left + 18, y + 29, { width: 38, align: 'center' })
    doc.fillColor('#0f172a').font(fonts.bold).fontSize(14).text('A decisao oficial e do cliente', left + 70, y + 18, {
        width: textWidth - 52,
    })
    doc.fillColor('#475569').font(fonts.regular).fontSize(9.5).text(
        'O prestador nao aprova a propria proposta. O cliente deve usar o link publico ou o QR code abaixo para aprovar, recusar ou pedir ajustes.',
        left + 70,
        y + 42,
        { width: textWidth - 52, lineGap: 2 },
    )
    doc.fillColor('#334155').font(fonts.bold).fontSize(8.5).text(pdfSafeText(approvalUrl), left + 70, y + 90, {
        width: textWidth - 52,
        lineBreak: false,
    })

    if (qrBuffer) {
        const qrX = right - 118
        doc.roundedRect(qrX - 8, y + 14, 104, 104, 12).fillAndStroke('#ffffff', skin.border)
        doc.image(qrBuffer, qrX, y + 22, { fit: [88, 88], align: 'center', valign: 'center' })
    }

    doc.y = y + boxHeight + 26
}

function drawNotesAndFooter(
    doc: PDFKit.PDFDocument,
    quote: QuoteWithItems,
    footerText: string,
    accent: string,
    fonts: ReturnType<typeof getPdfFonts>,
) {
    const left = doc.page.margins.left
    const right = doc.page.width - doc.page.margins.right
    const pageWidth = right - left

    if (quote.notes) {
        ensureSpace(doc, 84)
        drawSectionTitle(doc, 'Observacoes', accent, fonts, left)
        doc.fillColor('#334155').font(fonts.regular).fontSize(10).text(pdfSafeText(quote.notes), left, doc.y, {
            width: pageWidth,
            lineGap: 3,
        })
        doc.moveDown(1.1)
    }

    if (footerText) {
        ensureSpace(doc, 70)
        const y = doc.y
        doc.roundedRect(left, y, pageWidth, 48, 8).fillAndStroke('#f8fafc', '#e2e8f0')
        doc.fillColor('#334155').font(fonts.bold).fontSize(10).text(pdfSafeText(footerText), left + 18, y + 16, {
            width: pageWidth - 36,
            align: 'center',
        })
        doc.y = y + 68
    }

    const footerY = doc.page.height - doc.page.margins.bottom - 28
    doc.strokeColor('#e2e8f0').moveTo(left, footerY - 12).lineTo(right, footerY - 12).stroke()
    doc.fillColor('#64748b').font(fonts.regular).fontSize(8).text('Gerado pelo Zacly. A aprovacao oficial deve ser feita pelo link publico enviado ao cliente.', left, footerY, {
        width: pageWidth,
        align: 'center',
        lineBreak: false,
    })
}

async function renderQuotePdf(quote: QuoteWithItems, profile: ProfileRow | null, approvalUrl: string) {
    const businessName = pdfSafeText(profile?.business_name, 'Zacly')
    const accent = normalizeColor(profile?.theme_color || profile?.primary_color)
    const identitySettings = parseIdentitySettings(profile?.quote_settings, profile?.quote_font_family)
    const proposalModel = normalizeProposalModel(quote.layout_style || profile?.layout_style)
    const fonts = getPdfFonts(identitySettings.quoteFont)
    const skin = getPdfSkin(proposalModel, accent, identitySettings.visualTone)
    const logo = await fetchLogoImage(profile?.logo_url)
    const approvalQr = await generateApprovalQr(approvalUrl)

    const doc = new PDFDocument({
        size: 'A4',
        margin: 46,
        bufferPages: true,
        info: {
            Title: `Orcamento ${pdfSafeText(quote.client_name)}`,
            Author: businessName,
            Subject: 'Proposta comercial',
        },
    })

    const chunks: Buffer[] = []
    const bufferPromise = new Promise<Buffer>((resolve, reject) => {
        doc.on('data', (chunk: Buffer) => chunks.push(chunk))
        doc.on('end', () => resolve(Buffer.concat(chunks)))
        doc.on('error', reject)
    })

    drawHeader(doc, quote, profile, skin, accent, fonts, logo)
    drawPeopleSection(doc, quote, profile, skin, fonts)
    drawPlanSection(doc, quote, identitySettings.visualTone, accent, skin, fonts)
    drawItemsTable(doc, quote, skin, accent, fonts)
    drawTimelineSection(doc, quote, skin, accent, fonts)
    drawSummary(doc, quote, skin, fonts)
    drawPaymentSection(doc, quote, profile, accent, fonts)
    drawApprovalSection(doc, approvalUrl, approvalQr, skin, accent, fonts)
    drawNotesAndFooter(doc, quote, identitySettings.footerText, accent, fonts)

    const range = doc.bufferedPageRange()
    for (let index = range.start; index < range.start + range.count; index++) {
        doc.switchToPage(index)
        doc.fillColor('#94a3b8')
            .font(fonts.regular)
            .fontSize(7)
            .text(`Pagina ${index + 1} de ${range.count}`, doc.page.margins.left, doc.page.height - doc.page.margins.bottom - 18, {
                width: doc.page.width - doc.page.margins.left - doc.page.margins.right,
                align: 'right',
                lineBreak: false,
            })
    }

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
        .select('business_name, phone, email, cnpj, address, address_number, city, state, payment_info, logo_url, theme_color, primary_color, layout_style, quote_font_family, quote_settings, plan')
        .eq('id', typedQuote.user_id)
        .maybeSingle()

    const approvalUrl = `${getAppBaseUrl()}/quotes/${typedQuote.id}?token=${typedQuote.public_token}`
    const pdf = await renderQuotePdf(typedQuote, profile, approvalUrl)
    const fileName = `orcamento-${safeFileName(typedQuote.client_name)}.pdf`

    return new Response(new Uint8Array(pdf), {
        headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${fileName}"`,
            'Cache-Control': 'no-store',
        },
    })
}
