'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { Boxes, PlusCircle, Users, Settings, FileText, LayoutDashboard, LogOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { signout } from '@/app/actions/auth'
import type { WorkspaceBranding } from '@/lib/workspace-branding'

interface DesktopSidebarProps {
    className?: string
    workspaceBranding?: WorkspaceBranding
}

function normalizeAppPathname(pathname: string) {
    const normalized = pathname.replace(/^\/app(?=\/|$)/, '')
    return normalized || '/'
}

export function DesktopSidebar({ className, workspaceBranding }: DesktopSidebarProps) {
    const pathname = normalizeAppPathname(usePathname())
    const activeWorkspaceBranding: (WorkspaceBranding & { logoUrl: string }) | null = workspaceBranding?.enabled
        && typeof workspaceBranding.logoUrl === 'string'
        && workspaceBranding.logoUrl.length > 0
        ? { ...workspaceBranding, logoUrl: workspaceBranding.logoUrl }
        : null

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
            href: '/catalog',
            label: 'Catálogo',
            icon: Boxes,
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
        <div className={cn("flex flex-col h-full bg-sidebar border-r border-sidebar-border", className)}>
            {/* Logo Area */}
            <div className="h-24 flex items-center justify-center border-b border-sidebar-border p-4">
                {activeWorkspaceBranding ? (
                    <Link href="/" className="flex h-full min-w-0 w-full max-w-[200px] flex-col items-center justify-center gap-1.5 transition-transform hover:scale-[1.02] active:scale-[0.98]">
                        <div className="relative h-11 w-28 overflow-hidden rounded-lg border border-sidebar-border bg-white p-1.5">
                            <Image
                                src={activeWorkspaceBranding.logoUrl}
                                alt={activeWorkspaceBranding.businessName}
                                fill
                                className="object-contain p-1"
                                unoptimized
                            />
                        </div>
                        <span className="max-w-full truncate text-xs font-bold text-sidebar-foreground">{activeWorkspaceBranding.businessName}</span>
                        <span className="text-[10px] font-medium text-sidebar-foreground/50">com Zacly</span>
                    </Link>
                ) : (
                    <Link href="/" className="relative h-full w-full max-w-[200px] transition-transform hover:scale-105 active:scale-95 block">
                        {/* Light mode logo (dark text) */}
                        <Image
                            src="/logo/logozacly.png"
                            alt="Zacly Logo"
                            fill
                            className="object-contain dark:hidden"
                            priority
                        />
                        {/* Dark mode logo (light/colored) */}
                        <Image
                            src="/logo/logo.png"
                            alt="Zacly Logo"
                            fill
                            className="object-contain hidden dark:block"
                            priority
                        />
                    </Link>
                )}
            </div>

            {/* Navigation */}
            <div className="flex-1 py-6 px-3 space-y-6 overflow-y-auto">
                <div className="px-2">
                    <Link href="/new">
                        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/30 font-bold h-11 rounded-lg flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0 active:shadow-md">
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

            {/* Footer / Logout */}
            <div className="p-4 border-t border-sidebar-border mt-auto">
                {activeWorkspaceBranding && (
                    <div className="mb-3 flex items-center justify-center gap-1 text-[10px] font-medium text-sidebar-foreground/45">
                        <span>Operado com</span>
                        <span className="font-bold text-sidebar-foreground/65">Zacly</span>
                    </div>
                )}
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
