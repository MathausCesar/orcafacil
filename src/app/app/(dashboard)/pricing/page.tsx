"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Zap, Loader2 } from "lucide-react"
import { toast } from "sonner"

async function redirectToCheckout(plan: "monthly" | "yearly") {
    const formData = new FormData()
    formData.append("plan", plan)

    const response = await fetch("/api/checkout", {
        method: "POST",
        body: formData,
    })

    if (response.redirected) {
        window.location.href = response.url
        return
    }

    if (!response.ok) {
        const error = await response.text()
        throw new Error(error || "Erro ao iniciar checkout.")
    }
}

export default function PricingPage() {
    const [loading, setLoading] = useState<"monthly" | "yearly" | null>(null)

    const handleCheckout = async (plan: "monthly" | "yearly") => {
        setLoading(plan)
        try {
            await redirectToCheckout(plan)
        } catch (err: any) {
            toast.error(err.message || "Não foi possível abrir o checkout. Tente novamente.")
            setLoading(null)
        }
    }

    return (
        <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
                <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
                    Profissionalize suas vendas
                </h1>
                <p className="text-lg text-muted-foreground">
                    Remova nossa marca d&apos;água e libere orçamentos ilimitados para fechar negócios com a melhor apresentação do mercado.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-center">

                {/* Plano Mensal */}
                <div className="bg-card border border-border rounded-3xl p-8 shadow-sm hover:shadow-md transition-all">
                    <h3 className="text-xl font-bold text-foreground">Plano Mensal</h3>
                    <p className="text-sm text-muted-foreground mt-2">Perfeito para começar e testar a nossa tecnologia nas suas vendas.</p>

                    <div className="my-6">
                        <span className="text-4xl font-black">R$ 49,90</span>
                        <span className="text-muted-foreground">/mês</span>
                    </div>

                    <ul className="space-y-4 mb-8">
                        {[
                            'Orçamentos ilimitados',
                            'Remoção da marca d\'água Zacly',
                            'Suporte prioritário no WhatsApp',
                            'Acesso a todas as customizações de Layout',
                        ].map((feature, i) => (
                            <li key={i} className="flex items-center gap-3">
                                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                                <span className="text-sm text-foreground font-medium">{feature}</span>
                            </li>
                        ))}
                    </ul>

                    <Button
                        onClick={() => handleCheckout("monthly")}
                        disabled={loading !== null}
                        variant="outline"
                        className="w-full font-bold h-12 border-2 hover:bg-muted"
                    >
                        {loading === "monthly" ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Abrindo...</> : "Assinar Mensal"}
                    </Button>
                </div>

                {/* Plano Anual - Destaque */}
                <div className="bg-slate-900 border-2 border-emerald-500 rounded-3xl p-8 shadow-xl relative scale-100 md:scale-105">
                    <div className="absolute top-0 right-8 transform -translate-y-1/2">
                        <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1">
                            <Zap className="h-3 w-3" /> Mais Vantajoso
                        </span>
                    </div>

                    <h3 className="text-xl font-bold text-white">Plano Anual</h3>
                    <p className="text-sm text-slate-400 mt-2">Uma economia imensa. O equivalente a apenas um cafezinho por mês.</p>

                    <div className="my-6">
                        <span className="text-4xl font-black text-white">R$ 29,90</span>
                        <span className="text-slate-400">/mês</span>
                        <p className="text-xs text-emerald-400 font-medium mt-1">Cobrado R$ 358,80 anualmente</p>
                    </div>

                    <ul className="space-y-4 mb-8">
                        {[
                            'Todas as funções do mensal inclusas',
                            'Economia de R$ 240,00 no ano',
                            'Acesso automático às novas atualizações gratuitas',
                            'Consultoria de layout para seus orçamentos',
                        ].map((feature, i) => (
                            <li key={i} className="flex items-center gap-3">
                                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                                <span className="text-sm text-slate-200 font-medium">{feature}</span>
                            </li>
                        ))}
                    </ul>

                    <Button
                        onClick={() => handleCheckout("yearly")}
                        disabled={loading !== null}
                        className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold h-12"
                    >
                        {loading === "yearly" ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Abrindo...</> : "Assinar Anual com Desconto"}
                    </Button>
                </div>

            </div>

            <div className="text-center mt-12 text-sm text-muted-foreground">
                Dúvidas? <a href="https://wa.me/55" target="_blank" rel="noreferrer" className="underline font-medium hover:text-foreground">Fale com a gente no WhatsApp</a>. Pagamento 100% seguro via Stripe.
            </div>
        </div>
    )
}
