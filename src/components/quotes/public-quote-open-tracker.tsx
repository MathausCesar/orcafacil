"use client"

import { useEffect } from 'react'

interface PublicQuoteOpenTrackerProps {
    quoteId: string
    token: string
}

export function PublicQuoteOpenTracker({ quoteId, token }: PublicQuoteOpenTrackerProps) {
    useEffect(() => {
        let timeout: number | undefined
        let sent = false

        const track = () => {
            if (sent || document.visibilityState !== 'visible') return
            timeout = window.setTimeout(() => {
                if (sent || document.visibilityState !== 'visible') return
                sent = true
                void fetch(`/api/quotes/${quoteId}/opened`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token }),
                    keepalive: true,
                })
            }, 3000)
        }

        track()
        document.addEventListener('visibilitychange', track)
        return () => {
            if (timeout) window.clearTimeout(timeout)
            document.removeEventListener('visibilitychange', track)
        }
    }, [quoteId, token])

    return null
}
