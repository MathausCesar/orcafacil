'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { WorkspaceBranding } from '@/lib/workspace-branding'

type MobileWorkspaceHeaderProps = {
    workspaceBranding: WorkspaceBranding
}

function normalizeAppPathname(pathname: string) {
    const normalized = pathname.replace(/^\/app(?=\/|$)/, '')
    return normalized || '/'
}

export function MobileWorkspaceHeader({ workspaceBranding }: MobileWorkspaceHeaderProps) {
    const pathname = normalizeAppPathname(usePathname())
    const isQuoteDetail = /^\/quotes\/[^/]+/.test(pathname)

    if (!workspaceBranding.enabled || !workspaceBranding.logoUrl || isQuoteDetail) return null

    return (
        <div className="sticky top-0 z-20 border-b border-border bg-background/95 px-3 py-2.5 backdrop-blur lg:hidden">
            <Link href="/" className="mx-auto flex max-w-2xl items-center gap-2.5">
                <div className="relative size-9 shrink-0 overflow-hidden rounded-md border border-border bg-white">
                    <Image src={workspaceBranding.logoUrl} alt={workspaceBranding.businessName} fill className="object-contain p-1" unoptimized />
                </div>
                <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-foreground">{workspaceBranding.businessName}</p>
                    <p className="text-[10px] font-medium text-muted-foreground">com Zacly</p>
                </div>
            </Link>
        </div>
    )
}
