'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Boxes, Home, PlusCircle, Users, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

function normalizeAppPathname(pathname: string) {
    const normalized = pathname.replace(/^\/app(?=\/|$)/, '')
    return normalized || '/'
}

export function BottomNav() {
    const pathname = normalizeAppPathname(usePathname())

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
            href: '/catalog',
            label: 'Catálogo',
            icon: Boxes,
        },
        {
            href: '/clients',
            label: 'Clientes',
            icon: Users,
        },
    ]

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-t border-border h-auto pb-safe shadow-[0_-2px_10px_rgba(0,0,0,0.08)]">
            <div className="container max-w-2xl mx-auto flex h-16 items-center justify-around px-2">
                {links.map((link) => {
                    const isActive = pathname === link.href
                    const Icon = link.icon

                    if (link.highlight) {
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="flex min-w-0 flex-col items-center justify-center -mt-6"
                                aria-current={isActive ? 'page' : undefined}
                                aria-label="Criar novo orçamento"
                            >
                                <div className="h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 flex items-center justify-center transition-all active:scale-95 hover:shadow-xl hover:shadow-primary/40">
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
                            aria-current={isActive ? 'page' : undefined}
                            className={cn(
                                "flex h-full min-w-0 flex-1 flex-col items-center justify-center space-y-0.5 transition-colors",
                                isActive ? "text-primary" : "text-muted-foreground hover:text-primary/70"
                            )}
                        >
                            <Icon className={cn("h-5 w-5", isActive && "fill-primary/15 stroke-primary")} />
                            <span className={cn(
                                "max-w-full truncate text-[10px]",
                                isActive ? "font-semibold" : "font-medium"
                            )}>{link.label}</span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
