'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, Package } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface Service {
    id: string
    description: string
    default_price: number
    category: string | null
}

interface ServicesCatalogProps {
    initialServices: Service[]
    userId: string
}

export function ServicesCatalog({ initialServices, userId }: ServicesCatalogProps) {
    const [services, setServices] = useState<Service[]>(initialServices)
    const [description, setDescription] = useState('')
    const [price, setPrice] = useState('')
    const [saving, setSaving] = useState(false)
    const router = useRouter()

    const handleAdd = async () => {
        if (!description.trim()) {
            toast.error('Informe a descrição do serviço/produto.')
            return
        }
        const priceVal = parseFloat(price.replace(',', '.')) || 0
        if (priceVal <= 0) {
            toast.warning('Informe um valor válido.')
            return
        }

        setSaving(true)
        try {
            const supabase = createClient()
            const { data, error } = await supabase
                .from('services')
                .insert({
                    user_id: userId,
                    description: description.trim(),
                    default_price: priceVal
                })
                .select()
                .single()

            if (error) throw error

            setServices([data, ...services])
            setDescription('')
            setPrice('')
            toast.success('Serviço salvo!')
            router.refresh()
        } catch (error) {
            console.error('Error adding service:', error)
            toast.error('Erro ao salvar serviço.')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        try {
            const supabase = createClient()
            const { error } = await supabase
                .from('services')
                .delete()
                .eq('id', id)

            if (error) throw error

            setServices(services.filter(s => s.id !== id))
            toast.success('Serviço removido.')
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
        <div className="space-y-4">
            {/* Add Form */}
            <div className="flex gap-2 items-end">
                <div className="flex-1 space-y-1">
                    <Label className="text-xs text-muted-foreground">Descrição</Label>
                    <Input
                        placeholder="Ex: Troca de Óleo 5W30"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="focus-visible:ring-primary"
                    />
                </div>
                <div className="w-28 space-y-1">
                    <Label className="text-xs text-muted-foreground">Preço (R$)</Label>
                    <Input
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="focus-visible:ring-primary"
                    />
                </div>
                <Button
                    onClick={handleAdd}
                    disabled={saving || !description.trim()}
                    className="bg-gradient-to-r from-primary to-emerald-600 text-white shadow-md shadow-primary/20"
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </div>

            {/* Services List */}
            {services.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground bg-primary/5 rounded-lg border border-dashed border-primary/20">
                    <Package className="h-8 w-8 mx-auto mb-2 text-primary/25" />
                    <p className="text-sm">Nenhum serviço cadastrado.</p>
                    <p className="text-xs mt-1 text-primary/50">Cadastre seus serviços para agilizar orçamentos.</p>
                </div>
            ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                    {services.map((service) => (
                        <div
                            key={service.id}
                            className="flex items-center justify-between p-3 bg-card rounded-lg border border-primary/10 hover:border-primary/25 transition-all group"
                        >
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm text-foreground truncate">{service.description}</p>
                                <p className="text-xs text-primary font-semibold">{formatBRL(service.default_price)}</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleDelete(service.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
