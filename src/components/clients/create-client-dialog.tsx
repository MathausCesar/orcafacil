'use client'

import { useState } from 'react'
import { createClientAction } from '@/app/actions/clients'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, UserPlus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface CreateClientDialogProps {
    trigger?: React.ReactNode;
    onSuccess?: (client: any) => void;
}

export function CreateClientDialog({ trigger, onSuccess }: CreateClientDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (formData: FormData) => {
        if (loading) return // Prevent double submission
        setLoading(true)
        try {
            const result = await createClientAction(formData)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success('Cliente cadastrado com sucesso!')
                setOpen(false)
                router.refresh()
                if (onSuccess) onSuccess(result)
            }
        } catch (e) {
            toast.error('Erro ao cadastrar cliente')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="gap-2 shadow-lg">
                        <UserPlus className="h-4 w-4" /> Novo Cliente
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Novo Cliente</DialogTitle>
                </DialogHeader>
                <form action={handleSubmit} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome Completo *</Label>
                        <Input id="name" name="name" required placeholder="Ex: Maria Souza" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Telefone / WhatsApp</Label>
                        <Input id="phone" name="phone" placeholder="(11) 99999-9999" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" placeholder="cliente@email.com" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="address">Endereço</Label>
                        <Textarea id="address" name="address" placeholder="Rua, Número, Bairro..." className="min-h-[80px]" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="notes">Observações</Label>
                        <Textarea id="notes" name="notes" placeholder="Preferências, histórico..." />
                    </div>
                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Salvar Cliente
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
