'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, PlusCircle, Users, Settings, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BottomNav() {
    const pathname = usePathname()

    const links = [
        {
            href: '/',
            label: 'Início',
            icon: Home,
        },
        {
            href: '/quotes',
            label: 'Orçamentos',
            icon: FileText,
        },
        {
            href: '/new',
            label: 'Novo',
            icon: PlusCircle,
            highlight: true,
        },
        {
            href: '/clients',
            label: 'Clientes',
            icon: Users,
        },
        {
            href: '/profile',
            label: 'Perfil',
            icon: Settings,
        },
    ]

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-primary/10 h-auto pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.04)]">
            <div className="container max-w-2xl mx-auto flex h-16 items-center justify-around px-2">
                {links.map((link) => {
                    const isActive = pathname === link.href
                    const Icon = link.icon

                    if (link.highlight) {
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="flex flex-col items-center justify-center -mt-6"
                            >
                                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary to-emerald-600 text-white shadow-lg shadow-primary/30 flex items-center justify-center transition-all active:scale-95 hover:shadow-xl hover:shadow-primary/40">
                                    <Icon className="h-7 w-7" />
                                </div>
                                <span className="text-[10px] font-semibold mt-1 text-primary">
                                    {link.label}
                                </span>
                            </Link>
                        )
                    }

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
