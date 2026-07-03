'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { usePostHog } from 'posthog-js/react';

const ATTRIBUTION_KEYS = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_content',
    'utm_term',
    'gclid',
    'fbclid',
    'msclkid',
] as const;

const ATTRIBUTION_STORAGE_KEY = 'zacly_attribution';

export default function PostHogPageView() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const posthog = usePostHog();

    useEffect(() => {
        // Track pageviews
        if (pathname && posthog) {
            let url = window.origin + pathname;
            if (searchParams?.toString()) {
                url = url + `?${searchParams.toString()}`;
            }
            posthog.capture('$pageview', {
                $current_url: url,
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

                if (previous !== serialized) {
                    posthog.capture('marketing_attribution_captured', {
                        ...payload,
                        has_google_click_id: Boolean(attribution.gclid),
                        has_meta_click_id: Boolean(attribution.fbclid),
                        has_microsoft_click_id: Boolean(attribution.msclkid),
                    });
                }
            }
        }
    }, [pathname, searchParams, posthog]);

    return null;
}
