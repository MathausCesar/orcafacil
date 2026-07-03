"use client"

import type { MouseEvent, ReactNode } from "react"

const APP_REGISTER_URL = "https://app.zacly.com.br/register"
const TRACKING_KEYS = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term",
    "gclid",
    "fbclid",
    "msclkid",
] as const

interface CampaignRegisterLinkProps {
    children: ReactNode
    className?: string
    campaign: string
    content?: string
    nextPath?: string
}

function buildRegisterHref({
    campaign,
    content,
    nextPath,
    queryString = "",
}: Required<Pick<CampaignRegisterLinkProps, "campaign" | "nextPath">> &
    Pick<CampaignRegisterLinkProps, "content"> & { queryString?: string }) {
    const url = new URL(APP_REGISTER_URL)
    const searchParams = new URLSearchParams(queryString)
    url.searchParams.set("next", nextPath)

    TRACKING_KEYS.forEach((key) => {
        const value = searchParams.get(key)
        if (value) {
            url.searchParams.set(key, value)
        }
    })

    if (!url.searchParams.has("utm_source")) {
        url.searchParams.set("utm_source", "google")
    }

    if (!url.searchParams.has("utm_medium")) {
        url.searchParams.set("utm_medium", "cpc")
    }

    if (!url.searchParams.has("utm_campaign")) {
        url.searchParams.set("utm_campaign", campaign)
    }

    if (content && !url.searchParams.has("utm_content")) {
        url.searchParams.set("utm_content", content)
    }

    return url.toString()
}

export function CampaignRegisterLink({
    children,
    className,
    campaign,
    content,
    nextPath = "/onboarding",
}: CampaignRegisterLinkProps) {
    const href = buildRegisterHref({ campaign, content, nextPath })

    const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
        event.currentTarget.href = buildRegisterHref({
            campaign,
            content,
            nextPath,
            queryString: window.location.search,
        })
    }

    return (
        <a href={href} className={className} onClick={handleClick}>
            {children}
        </a>
    )
}
