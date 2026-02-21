'use client'

import { useState, useEffect } from 'react'
import { createService, deleteService } from '@/app/actions/services'
import { EditServiceDialog } from './edit-service-dialog'
import { FoldersDialog } from './folders-dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, Package, Folder, Tag, Wrench } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

interface Service {
    id: string
    description: string
    default_price: number
    category: string | null
    type?: 'service' | 'product'
    details?: string | null
    folder_id?: string | null
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

export function ServicesCatalog({ initialServices, initialFolders, userId }: ServicesCatalogProps) {
    const [services, setServices] = useState<Service[]>(initialServices || [])

    // Sync state with props when revalidated
    useEffect(() => {
        setServices(initialServices || [])
    }, [initialServices])

    const [description, setDescription] = useState('')
    const [price, setPrice] = useState('')
    const [type, setType] = useState<'service' | 'product'>('service')
    const [details, setDetails] = useState('')
    const [folderId, setFolderId] = useState('')
    const [saving, setSaving] = useState(false)
    const router = useRouter()

    const handleAdd = async () => {
        if (!description.trim()) {
            toast.error('Informe a descrição do serviço/produto.')
            return
        }
        const priceVal = price.replace(',', '.')
        if (!priceVal || isNaN(parseFloat(priceVal))) {
            toast.warning('Informe um valor válido.')
            return
        }

        setSaving(true)
        try {
            const formData = new FormData()
            formData.append('description', description)
            formData.append('price', price)
            formData.append('type', type)
            if (details.trim()) formData.append('details', details)
            if (folderId) formData.append('folder_id', folderId)

            console.log('Adding service:', { description, price, type, folderId }) // Debug

            const result = await createService(formData)

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success('Serviço salvo!')
                setDescription('')
                setPrice('')
                setDetails('')
                router.refresh()
            }
        } catch (error) {
            console.error('Error adding service:', error)
            toast.error('Erro ao salvar serviço.')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        try {
            const result = await deleteService(id)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success('Serviço removido.')
                router.refresh()
            }
        } catch (error) {
            toast.error('Erro ao remover.')
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleAdd()
        }
    }

    const formatBRL = (v: number) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

    return (
        <div className="space-y-6">
            {/* Add Form */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200/60">
                    <h3 className="text-sm font-semibold text-slate-800">Adicionar Novo Item</h3>
                    <FoldersDialog folders={initialFolders} />
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 space-y-1">
                        <Label className="text-xs text-muted-foreground">Título do Item</Label>
                        <Input
                            placeholder="Ex: Troca de Óleo ou Bateria 60Ah"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="bg-white focus-visible:ring-primary"
                        />
                    </div>
                    <div className="w-full sm:w-32 space-y-1">
                        <Label className="text-xs text-muted-foreground">Preço (R$)</Label>
                        <Input
                            type="number"
                            step="0.01"
                            placeholder="0,00"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="bg-white focus-visible:ring-primary"
                        />
                    </div>
                    <div className="w-full sm:w-40 space-y-1">
                        <Label className="text-xs text-muted-foreground">Tipo</Label>
                        <Select value={type} onValueChange={(value) => setType(value as 'service' | 'product')}>
                            <SelectTrigger className="bg-white">
                                <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="service">Serviço</SelectItem>
                                <SelectItem value="product">Produto</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 items-end">
                    <div className="flex-1 space-y-1">
                        <Label className="text-xs text-muted-foreground">Descrição Opcional (Detalhes)</Label>
                        <Input
                            placeholder="Ex: Inclui filtro de óleo e mão de obra..."
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="bg-white focus-visible:ring-primary"
                        />
                    </div>
                    <div className="w-full sm:w-48 space-y-1">
                        <Label className="text-xs text-muted-foreground">Pasta (Opcional)</Label>
                        <Select value={folderId || 'none'} onValueChange={(val) => setFolderId(val === 'none' ? '' : val)}>
                            <SelectTrigger className="bg-white">
                                <SelectValue placeholder="Sem pasta" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Sem pasta</SelectItem>
                                {initialFolders.map(f => (
                                    <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button
                        onClick={handleAdd}
                        disabled={saving || !description.trim()}
                        className="bg-gradient-to-r from-primary to-emerald-600 text-white shadow-md shadow-primary/20 w-full sm:w-auto h-9"
                    >
                        <Plus className="h-4 w-4 mr-1" /> Adicionar
                    </Button>
                </div>
            </div>

            {/* Services List */}
            {services.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground bg-primary/5 rounded-lg border border-dashed border-primary/20">
                    <Package className="h-8 w-8 mx-auto mb-2 text-primary/25" />
                    <p className="text-sm">Nenhum serviço cadastrado.</p>
                    <p className="text-xs mt-1 text-primary/50">Cadastre seus serviços para agilizar orçamentos.</p>
                </div>
            ) : (
                <div className="space-y-6 max-h-[32rem] overflow-y-auto pr-1 pb-4">
                    {(() => {
                        // Agrupar serviços por pasta
                        const grouped = services.reduce((acc, currentService) => {
                            const groupKey = currentService.folder_id || 'unassigned'
                            if (!acc[groupKey]) {
                                acc[groupKey] = []
                            }
                            acc[groupKey].push(currentService)
                            return acc
                        }, {} as Record<string, Service[]>)

                        // Ordenar chaves: pastas existentes primeiro, "unassigned" por último
                        const sortedKeys = Object.keys(grouped).sort((a, b) => {
                            if (a === 'unassigned') return 1
                            if (b === 'unassigned') return -1
                            const folderA = initialFolders.find(f => f.id === a)
                            const folderB = initialFolders.find(f => f.id === b)
                            return (folderA?.name || '').localeCompare(folderB?.name || '')
                        })

                        return sortedKeys.map(key => {
                            const items = grouped[key]
                            const isUnassigned = key === 'unassigned'
                            const folder = !isUnassigned ? initialFolders.find(f => f.id === key) : null

                            return (
                                <div key={key} className="space-y-3">
                                    <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-800 pb-1 border-b border-slate-100">
                                        <Folder className="h-4 w-4" style={{ color: folder?.color || '#94a3b8' }} />
                                        {folder ? folder.name : 'Sem Pasta'}
                                        <span className="text-xs font-normal text-muted-foreground bg-slate-100 px-2 py-0.5 rounded-full ml-1">
                                            {items.length}
                                        </span>
                                    </h4>
                                    <div className="grid grid-cols-1 gap-2">
                                        {items.map((service) => (
                                            <div
                                                key={service.id}
                                                className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 hover:border-primary/40 hover:shadow-sm transition-all group"
                                            >
                                                <div className="flex-1 min-w-0 flex flex-col items-start gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium text-sm text-foreground truncate">{service.description}</p>
                                                        <Badge variant="outline" className="text-[10px] py-0 h-4 border-slate-200 text-slate-500 font-normal">
                                                            {service.type === 'product' ? <Package className="h-3 w-3 mr-1" /> : <Wrench className="h-3 w-3 mr-1" />}
                                                            {service.type === 'product' ? 'Produto' : 'Serviço'}
                                                        </Badge>
                                                    </div>
                                                    {service.details && (
                                                        <p className="text-xs text-muted-foreground truncate max-w-sm">{service.details}</p>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <p className="text-sm text-primary font-bold">{formatBRL(service.default_price)}</p>
                                                    <div className="flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                                                        <EditServiceDialog service={service} initialFolders={initialFolders} />
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                                                            onClick={() => handleDelete(service.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        })
                    })()}
                </div>
            )}
        </div>
    )
}
