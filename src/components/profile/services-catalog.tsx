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
            <div className="flex justify-between items-center mb-[-1rem]">
                <h3 className="text-sm font-semibold text-foreground hidden sm:block">Adicionar Item</h3>
                <div className="flex flex-1 justify-end">
                    <FoldersDialog folders={initialFolders} />
                </div>
            </div>
            {/* Add Form */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
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
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value as 'service' | 'product')}
                            className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="service">Serviço</option>
                            <option value="product">Produto</option>
                        </select>
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
                        <div className="flex gap-2">
                            <select
                                value={folderId}
                                onChange={(e) => setFolderId(e.target.value)}
                                className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="">Sem pasta</option>
                                {initialFolders.map(f => (
                                    <option key={f.id} value={f.id}>{f.name}</option>
                                ))}
                            </select>
                        </div>
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
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {services.map((service) => {
                        const folder = initialFolders.find(f => f.id === service.folder_id)
                        return (
                            <div
                                key={service.id}
                                className="flex items-center justify-between p-3 bg-card rounded-lg border border-primary/10 hover:border-primary/25 transition-all group"
                            >
                                <div className="flex-1 min-w-0 flex flex-col items-start gap-1">
                                    <div className="flex items-center gap-2">
                                        <p className="font-medium text-sm text-foreground truncate">{service.description}</p>
                                        <Badge variant="outline" className="text-[10px] py-0 h-4 border-slate-200 text-slate-500 font-normal">
                                            {service.type === 'product' ? <Package className="h-3 w-3 mr-1" /> : <Wrench className="h-3 w-3 mr-1" />}
                                            {service.type === 'product' ? 'Produto' : 'Serviço'}
                                        </Badge>
                                        {folder && (
                                            <Badge variant="secondary" className="text-[10px] py-0 h-4 bg-slate-100 text-slate-600 font-normal">
                                                <Folder className="h-3 w-3 mr-1" /> {folder.name}
                                            </Badge>
                                        )}
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
                        )
                    })}
                </div>
            )}
        </div>
    )
}
