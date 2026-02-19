'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { Home, PlusCircle, Users, Settings, FileText, LayoutDashboard, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { signout } from '@/app/actions/auth'

interface DesktopSidebarProps {
    className?: string
}

export function DesktopSidebar({ className }: DesktopSidebarProps) {
    const pathname = usePathname()

    const links = [
        {
            href: '/',
            label: 'Visão Geral',
            icon: LayoutDashboard,
        },
        {
            href: '/quotes',
            label: 'Orçamentos',
            icon: FileText,
        },
        {
            href: '/new',
            label: 'Novo Orçamento',
            icon: PlusCircle,
        },
        {
            href: '/clients',
            label: 'Meus Clientes',
            icon: Users,
        },
        {
            href: '/profile',
            label: 'Configurações',
            icon: Settings,
        },
    ]

    return (
        <div className={cn("flex flex-col h-full", className)}>
            {/* Logo Area */}
            <div className="h-20 flex items-center px-6 border-b border-slate-100/50">
                <div className="relative h-8 w-8 mr-3">
                    <Image
                        src="/logo/logo1.png"
                        alt="OrçaFácil Logo"
                        fill
                        className="object-contain"
                    />
                </div>
                <span className="font-bold text-lg tracking-tight text-slate-900">OrçaFácil</span>
            </div>

            {/* Navigation */}
            <div className="flex-1 py-6 px-3 space-y-6 overflow-y-auto">
                <div className="px-2">
                    <Link href="/new">
                        <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200/50 font-bold h-11 rounded-lg flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-md">
                            <PlusCircle className="h-4 w-4" />
                            <span>Criar Novo</span>
                        </Button>
                    </Link>
                </div>

                <nav className="space-y-1">
                    {links.map((link) => {
                        // Logic to highlight active link
                        const isActive = link.href === '/'
                            ? pathname === '/'
                            : pathname.startsWith(link.href)

                        const Icon = link.icon

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                                    isActive
                                        ? "bg-emerald-50 text-emerald-700 font-semibold"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                )}
                            >
                                <Icon className={cn(
                                    "h-5 w-5 transition-colors",
                                    isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600"
                                )} />
                                <span className="text-sm">{link.label}</span>
                                {isActive && (
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-600 rounded-r-full" />
                                )}
                            </Link>
                        )
                    })}
                </nav>
            </div>

            {/* Footer / Logout */}
            <div className="p-4 border-t border-slate-100 mt-auto">
                <form action={signout}>
                    <button
                        type="submit"
                        className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-700 transition-colors group text-sm font-medium"
                    >
                        <LogOut className="h-4 w-4 group-hover:text-red-600" />
                        <span>Sair da conta</span>
                    </button>
                </form>
            </div>
        </div>
    )
}
