"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight, CheckCircle2, CreditCard, FileText, Home, Loader2, RotateCcw } from "lucide-react"
import { useOnboarding } from "@/components/onboarding/onboarding-context"
import { applyOnboardingKit } from "@/app/actions/onboarding"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { captureActivationStage, captureConversion, captureEvent, captureException } from "@/lib/analytics"

const SETUP_TIMEOUT_MS = 20000

export function LoadingSuccess() {
    const { data, prevStep } = useOnboarding()
    const [progress, setProgress] = useState(0)
    const [status, setStatus] = useState("Iniciando setup...")
    const [complete, setComplete] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [retryCount, setRetryCount] = useState(0)

    useEffect(() => {
        let active = true

        const runSetup = async () => {
            setError(null)
            setProgress(10)
            setStatus("Identificando perfil...")

            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                if (active) setError("Usuario nao identificado. Entre novamente para concluir.")
                return
            }

            setProgress(35)
            setStatus("Separando itens do seu oficio...")
            await new Promise(resolve => setTimeout(resolve, 350))
            if (!active) return

            setProgress(65)
            setStatus(`Montando a base para ${data.category?.name || "seu negocio"}...`)
            const res = await applyOnboardingKit(
                data.category!.id,
                data.specialties,
                data.pricingTier!,
                {
                    businessName: data.businessName,
                    phone: data.phone,
                    documentType: data.documentType,
                    document: data.document,
                    email: data.email,
                    logoUrl: data.logoUrl,
                    themeColor: data.themeColor,
                },
                {
                    intendedPlan: data.intendedPlan,
                    attribution: data.attribution,
                },
            )

            if (!active) return
            if (res.success) {
                captureConversion("onboarding_completed", {
                    category_id: data.category?.id,
                    category_name: data.category?.name,
                    specialty_count: data.specialties.length,
                    pricing_tier: data.pricingTier,
                    intended_plan: data.intendedPlan || 'none',
                })
                captureActivationStage("onboarded_no_quote", {
                    category_id: data.category?.id,
                    category_name: data.category?.name,
                    specialty_count: data.specialties.length,
                    pricing_tier: data.pricingTier,
                    source: "onboarding_success",
                })
                setProgress(100)
                setStatus("Catalogo inicial criado.")
                setComplete(true)
            } else {
                console.error("Onboarding error:", res.error)
                setError(typeof res.error === "string" ? res.error : "Nao foi possivel concluir o onboarding.")
            }
        }

        const timeoutId = setTimeout(() => {
            if (!active) return
            active = false
            captureException(new Error("onboarding_setup_timeout"), {
                source: "loading_success",
                category_id: data.category?.id,
            })
            setError("Isso esta demorando mais que o esperado. Tente novamente.")
        }, SETUP_TIMEOUT_MS)

        runSetup()
            .catch((err) => {
                if (!active) return
                captureException(err, { source: "loading_success", category_id: data.category?.id })
                setError("Nao foi possivel concluir o onboarding. Tente novamente.")
            })
            .finally(() => {
                clearTimeout(timeoutId)
            })

        return () => {
            active = false
            clearTimeout(timeoutId)
        }
    }, [data, retryCount])

    const testQuoteHref = "/new?quick=1&starter=1&guided=proposal_test&source=onboarding_success"
    const selectedPlanLabel = data.intendedPlan === 'yearly' ? 'Pro Anual' : 'Pro Mensal'

    return (
        <div className="mx-auto w-full max-w-md space-y-8 p-4 text-center">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
                {complete ? <div className="mb-6 flex justify-center"><CheckCircle2 className="h-24 w-24 text-green-500" /></div> : (
                    <div className="relative mb-6 flex justify-center"><Loader2 className="h-24 w-24 animate-spin text-primary" /><div className="absolute inset-0 flex items-center justify-center text-xs font-bold">{progress}%</div></div>
                )}
            </motion.div>

            <div className="space-y-2">
                <h2 className="text-2xl font-bold">{complete ? "Sua base esta pronta" : error ? "Algo impediu a conclusao" : "Quase la..."}</h2>
                <p className="text-muted-foreground">{complete ? "Agora vem a parte importante: ver uma proposta pronta com itens do seu oficio." : error || status}</p>
            </div>

            {!complete && !error && <Progress value={progress} className="h-2 w-full" />}

            {complete && (
                <div className="space-y-3">
                    {data.intendedPlan ? (
                        <>
                            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-left">
                                <p className="text-sm font-bold text-foreground">Voce escolheu o {selectedPlanLabel}.</p>
                                <p className="mt-1 text-xs leading-5 text-muted-foreground">Seu plano ficou salvo. Primeiro, veja uma proposta pronta com itens do seu oficio.</p>
                            </div>
                            <Link href={testQuoteHref} onClick={() => captureEvent("activation_cta_clicked", { source: "onboarding_success", cta: "create_test_quote", category_id: data.category?.id, intended_plan: data.intendedPlan })}>
                                <Button className="h-12 w-full font-semibold"><FileText className="mr-2 h-4 w-4" /> Criar proposta teste da minha oficina <ArrowRight className="ml-2 h-4 w-4" /></Button>
                            </Link>
                            <Link href={`/pricing?plan=${data.intendedPlan}&source=onboarding_selected_plan`}><Button variant="outline" className="h-11 w-full"><CreditCard className="mr-2 h-4 w-4" /> Ver o plano escolhido</Button></Link>
                        </>
                    ) : (
                        <>
                            <Link href={testQuoteHref} onClick={() => captureEvent("activation_cta_clicked", { source: "onboarding_success", cta: "create_test_quote", category_id: data.category?.id })}>
                                <Button className="h-12 w-full font-semibold"><FileText className="mr-2 h-4 w-4" /> Criar proposta teste da minha oficina <ArrowRight className="ml-2 h-4 w-4" /></Button>
                            </Link>
                            <Link href="/"><Button variant="outline" className="h-11 w-full"><Home className="mr-2 h-4 w-4" /> Ir ao painel</Button></Link>
                        </>
                    )}
                </div>
            )}

            {error && (
                <div className="space-y-2">
                    <Button type="button" onClick={() => setRetryCount((count) => count + 1)} className="w-full"><RotateCcw className="mr-2 h-4 w-4" /> Tentar novamente</Button>
                    <Button type="button" variant="outline" onClick={prevStep} className="w-full">Revisar dados</Button>
                </div>
            )}
        </div>
    )
}
