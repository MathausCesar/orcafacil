'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider } from 'posthog-js/react'
import { useEffect, Suspense } from 'react'
import PostHogPageView from './posthog-pageview'
import { UserAnalyticsProvider } from './user-analytics-provider'
import { redactUrl } from '@/lib/analytics'

let posthogInitialized = false

export function PostHogProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY && !posthogInitialized) {
            posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
                api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
                defaults: '2026-05-30',
                person_profiles: 'identified_only',
                capture_pageview: false,
                capture_pageleave: true,
                cross_subdomain_cookie: true,
                session_recording: {
                    maskAllInputs: true,
                    maskCapturedNetworkRequestFn: (request) => {
                        if (request.name) {
                            request.name = redactUrl(request.name)
                        }

                        return request
                    },
                },
            })

            posthog.startExceptionAutocapture({
                capture_unhandled_errors: true,
                capture_unhandled_rejections: true,
                capture_console_errors: true,
            })

            posthogInitialized = true
        }
    }, [])

    return (
        <PHProvider client={posthog}>
            <UserAnalyticsProvider />
            <Suspense fallback={null}>
                <PostHogPageView />
            </Suspense>
            {children}
        </PHProvider>
    )
}
