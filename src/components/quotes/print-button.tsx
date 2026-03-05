'use client'

import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'

export function PrintButton() {
    const handlePrint = () => {
        // window.print MUST be called synchronously to avoid popup blockers in Safari/iOS
        // Executing inside a setTimeout drops the user-interaction context.
        try {
            window.print();
        } catch (e) {
            console.error("Failed to print:", e);
        }
    }

    return (
        <Button onClick={handlePrint} size="sm" className="gap-2 print:hidden bg-zinc-900 hover:bg-zinc-800 text-white">
            <Printer className="h-4 w-4" /> <span className="hidden sm:inline">Imprimir PDF</span>
        </Button>
    )
}
