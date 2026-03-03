'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CancelSubscriptionDialog } from './cancel-subscription-dialog'
import { XCircle } from 'lucide-react'

interface CancelSubscriptionButtonProps {
    isFree: boolean
}

export function CancelSubscriptionButton({ isFree }: CancelSubscriptionButtonProps) {
    const [dialogOpen, setDialogOpen] = useState(false)

    // Only show for paying users
    if (isFree) return null

    return (
        <>
            <div className="flex justify-center">
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setDialogOpen(true)}
                    className="text-xs text-muted-foreground/60 hover:text-destructive hover:bg-destructive/5 gap-1.5 transition-colors"
                >
                    <XCircle className="h-3.5 w-3.5" />
                    Cancelar assinatura
                </Button>
            </div>

            <CancelSubscriptionDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
            />
        </>
    )
}
