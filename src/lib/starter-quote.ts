import type { InitialCatalogItem } from '@/lib/onboarding-catalog'

export type StarterCatalogItem = {
    id?: string | null
    description: string
    details?: string | null
    default_price: number
    cost_price?: number | null
    type?: string | null
    unit?: string | null
    persisted?: boolean
}

export type StarterQuoteItem = {
    id: string
    serviceId?: string | null
    itemType?: 'service' | 'product'
    description: string
    details?: string | null
    quantity: number
    unitPrice: number
    unitCost?: number
    costIsKnown?: boolean
}

const STARTER_PRIORITY_BY_CONTEXT: Record<string, string[]> = {
    mechanic: [
        'diagnostico mecanico inicial',
        'troca de oleo e filtro',
        'oleo motor',
        'filtro de oleo',
        'revisao preventiva basica',
    ],
    electrician: [
        'diagnostico eletrico',
        'instalacao',
        'troca',
        'disjuntor',
        'tomada',
    ],
    woodworker: [
        'projeto',
        'montagem',
        'mdf',
        'dobradica',
        'acabamento',
    ],
    painter: [
        'preparacao',
        'pintura',
        'massa',
        'tinta',
    ],
    general: [
        'diagnostico',
        'visita tecnica',
        'servico',
        'material',
    ],
}

function normalizeText(value: string) {
    return value
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
}

function getPriority(description: string, contextId: string) {
    const normalized = normalizeText(description)
    const priorities = STARTER_PRIORITY_BY_CONTEXT[contextId] || STARTER_PRIORITY_BY_CONTEXT.general
    const index = priorities.findIndex((keyword) => normalized.includes(keyword))

    return index === -1 ? priorities.length + 1 : index
}

function getStarterQuantity(item: StarterCatalogItem) {
    const description = normalizeText(item.description)
    const unit = normalizeText(item.unit || '')

    if (description.includes('oleo motor') || unit === 'litro') return 4
    return 1
}

export function catalogSeedToStarterItems(items: InitialCatalogItem[]): StarterCatalogItem[] {
    return items.map((item, index) => ({
        id: `starter-seed-${index}`,
        description: item.name,
        details: item.details,
        default_price: item.price,
        type: item.type,
        unit: item.unit,
        persisted: false,
    }))
}

export function buildStarterQuoteItemsFromCatalog(
    catalogItems: StarterCatalogItem[],
    professionalContextId: string,
) {
    const rankedItems = catalogItems
        .filter((item) => item.description && Number(item.default_price) > 0)
        .map((item, index) => ({
            item,
            index,
            priority: getPriority(item.description, professionalContextId),
            typeRank: item.type === 'service' ? 0 : 1,
        }))
        .sort((a, b) => {
            if (a.priority !== b.priority) return a.priority - b.priority
            if (a.typeRank !== b.typeRank) return a.typeRank - b.typeRank
            return a.index - b.index
        })

    const selected: StarterCatalogItem[] = []
    const addUnique = (item: StarterCatalogItem) => {
        if (selected.some((selectedItem) => normalizeText(selectedItem.description) === normalizeText(item.description))) return
        selected.push(item)
    }

    rankedItems.slice(0, 6).forEach(({ item }) => addUnique(item))

    const services = selected.filter((item) => item.type !== 'product').slice(0, 2)
    const products = selected.filter((item) => item.type === 'product').slice(0, 2)
    const balancedSelection = [...services, ...products]

    const finalSelection = balancedSelection.length >= 3
        ? balancedSelection
        : selected.slice(0, 4)

    return finalSelection.slice(0, 4).map<StarterQuoteItem>((item, index) => ({
        id: item.id && item.persisted ? item.id : `starter-item-${index}`,
        serviceId: item.id && item.persisted ? item.id : null,
        itemType: item.type === 'product' ? 'product' : 'service',
        description: item.description,
        details: item.details || null,
        quantity: getStarterQuantity(item),
        unitPrice: Number(item.default_price) || 0,
        unitCost: Number(item.cost_price) || undefined,
        costIsKnown: Number(item.cost_price) > 0,
    }))
}

export function getStarterClientName(professionalContextId: string) {
    if (professionalContextId === 'mechanic') return 'Cliente teste da oficina'
    if (professionalContextId === 'woodworker') return 'Cliente teste do projeto'
    if (professionalContextId === 'electrician') return 'Cliente teste do servico'
    return 'Cliente teste'
}
