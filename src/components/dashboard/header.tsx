import { NotificationBell } from "@/components/notifications/notification-bell"
import { GlobalSearch } from './global-search'
import { cn } from '@/lib/utils'
import { WorkspaceSwitcher } from '@/components/layout/workspace-switcher'

interface HeaderProps {
    title: string;
    profileImage?: string | null;
    className?: string;
}

export function DashboardHeader({ className }: HeaderProps) {
    return (
        <header className={cn("flex items-center justify-between mb-8", className)}>
            <div className="flex items-center gap-4 w-full max-w-sm">
                <WorkspaceSwitcher />
            </div>

            <div className="flex gap-2 items-center">
                <GlobalSearch />
                <NotificationBell />
            </div>
        </header>
    )
}
