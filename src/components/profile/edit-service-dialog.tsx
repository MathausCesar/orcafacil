'use client'

import { useState } from 'react'
import { updateService } from '@/app/actions/services'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Pencil } from 'lucide-react'
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

interface EditServiceDialogProps {
    service: Service
    initialFolders: ItemFolder[]
}

export function EditServiceDialog({ service, initialFolders }: EditServiceDialogProps) {
    const [open, setOpen] = useState(false)
    const [description, setDescription] = useState(service.description)
    const [price, setPrice] = useState(String(service.default_price || '').replace('.', ','))
    const [type, setType] = useState<'service' | 'product'>(service.type === 'product' ? 'product' : 'service')
    const [details, setDetails] = useState(service.details || '')
    const [folderId, setFolderId] = useState(service.folder_id || '')
    const [unit, setUnit] = useState(service.unit || 'un')
    const [costPrice, setCostPrice] = useState(String(service.cost_price || '').replace('.', ','))
    const [minStock, setMinStock] = useState(String(service.min_stock || '').replace('.', ','))
    const [trackStock, setTrackStock] = useState(Boolean(service.track_stock))
    const [saving, setSaving] = useState(false)
    const router = useRouter()

    const handleSave = async () => {
        if (!description.trim()) {
            toast.error('Informe a descricao.')
            return
        }

        setSaving(true)

        try {
            const formData = new FormData()
            formData.append('description', description)
            formData.append('price', price)
            formData.append('type', type)
            formData.append('unit', unit || 'un')
            formData.append('cost_price', costPrice || '0')
            formData.append('min_stock', minStock || '0')
            formData.append('track_stock', String(type === 'product' && trackStock))
            if (details.trim()) formData.append('details', details)
            if (folderId) formData.append('folder_id', folderId)

            const result = await updateService(service.id, formData)

            if (result.error) {
                toast.error(result.error)
                return
            }

            toast.success('Item atualizado.')
            setOpen(false)
            router.refresh()
        } catch {
            toast.error('Erro ao atualizar.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                    <Pencil className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="grid max-h-[calc(100dvh-1rem)] grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden p-0 sm:max-h-[calc(100vh-2rem)] sm:max-w-[520px]">
                <DialogHeader className="border-b border-border px-5 py-4 pr-12 sm:px-6">
                    <DialogTitle>Editar item do catalogo</DialogTitle>
                    <DialogDescription>
                        Ajuste preco, custo, tipo e regras simples de estoque.
                    </DialogDescription>
                </DialogHeader>

                <div className="min-h-0 overflow-y-auto px-5 py-4 sm:px-6">
                    <div className="grid gap-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="description">Nome do item</Label>
                        <Input
                            id="description"
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="price">Preco de venda</Label>
                            <Input
                                id="price"
                                type="number"
                                step="0.01"
                                value={price}
                                onChange={(event) => setPrice(event.target.value)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="cost">Custo</Label>
                            <Input
                                id="cost"
                                type="number"
                                step="0.01"
                                value={costPrice}
                                onChange={(event) => setCostPrice(event.target.value)}
                                placeholder="0,00"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="unit">Unidade</Label>
                            <Input
                                id="unit"
                                value={unit}
                                onChange={(event) => setUnit(event.target.value)}
                                placeholder="un, m, kg..."
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="type">Tipo</Label>
                            <Select value={type} onValueChange={(value) => setType(value as 'service' | 'product')}>
                                <SelectTrigger id="type">
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="service">Servico</SelectItem>
                                    <SelectItem value="product">Produto/material</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="folder">Pasta</Label>
                            <Select value={folderId || 'none'} onValueChange={(value) => setFolderId(value === 'none' ? '' : value)}>
                                <SelectTrigger id="folder">
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
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="details">Detalhes</Label>
                        <Input
                            id="details"
                            value={details}
                            onChange={(event) => setDetails(event.target.value)}
                            placeholder="Ex: inclui instalacao, acabamento, material..."
                        />
                    </div>

                    {type === 'product' && (
                        <div className="space-y-3 rounded-xl border border-border bg-muted/30 p-4">
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id="track-stock"
                                    checked={trackStock}
                                    onCheckedChange={(checked) => setTrackStock(Boolean(checked))}
                                />
                                <Label htmlFor="track-stock" className="cursor-pointer">
                                    Controlar estoque deste produto
                                </Label>
                            </div>

                            {trackStock && (
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="currentStock">Estoque atual</Label>
                                        <Input
                                            id="currentStock"
                                            value={`${Number(service.stock_quantity || 0).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} ${unit || 'un'}`}
                                            disabled
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="minStock">Alerta minimo</Label>
                                        <Input
                                            id="minStock"
                                            type="number"
                                            step="0.01"
                                            value={minStock}
                                            onChange={(event) => setMinStock(event.target.value)}
                                            placeholder="Ex: 5"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                    </div>
                </div>

                <DialogFooter className="border-t border-border bg-background px-5 py-4 sm:px-6">
                    <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
                        {saving ? 'Salvando...' : 'Salvar alteracoes'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
