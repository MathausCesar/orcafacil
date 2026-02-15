'use client'

import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'

export function PrintButton() {
    return (
        <Button onClick={() => window.print()} size="sm" className="gap-2">
            <Printer className="h-4 w-4" /> <span className="hidden sm:inline">Imprimir PDF</span>
        </Button>
    )
}
