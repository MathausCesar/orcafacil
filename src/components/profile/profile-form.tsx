'use client'

import { useState } from 'react'
import { updateProfile } from '@/app/actions/profile'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Save, Loader2, Wand2, Building2, LayoutTemplate, Palette, Rocket } from 'lucide-react'
import { LogoUpload } from '@/components/profile/logo-upload'
import { LayoutSelector } from '@/components/profile/layout-selector'
import { toast } from 'sonner'
import { extractColors } from 'extract-colors'

interface ProfileFormProps {
    initialProfile: any
    userId: string
}

export function ProfileForm({ initialProfile, userId }: ProfileFormProps) {
    const [loading, setLoading] = useState(false)
    const [themeColor, setThemeColor] = useState(initialProfile?.theme_color || '#0D9B5C')
    const [layoutStyle, setLayoutStyle] = useState(initialProfile?.layout_style || 'modern')
    const [logoUrl, setLogoUrl] = useState(initialProfile?.logo_url)

    const handleLogoChange = async (newUrl: string) => {
        setLogoUrl(newUrl)

        try {
            const colors = await extractColors(newUrl, { crossOrigin: 'anonymous' })
            if (colors && colors.length > 0) {
                const dominant = colors[0].hex
                setThemeColor(dominant)
                toast.success('Cor da marca detectada!', {
                    description: 'O tema do orçamento foi ajustado para combinar com sua logo.'
                })
            }
        } catch (e) {
            console.error('Color extraction failed', e)
        }
    }

    const handleSubmit = async (formData: FormData) => {
        setLoading(true)
        formData.append('themeColor', themeColor)
        formData.append('layoutStyle', layoutStyle)

        try {
            const result = await updateProfile(formData)
            if (result && result.error) {
                toast.error('Erro ao atualizar perfil.')
            } else {
                toast.success('Perfil atualizado com sucesso!')
            }
        } catch (e) {
            toast.error('Erro inesperado ao atualizar.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form action={handleSubmit} className="pb-24 lg:pb-0">

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                {/* Main Column (2/3) */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Business Info */}
                    <Card className="border-0 shadow-sm ring-1 ring-slate-200">
                        <CardHeader className="pb-4 border-b border-slate-100">
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
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

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Comercial</Label>
                                        <Input
                                            id="email"
                                            name="email"
                                            defaultValue={initialProfile?.email}
                                            placeholder="Ex: contato@suaempresa.com"
                                            className="focus-visible:ring-primary h-10"
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Visual Style */}
                    <Card className="border-0 shadow-sm ring-1 ring-slate-200">
                        <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/50">
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                                    <Palette className="h-5 w-5" />
                                </div>
                                Personalização Visual
                            </CardTitle>
                            <CardDescription>
                                Escolha como seus clientes verão suas propostas.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <LayoutSelector
                                currentLayout={layoutStyle}
                                currentColor={themeColor}
                                onLayoutChange={setLayoutStyle}
                                onColorChange={setThemeColor}
                            />
                        </CardContent>
                    </Card>

                </div>

                {/* Sidebar Column (1/3) - Sticky */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="sticky top-6 space-y-6">

                        {/* Status Card */}
                        <Card className="border-0 shadow-lg ring-1 ring-slate-200 bg-white overflow-hidden">
                            <div className="h-2 w-full bg-gradient-to-r from-primary to-emerald-500" />
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                                        {logoUrl ? (
                                            <img src={logoUrl} alt="Logo" className="h-full w-full object-cover" />
                                        ) : (
                                            <Building2 className="h-6 w-6 text-slate-400" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 line-clamp-1">{initialProfile?.business_name || 'Sua Empresa'}</h3>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <p className="text-xs font-medium text-emerald-600">Perfil Ativo</p>
                                        </div>
                                    </div>
                                </div>

                                <Button type="submit" size="lg" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold h-12 shadow-lg shadow-slate-900/10 border-0 mb-4" disabled={loading}>
                                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                    Salvar Alterações
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
                                            Um perfil completo com logo e cores personalizadas aumenta em 40% a taxa de aprovação dos orçamentos. Mantenha seus dados sempre atualizados.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                    </div>
                </div>

                {/* Mobile Floating Button */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t lg:hidden z-50">
                    <Button type="submit" size="lg" className="w-full bg-slate-900 text-white font-bold" disabled={loading}>
                        {loading ? 'Salvando...' : 'Salvar Perfil'}
                    </Button>
                </div>

            </div>
        </form>
    )
}
