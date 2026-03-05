'use client'

import Link from 'next/link'
import { useSearchParams, usePathname } from 'next/navigation'
import { LayoutList, KanbanSquare } from 'lucide-react'

export function QuotesViewToggle() {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const view = searchParams.get('view') || 'list'

    const buildHref = (newView: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('view', newView)
        return `${pathname}?${params.toString()}`
    }

    const baseClass = 'flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all'
    const activeClass = 'bg-white text-primary shadow-sm ring-1 ring-zinc-200/50'
    const inactiveClass = 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200/50'

    return (
        <div className="flex items-center bg-zinc-100/50 p-1 rounded-xl border border-zinc-200 shadow-sm">
            <Link href={buildHref('list')} className={`${baseClass} ${view === 'list' ? activeClass : inactiveClass}`}>
                <LayoutList className="h-4 w-4" />
                Lista
            </Link>
            <Link href={buildHref('pipeline')} className={`${baseClass} ${view === 'pipeline' ? activeClass : inactiveClass}`}>
                <KanbanSquare className="h-4 w-4" />
                Pipeline
            </Link>
        </div>
    )
}
