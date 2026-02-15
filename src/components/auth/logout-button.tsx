'use client'

import { LogOut } from 'lucide-react'
import { signout } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'

export function LogoutButton() {
    return (
        <form action={signout} className="w-full">
            <Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-2"
            >
                <LogOut className="h-4 w-4" />
                Sair da conta
            </Button>
        </form>
    )
}
