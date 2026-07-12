'use client'

import { useState } from 'react'
import { ArrowLeft, ArrowRight, FileText, Sparkles } from 'lucide-react'
import { useOnboarding } from '@/components/onboarding/onboarding-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { captureEvent } from '@/lib/analytics'

interface WizardStep4Props {
    initialEmail: string
}

export function WizardStep4({ initialEmail }: WizardStep4Props) {
    const { data, updateData, nextStep, prevStep } = useOnboarding()
    const [businessName, setBusinessName] = useState(data.businessName || '')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleContinue = () => {
        if (!businessName.trim()) {
            toast.error('Informe como seu cliente conhece voce ou seu negocio.')
            return
        }

        setIsSubmitting(true)
        captureEvent('onboarding_business_named', {
            category_id: data.category?.id,
            category_slug: data.category?.slug,
            intended_plan: data.intendedPlan || 'none',
        })
        updateData({
            businessName: businessName.trim(),
            email: data.email || initialEmail,
        })
        window.setTimeout(() => nextStep(), 200)
    }

    return (
        <div className="mx-auto max-w-xl space-y-6">
            <div className="space-y-2 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><FileText className="h-6 w-6" /></div>
                <h2 className="text-2xl font-bold tracking-tight">Vamos preparar sua proposta teste</h2>
                <p className="text-muted-foreground">Use o nome que seu cliente reconhece. Logo, CNPJ e preferencias entram depois, quando voce ja tiver visto o resultado.</p>
            </div>

            <div className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-7">
                <div className="space-y-2">
                    <Label htmlFor="businessName">Seu nome ou nome da oficina *</Label>
                    <Input
                        id="businessName"
                        value={businessName}
                        onChange={(event) => setBusinessName(event.target.value)}
                        placeholder={data.category?.slug === 'mecanicos' ? 'Ex: Oficina do Joao' : 'Ex: Seu negocio'}
                        autoFocus
                        className="h-12 text-base"
                    />
                </div>
                <div className="mt-5 flex gap-3 rounded-xl border border-primary/15 bg-primary/5 p-4 text-sm leading-6 text-muted-foreground">
                    <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <p>Na proxima tela, o Zacly ja abre itens sugeridos para seu oficio. Voce so ajusta cliente, servicos e valores antes de salvar.</p>
                </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border bg-card p-4">
                <Button variant="ghost" onClick={prevStep} className="text-muted-foreground"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Button>
                <Button onClick={handleContinue} disabled={isSubmitting} className="font-semibold shadow-md">
                    {isSubmitting ? 'Preparando...' : 'Abrir proposta teste'} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
