"use client"

import { useEffect, useState } from "react"
import { X, Share, Plus, Download } from "lucide-react"
import Image from "next/image"

const DISMISS_KEY = "zacly_pwa_dismissed"

function isIOS() {
    return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function isInStandaloneMode() {
    return (
        ("standalone" in window.navigator && (window.navigator as any).standalone) ||
        window.matchMedia("(display-mode: standalone)").matches
    )
}

function isMobile() {
    return /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent)
}

export function PwaInstallPrompt() {
    const [show, setShow] = useState(false)
    const [isIos, setIsIos] = useState(false)
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

    useEffect(() => {
        // Não mostrar se: já dispensou antes, não é mobile, ou já está instalado
        if (
            localStorage.getItem(DISMISS_KEY) ||
            !isMobile() ||
            isInStandaloneMode()
        ) return

        setIsIos(isIOS())

        // Android/Chrome: captura o evento nativo de instalação
        const handler = (e: Event) => {
            e.preventDefault()
            setDeferredPrompt(e)
            setShow(true)
        }

        window.addEventListener("beforeinstallprompt", handler)

        // iOS: não tem o evento, então mostramos direto
        if (isIOS()) {
            // Pequeno delay para não ser agressivo na abertura
            const timer = setTimeout(() => setShow(true), 2500)
            return () => {
                clearTimeout(timer)
                window.removeEventListener("beforeinstallprompt", handler)
            }
        }

        return () => window.removeEventListener("beforeinstallprompt", handler)
    }, [])

    const handleDismiss = () => {
        localStorage.setItem(DISMISS_KEY, "1")
        setShow(false)
    }

    const handleInstall = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt()
            const result = await deferredPrompt.userChoice
            if (result.outcome === "accepted") {
                localStorage.setItem(DISMISS_KEY, "1")
            }
            setShow(false)
        }
    }

    if (!show) return null

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 sm:p-6 animate-in slide-in-from-bottom duration-300">
            <div className="max-w-md mx-auto bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-4 pt-4 pb-2">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-emerald-600 flex items-center justify-center shadow-md shrink-0">
                            <Image
                                src="/logo/zacly_icone.png"
                                alt="Zacly"
                                width={48}
                                height={48}
                                className="object-contain"
                                onError={(e) => {
                                    // Fallback se ícone não existir
                                    (e.target as HTMLImageElement).style.display = 'none'
                                }}
                            />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm text-foreground">Instalar Zacly</h3>
                            <p className="text-xs text-muted-foreground">Acesso rápido na sua tela inicial</p>
                        </div>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-4 pb-4 space-y-3">
                    {isIos ? (
                        // Instruções para iOS (não tem a API nativa)
                        <div className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                Instale o Zacly para acessar ainda mais rápido, direto da tela inicial do seu iPhone.
                            </p>
                            <div className="bg-muted/60 rounded-xl p-3 space-y-2.5">
                                <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center shrink-0">
                                        <Share className="h-3.5 w-3.5 text-white" />
                                    </div>
                                    <span className="text-sm font-medium text-foreground">
                                        1. Toque no botão <strong>Compartilhar</strong> (ícone de seta para cima)
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center shrink-0">
                                        <Plus className="h-3.5 w-3.5 text-white" />
                                    </div>
                                    <span className="text-sm font-medium text-foreground">
                                        2. Toque em <strong>Adicionar à Tela de Início</strong>
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={handleDismiss}
                                className="w-full py-3 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-400 transition-colors"
                            >
                                Entendido!
                            </button>
                        </div>
                    ) : (
                        // Android/Chrome: botão direto
                        <div className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                Instale o Zacly na sua tela inicial para acesso rápido e uma experiência ainda melhor.
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleDismiss}
                                    className="flex-1 py-3 rounded-xl border border-border text-foreground font-bold text-sm hover:bg-muted transition-colors"
                                >
                                    Agora não
                                </button>
                                <button
                                    onClick={handleInstall}
                                    className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Download className="h-4 w-4" />
                                    Instalar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
