'use client'

import { useEffect, useMemo, useState } from 'react'
import { createService, deleteService } from '@/app/actions/services'
import { EditServiceDialog } from './edit-service-dialog'
import { FoldersDialog } from './folders-dialog'
import { StockAdjustDialog } from './stock-adjust-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { AlertTriangle, Boxes, Folder, Package, Plus, Trash2, Wrench } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Service {
    id: string
    description: string
    default_price: number
    category: string | null
    type?: 'service' | 'product' | null
    details?: string | null
    folder_id?: string | null
    unit?: string | null
    cost_price?: number | null
    stock_quantity?: number | null
    min_stock?: number | null
    track_stock?: boolean | null
}

export interface ItemFolder {
    id: string
    name: string
    color: string | null
}

interface ServicesCatalogProps {
    initialServices: Service[]
    initialFolders: ItemFolder[]
    userId: string
}

type CatalogFilter = 'all' | 'service' | 'product' | 'low_stock'

function formatBRL(value: number | null | undefined) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0))
}

function formatQty(value: number | null | undefined, unit?: string | null) {
    return `${Number(value || 0).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} ${unit || 'un'}`
}

function getMargin(defaultPrice: number, costPrice: number | null | undefined) {
    const cost = Number(costPrice || 0)
    if (cost <= 0 || defaultPrice <= 0) return null

    return Math.round(((defaultPrice - cost) / defaultPrice) * 100)
}

function isLowStock(service: Service) {
    return service.type === 'product' &&
        Boolean(service.track_stock) &&
        Number(service.stock_quantity || 0) <= Number(service.min_stock || 0)
}

export function ServicesCatalog({ initialServices, initialFolders }: ServicesCatalogProps) {
    const [services, setServices] = useState<Service[]>(initialServices || [])
    const [description, setDescription] = useState('')
    const [price, setPrice] = useState('')
    const [type, setType] = useState<'service' | 'product'>('service')
    const [details, setDetails] = useState('')
    const [folderId, setFolderId] = useState('')
    const [unit, setUnit] = useState('un')
    const [costPrice, setCostPrice] = useState('')
    const [trackStock, setTrackStock] = useState(false)
    const [stockQuantity, setStockQuantity] = useState('')
    const [minStock, setMinStock] = useState('')
    const [filter, setFilter] = useState<CatalogFilter>('all')
    const [saving, setSaving] = useState(false)
    const router = useRouter()

    useEffect(() => {
        setServices(initialServices || [])
    }, [initialServices])

    const stats = useMemo(() => {
        const products = services.filter((service) => service.type === 'product')
        const trackedProducts = products.filter((service) => service.track_stock)
        const lowStock = services.filter(isLowStock)

        return {
            all: services.length,
            services: services.filter((service) => service.type !== 'product').length,
            products: products.length,
            trackedProducts: trackedProducts.length,
            lowStock: lowStock.length,
        }
    }, [services])

    const filteredServices = useMemo(() => {
        return services.filter((service) => {
            if (filter === 'service') return service.type !== 'product'
            if (filter === 'product') return service.type === 'product'
            if (filter === 'low_stock') return isLowStock(service)
            return true
        })
    }, [filter, services])

    const groupedServices = useMemo(() => {
        return filteredServices.reduce((groups, service) => {
            const groupKey = service.folder_id || 'unassigned'
            if (!groups[groupKey]) groups[groupKey] = []
            groups[groupKey].push(service)
            return groups
        }, {} as Record<string, Service[]>)
    }, [filteredServices])

    const sortedGroupKeys = useMemo(() => {
        return Object.keys(groupedServices).sort((a, b) => {
            if (a === 'unassigned') return 1
            if (b === 'unassigned') return -1

            const folderA = initialFolders.find((folder) => folder.id === a)
            const folderB = initialFolders.find((folder) => folder.id === b)
            return (folderA?.name || '').localeCompare(folderB?.name || '')
        })
    }, [groupedServices, initialFolders])

    const resetForm = () => {
        setDescription('')
        setPrice('')
        setDetails('')
        setFolderId('')
        setUnit('un')
        setCostPrice('')
        setTrackStock(false)
        setStockQuantity('')
        setMinStock('')
        setType('service')
    }

    const handleAdd = async () => {
        if (!description.trim()) {
            toast.error('Informe o nome do item.')
            return
        }

        const priceValue = Number(price.replace(',', '.'))
        if (!Number.isFinite(priceValue) || priceValue < 0) {
            toast.warning('Informe um preco valido.')
            return
        }

        setSaving(true)

        try {
            const formData = new FormData()
            formData.append('description', description)
            formData.append('price', price || '0')
            formData.append('type', type)
            formData.append('unit', unit || 'un')
            formData.append('cost_price', costPrice || '0')
            formData.append('track_stock', String(type === 'product' && trackStock))
            formData.append('stock_quantity', type === 'product' && trackStock ? stockQuantity || '0' : '0')
            formData.append('min_stock', type === 'product' && trackStock ? minStock || '0' : '0')
            if (details.trim()) formData.append('details', details.trim())
            if (folderId) formData.append('folder_id', folderId)

            const result = await createService(formData)

            if (result.error) {
                toast.error(result.error)
                return
            }

            toast.success(type === 'product' ? 'Produto salvo.' : 'Servico salvo.')
            resetForm()
            router.refresh()
        } catch {
            toast.error('Erro ao salvar item.')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        try {
            const result = await deleteService(id)

            if (result.error) {
                toast.error(result.error)
                return
            }

            toast.success('Item removido.')
            router.refresh()
        } catch {
            toast.error('Erro ao remover.')
        }
    }

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            event.preventDefault()
            handleAdd()
        }
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <div className="rounded-xl border border-border bg-card p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total</p>
                    <p className="mt-1 text-2xl font-bold text-foreground">{stats.all}</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Servicos</p>
                    <p className="mt-1 text-2xl font-bold text-foreground">{stats.services}</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Produtos</p>
                    <p className="mt-1 text-2xl font-bold text-foreground">{stats.products}</p>
                </div>
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
                    <p className="text-xs font-semibold uppercase tracking-wide">Baixo estoque</p>
                    <p className="mt-1 text-2xl font-bold">{stats.lowStock}</p>
                </div>
            </div>

            <div className="rounded-xl border border-border bg-muted/40 p-4">
                <div className="mb-4 flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-foreground">Adicionar item ao catalogo</h3>
                        <p className="text-xs text-muted-foreground">Use produto/material somente quando quiser controlar estoque.</p>
                    </div>
                    <FoldersDialog folders={initialFolders} />
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_140px_150px_180px]">
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Nome do item</Label>
                            <Input
                                placeholder="Ex: Visita tecnica ou Cabo 2.5mm"
                                value={description}
                                onChange={(event) => setDescription(event.target.value)}
                                onKeyDown={handleKeyDown}
                                className="bg-background"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Venda (R$)</Label>
                            <Input
                                type="number"
                                step="0.01"
                                placeholder="0,00"
                                value={price}
                                onChange={(event) => setPrice(event.target.value)}
                                onKeyDown={handleKeyDown}
                                className="bg-background"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Custo (R$)</Label>
                            <Input
                                type="number"
                                step="0.01"
                                placeholder="0,00"
                                value={costPrice}
                                onChange={(event) => setCostPrice(event.target.value)}
                                onKeyDown={handleKeyDown}
                                className="bg-background"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Tipo</Label>
                            <Select value={type} onValueChange={(value) => setType(value as 'service' | 'product')}>
                                <SelectTrigger className="bg-background">
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="service">Servico</SelectItem>
                                    <SelectItem value="product">Produto/material</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_130px_180px_auto] lg:items-end">
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Detalhes opcionais</Label>
                            <Input
                                placeholder="Ex: marca, condicao, o que esta incluso..."
                                value={details}
                                onChange={(event) => setDetails(event.target.value)}
                                onKeyDown={handleKeyDown}
                                className="bg-background"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Unidade</Label>
                            <Input
                                placeholder="un"
                                value={unit}
                                onChange={(event) => setUnit(event.target.value)}
                                onKeyDown={handleKeyDown}
                                className="bg-background"
                            />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Pasta</Label>
                            <Select value={folderId || 'none'} onValueChange={(value) => setFolderId(value === 'none' ? '' : value)}>
                                <SelectTrigger className="bg-background">
                                    <SelectValue placeholder="Sem pasta" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Sem pasta</SelectItem>
                                    {initialFolders.map((folder) => (
                                        <SelectItem key={folder.id} value={folder.id}>
                                            {folder.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            type="button"
                            onClick={handleAdd}
                            disabled={saving || !description.trim()}
                            className="h-10 bg-primary text-white hover:bg-primary/90"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Adicionar
                        </Button>
                    </div>

                    {type === 'product' && (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
                            <div className="mb-3 flex items-center gap-2">
                                <Checkbox
                                    id="new-track-stock"
                                    checked={trackStock}
                                    onCheckedChange={(checked) => setTrackStock(Boolean(checked))}
                                />
                                <Label htmlFor="new-track-stock" className="cursor-pointer text-sm font-semibold text-emerald-900">
                                    Controlar estoque deste produto
                                </Label>
                            </div>

                            {trackStock && (
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div className="space-y-1">
                                        <Label className="text-xs text-emerald-900/70">Quantidade atual</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="Ex: 10"
                                            value={stockQuantity}
                                            onChange={(event) => setStockQuantity(event.target.value)}
                                            className="bg-background"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-xs text-emerald-900/70">Avisar abaixo de</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="Ex: 2"
                                            value={minStock}
                                            onChange={(event) => setMinStock(event.target.value)}
                                            className="bg-background"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                {[
                    { id: 'all', label: 'Todos', icon: Boxes },
                    { id: 'service', label: 'Servicos', icon: Wrench },
                    { id: 'product', label: 'Produtos', icon: Package },
                    { id: 'low_stock', label: 'Baixo estoque', icon: AlertTriangle },
                ].map((item) => {
                    const Icon = item.icon
                    const active = filter === item.id

                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => setFilter(item.id as CatalogFilter)}
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition ${active
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
                                }`}
                        >
                            <Icon className="h-4 w-4" />
                            {item.label}
                        </button>
                    )
                })}
            </div>

            {filteredServices.length === 0 ? (
                <div className="rounded-xl border border-dashed border-primary/20 bg-primary/5 py-8 text-center text-muted-foreground">
                    <Package className="mx-auto mb-2 h-8 w-8 text-primary/30" />
                    <p className="text-sm">Nenhum item encontrado.</p>
                    <p className="mt-1 text-xs text-muted-foreground/70">Cadastre itens recorrentes para montar orcamentos mais rapido.</p>
                </div>
            ) : (
                <div className="max-h-[38rem] space-y-6 overflow-y-auto pr-1 pb-4">
                    {sortedGroupKeys.map((key) => {
                        const items = groupedServices[key]
                        const folder = key === 'unassigned'
                            ? null
                            : initialFolders.find((item) => item.id === key)

                        return (
                            <div key={key} className="space-y-3">
                                <h4 className="flex items-center gap-2 border-b border-border pb-2 text-sm font-semibold text-foreground">
                                    <Folder className="h-4 w-4" style={{ color: folder?.color || '#94a3b8' }} />
                                    {folder ? folder.name : 'Sem pasta'}
                                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-normal text-muted-foreground">
                                        {items.length}
                                    </span>
                                </h4>

                                <div className="grid grid-cols-1 gap-3">
                                    {items.map((service) => {
                                        const isProduct = service.type === 'product'
                                        const lowStock = isLowStock(service)
                                        const margin = getMargin(service.default_price, service.cost_price)

                                        return (
                                            <div
                                                key={service.id}
                                                className="rounded-xl border border-border bg-card p-4 shadow-sm transition hover:border-primary/30 hover:shadow-md"
                                            >
                                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                                    <div className="min-w-0 flex-1 space-y-2">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <p className="break-words text-sm font-bold leading-tight text-foreground">
                                                                {service.description}
                                                            </p>
                                                            <Badge variant="outline" className="gap-1 text-[10px]">
                                                                {isProduct ? <Package className="h-3 w-3" /> : <Wrench className="h-3 w-3" />}
                                                                {isProduct ? 'Produto' : 'Servico'}
                                                            </Badge>
                                                            {lowStock && (
                                                                <Badge className="gap-1 bg-amber-100 text-amber-800 hover:bg-amber-100">
                                                                    <AlertTriangle className="h-3 w-3" />
                                                                    Baixo estoque
                                                                </Badge>
                                                            )}
                                                        </div>

                                                        {service.details && (
                                                            <p className="line-clamp-2 text-xs leading-snug text-muted-foreground">
                                                                {service.details}
                                                            </p>
                                                        )}

                                                        <div className="flex flex-wrap gap-2 text-xs">
                                                            <span className="rounded-full bg-muted px-2 py-1 text-muted-foreground">
                                                                Venda: <strong className="text-foreground">{formatBRL(service.default_price)}</strong>
                                                            </span>
                                                            {Number(service.cost_price || 0) > 0 && (
                                                                <span className="rounded-full bg-muted px-2 py-1 text-muted-foreground">
                                                                    Custo: <strong className="text-foreground">{formatBRL(service.cost_price)}</strong>
                                                                </span>
                                                            )}
                                                            {margin !== null && (
                                                                <span className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">
                                                                    Margem aprox.: <strong>{margin}%</strong>
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="flex shrink-0 flex-col gap-3 sm:items-end">
                                                        {isProduct && (
                                                            <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm sm:text-right">
                                                                {service.track_stock ? (
                                                                    <>
                                                                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Estoque</p>
                                                                        <p className={`font-bold ${lowStock ? 'text-amber-700' : 'text-foreground'}`}>
                                                                            {formatQty(service.stock_quantity, service.unit)}
                                                                        </p>
                                                                        <p className="text-[10px] text-muted-foreground">
                                                                            minimo {formatQty(service.min_stock, service.unit)}
                                                                        </p>
                                                                    </>
                                                                ) : (
                                                                    <p className="text-xs font-semibold text-muted-foreground">Sem controle de estoque</p>
                                                                )}
                                                            </div>
                                                        )}

                                                        <div className="flex items-center justify-end gap-1">
                                                            {isProduct && service.track_stock && (
                                                                <StockAdjustDialog
                                                                    serviceId={service.id}
                                                                    itemName={service.description}
                                                                    currentStock={Number(service.stock_quantity || 0)}
                                                                    unit={service.unit}
                                                                />
                                                            )}
                                                            <EditServiceDialog service={service} initialFolders={initialFolders} />
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-rose-500 hover:bg-rose-50 hover:text-rose-600"
                                                                onClick={() => handleDelete(service.id)}
                                                                aria-label="Remover item"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
