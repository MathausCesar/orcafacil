import Link from "next/link"
import { Sparkles, ArrowRight } from "lucide-react"

export function UpgradeBanner() {
    return (
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-900 overflow-hidden shadow-lg border border-emerald-400/20 relative">
            {/* Elementos decorativos de fundo */}
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Sparkles className="h-32 w-32 text-white" />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between p-6 sm:px-8 relative z-10">
                <div className="text-left space-y-1 mb-4 sm:mb-0">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-yellow-300" />
                        Venda sem limites
                    </h3>
                    <p className="text-emerald-100/90 text-sm max-w-md">
                        Remova a marca d'água e crie orçamentos ilimitados que convertem mais clientes todos os dias.
                    </p>
                </div>

                <Link
                    href="/pricing"
                    className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center gap-2 bg-white text-emerald-800 font-bold py-3 px-6 rounded-xl shadow-md hover:bg-slate-50 transition-colors focus:ring-4 focus:ring-emerald-500/30"
                >
                    Fazer Upgrade
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
        </div>
    )
}
