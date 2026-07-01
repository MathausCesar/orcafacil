'use client'

import { useState } from 'react'
import { createClientAction } from '@/app/actions/clients'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { UserPlus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { CepInput } from './cep-input'
import type { ClientOption } from '@/components/clients/client-autocomplete'

interface CreateClientDialogProps {
    trigger?: React.ReactNode;
    onSuccess?: (client: ClientOption | null) => void;
}

export function CreateClientDialog({ trigger, onSuccess }: CreateClientDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [personType, setPersonType] = useState('pf')
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
                if (onSuccess) onSuccess(result.client)
            }
        } catch {
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
            <DialogContent className="grid max-h-[calc(100dvh-1rem)] grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden p-0 sm:max-h-[calc(100vh-2rem)] sm:max-w-[425px]">
                <DialogHeader className="border-b border-border px-5 py-4 pr-12 sm:px-6">
                    <DialogTitle>Novo Cliente</DialogTitle>
                </DialogHeader>
                <form action={handleSubmit} className="contents">
                    <div className="min-h-0 space-y-4 overflow-y-auto px-5 py-4 sm:px-6">
                    {/* Tipo de Pessoa */}
                    <div className="space-y-3">
                        <Label>Tipo de Cliente *</Label>
                        <RadioGroup
                            defaultValue="pf"
                            name="person_type"
                            onValueChange={setPersonType}
                            className="flex gap-4"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="pf" id="pf" />
                                <Label htmlFor="pf" className="font-normal cursor-pointer">
                                    Pessoa Física
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="pj" id="pj" />
                                <Label htmlFor="pj" className="font-normal cursor-pointer">
                                    Pessoa Jurídica
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Razão Social (apenas PJ) */}
                    {personType === 'pj' && (
                        <div className="space-y-2">
                            <Label htmlFor="company_name">Razão Social *</Label>
                            <Input
                                id="company_name"
                                name="company_name"
                                required={personType === 'pj'}
                                placeholder="Ex: Tech Solutions Ltda"
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="name">
                            {personType === 'pj' ? 'Nome Fantasia / Contato *' : 'Nome Completo *'}
                        </Label>
                        <Input
                            id="name"
                            name="name"
                            required
                            placeholder={personType === 'pj' ? 'Ex: Tech Solutions' : 'Ex: Maria Souza'}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Telefone / WhatsApp</Label>
                        <Input id="phone" name="phone" placeholder="(11) 99999-9999" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" placeholder="cliente@email.com" />
                    </div>
                    <CepInput />
                    <div className="space-y-2">
                        <Label htmlFor="notes">Observações</Label>
                        <Textarea id="notes" name="notes" placeholder="Preferências, histórico..." />
                    </div>
                    </div>
                    <DialogFooter className="border-t border-border bg-background px-5 py-4 sm:px-6">
                        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Salvar Cliente
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
