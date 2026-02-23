'use client'

import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'

export function PrintButton() {
    const handlePrint = () => {
        // iOS Safari workaround: Safari often ignores window.print() if called directly
        // due to anti-phishing/popup measures or SPA routing state.
        // We defer it slightly and use a robust approach
        setTimeout(() => {
            try {
                // Tenta o método padrão primeiro
                const result = document.execCommand('print', false, undefined);
                if (!result) {
                    // Se falhar (em navegadores modernos) tenta window.print()
                    window.print();
                }
            } catch (e) {
                // Fallback de segurança definitivo
                window.print();
            }
        }, 150);
    }

    return (
        <Button onClick={handlePrint} size="sm" className="gap-2 print:hidden bg-zinc-900 hover:bg-zinc-800 text-white">
            <Printer className="h-4 w-4" /> <span className="hidden sm:inline">Imprimir PDF</span>
        </Button>
    )
}
