'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { usePostHog } from 'posthog-js/react';
import {
    ATTRIBUTION_KEYS,
    ATTRIBUTION_STORAGE_KEY,
    captureEvent,
    isPaidAttribution,
    redactUrl,
} from '@/lib/analytics';

export default function PostHogPageView() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const posthog = usePostHog();

    useEffect(() => {
        // Track pageviews
        if (pathname && posthog) {
            let url = window.location.origin + pathname;
            if (searchParams?.toString()) {
                url = url + `?${searchParams.toString()}`;
            }
            posthog.capture('$pageview', {
                $current_url: redactUrl(url),
            });

            const attribution = ATTRIBUTION_KEYS.reduce<Record<string, string>>((acc, key) => {
                const value = searchParams?.get(key);
                if (value) acc[key] = value;
                return acc;
            }, {});

            if (Object.keys(attribution).length > 0) {
                const payload = {
                    ...attribution,
                    landing_path: pathname,
                };

                const previous = window.localStorage.getItem(ATTRIBUTION_STORAGE_KEY);
                const serialized = JSON.stringify(payload);

                window.localStorage.setItem(ATTRIBUTION_STORAGE_KEY, serialized);
                posthog.register(payload);
                posthog.register_once({
                    first_landing_path: pathname,
                    first_utm_source: attribution.utm_source,
                    first_utm_medium: attribution.utm_medium,
                    first_utm_campaign: attribution.utm_campaign,
                    first_utm_content: attribution.utm_content,
                    first_utm_term: attribution.utm_term,
                    first_gclid: attribution.gclid,
                });

                if (previous !== serialized) {
                    captureEvent('marketing_attribution_captured', {
                        ...payload,
                        has_google_click_id: Boolean(attribution.gclid),
                        has_meta_click_id: Boolean(attribution.fbclid),
                        has_microsoft_click_id: Boolean(attribution.msclkid),
                    });
                }

                if (isPaidAttribution(attribution) && !window.sessionStorage.getItem('zacly_paid_session_recording_requested')) {
                    window.sessionStorage.setItem('zacly_paid_session_recording_requested', '1');
                    try {
                        posthog.startSessionRecording({ linked_flag: true, sampling: true });
                    } catch {
                        // Recording availability is controlled by PostHog project settings.
                    }
                    captureEvent('session_recording_requested', {
                        reason: 'paid_attribution',
                        utm_campaign: attribution.utm_campaign,
                        has_google_click_id: Boolean(attribution.gclid),
                    });
                }
            }
        }
    }, [pathname, searchParams, posthog]);

    return null;
}
