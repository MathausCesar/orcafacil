'use client'

import { useState } from 'react'
import { updateClient } from '@/app/actions/clients'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Pencil, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { CepInput } from './cep-input'

interface Client {
    id: string
    name: string
    phone?: string | null
    email?: string | null
    address?: string | null
    cep?: string | null
    notes?: string | null
}

interface EditClientDialogProps {
    client: Client
    trigger?: React.ReactNode
}

export function EditClientDialog({ client, trigger }: EditClientDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (formData: FormData) => {
        setLoading(true)
        try {
            const result = await updateClient(client.id, formData)
            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success('Cliente atualizado com sucesso!')
                setOpen(false)
                setTimeout(() => router.refresh(), 100)
            }
        } catch {
            toast.error('Erro ao atualizar cliente')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="ghost" size="sm" className="gap-2">
                        <Pencil className="h-4 w-4" /> Editar
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="grid max-h-[calc(100dvh-1rem)] grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden p-0 sm:max-h-[calc(100vh-2rem)] sm:max-w-[425px]">
                <DialogHeader className="border-b border-border px-5 py-4 pr-12 sm:px-6">
                    <DialogTitle>Editar Cliente</DialogTitle>
                </DialogHeader>
                <form action={handleSubmit} className="contents">
                    <div className="min-h-0 space-y-4 overflow-y-auto px-5 py-4 sm:px-6">
                    <div className="space-y-2">
                        <Label htmlFor="edit-name">Nome Completo *</Label>
                        <Input
                            id="edit-name"
                            name="name"
                            required
                            defaultValue={client.name}
                            placeholder="Ex: Maria Souza"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-phone">Telefone / WhatsApp</Label>
                        <Input
                            id="edit-phone"
                            name="phone"
                            defaultValue={client.phone || ''}
                            placeholder="(11) 99999-9999"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-email">Email</Label>
                        <Input
                            id="edit-email"
                            name="email"
                            type="email"
                            defaultValue={client.email || ''}
                            placeholder="cliente@email.com"
                        />
                    </div>
                    <CepInput defaultCep={client.cep || ''} defaultAddress={client.address || ''} />
                    <div className="space-y-2">
                        <Label htmlFor="edit-notes">Observações</Label>
                        <Textarea
                            id="edit-notes"
                            name="notes"
                            defaultValue={client.notes || ''}
                            placeholder="Preferências, histórico..."
                        />
                    </div>
                    </div>
                    <DialogFooter className="border-t border-border bg-background px-5 py-4 sm:px-6">
                        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Salvar Alterações
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
