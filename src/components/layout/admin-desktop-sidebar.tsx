'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { LayoutDashboard, Users, MessageSquare, LogOut, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { signout } from '@/app/actions/auth'

interface AdminDesktopSidebarProps {
    className?: string
}

export function AdminDesktopSidebar({ className }: AdminDesktopSidebarProps) {
    const pathname = usePathname()

    const links = [
        {
            href: '/admin',
            label: 'Visão Geral',
            icon: LayoutDashboard,
        },
        {
            href: '/admin/users',
            label: 'Usuários e Planos',
            icon: Users,
        },
        {
            href: '/admin/support',
            label: 'Suporte e Feedback',
            icon: MessageSquare,
        },
    ]

    return (
        <div className={cn("flex flex-col h-full bg-sidebar border-r border-sidebar-border", className)}>
            {/* Logo Area */}
            <div className="h-24 flex items-center justify-center border-b border-sidebar-border p-4 relative">
                <Link href="/admin" className="relative h-full w-full max-w-[150px] transition-transform hover:scale-105 active:scale-95 block">
                    <Image
                        src="/logo/logozacly.png"
                        alt="Zacly Logo"
                        fill
                        className="object-contain dark:hidden"
                        priority
                    />
                    <Image
                        src="/logo/logo.png"
                        alt="Zacly Logo"
                        fill
                        className="object-contain hidden dark:block"
                        priority
                    />
                </Link>
                <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-primary/20 text-primary text-[10px] font-bold rounded-md uppercase tracking-wider">
                    Admin
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 py-6 px-3 space-y-6 overflow-y-auto mt-4">
                <nav className="space-y-1">
                    {links.map((link) => {
                        const isActive = link.href === '/admin'
                            ? pathname === '/admin'
                            : pathname.startsWith(link.href)

                        const Icon = link.icon

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                                    isActive
                                        ? "bg-sidebar-primary/10 text-sidebar-primary font-semibold"
                                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                                )}
                            >
                                <Icon className={cn(
                                    "h-5 w-5 transition-colors",
                                    isActive ? "text-sidebar-primary" : "text-sidebar-foreground/50 group-hover:text-sidebar-accent-foreground"
                                )} />
                                <span className="text-sm">{link.label}</span>
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
                                )}
                            </Link>
                        )
                    })}
                </nav>
            </div>

            {/* Footer / Exits */}
            <div className="p-4 border-t border-sidebar-border mt-auto space-y-2">
                <Link href="/" className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sidebar-foreground/80 hover:bg-sidebar-accent transition-colors group text-sm font-medium">
                    <ArrowLeft className="h-4 w-4" />
                    <span>Voltar ao App</span>
                </Link>
                <form action={signout}>
                    <button
                        type="submit"
                        className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sidebar-foreground/80 hover:bg-destructive/10 hover:text-destructive transition-colors group text-sm font-medium"
                    >
                        <LogOut className="h-4 w-4 group-hover:text-destructive" />
                        <span>Sair da conta</span>
                    </button>
                </form>
            </div>
        </div>
    )
}
