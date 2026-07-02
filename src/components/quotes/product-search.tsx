'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useOrganization } from '@/contexts/organization-context'
import { Folder, Package, Plus, Wrench } from 'lucide-react'
import { toast } from 'sonner'

interface ProductSearchProps {
    onAddProduct: (product: {
        serviceId?: string | null
        itemType?: 'service' | 'product'
        name: string
        price: number
        quantity: number
        details?: string | null
        unitCost?: number
    }) => void
}

interface SavedService {
    id: string
    description: string
    default_price: number
    type?: 'service' | 'product' | null
    details?: string | null
    folder_id?: string | null
    unit?: string | null
    cost_price?: number | null
    stock_quantity?: number | null
    min_stock?: number | null
    track_stock?: boolean | null
}

interface ItemFolder {
    id: string
    name: string
}

function formatBRL(value: number) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function formatQty(value: number | null | undefined, unit?: string | null) {
    return `${Number(value || 0).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} ${unit || 'un'}`
}

function parseBrazilianNumber(value: string) {
    const cleanValue = value.trim().replace(/\s/g, '')

    if (!cleanValue) return 0

    const normalized = cleanValue.includes(',')
        ? cleanValue.replace(/\./g, '').replace(',', '.')
        : cleanValue

    const parsed = Number(normalized)
    return Number.isFinite(parsed) ? parsed : 0
}

export function ProductSearch({ onAddProduct }: ProductSearchProps) {
    const { organization } = useOrganization()
    const [description, setDescription] = useState('')
    const [price, setPrice] = useState('')
    const [quantity, setQuantity] = useState('1')
    const [savedServices, setSavedServices] = useState<SavedService[]>([])
    const [folders, setFolders] = useState<ItemFolder[]>([])
    const [suggestions, setSuggestions] = useState<SavedService[]>([])
    const [selectedService, setSelectedService] = useState<SavedService | null>(null)
    const [selectedDetails, setSelectedDetails] = useState<string | null>(null)
    const [showSuggestions, setShowSuggestions] = useState(false)
    const suggestionsRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const loadServices = async () => {
            if (!organization?.id) {
                setSavedServices([])
                setFolders([])
                return
            }

            const supabase = createClient()
            const { data } = await supabase
                .from('services')
                .select('id, description, default_price, type, details, folder_id, unit, cost_price, stock_quantity, min_stock, track_stock')
                .eq('organization_id', organization.id)
                .order('description')

            const { data: folderData } = await supabase
                .from('item_folders')
                .select('id, name')
                .eq('organization_id', organization.id)

            if (folderData) setFolders(folderData)
            if (data) setSavedServices(data)
        }

        loadServices()
    }, [organization?.id])

    useEffect(() => {
        const handleClick = (event: MouseEvent) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
                setShowSuggestions(false)
            }
        }

        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    const handleDescriptionChange = (value: string) => {
        setDescription(value)
        setSelectedService(null)
        setSelectedDetails(null)

        if (value.trim().length > 0) {
            const filtered = savedServices.filter((service) =>
                service.description.toLowerCase().includes(value.toLowerCase())
            )
            setSuggestions(filtered)
            setShowSuggestions(filtered.length > 0)
        } else {
            setSuggestions(savedServices)
            setShowSuggestions(savedServices.length > 0)
        }
    }

    const selectSuggestion = (service: SavedService) => {
        setDescription(service.description)
        setPrice(service.default_price.toString())
        setSelectedDetails(service.details || null)
        setSelectedService(service)
        setShowSuggestions(false)
    }

    const handleAdd = () => {
        if (!description.trim()) {
            toast.error('Informe a descrição do item.')
            return
        }

        const priceVal = parseBrazilianNumber(price)
        const qtyVal = parseBrazilianNumber(quantity) || 1

        if (priceVal <= 0) {
            toast.warning('O preço deve ser maior que zero.')
            return
        }

        if (qtyVal <= 0) {
            toast.warning('A quantidade deve ser maior que zero.')
            return
        }

        if (
            selectedService?.type === 'product' &&
            selectedService.track_stock &&
            typeof selectedService.stock_quantity === 'number' &&
            qtyVal > selectedService.stock_quantity
        ) {
            toast.warning('Quantidade acima do estoque atual. O item foi adicionado para você decidir depois.')
        }

        onAddProduct({
            serviceId: selectedService?.id || null,
            itemType: selectedService?.type === 'product' ? 'product' : 'service',
            name: description.trim(),
            price: priceVal,
            quantity: qtyVal,
            details: selectedDetails,
            unitCost: selectedService?.cost_price || 0,
        })

        setDescription('')
        setPrice('')
        setQuantity('1')
        setSelectedDetails(null)
        setSelectedService(null)
        toast.success('Item adicionado!')
    }

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            event.preventDefault()
            handleAdd()
        }
    }

    return (
        <div className="space-y-4 rounded-lg border border-primary/10 bg-primary/5 p-4">
            <div className="relative" ref={suggestionsRef}>
                <div className="space-y-1">
                    <Label htmlFor="itemName" className="text-xs font-medium text-muted-foreground">
                        Item ou serviço
                    </Label>
                    <Input
                        id="itemName"
                        placeholder="Ex: Troca de óleo, pastilha de freio..."
                        value={description}
                        onChange={(event) => handleDescriptionChange(event.target.value)}
                        onFocus={() => {
                            if (description.trim().length === 0 && savedServices.length > 0) {
                                setSuggestions(savedServices)
                                setShowSuggestions(true)
                            } else if (suggestions.length > 0) {
                                setShowSuggestions(true)
                            }
                        }}
                        onKeyDown={handleKeyDown}
                        className="focus-visible:ring-primary"
                        autoComplete="off"
                    />
                </div>

                {showSuggestions && (
                    <div className="fixed inset-x-3 bottom-[calc(9rem+env(safe-area-inset-bottom))] z-[45] max-h-[40vh] overflow-y-auto overscroll-contain rounded-lg border border-primary/15 bg-card shadow-lg sm:absolute sm:bottom-auto sm:left-0 sm:right-0 sm:top-full sm:z-20 sm:mt-1 sm:max-h-72">
                        {Object.entries(
                            suggestions.reduce((groups, current) => {
                                const key = current.folder_id || 'none'
                                if (!groups[key]) groups[key] = []
                                groups[key].push(current)
                                return groups
                            }, {} as Record<string, SavedService[]>)
                        ).map(([folderId, items]) => {
                            const folderName = folderId === 'none'
                                ? 'Itens sem pasta'
                                : folders.find((folder) => folder.id === folderId)?.name || 'Pasta'

                            return (
                                <div key={folderId} className="border-b border-primary/10 last:border-0">
                                    <div className="sticky top-0 z-10 flex items-center gap-1.5 border-y border-border/50 bg-muted/80 px-3 py-1.5">
                                        <Folder className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                            {folderName}
                                        </span>
                                    </div>

                                    {items.map((service) => {
                                        const isProduct = service.type === 'product'
                                        const hasLowStock = isProduct &&
                                            service.track_stock &&
                                            Number(service.stock_quantity || 0) <= Number(service.min_stock || 0)

                                        return (
                                            <button
                                                key={service.id}
                                                type="button"
                                                className="flex w-full flex-col items-start border-b border-border/30 px-3 py-2.5 text-left transition-colors last:border-0 hover:bg-primary/5"
                                                onClick={() => selectSuggestion(service)}
                                            >
                                                <div className="flex w-full items-center justify-between gap-3">
                                                    <div className="flex min-w-0 items-center gap-2">
                                                        <span className="truncate text-sm font-medium text-foreground">
                                                            {service.description}
                                                        </span>
                                                        <Badge variant="outline" className="h-4 shrink-0 border-border py-0 text-[10px] font-normal text-muted-foreground">
                                                            {isProduct ? <Package className="mr-1 h-3 w-3" /> : <Wrench className="mr-1 h-3 w-3" />}
                                                            {isProduct ? 'Produto' : 'Serviço'}
                                                        </Badge>
                                                    </div>
                                                    <span className="shrink-0 text-xs font-semibold text-primary">
                                                        {formatBRL(service.default_price)}
                                                    </span>
                                                </div>

                                                <div className="mt-1 flex w-full flex-wrap items-center gap-2">
                                                    {service.details && (
                                                        <span className="max-w-sm truncate text-[10px] text-muted-foreground">
                                                            {service.details}
                                                        </span>
                                                    )}
                                                    {isProduct && service.track_stock && (
                                                        <span className="text-[10px] font-semibold text-muted-foreground">
                                                            Estoque: {formatQty(service.stock_quantity, service.unit)}
                                                        </span>
                                                    )}
                                                    {hasLowStock && (
                                                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                                                            baixo estoque
                                                        </span>
                                                    )}
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="w-full space-y-1 sm:w-24">
                    <Label htmlFor="itemQty" className="text-xs font-medium text-muted-foreground">
                        Qtd
                    </Label>
                    <Input
                        id="itemQty"
                        type="text"
                        inputMode="decimal"
                        value={quantity}
                        onChange={(event) => setQuantity(event.target.value)}
                        onKeyDown={handleKeyDown}
                        className="focus-visible:ring-primary"
                    />
                </div>

                <div className="flex-1 space-y-1">
                    <Label htmlFor="itemPrice" className="text-xs font-medium text-muted-foreground">
                        Valor unitário (R$)
                    </Label>
                    <Input
                        id="itemPrice"
                        type="text"
                        inputMode="decimal"
                        placeholder="0,00"
                        value={price}
                        onChange={(event) => setPrice(event.target.value)}
                        onKeyDown={handleKeyDown}
                        className="focus-visible:ring-primary"
                    />
                </div>

                <Button
                    type="button"
                    onClick={handleAdd}
                    disabled={!description.trim()}
                    className="w-full bg-gradient-to-r from-primary to-emerald-600 text-white shadow-md shadow-primary/20 hover:from-primary/90 hover:to-emerald-600/90 sm:w-auto"
                >
                    <Plus className="mr-2 h-4 w-4" /> Adicionar
                </Button>
            </div>

            <p className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Package className="h-3 w-3" />
                {savedServices.length > 0
                    ? 'Produtos do catálogo mantêm vínculo com estoque. Itens digitados manualmente ficam livres.'
                    : 'Cadastre serviços e produtos no catálogo para agilizar os orçamentos.'
                }
            </p>
        </div>
    )
}
