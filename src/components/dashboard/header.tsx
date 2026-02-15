import { Button } from '@/components/ui/button'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { NotificationBell } from "@/components/notifications/notification-bell"
import { GlobalSearch } from './global-search'

interface HeaderProps {
    title: string;
    profileImage?: string | null;
}

export function DashboardHeader({ title, profileImage }: HeaderProps) {
    return (
        <header className="flex items-center justify-between mb-6 pt-2">
            <div className="flex items-center gap-3">
                <Avatar className="h-11 w-11 border-2 border-primary/20 shadow-sm ring-2 ring-primary/5">
                    <AvatarImage src={profileImage || ''} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {title.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-xs text-muted-foreground font-medium">Bem-vindo(a) 👋</p>
                    <h1 className="text-lg font-bold leading-tight text-foreground">{title}</h1>
                </div>
            </div>

            <div className="flex gap-1 items-center">
                <GlobalSearch />

                <NotificationBell />
            </div>
        </header>
    )
}
