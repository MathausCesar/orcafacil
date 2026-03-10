'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { Palette, Check, Lock } from 'lucide-react'

interface LayoutSelectorProps {
    currentLayout: string
    currentColor: string
    onLayoutChange: (layout: string) => void
    onColorChange: (color: string) => void
    plan?: string | null
}

export function LayoutSelector({ currentLayout, currentColor, onLayoutChange, onColorChange, plan }: LayoutSelectorProps) {

    const isFree = !plan || plan === 'free'

    const layouts = [
        { id: 'modern', name: 'Moderno', description: 'Clean, com destaque cor' },
        { id: 'professional', name: 'Profissional', description: 'Sóbrio, estruturado' },
        { id: 'classic', name: 'Clássico', description: 'Tradicional, papel' },
        { id: 'minimalist', name: 'Minimalista', description: 'Espaçado e focado no conteúdo' },
        { id: 'agency', name: 'Agência', description: 'Arredondado, cores vibrantes' },
        { id: 'impact', name: 'Impacto', description: 'Alto contraste, tons escuros' },
    ]

    const defaultColors = [
        '#0D9B5C', // Emerald
        '#2563EB', // Blue
        '#DC2626', // Red
        '#D97706', // Amber
        '#7C3AED', // Violet
        '#000000', // Black
    ]

    return (
        <div className="space-y-6">

            {/* Color Selection */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                        <Palette className="h-4 w-4" /> Cor Principal
                    </Label>
                    <span className="text-xs text-muted-foreground uppercase bg-slate-100 px-2 py-0.5 rounded font-mono">{currentColor}</span>
                </div>

                {isFree && (
                    <div className="p-4 mb-4 rounded-xl bg-muted/50 border flex items-start gap-3">
                        <Lock className="w-5 h-5 text-muted-foreground mt-0.5" />
                        <div className="text-sm text-foreground">
                            <span className="font-semibold">Detecção Automática Ativa.</span> Como usuário gratuito, extraímos a melhor cor da sua logo e ajustamos a proposta magicamente. Para escolher uma cor manual personalizada, faça o <a href="/app/settings/billing" className="text-primary font-bold hover:underline">upgrade do plano</a>.
                        </div>
                    </div>
                )}

                <div className={cn("flex flex-wrap gap-3 items-center", isFree && "opacity-50 pointer-events-none")}>
                    {defaultColors.map((color) => (
                        <button
                            key={color}
                            type="button"
                            onClick={() => onColorChange(color)}
                            className={cn(
                                "h-10 w-10 rounded-full border-2 transition-all hover:scale-110",
                                currentColor === color ? "border-foreground shadow-sm scale-110 ring-2 ring-background" : "border-background shadow-sm"
                            )}
                            style={{ backgroundColor: color }}
                            aria-label={`Selecionar cor ${color}`}
                        />
                    ))}

                    <div className="relative group">
                        <input
                            type="color"
                            value={currentColor}
                            onChange={(e) => onColorChange(e.target.value)}
                            className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                        />
                        <div className={cn(
                            "h-10 w-10 rounded-full border-2 flex items-center justify-center bg-background shadow-sm transition-colors",
                            (!defaultColors.includes(currentColor) && !isFree) ? "border-foreground ring-2 ring-background" : "border-border hover:border-foreground/50"
                        )}>
                            <span className="text-sm font-bold text-muted-foreground">+</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="w-full h-px bg-border my-6"></div>

            {/* Layout Selection */}
            <div className="space-y-3">
                <Label className="text-sm font-medium text-foreground">Estilo do Orçamento</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {layouts.map((layout) => (
                        <div
                            key={layout.id}
                            onClick={() => onLayoutChange(layout.id)}
                            className={cn(
                                "relative flex flex-col justify-between p-4 rounded-xl border-2 cursor-pointer transition-all hover:bg-slate-50",
                                currentLayout === layout.id
                                    ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                                    : "border-slate-200 bg-white hover:border-slate-300"
                            )}
                        >
                            {currentLayout === layout.id && <div className="absolute top-2 right-2 text-primary"><Check className="h-4 w-4" /></div>}

                            <div className="space-y-1 mb-3">
                                <div className="font-semibold text-foreground text-sm">{layout.name}</div>
                                <div className="text-xs text-muted-foreground">{layout.description}</div>
                            </div>

                            {/* Mini Preview */}
                            <div className="h-32 w-full bg-muted/30 rounded-lg border overflow-hidden relative pointer-events-none mt-2">
                                {layout.id === 'modern' && (
                                    <div className="p-3 space-y-3 h-full flex flex-col">
                                        <div className="h-4 w-1/3 rounded opacity-80" style={{ backgroundColor: currentColor }}></div>
                                        <div className="flex-1 bg-background shadow-sm rounded border p-2">
                                            <div className="h-2 w-1/2 bg-muted mb-2 rounded-sm"></div>
                                            <div className="h-2 w-3/4 bg-muted rounded-sm"></div>
                                        </div>
                                    </div>
                                )}
                                {layout.id === 'professional' && (
                                    <div className="p-3 space-y-3 h-full flex flex-col">
                                        <div className="flex justify-between items-center border-b pb-2">
                                            <div className="h-4 w-1/4 bg-foreground rounded-sm"></div>
                                            <div className="h-4 w-4 rounded-full opacity-80" style={{ backgroundColor: currentColor }}></div>
                                        </div>
                                        <div className="flex-1 bg-background border rounded-sm"></div>
                                    </div>
                                )}
                                {layout.id === 'classic' && (
                                    <div className="p-4 text-center h-full flex flex-col items-center">
                                        <div className="h-4 w-1/2 bg-foreground mb-3 rounded-sm"></div>
                                        <div className="w-full h-px bg-border mb-2"></div>
                                        <div className="w-full h-px bg-border"></div>
                                    </div>
                                )}
                                {layout.id === 'minimalist' && (
                                    <div className="p-4 bg-background h-full flex flex-col items-start gap-3">
                                        <div className="h-1.5 w-1/5 rounded-full" style={{ backgroundColor: currentColor }}></div>
                                        <div className="h-3 w-1/3 bg-muted rounded-sm mt-1"></div>
                                        <div className="h-1.5 w-full bg-muted/50 mt-3 rounded-full"></div>
                                    </div>
                                )}
                                {layout.id === 'agency' && (
                                    <div className="p-3 h-full flex flex-col gap-2 items-center bg-muted/30">
                                        <div className="w-[90%] h-6 rounded-full opacity-90" style={{ backgroundColor: currentColor }}></div>
                                        <div className="w-full bg-background rounded-xl flex-1 shadow-sm border"></div>
                                    </div>
                                )}
                                {layout.id === 'impact' && (
                                    <div className="p-3 space-y-3 h-full flex flex-col bg-slate-900">
                                        <div className="h-4 w-1/3 rounded-sm opacity-100" style={{ backgroundColor: currentColor }}></div>
                                        <div className="flex-1 bg-slate-800 rounded-sm border border-slate-700"></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    )
}
