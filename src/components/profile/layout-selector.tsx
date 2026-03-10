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
                    <div className="p-3 mb-2 rounded-lg bg-primary/5 border border-primary/20 flex items-start gap-3">
                        <Lock className="w-4 h-4 text-primary mt-0.5" />
                        <div className="text-xs text-muted-foreground">
                            <span className="font-semibold text-primary">Detecção Automática Ativa.</span> Como usuário gratuito, extraímos a melhor cor da sua logo e ajustamos a proposta magicamente. Para escolher uma cor manual personalizada, faça o <a href="/app/settings/billing" className="text-primary font-bold hover:underline">upgrade do plano</a>.
                        </div>
                    </div>
                )}

                <div className={cn("flex flex-wrap gap-3 items-center", isFree && "opacity-60 pointer-events-none")}>
                    {defaultColors.map((color) => (
                        <button
                            key={color}
                            type="button"
                            onClick={() => onColorChange(color)}
                            className={cn(
                                "h-8 w-8 rounded-full border-2 transition-all hover:scale-110",
                                currentColor === color ? "border-slate-900 shadow-md scale-110 ring-2 ring-slate-200" : "border-transparent"
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
                            "h-8 w-8 rounded-full border-2 border-slate-200 flex items-center justify-center bg-white hover:border-slate-400 transition-colors",
                            (!defaultColors.includes(currentColor) && !isFree) ? "border-slate-900" : ""
                        )}>
                            <span className="text-xs font-bold text-muted-foreground">+</span>
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
                            <div className="h-20 w-full bg-slate-50/50 rounded border border-slate-100 overflow-hidden relative pointer-events-none">
                                {layout.id === 'modern' && (
                                    <div className="p-2 space-y-2 h-full flex flex-col">
                                        <div className="h-3 w-1/3 rounded-sm opacity-80" style={{ backgroundColor: currentColor }}></div>
                                        <div className="flex-1 bg-white shadow-sm rounded-sm border border-slate-100 p-1">
                                            <div className="h-1.5 w-1/2 bg-slate-100 mb-1"></div>
                                            <div className="h-1.5 w-3/4 bg-slate-100"></div>
                                        </div>
                                    </div>
                                )}
                                {layout.id === 'professional' && (
                                    <div className="p-2 space-y-2 h-full flex flex-col">
                                        <div className="flex justify-between items-center border-b border-slate-200 pb-1">
                                            <div className="h-3 w-1/4 bg-slate-800 rounded-sm"></div>
                                            <div className="h-3 w-3 rounded-full opacity-60" style={{ backgroundColor: currentColor }}></div>
                                        </div>
                                        <div className="flex-1 bg-white border border-slate-200"></div>
                                    </div>
                                )}
                                {layout.id === 'classic' && (
                                    <div className="p-3 text-center h-full flex flex-col items-center">
                                        <div className="h-3 w-1/2 bg-slate-900 mb-2"></div>
                                        <div className="w-full h-px bg-slate-300 mb-1"></div>
                                        <div className="w-full h-px bg-slate-300"></div>
                                    </div>
                                )}
                                {layout.id === 'minimalist' && (
                                    <div className="p-3 bg-white h-full flex flex-col items-start gap-2">
                                        <div className="h-1 w-1/5" style={{ backgroundColor: currentColor }}></div>
                                        <div className="h-2 w-1/3 bg-slate-200"></div>
                                        <div className="h-1 w-full bg-slate-100 mt-2"></div>
                                    </div>
                                )}
                                {layout.id === 'agency' && (
                                    <div className="p-2 h-full flex flex-col gap-1 items-center bg-slate-100">
                                        <div className="w-[90%] h-4 rounded-full" style={{ backgroundColor: currentColor }}></div>
                                        <div className="w-full bg-white rounded-lg flex-1 shadow-sm border border-slate-200"></div>
                                    </div>
                                )}
                                {layout.id === 'impact' && (
                                    <div className="p-2 space-y-2 h-full flex flex-col bg-slate-900">
                                        <div className="h-3 w-1/3 rounded-sm opacity-100" style={{ backgroundColor: currentColor }}></div>
                                        <div className="flex-1 bg-slate-800 rounded-sm border border-slate-700 p-1"></div>
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
