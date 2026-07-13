"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { CheckCircle2, Zap, Loader2, TrendingDown } from "lucide-react"
import { toast } from "sonner"
import { usePostHog } from "posthog-js/react"
import { addExceptionStep, captureConversion, captureException } from "@/lib/analytics"
import {
    PRICING,
    YEARLY_MONTHLY_EQUIV as YEARLY_MONTHLY_EQUIV_VALUE,
    YEARLY_SAVINGS,
    formatNumberBR,
} from "@/lib/pricing-copy"

// Valores fixos — altere aqui se mudar o preço
const MONTHLY_PRICE = PRICING.monthly
const YEARLY_PRICE = PRICING.yearly
const YEARLY_MONTHLY_EQUIV = formatNumberBR(YEARLY_MONTHLY_EQUIV_VALUE)
const SAVINGS = formatNumberBR(YEARLY_SAVINGS)
const SUPPORT_WHATSAPP_URL = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP_URL

async function createCheckoutUrl(plan: "monthly" | "yearly"): Promise<{ url: string; checkoutStarted: boolean }> {
    const formData = new FormData()
    formData.append("plan", plan)

    const response = await fetch("/api/checkout", {
        method: "POST",
        body: formData,
    })

    if (!response.ok) {
        if (response.headers.get("content-type")?.includes("application/json")) {
            const data = await response.json()
            if (response.status === 401 && data.redirect) {
                return { url: data.redirect as string, checkoutStarted: false }
            }
            throw new Error(data.error || "Erro ao iniciar checkout.")
        }

        const error = await response.text()
        throw new Error(error || "Erro ao iniciar checkout.")
    }

    const data = await response.json()

    if (data.url) {
        return { url: data.url as string, checkoutStarted: true }
    }

    throw new Error(data.error || "URL de checkout não retornada.")
}

const FEATURES_COMMON = [
    "Orçamentos ilimitados",
    "Remoção total da marca d'água Zacly",
    "Suporte prioritário no WhatsApp",
    "Todas as customizações de layout",
]

export default function PricingPage() {
    const [loading, setLoading] = useState<"monthly" | "yearly" | null>(null)
    const searchParams = useSearchParams()
    const posthog = usePostHog()

    useEffect(() => {
        posthog.capture("pricing_viewed", {
            source: searchParams.get("source") || "direct",
        })

        if (searchParams.get("canceled") === "true") {
            posthog.capture("checkout_returned_canceled", {
                source: "pricing_page",
                requested_plan: searchParams.get("plan") || "unknown",
            })
        }
    }, [posthog, searchParams])

    const handleCheckout = async (plan: "monthly" | "yearly") => {
        setLoading(plan)
        const checkoutPayload = {
            plan,
            billing_interval: plan === "yearly" ? "year" : "month",
            source: "pricing_page",
            requested_plan: searchParams.get("plan") || "none",
            value: plan === "yearly" ? YEARLY_PRICE : MONTHLY_PRICE,
            currency: "BRL",
        }

        addExceptionStep("checkout_started", {
            ...checkoutPayload,
        })
        try {
            const checkoutResult = await createCheckoutUrl(plan)
            if (checkoutResult.checkoutStarted) {
                captureConversion("checkout_started", {
                    ...checkoutPayload,
                    transaction_id: `checkout_${plan}_${Date.now()}`,
                })
            }
            window.location.href = checkoutResult.url
        } catch (err: unknown) {
            captureException(err, {
                source: "pricing_checkout",
                plan,
                billing_interval: plan === "yearly" ? "year" : "month",
            })
            posthog.capture("checkout_start_failed", {
                plan,
                billing_interval: plan === "yearly" ? "year" : "month",
                source: "pricing_page",
            })
            const message = err instanceof Error ? err.message : "Não foi possível abrir o checkout. Tente novamente."
            toast.error(message)
            setLoading(null)
        }
    }

    return (
        <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6">

            {/* Header */}
            <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
                <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
                    Escolha seu plano
                </h1>
                <p className="text-base text-muted-foreground">
                    Libere orçamentos ilimitados e feche mais negócios com apresentação profissional.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto items-start">

                {/* ── Plano Mensal ── */}
                <div className="relative bg-slate-900 border-2 border-emerald-500 rounded-2xl p-8 shadow-2xl">
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                        <span className="bg-emerald-500 text-slate-900 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1.5 shadow-lg whitespace-nowrap">
                            <Zap className="h-3.5 w-3.5" /> Melhor para começar
                        </span>
                    </div>

                    <div className="mb-6 pt-2">
                        <h3 className="text-lg font-bold text-white">Mensal</h3>
                        <p className="text-sm text-slate-400 mt-1">
                            Teste o Pro com sua rotina, sem pagamento anual.
                        </p>
                    </div>

                    <div className="mb-6">
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-black text-white">
                                R$ {MONTHLY_PRICE.toFixed(2).replace(".", ",")}
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                            Renovação mensal. Sem pagamento anual.
                        </p>
                    </div>

                    <ul className="space-y-3 mb-8">
                        {FEATURES_COMMON.map((f, i) => (
                            <li key={i} className="flex items-start gap-3">
                                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                                <span className="text-sm text-slate-200">{f}</span>
                            </li>
                        ))}
                    </ul>

                    <button
                        onClick={() => handleCheckout("monthly")}
                        disabled={loading !== null}
                        className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading === "monthly"
                            ? <><Loader2 className="h-4 w-4 animate-spin" /> Abrindo...</>
                            : "Começar Pro Mensal"
                        }
                    </button>
                </div>

                {/* ── Plano Anual (destaque) ── */}
                <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-foreground">Anual</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Pague uma vez e fique tranquilo o ano todo.
                        </p>
                    </div>

                    {/* Preço principal */}
                    <div className="mb-2">
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black text-foreground">
                                R$ {YEARLY_MONTHLY_EQUIV.replace(".", ",")}
                            </span>
                            <span className="text-muted-foreground text-sm">/mês</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Cobrado R$ {YEARLY_PRICE.toFixed(2).replace(".", ",")} à vista no ato
                        </p>
                    </div>

                    {/* Bloco de economia — ancoragem visual */}
                    <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 mb-6">
                        <TrendingDown className="h-5 w-5 text-emerald-600 shrink-0" />
                        <div>
                            <p className="text-sm font-bold text-emerald-700">
                                Você economiza R$ {SAVINGS.replace(".", ",")} por ano
                            </p>
                            <p className="text-xs text-muted-foreground">
                                vs pagar mensalmente{" "}
                                <span className="line-through">
                                    R$ {(MONTHLY_PRICE * 12).toFixed(2).replace(".", ",")}
                                </span>
                            </p>
                        </div>
                    </div>

                    <ul className="space-y-3 mb-8">
                        {[...FEATURES_COMMON, "Acesso automático a todas as novidades do ano"].map((f, i) => (
                            <li key={i} className="flex items-start gap-3">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                                <span className="text-sm text-foreground">{f}</span>
                            </li>
                        ))}
                    </ul>

                    <button
                        onClick={() => handleCheckout("yearly")}
                        disabled={loading !== null}
                        className="w-full h-12 rounded-xl border-2 border-border bg-transparent text-foreground font-bold text-sm hover:bg-muted transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading === "yearly"
                            ? <><Loader2 className="h-4 w-4 animate-spin" /> Abrindo...</>
                            : `Assinar Anual — R$ ${YEARLY_PRICE.toFixed(2).replace(".", ",")} à vista`
                        }
                    </button>
                </div>
            </div>

            {/* Rodapé */}
            <p className="text-center mt-10 text-sm text-muted-foreground">
                Pagamento 100% seguro via{" "}
                <span className="font-semibold text-foreground">Stripe</span>.{" "}
                Dúvidas?{" "}
                <a
                    href={SUPPORT_WHATSAPP_URL || "mailto:contato@zacly.com.br"}
                    target="_blank"
                    rel="noreferrer"
                    className="underline hover:text-foreground transition-colors"
                >
                    {SUPPORT_WHATSAPP_URL ? 'Fale conosco no WhatsApp' : 'Fale conosco por email'}
                </a>
            </p>
        </div>
    )
}
