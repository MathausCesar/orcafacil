"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { usePostHog } from "posthog-js/react"
import { captureConversion } from "@/lib/analytics"
import { PRICING } from "@/lib/pricing-copy"
import { Loader2 } from "lucide-react"

interface CheckoutReturnTrackerProps {
    plan?: string | null
    subscriptionStatus?: string | null
}

export function CheckoutReturnTracker({ plan, subscriptionStatus }: CheckoutReturnTrackerProps) {
    const searchParams = useSearchParams()
    const posthog = usePostHog()
    const router = useRouter()
    const [confirming, setConfirming] = useState(false)
    const [confirmationMessage, setConfirmationMessage] = useState('')

    useEffect(() => {
        if (searchParams.get("billing") !== "success") return

        const sessionId = searchParams.get("session_id") || "without_session"
        const storageKey = `zacly_checkout_success_${sessionId}`

        if (window.sessionStorage.getItem(storageKey)) return
        window.sessionStorage.setItem(storageKey, "1")

        posthog.capture("checkout_returned_success", {
            plan: plan || "unknown",
            subscription_status: subscriptionStatus || "unknown",
            source: "stripe_return",
        })

        const isActiveSubscription = ["active", "trialing"].includes(subscriptionStatus || "")
        const isPaidPlan = plan === "pro_monthly" || plan === "pro_yearly"

        if (isActiveSubscription && isPaidPlan) {
            captureConversion("subscription_started", {
                plan,
                billing_interval: plan === "pro_yearly" ? "year" : "month",
                subscription_status: subscriptionStatus,
                source: "stripe_return",
                value: plan === "pro_yearly" ? PRICING.yearly : PRICING.monthly,
                currency: "BRL",
                transaction_id: sessionId,
            })
            return
        }

        if (sessionId === 'without_session') return

        let cancelled = false
        let attempts = 0
        const maxAttempts = 8

        const confirmSession = async () => {
            try {
                const response = await fetch(`/api/checkout/session?session_id=${encodeURIComponent(sessionId)}`, {
                    cache: 'no-store',
                })
                const result = await response.json() as { subscriptionActive?: boolean; paymentStatus?: string }
                if (cancelled) return

                if (result.subscriptionActive) {
                    setConfirmationMessage('Acesso Pro ativado. Atualizando seu painel...')
                    router.refresh()
                    return
                }

                attempts += 1
                if (attempts < maxAttempts) {
                    window.setTimeout(confirmSession, 1500)
                    return
                }

                setConfirmationMessage(result.paymentStatus === 'paid'
                    ? 'Pagamento confirmado. Seu acesso sera ativado em instantes.'
                    : 'Estamos confirmando seu pagamento. Atualize esta pagina em alguns instantes.')
            } catch {
                if (!cancelled) {
                    setConfirmationMessage('Estamos confirmando seu pagamento. Atualize esta pagina em alguns instantes.')
                }
            }
        }

        const initialTimer = window.setTimeout(() => {
            setConfirming(true)
            setConfirmationMessage('Pagamento confirmado. Estamos ativando seu acesso Pro...')
            void confirmSession()
        }, 0)

        return () => {
            cancelled = true
            window.clearTimeout(initialTimer)
        }
    }, [plan, posthog, router, searchParams, subscriptionStatus])

    if (!confirming) return null

    return (
        <div className="mb-5 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950">
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-emerald-700" />
            <span>{confirmationMessage}</span>
        </div>
    )
}
