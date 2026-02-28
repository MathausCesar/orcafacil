import { cn } from "@/lib/utils"

interface WatermarkProps {
    className?: string;
}

export function Watermark({ className }: WatermarkProps) {
    return (
        <div className={cn("pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden z-20", className)}>
            <div className="flex flex-col items-center justify-center -rotate-45 opacity-[0.03] print:opacity-[0.05]">
                {/* Repetir a marca d'água várias vezes para preencher a página */}
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

            {/* Aviso no rodapé (Apenas plano Grátis) */}
            <div className="absolute bottom-4 left-0 right-0 text-center opacity-40 print:opacity-60 text-xs sm:text-sm font-semibold text-slate-600">
                Orçamento gerado gratuitamente com zacly.com.br
            </div>
        </div>
    )
}
