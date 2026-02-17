'use client'

import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

interface QRCodeGeneratorProps {
    quoteId: string
    size?: number
}

export function QRCodeGenerator({ quoteId, size = 120 }: QRCodeGeneratorProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        if (canvasRef.current) {
            const url = `${window.location.origin}/quotes/${quoteId}`
            QRCode.toCanvas(canvasRef.current, url, {
                width: size,
                margin: 1,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF',
                },
            })
        }
    }, [quoteId, size])

    return (
        <div
            className="flex flex-col items-center gap-2 print:gap-1 print:break-inside-avoid"
            style={{
                pageBreakInside: 'avoid',
            }}
        >
            <canvas ref={canvasRef} className="rounded-md" />
            <p className="text-xs text-muted-foreground text-center">
                Escaneie para aprovar pelo celular
            </p>
        </div>
    )
}
