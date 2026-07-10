"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { usePostHog } from "posthog-js/react"
import { captureConversion } from "@/lib/analytics"
import { PRICING } from "@/lib/pricing-copy"

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
        }
    }, [plan, posthog, searchParams, subscriptionStatus])

    return null
}
