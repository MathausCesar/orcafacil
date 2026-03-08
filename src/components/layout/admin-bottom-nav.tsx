'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, MessageSquare, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

export function AdminBottomNav() {
    const pathname = usePathname()

    const links = [
        {
            href: '/',
            label: 'Voltar',
            icon: ArrowLeft,
        },
        {
            href: '/admin',
            label: 'Admin',
            icon: LayoutDashboard,
        },
        {
            href: '/admin/users',
            label: 'Usuários',
            icon: Users,
        },
        {
            href: '/admin/support',
            label: 'Suporte',
            icon: MessageSquare,
        },
    ]

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-t border-border h-auto pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.08)]">
            <div className="container max-w-2xl mx-auto flex h-16 items-center justify-around px-2">
                {links.map((link) => {
                    const isActive = link.href === '/admin'
                        ? pathname === '/admin'
                        : pathname.startsWith(link.href) && link.href !== '/'

                    const Icon = link.icon

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-0.5 transition-colors",
                                isActive ? "text-primary" : "text-muted-foreground hover:text-primary/70"
                            )}
                        >
                            <Icon className={cn("h-5 w-5", isActive && "fill-primary/15 stroke-primary")} />
                            <span className={cn(
                                "text-[10px]",
                                isActive ? "font-semibold" : "font-medium"
                            )}>{link.label}</span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
