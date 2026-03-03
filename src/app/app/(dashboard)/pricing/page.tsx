"use client"

import { useState } from "react"
import { CheckCircle2, Zap, Loader2, TrendingDown } from "lucide-react"
import { toast } from "sonner"

// Valores fixos — altere aqui se mudar o preço
const MONTHLY_PRICE = 49.90
const YEARLY_PRICE = 358.80
const YEARLY_MONTHLY_EQUIV = (YEARLY_PRICE / 12).toFixed(2)  // ~29.90
const SAVINGS = ((MONTHLY_PRICE * 12) - YEARLY_PRICE).toFixed(2) // ~240.00
const DISCOUNT_PCT = Math.round(((MONTHLY_PRICE * 12 - YEARLY_PRICE) / (MONTHLY_PRICE * 12)) * 100) // ~40%

async function redirectToCheckout(plan: "monthly" | "yearly") {
    const formData = new FormData()
    formData.append("plan", plan)

    const response = await fetch("/api/checkout", {
        method: "POST",
        body: formData,
    })

    if (!response.ok) {
        const error = await response.text()
        throw new Error(error || "Erro ao iniciar checkout.")
    }

    const data = await response.json()

    if (data.url) {
        window.location.href = data.url
        return
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
                <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-foreground">Mensal</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Flexibilidade total, renova todo mês.
                        </p>
                    </div>

                    <div className="mb-6">
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-black text-foreground">
                                R$ {MONTHLY_PRICE.toFixed(2).replace(".", ",")}
                            </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Renovação automática mensal • cancele a qualquer momento
                        </p>
                    </div>

                    <ul className="space-y-3 mb-8">
                        {FEATURES_COMMON.map((f, i) => (
                            <li key={i} className="flex items-start gap-3">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                                <span className="text-sm text-foreground">{f}</span>
                            </li>
                        ))}
                    </ul>

                    <button
                        onClick={() => handleCheckout("monthly")}
                        disabled={loading !== null}
                        className="w-full h-12 rounded-xl border-2 border-border bg-transparent text-foreground font-bold text-sm hover:bg-muted transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading === "monthly"
                            ? <><Loader2 className="h-4 w-4 animate-spin" /> Abrindo...</>
                            : "Assinar Mensal"
                        }
                    </button>
                </div>

                {/* ── Plano Anual (destaque) ── */}
                <div className="bg-slate-900 border-2 border-emerald-500 rounded-2xl p-8 shadow-2xl relative">

                    {/* Badge */}
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                        <span className="bg-emerald-500 text-slate-900 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest flex items-center gap-1.5 shadow-lg whitespace-nowrap">
                            <Zap className="h-3.5 w-3.5" />
                            Economize {DISCOUNT_PCT}%
                        </span>
                    </div>

                    <div className="mb-6 pt-2">
                        <h3 className="text-lg font-bold text-white">Anual</h3>
                        <p className="text-sm text-slate-400 mt-1">
                            Pague uma vez e fique tranquilo o ano todo.
                        </p>
                    </div>

                    {/* Preço principal */}
                    <div className="mb-2">
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black text-white">
                                R$ {YEARLY_MONTHLY_EQUIV.replace(".", ",")}
                            </span>
                            <span className="text-slate-400 text-sm">/mês</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                            Cobrado R$ {YEARLY_PRICE.toFixed(2).replace(".", ",")} à vista no ato
                        </p>
                    </div>

                    {/* Bloco de economia — ancoragem visual */}
                    <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 mb-6">
                        <TrendingDown className="h-5 w-5 text-emerald-400 shrink-0" />
                        <div>
                            <p className="text-sm font-bold text-emerald-400">
                                Você economiza R$ {SAVINGS.replace(".", ",")} por ano
                            </p>
                            <p className="text-xs text-slate-400">
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
                                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                                <span className="text-sm text-slate-200">{f}</span>
                            </li>
                        ))}
                    </ul>

                    <button
                        onClick={() => handleCheckout("yearly")}
                        disabled={loading !== null}
                        className="w-full h-12 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
                    href="https://wa.me/55"
                    target="_blank"
                    rel="noreferrer"
                    className="underline hover:text-foreground transition-colors"
                >
                    Fale conosco no WhatsApp
                </a>
            </p>
        </div>
    )
}
