'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Settings, Lock, AlignLeft, AlignCenter, AlignRight, LayoutPanelTop, PanelBottom } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface QuoteSettingsData {
    logoSize: 'small' | 'medium' | 'large'
    logoPosition: 'header' | 'footer'
    logoAlignment: 'left' | 'center' | 'right'
    footerText: string
}

interface QuoteSettingsProps {
    settings: QuoteSettingsData | null
    plan: string | null | undefined
    onChange: (settings: QuoteSettingsData) => void
}

export function QuoteSettings({ settings, plan, onChange }: QuoteSettingsProps) {
    const isFree = !plan || plan === 'free'
    const currentSettings = settings || {
        logoSize: 'medium',
        logoPosition: 'header',
        logoAlignment: 'left',
        footerText: ''
    }

    const handleChange = (key: keyof QuoteSettingsData, value: string) => {
        onChange({ ...currentSettings, [key]: value })
    }

    return (
        <Card className="border-0 shadow-sm ring-1 ring-border relative overflow-hidden">
            {isFree && (
                <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-6 text-center">
                    <div className="bg-background border shadow-lg rounded-xl p-6 max-w-sm ring-1 ring-primary/20">
                        <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                            <Lock className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold mb-2">Recurso Premium</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            A personalização avançada do layout de propostas está disponível apenas para assinantes.
                        </p>
                        <a href="/app/settings/billing" className="text-primary font-semibold text-sm hover:underline">
                            Faça um upgrade agora →
                        </a>
                    </div>
                </div>
            )}

            <CardHeader className="pb-4 border-b border-border bg-muted/30">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                        <Settings className="h-5 w-5" />
                    </div>
                    Layout Avançado
                </CardTitle>
                <CardDescription>
                    Posicionamento da logo e textos adicionais no rodapé do orçamento.
                </CardDescription>
            </CardHeader>
            <CardContent className={cn("pt-6 space-y-8", isFree && "opacity-50 pointer-events-none select-none")}>

                {/* Logo Size */}
                <div className="space-y-3">
                    <Label className="text-sm font-semibold text-foreground">Tamanho da Logo</Label>
                    <RadioGroup
                        value={currentSettings.logoSize}
                        onValueChange={(val) => handleChange('logoSize', val)}
                        className="grid grid-cols-3 gap-3"
                    >
                        {['small', 'medium', 'large'].map((size) => (
                            <div key={size}>
                                <RadioGroupItem value={size} id={`size-${size}`} className="peer sr-only" />
                                <Label
                                    htmlFor={`size-${size}`}
                                    className="flex flex-col items-center justify-center p-3 text-sm font-medium border rounded-md cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-muted text-muted-foreground peer-data-[state=checked]:text-foreground"
                                >
                                    {size === 'small' && 'Pequena'}
                                    {size === 'medium' && 'Média'}
                                    {size === 'large' && 'Grande'}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                </div>

                {/* Logo Position & Alignment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold text-foreground">Posição da Logo</Label>
                        <RadioGroup
                            value={currentSettings.logoPosition}
                            onValueChange={(val) => handleChange('logoPosition', val)}
                            className="grid grid-cols-2 gap-3"
                        >
                            {[
                                { id: 'header', label: 'Cabeçalho', icon: LayoutPanelTop },
                                { id: 'footer', label: 'Rodapé', icon: PanelBottom }
                            ].map((pos) => (
                                <div key={pos.id}>
                                    <RadioGroupItem value={pos.id} id={`pos-${pos.id}`} className="peer sr-only" />
                                    <Label
                                        htmlFor={`pos-${pos.id}`}
                                        className="flex flex-col gap-2 items-center justify-center p-3 text-sm font-medium border rounded-md cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-muted text-muted-foreground peer-data-[state=checked]:text-foreground"
                                    >
                                        <pos.icon className="h-5 w-5" />
                                        {pos.label}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-sm font-semibold text-foreground">Alinhamento</Label>
                        <RadioGroup
                            value={currentSettings.logoAlignment}
                            onValueChange={(val) => handleChange('logoAlignment', val)}
                            className="grid grid-cols-3 gap-3"
                        >
                            {[
                                { id: 'left', icon: AlignLeft },
                                { id: 'center', icon: AlignCenter },
                                { id: 'right', icon: AlignRight }
                            ].map((align) => (
                                <div key={align.id}>
                                    <RadioGroupItem value={align.id} id={`align-${align.id}`} className="peer sr-only" />
                                    <Label
                                        htmlFor={`align-${align.id}`}
                                        className="flex items-center justify-center p-3 text-sm font-medium border rounded-md cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-muted text-muted-foreground peer-data-[state=checked]:text-foreground"
                                    >
                                        <align.icon className="h-5 w-5" />
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>
                </div>

                {/* Footer Text */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <Label htmlFor="footerText" className="text-sm font-semibold text-foreground">Frase de Rodapé</Label>
                        <span className="text-xs text-muted-foreground">{currentSettings.footerText.length}/200</span>
                    </div>
                    <Textarea
                        id="footerText"
                        value={currentSettings.footerText}
                        onChange={(e) => handleChange('footerText', e.target.value.slice(0, 200))}
                        placeholder="Ex: Agradecemos a preferência! Trabalhamos sempre para o seu melhor."
                        className="resize-none h-24 focus-visible:ring-primary"
                    />
                    <p className="text-[11px] text-muted-foreground">
                        Esta mensagem aparecerá no final de todos os seus orçamentos.
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
