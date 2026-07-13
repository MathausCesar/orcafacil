export type ProfitCalculatorItem = {
    description: string
    quantity: number
    unitPrice: number
    unitCost?: number | null
    costIsKnown?: boolean
}

export type ProfitSummary = {
    revenue: number
    knownCost: number
    profit: number
    marginPercent: number | null
    itemCount: number
    itemsWithKnownCost: number
    itemsWithoutKnownCost: number
}

function toNonNegativeNumber(value: unknown) {
    const parsed = typeof value === 'number' ? value : Number(value)

    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0
}

function getItemQuantity(item: ProfitCalculatorItem) {
    return toNonNegativeNumber(item.quantity)
}

export function hasKnownUnitCost(item: ProfitCalculatorItem) {
    if (item.costIsKnown === false) return false
    return typeof item.unitCost === 'number' && Number.isFinite(item.unitCost) && item.unitCost >= 0
}

export function calculateItemRevenue(item: ProfitCalculatorItem) {
    return getItemQuantity(item) * toNonNegativeNumber(item.unitPrice)
}

export function calculateItemKnownCost(item: ProfitCalculatorItem) {
    if (!hasKnownUnitCost(item)) return 0

    return getItemQuantity(item) * toNonNegativeNumber(item.unitCost)
}

export function calculateMarginPercent(revenue: number, profit: number) {
    const normalizedRevenue = toNonNegativeNumber(revenue)

    if (normalizedRevenue === 0) return null

    return (profit / normalizedRevenue) * 100
}

export function normalizeMarginPercent(value: unknown) {
    return Math.min(Math.max(toNonNegativeNumber(value), 0), 100)
}

export function isMarginBelowTarget(marginPercent: number | null, targetMarginPercent: number) {
    return marginPercent !== null && marginPercent < normalizeMarginPercent(targetMarginPercent)
}

export function calculateProfitSummary(items: readonly ProfitCalculatorItem[]): ProfitSummary {
    const relevantItems = items.filter((item) => getItemQuantity(item) > 0)
    const revenue = relevantItems.reduce((total, item) => total + calculateItemRevenue(item), 0)
    const knownCost = relevantItems.reduce((total, item) => total + calculateItemKnownCost(item), 0)
    const itemsWithKnownCost = relevantItems.filter(hasKnownUnitCost).length
    const itemsWithoutKnownCost = relevantItems.length - itemsWithKnownCost

    return {
        revenue,
        knownCost,
        profit: revenue - knownCost,
        marginPercent: itemsWithoutKnownCost > 0 ? null : calculateMarginPercent(revenue, revenue - knownCost),
        itemCount: relevantItems.length,
        itemsWithKnownCost,
        itemsWithoutKnownCost,
    }
}
