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
import { Pencil } from 'lucide-react'
import { updateService } from '@/app/actions/services'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Service {
    id: string
    description: string
    default_price: number
    category: string | null
}

interface EditServiceDialogProps {
    service: Service
}

export function EditServiceDialog({ service }: EditServiceDialogProps) {
    const [open, setOpen] = useState(false)
    const [description, setDescription] = useState(service.description)
    const [price, setPrice] = useState(service.default_price.toString().replace('.', ','))
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

            console.log('Sending data:', { description, price }) // Debug

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
