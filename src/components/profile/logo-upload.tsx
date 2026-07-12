'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Camera, Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { analyzeLogoIdentity, type LogoIdentityAnalysis } from '@/lib/color-extractor'
import { buildBrandKitFromLogoAnalysis } from '@/lib/brand-kit'
import { prepareLogoFile } from '@/lib/logo-image-prep'
import { getEntitledPlan, isFreePlan } from '@/lib/proposal-style'
import { captureEvent } from '@/lib/analytics'
import type { Database, Json } from '@/types/database.types'

type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
type JsonObject = { [key: string]: Json | undefined }

interface LogoUploadProps {
    currentLogoUrl: string | null
    userId: string
    onUploadComplete?: (url: string) => void
    onColorExtracted?: (color: string) => void
    onLogoAnalyzed?: (analysis: LogoIdentityAnalysis) => void
}

function parseJsonObject(value: unknown): JsonObject {
    if (!value) return {}

    try {
        if (typeof value === 'string') {
            const parsed = JSON.parse(value)
            return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
                ? parsed as JsonObject
                : {}
        }

        return typeof value === 'object' && !Array.isArray(value)
            ? value as JsonObject
            : {}
    } catch {
        return {}
    }
}

export function LogoUpload({
    currentLogoUrl,
    userId,
    onUploadComplete,
    onColorExtracted,
    onLogoAnalyzed,
}: LogoUploadProps) {
    const [uploading, setUploading] = useState(false)
    const [extractingColor, setExtractingColor] = useState(false)
    const [previewUrl, setPreviewUrl] = useState(currentLogoUrl)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
        if (!allowedTypes.includes(file.type)) {
            toast.error('Envie uma imagem PNG, JPG ou WebP.')
            return
        }

        if (file.size > 6 * 1024 * 1024) {
            toast.error('A imagem esta muito pesada. Envie uma logo de ate 6MB.')
            return
        }

        setUploading(true)
        captureEvent('logo_upload_started', {
            file_type: file.type,
            file_size_kb: Math.round(file.size / 1024),
        })

        try {
            const preparedLogo = await prepareLogoFile(file)
            const uploadFile = preparedLogo.file

            if (uploadFile.size > 2 * 1024 * 1024) {
                toast.error('A logo ainda ficou acima de 2MB. Tente uma imagem menor.')
                return
            }

            if (preparedLogo.improved) {
                captureEvent('logo_image_improved', {
                    cropped: preparedLogo.cropped,
                    resized: preparedLogo.resized,
                    crop_ratio: preparedLogo.cropRatio,
                    original_width: preparedLogo.originalWidth,
                    original_height: preparedLogo.originalHeight,
                    output_width: preparedLogo.outputWidth,
                    output_height: preparedLogo.outputHeight,
                })
            }

            const supabase = createClient()
            const ext = uploadFile.type === 'image/png' ? 'png' : uploadFile.type === 'image/webp' ? 'webp' : 'jpg'
            const filePath = `${userId}/logo.${ext}`

            const { data: existingFiles } = await supabase.storage
                .from('logos')
                .list(userId)

            if (existingFiles && existingFiles.length > 0) {
                const filesToDelete = existingFiles.map((existingFile) => `${userId}/${existingFile.name}`)
                await supabase.storage.from('logos').remove(filesToDelete)
            }

            const { error: uploadError } = await supabase.storage
                .from('logos')
                .upload(filePath, uploadFile, { upsert: true })

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('logos')
                .getPublicUrl(filePath)

            const urlWithCacheBust = `${publicUrl}?v=${Date.now()}`

            setExtractingColor(true)
            toast.info('Analisando sua logo...', {
                description: 'Vamos detectar a cor principal para usar na identidade da proposta.',
                icon: <Sparkles className="h-4 w-4 text-amber-500" />,
            })

            let logoAnalysis: LogoIdentityAnalysis | null = null
            let extractedColor: string | null = null

            try {
                logoAnalysis = await analyzeLogoIdentity(urlWithCacheBust)
                extractedColor = logoAnalysis.safeAccentColor
            } catch (colorError) {
                console.warn('Could not extract color. Fallback to default.', colorError)
            }

            const updatePayload: ProfileUpdate = { logo_url: urlWithCacheBust }
            if (extractedColor) {
                updatePayload.primary_color = extractedColor
            }

            if (logoAnalysis) {
                const { data: currentProfile } = await supabase
                    .from('profiles')
                    .select('plan, subscription_status, pro_trial_ends_at, quote_settings')
                    .eq('id', userId)
                    .maybeSingle()

                const brandKit = buildBrandKitFromLogoAnalysis(logoAnalysis)

                updatePayload.quote_settings = {
                    ...parseJsonObject(currentProfile?.quote_settings),
                    logoAnalysis: logoAnalysis as unknown as Json,
                    brandKit: brandKit as unknown as Json,
                }

                if (!isFreePlan(getEntitledPlan(currentProfile?.plan, currentProfile?.subscription_status, currentProfile?.pro_trial_ends_at))) {
                    updatePayload.theme_color = logoAnalysis.safeAccentColor
                    updatePayload.layout_style = logoAnalysis.recommendedModel
                }
            }

            const { error: updateError } = await supabase
                .from('profiles')
                .update(updatePayload)
                .eq('id', userId)

            if (updateError) throw updateError

            setPreviewUrl(urlWithCacheBust)
            toast.success('Logo analisada e visual preparado!', {
                description: preparedLogo.improved
                    ? 'Tambem melhoramos o enquadramento da logo antes de aplicar no visual.'
                    : logoAnalysis?.warnings.length
                        ? 'A proposta vai usar sua marca com ajustes para manter a leitura.'
                        : extractedColor
                            ? 'Sua marca ja pode aparecer nos modelos de proposta.'
                            : 'A logo foi salva no seu perfil.',
            })

            onUploadComplete?.(urlWithCacheBust)
            if (extractedColor) onColorExtracted?.(extractedColor)
            if (logoAnalysis) onLogoAnalyzed?.(logoAnalysis)

            if (logoAnalysis) {
                captureEvent('logo_analysis_completed', {
                    quality_score: logoAnalysis.qualityScore,
                    confidence: logoAnalysis.confidence,
                    warning_count: logoAnalysis.warnings.length,
                    recommended_model: logoAnalysis.recommendedModel,
                    visual_tone: logoAnalysis.visualTone,
                    has_transparency: logoAnalysis.hasTransparency,
                    brand_kit_created: true,
                    image_improved: preparedLogo.improved,
                })
            }

            router.refresh()
        } catch (error) {
            console.error('Upload error:', error)
            captureEvent('logo_analysis_failed', {
                reason: error instanceof Error ? error.message : 'unknown',
            })
            toast.error('Erro ao enviar a logo.')
        } finally {
            setUploading(false)
            setExtractingColor(false)
            event.target.value = ''
        }
    }

    return (
        <div className="flex flex-col items-center gap-3">
            <div
                className="group relative h-28 w-28 cursor-pointer overflow-hidden rounded-2xl border-2 border-primary/20 bg-background shadow-sm ring-4 ring-primary/10 transition-colors hover:border-primary/50"
                onClick={() => fileInputRef.current?.click()}
            >
                {previewUrl ? (
                    <Image
                        src={previewUrl}
                        alt="Logo"
                        fill
                        className="object-contain p-3"
                        unoptimized
                    />
                ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 p-3 text-center text-xs font-semibold text-primary/60">
                        <Sparkles className="h-5 w-5" />
                        Enviar logo
                    </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition-opacity group-hover:opacity-100">
                    {(uploading || extractingColor) ? (
                        <Loader2 className="h-6 w-6 animate-spin text-white" />
                    ) : (
                        <Camera className="h-6 w-6 text-white" />
                    )}
                </div>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleUpload}
                className="hidden"
            />

            <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-primary/20 text-xs text-primary hover:bg-primary/10"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || extractingColor}
            >
                {(uploading || extractingColor) ? 'Analisando...' : previewUrl ? 'Trocar logo' : 'Enviar logo'}
            </Button>
        </div>
    )
}
