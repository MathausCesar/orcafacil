'use client'

import Image from 'next/image'
import Link from 'next/link'
import { BadgeCheck, Lock, MonitorSmartphone, Palette, Sparkles } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { captureEvent } from '@/lib/analytics'
import { cn } from '@/lib/utils'
import type { WorkspaceBrandingSettings } from '@/lib/workspace-branding'

type WorkspaceBrandingCardProps = {
    accentColor: string
    businessName: string
    isFree: boolean
    logoUrl: string | null
    settings?: WorkspaceBrandingSettings
    onChange: (settings: WorkspaceBrandingSettings) => void
}

export function WorkspaceBrandingCard({
    accentColor,
    businessName,
    isFree,
    logoUrl,
    settings,
    onChange,
}: WorkspaceBrandingCardProps) {
    const isEnabled = !isFree && Boolean(settings?.enabled)
    const canEnable = Boolean(logoUrl) && !isFree

    return (
        <section className="border-t border-border pt-6" aria-labelledby="workspace-branding-title">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <MonitorSmartphone className="size-5" />
                    </div>
                    <div>
                        <h3 id="workspace-branding-title" className="text-sm font-bold text-foreground">Sua marca no app</h3>
                        <p className="mt-1 max-w-xl text-xs leading-5 text-muted-foreground">
                            Mostre sua logo no menu e aplique uma cor segura nos destaques do painel. A estrutura do Zacly continua igual para você não perder familiaridade.
                        </p>
                    </div>
                </div>

                {isFree ? (
                    <Link
                        href="/pricing?plan=monthly&source=workspace_branding_lock"
                        className="inline-flex shrink-0 items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                        onClick={() => captureEvent('workspace_branding_upgrade_clicked', { source: 'profile_workspace_branding' })}
                    >
                        <Lock className="size-3.5" />
                        Liberar no Pro
                    </Link>
                ) : null}
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_240px] lg:items-center">
                <label className={cn(
                    'flex items-start gap-3 rounded-lg border border-border p-4 transition-colors',
                    canEnable ? 'cursor-pointer hover:bg-muted/40' : 'cursor-not-allowed bg-muted/30',
                )}>
                    <Checkbox
                        checked={isEnabled}
                        disabled={!canEnable}
                        onCheckedChange={(checked) => {
                            const enabled = checked === true
                            onChange({ enabled })
                            captureEvent('workspace_branding_toggled', {
                                enabled,
                                source: 'profile_workspace_branding',
                            })
                        }}
                        className="mt-0.5"
                    />
                    <span>
                        <span className="block text-sm font-semibold text-foreground">Aplicar minha identidade ao painel</span>
                        <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                            {isFree
                                ? 'Disponível no Pro. No gratuito, o painel permanece no visual Zacly claro ou escuro.'
                                : logoUrl
                                    ? 'A alteração entra em vigor ao salvar o perfil e pode ser desfeita a qualquer momento.'
                                    : 'Envie sua logo primeiro para ativar a identidade do espaço de trabalho.'}
                        </span>
                    </span>
                </label>

                <div className="overflow-hidden rounded-lg border border-border bg-background" aria-label="Prévia do espaço de trabalho">
                    <div className="flex h-14 items-center gap-2 border-b border-border px-3" style={{ borderLeftWidth: 4, borderLeftColor: accentColor }}>
                        <div className="relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-white">
                            {logoUrl ? (
                                <Image src={logoUrl} alt="Sua logo" fill className="object-contain p-1" unoptimized />
                            ) : (
                                <Palette className="size-4 text-muted-foreground" />
                            )}
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-foreground">{businessName || 'Sua empresa'}</p>
                            <p className="text-[10px] text-muted-foreground">com Zacly</p>
                        </div>
                    </div>
                    <div className="flex h-11 items-center gap-2 px-3 text-[11px] font-semibold" style={{ color: accentColor }}>
                        <Sparkles className="size-3.5" />
                        Destaques com sua cor
                    </div>
                </div>
            </div>

            {isEnabled && canEnable ? (
                <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-emerald-700">
                    <BadgeCheck className="size-4" />
                    Identidade do espaço de trabalho pronta para ser aplicada.
                </div>
            ) : null}
        </section>
    )
}
