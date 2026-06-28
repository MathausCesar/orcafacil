'use client'

import { useState } from 'react'
import { adjustServiceStock } from '@/app/actions/services'
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
import { Textarea } from '@/components/ui/textarea'
import { PackagePlus } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface StockAdjustDialogProps {
    serviceId: string
    itemName: string
    currentStock: number
    unit?: string | null
}

export function StockAdjustDialog({ serviceId, itemName, currentStock, unit }: StockAdjustDialogProps) {
    const [open, setOpen] = useState(false)
    const [direction, setDirection] = useState<'add' | 'remove'>('add')
    const [quantity, setQuantity] = useState('')
    const [note, setNote] = useState('')
    const [saving, setSaving] = useState(false)
    const router = useRouter()

    const handleSave = async () => {
        const parsedQuantity = Number(quantity.replace(',', '.'))

        if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
            toast.error('Informe uma quantidade maior que zero.')
            return
        }

        setSaving(true)

        try {
            const formData = new FormData()
            formData.set('direction', direction)
            formData.set('quantity', quantity)
            if (note.trim()) formData.set('note', note.trim())

            const result = await adjustServiceStock(serviceId, formData)

            if (result.error) {
                toast.error(result.error)
                return
            }

            toast.success('Estoque atualizado.')
            setQuantity('')
            setNote('')
            setDirection('add')
            setOpen(false)
            router.refresh()
        } catch {
            toast.error('Nao foi possivel ajustar o estoque.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-1.5">
                    <PackagePlus className="h-3.5 w-3.5" />
                    Ajustar
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[440px]">
                <DialogHeader>
                    <DialogTitle>Ajustar estoque</DialogTitle>
                    <DialogDescription>
                        {itemName} tem {currentStock.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} {unit || 'un'} no estoque.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted p-1">
                        <button
                            type="button"
                            onClick={() => setDirection('add')}
                            className={`rounded-md px-3 py-2 text-sm font-semibold transition ${direction === 'add'
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            Entrada
                        </button>
                        <button
                            type="button"
                            onClick={() => setDirection('remove')}
                            className={`rounded-md px-3 py-2 text-sm font-semibold transition ${direction === 'remove'
                                ? 'bg-background text-foreground shadow-sm'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            Saida
                        </button>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor={`stock-${serviceId}`}>Quantidade</Label>
                        <Input
                            id={`stock-${serviceId}`}
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={quantity}
                            onChange={(event) => setQuantity(event.target.value)}
                            placeholder={`Ex: 3 ${unit || 'un'}`}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor={`stock-note-${serviceId}`}>Observacao opcional</Label>
                        <Textarea
                            id={`stock-note-${serviceId}`}
                            value={note}
                            onChange={(event) => setNote(event.target.value)}
                            placeholder="Ex: compra de material, ajuste manual, perda..."
                            className="min-h-20 resize-none"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? 'Salvando...' : 'Salvar ajuste'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
