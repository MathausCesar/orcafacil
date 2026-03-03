'use client'

import { useState } from 'react'
import { cancelSubscription } from '@/app/actions/cancel-subscription'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { Loader2, AlertTriangle } from 'lucide-react'

const CANCELLATION_REASONS = [
    { id: 'price', label: 'O preço está muito alto para minha realidade' },
    { id: 'features', label: 'Faltam funcionalidades que eu preciso' },
    { id: 'bugs', label: 'Encontrei muitos bugs ou problemas técnicos' },
    { id: 'not_using', label: 'Não estou usando o sistema com frequência' },
    { id: 'competitor', label: 'Encontrei uma solução melhor' },
    { id: 'other', label: 'Outro motivo' },
]

interface CancelSubscriptionDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function CancelSubscriptionDialog({ open, onOpenChange }: CancelSubscriptionDialogProps) {
    const [loading, setLoading] = useState(false)
    const [selectedReason, setSelectedReason] = useState('')
    const [comments, setComments] = useState('')

    const handleCancel = async () => {
        if (!selectedReason) {
            toast.error('Por favor, selecione um motivo.')
            return
        }

        setLoading(true)
        try {
            const result = await cancelSubscription({
                reason: selectedReason,
                additionalComments: comments
            })

            if (result.error) {
                toast.error(result.error)
            } else {
                toast.success('Assinatura cancelada. Sentiremos sua falta! 💚')
                onOpenChange(false)
                // Refresh the page to reflect plan downgrade
                window.location.reload()
            }
        } catch (e) {
            toast.error('Erro inesperado. Tente novamente.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-lg">
                <AlertDialogHeader>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
                        </div>
                        <AlertDialogTitle className="text-lg font-bold text-left">
                            Cancelar assinatura
                        </AlertDialogTitle>
                    </div>
                    <AlertDialogDescription className="text-sm text-muted-foreground text-left">
                        Lamentamos que queira cancelar. Antes de confirmar, nos conte o motivo — sua opinião é muito importante para melhorarmos o Zacly.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="py-2 space-y-5">
                    {/* Reason Selection */}
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold">Qual é o principal motivo? *</Label>
                        <RadioGroup
                            value={selectedReason}
                            onValueChange={setSelectedReason}
                            className="space-y-2"
                        >
                            {CANCELLATION_REASONS.map((reason) => (
                                <div key={reason.id} className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer transition-colors">
                                    <RadioGroupItem value={reason.id} id={`reason-${reason.id}`} />
                                    <Label
                                        htmlFor={`reason-${reason.id}`}
                                        className="text-sm cursor-pointer flex-1 font-normal"
                                    >
                                        {reason.label}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>

                    {/* Additional Comments */}
                    <div className="space-y-2">
                        <Label htmlFor="comments" className="text-sm font-semibold">
                            Quer nos contar mais? <span className="text-muted-foreground font-normal">(opcional)</span>
                        </Label>
                        <Textarea
                            id="comments"
                            value={comments}
                            onChange={(e) => setComments(e.target.value.slice(0, 500))}
                            placeholder="Qualquer detalhe nos ajuda a melhorar..."
                            className="resize-none h-24 focus-visible:ring-red-400 text-sm"
                        />
                        <p className="text-xs text-muted-foreground text-right">{comments.length}/500</p>
                    </div>
                </div>

                <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                        className="w-full sm:w-auto"
                    >
                        Manter minha assinatura
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleCancel}
                        disabled={loading || !selectedReason}
                        className="w-full sm:w-auto"
                    >
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Confirmar cancelamento
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
