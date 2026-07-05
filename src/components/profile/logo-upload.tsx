'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Camera, Loader2, Sparkles } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { analyzeLogoIdentity, type LogoIdentityAnalysis } from '@/lib/color-extractor'
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

export function LogoUpload({ currentLogoUrl, userId, onUploadComplete, onColorExtracted, onLogoAnalyzed }: LogoUploadProps) {
    const [uploading, setUploading] = useState(false)
    const [extractingColor, setExtractingColor] = useState(false)
    const [previewUrl, setPreviewUrl] = useState(currentLogoUrl)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 2 * 1024 * 1024) {
            toast.error('A imagem deve ter no máximo 2MB.')
            return
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
        if (!allowedTypes.includes(file.type)) {
            toast.error('Envie uma imagem PNG, JPG ou WebP.')
            return
        }

        setUploading(true)
        captureEvent('logo_upload_started', {
            file_type: file.type,
            file_size_kb: Math.round(file.size / 1024),
        })

        try {
            const supabase = createClient()
            const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
            const filePath = `${userId}/logo.${ext}`

            // Clean up any existing logo files to avoid orphaned files (e.g. user switches from .png to .jpg)
            const { data: existingFiles } = await supabase.storage
                .from('logos')
                .list(userId)

            if (existingFiles && existingFiles.length > 0) {
                const filesToDelete = existingFiles.map(f => `${userId}/${f.name}`)
                await supabase.storage.from('logos').remove(filesToDelete)
            }

            const { error: uploadError } = await supabase.storage
                .from('logos')
                .upload(filePath, file, { upsert: true })

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('logos')
                .getPublicUrl(filePath)

            // Add cache-busting param so browsers/CDN always fetch the new image
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
                    .select('quote_settings')
                    .eq('id', userId)
                    .maybeSingle()

                updatePayload.quote_settings = {
                    ...parseJsonObject(currentProfile?.quote_settings),
                    logoAnalysis: logoAnalysis as unknown as Json,
                }
            }

            const { error: updateError } = await supabase
                .from('profiles')
                .update(updatePayload)
                .eq('id', userId)

            if (updateError) throw updateError

            setPreviewUrl(urlWithCacheBust)
            toast.success('Logo analisada e visual preparado!', {
                description: logoAnalysis?.warnings.length
                    ? 'A proposta vai usar sua marca com ajustes para manter a leitura.'
                    : extractedColor ? 'Sua marca ja pode aparecer nos modelos de proposta.' : 'A logo foi salva no seu perfil.',
            })

            // Notify parent about new URL for color extraction
            if (onUploadComplete) {
                onUploadComplete(urlWithCacheBust)
            }
            if (extractedColor && onColorExtracted) {
                onColorExtracted(extractedColor)
            }
            if (logoAnalysis && onLogoAnalyzed) {
                onLogoAnalyzed(logoAnalysis)
            }
            if (logoAnalysis) {
                captureEvent('logo_analysis_completed', {
                    quality_score: logoAnalysis.qualityScore,
                    confidence: logoAnalysis.confidence,
                    warning_count: logoAnalysis.warnings.length,
                    recommended_model: logoAnalysis.recommendedModel,
                    visual_tone: logoAnalysis.visualTone,
                    has_transparency: logoAnalysis.hasTransparency,
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
                        <Loader2 className="h-6 w-6 text-white animate-spin" />
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
                className="text-xs border-primary/20 text-primary hover:bg-primary/10"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || extractingColor}
            >
                {(uploading || extractingColor) ? 'Analisando...' : previewUrl ? 'Trocar logo' : 'Enviar logo'}
            </Button>
        </div>
    )
}
