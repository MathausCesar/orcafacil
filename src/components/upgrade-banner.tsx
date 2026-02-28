import Link from "next/link"
import { Sparkles, ArrowRight, TrendingUp } from "lucide-react"

interface UpgradeBannerProps {
    quotesUsed?: number
    quotesLimit?: number
}

export function UpgradeBanner({ quotesUsed = 0, quotesLimit = 5 }: UpgradeBannerProps) {
    const remaining = quotesLimit - quotesUsed
    const isNearLimit = remaining <= 2
    const isAtLimit = remaining <= 0

    let message = `Você já usou ${quotesUsed} de ${quotesLimit} orçamentos gratuitos. Desbloqueie tudo por menos de R$ 1,00/dia.`
    if (isAtLimit) {
        message = `🚫 Limite atingido! Você já criou ${quotesLimit} orçamentos. Faça upgrade para continuar vendendo sem parar.`
    } else if (isNearLimit) {
        message = `⚡ Restam apenas ${remaining} orçamento${remaining !== 1 ? 's' : ''} grátis. Não perca vendas — remova a marca d'água e crie ilimitados.`
    }

    return (
        <div className={`mb-6 rounded-2xl overflow-hidden shadow-lg border relative ${isAtLimit
                ? 'bg-gradient-to-r from-red-700 to-red-950 border-red-400/20'
                : isNearLimit
                    ? 'bg-gradient-to-r from-amber-600 to-amber-900 border-amber-400/20'
                    : 'bg-gradient-to-r from-emerald-600 to-emerald-900 border-emerald-400/20'
            }`}>
            {/* Elemento decorativo */}
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <TrendingUp className="h-32 w-32 text-white" />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between p-5 sm:px-8 relative z-10 gap-4">
                <div className="text-left space-y-1">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-yellow-300 shrink-0" />
                        {isAtLimit ? 'Limite atingido — Faça Upgrade' : 'Venda sem limites com a Zacly Pro'}
                    </h3>
                    <p className="text-white/80 text-sm max-w-lg">
                        {message}
                    </p>
                </div>

                <Link
                    href="/pricing"
                    className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 bg-white text-emerald-800 font-bold py-3 px-6 rounded-xl shadow-md hover:bg-slate-50 transition-colors focus:ring-4 focus:ring-emerald-500/30 whitespace-nowrap"
                >
                    Ver Planos
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
        </div>
    )
}
