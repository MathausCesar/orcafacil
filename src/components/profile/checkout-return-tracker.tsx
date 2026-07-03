"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { usePostHog } from "posthog-js/react"

interface CheckoutReturnTrackerProps {
    plan?: string | null
    subscriptionStatus?: string | null
}

export function CheckoutReturnTracker({ plan, subscriptionStatus }: CheckoutReturnTrackerProps) {
    const searchParams = useSearchParams()
    const posthog = usePostHog()

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
    }, [plan, posthog, searchParams, subscriptionStatus])

    return null
}
