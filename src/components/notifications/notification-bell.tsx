'use client'

import { useState, useEffect } from 'react'
import { Bell, Check, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { getNotifications, markAsRead, markAllAsRead } from '@/app/actions/notifications'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Notification {
    id: string
    title: string
    message: string
    read: boolean
    link: string
    type: string
    created_at: string
}

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [open, setOpen] = useState(false)
    const [hasUnread, setHasUnread] = useState(false)

    useEffect(() => {
        const fetchNotifications = async () => {
            const data = await getNotifications()
            if (data) {
                setNotifications(data as Notification[])
                setHasUnread(data.some((n: any) => !n.read))
            }
        }

        fetchNotifications()
        const interval = setInterval(fetchNotifications, 60000)
        return () => clearInterval(interval)
    }, [])

    const handleMarkRead = async (id: string) => {
        await markAsRead(id)
        setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n))
        setHasUnread(notifications.some(n => n.id !== id && !n.read))
    }

    const handleMarkAllRead = async () => {
        await markAllAsRead()
        setNotifications(notifications.map(n => ({ ...n, read: true })))
        setHasUnread(false)
    }

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-primary">
                    <Bell className="h-5 w-5" />
                    {hasUnread && (
                        <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <h4 className="font-semibold">Notificações</h4>
                    {hasUnread && (
                        <Button variant="ghost" size="xs" onClick={handleMarkAllRead} className="text-xs text-primary h-auto p-1">
                            Marcar tudo como lido
                        </Button>
                    )}
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground text-sm">
                            Nenhuma notificação.
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "p-4 hover:bg-slate-50 transition-colors flex gap-3 items-start",
                                        !notification.read && "bg-blue-50/50 hover:bg-blue-50"
                                    )}
                                >
                                    <div className={cn(
                                        "h-2 w-2 mt-2 rounded-full flex-shrink-0",
                                        !notification.read ? "bg-blue-500" : "bg-slate-300"
                                    )} />
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium leading-none">{notification.title}</p>
                                        <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                                        <div className="flex gap-2 mt-2">
                                            {notification.link && (
                                                <Link href={notification.link} onClick={() => { setOpen(false); handleMarkRead(notification.id) }}>
                                                    <Button variant="outline" size="icon" className="h-6 w-auto px-2 text-[10px] gap-1">
                                                        Ver <ExternalLink className="h-3 w-3" />
                                                    </Button>
                                                </Link>
                                            )}
                                            {!notification.read && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-auto px-2 text-[10px] gap-1 text-muted-foreground hover:text-foreground"
                                                    onClick={() => handleMarkRead(notification.id)}
                                                >
                                                    <Check className="h-3 w-3" /> Lido
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                        {formatTimeAgo(notification.created_at)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    )
}

function formatTimeAgo(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const diff = (now.getTime() - date.getTime()) / 1000

    if (diff < 60) return 'agora'
    if (diff < 3600) return `${Math.floor(diff / 60)}m`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`
    return `${Math.floor(diff / 86400)}d`
}
