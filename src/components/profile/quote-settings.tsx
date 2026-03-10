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
    quote_font_family?: string
}

interface QuoteSettingsProps {
    settings: QuoteSettingsData | null
    plan: string | null | undefined
    onChange: (settings: QuoteSettingsData) => void
    userId?: string
}

export function QuoteSettings({ settings, plan, onChange, userId }: QuoteSettingsProps) {
    const isFree = !plan || plan === 'free'
    const currentSettings: QuoteSettingsData = {
        logoSize: settings?.logoSize || 'medium',
        logoPosition: settings?.logoPosition || 'header',
        logoAlignment: settings?.logoAlignment || 'left',
        footerText: settings?.footerText || '',
        quote_font_family: settings?.quote_font_family || 'Inter'
    }

    const handleChange = (key: keyof QuoteSettingsData, value: any) => {
        onChange({ ...currentSettings, [key]: value })
    }

    return (
        <Card className="border-0 shadow-sm ring-1 ring-border relative overflow-hidden">
            <CardHeader className="pb-4 border-b">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" />
                    Layout Avançado & Identidade
                </CardTitle>
                <CardDescription>
                    Posicionamento da logo e fontes personalizadas da sua marca.
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-8">

                {/* --- PREMIUM SECTION --- */}
                <div className="relative border rounded-2xl p-6 bg-muted/20 overflow-hidden">
                    {isFree && (
                        <div className="absolute inset-0 bg-background/80 z-10 flex flex-col items-center justify-center p-6 text-center backdrop-blur-sm">
                            <div className="max-w-sm flex flex-col items-center">
                                <div className="w-12 h-12 bg-muted text-muted-foreground rounded-full flex items-center justify-center mb-4">
                                    <Lock className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold mb-2">Recurso Premium</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    A tipografia premium está disponível apenas para assinantes.
                                </p>
                                <a href="/app/settings/billing" className="text-primary font-semibold text-sm hover:underline">
                                    Faça um upgrade agora →
                                </a>
                            </div>
                        </div>
                    )}

                    <div className={cn("space-y-8", isFree && "opacity-40 pointer-events-none select-none blur-[1px]")}>

                        {/* Typography Selection (Premium) */}
                        <div className="space-y-3">
                            <Label className="text-sm font-semibold text-foreground">Tipografia Principal</Label>
                            <RadioGroup
                                value={currentSettings.quote_font_family}
                                onValueChange={(val) => handleChange('quote_font_family', val)}
                                className="grid grid-cols-2 lg:grid-cols-4 gap-3"
                            >
                                {['Inter', 'Roboto', 'Playfair Display', 'Montserrat'].map((font) => (
                                    <div key={font}>
                                        <RadioGroupItem value={font} id={`font-${font}`} className="peer sr-only" />
                                        <Label
                                            htmlFor={`font-${font}`}
                                            className="flex flex-col items-center justify-center p-4 text-sm font-medium border rounded-xl cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 hover:bg-muted text-muted-foreground peer-data-[state=checked]:text-foreground h-20 transition-all"
                                            style={{ fontFamily: font === 'Inter' ? undefined : `"${font}", sans-serif` }}
                                        >
                                            <span className="text-2xl mb-1 text-foreground">Aa</span>
                                            <span className="text-xs">{font}</span>
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>
                        </div>
                    </div>
                </div>

                <div className="w-full h-px bg-border my-6"></div>

                {/* Logo Size */}
                <div className="space-y-3">
                    <Label className="text-sm font-semibold text-foreground">Tamanho da Logo na Tabela</Label>
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
                        <Label className="text-sm font-semibold text-foreground">Posição da Logo Secundária</Label>
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
