'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Camera, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface LogoUploadProps {
    currentLogoUrl: string | null
    userId: string
    onUploadComplete?: (url: string) => void // New prop
}

export function LogoUpload({ currentLogoUrl, userId, onUploadComplete }: LogoUploadProps) {
    const [uploading, setUploading] = useState(false)
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

        setUploading(true)

        try {
            const supabase = createClient()
            const ext = file.name.split('.').pop()
            const filePath = `${userId}/logo.${ext}`

            const { error: uploadError } = await supabase.storage
                .from('logos')
                .upload(filePath, file, { upsert: true })

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('logos')
                .getPublicUrl(filePath)

            // Add cache-busting param
            const urlWithCacheBust = `${publicUrl}?t=${Date.now()}`

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ logo_url: publicUrl })
                .eq('id', userId)

            if (updateError) throw updateError

            setPreviewUrl(urlWithCacheBust)
            toast.success('Logo atualizada!')

            // Notify parent about new URL for color extraction
            if (onUploadComplete) {
                onUploadComplete(urlWithCacheBust) // Or raw publicUrl depending on CORS needs. Usually cache bust is fine if query param ignored.
            }

            router.refresh()
        } catch (error) {
            console.error('Upload error:', error)
            toast.error('Erro ao enviar a logo.')
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="flex flex-col items-center gap-3">
            <div
                className="relative h-24 w-24 rounded-full border-2 border-primary/20 bg-primary/5 overflow-hidden ring-4 ring-primary/10 cursor-pointer group hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
            >
                {previewUrl ? (
                    <Image
                        src={previewUrl}
                        alt="Logo"
                        fill
                        className="object-cover"
                        unoptimized
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-primary/40 text-xs text-center p-2">
                        Sem Logo
                    </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {uploading ? (
                        <Loader2 className="h-6 w-6 text-white animate-spin" />
                    ) : (
                        <Camera className="h-6 w-6 text-white" />
                    )}
                </div>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/svg+xml"
                onChange={handleUpload}
                className="hidden"
            />

            <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs border-primary/20 text-primary hover:bg-primary/10"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
            >
                {uploading ? 'Enviando...' : 'Alterar Logo'}
            </Button>
        </div>
    )
}
