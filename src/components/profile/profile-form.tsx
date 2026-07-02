'use client'

import { useState } from 'react'
import Image from 'next/image'
import { updateProfile, updateThemeColor } from '@/app/actions/profile'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Save, Loader2, Building2, Palette, Rocket } from 'lucide-react'
import { LogoUpload } from '@/components/profile/logo-upload'
import { LayoutSelector } from '@/components/profile/layout-selector'
import { QuoteSettings, QuoteSettingsData } from '@/components/profile/quote-settings'
import { DEFAULT_PROPOSAL_ACCENT, FREE_PROPOSAL_MODEL, isFreePlan } from '@/lib/proposal-style'
import { toast } from 'sonner'
import { extractColors } from 'extract-colors'

interface ProfileFormProps {
    initialProfile: {
        address?: string | null
        address_number?: string | null
        business_name?: string | null
        cep?: string | null
        city?: string | null
        cnpj?: string | null
        complement?: string | null
        email?: string | null
        layout_style?: string | null
        logo_url?: string | null
        neighborhood?: string | null
        phone?: string | null
        plan?: string | null
        quote_settings?: unknown
        state?: string | null
        theme_color?: string | null
    } | null
    userId: string
    section?: 'all' | 'company' | 'proposal'
}

export function ProfileForm({ initialProfile, userId, section = 'all' }: ProfileFormProps) {
    const [loading, setLoading] = useState(false)
    const isFree = isFreePlan(initialProfile?.plan)
    const [themeColor, setThemeColor] = useState(isFree ? DEFAULT_PROPOSAL_ACCENT : initialProfile?.theme_color || DEFAULT_PROPOSAL_ACCENT)
    const [layoutStyle, setLayoutStyle] = useState(isFree ? FREE_PROPOSAL_MODEL : initialProfile?.layout_style || FREE_PROPOSAL_MODEL)
    const [logoUrl, setLogoUrl] = useState<string | null>(initialProfile?.logo_url || null)
    const [businessName, setBusinessName] = useState(initialProfile?.business_name || '')

    const [addressData, setAddressData] = useState({
        cep: initialProfile?.cep || '',
        address: initialProfile?.address || '',
        address_number: initialProfile?.address_number || '',
        complement: initialProfile?.complement || '',
        neighborhood: initialProfile?.neighborhood || '',
        city: initialProfile?.city || '',
        state: initialProfile?.state || ''
    })
    const [isLoadingCep, setIsLoadingCep] = useState(false)

    const handleAddressChange = (field: string, value: string) => {
        setAddressData(prev => ({ ...prev, [field]: value }))
    }

    const handleCepLookup = async (cepValue: string) => {
        const cleanCep = cepValue.replace(/\D/g, '')
        if (cleanCep.length !== 8) return

        setIsLoadingCep(true)
        try {
            const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
            const data = await res.json()
            if (!data.erro) {
                setAddressData(prev => ({
                    ...prev,
                    address: data.logradouro || prev.address,
                    neighborhood: data.bairro || prev.neighborhood,
                    city: data.localidade || prev.city,
                    state: data.uf || prev.state
                }))
                toast.success('Endereço encontrado!')
            } else {
                toast.error('CEP não encontrado')
            }
        } catch (error) {
            toast.error('Erro ao buscar CEP')
            console.error('ViaCEP Error:', error)
        } finally {
            setIsLoadingCep(false)
        }
    }
    const getInitialSettings = () => {
        if (!initialProfile?.quote_settings) return null
        if (typeof initialProfile.quote_settings === 'string') {
            try {
                return JSON.parse(initialProfile.quote_settings) as QuoteSettingsData
            } catch {
                return null
            }
        }
        return initialProfile.quote_settings as QuoteSettingsData
    }

    const [quoteSettings, setQuoteSettings] = useState<QuoteSettingsData | null>(getInitialSettings())
    const showCompany = section === 'all' || section === 'company'
    const showProposal = section === 'all' || section === 'proposal'
    const saveLabel = section === 'proposal' ? 'Salvar proposta' : 'Salvar perfil'
    const tipText = section === 'proposal'
        ? 'Mantenha um padrão visual profissional. Pequenas personalizações ajudam sua proposta a parecer única sem perder organização.'
        : 'Um perfil completo com logo, telefone e dados comerciais deixa seus orçamentos mais confiáveis para o cliente.'

    const handleLogoChange = async (newUrl: string) => {
        setLogoUrl(newUrl)

        try {
            const colors = await extractColors(newUrl, { crossOrigin: 'anonymous' })
            if (colors && colors.length > 0) {
                // Prefer a vibrant, non-neutral color
                const filtered = colors.filter(c => c.lightness > 0.15 && c.lightness < 0.85)
                const best = filtered.length > 0 ? filtered[0] : colors[0]
                const dominant = best.hex

                if (!isFree) {
                    setThemeColor(dominant)

                    // Persist immediately - user shouldn't need to click Save for color to apply
                    await updateThemeColor(dominant)

                    toast.success('Cor da marca detectada!', {
                        description: 'O tema do orcamento foi ajustado para combinar com sua logo.'
                    })
                }
            }
        } catch (e) {
            console.error('Color extraction failed', e)
        }
    }

    const handleSubmit = async (formData: FormData) => {
        setLoading(true)
        if (showProposal) {
            if (isFree) {
                formData.append('layoutStyle', FREE_PROPOSAL_MODEL)
            } else {
                formData.append('themeColor', themeColor)
                formData.append('layoutStyle', layoutStyle)
            }
            if (!isFree && quoteSettings) {
                formData.append('quoteSettings', JSON.stringify(quoteSettings))
            }
        }

        try {
            const result = await updateProfile(formData)
            if (result && result.error) {
                toast.error(`Erro: ${result.error}`)
            } else {
                toast.success('Perfil atualizado com sucesso!')
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Tente novamente.'
            toast.error(`Erro inesperado: ${message}`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form action={handleSubmit} className="pb-40 lg:pb-0">

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                {/* Main Column (2/3) */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Business Info */}
                    {showCompany && (
                    <Card className="border-0 shadow-sm ring-1 ring-border">
                        <CardHeader className="pb-4 border-b border-border">
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                                    <Building2 className="h-5 w-5" />
                                </div>
                                Identidade da Empresa
                            </CardTitle>
                            <CardDescription>
                                Informações que aparecerão no cabeçalho dos seus orçamentos.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-8">

                            {/* Logo Section */}
                            <div className="flex flex-col md:flex-row gap-6 items-start">
                                <div className="flex-shrink-0 mx-auto md:mx-0">
                                    <LogoUpload
                                        currentLogoUrl={logoUrl}
                                        userId={userId}
                                        onUploadComplete={handleLogoChange}
                                    />
                                    <p className="text-[10px] text-center text-muted-foreground mt-2 max-w-[150px]">
                                        Dica: A cor do orçamento se adapta à sua logo.
                                    </p>
                                </div>

                                <div className="flex-1 space-y-4 w-full">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="businessName">Nome da Empresa</Label>
                                            <Input
                                                id="businessName"
                                                name="businessName"
                                                defaultValue={initialProfile?.business_name || ''}
                                                onChange={(e) => setBusinessName(e.target.value)}
                                                className="focus-visible:ring-primary h-10"
                                                placeholder="Ex: Soluções Técnicas Ltda"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Telefone / WhatsApp</Label>
                                            <Input
                                                id="phone"
                                                name="phone"
                                                defaultValue={initialProfile?.phone || ''}
                                                className="focus-visible:ring-primary h-10"
                                                placeholder="(00) 00000-0000"
                                            />
                                        </div>
                                    </div>

                                    {/* --- ADDRESS DETAILS --- */}
                                    <div className="pt-6 mt-6 border-t border-border">
                                        <h4 className="text-sm font-semibold mb-4 text-foreground/80 flex items-center gap-2">
                                            Localização
                                        </h4>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                <div className="space-y-2 md:col-span-1">
                                                    <Label htmlFor="cep">CEP</Label>
                                                    <div className="relative">
                                                        <Input
                                                            id="cep"
                                                            name="cep"
                                                            value={addressData.cep}
                                                            onChange={(e) => {
                                                                let val = e.target.value.replace(/\D/g, '')
                                                                if (val.length > 5) {
                                                                    val = val.substring(0, 5) + '-' + val.substring(5, 8)
                                                                }
                                                                handleAddressChange('cep', val)
                                                                if (val.length === 9) handleCepLookup(val)
                                                            }}
                                                            className="focus-visible:ring-primary h-10 pr-8"
                                                            placeholder="00000-000"
                                                            maxLength={9}
                                                        />
                                                        {isLoadingCep && (
                                                            <Loader2 className="h-4 w-4 absolute right-3 top-3 animate-spin text-muted-foreground" />
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="space-y-2 md:col-span-3">
                                                    <Label htmlFor="address">Logradouro / Rua</Label>
                                                    <Input
                                                        id="address"
                                                        name="address"
                                                        value={addressData.address}
                                                        onChange={(e) => handleAddressChange('address', e.target.value)}
                                                        className="focus-visible:ring-primary h-10"
                                                        placeholder="Ex: Avenida Paulista"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                <div className="space-y-2 md:col-span-1">
                                                    <Label htmlFor="address_number">Número</Label>
                                                    <Input
                                                        id="address_number"
                                                        name="address_number"
                                                        value={addressData.address_number}
                                                        onChange={(e) => handleAddressChange('address_number', e.target.value)}
                                                        className="focus-visible:ring-primary h-10"
                                                        placeholder="Ex: 1000"
                                                    />
                                                </div>
                                                <div className="space-y-2 md:col-span-3">
                                                    <Label htmlFor="complement">Complemento</Label>
                                                    <Input
                                                        id="complement"
                                                        name="complement"
                                                        value={addressData.complement}
                                                        onChange={(e) => handleAddressChange('complement', e.target.value)}
                                                        className="focus-visible:ring-primary h-10"
                                                        placeholder="Ex: Sala 42, Bloco B"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="neighborhood">Bairro</Label>
                                                    <Input
                                                        id="neighborhood"
                                                        name="neighborhood"
                                                        value={addressData.neighborhood}
                                                        onChange={(e) => handleAddressChange('neighborhood', e.target.value)}
                                                        className="focus-visible:ring-primary h-10"
                                                        placeholder="Ex: Bela Vista"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="city">Cidade</Label>
                                                    <Input
                                                        id="city"
                                                        name="city"
                                                        value={addressData.city}
                                                        onChange={(e) => handleAddressChange('city', e.target.value)}
                                                        className="focus-visible:ring-primary h-10"
                                                        placeholder="Ex: São Paulo"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="state">UF</Label>
                                                    <Input
                                                        id="state"
                                                        name="state"
                                                        value={addressData.state}
                                                        onChange={(e) => handleAddressChange('state', e.target.value)}
                                                        className="focus-visible:ring-primary h-10"
                                                        placeholder="Ex: SP"
                                                        maxLength={2}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="cnpj">CNPJ</Label>
                                            <Input
                                                id="cnpj"
                                                name="cnpj"
                                                defaultValue={initialProfile?.cnpj || ''}
                                                className="focus-visible:ring-primary h-10 font-mono"
                                                placeholder="00.000.000/0000-00"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email Comercial</Label>
                                            <Input
                                                id="email"
                                                name="email"
                                                defaultValue={initialProfile?.email || ''}
                                                placeholder="Ex: contato@suaempresa.com"
                                                className="focus-visible:ring-primary h-10"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    )}

                    {/* Unified Appearance Tab */}
                    {showProposal && (
                    <Card className="shadow-sm">
                        <CardHeader className="pb-4 border-b">
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <Palette className="h-5 w-5 text-primary" />
                                Identidade da Proposta
                            </CardTitle>
                            <CardDescription>
                                Defina um padrão visual seguro para suas propostas sem comprometer a leitura.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-8">

                            <LayoutSelector
                                currentLayout={isFree ? FREE_PROPOSAL_MODEL : layoutStyle}
                                currentColor={isFree ? DEFAULT_PROPOSAL_ACCENT : themeColor}
                                onLayoutChange={(value) => setLayoutStyle(isFree ? FREE_PROPOSAL_MODEL : value)}
                                onColorChange={(value) => {
                                    if (!isFree) setThemeColor(value)
                                }}
                                plan={initialProfile?.plan}
                            />

                            <div className="w-full h-px bg-border my-6"></div>

                            <QuoteSettings
                                settings={quoteSettings}
                                plan={initialProfile?.plan}
                                onChange={setQuoteSettings}
                            />

                        </CardContent>
                    </Card>
                    )}

                </div>

                {/* Sidebar Column (1/3) - Sticky */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="sticky top-6 space-y-6">

                        {/* Status Card */}
                        <Card className="border-0 shadow-lg ring-1 ring-border bg-card overflow-hidden">
                            <div className="h-2 w-full bg-gradient-to-r from-primary to-emerald-500" />
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border relative">
                                        {logoUrl ? (
                                            <Image src={logoUrl} alt="Logo" fill className="object-cover" />
                                        ) : (
                                            <Building2 className="h-6 w-6 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-foreground line-clamp-1">{businessName || 'Sua Empresa'}</h3>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <p className="text-xs font-medium text-emerald-600">Perfil Ativo</p>
                                        </div>
                                    </div>
                                </div>

                                <Button type="submit" size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12 shadow-lg shadow-primary/10 border-0 mb-4" disabled={loading}>
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    {saveLabel}
                                </Button>

                                <p className="text-xs text-center text-muted-foreground">
                                    Última atualização: {new Date().toLocaleDateString('pt-BR')}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Tips Card */}
                        <Card className="border-0 shadow-sm ring-1 ring-blue-100 bg-blue-50/50">
                            <CardContent className="p-5">
                                <div className="flex items-start gap-3">
                                    <Rocket className="h-5 w-5 text-blue-600 mt-0.5" />
                                    <div>
                                        <h4 className="font-semibold text-blue-900 text-sm mb-1">Dica Pro</h4>
                                        <p className="text-xs text-blue-700 leading-relaxed">
                                            {tipText}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                    </div>
                </div>

                {/* Mobile Floating Button */}
                <div className="fixed bottom-[calc(4.25rem+env(safe-area-inset-bottom))] left-0 right-0 z-40 border-t border-border bg-background/95 px-3 py-3 shadow-[0_-12px_30px_rgba(15,23,42,0.12)] backdrop-blur lg:hidden">
                    <div className="mx-auto max-w-2xl">
                        <Button type="submit" size="lg" className="w-full bg-primary font-bold text-primary-foreground" disabled={loading}>
                            {loading ? 'Salvando...' : saveLabel}
                        </Button>
                    </div>
                </div>

            </div>
        </form>
    )
}
