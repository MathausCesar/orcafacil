'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { Eye, EyeOff, ImagePlus, Loader2, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { prepareEvidenceImage } from '@/lib/evidence-image-prep'
import { addQuoteEvidence, deleteQuoteEvidence, updateQuoteEvidenceVisibility } from '@/app/actions/quotes'
import { captureEvent } from '@/lib/analytics'

export type QuoteEvidenceView = {
    id: string
    fileName: string
    isClientVisible: boolean
    signedUrl?: string | null
}

type QuoteEvidenceManagerProps = {
    quoteId: string
    userId: string
    isPro: boolean
    evidences: QuoteEvidenceView[]
}

export function QuoteEvidenceManager({ quoteId, userId, isPro, evidences }: QuoteEvidenceManagerProps) {
    const inputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()
    const [uploading, setUploading] = useState(false)
    const [workingEvidenceId, setWorkingEvidenceId] = useState<string | null>(null)

    const uploadEvidence = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        if (!isPro) {
            toast.message('Fotos de referencia ficam disponiveis no Pro.')
            event.target.value = ''
            return
        }

        setUploading(true)
        try {
            const prepared = await prepareEvidenceImage(file)
            const path = `${userId}/${quoteId}/${crypto.randomUUID()}.webp`
            const supabase = createClient()
            const { error: uploadError } = await supabase.storage
                .from('quote-evidences')
                .upload(path, prepared.file, { contentType: 'image/webp', upsert: false })

            if (uploadError) throw uploadError

            try {
                await addQuoteEvidence(quoteId, {
                    storagePath: path,
                    fileName: prepared.file.name,
                    contentType: prepared.file.type,
                    fileSize: prepared.file.size,
                })
            } catch (error) {
                await supabase.storage.from('quote-evidences').remove([path])
                throw error
            }

            captureEvent('quote_evidence_upload_completed', {
                quote_id: quoteId,
                output_file_size_kb: Math.round(prepared.file.size / 1024),
                image_resized: prepared.resized,
            })
            toast.success('Foto adicionada como interna. Escolha abaixo se ela deve aparecer ao cliente.')
            router.refresh()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Nao foi possivel enviar a foto.')
        } finally {
            setUploading(false)
            event.target.value = ''
        }
    }

    const setVisibility = async (evidence: QuoteEvidenceView) => {
        setWorkingEvidenceId(evidence.id)
        try {
            await updateQuoteEvidenceVisibility(evidence.id, !evidence.isClientVisible)
            toast.success(evidence.isClientVisible ? 'Foto removida do link do cliente.' : 'Foto incluida no link do cliente.')
            router.refresh()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Nao foi possivel atualizar a foto.')
        } finally {
            setWorkingEvidenceId(null)
        }
    }

    const removeEvidence = async (evidence: QuoteEvidenceView) => {
        setWorkingEvidenceId(evidence.id)
        try {
            await deleteQuoteEvidence(evidence.id)
            toast.success('Foto removida.')
            router.refresh()
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Nao foi possivel remover a foto.')
        } finally {
            setWorkingEvidenceId(null)
        }
    }

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm print:hidden">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-black text-slate-950">Fotos de referencia</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">Mostre defeitos, medidas ou acabamento. Por padrao, a foto fica interna.</p>
                </div>
                <Button type="button" size="icon" variant="outline" onClick={() => inputRef.current?.click()} disabled={uploading || !isPro || evidences.length >= 6} title={isPro ? 'Adicionar foto' : 'Recurso Pro'}>
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                </Button>
            </div>

            {!isPro && <p className="mt-3 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">No Pro, inclua fotos na proposta e controle exatamente o que o cliente ve.</p>}
            {isPro && <p className="mt-3 text-xs text-slate-500">{evidences.length}/6 fotos nesta proposta.</p>}

            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={uploadEvidence} />

            {evidences.length > 0 && (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {evidences.map((evidence) => (
                        <div key={evidence.id} className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                            {evidence.signedUrl && <Image src={evidence.signedUrl} alt="Foto da proposta" width={480} height={256} unoptimized className="h-32 w-full object-cover" />}
                            <div className="flex items-center justify-between gap-2 p-2">
                                <span className="min-w-0 truncate text-[11px] font-semibold text-slate-600">{evidence.isClientVisible ? 'No link do cliente' : 'Somente interno'}</span>
                                <div className="flex gap-1">
                                    <Button type="button" size="icon" variant="ghost" className="h-8 w-8" title={evidence.isClientVisible ? 'Ocultar do cliente' : 'Incluir no link do cliente'} disabled={workingEvidenceId === evidence.id} onClick={() => setVisibility(evidence)}>
                                        {evidence.isClientVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </Button>
                                    <Button type="button" size="icon" variant="ghost" className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700" title="Remover foto" disabled={workingEvidenceId === evidence.id} onClick={() => removeEvidence(evidence)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    )
}
