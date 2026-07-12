'use client'

import { useMemo, useRef, useState } from 'react'
import { Check, Loader2, Mic, MicOff, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { parseVoiceProposalTranscript, type VoiceProposalSuggestion } from '@/lib/voice-proposal-parser'
import { captureEvent } from '@/lib/analytics'

type SpeechRecognitionEventLike = Event & {
    results: ArrayLike<ArrayLike<{ transcript: string }>>
}

type SpeechRecognitionLike = {
    lang: string
    interimResults: boolean
    continuous: boolean
    onresult: ((event: SpeechRecognitionEventLike) => void) | null
    onerror: (() => void) | null
    onend: (() => void) | null
    start: () => void
    stop: () => void
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike

declare global {
    interface Window {
        SpeechRecognition?: SpeechRecognitionConstructor
        webkitSpeechRecognition?: SpeechRecognitionConstructor
    }
}

type VoiceProposalAssistantProps = {
    onApply: (suggestion: VoiceProposalSuggestion) => void
}

export function VoiceProposalAssistant({ onApply }: VoiceProposalAssistantProps) {
    const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
    const [listening, setListening] = useState(false)
    const [transcript, setTranscript] = useState('')

    const suggestion = useMemo(() => parseVoiceProposalTranscript(transcript), [transcript])

    const startListening = () => {
        const Constructor = window.SpeechRecognition || window.webkitSpeechRecognition
        if (!Constructor) {
            toast.message('Seu navegador nao oferece ditado por voz. Voce pode escrever o rascunho abaixo.')
            return
        }

        const recognition = new Constructor()
        recognition.lang = 'pt-BR'
        recognition.interimResults = true
        recognition.continuous = false
        recognition.onresult = (event) => {
            let nextTranscript = ''
            for (let index = 0; index < event.results.length; index += 1) {
                nextTranscript += event.results[index][0]?.transcript || ''
            }
            setTranscript(nextTranscript.trim())
        }
        recognition.onerror = () => {
            toast.error('Nao foi possivel captar sua voz. Verifique a permissao do microfone.')
            setListening(false)
        }
        recognition.onend = () => setListening(false)

        recognitionRef.current = recognition
        try {
            recognition.start()
            setListening(true)
            captureEvent('voice_proposal_dictation_started', { source: 'quote_form' })
        } catch {
            toast.error('O ditado ja esta em uso. Tente novamente em instantes.')
        }
    }

    const stopListening = () => recognitionRef.current?.stop()

    const applySuggestion = () => {
        if (!transcript.trim()) {
            toast.error('Dite ou escreva um rascunho antes de aplicar.')
            return
        }

        onApply(suggestion)
        captureEvent('voice_proposal_review_applied', {
            source: 'quote_form',
            suggested_client: Boolean(suggestion.clientName),
            suggested_phone: Boolean(suggestion.clientPhone),
            suggested_item: Boolean(suggestion.item),
            suggested_timeline: Boolean(suggestion.estimatedDays),
        })
        toast.success('Sugestoes aplicadas. Revise os campos antes de salvar.')
        setTranscript('')
    }

    return (
        <section className="rounded-2xl border border-sky-200 bg-sky-50/70 p-4">
            <div className="flex items-start gap-3">
                <div className="rounded-xl bg-sky-600 p-2 text-white">
                    <Sparkles className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-sky-950">Montar por voz</p>
                    <p className="mt-1 text-xs leading-5 text-sky-800">
                        Fale cliente, servico, valor e prazo. O Zacly sugere os campos e voce revisa antes de usar.
                    </p>
                </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
                <Button
                    type="button"
                    size="sm"
                    className="bg-sky-700 text-white hover:bg-sky-800"
                    onClick={listening ? stopListening : startListening}
                >
                    {listening ? <MicOff className="mr-2 h-4 w-4" /> : <Mic className="mr-2 h-4 w-4" />}
                    {listening ? 'Parar ditado' : 'Ditar ou escrever'}
                </Button>
                {listening && <span className="inline-flex items-center gap-2 px-2 text-xs font-semibold text-sky-800"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Ouvindo</span>}
            </div>

            <Textarea
                value={transcript}
                onChange={(event) => setTranscript(event.target.value)}
                className="mt-3 min-h-20 border-sky-200 bg-white text-sm"
                placeholder="Ex.: Cliente Joao, troca de pastilhas, valor R$ 280, prazo 2 dias."
            />

            {transcript.trim() && (
                <div className="mt-3 rounded-xl border border-sky-200 bg-white p-3 text-xs text-slate-600">
                    <p className="font-bold text-slate-900">Revise antes de aplicar</p>
                    <div className="mt-2 grid gap-1 sm:grid-cols-2">
                        <span>Cliente: {suggestion.clientName || 'nao identificado'}</span>
                        <span>WhatsApp: {suggestion.clientPhone || 'nao identificado'}</span>
                        <span>Prazo: {suggestion.estimatedDays ? `${suggestion.estimatedDays} dias` : 'nao identificado'}</span>
                        <span>Item: {suggestion.item ? `${suggestion.item.description} - R$ ${suggestion.item.unitPrice.toFixed(2)}` : 'nao identificado'}</span>
                    </div>
                    <Button type="button" size="sm" className="mt-3" onClick={applySuggestion}>
                        <Check className="mr-2 h-4 w-4" /> Aplicar sugestoes
                    </Button>
                </div>
            )}
        </section>
    )
}
