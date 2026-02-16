import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { NotificationBell } from "@/components/notifications/notification-bell"
import { GlobalSearch } from './global-search'
import { cn } from '@/lib/utils'

interface HeaderProps {
    title: string;
    profileImage?: string | null;
    className?: string;
}

export function DashboardHeader({ title, profileImage, className }: HeaderProps) {
    return (
        <header className={cn("flex items-center justify-between mb-8", className)}>
            <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 border border-zinc-200 shadow-sm transition-all hover:scale-105">
                    <AvatarImage src={profileImage || ''} className="object-cover" />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                        {title.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Bem-vindo(a)</p>
                    <h1 className="text-xl font-bold tracking-tight text-foreground leading-none">{title}</h1>
                </div>
            </div>

            <div className="flex gap-2 items-center">
                <GlobalSearch />
                <NotificationBell />
            </div>
        </header>
    )
}
