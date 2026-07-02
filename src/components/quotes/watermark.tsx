import { cn } from "@/lib/utils"

interface WatermarkProps {
    className?: string;
}

export function Watermark({ className }: WatermarkProps) {
    return (
        <div className={cn("pointer-events-none absolute inset-0 z-20 overflow-hidden", className)}>
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center justify-center -rotate-45 select-none opacity-[0.055] print:opacity-[0.075]">
                    {/* Marca d'agua do plano gratis. Baixa opacidade para nao competir com o orcamento. */}
                    <div className="text-[120px] sm:text-[180px] font-black tracking-tighter text-slate-900 leading-none">
                        ZACLY
                    </div>
                    <div className="text-[120px] sm:text-[180px] font-black tracking-tighter text-slate-900 leading-none mt-[-40px]">
                        ZACLY
                    </div>
                    <div className="text-[120px] sm:text-[180px] font-black tracking-tighter text-slate-900 leading-none mt-[-40px]">
                        ZACLY
                    </div>
                </div>
            </div>

            <div className="absolute bottom-4 left-4 right-4 mx-auto max-w-3xl rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-center text-xs font-bold text-slate-700 shadow-sm print:bg-white">
                Proposta gerada gratuitamente com Zacly - gestao simples para orcamentos em zacly.com.br
            </div>
        </div>
    )
}

export function FreeProposalBrandingBanner() {
    return (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-center text-sm leading-6 text-emerald-950 print:border-slate-200 print:bg-white print:text-slate-700">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700 print:text-slate-500">
                Proposta criada com Zacly
            </p>
            <p className="mx-auto mt-2 max-w-3xl">
                Esta proposta foi gerada em um aplicativo de gestao para autonomos organizarem clientes, orcamentos e aprovacoes em um so lugar.
            </p>
            <a
                href="https://zacly.com.br"
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex rounded-full bg-emerald-600 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white transition hover:bg-emerald-700 print:hidden"
            >
                Conhecer a Zacly
            </a>
        </div>
    )
}
