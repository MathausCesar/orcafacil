import { NotificationBell } from "@/components/notifications/notification-bell"
import { GlobalSearch } from './global-search'
import { cn } from '@/lib/utils'
import { WorkspaceSwitcher } from '@/components/layout/workspace-switcher'
import Link from 'next/link'
import { Settings } from 'lucide-react'

interface HeaderProps {
    title: string;
    profileImage?: string | null;
    className?: string;
}

export function DashboardHeader({ title, className }: HeaderProps) {
    return (
        <header className={cn("flex items-center justify-between mb-6 md:mb-8 gap-3", className)}>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
                <p className="truncate text-sm font-bold text-foreground lg:hidden">{title}</p>
                <WorkspaceSwitcher />
            </div>

            <div className="flex gap-1.5 md:gap-2 items-center shrink-0">
                <GlobalSearch />
                <NotificationBell />
                <Link
                    href="/profile"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
                    aria-label="Abrir configurações"
                >
                    <Settings className="h-4 w-4" />
                </Link>
            </div>
        </header>
    )
}
