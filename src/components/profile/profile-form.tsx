'use client'

import { useState } from 'react'
import { updateProfile } from '@/app/actions/profile'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Save, Loader2, Wand2 } from 'lucide-react'
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

        // Auto-extract color from logo
        try {
            // Create an image element to load the logo
            // Use proxy or CORS needs to be handled. Supabase Storage is public now.
            const colors = await extractColors(newUrl, { crossOrigin: 'anonymous' })
            if (colors && colors.length > 0) {
                // Sort by area or intensity? extract-colors returns array.
                // Let's pick the most dominant one (first one usually)
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
            await updateProfile(formData)
            toast.success('Perfil atualizado!')
        } catch (e) {
            toast.error('Erro ao atualizar.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form action={handleSubmit} className="space-y-6">
            <Card className="border-primary/10">
                <CardHeader className="bg-primary/5 border-b border-primary/10">
                    <CardTitle className="text-primary flex items-center gap-2">
                        Dados da Empresa
                        {/* Magic wand hint */}
                        {logoUrl && <Wand2 className="ml-auto h-4 w-4 text-primary/40" />}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                    <div className="flex flex-col items-center">
                        <LogoUpload
                            currentLogoUrl={logoUrl}
                            userId={userId}
                            onUploadComplete={handleLogoChange} // Need to update LogoUpload to support this callback
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                            Dica: Ao subir uma logo, detectamos automaticamente a cor da sua marca.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="businessName">Nome da Empresa</Label>
                            <Input
                                id="businessName"
                                name="businessName"
                                defaultValue={initialProfile?.business_name || ''}
                                className="focus-visible:ring-primary"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Telefone / WhatsApp</Label>
                            <Input
                                id="phone"
                                name="phone"
                                defaultValue={initialProfile?.phone || ''}
                                className="focus-visible:ring-primary"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email Comercial</Label>
                        <Input
                            id="email"
                            name="email"
                            defaultValue={initialProfile?.email}
                            placeholder="Ex: contato@minhaempresa.com"
                            className="focus-visible:ring-primary"
                        />
                        <p className="text-[10px] text-muted-foreground">Este email aparecerá nos seus orçamentos.</p>
                    </div>

                    <div className="border-t border-primary/10 pt-6">
                        <LayoutSelector
                            currentLayout={layoutStyle}
                            currentColor={themeColor}
                            onLayoutChange={setLayoutStyle}
                            onColorChange={setThemeColor}
                        />
                    </div>

                </CardContent>
            </Card>

            <div className="fixed bottom-20 left-4 right-4 md:static md:w-full md:max-w-xs md:ml-auto">
                <Button type="submit" size="lg" className="w-full shadow-xl shadow-primary/25 bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Salvar Alterações
                </Button>
            </div>
        </form>
    )
}
