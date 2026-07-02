'use client'

import Link from 'next/link'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'
import { DEFAULT_QUOTE_APPROVAL_MESSAGE_TEMPLATE } from '@/lib/quote-share'
import {
    PROPOSAL_FONTS,
    ProposalFont,
    VISUAL_TONES,
    VisualToneId,
    isFreePlan,
    normalizeProposalFont,
    normalizeVisualTone,
} from '@/lib/proposal-style'
import { BriefcaseBusiness, Lock, MessageCircle, MessageSquareQuote, Sparkles, SquarePen } from 'lucide-react'

export interface QuoteSettingsData {
    [key: string]: unknown
    visualTone?: VisualToneId
    footerText: string
    quote_font_family?: ProposalFont
    logoSize?: 'small' | 'medium' | 'large'
    logoPosition?: 'header' | 'footer'
    logoAlignment?: 'left' | 'center' | 'right'
    whatsappMessageTemplate?: string
}

interface QuoteSettingsProps {
    settings: QuoteSettingsData | null
    plan: string | null | undefined
    onChange: (settings: QuoteSettingsData) => void
}

const toneIcons: Record<VisualToneId, typeof BriefcaseBusiness> = {
    balanced: SquarePen,
    formal: BriefcaseBusiness,
    creative: Sparkles,
}

function UpgradeLockOverlay({ title, description }: { title: string; description: string }) {
    return (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-background/85 p-6 text-center backdrop-blur-sm">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Lock className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">{title}</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
            <Link href="/pricing" className="mt-4 inline-flex text-xs font-bold text-primary hover:underline">
                Ver planos Pro
            </Link>
        </div>
    )
}

export function QuoteSettings({ settings, plan, onChange }: QuoteSettingsProps) {
    const isFree = isFreePlan(plan)
    const parsedSettings: QuoteSettingsData = {
        ...settings,
        visualTone: normalizeVisualTone(settings?.visualTone),
        footerText: settings?.footerText || '',
        quote_font_family: normalizeProposalFont(settings?.quote_font_family),
        whatsappMessageTemplate: typeof settings?.whatsappMessageTemplate === 'string' ? settings.whatsappMessageTemplate : '',
    }
    const currentSettings: QuoteSettingsData = isFree
        ? {
            ...parsedSettings,
            visualTone: 'balanced',
            footerText: '',
            quote_font_family: 'Inter',
            whatsappMessageTemplate: '',
        }
        : parsedSettings

    const updateSettings = <Key extends keyof QuoteSettingsData>(key: Key, value: QuoteSettingsData[Key]) => {
        if (isFree) return
        onChange({ ...currentSettings, [key]: value })
    }

    return (
        <div className="space-y-8">
            <section className="relative space-y-3 rounded-2xl border bg-muted/20 p-5">
                {isFree && (
                    <UpgradeLockOverlay
                        title="Tom visual Pro"
                        description="No gratis, usamos o tom equilibrado. O Pro libera propostas mais sobrias ou criativas conforme o cliente."
                    />
                )}
                <div className={cn('space-y-3', isFree && 'pointer-events-none select-none opacity-40 blur-[1px]')}>
                    <Label className="text-sm font-semibold text-foreground">Tom visual</Label>
                    <RadioGroup
                        value={currentSettings.visualTone}
                        onValueChange={(value) => updateSettings('visualTone', normalizeVisualTone(value))}
                        className="grid grid-cols-1 gap-3 md:grid-cols-3"
                    >
                        {VISUAL_TONES.map((tone) => {
                            const Icon = toneIcons[tone.id]

                            return (
                                <div key={tone.id}>
                                    <RadioGroupItem value={tone.id} id={`tone-${tone.id}`} disabled={isFree} className="peer sr-only" />
                                    <Label
                                        htmlFor={`tone-${tone.id}`}
                                        className="flex h-full cursor-pointer flex-col rounded-2xl border p-4 transition hover:bg-muted peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                                    >
                                        <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground peer-data-[state=checked]:text-primary">
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <span className="text-sm font-bold text-foreground">{tone.name}</span>
                                        <span className="mt-1 text-xs leading-5 text-muted-foreground">{tone.description}</span>
                                    </Label>
                                </div>
                            )
                        })}
                    </RadioGroup>
                </div>
            </section>

            <div className="h-px w-full bg-border" />

            <section className="relative space-y-3 rounded-2xl border bg-muted/20 p-5">
                {isFree && (
                    <UpgradeLockOverlay
                        title="Mensagem personalizada Pro"
                        description="O gratis envia a mensagem padrao de alta conversao. No Pro, cada prestador ajusta o texto ao seu jeito de vender."
                    />
                )}
                <div className={cn('space-y-3', isFree && 'pointer-events-none select-none opacity-40 blur-[1px]')}>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <Label htmlFor="whatsappMessageTemplate" className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <MessageCircle className="h-4 w-4" />
                            Mensagem de envio pelo WhatsApp
                        </Label>
                        <div className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground">
                                {currentSettings.whatsappMessageTemplate?.length || 0}/700
                            </span>
                            {!isFree && currentSettings.whatsappMessageTemplate && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updateSettings('whatsappMessageTemplate', '')}
                                >
                                    Usar padrão
                                </Button>
                            )}
                        </div>
                    </div>
                    <Textarea
                        id="whatsappMessageTemplate"
                        value={currentSettings.whatsappMessageTemplate || ''}
                        disabled={isFree}
                        onChange={(event) => updateSettings('whatsappMessageTemplate', event.target.value.slice(0, 700))}
                        placeholder={DEFAULT_QUOTE_APPROVAL_MESSAGE_TEMPLATE}
                        className="min-h-44 resize-y focus-visible:ring-primary"
                    />
                    <div className="rounded-xl border bg-muted/30 p-3 text-xs leading-5 text-muted-foreground">
                        <p className="font-semibold text-foreground">Variáveis disponíveis:</p>
                        <p className="mt-1">
                            {'{cliente}'} nome do cliente, {'{empresa}'} sua empresa, {'{total}'} valor total, {'{validade_linha}'} validade formatada e {'{link}'} link seguro de aprovação.
                        </p>
                        <p className="mt-1">
                            Se a mensagem personalizada não tiver {'{link}'}, o Zacly adiciona o link de aprovação automaticamente no final.
                        </p>
                    </div>
                </div>
            </section>

            <div className="h-px w-full bg-border" />

            <section className="relative space-y-3 rounded-2xl border bg-muted/20 p-5">
                {isFree && (
                    <UpgradeLockOverlay
                        title="Tipografia premium"
                        description="Fontes alternativas ficam disponiveis nos planos pagos para dar mais personalidade a cada proposta."
                    />
                )}

                <div className={cn('space-y-3', isFree && 'pointer-events-none select-none opacity-40 blur-[1px]')}>
                    <Label className="text-sm font-semibold text-foreground">Tipografia</Label>
                    <RadioGroup
                        value={currentSettings.quote_font_family}
                        onValueChange={(value) => updateSettings('quote_font_family', normalizeProposalFont(value))}
                        className="grid grid-cols-2 gap-3 lg:grid-cols-4"
                    >
                        {PROPOSAL_FONTS.map((font) => (
                            <div key={font}>
                                <RadioGroupItem value={font} id={`font-${font}`} disabled={isFree} className="peer sr-only" />
                                <Label
                                    htmlFor={`font-${font}`}
                                    className="flex h-20 cursor-pointer flex-col items-center justify-center rounded-xl border p-4 text-sm font-medium text-muted-foreground transition hover:bg-muted peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:text-foreground"
                                    style={{ fontFamily: font === 'Inter' ? undefined : `"${font}", sans-serif` }}
                                >
                                    <span className="mb-1 text-2xl text-foreground">Aa</span>
                                    <span className="text-xs">{font}</span>
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                </div>
            </section>

            <div className="h-px w-full bg-border" />

            <section className="relative space-y-3 rounded-2xl border bg-muted/20 p-5">
                {isFree && (
                    <UpgradeLockOverlay
                        title="Mensagem final Pro"
                        description="No Pro, voce adiciona uma assinatura final personalizada para reforcar relacionamento e proximos passos."
                    />
                )}
                <div className={cn('space-y-3', isFree && 'pointer-events-none select-none opacity-40 blur-[1px]')}>
                    <div className="flex items-center justify-between gap-4">
                        <Label htmlFor="footerText" className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <MessageSquareQuote className="h-4 w-4" />
                            Mensagem final
                        </Label>
                        <span className="text-xs text-muted-foreground">{currentSettings.footerText.length}/160</span>
                    </div>
                    <Textarea
                        id="footerText"
                        value={currentSettings.footerText}
                        disabled={isFree}
                        onChange={(event) => updateSettings('footerText', event.target.value.slice(0, 160))}
                        placeholder="Ex: Obrigado pela confiança. Será um prazer realizar este serviço."
                        className="h-24 resize-none focus-visible:ring-primary"
                    />
                </div>
            </section>
        </div>
    )
}
