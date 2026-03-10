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
        <header className={cn("flex items-center justify-between mb-6 md:mb-8 gap-3", className)}>
            <div className="flex flex-1 items-center min-w-0">
                <WorkspaceSwitcher />
            </div>

            <div className="flex gap-1.5 md:gap-2 items-center shrink-0">
                <GlobalSearch />
                <NotificationBell />
            </div>
        </header>
    )
}
