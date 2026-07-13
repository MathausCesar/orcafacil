'use client'

import { useState } from 'react'
import Image from 'next/image'
import { updateProfile, updateThemeColor } from '@/app/actions/profile'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Save, Loader2, Building2, Palette, Rocket, Sparkles, CheckCircle2, QrCode } from 'lucide-react'
import { LogoUpload } from '@/components/profile/logo-upload'
import { LogoIdentityPreview } from '@/components/profile/logo-identity-preview'
import { BrandKitSummary } from '@/components/profile/brand-kit-summary'
import { WorkspaceBrandingCard } from '@/components/profile/workspace-branding-card'
import { LayoutSelector } from '@/components/profile/layout-selector'
import { QuoteSettings, QuoteSettingsData } from '@/components/profile/quote-settings'
import { buildBrandKitFromLogoAnalysis, getBrandKitFromQuoteSettings, type BrandKit } from '@/lib/brand-kit'
import { DEFAULT_PROPOSAL_ACCENT, FREE_PROPOSAL_MODEL, getEntitledPlan, isFreePlan } from '@/lib/proposal-style'
import { getLayoutRecommendationFromQuoteSettings } from '@/lib/profession-layout-recommendations'
import { getWorkspaceBrandingSettings, type WorkspaceBrandingSettings } from '@/lib/workspace-branding'
import { toast } from 'sonner'
import type { LogoIdentityAnalysis } from '@/lib/color-extractor'

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
        primary_color?: string | null
        neighborhood?: string | null
        phone?: string | null
        pix_key?: string | null
        pix_key_type?: string | null
        pix_recipient_city?: string | null
        pix_recipient_name?: string | null
        plan?: string | null
        pro_trial_ends_at?: string | null
        subscription_status?: string | null
        target_margin_percent?: number | null
        quote_settings?: unknown
        state?: string | null
        theme_color?: string | null
    } | null
    userId: string
    section?: 'all' | 'company' | 'proposal'
}

export function ProfileForm({ initialProfile, userId, section = 'all' }: ProfileFormProps) {
    const [loading, setLoading] = useState(false)
    const accessPlan = getEntitledPlan(initialProfile?.plan, initialProfile?.subscription_status, initialProfile?.pro_trial_ends_at)
    const isFree = isFreePlan(accessPlan)
    const [themeColor, setThemeColor] = useState(
        isFree
            ? initialProfile?.primary_color || DEFAULT_PROPOSAL_ACCENT
            : initialProfile?.theme_color || initialProfile?.primary_color || DEFAULT_PROPOSAL_ACCENT
    )
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

    const getInitialLogoAnalysis = () => {
        const settings = getInitialSettings()
        const analysis = settings?.logoAnalysis

        if (
            analysis
            && typeof analysis === 'object'
            && !Array.isArray(analysis)
            && (analysis as Record<string, unknown>).version === 'logo-analysis-v1'
            && typeof (analysis as Record<string, unknown>).safeAccentColor === 'string'
        ) {
            return analysis as LogoIdentityAnalysis
        }

        return null
    }

    const getInitialBrandKit = (): BrandKit | null => getBrandKitFromQuoteSettings(initialProfile?.quote_settings)

    const [quoteSettings, setQuoteSettings] = useState<QuoteSettingsData | null>(getInitialSettings())
    const [logoAnalysis, setLogoAnalysis] = useState<LogoIdentityAnalysis | null>(getInitialLogoAnalysis())
    const [brandKit, setBrandKit] = useState<BrandKit | null>(getInitialBrandKit())
    const onboardingLayoutRecommendation = getLayoutRecommendationFromQuoteSettings(initialProfile?.quote_settings)
    const showCompany = section === 'all' || section === 'company'
    const showProposal = section === 'all' || section === 'proposal'
    const saveLabel = section === 'proposal' ? 'Salvar proposta' : 'Salvar perfil'
    const tipText = section === 'proposal'
        ? 'Mantenha um padrão visual profissional. Pequenas personalizações ajudam sua proposta a parecer única sem perder organização.'
        : 'Um perfil completo com logo, telefone e dados comerciais deixa seus orçamentos mais confiáveis para o cliente.'

    const handleLogoChange = (newUrl: string) => {
        setLogoUrl(newUrl)
    }

    const handleWorkspaceBrandingChange = (workspaceBranding: WorkspaceBrandingSettings) => {
        if (isFree) return

        setQuoteSettings((current) => ({
            footerText: current?.footerText || '',
            ...(current || {}),
            workspaceBranding,
        }))
    }

    const handleLogoAnalyzed = async (analysis: LogoIdentityAnalysis) => {
        setLogoAnalysis(analysis)
        setThemeColor(analysis.safeAccentColor)
        const generatedBrandKit = buildBrandKitFromLogoAnalysis(analysis)
        setBrandKit(generatedBrandKit)
        setQuoteSettings((current) => ({
            ...(current || {}),
            footerText: current?.footerText || '',
            brandKit: generatedBrandKit,
            logoAnalysis: analysis,
        }))

        if (!isFree) {
            setLayoutStyle(analysis.recommendedModel)
            const result = await updateThemeColor(analysis.safeAccentColor)
            if (result?.error) {
                toast.error('Nao foi possivel salvar a cor detectada.')
            }
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

        if (showCompany && !isFree && quoteSettings && !formData.has('quoteSettings')) {
            formData.append('quoteSettings', JSON.stringify(quoteSettings))
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
                                        onLogoAnalyzed={handleLogoAnalyzed}
                                    />
                                    <p className="text-[10px] text-center text-muted-foreground mt-2 max-w-[150px]">
                                        Dica: A cor do orçamento se adapta à sua logo.
                                    </p>
                                </div>

                                <div className="flex-1 space-y-4 w-full">
                                    <div className="rounded-xl border border-primary/15 bg-primary/5 p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                <Sparkles className="h-5 w-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-foreground">Proposta com cara de empresa</p>
                                                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                                    Envie sua logo e o Zacly prepara cores, contraste e sugestao visual para seus PDFs.
                                                </p>
                                                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground">
                                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1">
                                                        <span className="h-3 w-3 rounded-full border border-border" style={{ backgroundColor: themeColor }} />
                                                        {themeColor.toUpperCase()}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-700">
                                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                                        {logoUrl ? 'Visual pronto para propostas' : 'Envie a logo para ativar'}
                                                    </span>
                                                </div>
                                                {isFree && (
                                                    <p className="mt-2 text-[11px] leading-5 text-muted-foreground">
                                                        No plano gratis a proposta mantem a identidade Zacly. No Pro, sua marca assume os modelos visuais.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <LogoIdentityPreview
                                        analysis={logoAnalysis}
                                        businessName={businessName}
                                        logoUrl={logoUrl}
                                        fallbackColor={themeColor}
                                        isFree={isFree}
                                    />

                                    <BrandKitSummary brandKit={brandKit} isFree={isFree} />

                                    <WorkspaceBrandingCard
                                        accentColor={themeColor}
                                        businessName={businessName}
                                        isFree={isFree}
                                        logoUrl={logoUrl}
                                        settings={getWorkspaceBrandingSettings(quoteSettings)}
                                        onChange={handleWorkspaceBrandingChange}
                                    />

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

                                    <div className="border-t border-border pt-6">
                                        <div className="flex items-start gap-3">
                                            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-700">
                                                <QrCode className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-foreground">Receber sinal via Pix</p>
                                                <p className="mt-1 text-xs leading-5 text-muted-foreground">Sua chave fica na proposta apenas quando voce solicitar sinal. A Zacly nao recebe nem confirma o pagamento.</p>
                                            </div>
                                        </div>
                                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="pix_key_type">Tipo da chave</Label>
                                                <select
                                                    id="pix_key_type"
                                                    name="pix_key_type"
                                                    defaultValue={initialProfile?.pix_key_type || ''}
                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                                >
                                                    <option value="">Selecione</option>
                                                    <option value="cpf">CPF</option>
                                                    <option value="cnpj">CNPJ</option>
                                                    <option value="email">Email</option>
                                                    <option value="phone">Telefone</option>
                                                    <option value="random">Chave aleatoria</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="pix_key">Chave Pix</Label>
                                                <Input id="pix_key" name="pix_key" defaultValue={initialProfile?.pix_key || ''} placeholder="Sua chave para receber" className="h-10" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="pix_recipient_name">Nome do recebedor</Label>
                                                <Input id="pix_recipient_name" name="pix_recipient_name" defaultValue={initialProfile?.pix_recipient_name || businessName} placeholder="Nome exibido no Pix" className="h-10" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="pix_recipient_city">Cidade do recebedor</Label>
                                                <Input id="pix_recipient_city" name="pix_recipient_city" defaultValue={initialProfile?.pix_recipient_city || addressData.city} placeholder="Ex: Sao Paulo" maxLength={15} className="h-10" />
                                            </div>
                                        </div>
                                        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                <div>
                                                    <p className="text-sm font-bold text-foreground">Meta de margem nas propostas</p>
                                                    <p className="mt-1 text-xs leading-5 text-muted-foreground">O Zacly usa esse percentual como referencia nas proximas propostas para alertar antes de voce enviar.</p>
                                                </div>
                                                <div className="w-full sm:w-32">
                                                    <Label htmlFor="target_margin_percent" className="sr-only">Meta de margem</Label>
                                                    <div className="relative">
                                                        <Input
                                                            id="target_margin_percent"
                                                            name="target_margin_percent"
                                                            type="number"
                                                            min="0"
                                                            max="95"
                                                            step="1"
                                                            inputMode="decimal"
                                                            defaultValue={initialProfile?.target_margin_percent ?? 30}
                                                            disabled={isFree}
                                                            className="h-10 pr-8"
                                                        />
                                                        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm font-bold text-muted-foreground">%</span>
                                                    </div>
                                                </div>
                                            </div>
                                            {isFree && <p className="mt-3 text-xs font-semibold text-amber-800">Ajuste a sua meta no Pro. No gratuito, voce continua vendo a margem estimada de cada proposta.</p>}
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
                                plan={accessPlan}
                                recommendedLayout={logoAnalysis?.recommendedModel || onboardingLayoutRecommendation?.model}
                            />

                            <div className="w-full h-px bg-border my-6"></div>

                            <QuoteSettings
                                settings={quoteSettings}
                                plan={accessPlan}
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
                                            <Image src={logoUrl} alt="Logo" fill className="object-contain p-2" />
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
