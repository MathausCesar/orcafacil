'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
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
import { updateService } from '@/app/actions/services'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

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

interface EditServiceDialogProps {
    service: Service
    initialFolders: ItemFolder[]
}

export function EditServiceDialog({ service, initialFolders }: EditServiceDialogProps) {
    const [open, setOpen] = useState(false)
    const [description, setDescription] = useState(service.description)
    const [price, setPrice] = useState(service.default_price.toString().replace('.', ','))
    const [type, setType] = useState<'service' | 'product'>(service.type || 'service')
    const [details, setDetails] = useState(service.details || '')
    const [folderId, setFolderId] = useState(service.folder_id || '')
    const [saving, setSaving] = useState(false)
    const router = useRouter()

    const handleSave = async () => {
        if (!description.trim()) {
            toast.error('Informe a descrição.')
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

            console.log('Sending data:', { description, price, type, folderId }) // Debug

            const result = await updateService(service.id, formData)

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success('Serviço atualizado!')
                setOpen(false)
                router.refresh()
            }
        } catch (error) {
            console.error('Error in handleSave:', error)
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
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Editar Serviço/Produto</DialogTitle>
                    <DialogDescription>
                        Faça alterações no serviço ou produto aqui.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">
                            Descrição
                        </Label>
                        <Input
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="price" className="text-right">
                            Preço (R$)
                        </Label>
                        <Input
                            id="price"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">Tipo</Label>
                        <Select value={type} onValueChange={(val) => setType(val as 'service' | 'product')}>
                            <SelectTrigger id="type" className="col-span-3 bg-white">
                                <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="service">Serviço</SelectItem>
                                <SelectItem value="product">Produto</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="details" className="text-right">Detalhes / Descrição</Label>
                        <Input
                            id="details"
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            className="col-span-3"
                            placeholder="Ex: Descrição rica do item..."
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="folder" className="text-right">Pasta</Label>
                        <Select value={folderId || 'none'} onValueChange={(val) => setFolderId(val === 'none' ? '' : val)}>
                            <SelectTrigger id="folder" className="col-span-3 bg-white">
                                <SelectValue placeholder="Sem pasta" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Nenhuma pasta</SelectItem>
                                {initialFolders.map(f => (
                                    <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? 'Salvando...' : 'Salvar alterações'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
